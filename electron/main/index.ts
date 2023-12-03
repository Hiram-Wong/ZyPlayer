import remote from '@electron/remote/main';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme, protocol, shell } from 'electron';
import fixPath from 'fix-path';
import pie from "puppeteer-in-electron";
import puppeteer from "puppeteer-core";
import Store from 'electron-store';
import path from 'path';
import url from 'url';
import fs from 'fs-extra';
import { exec } from 'child_process';

import { registerAppMenu } from './core/menu';
import initUpdater from './core/auto-update';
import log from './core/log';

/**
 * fix env is important
 * fix before => '/usr/bin'
 * fix after => '/usr/local/bin:/usr/bin'
 */
fixPath();
log.info(`[env] ${process.env.PATH}`);

const { platform } = process;
const appDataPath = app.getPath('userData');

log.info(`[storage] storage location: ${appDataPath}`);
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

// 保持window对象的: BrowserWindow | null全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let loadWindow: BrowserWindow | null;
let mainWindow: BrowserWindow | null;
let playWindow: BrowserWindow | null;
let snifferWindow: BrowserWindow | null;
let isHidden = true;

nativeTheme.on('updated', () => {
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  if (mainWindow) mainWindow.webContents.send('system-theme-updated', `${isDarkMode ? 'dark' : 'light'}`);
  log.info(`[nativeTheme] System-theme-updated: ${isDarkMode ? 'dark' : 'light'} ; send to vue app`);
});

// 加载loading页面窗口
const showLoading = () => {
  loadWindow = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 640,
    minHeight: 640,
    titleBarStyle: 'hiddenInset',
    show: false,
    frame: false,
    autoHideMenuBar: true,
    title: 'zyplayer',
  });
  if (is.dev) {
    loadWindow.loadFile(path.join(__dirname, '../../public/load.html'))
  } else {
    loadWindow.loadFile(path.join(__dirname, '../../dist/load.html'))
  }
  loadWindow.on('ready-to-show', () => {
    loadWindow.show();
  });
};

pie.initialize(app);

const trySniffer = async (url, callback) => {
  log.info(`[sniffer] sniffer url: ${url}`);

  let timeout = null;

  const handleResponse = (code, message, data) => {
    clearTimeout(timeout);
    timeout = null;
    log.info(`[sniffer] ${message}: ${data}`);
    callback({ code: code, message: message, data });
  };

  try {
    const browser = await pie.connect(app, puppeteer as any); // 连接puppeteer
    const snifferWindow = new BrowserWindow({ show: false }); // 创建窗口
    const page = await pie.getPage(browser, snifferWindow); // 获取页面

    if (ua) await page.setUserAgent(ua); // 设置ua

    await page.setRequestInterception(true); // 开启请求拦截

    page.on('request', (req) => {
      if (!timeout) {
        handleResponse(201, 'fail', '定时器不存在');
        req.abort().catch((err) => console.error(err)); // 超时终止请求
        return;
      }

      const reqUrl = req.url(); // 请求地址

      const isExcludedUrl = (reqUrl) => {
        return (
          reqUrl.indexOf('url=http') >= 0 ||
          reqUrl.indexOf('v=http') >= 0 ||
          reqUrl.indexOf('.css') >= 0 ||
          reqUrl.indexOf('.html') >= 0
        );
      } // 排除url

      const urlRegex = new RegExp('http((?!http).){12,}?\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)\\?.*|http((?!http).){12,}\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*');
      const isVideoUrl = (reqUrl) => {
        return reqUrl.match(urlRegex) && !isExcludedUrl(reqUrl);
      } // 视频url

      if (isVideoUrl(reqUrl)) {
        const headers = req.headers();
        const { referer, 'user-agent': userAgent } = headers;
        const header = {};

        if (referer) header['referer'] = referer;
        if (userAgent) header['user-agent'] = userAgent;

        page.close();
        browser.disconnect();
        req.abort().catch((err) => console.error(err));
        handleResponse(200, 'sucess', reqUrl);
      }

      if (req.isInterceptResolutionHandled()) return; // 已处理过的请求不再处理
      if (req.resourceType() === 'image') {
        req.abort().catch((err) => console.error(err));
      } else {
        req.continue().catch((err) => console.error(err));
      }
    });

    timeout = setTimeout(async () => {
      await page.close();
      await browser.disconnect();
      handleResponse(201, 'fail', '请求超时');
    }, 15000);

    await page.goto(url).catch((err) => {});
  } catch (e) {
    console.error(e);
    handleResponse(500, 'fail', e);
  }
};

