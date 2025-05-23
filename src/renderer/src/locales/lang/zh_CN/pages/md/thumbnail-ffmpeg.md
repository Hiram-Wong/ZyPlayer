> 该功能仅供尝鲜, 尚不稳定:

1. 该功能依赖于ffmpeg, 请确保安装该软件并配置了环境变量.
2. 命令行输入ffmpeg -version查看安装是否成功。
3. 安装完ffmpeg模块后需重启软件后才可以检测到。
4. 该功能会占用部分磁盘用于存储, 生成时会占用部分cpu/gpu。
5. 如下为不同操作系统安装方法: 
```
Windows:
1.打开FFmpeg官网,选择windows平台 选择Windows builds from gyan.dev下载
2.在release builds第一个绿框里面选择一个版本full包下载
3.下载完成后解压该压缩包,在bin文件里会有三个exe文件,复制此时的地址
4.右键单击此电脑, 点击属性, 在属性里面点击高级系统设置
5.在系统变量中, 选择 Path, 然后编辑
6.[编辑环境变量]表中, 新建, 将复制的bin目录路径粘贴进去, 保存
```

```
Mac:
1.安装Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
2.安装ffmpeg
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

> 其他操作系统建议百度查找安装方法!