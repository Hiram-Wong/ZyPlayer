import { electronApp, platform } from '@electron-toolkit/utils';
import { exec } from 'child_process';
import { app, BrowserWindow, dialog, globalShortcut, ipcMain, nativeTheme, session, shell } from 'electron';
import { join } from 'path';
import util from 'util';
import logger from '@main/core/logger';
import puppeteerInElectron from '@main/utils/sniffer';
import { toggleWindowVisibility } from '@main/utils/tool';
import { createDir, deleteDir, deleteFile, saveFile, fileExist, fileSize, fileState, readFile } from '@main/utils/hiker/file';
import { createMain, createPlay, getWin, getAllWin } from '@main/core/winManger';

const execAsync = util.promisify(exec);

const ipcListen = () => {
  // 设置开机自启
  ipcMain.on('toggle-selfBoot', (_, status) => {
    logger.info(`[ipcMain] set-selfBoot: ${status}`);
    electronApp.setAutoLaunch(status);
  });

  // 打开系统代理设置
  ipcMain.on('open-proxy-setting', () => {
    logger.info(`[ipcMain] open-proxy-setting`);
    if (platform.isWindows) shell.openPath('ms-settings:network-proxy');
    if (platform.isMacOS) shell.openExternal('x-apple.systempreferences:com.apple.preference.network?Proxies');
    if (platform.isLinux) shell.openPath('gnome-control-center network');
  });

  // 打开播放器
  ipcMain.on('call-player', (_, path: string, url: string) => {
    if (url && path) {
      const command = `${path} "${url}"`;
      exec(command);
      logger.info(`[ipcMain] call-player: command:${command}`);
    }
  });

  // 文件操作
  ipcMain.handle('manage-file', async (_, action: string, path: string = '', val: string = '') => {
    logger.info(`[ipcMain] file action is ${action}`);

    switch (action) {
      case 'rm': {
        const pathExists = await fileExist(path);
        if (pathExists) {
          if (await fileState(path) === 'file') await deleteFile(path)
          else if (await fileState(path) === 'dir') await deleteDir(path);
        };
        return;
      }
      case 'mk': {
        const pathExists = await fileExist(path);
        if (!pathExists) await createDir(path);
        return;
      }
      case 'write': {
        const pathExists = await fileExist(path);
        if (pathExists && await fileState(path) !== 'file') return;
        await saveFile(path, val);
        return;
      }
      case 'read': {
        const pathExists = await fileExist(path);
        if (pathExists) {
          if (await fileState(path) === 'file') return await readFile(path);
          else if (await fileState(path) === 'dir') return [];
        };
      }
      case 'size': {
        const seize = await fileSize(path) / 1024 / 1024;
        return seize.toFixed(2);
      }
      case 'state': {
        return await fileState(path);
      }
      case 'exist': {
        return await fileExist(path);
      }
      default:
        return;
    };
  });

  // ffmpeg生成缩略图
  ipcMain.handle('ffmpeg-thumbnail', async (_, url, key) => {
    const { ua, timeout } = globalThis.variable;
    const basePath = join(app.getPath('userData'), 'thumbnail');

    await createDir(basePath);
    const formatPath = join(basePath, `${key}.jpg`);

    const ffmpegCommand = 'ffmpeg';
    const inputOptions = ['-user_agent', `"${ua}"`, '-i', `"${url}"`];
    const outputOptions = ['-y', '-frames:v', '1', '-q:v', '20', '-update', '1'];
    const command = [ffmpegCommand, ...inputOptions, ...outputOptions, `"${formatPath}"`].join(' ');

    try {
      const { stdout, stderr } = await execAsync(command, { timeout });
      logger.info(`[ipcMain] FFmpeg generated success. ${stderr || stdout}`);
      return { key, url: `file://${formatPath}` };
    } catch (err: any) {
      logger.error(`[ipcMain] Error FFmpeg generating thumbnail: ${err.message}`);
      return { key, url: '' };
    }
  });

  // 检查ffmpeg是否安装
  ipcMain.handle('ffmpeg-installed-check', async () => {
    const { timeout } = globalThis.variable;

    try {
      const { stdout, stderr } = await execAsync('ffmpeg -version', { timeout });
      logger.info(`[ipcMain] FFmpeg installed. ${stderr || stdout}`);
      return true;
    } catch (err) {
      logger.error(`[ipcMain] Error checking FFmpeg installation: ${err}`);
      return false;
    }
  });

  // 获取嗅探数据
  ipcMain.handle(
    'sniffer-media',
    async (_, url, run_script, init_script, custom_regex, sniffer_exclude, headers = {}) => {
      const res = await puppeteerInElectron(url, run_script, init_script, custom_regex, sniffer_exclude, headers);
      return res;
    },
  );

  // session
  ipcMain.handle('manage-session', async (_, action) => {
    logger.info(`[ipcMain] session action is ${action}`);
    switch (action) {
      case 'clearCache':
        await session.defaultSession.clearCache();
        return;
      case 'clearStorage':
        await session.defaultSession.clearStorageData();
        return;
      case 'clearAll':
        await session.defaultSession.clearCache();
        await session.defaultSession.clearStorageData();
        return;
      case 'size':
        const getSize = await session.defaultSession.getCacheSize() / 1024 / 1024;
        const formatToMb = getSize.toFixed(2);
        return formatToMb;
      default:
        return;
    }
  });

  // 置顶管理
  ipcMain.handle('manage-pin', (event, action, val: boolean = false) => {
    logger.info(`[ipcMain] pin action is ${action}`);

    switch (action) {
      case 'status': {
        const win = BrowserWindow.fromWebContents(event.sender)
        const status = win?.isAlwaysOnTop();
        return status;
      }
      case 'toggle': {
        const win = BrowserWindow.fromWebContents(event.sender)
        const status = win?.isAlwaysOnTop();
        win?.setAlwaysOnTop(!status);
        return !status;
      }
      case 'set': {
        const win = BrowserWindow.fromWebContents(event.sender)
        win?.setAlwaysOnTop(!val);
        return win?.isAlwaysOnTop();
      }
      default:
        return;
    }
  });

  // 文件对话框
  ipcMain.handle('dialog-file-access', async (_, config) => {
    logger.info(`[ipcMain] dialog-file-access: ${JSON.stringify(config)}`);
    try {
      const result = await dialog.showOpenDialog({
        ...config
      });
      if (result.canceled) return null;
      return result;
    } catch (err: any) {
      logger.error(`[ipcMain] dialog-file-access: ${err.message}`);
      return null;
    };
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
    const path = join(app.getPath('userData'), file);
    await createDir(path);
    shell.openPath(path);
  });

  // 获取app路径
  ipcMain.handle('get-app-path', async (_, type) => {
    logger.info(`[ipcMain] read-path: ${type}`);
    const types = ['home', 'appData', 'userData', 'sessionData', 'temp', 'exe', 'module', 'desktop', 'documents', 'downloads', 'music', 'pictures', 'videos', 'recent', 'logs', 'crashDumps'];
    if (!types.includes(type)) return '';
    const path = app.getPath(type);
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

  ipcMain.on('open-play-win', (_, _arg) => {
    createPlay();
  });

  // 更新快捷键
  ipcMain.on('update-shortcut', (_, shortcut) => {
    logger.info(`[ipcMain] storage-shortcuts: ${shortcut}`);
    globalShortcut.unregisterAll();
    logger.info(`[ipcMain] globalShortcut-install: ${shortcut}`);
    globalShortcut.register(shortcut, () => {
      toggleWindowVisibility();
    });
    globalThis.variable.recordShortcut = shortcut;
  });

  // 取消注册全局快捷键
  ipcMain.on('uninstall-shortcut', () => {
    logger.info(`[ipcMain] globalShortcut unregisterAll`);
    globalShortcut.unregisterAll();
  });

  // 窗口管理
  ipcMain.on('manage-win', (_, winName, action) => {
    logger.info(`[ipcMain] ${winName} action is ${action}`);
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

  // 显示主窗口
  ipcMain.on('show-main-win', () => {
    logger.info(`[ipcMain] show main windows`);
    const win = getWin('main');
    if (!win || win.isDestroyed()) {
      createMain();
    } else {
      win.show();
      win.focus();
    }
  });

  // 更新dns
  ipcMain.on('update-dns', (_, item) => {
    logger.info(`[ipcMain] new dns: ${item}`);
    if (item) {
      app.configureHostResolver({
        secureDnsMode: 'secure',
        secureDnsServers: [item],
      });
    } else {
      app.configureHostResolver({
        secureDnsMode: 'off',
      });
    }
  });

  // 更新全局变量
  ipcMain.on('update-global', (_, key, value) => {
    logger.info(`[ipcMain] update-global: key: ${key} - value: ${value}`);
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
