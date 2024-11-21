import { platform } from '@electron-toolkit/utils';
import { BrowserWindow, Tray, Menu, app, shell, nativeImage } from 'electron';
import { join } from 'path';
import logger from '@main/core/logger';

const showWindows = () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length === 0) return;
  windows.forEach((win) => win.show());
};

const createTrayMenu = () => {
  return Menu.buildFromTemplate([
    {
      label: '打开zyfun',
      click() {
        showWindows();
      },
    },
    {
      label: '打开数据目录',
      click: () => shell.openPath(app.getPath('userData')),
    },
    {
      label: '关于',
      role: 'about',
    },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]);
};

/**
 * Create system tray
 */
const createSystemTray = () => {
  // const lightIcon = join(app.getAppPath(), 'resources', 'img/icons/', 'tray_light.png');
  const darkIcon = join(app.getAppPath(), 'resources', 'img/icons/', 'tray_dark.png');
  const colorIcon = join(app.getAppPath(), 'resources', 'img/icons/', 'logo.png');

  // Create tray icon
  const icon = nativeImage.createFromPath(platform.isMacOS ? darkIcon : colorIcon);
  const trayIcon = icon.resize({ width: 16, height: 16 });
  if (platform.isMacOS) trayIcon.setTemplateImage(true);
  const mainTray = new Tray(trayIcon);

  if (!mainTray) {
    logger.error('[tray] Failed to create tray');
    return;
  }

  // Set application menu
  Menu.setApplicationMenu(createTrayMenu());
  mainTray.setToolTip('zyfun');

  // Left-click event
  mainTray.on('click', () => showWindows());

  // Tray menu
  if (!platform.isMacOS) mainTray.setContextMenu(createTrayMenu());
};

logger.info('[tray][init]');
export default createSystemTray;
