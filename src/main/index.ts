import { ElectronBlocker } from '@cliqz/adblocker-electron';
import remote from '@electron/remote/main';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';

import { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme, protocol, shell } from 'electron';
import fixPath from 'fix-path';
import { join } from 'path';
import url from 'url';

import initServer from './core/server';
import { init as dbInit} from './core/db';
import { setting } from './core/db/service';
import createMenu from './core/menu';
import { ipcListen, tmpDir } from './core/ipc';
import logger from './core/logger';
import autoUpdater from './core/update';
import createTray from './core/tray';


import loadHtml from '../../resources/html/load.html?asset'

/**
 * fix env is important
 * fix before => '/usr/bin'
 * fix after => '/usr/local/bin:/usr/bin'
 */
fixPath();
logger.info(`[env] path:${process.env.PATH}`);

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; // 关闭安全警告
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors'); // 允许跨域
app.commandLine.appendSwitch('ignore-certificate-errors'); // 忽略证书相关错误
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport'); // 支持hevc
app.commandLine.appendSwitch('disable-site-isolation-trials'); // iframe 跨域

// 注册协议  在应用程序准备就绪之前注册
protocol.registerSchemesAsPrivileged([{ scheme: 'zy', privileges: { secure: true, standard: true } }]);

remote.initialize(); // 主进程初始化
dbInit(); // 初始化数据库
initServer(); // 后端服务

// 禁用硬件加速
if (!setting.find({ key: "hardwareAcceleration" }).value) {
  app.disableHardwareAcceleration();
};

let uaState: any = setting.find({ key: "ua" }).value;

let windowState: any = setting.find({ key: "windowPosition" }).value || {
  status: false,
  position: {
    width: 1000,
    height: 640,
  }
};

const windowManage = (win) => {
  const bounds = win.getBounds();
  setting.update_data('windowPosition', {
    value: {
      status: windowState.status,
      position: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }
    }
  });
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

// 主题更新事件
nativeTheme.on('updated', () => {
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  if (mainWindow) mainWindow.webContents.send('system-theme-updated', `${isDarkMode ? 'dark' : 'light'}`);
  logger.info(`[nativeTheme] System-theme-updated: ${isDarkMode ? 'dark' : 'light'} ; send to vue app`);
});

let loadWindow: BrowserWindow;
let mainWindow: BrowserWindow | null;
let playWindow: BrowserWindow | null;
let isHidden = true;

