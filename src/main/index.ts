import { initialize as renoteInitialize } from '@electron/remote/main';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { registerTitleBarListener } from '@electron-uikit/titlebar';

import { app, BrowserWindow, globalShortcut, nativeTheme, session } from 'electron';
import fixPath from 'fix-path';
import { join } from 'path';

import { setup as dbInit } from './core/db';
import { setting } from './core/db/service';
import createMenu from './core/menu';
import { ipcListen, tmpDir } from './core/ipc';
import logger from './core/logger';
import autoUpdater from './core/update';
import createTray from './core/tray';
import protocolResgin from './core/protocolResgin';
import initServer from './core/server';
import { createBossShortcut } from './core/shortcut';
import { createMain } from './core/winManger';
import { parseCustomUrl } from './utils/tool';

/**
 * fix env is important
 * fix before => '/usr/bin'
 * fix after => '/usr/local/bin:/usr/bin'
 */
fixPath();
logger.info(`[env] path:${process.env.PATH}`);
logger.info(`[chrome] version:${process.versions.chrome}`);

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; // 关闭安全警告
app.commandLine.appendSwitch(
  'disable-features',
  'OutOfBlinkCors, BlockInsecurePrivateNetworkRequests, OutOfProcessPdf, IsolateOrigins, site-per-process',
); // 禁用
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport'); // 启用
app.commandLine.appendSwitch('ignore-certificate-errors'); // 忽略证书错误
app.commandLine.appendSwitch('disable-web-security');

renoteInitialize(); // 主进程初始化
dbInit(); // 初始化数据库
initServer(); // 后端服务

// 禁用硬件加速
if (setting.find({ key: 'hardwareAcceleration' }).value) {
  app.commandLine.appendSwitch('enable-features', 'HardwareAccelerationModeDefault'); // 硬件加速
  app.commandLine.appendSwitch('gpu-memory-buffer-compositor-resources'); // GPU内存缓冲
} else {
  app.disableHardwareAcceleration();
}

let reqIdMethod = {}; // 请求id与header列表
let reqIdRedirect = {};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  if (setting.find({ key: 'dns' }).value) {
    const doh = setting.find({ key: 'dns' }).value;
    logger.info(`[dns] doh: ${doh}`)
    app.configureHostResolver({
      secureDnsMode: 'secure',
      secureDnsServers: [doh],
    });
  };

  registerTitleBarListener();

  const defaultSession = session.defaultSession;

  defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    let { url, id } = details;
    const filters = ['devtools-detector', 'disable-devtool'];
    if (filters.some((filter) => url.includes(filter))) {
      callback({ cancel: true });
      return;
    }

    // http://bfdsr.hutu777.com/upload/video/2024/03/20/c6b8e67e75131466cfcbb18ed75b8c6b.JPG@Referer=www.jianpianapp.com@User-Agent=jianpian-version353
    const { redirectURL, headers } = parseCustomUrl(url);
    if (
      !url.includes('//localhost') &&
      !url.includes('//127.0.0.1') &&
      ['Referer', 'Cookie', 'User-Agent', 'Origin', 'Host', 'Connection'].some((str) => url.includes(str))
    ) {
      reqIdMethod[`${id}`] = headers;
      callback({ cancel: false, redirectURL });
    } else {
      callback({});
    }
  });

  defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders, url, id } = details;
    const headers = reqIdMethod[details.id] || {};
    const isLocalhostRef = (headerValue) =>
      `${headerValue}`.includes('//localhost') || `${headerValue}`.includes('//127.0.0.1');

    // 设置或清除请求头
    const setOrRemoveHeader = (headerName: string, value: string) => {
      if (value) {
        requestHeaders[headerName] = value;
      } else {
        delete requestHeaders[headerName];
      }
    };

    // 处理请求头
    const processHeaders = (headerName: string, customHeaderName: string) => {
      const customHeaderValue =
        headers?.[headerName] || requestHeaders?.[customHeaderName] || requestHeaders?.[headerName] || '';
      setOrRemoveHeader(headerName, customHeaderValue);
      if (requestHeaders[customHeaderName]) delete requestHeaders[customHeaderName];
    };

    // 不处理本地地址
    if (isLocalhostRef(url)) {
      callback({ requestHeaders });
      return;
    }

    // 设置或清除可能的本地Origin
    const origin = headers?.['Origin'] || requestHeaders['custom-origin'] || requestHeaders['Origin'];
    if (origin && !isLocalhostRef(origin)) {
      if (requestHeaders['Origin'] === new URL(url).origin) {
        delete requestHeaders['Origin'];
      } else requestHeaders['Origin'] = origin;
    } else {
      delete requestHeaders['Origin'];
    }
    if (requestHeaders['custom-origin']) delete requestHeaders['custom-origin'];

    // 设置或清除 User-Agent
    const uaState: any = setting.find({ key: 'ua' }).value;
    setOrRemoveHeader('User-Agent', headers?.['User-Agent'] || requestHeaders['custom-ua'] || uaState);
    if (requestHeaders['custom-ua']) delete requestHeaders['custom-ua'];

    // 处理 Host
    processHeaders('Host', 'custom-host');

    // 处理 Connection
    processHeaders('Connection', 'custom-connection');

    // 处理 Cookie
    processHeaders('Cookie', 'custom-cookie');

    // 设置或清除可能的本地 Referer
    const referer = headers?.['Referer'] || requestHeaders['custom-referer'] || requestHeaders['Referer'];
    if (referer && !isLocalhostRef(referer)) {
      requestHeaders['Referer'] = referer;
    } else {
      delete requestHeaders['Referer'];
    }
    if (requestHeaders['custom-referer']) delete requestHeaders['custom-referer'];

    if (requestHeaders['custom-redirect'] === 'manual') {
      delete requestHeaders['custom-redirect'];
      reqIdRedirect[`${id}`] = headers;
    }

    // 清理不再需要的记录
    delete reqIdMethod[`${id}`];

    callback({ requestHeaders });
  });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.zyplayer');

  // The frameless window ipc allow the renderer process to control the browser window
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  optimizer.registerFramelessWindowIpc();

  // createLoad(); // 加载页面 采用dom操作减少内存消耗
  createMain(); // 主窗口

  if (is.dev) tmpDir(join(process.cwd(), 'thumbnail'));
  else tmpDir(join(app.getPath('userData'), 'thumbnail'));

  autoUpdater(); // 检测更新
  ipcListen(); // Ipc通讯
  createTray(); // 系统托盘 必须 tray 先加载 否则加载不出 menu
  createMenu(); // 菜单
  protocolResgin(); // 协议注册

  const shortcutsState: any = setting.find({ key: 'recordShortcut' }).value;
  if (shortcutsState) createBossShortcut(shortcutsState); // 快捷键

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
      delete responseHeaders!['Set-Cookie'];
      responseHeaders!['custom-set-cookie'] = cookieHeader;
      responseHeaders!['set-cookie'] = updatedCookieHeader;
    }

    if (reqIdRedirect[`${id}`] && statusCode === 302) {
      callback({
        cancel: false,
        responseHeaders: {
          ...details.responseHeaders,
        },
        statusLine: 'HTTP/1.1 200 OK', // 篡改响应头第一行
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
      // createLoad();
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
