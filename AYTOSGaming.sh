# My Linux Distribution for Gaming

sudo dnf update && sudo dnf upgrade
sudo dnf install sddm
systemctl enable sddm
sudo systemctl set-default graphical.target
mkdir Games
mkdir Apps
sudo dnf install flatpak
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
sudo dnf install kitty firefox nitrogen neofetch lutris qemu virt-manager
cp Nebula_AYT04_ALPHA_BRANDING.png /$user/home/
reboot