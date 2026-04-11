sudo pacman -S gnome gnome-extra xorg-server xorg-apps xorg-xinit xorg-twm xorg-xclock xterm
startx 
exit
sudo pacman -S gdm
sudo systemctl enable gdm.service
sudo systemctl start gdm.service