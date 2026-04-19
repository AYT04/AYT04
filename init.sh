#!/bin/bash
# Minimal Arch Linux Installation Script
# Based on SomeOrdinaryGamers video tutorial
# WARNING: This will erase all data on the specified drive!

set -e

# ==================== CONFIGURATION ====================
DRIVE="/dev/mmcblk0"       # Your eMMC/SD drive
ROOT_SIZE="40G"            # Root partition size
SWAP_SIZE="2G"             # Swap partition size
BOOT_SIZE="1G"             # Boot partition size
HOSTNAME="archlinux"       # System hostname
USERNAME="user"            # Your username
TIMEZONE="America/Toronto" # Your timezone
LOCALE="en_US.UTF-8"       # Your locale
# =======================================================

echo "=== Minimal Arch Linux Installation ==="
echo "WARNING: This will erase all data on $DRIVE!"
read -p "Press Enter to continue or Ctrl+C to cancel..."

# ==================== PREPARATION ====================
echo "[1/12] Checking internet connection..."
ping -c 3 www.ayt04.xyz || { echo "No internet!"; exit 1; }

echo "[2/12] Checking UEFI mode..."
[ ! -d "/sys/firmware/efi/efivars" ] && { echo "ERROR: Not UEFI!"; exit 1; }

# ==================== PARTITIONING ====================
echo "[3/12] Wiping drive..."
echo -e "x\nz\ny\n" | gdisk $DRIVE

echo "[4/12] Creating partitions..."
cgdisk $DRIVE <<EOF
new
default
${BOOT_SIZE}
EF00
boot

new
default
${SWAP_SIZE}
8200
swap

new
default
${ROOT_SIZE}
8300
root

new
default
default
8300
home

write
yes
quit
EOF

# ==================== FORMATTING & MOUNTING ====================
echo "[5/12] Formatting partitions..."
mkfs.fat -F32 ${DRIVE}p1
mkswap ${DRIVE}p2 && swapon ${DRIVE}p2
mkfs.ext4 ${DRIVE}p3
mkfs.ext4 ${DRIVE}p4

echo "[6/12] Mounting partitions..."
mount ${DRIVE}p3 /mnt
mkdir -p /mnt/boot /mnt/home
mount ${DRIVE}p1 /mnt/boot
mount ${DRIVE}p4 /mnt/home

# ==================== INSTALL BASE ====================
echo "[7/12] Installing base system..."
pacstrap /mnt base linux linux-firmware base-devel nano

echo "[8/12] Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab

# ==================== CHROOT CONFIGURATION ====================
echo "[9/12] Configuring system..."
arch-chroot /mnt <<'CHROOT'

# Locale
sed -i 's/^#\s*en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf

# Timezone
ln -sf /usr/share/zoneinfo/America/Toronto /etc/localtime
hwclock --systohc --utc

# Hostname
echo "archlinux" > /etc/hostname

# Users
passwd
useradd -m -G wheel -s /bin/bash user
passwd user
sed -i 's/^#\s*%wheel/%wheel/' /etc/sudoers

# Bootloader
bootctl install
cat > /boot/loader/entries/arch.conf <<EOF
title AYT04 Linux
linux /vmlinuz-linux
initrd /initramfs-linux.img
options root=PARTUUID=$(blkid -s PARTUUID -o value /dev/mmcblk0p3) rw
EOF

# Network
pacman -S --noconfirm networkmanager
systemctl enable NetworkManager.service

# Desktop (minimal Plasma)
pacman -S --noconfirm plasma sddm xorg-server xorg-xinit
systemctl enable sddm.service

echo "Installation complete!"
CHROOT

# ==================== FINISH ====================
echo "[10/12] Unmounting..."
umount -R /mnt
echo "[11/12] Rebooting..."
reboot
