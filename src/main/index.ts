import remote from '@electron/remote/main';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';

import { app, BrowserWindow, nativeTheme, protocol, shell } from 'electron';
import fixPath from 'fix-path';
import { join } from 'path';

import initServer from './core/server';
import { init as dbInit} from './core/db';
import createMenu from './core/menu';
import { ipcListen } from './core/ipc';
import logger from './core/logger';

/**
 * fix env is important
 * fix before => '/usr/bin'
 * fix after => '/usr/local/bin:/usr/bin'
 */
fixPath();
logger.info(`[env] path:${process.env.PATH}`);

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; // 关闭安全警告
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors'); // 允许跨域
app.commandLine.appendSwitch('disable-features', 'BlockInsecurePrivateNetworkRequests'); // 允许不安全的专用网络请求
app.commandLine.appendSwitch('ignore-certificate-errors'); // 忽略证书相关错误
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport'); // 支持hevc
app.commandLine.appendSwitch('disable-site-isolation-trials'); // iframe 跨域

// 注册协议  在应用程序准备就绪之前注册
protocol.registerSchemesAsPrivileged([{ scheme: 'zy', privileges: { secure: true, standard: true } }]);

remote.initialize(); // 主进程初始化
dbInit(); // 初始化数据库
initServer(); // 后端服务

// 主题更新事件
nativeTheme.on('updated', () => {
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  if (mainWindow) mainWindow.webContents.send('system-theme-updated', `${isDarkMode ? 'dark' : 'light'}`);
  logger.info(`[nativeTheme] System-theme-updated: ${isDarkMode ? 'dark' : 'light'} ; send to vue app`);
});

let mainWindow: BrowserWindow | null;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height:  640,
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
      allowRunningInsecureContent: true, // 允许 https 页面运行来自http url的JavaScript, CSS 或 plugins
    },
  })

  remote.enable(mainWindow.webContents); // 启用remote

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    mainWindow!.webContents.send('blockUrl', details.url);
    const allowUrlList = ['github.com'];
    const urlIsAllowed = allowUrlList.some((url) => details.url.includes(url));

    if (urlIsAllowed) {
      shell.openExternal(details.url);
    }

    return { action: 'deny' };
  });

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
    requestHeaders['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
    if (!url.includes('//localhost') && requestHeaders.Referer && requestHeaders.Referer.includes('//localhost')) {
      requestHeaders.Referer = requestUrl.origin;
    }
    callback({ requestHeaders });
  });

  // X-Frame-Options
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headersToRemove = ['X-Frame-Options', 'x-frame-options'];
      
    for (const header of headersToRemove) {
      if (details.responseHeaders?.[header]) {
        delete details.responseHeaders[header];
      }
    }

    callback({ cancel: false, responseHeaders: details.responseHeaders });
  });

  mainWindow.webContents.on('did-attach-webview', (_, wc) => {
    wc.setWindowOpenHandler((details) => {
      mainWindow!.webContents.send('blockUrl', details.url);
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

  createWindow();
  // 监听进入全屏事件
  mainWindow!.on('enter-full-screen', () => {
    logger.info(`[main] mainwindow has entered full-screen mode ; send to vue app`);
    mainWindow!.webContents.send('screen', true);
  });

  // 监听退出全屏事件
  mainWindow!.on('leave-full-screen', () => {
    logger.info(`[main] mainwindow has leaved full-screen mode ; send to vue app`);
    mainWindow!.webContents.send('screen', false);
  });

  // 引入主 Ipc
  ipcListen();
  // 菜单
  createMenu();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.