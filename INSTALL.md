## Prerequisites and Network Setup

Boot from the Arch Linux installation media (USB). Ensure you are booted in **UEFI mode** (recommended) by checking if `/sys/firmware/efi` exists.

1.  **Connect to the Internet**:
    *   **Wired**: Usually automatic. Verify with `ping archlinux.org`.
    *   **Wi-Fi**: Use `iwctl`. Run `iwctl`, then `station wlan0 scan`, `station wlan0 get-networks`, and `station wlan0 connect <SSID>`.
2.  **Update System Clock**: Run `timedatectl set-ntp true`.

## Disk Partitioning and Formatting

Identify your drive using `lsblk` (e.g., `/dev/sda` or `/dev/nvme0n1`). We will create a minimal **UEFI** layout with an EFI partition and a Root partition.

1.  **Partition**: Use `cfdisk /dev/sdX` (replace `sdX` with your drive).
    *   Create a **512M** partition, set type to **EFI System**.
    *   Create a partition using the **remaining space** for **Linux Root** (default type).
    *   Write changes (`Write`) and quit.
2.  **Format**:
    *   EFI: `mkfs.fat -F32 /dev/sdX1`
    *   Root: `mkfs.ext4 /dev/sdX2`
3.  **Mount**:
    ```bash
    mount /dev/sdX2 /mnt
    mkdir /mnt/boot
    mount /dev/sdX1 /mnt/boot
    ```

## Base System Installation

Install the minimal package set. This includes the base system, the Linux kernel, firmware, and a text editor (`nano`) and network manager for post-install configuration.

```bash
pacstrap -K /mnt base linux linux-firmware nano networkmanager
```

Generate the file system table:
```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

## System Configuration

Chroot into the new system: `arch-chroot /mnt`.

1.  **Time Zone**:
    ```bash
    ln -sf /usr/share/zoneinfo/Region/City /etc/localtime
    hwclock --systohc
    ```
    *(Replace `Region/City` with your location, e.g., `America/New_York`)*.

2.  **Localization**:
    Edit `/etc/locale.gen`, uncomment your language (e.g., `en_US.UTF-8`), then run:
    ```bash
    locale-gen
    echo "LANG=en_US.UTF-8" > /etc/locale.conf
    ```

3.  **Network & Hostname**:
    ```bash
    echo "myhostname" > /etc/hostname
    systemctl enable NetworkManager
    ```
    *(Add `127.0.0.1 localhost` and `127.0.1.1 myhostname` to `/etc/hosts` if needed).*

4.  **Root Password**: Run `passwd` and set a secure password.

## Bootloader Installation

For UEFI systems, install GRUB:

1.  Install packages: `pacman -S grub efibootmgr`
2.  Install bootloader: `grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ArchLinux`
3.  Generate config: `grub-mkconfig -o /boot/grub/grub.cfg`

## Finalize

Exit the chroot (`exit`), unmount partitions (`umount -R /mnt`), and reboot (`reboot`). Remove the USB drive.

Upon reboot, you will have a command-line only Arch Linux system. Log in as `root`. To create a standard user:
```bash
useradd -m -G wheel username
passwd username
```
*(Ensure `sudo` is installed via `pacman -S sudo` if you need user privileges, editing `/etc/sudoers` with `visudo` to enable the wheel group).*
