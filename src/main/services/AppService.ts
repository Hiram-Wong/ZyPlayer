import { join } from 'node:path';

import { loggerService } from '@logger';
import { createDir, fileDelete, pathExist, saveFile } from '@main/utils/file';
import { APP_EXE_PATH, APP_HOME_PATH } from '@main/utils/path';
import { isLinux, isMacOS, isWindows } from '@main/utils/systeminfo';
import { APP_DESC, APP_NAME } from '@shared/config/appinfo';
import { LOG_MODULE } from '@shared/config/logger';
import { app } from 'electron';

const logger = loggerService.withContext(LOG_MODULE.APP_SERVICE);

class AppService {
  private static instance: AppService;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): AppService {
    if (!AppService.instance) {
      AppService.instance = new AppService();
    }
    return AppService.instance;
  }

  public async setAppLaunchOnBoot(isLaunchOnBoot: boolean): Promise<void> {
    // Set login item settings for windows and mac
    // linux is not supported because it requires more file operations
    if (isWindows || isMacOS) {
      app.setLoginItemSettings({ openAtLogin: isLaunchOnBoot });
    } else if (isLinux) {
      try {
        const autostartDir = join(APP_HOME_PATH, '.config', 'autostart');
        const desktopFile = join(autostartDir, `${APP_NAME}.desktop`);

        if (isLaunchOnBoot) {
          // Ensure autostart directory exists
          const isExist = await pathExist(autostartDir);
          if (!isExist) {
            await createDir(autostartDir);
          }

          // Get executable path
          let executablePath = APP_EXE_PATH;
          if (process.env.APPIMAGE) {
            // For AppImage packaged apps, use APPIMAGE environment variable
            executablePath = process.env.APPIMAGE;
          }

          // Create desktop file content
          const desktopContent = `[Desktop Entry]
  Type=Application
  Name=${APP_NAME}
  Comment=${APP_DESC}
  Exec=${executablePath}
  Icon=${APP_NAME}
  Terminal=false
  StartupNotify=false
  Categories=Video;AudioVideo;
  X-GNOME-Autostart-enabled=true
  Hidden=false`;

          // Write desktop file
          await saveFile(desktopFile, desktopContent);
          logger.info('Created autostart desktop file for Linux');
        } else {
          // Remove desktop file
          await fileDelete(desktopFile);
          logger.info('Removed autostart desktop file for Linux');
        }
      } catch (error) {
        logger.error('Failed to set launch on boot for Linux:', error as Error);
      }
    }
  }
}

export const appService = AppService.getInstance();
