import { initialize as remoteInit } from '@electron/remote/main';
import { electronApp, platform, optimizer } from '@electron-toolkit/utils';
import { registerContextMenuListener } from '@electron-uikit/contextmenu';
import { registerTitleBarListener } from '@electron-uikit/titlebar';
import { app, BrowserWindow, globalShortcut, nativeTheme, session } from 'electron';
import fixPath from 'fix-path';
import { setup as dbInit, webdev } from './core/db';
import createMenu from './core/menu';
import { ipcListen } from './core/ipc';
import logger from './core/logger';
import autoUpdater from './core/update';
import createTray from './core/tray';
import protocolResgin from './core/protocol';
import globalVariable from './core/global';
import serverInit from './core/server';
import { createMain } from './core/winManger';
import { bossShortcutResgin } from './core/shortcut';
import { parseCustomUrl, isLocalhostRef } from './utils/tool';

const setup = async () => {
  /**
   * fix env is important
   * fix before => '/usr/bin'
   * fix after => '/usr/local/bin:/usr/bin'
   */
  fixPath();
  logger.info(`[env] ${process.env.PATH}`);
  logger.info(`[electron][version] ${process.versions.electron}`);
  logger.info(`[chromium][version] ${process.versions.chrome}`);
  logger.info(`[node][version] ${process.versions.node}`);
  logger.info(`[v8][version] ${process.versions.v8}`);

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 忽略 TLS 证书错误
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; // 关闭安全警告
  app.commandLine.appendSwitch(
    'disable-features',
    'OutOfBlinkCors, BlockInsecurePrivateNetworkRequests, OutOfProcessPdf, IsolateOrigins, site-per-process',
  ); // 禁用
  app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport, HardwareAccelerationModeDefault'); // 启用
  app.commandLine.appendSwitch('ignore-certificate-errors'); // 忽略证书错误
  app.commandLine.appendSwitch('disable-web-security'); // 禁用安全
  app.commandLine.appendSwitch('gpu-memory-buffer-compositor-resources'); // GPU内存缓冲

  if (platform.isLinux) {
    app.disableHardwareAcceleration();
  }

  remoteInit(); // 主进程初始化
  await dbInit(); // 初始化数据库
  await globalVariable(); // 全局变量
  await serverInit(); // 后端服务
};

let reqIdMethod = {}; // 请求id与headers列表
let reqIdRedirect = {}; // 请求id与重定向地址

const ready = () => {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    if (globalThis.variable.dns) {
      logger.info(`[dns] doh: ${globalThis.variable.dns}`);
      app.configureHostResolver({
        secureDnsMode: 'secure',
        secureDnsServers: [globalThis.variable.dns],
      });
    }

    registerTitleBarListener();
    registerContextMenuListener();

    const defaultSession = session.defaultSession;

    defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
      let { url, id } = details;
      const filters = ['devtools-detector', 'disable-devtool'];
      if (filters.some((filter) => url.includes(filter))) {
        callback({ cancel: true });
        return;
      }

      // 不处理本地地址
      if (isLocalhostRef(url)) {
        callback({});
        return;
      }

      // http://bfdsr.hutu777.com/upload/video/2024/03/20/c6b8e67e75131466cfcbb18ed75b8c6b.JPG@Referer=www.jianpianapp.com@User-Agent=jianpian-version353
      const { redirectURL, headers } = parseCustomUrl(url);

      if (headers && Object.keys(headers).length > 0) {
        reqIdMethod[`${id}`] = headers;
        callback({ cancel: false, redirectURL });
      } else {
        callback({});
      }
    });

    defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      let { requestHeaders, url, id } = details;
      const headers = reqIdMethod[details.id] || {};

      // 不处理本地地址
      if (isLocalhostRef(url)) {
        callback({ requestHeaders });
        return;
      }

      // 处理Origin
      const origin = headers?.['Origin'] || requestHeaders['Origin'];
      if (origin && !isLocalhostRef(origin)) {
        if (requestHeaders['Origin'] === new URL(url).origin) {
          delete requestHeaders['Origin'];
        } else requestHeaders['Origin'] = origin;
      } else {
        delete requestHeaders['Origin'];
      }

      // 处理 User-Agent
      requestHeaders['User-Agent'] = headers?.['User-Agent'] || requestHeaders?.['User-Agent'];
      if (!requestHeaders['User-Agent'] || requestHeaders['User-Agent']?.includes('zyfun'))
        requestHeaders['User-Agent'] = globalThis.variable.ua;
      // 处理 Host
      requestHeaders['Host'] = headers?.['Host'] || requestHeaders?.['Host'] || new URL(url).host;
      // 处理 Cookie
      requestHeaders['Cookie'] = headers?.['Cookie'] || requestHeaders?.['Cookie'];
      // 处理 Referer
      const referer = headers?.['Referer'] || requestHeaders['Referer'];
      if (referer && !isLocalhostRef(referer)) {
        requestHeaders['Referer'] = referer;
      } else {
        delete requestHeaders['Referer'];
      }
      if (requestHeaders['Redirect'] === 'manual') {
        reqIdRedirect[`${id}`] = headers;
      }
      // 清理不再需要的记录
      delete reqIdMethod[`${id}`];
      callback({ requestHeaders });
    });

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.zyfun');

    // The frameless window ipc allow the renderer process to control the browser window
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    optimizer.registerFramelessWindowIpc();

    createMain(); // 主窗口
    autoUpdater(); // 检测更新
    ipcListen(); // ipc通讯
    createTray(); // 系统托盘 必须 tray 先加载 否则加载不出 menu
    createMenu(); // 菜单
    protocolResgin(); // 协议注册
    bossShortcutResgin(); // 快捷键
    webdev.cronSyncWebdev(); // 同步webdev

    defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const { id, responseHeaders, statusCode } = details;

      const headersToRemove = ['X-Frame-Options', 'x-frame-options'];
      const cookieHeader = responseHeaders?.['Set-Cookie'] || responseHeaders?.['set-cookie'];

      for (const header of headersToRemove) {
        if (responseHeaders?.[header]) {
          delete responseHeaders[header];
        }
      }

      if (cookieHeader) {
        // 取消自动携带cookie的拦截问题
        // const updatedCookieHeader = cookieHeader.map((cookie) => `${cookie}; SameSite=None; Secure`);
        const updatedCookieHeader = cookieHeader.map((cookie) => `${cookie}`);
        responseHeaders!['set-cookie'] = updatedCookieHeader;
      }

      if (reqIdRedirect[`${id}`] && statusCode === 302) {
        callback({
          cancel: false,
          responseHeaders: {
            ...details.responseHeaders,
          },
          statusLine: 'HTTP/1.1 200 OK',
        });
        delete reqIdRedirect[`${id}`];
        return;
      }

      callback({ cancel: false, responseHeaders: details.responseHeaders });
    });

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createMain();
      }
    });
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
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

  // second-instance
  app.on('second-instance', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length === 0) return;
    windows.forEach((win) => win.show());
  });
};

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

const main = async () => {
  const gotTheLock = app.requestSingleInstanceLock();
  logger.info(`[main][lock] status: ${gotTheLock}`);
  if (!gotTheLock) {
    app.quit();
  } else {
    await setup();
    ready();
  }
};

main();
