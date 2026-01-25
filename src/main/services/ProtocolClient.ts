import { join } from 'node:path';

import { loggerService } from '@logger';
import { createDir, saveFile } from '@main/utils/file';
import { APP_EXE_PATH, APP_HOME_PATH } from '@main/utils/path';
import { execAsync } from '@main/utils/shell';
import { isLinux } from '@main/utils/systeminfo';
import { APP_NAME, APP_NAME_ALIAS } from '@shared/config/appinfo';
import { LOG_MODULE } from '@shared/config/logger';

import { windowService } from './WindowService';

const logger = loggerService.withContext(LOG_MODULE.APP_PROTOCOL);

export function registerProtocolClient(app: Electron.App) {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(APP_NAME_ALIAS, process.execPath, [process.argv[1]]);
    }
  }

  app.setAsDefaultProtocolClient(APP_NAME_ALIAS);
}

export function handleProtocolUrl(url: string) {
  // if (!url) return;
  // Process the URL that was used to open the app
  // The url will be in the format: zy://data?param1=value1&param2=value2

  // Parse the URL and extract parameters
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);

  // switch (urlObj.hostname.toLowerCase()) {
  //   case 'data':
  //     return;
  // }

  // You can send the data to your renderer process
  const mainWindow = windowService.getWindow('main');

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('protocol-data', {
      url,
      params: Object.fromEntries(params.entries()),
    });
  }
}

/**
 * Sets up deep linking for the AppImage build on Linux by creating a .desktop file.
 * This allows the OS to open zy:// URLs with this App.
 */
export async function setupAppImageDeepLink(): Promise<void> {
  // Only run on Linux and when packaged as an AppImage
  if (!isLinux || !process.env.APPIMAGE) {
    return;
  }

  logger.debug('AppImage environment detected on Linux, setting up deep link.');

  try {
    const appPath = APP_EXE_PATH;
    if (!appPath) {
      logger.error('Could not determine App path.');
      return;
    }

    const homeDir = APP_HOME_PATH;
    const applicationsDir = join(homeDir, '.local', 'share', 'applications');
    const desktopFilePath = join(applicationsDir, `${APP_NAME}-url-handler.desktop`);

    // Ensure the applications directory exists
    await createDir(applicationsDir);

    // Content of the .desktop file
    // %U allows passing the URL to the application
    // NoDisplay=true hides it from the regular application menu
    const desktopFileContent = `[Desktop Entry]
Type=Application
Name=${APP_NAME}
Exec=${escapePathForExec(appPath)} %U
Terminal=false
MimeType=x-scheme-handler/${APP_NAME_ALIAS};
NoDisplay=true
`;

    // Write the .desktop file (overwrite if exists)
    await saveFile(desktopFilePath, desktopFileContent, 'utf8');
    logger.debug(`Created/Updated desktop file: ${desktopFilePath}`);

    // Update the desktop database
    // It's important to update the database for the changes to take effect
    try {
      const { stdout, stderr } = await execAsync(`update-desktop-database ${escapePathForExec(applicationsDir)}`);
      if (stderr) {
        logger.warn(`update-desktop-database stderr: ${stderr}`);
      }
      logger.debug(`update-desktop-database stdout: ${stdout}`);
      logger.debug('Desktop database updated successfully.');
    } catch (updateError) {
      logger.error('Failed to update desktop database:', updateError as Error);
      // Continue even if update fails, as the file is still created.
    }
  } catch (error) {
    // Log the error but don't prevent the app from starting
    logger.error('Failed to setup AppImage deep link:', error as Error);
  }
}

/**
 * Escapes a path for safe use within the Exec field of a .desktop file
 * and for shell commands. Handles spaces and potentially other special characters
 * by quoting.
 */
function escapePathForExec(filePath: string): string {
  // Simple quoting for paths with spaces.
  return `'${filePath.replace(/'/g, "'\\''")}'`;
}
