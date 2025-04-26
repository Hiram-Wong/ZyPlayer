import { electronApp, platform } from '@electron-toolkit/utils';
import { exec } from 'child_process';
import { app, BrowserWindow, dialog, ipcMain, nativeTheme, session, shell } from 'electron';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { promisify } from 'util';
import logger from '@main/core/logger';
import { globalShortcut } from '@main/core/shortcut';
import puppeteerInElectron from '@main/utils/sniffer';
import { toggleWinVisable } from '@main/utils/tool';
import { createMain, createPlay, getWin, getAllWin } from '@main/core/winManger';
import { createDir, deleteDir, deleteFile, saveFile, fileExist, fileSize, fileState, readFile } from '@main/utils/hiker/file';
import { getAppDefaultPath, APP_STORE_PATH, APP_TMP_PATH } from '@main/utils/hiker/path';

const execAsync = promisify(exec);

const ipcListen = () => {
  // 设置开机自启
  ipcMain.on('toggle-selfBoot', (_, status) => {
    logger.info(`[ipcMain][selfBoot] status:${status}`);
    electronApp.setAutoLaunch(status);
  });

  // 打开系统代理设置
  ipcMain.on('open-proxy-setting', () => {
    logger.info(`[ipcMain][proxy-setting] open`);
    if (platform.isWindows) shell.openPath('ms-settings:network-proxy');
    if (platform.isMacOS) shell.openExternal('x-apple.systempreferences:com.apple.preference.network?Proxies');
    if (platform.isLinux) shell.openPath('gnome-control-center network');
  });

  // 打开播放器
  ipcMain.handle('call-player', async (_, doc) => {
    logger.info(`[ipcMain][call-player] args:${JSON.stringify(doc)}`);

    const { url, path } = doc;
    if (!url || !path) return;

    try {
      const command = `${path} "${url}"`;
      logger.info(`[ipcMain][call-player] command:${command}`);
      const { stdout, stderr } = await execAsync(command);

      if (stdout) {
        logger.info(`[ipcMain][call-player] info output:`, stdout);
        return true;
      }

      if (stderr) {
        logger.error(`[ipcMain][call-player] err output:`, stderr);
      }

      return false;
    } catch (err: any) {
      logger.error(`[ipcMain][call-player] err:`, err);
      return false;
    }
  });

  // 文件操作
  ipcMain.handle('manage-file', async (_,  doc) => {
    logger.info('[ipcMain][file] args:', JSON.stringify(doc));

    const rm = async (config) => {
      const { path } = config;
      const pathExists = await fileExist(path);
      if (!pathExists) return false;
      if (await fileState(path) === 'file') return await deleteFile(path)
      else if (await fileState(path) === 'dir') return await deleteDir(path);
      return false;
    }

    const mk = async (config) => {
      const { path } = config;
      const pathExists = await fileExist(path);
      if (pathExists) return false;
      return await createDir(path);
    }

    const write = async (config) => {
      const { path, content } = config;
      const pathExists = await fileExist(path);
      if (pathExists && await fileState(path)!== 'file') return false;
      return await saveFile(path, content);
    }

    const read = async (config) => {
      const { path } = config;
      const pathExists = await fileExist(path);
      if (pathExists) {
        if (await fileState(path) === 'file') return await readFile(path);
        else if (await fileState(path) === 'dir') return [];
      };
      return '';
    }

    const size = async (config) => {
      const { path } = config;
      const pathExists = await fileExist(path);
      if (!pathExists) return 0;
      const seize = await fileSize(path) / 1024 / 1024;
      return seize.toFixed(2);
    }

    const state = async (config) => {
      const { path } = config;
      const pathExists = await fileExist(path);
      if (!pathExists) return 'unknown';
      return await fileState(path);
    }

    const exist = async (config) => {
      const { path } = config;
      return await fileExist(path);
    }

    const { action, config } = doc;
    const methodMap = { rm, mk, write, read, size, state, exist };
    if (!methodMap[action]) return;
    return await methodMap[action](config);
  });

  // ffmpeg生成缩略图
  ipcMain.handle('ffmpeg-thumbnail', async (_, url, key) => {
    const { ua, timeout } = globalThis.variable;
    const basePath = join(APP_TMP_PATH, 'thumbnail');

    if (await fileExist(basePath)) {
      if ((await fileState(basePath)) !== 'dir') await deleteDir(basePath);
    } else {
      await createDir(basePath);
    }

    const formatPath = join(basePath, `${key}.jpg`);

    const ffmpegCommand = 'ffmpeg';
    const inputOptions = ['-user_agent', `"${ua}"`, '-i', `"${url}"`];
    const outputOptions = ['-y', '-frames:v', '1', '-q:v', '20', '-update', '1'];
    const command = [ffmpegCommand, ...inputOptions, ...outputOptions, `"${formatPath}"`].join(' ');
    logger.info(`[ipcMain][ffmpeg-thumbnail] command: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command, { timeout });
      logger.info(`[ipcMain][ffmpeg-thumbnail] output:`, stdout || stderr);

      if (await fileExist(formatPath)) {
        return { key, url: pathToFileURL(formatPath).toString() };
      }
      return { key, url: '' };
    } catch (err: any) {
      logger.error(`[ipcMain][ffmpeg-thumbnail] err:`, err);
      return { key, url: '' };
    }
  });

  // 检查ffmpeg是否安装
  ipcMain.handle('ffmpeg-check', async () => {
    const { timeout } = globalThis.variable;

    try {
      const { stdout, stderr } = await execAsync('ffmpeg -version', { timeout });
      if (stdout.includes('version')) {
        logger.info(`[ipcMain][ffmpeg-check] info output:`, stdout);
        return true;
      }

      if (stderr) {
        logger.error(`[ipcMain][ffmpeg-check] err output:`, stderr);
      }

      return false;
    } catch (err: any) {
      logger.error(`[ipcMain][ffmpeg-check] err:`, err);
      return false;
    }
  });

  // 获取嗅探数据
  ipcMain.handle('sniffer-media', async (_, doc) => {
      const { url, run_script, init_script, custom_regex, sniffer_exclude, headers = {} } = doc;
      const res = await puppeteerInElectron(url, run_script, init_script, custom_regex, sniffer_exclude, headers);
      return res;
    },
  );

  // session
  ipcMain.handle('manage-session', async (_, doc) => {
    logger.info('[ipcMain][session] args:', JSON.stringify(doc));

    const clearCache = async () => {
      return await session.defaultSession.clearCache();
    }

    const clearStorage = async () => {
      return await session.defaultSession.clearStorageData();
    }

    const clearAll = async () => {
      const clearCacheRes = await session.defaultSession.clearCache();
      const clearStorageRes = await session.defaultSession.clearStorageData();
      // @ts-ignore
      return clearCacheRes && clearStorageRes;
    }

    const getSize = async () => {
      const size = await session.defaultSession.getCacheSize() / 1024 / 1024;
      const sizeToMb = size.toFixed(2);
      return sizeToMb;
    }

    const { action } = doc;
    const methodMap = { clearCache, clearStorage, clearAll, getSize };
    if (!methodMap[action]) return;
    return await methodMap[action]();
  });

  // 置顶管理
  ipcMain.handle('manage-pin', (event, doc) => {
    logger.info('[ipcMain][pin] args:', JSON.stringify(doc));

    const status = ({ win }) => {
      return win?.isAlwaysOnTop();
    }

    const set = ({ win, status = false }) => {
      win?.setAlwaysOnTop(status);
      return win?.isAlwaysOnTop();
    }

    const toggle = ({ win }) => {
      const status = win?.isAlwaysOnTop();
      win?.setAlwaysOnTop(!status);
      return !status;
    }

    const methodMap = { status, set, toggle };

    const win = BrowserWindow.fromWebContents(event.sender);
    const { action, config } = doc;
    if (!methodMap?.[action] || win?.isDestroyed()) return;
    return methodMap[action]({ win, ...config });
  });

  // 对话框
  ipcMain.handle('manage-dialog', async (_, doc) => {
    logger.info('[ipcMain][dialog] args:', JSON.stringify(doc));

    const { action, config } = doc;
    if (!dialog?.[action]) return;
    return await dialog[action](config);
  });

  // 打开外部链接
  ipcMain.on('open-url', async (_, url) => {
    logger.info(`[ipcMain] open-url: ${url}`);
    if (url && /^(https?:\/\/)/.test(url)) {
      shell.openExternal(url);
    }
  });

  // 打开路径
  ipcMain.on('open-path', async (_, file) => {
    const path = join(APP_STORE_PATH, file);
    await createDir(path);
    shell.openPath(path);
  });

  // 获取app路径
  ipcMain.handle('get-app-path', async (_, type) => {
    logger.info(`[ipcMain] read-path: ${type}`);
    const types = ['home', 'appData', 'userData', 'sessionData', 'temp', 'exe', 'module', 'desktop', 'documents', 'downloads', 'music', 'pictures', 'videos', 'recent', 'logs', 'crashDumps'];
    if (!types.includes(type)) return '';
    const path = getAppDefaultPath(type);
    return path;
  });

  // path join方法
  ipcMain.handle('path-join', (_, ...args) => {
    logger.info(`[ipcMain] path-join: ${args}`);
    return join(...args);
  });

  // 重启app
  ipcMain.on('reboot-app', () => {
    logger.info(`[ipcMain] reboot-app`);
    app.relaunch();
    app.exit(); // 直接强制关闭
    // app.quit(); // 生命周期, 有回调函数
  });

  // 关闭app
  ipcMain.on('quit-app', () => {
    app.quit();
  });

  // 老板键管理
  ipcMain.handle('manage-boss-shortcut', (_, doc) => {
    logger.info('[ipcMain][bossShortcut] args:', JSON.stringify(doc));

    const register = (config) => {
      const { shortcut, name, override } = config;
      return globalShortcut.register({ shortcut, func: toggleWinVisable, name, override });
    }
    const unRegister = (config) => {
      const { shortcut, name } = config;
      return globalShortcut.unregister({ shortcut, name });
    }
    const isRegistered = (config) => {
      const { shortcut, name } = config;
      return globalShortcut.isRegistered({ shortcut, name });
    }

    const { action, config } = doc;
    const methodMap = { register, unRegister, isRegistered };
    if (!methodMap[action]) return;
    return methodMap[action](config);
  });

  // 窗口管理
  ipcMain.on('manage-win', (_, doc) => {
    logger.info(`[ipcMain][win] args:${JSON.stringify(doc)}`);

    const { win: winName, action } = doc;
    const win = getWin(winName);
    if (!win || win.isDestroyed()) return;

    switch (action) {
      case 'min':
        win?.minimize();
        break;
      case 'max':
        win?.maximize();
        break;
      case 'unmax':
        win?.unmaximize();
        break;
      case 'close':
        win?.close();
        break;
      case 'destroy':
        win?.destroy();
        break;
      case 'hide':
        win?.hide();
        break;
      case 'show':
        win?.show();
        break;
      case 'focus':
        win?.show();
        win?.focus();
        break;
      case 'create':
        winName === 'main' ? createMain() : createPlay();
        break;
      default:
        break;
    }
  });

  ipcMain.on('open-win', (_, doc) => {
    logger.info('[ipcMain][win] args:', JSON.stringify(doc));

    const main = () => {
      const win = getWin('main');
      if (!win || win.isDestroyed()) {
        createMain();
      } else {
        win.show();
        win.focus();
      }
    }

    const play = () => {
      const win = getWin('play');
      if (!win || win.isDestroyed()) {
        createPlay();
      } else {
        win.reload();
        win.show();
        win.focus();
      }
    }

    const { action } = doc;
    const methodMap = { main, play };
    if (!methodMap[action]) return;
    return methodMap[action]();
  });

  // 更新dns
  ipcMain.on('update-dns', (_, item) => {
    logger.info(`[ipcMain][dns] args: ${item}`);

    if (item && /^(https?:\/\/)/.test(item)) {
      app.configureHostResolver({
        secureDnsMode: 'secure',
        secureDnsServers: [item],
      });
    } else {
      app.configureHostResolver({ secureDnsMode: 'off' });
    }
  });

  // 更新全局变量
  ipcMain.on('update-global', (_, doc) => {
    logger.info('[ipcMain][global] args:', JSON.stringify(doc));

    const { key, value } = doc;
    if (Object.keys(globalThis.variable).includes(key)) {
      globalThis.variable[key] = value;
    }
  });

  // 事件广播通知
  ipcMain.handle('event-broadcast', (event, eventInfo) => {
    const windows = getAllWin();
    if (windows.length === 0) return;
    for (const win of windows) {
      // 注意，这里控制了发送广播的窗口，不触发对应事件，如果需要自身也触发的话，删除if内的逻辑即可
      if (event) {
        const webContentsId = win.webContents.id;
        if (webContentsId === event.sender.id) continue;
      }
      win.webContents.send(eventInfo.channel, eventInfo.body);
    }
  });

  // 主题更新事件
  nativeTheme.on('updated', () => {
    const windows = getAllWin();
    if (windows.length === 0) return;
    const isDarkMode = nativeTheme.shouldUseDarkColors;
    windows.forEach((win) => win.webContents.send('system-theme-updated', `${isDarkMode ? 'dark' : 'light'}`));
    logger.info(`[nativeTheme] System-theme-updated: ${isDarkMode ? 'dark' : 'light'} ; send to vue app`);
  });
};

export default ipcListen;
