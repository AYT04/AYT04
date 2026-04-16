#!/bin/bash

#iwctl (station)
#scan
#connect

iwctl && station wlan0 scan && connect

#uefi check
efivar -l

gdisk /dev/mmcblk0
#x - expert
#z - zap!

# Format partitions
mkfs.fat -F 32 /dev/mmcblk0p1
mkfs.ext4 /dev/mmcblk0p2
mkswap /dev/mmcblk0p3

# Mount filesystems
mount /dev/mmcblk0p2 /mnt
mkdir -p /mnt/boot
mount /dev/mmcblk0p1 /mnt/boot

#cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.backup

# Rank mirrors and install base system
#rankmirrors -n 6 /etc/pacman.d/mirrorlist.backup > /etc/pacman.d/mirrorlist
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
