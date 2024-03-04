import { platform } from '@electron-toolkit/utils';
import { Tray, Menu, app, nativeImage, nativeTheme } from "electron";
import { join } from "path";
import logger from './logger';

/**
 * 创建系统托盘
 * @param {BrowserWindow} win - 程序窗口
 */
const createSystemTray = (win) => {
  // 设置顶部APP图标的操作和图标
  const lightIcon = join(app.getAppPath(), 'resources', 'img/icons/', 'tray_light.png');
  const darkIcon = join(app.getAppPath(), 'resources', 'img/icons/', 'tray_dark.png');
  const colorIcon = join(app.getAppPath(), 'resources', 'img/icons/', 'logo.png');

  // 系统托盘
  const icon = nativeImage.createFromPath(platform.isWindows ? colorIcon : darkIcon);
  const trayIcon = icon.resize({ width: 16, height: 16 });
  if (platform.isMacOS) trayIcon.setTemplateImage(true);
  const mainTray = new Tray(trayIcon);

  // 应用内菜单
  Menu.setApplicationMenu(createTrayMenu(win));
  mainTray.setToolTip('zyplayer');
  // 左键事件
  mainTray.on("click", () => {
    if (!win.isDestroyed()) {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
      }
    }
  });
  // 托盘菜单
  if (!platform.isMacOS) mainTray.setContextMenu(createTrayMenu(win));
};

// 生成右键菜单
const createTrayMenu = (win) => {
  return Menu.buildFromTemplate([
    {
      label: '显示',
      click() {
        if (!win.isDestroyed()) {
          if (win.isVisible()) {
            win.hide();
          } else {
            win.show();
          }
        }
      },
    },
    { type: 'separator' },
    {
      label: '关于',
      role: 'about',
    },
    { type: 'separator' },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);
};

logger.info("[tray] tray module initialized");
export default createSystemTray;