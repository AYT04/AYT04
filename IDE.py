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