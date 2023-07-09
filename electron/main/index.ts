// import { createMenu } from './core/menu';
import remote from '@electron/remote/main';
import { electronApp } from '@electron-toolkit/utils';
import { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme, protocol, shell } from 'electron';
import Store from 'electron-store';
import path from 'path';
import url from 'url';

import initUpdater from './core/auto-update';
import log from './core/log';

const { platform } = process;

log.info(`[storage] storage location: ${app.getPath('userData')}`);
remote.initialize(); // 主进程初始化

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors'); // 允许跨域
app.commandLine.appendSwitch('ignore-certificate-errors'); // 忽略证书相关错误
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport'); // 支持hevc
app.commandLine.appendSwitch('disable-site-isolation-trials'); // iframe 跨域

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox'); // linux 关闭沙盒模式
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
const doh: any = store.get('settings.doh');
if (doh === undefined) {
  store.set('settings.doh', '');
}

let ua: any = store.get('settings.ua');
if (ua === undefined) {
  store.set('settings.ua', '');
}

// 默认数据处理
if (!hardwareAcceleration) {
  app.disableHardwareAcceleration();
}

// 老板键隐藏恢复事件
const showOrHidden = () => {
  if (isHidden) {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
    if (playWindow && !playWindow.isDestroyed()) playWindow.hide();
  } else {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
    if (playWindow && !playWindow.isDestroyed()) playWindow.show();
  }
  isHidden = !isHidden;
};

// const { NODE_ENV } = process.env;

// 保持window对象的: BrowserWindow | null全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow: BrowserWindow | null;
let playWindow: BrowserWindow | null; // 播放窗口
let isHidden = true;

nativeTheme.on('updated', () => {
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  if (mainWindow) mainWindow.webContents.send('system-theme-updated', `${isDarkMode ? 'dark' : 'light'}`);
  log.info(`[nativeTheme] System-theme-updated: ${isDarkMode ? 'dark' : 'light'} ; send to vue app`);
});

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
    title: 'zyplayer',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true, // 启用webview
      webSecurity: false, // 禁用同源策略
      allowRunningInsecureContent: false, // 允许一个 https 页面运行来自http url的JavaScript, CSS 或 plugins
    },
  });

  remote.enable(mainWindow.webContents); // 启用remote

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    mainWindow.webContents.send('blockUrl', details.url);
    const allowUrlList = ['github.com', 'kuyun.com'];
    const urlIsAllowed = allowUrlList.some((url) => details.url.includes(url));

    if (urlIsAllowed) {
      shell.openExternal(details.url);
    }

    return { action: 'deny' };
  });

  mainWindow.loadURL(
    app.isPackaged ? `file://${path.join(__dirname, '../../dist/index.html')}` : 'http://localhost:3000',
  );

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders, url } = details;
    const requestUrl = new URL(url);

    requestHeaders.Origin = requestUrl.origin;
    if (ua) requestHeaders['User-Agent'] = ua;
    if (!url.includes('//localhost') && requestHeaders.Referer && requestHeaders.Referer.includes('//localhost')) {
      requestHeaders.Referer = requestUrl.origin;
    }
    callback({ requestHeaders });
  });

  // X-Frame-Options
  mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: ['*://*/*'] }, (details, callback) => {
    if (details.responseHeaders['X-Frame-Options']) {
      delete details.responseHeaders['X-Frame-Options'];
    } else if (details.responseHeaders['x-frame-options']) {
      delete details.responseHeaders['x-frame-options'];
    }

    callback({ cancel: false, responseHeaders: details.responseHeaders });
  });

  mainWindow.webContents.on('did-attach-webview', (_, wc) => {
    wc.setWindowOpenHandler((details) => {
      mainWindow.webContents.send('blockUrl', details.url);
      console.log(details.url);
      return { action: 'deny' };
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
      showOrHidden();
    });
  }

  console.log(doh);
  if (doh) {
    app.configureHostResolver({
      secureDnsMode: 'secure',
      secureDnsServers: [doh],
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
  // remove all nativeTheme listeners
  nativeTheme.removeAllListeners('updated');
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

  playWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
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
    const { requestHeaders, url } = details;
    const requestUrl = new URL(url);

    requestHeaders.Origin = requestUrl.origin;
    if (ua) requestHeaders['User-Agent'] = ua;
    if (!url.includes('//localhost') && requestHeaders.Referer && requestHeaders.Referer.includes('//localhost')) {
      requestHeaders.Referer = requestUrl.origin;
    }
    callback({ requestHeaders });
  });

  // 禁止下载
  playWindow.webContents.session.on('will-download', (event) => {
    event.preventDefault();
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

ipcMain.on('showMainWin', () => {
  log.info(`[ipcMain] show main windows`);
  if (mainWindow.isDestroyed()) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

ipcMain.on('uninstallShortcut', () => {
  log.info(`[ipcMain] globalShortcut unregisterAll`);
  globalShortcut.unregisterAll();
  store.set('settings.shortcuts', '');
});

ipcMain.on('updateShortcut', (_, { shortcut }) => {
  log.info(`[ipcMain] storage-shortcuts: ${shortcut}`);
  store.set('settings.shortcuts', shortcut);
  globalShortcut.unregisterAll();
  log.info(`[ipcMain] globalShortcut-install: ${shortcut}`);
  globalShortcut.register(shortcut, () => {
    showOrHidden();
  });
});

ipcMain.on('toggle-playerPip', (_, status) => {
  log.info(`[ipcMain] set-playerPip: ${status}`);
  if (status) {
    if (playWindow) playWindow.minimize();
  } else if (playWindow) playWindow.restore();
  isHidden = !isHidden;
});

ipcMain.on('toggle-selfBoot', (_, status) => {
  log.info(`[ipcMain] set-selfBoot: ${status}`);
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

ipcMain.on('update-hardwareAcceleration', (_, status) => {
  log.info(`[ipcMain] storage-hardwareAcceleration: ${status}`);
  store.set('settings.hardwareAcceleration', status);
});

ipcMain.on('set-playerDark', () => {
  playWindow.webContents.executeJavaScript(`document.documentElement.setAttribute('theme-mode', 'dark')`);
});

ipcMain.on('open-proxy-setting', () => {
  log.info(`[ipcMain] open-proxy-setting`);
  if (platform === 'win32') shell.openPath('ms-settings:network-proxy');
  if (platform === 'darwin') shell.openExternal('x-apple.systempreferences:com.apple.preference.network?Proxies');
});

ipcMain.on('update-dns', (_, status, value) => {
  log.info(`[ipcMain] status:${status} update-dns: ${value}`);
  store.set('settings.doh', value);
  // "off", "automatic", "secure"
  if (status) {
    app.configureHostResolver({
      enableBuiltInResolver: false,
      secureDnsMode: 'secure',
      secureDnsServers: [value],
    });
  }
});

ipcMain.on('update-ua', (_, status, value) => {
  log.info(`[ipcMain] status:${status} update-ua: ${value}`);
  store.set('settings.ua', value);
  ua = value;
});

ipcMain.on('reset-store', () => {
  log.info(`[ipcMain] reset-store`);
  store.clear();
  store.reset('settings.ua');
  store.set('settings.shortcuts', '');
  store.set('settings.hardwareAcceleration', true);
  store.set('settings.ua', '');
  store.set('settings.doh', '');
});

ipcMain.on('reboot-app', () => {
  log.info(`[ipcMain] reboot-app`);
  app.relaunch();
  app.exit();
});
