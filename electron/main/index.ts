import { app, shell, BrowserWindow, protocol, globalShortcut, ipcMain } from 'electron';

import Store from 'electron-store';
import path from 'path';
import url from 'url';
import { electronApp } from '@electron-toolkit/utils';
// import { createMenu } from './core/menu';
import log from './core/log';
import initUpdater from './core/auto-update';

const remote = require('@electron/remote/main');

log.info(`storage location：${app.getPath('userData')}`);
remote.initialize(); // 主进程初始化

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors'); // 允许跨域
app.commandLine.appendSwitch('--ignore-certificate-errors', 'true'); // 忽略证书相关错误
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport'); // 支持hevc

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('--no-sandbox'); // linux 关闭沙盒模式
}

const store = new Store();
// 初始化数据
const shortcuts: any = store.get('settings.shortcuts');
if (shortcuts === undefined) {
  store.set('settings.shortcuts', '');
}
const hardwareAcceleration: any = store.get('settings.hardwareAcceleration');
if (shortcuts === undefined) {
  store.set('settings.hardwareAcceleration', true);
}

if (!hardwareAcceleration) {
  app.disableHardwareAcceleration();
}
// const { NODE_ENV } = process.env;

// 保持window对象的: BrowserWindow | null全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;
let playWindow; // 播放窗口
let isHidden = true;

function createWindow(): void {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 950,
    minWidth: 950,
    height: 650,
    minHeight: 650,
    titleBarStyle: 'hiddenInset',
    show: false,
    frame: false,
    autoHideMenuBar: true,
    title: 'ZyPlayer',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // 禁用同源策略
      allowRunningInsecureContent: false, // 允许一个 https 页面运行来自http url的JavaScript, CSS 或 plugins
    },
  });

  remote.enable(mainWindow.webContents); // 启用remote

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
  // initUpdater(mainWindow);
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(
    app.isPackaged ? `file://${path.join(__dirname, '../../dist/index.html')}` : 'http://localhost:3000',
  );

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const url = new URL(details.url);
    details.requestHeaders.Origin = url.origin;
    if (
      !details.url.includes('//localhost') &&
      details.requestHeaders.Referer &&
      details.requestHeaders.Referer.includes('//localhost')
    ) {
      details.requestHeaders.Referer = url.origin;
    }
    callback({
      // https://github.com/electron/electron/issues/23988 回调似乎无法修改headers，暂时先用index.html的meta referer policy替代
      requestHeaders: details.requestHeaders,
    });
  });

  initUpdater(mainWindow);
}

// 这段程序将会在 Electron 结束初始化和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  log.info('[index] App ready');
  // 为 Windows 设置应用程序用户模型 ID
  electronApp.setAppUserModelId('com.zyplayer');

  // register global shortcuts

  console.log(shortcuts);
  if (shortcuts) {
    globalShortcut.register(shortcuts, () => {
      // Do stuff when Y and either Command/Control is pressed.
      if (isHidden) {
        if (mainWindow) mainWindow.hide();
        if (playWindow) playWindow.hide();
      } else {
        if (mainWindow) mainWindow.show();
        if (playWindow) playWindow.show();
      }
      isHidden = !isHidden;
    });
  }

  // 开发中默认按F12打开或关闭Dev Tools
  // 并在生产中忽略 Command 或 Control + R。
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  // app.on('browser-window-created', (_, window) => {
  //   optimizer.watchWindowShortcuts(window);
  // });

  createWindow();

  app.on('activate', () => {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // unregister all global shortcuts
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
// 创建子窗口启用remote
app.on('browser-window-created', (_, window) => {
  remote.enable(window.webContents);
});

ipcMain.on('openPlayWindow', (_, arg) => {
  if (playWindow) playWindow.destroy();
  playWindow = new BrowserWindow({
    width: 890,
    minWidth: 890,
    height: 550,
    minHeight: 550,
    titleBarStyle: 'hiddenInset',
    show: false,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#18191c',
    title: arg,
    trafficLightPosition: {
      x: 10,
      y: 15,
    },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // 允许跨域
      allowRunningInsecureContent: false,
    },
  });
  playWindow.loadURL(
    app.isPackaged
      ? url.format({
          pathname: path.join(__dirname, '../../dist/index.html'),
          protocol: 'file:',
          slashes: true,
          hash: 'play',
        })
      : 'http://localhost:3000/#/play',
  );

  // 修改request headers
  // Sec-Fetch下禁止修改，浏览器自动加上请求头 https://www.cnblogs.com/fulu/p/13879080.html 暂时先用index.html的meta referer policy替代

  playWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const url = new URL(details.url);
    details.requestHeaders.Origin = url.origin;
    console.log(details.requestHeaders);
    details.requestHeaders['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    details.requestHeaders['sec-ch-ua'] = 'Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111';
    if (
      !details.url.includes('//localhost') &&
      details.requestHeaders.Referer &&
      details.requestHeaders.Referer.includes('//localhost')
    ) {
      details.requestHeaders.Referer = url.origin;
    }
    callback({
      // https://github.com/electron/electron/issues/23988 回调似乎无法修改headers，暂时先用index.html的meta referer policy替代
      requestHeaders: details.requestHeaders,
    });
  });

  playWindow.on('ready-to-show', () => {
    playWindow.show();
  });
  playWindow.on('closed', () => {
    if (mainWindow.isDestroyed()) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

ipcMain.on('showMainWin', async () => {
  console.log('显示主窗口');
  mainWindow.show();
});

ipcMain.on('uninstallShortcut', () => {
  globalShortcut.unregisterAll();
  store.set('settings.shortcuts', '');
});

ipcMain.on('updateShortcut', (_, { shortcut }) => {
  store.set('settings.shortcuts', shortcut);
  globalShortcut.unregisterAll();
  globalShortcut.register(shortcut, () => {
    if (isHidden) {
      if (mainWindow) mainWindow.hide();
      if (playWindow) playWindow.hide();
    } else {
      if (mainWindow) mainWindow.show();
      if (playWindow) playWindow.show();
    }
    isHidden = !isHidden;
  });
});

ipcMain.on('toggle-playerPip', (_, status) => {
  log.info(`set-playerPip${status}`);
  if (status) {
    if (mainWindow) mainWindow.hide();
    if (playWindow) playWindow.hide();
  } else {
    if (mainWindow) mainWindow.show();
    if (playWindow) playWindow.show();
  }
  isHidden = !isHidden;
});

ipcMain.on('toggle-selfBoot', (_, status) => {
  log.info(`set-selfBoot：${status}`);
  if (status) {
    const exeName = path.basename(process.execPath);
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: false,
      path: process.execPath,
      args: ['--processStart', `"${exeName}"`],
    });
  } else if (!app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: false,
      path: process.execPath,
    });
  } else {
    app.setLoginItemSettings({
      openAtLogin: false,
    });
  }
});

ipcMain.on('toggle-hardwareAcceleration', (_, status) => {
  log.info(`set-hardwareAcceleration：${status}`);
  store.set('settings.hardwareAcceleration', status);
});
