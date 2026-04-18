#!/bin/bash
# Arch Linux Installation Script (non-interactive)
# WARNING: This will erase all data on the specified drive!

set -euo pipefail

# ==================== CONFIGURATION ====================
DRIVE="/dev/sdb"           # Your target drive (check with lsblk)
ROOT_SIZE="40G"            # Root partition size
SWAP_SIZE="16G"            # Swap partition size
BOOT_SIZE="1G"             # Boot partition size
HOSTNAME="Overlord"        # System hostname
USERNAME="yourusername"    # Your username
TIMEZONE="America/Toronto" # Your timezone
LOCALE="en_US.UTF-8"       # Your locale

# NON-INTERACTIVE CREDENTIALS (change these before running)
ROOT_PASS="rootpass"
USER_PASS="userpass"
# =======================================================

echo "=== Arch Linux Installation Script (non-interactive) ==="
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
# gdisk expects the expert (x) then zap (z) and confirm with 'y'
printf 'x\nz\ny\n' | gdisk "$DRIVE"

echo "[6/20] Creating partitions with sfdisk (non-interactive)..."
# Use sfdisk here for predictable non-interactive partitioning
# Layout: 1 = EFI (BOOT_SIZE), 2 = swap (SWAP_SIZE), 3 = root (ROOT_SIZE), 4 = rest (home)
boot_sectors="$BOOT_SIZE"
swap_sectors="$SWAP_SIZE"
root_sectors="$ROOT_SIZE"

sfdisk "$DRIVE" <<EOF
label: gpt
,${BOOT_SIZE},EF00
,${SWAP_SIZE},8200
,${ROOT_SIZE},8300
,,8300
EOF

# Wait for kernel to recognize partitions
sleep 2

# ==================== FORMATTING ====================
echo "[7/20] Formatting partitions..."
mkfs.fat -F32 "${DRIVE}1"
mkswap "${DRIVE}2"
swapon "${DRIVE}2"
mkfs.ext4 "${DRIVE}3"
mkfs.ext4 "${DRIVE}4"

# ==================== MOUNTING ====================
echo "[8/20] Mounting partitions..."
mount "${DRIVE}3" /mnt
mkdir -p /mnt/boot /mnt/home
mount "${DRIVE}1" /mnt/boot
mount "${DRIVE}4" /mnt/home

# ==================== MIRROR LIST ====================
echo "[9/20] Updating mirror list..."
cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.backup
pacman -Sy --noconfirm pacman-contrib
rankmirrors -n 6 /etc/pacman.d/mirrorlist.backup > /etc/pacman.d/mirrorlist

# ==================== INSTALL BASE SYSTEM ====================
echo "[10/20] Installing base system..."
pacstrap /mnt base linux linux-firmware base-devel nano bash-completion --noconfirm

# ==================== GENERATE FSTAB ====================
echo "[11/20] Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab

# ==================== CHROOT ====================
echo "[12/20] Entering chroot environment..."
arch-chroot /mnt /bin/bash -e <<'CHROOT_SCRIPT'
set -euo pipefail

# Variables (in chroot)
HOSTNAME="Overlord"
USERNAME="yourusername"
TIMEZONE="America/Toronto"
LOCALE="en_US.UTF-8"
ROOT_PASS="rootpass"
USER_PASS="userpass"
DRIVE="/dev/sdb"

# Configure locale
echo "[12.1] Configuring locale..."
sed -i 's/^#\s*\(en_US.UTF-8\)/\1/' /etc/locale.gen
locale-gen
echo "LANG=${LOCALE}" > /etc/locale.conf

# Configure timezone
echo "[12.2] Configuring timezone..."
ln -sf /usr/share/zoneinfo/${TIMEZONE} /etc/localtime
hwclock --systohc --utc

# Set hostname
echo "[12.3] Setting hostname..."
echo "${HOSTNAME}" > /etc/hostname

# Enable Trim for SSD
echo "[12.4] Enabling TRIM..."
systemctl enable fstrim.timer

