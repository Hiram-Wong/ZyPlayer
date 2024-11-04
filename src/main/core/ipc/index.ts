import { electronApp, is, platform } from '@electron-toolkit/utils';
import { exec } from 'child_process';
import { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme, shell } from 'electron';
import fs from 'fs-extra';
import { join } from 'path';
import logger from '@main/core/logger';
import puppeteerInElectron from '@main/utils/sniffer';
import { toggleWindowVisibility } from '@main/utils/tool';
import { createMain, createPlay, getWin } from '@main/core/winManger';

const tmpDir = async (path: string) => {
  try {
    const pathExists = await fs.pathExistsSync(path);
    logger.info(`[ipcMain] tmpDir: ${path}-exists-${pathExists}`);
    if (pathExists) {
      await fs.removeSync(path); // 删除文件, 不存在不会报错
    }
    await fs.emptyDirSync(path); // 清空目录, 不存在自动创建
    logger.info(`[ipcMain] tmpDir: ${path}-created-success`);
  } catch (err) {
    logger.error(err);
  }
};

const ipcListen = () => {
  ipcMain.on('uninstall-shortcut', () => {
    logger.info(`[ipcMain] globalShortcut unregisterAll`);
    globalShortcut.unregisterAll();
  });

  ipcMain.on('toggle-selfBoot', (_, status) => {
    logger.info(`[ipcMain] set-selfBoot: ${status}`);
    electronApp.setAutoLaunch(status);
  });

  ipcMain.on('open-proxy-setting', () => {
    logger.info(`[ipcMain] open-proxy-setting`);
    if (platform.isWindows) shell.openPath('ms-settings:network-proxy');
    if (platform.isMacOS) shell.openExternal('x-apple.systempreferences:com.apple.preference.network?Proxies');
    if (platform.isLinux) shell.openPath('gnome-control-center network');
  });

  ipcMain.on('call-player', (_, path: string, url: string) => {
    if (url && path) {
      const command = `${path} "${url}"`;
      exec(command);
      logger.info(`[ipcMain] call-player: command:${command}`);
    }
  });

  const getFolderSize = (folderPath: string): number => {
    let totalSize = 0;

    if (fs.existsSync(folderPath)) {
      const entries = fs.readdirSync(folderPath);

      for (const entry of entries) {
        const entryPath = join(folderPath, entry);
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

  ipcMain.on('tmpdir-manage', (event, action, trails) => {
    let formatPath = join(app.getPath('userData'), trails);
    if (action === 'rmdir' || action === 'mkdir' || action === 'init') tmpDir(formatPath);
    if (action === 'make') fs.ensureDirSync(formatPath);
    if (action === 'size') event.reply('tmpdir-manage-size', getFolderSize(formatPath));
  });

  ipcMain.handle('ffmpeg-thumbnail', async (_, url, key) => {
    const ua = global.variable.ua;
    const formatPath = is.dev
      ? join(process.cwd(), 'thumbnail', `${key}.jpg`)
      : join(app.getPath('userData'), 'thumbnail', `${key}.jpg`);

    const ffmpegCommand = 'ffmpeg'; // ffmpeg 命令
    const inputOptions = ['-i', url]; // 输入选项，替换为实际视频流 URL
    const outputOptions = [
      '-y', // 使用 -y 选项强制覆盖输出文件
      '-frames:v',
      '1',
      '-q:v',
      '20', // 设置输出图片质量为5
      '-user_agent',
      `"${ua}"`,
      `"${formatPath}"`,
    ];
    const command = [ffmpegCommand, ...outputOptions, ...inputOptions].join(' '); // 确保 -user_agent 选项位于输入 URL 之前

    try {
      await exec(command);
      const isGenerat = fs.existsSync(formatPath);
      logger.info(`[ipcMain] ffmpeg-thumbnail status:${isGenerat} command:${command}`);
      return {
        key,
        url: `file://${formatPath}`,
      };
    } catch (err) {
      logger.error(`[ipcMain] Error generating thumbnail: ${err}`);
      return {
        key,
        url: '',
      };
    }
  });

  ipcMain.handle('ffmpeg-installed-check', async () => {
    try {
      const { stdout } = await exec('ffmpeg -version');
      logger.info(`[ipcMain] FFmpeg is installed. ${stdout}`);
      return true;
    } catch (err) {
      logger.error(`[ipcMain] Error Ffmpeg Installed Check: ${err}`);
      return false;
    }
  });

  ipcMain.handle(
    'sniffer-media',
    async (_, url, run_script, init_script, custom_regex, sniffer_exclude, is_pc = false) => {
      const res = await puppeteerInElectron(url, run_script, init_script, custom_regex, sniffer_exclude, is_pc);
      return res;
    },
  );

  ipcMain.handle('read-file', async (_, path) => {
    const fileContent = await fs.readFileSync(path, 'utf8').toString();
    const res = fileContent ? fileContent : '';
    logger.info(res);

    return res;
  });

  ipcMain.on('open-url', async (_, url) => {
    shell.openExternal(url);
  });

  ipcMain.on('open-path', async (_, file, create) => {
    const path = join(app.getPath('userData'), file);
    // 查看目录是否存在，如果不存在，就创建一个
    if (create) fs.ensureDirSync(path);
    shell.openPath(path);
  });

  ipcMain.handle('read-path', async (_, type) => {
    const path = app.getPath(type);
    return path;
  });

  ipcMain.handle('path-join', (_, fromPath, toPath) => {
    return join(fromPath, toPath);
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

  ipcMain.on('update-shortcut', (_, shortcut) => {
    logger.info(`[ipcMain] storage-shortcuts: ${shortcut}`);
    globalShortcut.unregisterAll();
    logger.info(`[ipcMain] globalShortcut-install: ${shortcut}`);
    globalShortcut.register(shortcut, () => {
      toggleWindowVisibility();
    });
    global.variable.recordShortcut = shortcut;
  });

  ipcMain.on('manage-win', (_, winName, action) => {
    logger.info(`[ipcMain] ${winName} action is ${action}`);
    const win = getWin(winName);

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

  ipcMain.on('update-global', (_, key, value) => {
    logger.info(`[ipcMain] update-global: key: ${key} - value: ${value}`);
    if (Object.keys(global.variable).includes(key)) {
      global.variable[key] = value;
    }
  });

  // 事件广播通知
  ipcMain.handle('event-broadcast', (event, eventInfo) => {
    // 遍历window执行
    for (const currentWin of BrowserWindow.getAllWindows()) {
      // 注意，这里控制了发送广播的窗口，不触发对应事件，如果需要自身也触发的话，删除if内的逻辑即可
      if (event) {
        const webContentsId = currentWin.webContents.id;
        if (webContentsId === event.sender.id) {
          continue;
        }
      }
      currentWin.webContents.send(eventInfo.channel, eventInfo.body);
    }
  });

  // 主题更新事件
  nativeTheme.on('updated', () => {
    const isDarkMode = nativeTheme.shouldUseDarkColors;
    const mainWin = getWin('main');
    const playWin = getWin('play');
    if (mainWin) mainWin.webContents.send('system-theme-updated', `${isDarkMode ? 'dark' : 'light'}`);
    if (playWin) playWin.webContents.send('system-theme-updated', `${isDarkMode ? 'dark' : 'light'}`);
    logger.info(`[nativeTheme] System-theme-updated: ${isDarkMode ? 'dark' : 'light'} ; send to vue app`);
  });
};

export { ipcListen, tmpDir };
