### 📝 The Minimal "Boot to TTY" Command List
Here is your list stripped down to the **absolute bare minimum** to get a working, internet-capable TTY system.

```bash
loadkeys us
timedatectl set-ntp true
cfdisk /dev/vda
mkfs.fat -F32 /dev/vda1
mkfs.ext4 /dev/vda2
mount /dev/vda2 /mnt
mkdir /mnt/boot
mount /dev/vda1 /mnt/boot
pacstrap -K /mnt base linux linux-firmware intel-ucode nano
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt
ln -sf /usr/share/zoneinfo/Canada/Eastern /etc/localtime
hwclock --systohc
nano /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "Overlord" > /etc/hostname
nano /etc/hosts
passwd
mount -t efivarfs efivarfs /sys/firmware/efi/efivars
bootctl install
nano /boot/loader/loader.conf
nano /boot/loader/entries/arch.conf
exit
umount -R /mnt
reboot
```

**Required File Contents (Create these with `nano` inside chroot):**

`/boot/loader/loader.conf`:
```text
default arch.conf
timeout 3
```

`/boot/loader/entries/arch.conf`:
```text
title   Arch Linux
linux   /vmlinuz-linux
initrd  /intel-ucode.img
initrd  /initramfs-linux.img
options root=PARTUUID=YOUR_ACTUAL_PARTUUID rw
```
*(Find `YOUR_ACTUAL_PARTUUID` by running `blkid /dev/vda2` inside the chroot before exiting).*

**Post-Boot (Once logged in as root):**
Now that you are in TTY, you can install the rest:
```bash
pacman -Sy networkmanager base-devel sudo
systemctl enable NetworkManager
useradd -m -G wheel -s /bin/bash overlord
passwd overlord
EDITOR=nano visudo
```