# Enable multilib
echo "[12.5] Enabling multilib..."
sed -i '/^#\[multilib\]/,/^Include/s/^#//' /etc/pacman.conf
pacman -Sy --noconfirm

# Set root password non-interactively
echo "[12.6] Setting root password..."
echo "root:${ROOT_PASS}" | chpasswd

# Create user and set password non-interactively
echo "[12.7] Creating user..."
useradd -m -G users,wheel,storage,power -s /bin/bash "${USERNAME}"
echo "${USERNAME}:${USER_PASS}" | chpasswd

# Configure sudo: enable wheel and require no password for wheel (change if undesired)
echo "[12.8] Configuring sudo..."
pacman -S --noconfirm sudo
# enable %wheel ALL=(ALL:ALL) ALL
sed -i 's/^#\s*\(%wheel ALL=(ALL:ALL) ALL\)/\1/' /etc/sudoers
# Optionally allow wheel without password (commented out)
# sed -i 's/^%wheel ALL=(ALL:ALL) ALL/%wheel ALL=(ALL:ALL) NOPASSWD: ALL/' /etc/sudoers

# Install bootloader (systemd-boot)
echo "[12.9] Installing bootloader..."
bootctl install --no-verify

# Create boot entry
cat > /boot/loader/entries/arch.conf <<EOF
title Arch Linux
linux /vmlinuz-linux
initrd /initramfs-linux.img
options root=PARTUUID=$(blkid -s PARTUUID -o value ${DRIVE}3) rw
EOF

# Install network manager and enable services (use non-interactive flags)
echo "[12.10] Installing network manager..."
pacman -S --noconfirm dhcpcd networkmanager
systemctl enable dhcpcd@enp56s0.service || true
systemctl enable NetworkManager.service

# NVIDIA drivers (if applicable)
echo "[12.11] Installing NVIDIA drivers (if needed)..."
pacman -S --noconfirm nvidia-dkms nvidia-utils nvidia-settings lib32-nvidia-utils lib32-opencl lib32-libglvnd linux-headers || true

# Configure NVIDIA (append MODULES if not present)
if ! grep -q "nvidia" /etc/mkinitcpio.conf; then
  echo "[12.11b] Adding NVIDIA modules to mkinitcpio.conf..."
  sed -i '/^MODULES=/ s/)/ nvidia nvidia_modeset nvidia_uvm nvidia_drm)/' /etc/mkinitcpio.conf || \
  echo 'MODULES=(nvidia nvidia_modeset nvidia_uvm nvidia_drm)' >> /etc/mkinitcpio.conf
fi

# Add NVIDIA DRM to boot options (ensure not duplicated)
BOOT_ENTRY="/boot/loader/entries/arch.conf"
grep -q "nvidia-drm.modeset=1" "${BOOT_ENTRY}" || \
  sed -i "s/options/root=PARTUUID=$(blkid -s PARTUUID -o value ${DRIVE}3) rw nvidia-drm.modeset=1/" "${BOOT_ENTRY}"

# Create pacman hook for NVIDIA
mkdir -p /etc/pacman.d/hooks
cat > /etc/pacman.d/hooks/nvidia.hook <<'HOOK'
[Trigger]
Operation = Install
Operation = Upgrade
Operation = Remove
Type = Package
Target = nvidia*

[Action]
When = PostTransaction
NeedsTargets = true
Exec = /bin/sh -c 'while read -r tr op; do if [ "${op}" = "=" ]; then makeinitcpio -P; fi; done'
HOOK

# Generate initramfs
echo "[12.12] Generating initramfs..."
mkinitcpio -P

# Install Xorg and desktop environment
echo "[12.13] Installing Xorg and Plasma..."
pacman -S --noconfirm xorg-server xorg-apps xorg-xinit xorg-twm xorg-xclock xterm plasma sddm
systemctl enable sddm.service

echo "=== Installation Complete ==="
echo "Reboot your system now!"
exit 0
CHROOT_SCRIPT

# ==================== FINALIZE ====================
echo "[13/20] Unmounting and exiting..."
umount -R /mnt
reboot
