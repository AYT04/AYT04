#!/bin/bash
# Arch Linux Installation Script
# Based on SomeOrdinaryGamers video tutorial
# WARNING: This will erase all data on the specified drive!

set -e

# ==================== CONFIGURATION ====================
# CHANGE THESE VALUES FOR YOUR SYSTEM
DRIVE="/dev/sdb"           # Your target drive (check with lsblk)
ROOT_SIZE="40G"            # Root partition size
SWAP_SIZE="16G"            # Swap partition size
BOOT_SIZE="1G"             # Boot partition size
HOSTNAME="Overlord"        # System hostname
USERNAME="yourusername"    # Your username
TIMEZONE="America/Toronto" # Your timezone
LOCALE="en_US.UTF-8"       # Your locale
# =======================================================

echo "=== Arch Linux Installation Script ==="
echo "WARNING: This will erase all data on $DRIVE!"
read -p "Press Enter to continue or Ctrl+C to cancel..."

# ==================== PREPARATION ====================
echo "[1/20] Checking internet connection..."
ping -c 3 www.google.com || { echo "No internet!"; exit 1; }

echo "[2/20] Checking UEFI mode..."
if [ ! -d "/sys/firmware/efi/efivars" ]; then
    echo "ERROR: Not booted in UEFI mode!"
    exit 1
fi

echo "[3/20] Clearing screen..."
clear

# ==================== PARTITIONING ====================
echo "[4/20] Identifying drive with lsblk..."
lsblk

echo "[5/20] Wiping drive with gdisk..."
echo -e "x\nz\ny\n" | gdisk $DRIVE

echo "[6/20] Creating partitions with cgdisk..."
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

# ==================== FORMATTING ====================
echo "[7/20] Formatting partitions..."
mkfs.fat -F32 ${DRIVE}1
mkswap ${DRIVE}2
swapon ${DRIVE}2
mkfs.ext4 ${DRIVE}3
mkfs.ext4 ${DRIVE}4

# ==================== MOUNTING ====================
echo "[8/20] Mounting partitions..."
mount ${DRIVE}3 /mnt
mkdir -p /mnt/boot /mnt/home
mount ${DRIVE}1 /mnt/boot
mount ${DRIVE}4 /mnt/home

# ==================== MIRROR LIST ====================
echo "[9/20] Updating mirror list..."
cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.backup
pacman -Sy --noconfirm pacman-contrib
rankmirrors -n 6 /etc/pacman.d/mirrorlist.backup > /etc/pacman.d/mirrorlist

# ==================== INSTALL BASE SYSTEM ====================
echo "[10/20] Installing base system..."
pacstrap /mnt base linux linux-firmware base-devel nano bash-completion

# ==================== GENERATE FSTAB ====================
echo "[11/20] Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab

# ==================== CHROOT ====================
echo "[12/20] Entering chroot environment..."
arch-chroot /mnt <<'CHROOT_SCRIPT'

# Configure locale
echo "[12.1] Configuring locale..."
sed -i 's/^#\s*en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf

# Configure timezone
echo "[12.2] Configuring timezone..."
ln -sf /usr/share/zoneinfo/America/Toronto /etc/localtime
hwclock --systohc --utc

# Set hostname
echo "[12.3] Setting hostname..."
echo "Overlord" > /etc/hostname

# Enable Trim for SSD
echo "[12.4] Enabling TRIM..."
systemctl enable fstrim.timer

# Enable 32-bit support
echo "[12.5] Enabling multilib..."
sed -i '/^#\[multilib\]/,/Include/{s/^#//}' /etc/pacman.conf
pacman -Sy --noconfirm

# Set root password
echo "[12.6] Setting root password..."
passwd

# Create user
echo "[12.7] Creating user..."
useradd -m -G users,wheel,storage,power -s /bin/bash yourusername
passwd yourusername

# Configure sudo
echo "[12.8] Configuring sudo..."
EDITOR=nano visudo
sed -i 's/^#\s*%wheel ALL=(ALL:ALL) ALL/%wheel ALL=(ALL:ALL) ALL/' /etc/sudoers
echo "Defaults rootpw" >> /etc/sudoers

# Install bootloader
echo "[12.9] Installing bootloader..."
bootctl install

# Create boot entry
cat > /boot/loader/entries/arch.conf <<EOF
title Arch Linux
linux /vmlinuz-linux
initrd /initramfs-linux.img
options root=PARTUUID=$(blkid -s PARTUUID -o value /dev/sdb3) rw
EOF

# Install network manager
echo "[12.10] Installing network manager..."
pacman -S --noconfirm dhcpcd networkmanager
systemctl enable dhcpcd@enp56s0.service
systemctl enable NetworkManager.service

# NVIDIA drivers (if applicable)
echo "[12.11] Installing NVIDIA drivers (if needed)..."
pacman -S --noconfirm nvidia-dkms nvidia-utils nvidia-settings lib32-nvidia-utils lib32-opencl lib32-libglvnd linux-headers

# Configure NVIDIA
cat >> /etc/mkinitcpio.conf <<EOF
MODULES=(nvidia nvidia_modeset nvidia_uvm nvidia_drm)
EOF

# Add NVIDIA DRM to boot options
echo "options root=PARTUUID=$(blkid -s PARTUUID -o value /dev/sdb3) rw nvidia-drm.modeset=1" >> /boot/loader/entries/arch.conf

# Create pacman hook for NVIDIA
mkdir -p /etc/pacman.d/hooks
cat > /etc/pacman.d/hooks/nvidia.hook <<EOF
[Trigger]
Operation = Install
Operation = Upgrade
Operation = Remove
Type = Package
Target = nvidia*

[Action]
When = PostTransaction
NeedsTargets = true
Exec = /bin/sh -c 'while read -r tr op; do if [ "\${op}" = "=" ]; then makeinitcpio -P; fi; done'
EOF

# Generate initramfs
echo "[12.12] Generating initramfs..."
mkinitcpio -P

# Install Xorg and desktop
echo "[12.13] Installing Xorg and Plasma..."
pacman -S --noconfirm xorg-server xorg-apps xorg-xinit xorg-twm xorg-xclock xterm
pacman -S --noconfirm plasma sddm
systemctl enable sddm.service

echo "=== Installation Complete ==="
echo "Reboot your system now!"
exit
CHROOT_SCRIPT

# ==================== FINALIZE ====================
echo "[13/20] Unmounting and exiting..."
umount -R /mnt
reboot