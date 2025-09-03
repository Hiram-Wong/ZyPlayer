> 該功能僅供嘗鮮，尚不穩定：


該功能依賴於 ffmpeg，請確保已安裝此軟體並配置環境變數。
在命令列輸入 ffmpeg -version 檢查是否安裝成功。
安裝完 ffmpeg 模組後需重新啟動軟體才可以偵測到。
該功能會占用部分磁碟進行儲存，生成時會占用部分 CPU/GPU。
不同作業系統的安裝方法如下：
```
Windows:
1. 打開 FFmpeg 官網，選擇 Windows 平台，點選 Windows builds from gyan.dev 下載
2. 在 release builds 第一個綠框中選擇一個 full 版本套件下載
3. 下載完成後解壓縮該壓縮包，在 bin 目錄裡會有三個 exe 檔案，複製此時的路徑
4. 右鍵單擊此電腦，點擊內容（或屬性），在內容中點選 進階系統設定
5. 在 系統變數 中選擇 Path，然後編輯
6. 在【編輯環境變數】視窗中點選 新增，將複製的 bin 目錄路徑貼上，儲存

```

```
Mac:
1. 安裝 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
2. 安裝 ffmpeg
brew install ffmpeg

```

```
Linux:
Ubuntu: sudo apt install FFmpeg
Arch Linux: pacman -S ffmpeg
Fedora:
sudo dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-
sudo dnf install ffmpeg

```

> 其他作業系統建議自行透過網路搜尋安裝方法！
