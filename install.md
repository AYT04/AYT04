# Arch Linux Minimal Manual Install

![AYT!_OS Screenshot](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Archlinux-logo-standard-version.svg/1920px-Archlinux-logo-standard-version.svg.png)

## Contribute
Feel free to help improve this once this becomes outdated. It should be good for the forsure future.

# Internet
```
iwctl
    station get-networks
    station connect
ping ayt04.xyz
```

# UEFI Mode
```
efivar -l
```

# Format (GPT)
```
gdisk /dev/DRIVE
    x
    z
```

# Partitioning (GPT)
```
cgdisk /dev/DRIVE
    p1 = boot(1GiB)
    p2 = swap(2GiB)
    p3 = root(40GiB)
    p4 = home(~)
```

# Format partitions
```
mkfs.fat -F 32 /dev/p1
mkswap /dev/p2 && swapon /dev/p2
mkfs.ext4 /dev/p3
mkfs.ext4 /dev/p4
```

# Mount filesystems
```
mount /dev/p3 /mnt
mkdir -p /mnt/boot /mnt/home
mount /dev/p1 /mnt/boot
mount /dev/p4 /mnt/home
```

# Backup mirrorlist
```
cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.backup
pacman -Sy pacman-contrib
rankmirrors -n 3 /etc/pacman.d/mirrorlist.backup > /etc/pacman.d/mirrorlist
```

# Base System
```
pacstrap -K /mnt base linux linux-firmware base-devel intel-ucode networkmanager
```

# Generate fstab
```
genfstab -U -p /mnt >> /mnt/etc/fstab
```

# Verify fstab
```
cat /mnt/etc/fstab
```

# Enter chroot
```
arch-chroot /mnt
```

# Ease of Use
```
pacman -Sy nano bash-completion
```

# Locale Gen (nano /etc/locale.gen)
```
#en_US.UTF-8
```

# Enable it
```
locale-gen
```

# Language
```
echo LANG=en_US.UTF-8 > /etc/locale.conf
export LANG=en_US.UTF-8
```

# Set timezone
```
ln -s /usr/share/zoneinfo/Canada/Eastern /etc/localtime
hwclock --systohc --utc
```

# Set hostname
```
echo overlord > /etc/hostname
```

# SSD
```
systemctl enable fstrim.timer
```

# Configure multilib (/etc/pacman.conf)
```
[multilib]
Include = /etc/pacman.d/mirrorlist
```
# Updating Mulitlib DB
```
pacman -Sy
```

# Password
```
passwd
```

# Create user
```
useradd -m -g users -G wheel,storage,power -s /bin/bash overlord
passwd overlord
```

# Configure sudo (EDITOR=nano visudo)
```
#%wheel ALL=(ALL:ALL) ALL

Defaults rootpw
```

# EFIVars Listed
```
mount -t efivarfs efivarfs /sys/firmware/efi/efivars
ls /sys/firmware/efi/efivars
```

# Install Bootloader
```
bootctl install
```

# Install and configure bootloader (/boot/loader/entries/arch.conf)
```
title   AYTOS
linux   /vmlinuz-linux
initrd  /intel-ucode.img
initrd  /initramfs-linux.img
options root=PARTUUID=[UUID] rw
```

# Static UUID for root partition (p3)
```
echo options root=PARTUUID=$(blkid -s PARTUUID -o value /dev/p3) rw >> /boot/loader/entries/arch.conf
```

# Installing NetworkManager
```
pacman -S networkmanager
systemctl enable NetworkManager.service
```

# Exit `Arch-Chroot`
```
exit
```

# Unmount out of root
```
umount -R /mnt
```

# Reboot!
```
reboot
```
