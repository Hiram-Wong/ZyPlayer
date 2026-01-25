import { dirname, resolve } from 'node:path';

import { loggerService } from '@logger';
import { getSystemPath } from '@main/utils/path';
import { isPackaged, isWindows } from '@main/utils/systeminfo';
import { getUserAgent } from '@main/utils/tool';
import { APP_VERSION } from '@shared/config/appinfo';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { LOG_MODULE } from '@shared/config/logger';
import { isArray, isArrayEmpty, isStrEmpty, isString } from '@shared/modules/validate';
import type { UpdateInfo } from 'builder-util-runtime';
import { CancellationToken } from 'builder-util-runtime';
import type { BrowserWindow } from 'electron';
import { app } from 'electron';
import type { AppUpdater as _AppUpdater, Logger, NsisUpdater, UpdateCheckResult } from 'electron-updater';
import { autoUpdater } from 'electron-updater';
import TurndownService from 'turndown';

const logger = loggerService.withContext(LOG_MODULE.APP_UPDATE);
const turndownService = new TurndownService();

export default class AppUpdater {
  autoUpdater: _AppUpdater = autoUpdater;
  private releaseInfo: UpdateInfo | undefined;
  private cancellationToken: CancellationToken = new CancellationToken();
  private updateCheckResult: UpdateCheckResult | null = null;

  constructor(mainWindow: BrowserWindow) {
    if (!isPackaged) {
      Object.defineProperty(app, 'isPackaged', {
        get() {
          return true;
        },
      });
      autoUpdater.updateConfigPath = resolve(import.meta.dirname, '../../dev-app-update.yml');
    }

    autoUpdater.logger = logger as Logger;
    autoUpdater.forceDevUpdateConfig = !isPackaged;
    autoUpdater.autoDownload = false; // Disable auto-download
    autoUpdater.autoInstallOnAppQuit = false; // Disable auto-install on app quit
    autoUpdater.disableDifferentialDownload = true; // Disable differential updates
    autoUpdater.requestHeaders = {
      ...autoUpdater.requestHeaders,
      'User-Agent': getUserAgent(),
    };

    autoUpdater.on('error', (error) => {
      logger.error('update error', error as Error);
      mainWindow.webContents.send(IPC_CHANNEL.UPDATE_ERROR, error);
    });

    autoUpdater.on('update-available', (releaseInfo: UpdateInfo) => {
      logger.info('update available', releaseInfo);
      mainWindow.webContents.send(IPC_CHANNEL.UPDATE_AVAILABLE, releaseInfo);
    });

    // when it is detected that there is no need to update
    autoUpdater.on('update-not-available', () => {
      mainWindow.webContents.send(IPC_CHANNEL.UPDATE_NOT_AVAILABLE);
    });

    // update download progress
    autoUpdater.on('download-progress', (progress) => {
      const percent = Math.min(100, Math.max(0, progress.percent));
      mainWindow.webContents.send(IPC_CHANNEL.UPDATE_DOWNLOAD_PROGRESS, percent);
    });

    // when the update is downloaded
    autoUpdater.on('update-downloaded', (releaseInfo: UpdateInfo) => {
      mainWindow.webContents.send(IPC_CHANNEL.UPDATE_DOWNLOADED, releaseInfo);
      this.releaseInfo = releaseInfo;
      logger.info('update downloaded', releaseInfo);
    });

    if (isWindows) {
      (autoUpdater as NsisUpdater).installDirectory = dirname(getSystemPath('exe'));
    }

    this.autoUpdater = autoUpdater;
  }

  public setAutoUpdate(isActive: boolean) {
    autoUpdater.autoDownload = isActive;
    autoUpdater.autoInstallOnAppQuit = isActive;
  }

  public cancelDownload() {
    this.cancellationToken.cancel();
    this.cancellationToken = new CancellationToken();
    if (this.autoUpdater.autoDownload) {
      this.updateCheckResult?.cancellationToken?.cancel();
    }
  }

  public async checkForUpdates() {
    const fallbackResult = {
      isValid: false,
      currentVersion: APP_VERSION,
      lastVersion: APP_VERSION,
      releaseNote: '',
    };

    // If the app is running in portable mode, skip update check
    if (isWindows && 'PORTABLE_EXECUTABLE_DIR' in process.env) {
      return fallbackResult;
    }

    try {
      const result = await this.autoUpdater.checkForUpdates();
      this.updateCheckResult = result;

      const updateInfo = result?.updateInfo;
      const isUpdateAvailable = Boolean(result?.isUpdateAvailable);

      const currentVersion = this.autoUpdater.currentVersion;
      const lastVersion = updateInfo?.version ?? currentVersion;

      logger.info(`[Updater] available=${isUpdateAvailable}, current=${currentVersion}, latest=${lastVersion}`);

      if (!isUpdateAvailable || !isArray(updateInfo?.files) || isArrayEmpty(updateInfo?.files)) {
        return fallbackResult;
      }

      const releaseNotes = updateInfo?.releaseNotes ?? '';
      const releaseNoteMarkdown =
        isString(releaseNotes) && !isStrEmpty(releaseNotes) ? turndownService.turndown(releaseNotes) : '';

      return {
        isValid: true,
        currentVersion,
        lastVersion,
        releaseNote: releaseNoteMarkdown,
      };
    } catch (error) {
      logger.error('Failed to check for update:', error as Error);
      return fallbackResult;
    }
  }

  public install() {
    if (!this.releaseInfo) {
      return;
    }

    app.isQuitting = true;
    setImmediate(() => this.autoUpdater.quitAndInstall());
  }

  public startDownload() {
    if (this.updateCheckResult?.isUpdateAvailable && !this.autoUpdater.autoDownload) {
      // if autoDownload is false, then you need to call the following function again to trigger the download
      // do not use await, because it will block the return of this function
      logger.info('downloadUpdate manual by check for updates', this.cancellationToken);
      this.autoUpdater.downloadUpdate(this.cancellationToken);
    }
  }
}