// 加载loading页面窗口
const showLoading = () => {
  loadWindow = new BrowserWindow({
    width: windowState.status ? windowState.position.width : 1000,
    height: windowState.status ? windowState.position.height : 640,
    x: windowState.status ? windowState.position.x : null,
    y: windowState.status ? windowState.position.y : null,
    minWidth: 1000,
    minHeight: 640,
    titleBarStyle: 'hiddenInset',
    show: false,
    frame: false,
    autoHideMenuBar: true,
    title: 'zyplayer',
    trafficLightPosition: {
      x: 12,
      y: 20,
    }
  });

  loadWindow.loadFile(loadHtml);
  loadWindow.on('ready-to-show', () => {
    loadWindow.show();
  });
};

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: windowState.status ? windowState.position.width : 1000,
    height: windowState.status ? windowState.position.height : 640,
    x: windowState.status ? windowState.position.x : null,
    y: windowState.status ? windowState.position.y : null,
    minWidth: 1000,
    minHeight: 640,
    titleBarStyle: 'hiddenInset',
    show: false,
    frame: false,
    autoHideMenuBar: true,
    title: 'zyplayer',
    trafficLightPosition: {
      x: 12,
      y: 20,
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true, // 启用webview
      webSecurity: false, // 禁用同源策略
      allowRunningInsecureContent: false, // 允许 https 页面运行来自http url的JavaScript, CSS 或 plugins
    },
  })

  remote.enable(mainWindow.webContents); // 启用remote

  // 关闭window时触发下列事件.
  mainWindow.on('close', () => {
    windowManage(mainWindow);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('ready-to-show', () => {
    setTimeout(() => {
      mainWindow.show();
      if (loadWindow && !loadWindow.isDestroyed()) {
        loadWindow.hide();
        loadWindow.destroy();
      }
    }, 1000);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    mainWindow.webContents.send('blockUrl', details.url);
    const allowUrlList = ['github.com'];
    const urlIsAllowed = allowUrlList.some((url) => details.url.includes(url));

    if (urlIsAllowed) {
      shell.openExternal(details.url);
    }

    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders, url } = details;
    const requestUrl = new URL(url);

    requestHeaders.Origin = requestUrl.origin;
    if (uaState) requestHeaders['User-Agent'] = uaState;
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.zyplayer');

  // The frameless window ipc allow the renderer process to control the browser window
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  optimizer.registerFramelessWindowIpc();

  showLoading();
  if (is.dev) {
    tmpDir(join(process.cwd(), 'thumbnail'));
  } else {
    tmpDir(join(app.getPath('userData'), 'thumbnail'));
  }
  createWindow();
  ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInSession(mainWindow.webContents.session);
  });
  // 监听进入全屏事件
  mainWindow.on('enter-full-screen', () => {
    logger.info(`[main] mainwindow has entered full-screen mode ; send to vue app`);
    mainWindow.webContents.send('screen', true);
  });

  // 监听退出全屏事件
  mainWindow.on('leave-full-screen', () => {
    logger.info(`[main] mainwindow has leaved full-screen mode ; send to vue app`);
    mainWindow.webContents.send('screen', false);
  });

  // 检测更新
  autoUpdater(mainWindow);
  // 引入主 Ipc
  ipcListen();
  // 系统托盘 必须 tray 先加载 否则加载不出 menu
  createTray(mainWindow);
  // 菜单
  createMenu();
  // 快捷键
  // createGlobalShortcut(mainWindow);

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      showLoading();
      createWindow();
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // remove all nativeTheme listeners
  nativeTheme.removeAllListeners('updated');
  // unregister all global shortcuts
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
// 创建子窗口启用remote
app.on('browser-window-created', (_, window) => {
  remote.enable(window.webContents);
});

ipcMain.on('openPlayWindow', (_, arg) => {
  logger.info(process.env['ELECTRON_RENDERER_URL'])
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
      preload: join(__dirname, '../preload/index.js'),
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    playWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/play`)
  } else {
    playWindow.loadURL(
      url.format({
        pathname: join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'play',
      })
    )
  }

  // 修改request headers
  // Sec-Fetch下禁止修改，浏览器自动加上请求头 https://www.cnblogs.com/fulu/p/13879080.html 暂时先用index.html的meta referer policy替代
  playWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders, url } = details;
    const requestUrl = new URL(url);

    requestHeaders.Origin = requestUrl.origin;
    if (uaState) requestHeaders['User-Agent'] = uaState;
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
    ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
      blocker.enableBlockingInSession(playWindow.webContents.session);
    });
  });

  playWindow.on('closed', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

ipcMain.on('showMainWin', () => {
  logger.info(`[ipcMain] show main windows`);
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  } else {
    mainWindow.show();
  }
});
  
ipcMain.on('updateShortcut', (_, { shortcut }) => {
  logger.info(`[ipcMain] storage-shortcuts: ${shortcut}`);
  globalShortcut.unregisterAll();
  logger.info(`[ipcMain] globalShortcut-install: ${shortcut}`);
  globalShortcut.register(shortcut, () => {
    showOrHidden();
  });
});

ipcMain.on('update-ua', (_, status, value) => {
  logger.info(`[ipcMain] status:${status} update-ua: ${value}`);
  if (status) {
    uaState = value;
  } else {
    uaState = '';
  }
});

ipcMain.on('update-windowPosition', (_, status) => {
  logger.info(`[ipcMain] storage-windowPosition: ${status}`);
  windowState.status = status;
});