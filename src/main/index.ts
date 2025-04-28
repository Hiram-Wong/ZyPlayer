import { registerContextMenuListener } from '@electron-uikit/contextmenu';
import { registerTitleBarListener } from '@electron-uikit/titlebar';
import { electronApp, optimizer, platform } from '@electron-toolkit/utils';
import { app, BrowserWindow, nativeTheme, session } from 'electron';
import fixPath from 'fix-path';

import { setup as dbInit, server as dbServer, webdev } from './core/db';
import ipcListen from './core/ipc';
import globalVariable from './core/global';
import logger from './core/logger';
import createMenu from './core/menu';
import protocolResgin from './core/protocol';
import serverInit from './core/server';
import { globalShortcut } from './core/shortcut';
import createTray from './core/tray';
import autoUpdater from './core/update';
import { createMain } from './core/winManger';

import { createDir, deleteFile, fileExist, fileState } from './utils/hiker/file';
import { APP_TMP_PATH, APP_DB_PATH, APP_LOG_PATH, APP_PLUGIN_PATH, APP_FILE_PATH } from './utils/hiker/path';
import { isLocalhostRef, isUrlScheme, parseCustomUrl, toggleWinVisable } from './utils/tool';

/**
 * 环境变量修复
 */
const setupEnv = () => {
  // 修复环境变量
  fixPath();
  logger.info(`[env] ${process.env.PATH}`);
  logger.info(`[electron][version] ${process.versions.electron}`);
  logger.info(`[chromium][version] ${process.versions.chrome}`);
  logger.info(`[node][version] ${process.versions.node}`);
  logger.info(`[v8][version] ${process.versions.v8}`);

  // 设置环境变量
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  // 忽略 TLS 证书错误
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';  // 关闭安全警告
};

/**
 * 检查所需路径
 */
const setupCheck = async () => {
  const DEFAULT_PATH = [APP_TMP_PATH, APP_DB_PATH, APP_LOG_PATH, APP_PLUGIN_PATH, APP_FILE_PATH];
  for (const path of DEFAULT_PATH) {
    if (!(await fileExist(path)) || (await fileState(path)) !== 'dir') {
      await deleteFile(path);
      await createDir(path);
    }
  }
};

/**
 * 应用启动参数
 */
const setupApp = async () => {
  /**
   * OutOfBlinkCors - 跨域
   * SameSiteByDefaultCookies - Cookie共享
   * CookiesWithoutSameSiteMustBeSecure - Cookie支持非HTTPS
   * BlockInsecurePrivateNetworkRequests - 私有网络发起的不安全请求
   * OutOfProcessPdf - PDF处理
   * IsolateOrigins - 隔离特定的源
   * site-per-process - 网站独立进程
   * StandardCompliantNonSpecialSchemeURLParsing - URL解析规则
   */
  app.commandLine.appendSwitch(
    'disable-features',
    'OutOfBlinkCors, SameSiteByDefaultCookies, CookiesWithoutSameSiteMustBeSecure, BlockInsecurePrivateNetworkRequests, OutOfProcessPdf, IsolateOrigins, site-per-process, StandardCompliantNonSpecialSchemeURLParsing',
  ); // 禁用
  /**
   * HardwareAccelerationModeDefault - 硬件加速
   * PlatformHEVCDecoderSupport - 视频解码
   * GlobalShortcutsPortal - 全局快捷键
   */
  app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport, HardwareAccelerationModeDefault, GlobalShortcutsPortal'); // 启用
  app.commandLine.appendSwitch('ignore-certificate-errors'); // 忽略证书错误
  app.commandLine.appendSwitch('disable-web-security'); // 禁用安全
  app.commandLine.appendSwitch('disable-renderer-backgrounding'); // 禁用渲染器后台化
  app.commandLine.appendSwitch('disable-site-isolation-trials'); // 禁用站点隔离试验
  app.commandLine.appendSwitch('gpu-memory-buffer-compositor-resources'); // GPU内存缓冲
  app.commandLine.appendSwitch("ignore-gpu-blacklist"); // 忽略GPU黑名单
  app.commandLine.appendSwitch("no-sandbox"); // 禁用沙盒
  app.commandLine.appendSwitch('proxy-bypass-list', '<local>'); // 代理白名单
  app.commandLine.appendSwitch('wm-window-animations-disabled'); // 禁用窗口动画
  app.commandLine.appendSwitch('disable-http-cache'); // 禁用HTTP缓存-if头

  if (platform.isLinux) app.disableHardwareAcceleration(); // 禁用硬件加速
};

/**
 * 网络请求拦截器
 */
