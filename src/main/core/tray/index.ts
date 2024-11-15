import { platform } from '@electron-toolkit/utils';
import { BrowserWindow, Tray, Menu, app, nativeImage } from 'electron';
import path from 'path';
import logger from '@main/core/logger';

const showOrHideAllWindows = () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length === 0) return;

  const anyVisible = windows.some((win) => win.isVisible());

  windows.forEach((win) => {
    if (!win.isDestroyed()) {
      if (anyVisible) {
        win.hide();
      } else {
        win.show();
      }
    }
  });
};

const createTrayMenu = () => {
  return Menu.buildFromTemplate([
    {
      label: '显示',
      click() {
        showOrHideAllWindows();
      },
    },
    { type: 'separator' },
    {
      label: '关于',
      role: 'about',
    },
    { type: 'separator' },
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
  // const lightIcon = path.join(app.getAppPath(), 'resources', 'img/icons/', 'tray_light.png');
  const darkIcon = path.join(app.getAppPath(), 'resources', 'img/icons/', 'tray_dark.png');
  const colorIcon = path.join(app.getAppPath(), 'resources', 'img/icons/', 'logo.png');

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
  mainTray.on('click', () => {
    showOrHideAllWindows();
  });

  // Tray menu
  if (!platform.isMacOS) mainTray.setContextMenu(createTrayMenu());
};

logger.info('[tray][init]');
export default createSystemTray;
