import { BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from './log';

// log.info(autoUpdater.app.baseCachePath);
// 自动下载更新
autoUpdater.autoDownload = false;
// 退出时自动安装更新
autoUpdater.autoInstallOnAppQuit = false;

export default (win: BrowserWindow) => {
  // fix download error when old version update file already exists
  function downloadUpdate() {
    autoUpdater.downloadUpdate().catch((err: any) => {
      if (err.message && err.message.includes('file already exists') && err.path) {
        // delDir(err.path);
        log.info('downloadUpdate');
        downloadUpdate();
      } else {
        log.error(`update-error:${err}`);
        win.webContents.send('update-error', err);
      }
    });
  }

  // 主进程监听检查更新事件
  ipcMain.on('checkForUpdate', () => {
    log.info('checkForUpdate');
    autoUpdater.checkForUpdates().catch((err: any) => {
      log.error(`update-error:${err}`);
      win.webContents.send('update-error', err);
    });
  });

  // 主进程监听开始下载事件
  ipcMain.on('downloadUpdate', () => {
    log.info('downloadUpdate');
    downloadUpdate();
  });

  // 主进程监听退出并安装事件
  ipcMain.on('quitAndInstall', () => {
    log.info('quitAndInstall');
    autoUpdater.quitAndInstall();
  });

  // 开始检测是否有更新
  autoUpdater.on('checking-for-update', () => {
    log.info('checking-for-update');
    win.webContents.send('checking-for-update');
  });

  // 检测到有可用的更新
  autoUpdater.on('update-available', (info: any) => {
    log.info(`update-available:${info}`);
    win.webContents.send('update-available', info);
  });

  // 没有检测到有可用的更新
  autoUpdater.on('update-not-available', () => {
    log.info('update-not-available');
    win.webContents.send('update-not-available');
  });

  // 更新出错
  autoUpdater.on('update-error', (err: any) => {
    win.webContents.send('update-error', err);
  });

  // 监听下载进度
  autoUpdater.on('download-progress', (progress: any) => {
    log.info(`download-progress:${progress.percent}/${Math.trunc(progress.percent)}`);
    win.webContents.send('download-progress', Math.trunc(progress.percent));
  });

  // 下载完成
  autoUpdater.on('update-downloaded', () => {
    log.info('update-downloaded');
    win.webContents.send('update-downloaded');
  });
};
