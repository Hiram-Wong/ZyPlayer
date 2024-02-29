import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import fs from 'fs-extra';
import { resolve, join } from 'path';
import logger from './logger';

const updaterCacheDirName = 'zyplayer-updater';
const updatePath = join(app.getAppPath(), updaterCacheDirName, 'pending');
logger.info(`[update] update module initialized; path: ${updatePath}`);


if (is.dev) {
  Object.defineProperty(app, 'isPackaged', {
    get() {
      return true;
    }
  });
  autoUpdater.updateConfigPath = resolve(__dirname, '../../dev-app-update.yml')
}
autoUpdater.autoDownload = false; // 自动下载更新
autoUpdater.autoInstallOnAppQuit = false; // 退出时自动安装更新

export default (win: BrowserWindow) => {
  // fix download error when old version update file already exists
  const downloadUpdate = () => {
    autoUpdater.downloadUpdate().catch((e: any) => {
      if (e.message && e.message.includes('file already exists') && e.path) {
        fs.emptyDirSync(e.path)
        logger.info('[update] error: old version file already exists');
        downloadUpdate();
      } else {
        logger.error(`[update] error:${e}`);
        win.webContents.send('update-error', e);
      }
    });
  }

  // 主进程监听检查更新事件
  ipcMain.on('checkForUpdate', () => {
    logger.info('checkForUpdate');
    autoUpdater.checkForUpdates().catch((e: Error) => {
      logger.error(`[update] error:${e}`);
      win.webContents.send('update-error', e);
    });
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

  // 开始检测是否有更新
  autoUpdater.on('checking-for-update', () => {
    logger.info('[update] checking update');
    win.webContents.send('checking-for-update');
  });

  // 检测到有可用的更新
  autoUpdater.on('update-available', (info: any) => {
    logger.info(`[update] available:${info}`);
    win.webContents.send('update-available', info);
  });

  // 没有检测到有可用的更新
  autoUpdater.on('update-not-available', () => {
    logger.info('[update] not available');
    win.webContents.send('update-not-available');
  });

  // 更新出错
  autoUpdater.on('error', (e: Error) => {
    logger.error(`[update] error: ${e}`);
    win.webContents.send('error', e);
  });

  // 监听下载进度
  autoUpdater.on('download-progress', (progress: any) => {
    logger.info(`[update] download progress:${progress.percent}/${Math.trunc(progress.percent)}`);
    win.webContents.send('download-progress', Math.trunc(progress.percent));
  });

  // 下载完成
  autoUpdater.on('update-downloaded', () => {
    logger.info('[update] downloaded');
    win.webContents.send('update-downloaded');
  });
};
