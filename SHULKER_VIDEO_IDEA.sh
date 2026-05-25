#███████╗██╗  ██╗██╗   ██╗██╗     ██╗  ██╗███████╗██████╗  ██████╗ ███████╗
#██╔════╝██║  ██║██║   ██║██║     ██║ ██╔╝██╔════╝██╔══██╗██╔═══██╗██╔════╝
#███████╗███████║██║   ██║██║     █████╔╝ █████╗  ██████╔╝██║   ██║███████╗
#╚════██║██╔══██║██║   ██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗██║   ██║╚════██║
#███████║██║  ██║╚██████╔╝███████╗██║  ██╗███████╗██║  ██║╚██████╔╝███████║
#╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝

# ==================== CONFIGURATION ====================
DRIVE="/dev/mmcblk0p"      # Your eMMC/SD drive
BOOT="1GB"                 # EF00 -> p1
SWAP="2G"                  # 8200 -> p2
ROOT="40GB"                # 8300 -> p3
HOME=""			   # 	  -> p4
HOSTNAME="ShulkerOS"       # System hostname
USERNAME="ayt04"           # Your username
TIMEZONE="America/Toronto" # Your timezone
LOCALE="en_US.UTF-8"       # Your locale

# Internet Configuration
IWCTL="iwctl ${NI} scan"   # Configuring Internet
PING="ping www.ayt04.xyz"  # Internet Testing
LSBLK="lsblk"		   # List Your Device Block
NI="wlan0"		   # Your Network Interface Device

# Partitioning Tools
EFIVAR="efivar -l"	   # UEFI
GDISK="gdisk /dev/$DRIVE"  # X for Expert.. Z for Zap!
CGDISK="cgdisk /dev/$DRIVE" # Formatting

# Filesystem Creation
MKFS_F32="mkfs.fat -F32 /dev/${DRIVE}p1"
MKSWAP="mkswap /dev/${DRIVE}p2"
MKFS_EXT4p3="mkfs.ext4 ${DRIVE}p3"
MKFS_EXT4p4="mkfs.ext4 ${DRIVE}p4"

# Mounting
MOUNTp3="mount /dev/${DRIVE}p3 /mnt"
MKDIR_B_H="mkdir -p /mnt/boot /mnt/home"
MOUNT_B="mount /dev/${DRIVE}p1 /mnt/boot"
MOUNT_H="mount /dev/${DRIVE}p4 /mnt/home"

# Base System Installation
PACSTRAP="pacstrap -K /mnt base linux linux-firmware base-devel nano"
GENFSTAB="genfstab -U -p /mnt >> /mnt/etc/fstab"
NANO_FSTAB="nano /mnt/etc/fstab"

# Mirror Configuration
COPY_ML="cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.backup"
NANO_ML="nano /etc/pacman.d/mirrorlist"
RANKMIRRORS="rankmirrors -n 2 /etc/pacman.d/mirrorlist.backup > /etc/pacman.d/mirrorlist"
PACMAN_CONTRIB="pacman -Sy pacman-contrib"

# Chroot Environment
ARCH_CHROOT1="arch-chroot /mnt"
ARCH_CHROOT2="sudo pacman -S nano bash-completion"

# Locale Setup
NANO_LG="nano /etc/locale.gen en_US.UTF-8/en_US.UTF-8 /etc/locale.gen"
NANO_LG_RUN="locale-gen"
EXPORT_LANG="export LANG=en_US.UTF-8"
SHOW_LANG="echo `LANG=en_US.UTF-8` > /etc/locale.conf"

# Timezone & Clock
TIMENCLOCK="ls /usr/share/zoneinfo/Canada/Eastern > /etc/localtime"
ENABLE_CLOCK="hwclock --systohc --utc"

# System Configuration
SSD_SUPPORT="systemctl enable fstrim.timer"
NANO_PACMAN_CONF="nano /etc/pacman.conf EOF `[multilib] include = /etc/pacman.d/mirrorlist` EOF"
UPDATE="sudo pacman -Sy"
FULL_UPDATE="pacman -Syu"

# User Management
PASSWD="passwd"
USER_WHEEL="useradd -m -g users -G wheel,storage,power -s /bin/bash ayt04"
ROOT_USER_PASSWD="passwd ayt04"
EDITOR_VISUDO="EDITOR=nano visudo EOF %wheel ALL=(ALL:ALL) ALL Defaults rootpw EOF"

# EFI Variables
MOUNT_EFIVARFS="mount -t efivarfs efivarfs /sys/firmware/efi/efivars"
LS_EFIVARFS="ls /sys/firmware/efi/efivars"

# Bootloader
INSTALL_BOOTLOADER="bootctl install"
MODIFY_BOOTLOADER="nano /boot/loader/entries/arch.conf EOF title ShulkerOS linux /vmlinuz-linux initrd /initramfs-linux.img echo `options root=PARTUUID=$(blkid -s PARTUUID -o value /dev/mmcblkp3) rw` >> /boot/loaders/entries/arch.conf EOF"

# Network Services
ENABLE_NM_NI="sudo pacman -S dhcpcd networkmanager sudo systemctl enable dhcpcd@wlan0.service NetworkManager.service"

# Desktop Environment
RICE="pacman -S xorg-server xorg-apps xorg-init xorg-twm xorg-clock xterm"
START_X_SERVER="startx"
ENABLE_SDDM="systemctl enable sddm.service"

# Final Steps
EXIT="exit"
UNMOUNT_mnt="unmount -R /mnt"
REBOOT="reboot"
