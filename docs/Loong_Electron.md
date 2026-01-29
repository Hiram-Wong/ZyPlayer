# Loong Electron 快速上手指南

本指南将帮助您在 5 分钟内快速上手 Loong Electron 开发。

[uos loong文档](https://uosdn.uniontech.com/#document3?dirid=6669618394a5a82328adfa2c&id=6669618394a5a82328adfa30)

[loong官方文档](https://docs.loongnix.cn/electron/doc/list/02.%E5%AE%89%E8%A3%85%E8%AF%B4%E6%98%8E.html)

[咱龙了吗?](https://areweloongyet.com/)

### 步骤 1: 安装npm管理工具。

```bash
#!/bin/bash
pkgsource=http://ftp.loongnix.cn/nodejs/LoongArch/dist/v20.8.0/node-v20.8.0-linux-loong64.tar.gz
[ -f $(basename $pkgsource) ] || wget $pkgsource
sudo mkdir -p /opt/nodejs
sudo tar --strip-components=1 -C /opt/nodejs -xvf $(basename $pkgsource)
sudo tee /etc/profile.d/nodejs.sh << "EOF"
export PATH=/opt/nodejs/bin:$PATH
export C_INCLUDE_PATH=/opt/nodejs/include:$C_INCLUDE_PATH
EOF
```

```bash
sudo bash install_npm.sh
source /etc/profile.d/nodejs.sh
```

### 步骤 2: 安装Electron

由于loongarch环境的electron官方没有编译对应的版本。

因此需要ELECTRON_MIRROR指定龙芯镜像源。同时设置electron_use_remote_checksums=1不检查校验文件。

```bash
#!/bin/bash
export electron_use_remote_checksums=1
if [ "$(arch)" == "loongarch" ];then
export ELECTRON_MIRROR="http://ftp.loongnix.cn/electron/LoongArch/"
else
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
fi
npm install electron@26.4.3 -g --unsafe-perm=true --allow-root
npm info -g electron
```

```bash
sudo bash install_electron.sh
```

## 💡 程序示例

### 步骤 1: 下载源码及安装依赖

```bash
git clone https://github.com/electron/electron-quick-start
cd electron-quick-start
npm install
```

### 步骤 2: 编译打包

```bash
npm install --save-dev @electron-forge/cli
npx electron-forge import
npm run make
sudo dpkg -i /home/$HOME/electron-quick-start/out/make/deb/x64/electron-quick-start_1.0.0_amd64.deb
```