const createWindow = (): void => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 640,
    minHeight: 640,
    titleBarStyle: 'hiddenInset',
    show: false,
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

  // 关闭window时触发下列事件.
  mainWindow.on('closed', (event) => {
    event.preventDefault();
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
    const allowUrlList = ['github.com', 'kuyun.com', 'ky.live', 'enlightent.cn'];
    const urlIsAllowed = allowUrlList.some((url) => details.url.includes(url));

    if (urlIsAllowed) {
      shell.openExternal(details.url);
    }

    return { action: 'deny' };
  });

  if (is.dev) {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

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

  // 注册frameless窗口的ipc
  optimizer.registerFramelessWindowIpc();

  // 为 Windows 设置应用程序用户模型 ID
  electronApp.setAppUserModelId('com.zyplayer');

  // register global shortcuts
  if (shortcuts) {
    globalShortcut.register(shortcuts, () => {
      // Do stuff when Y and either Command/Control is pressed.
      showOrHidden();
    });
  }

  if (doh) {
    app.configureHostResolver({
      secureDnsMode: 'secure',
      secureDnsServers: [doh],
    });
  }

  // 开发中默认按F12打开或关闭Dev Tools
  // 并在生产中忽略 Command 或 Control + R。
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  showLoading();
  tmpDir('thumbnail');
  createWindow();
  registerAppMenu();

  app.on('activate', () => {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      showLoading();
      createWindow();
    }
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

  if (is.dev) {
    playWindow.loadURL('http://localhost:3000/#/play')
  } else {
    playWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../../dist/index.html'),
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
    if (!mainWindow || mainWindow.isDestroyed()) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

ipcMain.on('showMainWin', () => {
  log.info(`[ipcMain] show main windows`);
  if (!mainWindow || mainWindow.isDestroyed()) {
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
  electronApp.setAutoLaunch(status);
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


const getFolderSize = (folderPath: string): number => {
  let totalSize = 0;

  if (fs.existsSync(folderPath)) {
    const entries = fs.readdirSync(folderPath);

    for (const entry of entries) {
      const entryPath = path.join(folderPath, entry);
      const entryStats = fs.statSync(entryPath);

      if (entryStats.isFile()) {
        totalSize += entryStats.size;
      } else if (entryStats.isDirectory()) {
        totalSize += getFolderSize(entryPath);
      }
    }
  }

  return totalSize;
};

const tmpDir = async(path: string) => {
  const pathExists = await fs.pathExistsSync(path);
  if (pathExists) {
    await fs.removeSync(path); // 删除文件, 不存在不会报错
  }
  await fs.emptyDirSync(path); // 清空目录, 不存在自动创建
};

ipcMain.on('tmpdir-manage',  (event, action, trails) => {
  const formatPath = path.join(appDataPath, trails);
  if (action === 'rmdir' || action === 'mkdir' || action === 'init') tmpDir(formatPath);
  if (action === 'size') event.reply("tmpdir-manage-size", getFolderSize(formatPath));
});

ipcMain.on('ffmpeg-thumbnail',  (event, url, key) => {
  const formatPath = path.join(appDataPath, 'thumbnail/', `${key}.jpg`);
  const ffmpegCommand = "ffmpeg"; // ffmpeg 命令
  const inputOptions = ["-i", url]; // 输入选项，替换为实际视频流 URL
  const outputOptions = [
    "-y", // 使用 -y 选项强制覆盖输出文件
    "-frames:v", "1",
    "-q:v", "20", // 设置输出图片质量为5
    `"${formatPath}"`
  ];
  const command = [ffmpegCommand, ...inputOptions, ...outputOptions].join(" ");

  exec(command, (error) => {
    if (error) {
      log.error(`[ipcMain] Error generating thumbnail: ${error}`);
      event.reply("ffmpeg-thumbnail-status", key, false);
    } else {
      const isGenerat = fs.existsSync(formatPath)
      log.info(`[ipcMain] ffmpeg-thumbnail status:${isGenerat} command:${command}`);
      event.reply("ffmpeg-thumbnail-status", key, `file://${formatPath}`);
    }
  });
});

ipcMain.on('ffmpeg-installed-check',  (event) => {
  let isInstall = false;
  // exec 是异步函数
  exec('ffmpeg -version', (error, stdout) => {
    if (error) {
      isInstall = false;
      log.info(`[ipcMain] Error Ffmpeg Installed Check: ${error}`);
    } else {
      isInstall = true;
      log.info(`[ipcMain] FFmpeg is installed. ${stdout}`);
    }
    event.reply("ffmpeg-installed-status", isInstall);
  });
});

ipcMain.on('sniffer-media', (event, url) => {
  trySniffer(url, (res) => {
    console.log(res)
    event.reply("sniffer-status", res);
  });
});

// 重启app
ipcMain.on('relaunch-app', () => {
  app.relaunch();
  app.quit();
});

// 关闭app
ipcMain.on('quit-app', () => {
  app.quit();
});