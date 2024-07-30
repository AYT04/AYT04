# AYT04

[![Netlify Status](#)](https://app.netlify.com/sites/ayt04/deploys)

![BirdManYT04](https://ayt04.github.io/AYT04/BirdManYT04.png)

I am currently exploring Web App technologies while preparing to transition to developing my Android app.
I believe this app will significantly enhance online privacy and digital freedom for many users.
Additionally, I am excited about my upcoming Open World Video Game Project.
Furthermore, I am developing a Public File Hosting Platform, which prioritizes anonymity,
integrated with my Android app, Nebula.

> I am planning these three projects of mine for the future, but hopefully sooner than later!

## Coming Soon!

---

## AYTDocs

My Documentation for three projects (technically two) that I am really passionate about.

## My Projects

I’m currently working on three separate projects, but I’ve decided to merge them into one larger project. This approach will help me avoid burnout and prevent me from feeling overwhelmed by managing multiple tasks.

### Nebula

This is an Android Application that I am working on and releasing very soon. I'll document it more down the road as I am still in the earliest stages of development.

### AYTWorld (World)

An Open World Video Game Project that I have not yet started as of yet, but I will release more information about it, and what I expect from it in the coming months.

### AYTKernel

I've begun working on my own kernel—though it's still in the early stages. Currently, I've only developed a basic Hello World program. My goal is to create a kernel tailored for helping users and companies manage large server farms for archived data, similar to what the Internet Archive does. While Linux is a robust solution, I'm approaching this project as a learning experience and a way to deepen my understanding of Linux systems.

However, if I'm being honest, this project is primarily for fun. My ultimate aim is to design a kernel that will help users host game servers specifically for my video game.

### AYT!_IDE

I'm developing a lightweight IDE tailored for creating Android applications, video games, and OS/kernel projects. My goal is to make it feature-rich yet efficient. I'm also considering creating a web app styled like Android Studio, so I can work on my Xbox One using the Edge browser.

I’m confident in my skills and eager to share my IDE’s code here for feedback and collaboration. The IDE is designed to be minimalistic, requiring only the Python Tkinter library installed via pip. I aim to explore whether it's possible to build a functional and user-friendly IDE with just vanilla Python and Tkinter.

```py
import tkinter as tk
import os
# from pathlib import Path
from tkinter import *
from tkinter import filedialog
from tkinter import messagebox
# from mastodon import Mastodon

root = tk.Tk()
root.title("AYT!_IDE")

# Text
text_widget = tk.Text(root, height=10, width=40)
text_widget.pack()

def WelcomeScreen():
    messagebox.showinfo("Thanks for using AYT!_IDE\n !","This is an Android, Video Game and Operating System IDE for developers or hobby programmers to work on what matters to them.\n If you want, you can choose to help, that's if you want to though.")

# Gradle Build
def GradleBuild():
    print("Building...\nThis may take some time. Grab a coffee, tea, or cookie! :)")
    os.system("./gradlew build")

# # Code "Auto" Completion
# def cc():
#     print("Oops! This Feature is not yet Supported.")

# Save Code
def sc():
    text_content = text_widget.get('1.0', tk.END)

    file_path = filedialog.asksaveasfilename(filetypes=[("Text files", "*.txt"), ("AYT", "*.ayt"), ("All files", "*.*")])

    if file_path:
        with open(file_path, 'w') as file:
            file.write(text_content)
            print(f"Saved file to '{file_path}'")

# Close Window
def closew():
    root.destroy()
            
# Welcome Screen
button = tk.Button(root, text="About", command=WelcomeScreen)
button.pack(pady=20)

# Build with Gradle
button = tk.Button(root, text="Build App", command=GradleBuild)
button.pack()

# Save
button = tk.Button(root, text="Save", command=sc)
button.pack()

# # Auto Complete
# button = tk.Button(root, text="SophAI (Code Completion)", command=cc)
# button.pack()

# Auto Complete
button = tk.Button(root, text="Exit", command=closew)
button.pack()

# Start the GUI event loop
root.mainloop()
```

### AYT!_OS

I’ve created a Linux distribution that’s designed to be lightweight, catering to those of us who prefer a streamlined system without unnecessary bloat. It’s essentially a minimalistic distro that includes only the essentials.

Looking ahead, I plan to develop my own operating system, tailored for a compact device similar to an Amazon Fire TV Stick. The idea is to allow users to connect it to their TV or any display, providing a convenient, portable web browsing experience. I’ll share more details as the project progresses. For now, these are just my initial thoughts.

Here's the Source:

```bash
sudo dnf update && sudo dnf upgrade
mv /usr/local/bin/dnf /usr/local/bin/ayt # fun thing I like to do.
sudo dnf install git
sudo dnf install sddm
systemctl enable sddm
sudo systemctl set-default graphical.target
mkdir .config
mkdir Documents
mkdir Desktop
mkdir Pictures
mkdir Videos
mkdir .fonts
sudo dnf install kitty firefox nitrogen neofetch
sudo dnf groupinstall "Xfce Desktop"
cp AYT_OS/bg.jpg ~/.config
reboot
```

#### I did take inspiration from ChrisTitusTech's Fedora Guide.

{{< youtube oa3LDqV4-cc >}}
