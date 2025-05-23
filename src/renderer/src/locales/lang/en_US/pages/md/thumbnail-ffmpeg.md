> This function is only for tasting, not yet stable:

1. This function depends on ffmpeg, please make sure to install the software and configure the environment variables.
2. Enter ffmpeg -version to see if the installation is successful.
3. After installing ffmpeg module, you need to restart the software to detect it.
4. this function will occupy some disk for storage, and some cpu/gpu when generating.
5. The following are the installation methods for different operating systems.
```
Windows:
1. Open the official website of FFmpeg, select Windows platform, select Windows builds from gyan.dev to download.
2. In the first green box of release builds, choose a version full package to download.
3. After the download is complete, unzip the zip file, there will be three exe files in the bin file, copy the address at this time.
4. Right-click on the computer, click Properties, click Advanced System Settings in Properties.
5. In System Variables, select Path, and then Edit
6. In the [Edit Environment Variables] table, create a new one, paste the copied path of the bin directory into it, and save it.
```

```
Mac:
1.Installation Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
2.Installation ffmpeg
brew install ffmpeg
```

```
Linux:
Ubuntu:sudo apt install FFmpeg
Arch Linux:pacman -S ffmpeg
Fedora:
sudo dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-
sudo dnf install ffmpeg
```

> Other operating systems suggest Baidu to find installation methods.!