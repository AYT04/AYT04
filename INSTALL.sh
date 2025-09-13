#!/bin/bash
set -euo pipefail

# ============= CONFIGURATION =============
DEVICE="/dev/sda"
HOSTNAME="archlinux"
USERNAME="ayt04"
PASSWORD=""  # Change this or use `passwd` interactively
LOCALE="en_US.UTF-8"
TIMEZONE="America/Toronto"
# =========================================

echo "⚠️  This will erase $DEVICE. Press Ctrl+C to cancel or Enter to continue."
read

# Check for UEFI
if [ ! -d /sys/firmware/efi/efivars ]; then
    echo "❌ UEFI not detected. This script requires UEFI."
    exit 1
fi

# Sync clock
timedatectl set-ntp true

# Partition disk
echo "🔧 Partitioning $DEVICE..."
parted $DEVICE -- mklabel gpt
parted $DEVICE -- mkpart ESP fat32 1MiB 512MiB
parted $DEVICE -- set 1 boot on
parted $DEVICE -- mkpart primary ext4 512MiB 100%

# Format
echo "💾 Formatting partitions..."
mkfs.fat -F32 ${DEVICE}1
mkfs.ext4 ${DEVICE}2

# Mount
echo "🔗 Mounting..."
mount ${DEVICE}2 /mnt
mkdir -p /mnt/boot
mount ${DEVICE}1 /mnt/boot

# Install base system
echo "📦 Installing base system..."
pacstrap /mnt base base-devel linux linux-firmware \
               networkmanager grub efibootmgr \
               sudo vim dhcpcd

# Generate fstab
echo "📄 Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab

# Chroot configuration
echo "⚙️  Configuring system..."

# Locale
arch-chroot /mnt /bin/bash -c "echo '$LOCALE UTF-8' > /etc/locale.gen"
arch-chroot /mnt locale-gen
arch-chroot /mnt /bin/bash -c "echo 'LANG=$LOCALE' > /etc/locale.conf"

# Timezone and clock
arch-chroot /mnt ln -sf /usr/share/zoneinfo/$TIMEZONE /etc/localtime
arch-chroot /mnt hwclock --systohc

# Hostname
echo "$HOSTNAME" > /mnt/etc/hostname
cat >> /mnt/etc/hosts <<EOF
127.0.0.1	localhost
::1		localhost
127.0.1.1	$HOSTNAME.localdomain	$HOSTNAME
EOF

# Root password (set later in chroot)
echo "🔐 Setting root password..."
arch-chroot /mnt /bin/bash -c "echo 'root:$PASSWORD' | chpasswd"

# Create user
echo "👤 Creating user: $USERNAME"
arch-chroot /mnt useradd -m -G wheel -s /bin/bash $USERNAME
arch-chroot /mnt /bin/bash -c "echo '$USERNAME:$PASSWORD' | chpasswd"

# Enable passwordless sudo for wheel group
arch-chroot /mnt sed -i 's/# %wheel ALL=(ALL) ALL/%wheel ALL=(ALL) ALL/' /etc/sudoers

# Install and configure GRUB (UEFI)
echo "🎯 Installing GRUB bootloader..."
arch-chroot /mnt grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
arch-chroot /mnt grub-mkconfig -o /boot/grub/grub.cfg

# Enable NetworkManager
echo "🌐 Enabling NetworkManager..."
arch-chroot /mnt systemctl enable NetworkManager

# Optional: enable dhcpcd (fallback)
arch-chroot /mnt systemctl enable dhcpcd

# Done
echo "✅ Install complete! Reboot with 'reboot'."
