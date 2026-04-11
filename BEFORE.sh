#!/bin/bash
set -e  # Exit on error

#      _ __   _______ ___  _  _         _             _     
#     / \\ \ / /_   _/ _ \| || | _     / \   _ __ ___| |__  
#    / _ \\ V /  | || | | | || |(_)   / _ \ | '__/ __| '_ \ 
#   / ___ \| |   | || |_| |__   _|   / ___ \| | | (__| | | |
#  /_/   \_\_|   |_| \___/   |_|(_) /_/_  \_\_|  \___|_| |_|
#  | |__   __ _ ___  ___  __| | | |   (_)_ __  _   ___  __  
#  | '_ \ / _` / __|/ _ \/ _` | | |   | | '_ \| | | \ \/ /  
#  | |_) | (_| \__ \  __/ (_| | | |___| | | | | |_| |>  <   
#  |_.__/ \__,_|___/\___|\__,_| |_____|_|_| |_|\__,_/_/\_\  
#   ____  _     _        _ _           _   _                
#  |  _ \(_)___| |_ _ __(_) |__  _   _| |_(_) ___  _ __     
#  | | | | / __| __| '__| | '_ \| | | | __| |/ _ \| '_ \    
#  | |_| | \__ \ |_| |  | | |_) | |_| | |_| | (_) | | | |   
#  |____/|_|___/\__|_|  |_|_.__/ \__,_|\__|_|\___/|_| |_|   
                                                          
# https://budavariam.github.io/asciiart-text/

# Check internet
ping -c 3 www.ayt04.xyz || { echo "No internet!"; exit 1; }

# Verify UEFI
if ! efivar -l >/dev/null 2>&1; then
  echo "Not booted in UEFI mode!"
  exit 1
fi

# List disks
lsblk

# ⚠️ WARNING: This script assumes /dev/mmcblk0 is the target disk.
# ⚠️ Double-check with lsblk before running!

# Create partitions (using sgdisk for scripting)
sgdisk -Z /dev/mmcblk0  # Wipe partition table
sgdisk -n 1:0:+512M -t 1:EF00 /dev/mmcblk0  # EFI System Partition
sgdisk -n 2:0:+57G -t 2:8300 /dev/mmcblk0   # Root partition
sgdisk -n 3:0:0 -t 3:8200 /dev/mmcblk0      # Swap partition

# Format partitions
mkfs.fat -F 32 /dev/mmcblk0p1
mkfs.ext4 /dev/mmcblk0p2
mkswap /dev/mmcblk0p3

# Mount filesystems
mount /dev/mmcblk0p2 /mnt
mkdir -p /mnt/boot
mount /dev/mmcblk0p1 /mnt/boot

# Backup mirrorlist
cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.backup

# Rank mirrors and install base system
rankmirrors -n 6 /etc/pacman.d/mirrorlist.backup > /etc/pacman.d/mirrorlist
pacstrap -K /mnt base linux linux-firmware base-devel nano

# Generate fstab
genfstab -U /mnt >> /mnt/etc/fstab

# Verify fstab
cat /mnt/etc/fstab

# Enter chroot
arch-chroot /mnt << 'EOF'
# Install useful packages
pacman -Sy --noconfirm nano bash-completion

# Set locale
sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
export LANG=en_US.UTF-8

# Set timezone (example: Canada/Eastern)
ln -sf /usr/share/zoneinfo/Canada/Eastern /etc/localtime
hwclock --systohc --utc

# Set hostname
echo "Overlord" > /etc/hostname

# Enable fstrim
systemctl enable fstrim.timer

# Configure multilib (correct syntax)
sed -i '/\[multilib\]/,/Include/s/^#//' /etc/pacman.conf
pacman -Sy --noconfirm

# Create user (fixed syntax)
useradd -m -G wheel,storage,power -s /bin/bash Overlord
passwd Overlord  # You'll be prompted to set a password

# Configure sudo
echo "%wheel ALL=(ALL:ALL) ALL" >> /etc/sudoers.d/wheel

# Install and configure bootloader
bootctl install
cat > /boot/loader/entries/arch.conf << ENTRY
title   Arch Linux
linux   /vmlinuz-linux
initrd  /initramfs-linux.img
options root=PARTUUID=$(blkid -s PARTUUID -o value /dev/mmcblk0p2) rw
ENTRY

# Network setup (choose ONE: dhcpcd OR NetworkManager)
# Uncomment one of the following:
# pacman -Sy --noconfirm dhcpcd
# systemctl enable dhcpcd@<interface>.service

pacman -Sy --noconfirm networkmanager
systemctl enable NetworkManager

exit
EOF

# Unmount
umount -R /mnt

echo "Installation complete! Rebooting..."
reboot