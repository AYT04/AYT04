#!/bin/bash
# TRUE NORTH STRONG AND FREE!

set -e  # Exit if any command fails

# Update and upgrade system packages
sudo apt update && sudo apt upgrade -y

# Ensure curl is installed
if ! command -v curl >/dev/null 2>&1; then
  sudo apt install curl -y
fi

# Download the Canadian background image to /tmp
IMG_PATH="/tmp/canada-bg.jpg"
curl -o "$IMG_PATH" "https://www.canada.ca/content/dam/canada/splash/sp-bg-1.jpg"

# Install feh if not present
if ! command -v feh >/dev/null 2>&1; then
  sudo apt install feh -y
fi

# Set the wallpaper (X11 only)
feh --bg-fill "$IMG_PATH"

echo "Background set successfully!"

# Optional: Prompt before rebooting
read -p "Reboot now to apply changes? [y/N]: " answer
if [[ "$answer" =~ ^[Yy]$ ]]; then
  sudo reboot
fi