const setupSession = () => {
  let reqIdMethod: Record<string, any> = {}; // 请求id与headers列表
  let reqIdRedirect: Record<string, any> = {}; // 请求id与重定向地址
  const defaultSession = session.defaultSession;

  // 发送请求前拦截器
  defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const { url, id } = details;
    // 取消请求-devtools拦截器
    if (['devtools-detector', 'disable-devtool'].some(f => url.includes(f))) return callback({ cancel: true });
    // 取消请求-urlscheme拦截器
    if (isUrlScheme(url)) return callback({ cancel: false });
    // 不处理-本地地址 但lab/ad除外
    if (isLocalhostRef(url) && !url.includes('lab/ad')) return callback({});

    // http://xxx.com/xxx.jpgG@Referer=ianpianapp.com@User-Agent=jianpian-version353
    const { redirectURL, headers } = parseCustomUrl(url);
    if (headers && Object.keys(headers).length) {
      reqIdMethod[id] = headers;
      callback({ cancel: false, redirectURL });
    } else {
      callback({});
    }
  });

  // 发送请求头前拦截器
  defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders, url, id } = details;
    const headers = reqIdMethod[id] || {};

    // 不处理本地地址
    if (isLocalhostRef(url)) return callback({ requestHeaders });

    // 合理处理：优先使用 Electron-xxx -> 自定义 headers -> 原始值

    // 处理 Origin - 确定请求来源(域名)
    requestHeaders['Origin'] = requestHeaders['Electron-Origin'] || headers['Origin'] || requestHeaders['Origin'];
    delete requestHeaders['Electron-Origin'];
    if (requestHeaders['Origin'] && isLocalhostRef(requestHeaders['Origin'])) delete requestHeaders['Origin'];

    // 处理 Host - 确定目标服务器(URL无路径)
    requestHeaders['Host'] = requestHeaders['Electron-Host'] || headers['Host'] || requestHeaders['Host'];
    delete requestHeaders['Electron-Host'];
    if (requestHeaders['Host'] && isLocalhostRef(requestHeaders['Host'])) delete requestHeaders['Host'];
    
    // 处理 Referer - 确定跳转来源(完整URL)
    requestHeaders['Referer'] = requestHeaders['Electron-Referer'] || headers['Referer'] || requestHeaders['Referer'];
    delete requestHeaders['Electron-Referer'];
    if (requestHeaders['Referer'] && isLocalhostRef(requestHeaders['Referer'])) delete requestHeaders['Referer'];

    // 处理 User-Agent
    requestHeaders['User-Agent'] = requestHeaders['Electron-User-Agent'] || headers['User-Agent'] || globalThis.variable.ua || requestHeaders['User-Agent'];
    delete requestHeaders['Electron-User-Agent'];

    // 处理 Cookie
    requestHeaders['Cookie'] = requestHeaders['Electron-Cookie'] || headers['Cookie'] || requestHeaders['Cookie'];
    delete requestHeaders['Electron-Cookie'];

    if (requestHeaders['Redirect'] === 'manual') reqIdRedirect[id] = headers;

    // 清理不再需要的记录
    delete reqIdMethod[id];
    callback({ requestHeaders });
  });

  // 响应拦截器
  defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const { id, responseHeaders, statusCode } = details;

    // iframe 跨域
    ['X-Frame-Options', 'x-frame-options'].forEach(h => delete responseHeaders?.[h]);

    // 携带cookie的拦截问题
    ['set-cookie', 'Set-Cookie'].forEach((key) => {
      if (responseHeaders?.hasOwnProperty(key)) {
        // responseHeaders[key] = responseHeaders[key].map((ck) => `${ck}; SameSite=None; Secure`);
        responseHeaders[key] = responseHeaders[key].map((ck) => `${ck}`);
      };
    });

    if (reqIdRedirect[id] && statusCode === 302) {
      delete reqIdRedirect[id];
      return callback({
        cancel: false,
        responseHeaders,
        statusLine: 'HTTP/1.1 200 OK',
      });
    };

    callback({ cancel: false, responseHeaders });
  });
};

/**
 * 应用准备就绪后的处理
 */
const setupReady = () => {
  app.whenReady().then(() => {
    registerTitleBarListener();  // 注册标题栏事件监听
    registerContextMenuListener();  // 注册上下文菜单事件监听
    electronApp.setAppUserModelId('com.zyfun');  // 设置应用用户模型ID
    optimizer.registerFramelessWindowIpc();  // 注册无边框窗口IPC
    setupSession(); // 网络请求拦截器
    autoUpdater(); // 检测更新
    ipcListen(); // ipc通讯
    createTray(); // 系统托盘 必须 tray 先加载 否则加载不出 menu
    createMenu(); // 菜单
    protocolResgin(); // 协议注册
    createMain(); // 主窗口
    serverInit(); // 启动后端
    webdev.cronSyncWebdev(); // 同步webdev

    // 设置安全dns-doh
    if (globalThis.variable?.dns) {
      logger.info(`[dns] doh: ${globalThis.variable.dns}`);
      app.configureHostResolver({
        secureDnsMode: 'secure',
        secureDnsServers: [globalThis.variable.dns],
      });
    };
    if (globalThis.variable.debug) dbServer();  // 初始化数据库服务
    if (globalThis.variable.recordShortcut) globalShortcut.register({
      shortcut: globalThis.variable.recordShortcut,
      func: toggleWinVisable,
      name: 'boss',
      override: true,
    });  // 注册老板键
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMain();
  });

  app.on('window-all-closed', () => {
    nativeTheme.removeAllListeners('updated');
    globalShortcut.clear();
    if (!platform.isMacOS) app.quit();
  });

  // 多实例处理
  app.on('second-instance', () => {
    BrowserWindow.getAllWindows().forEach((win: BrowserWindow) => win.show());
  });
};

const main = async () => {
  // 锁定单例
  if (!app.requestSingleInstanceLock()) return app.quit();

  setupApp();                                 // 应用启动参数
  setupEnv();                                 // 环境变量修复
  await setupCheck();                         // 检查所需路径
  await dbInit();                             // 初始化数据库
  await globalVariable();                     // 设置全局变量
  setupReady();                               // 注册事件监听
};

main();
