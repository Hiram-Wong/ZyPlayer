import { is } from '@electron-toolkit/utils';
import { app, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import fs from 'fs-extra';
import { resolve, join } from 'path';
import logger from '@main/core/logger';

import { getWin } from '@main/core/winManger';

const updaterCacheDirName = 'zyfun-updater';
const updatePath = join(app.getAppPath(), updaterCacheDirName, 'pending');
logger.info(`[update][init] path:${updatePath}`);

if (is.dev) {
  Object.defineProperty(app, 'isPackaged', {
    get() {
      return true;
    },
  });
  autoUpdater.updateConfigPath = resolve(__dirname, '../../dev-app-update.yml');
}

autoUpdater.autoDownload = false; // 关闭自动下载
autoUpdater.autoInstallOnAppQuit = false; // 关闭自动安装

export default () => {
  // 通用的IPC发送函数
  const sendUpdateMessage = (channel: string, message?: any) => {
    const win = getWin('main');
    if (win) win.webContents.send(channel, message);
  };

  // 下载更新的函数，包含错误处理逻辑
  const downloadUpdate = async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch (e: any) {
      if (e.message && e.message.includes('file already exists') && e.path) {
        fs.emptyDirSync(e.path);
        logger.info('[update] error: old version file already exists');
        downloadUpdate();
      } else {
        logger.error(`[update] error: ${e}`);
        sendUpdateMessage('update-error', e);
      }
    }
  };

  // 主进程监听检查更新事件
  ipcMain.on('checkForUpdate', async () => {
    logger.info('checkForUpdate');
    try {
      await autoUpdater.checkForUpdates();
    } catch (e: any) {
      logger.error(`[update] error: ${e}`);
      sendUpdateMessage('update-error', e);
    }
  });

  // 主进程监听开始下载事件
  ipcMain.on('downloadUpdate', () => {
    logger.info('[update] download update');
    downloadUpdate();
  });

  // 主进程监听退出并安装事件
  ipcMain.on('quitAndInstall', () => {
    logger.info('[update] quit and install');
    autoUpdater.quitAndInstall();
  });

  // 监听各类更新事件并发送IPC消息
  autoUpdater.on('checking-for-update', () => {
    logger.info('[update] checking update');
    sendUpdateMessage('checking-for-update');
  });

  autoUpdater.on('update-available', (info: any) => {
    logger.info(`[update] available: ${info}`);
    sendUpdateMessage('update-available', info);
  });

  autoUpdater.on('update-not-available', () => {
    logger.info('[update] not available');
    sendUpdateMessage('update-not-available');
  });

  autoUpdater.on('error', (e: Error) => {
    logger.error(`[update] error: ${e}`);
    sendUpdateMessage('error', e);
  });

  autoUpdater.on('download-progress', (progress: any) => {
    const percent = Math.trunc(progress.percent);
    logger.info(`[update] download progress: ${percent}%`);
    sendUpdateMessage('download-progress', percent);
  });

  autoUpdater.on('update-downloaded', () => {
    logger.info('[update] downloaded');
    sendUpdateMessage('update-downloaded');
  });
};
