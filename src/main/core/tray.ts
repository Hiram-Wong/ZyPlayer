import { platform } from '@electron-toolkit/utils';
import { Tray, Menu, app, nativeImage } from "electron";
import { join } from "path";
import logger from './logger';

/**
 * 创建系统托盘
 * @param {BrowserWindow} win - 程序窗口
 */
const createSystemTray = (win) => {
  // 系统托盘
  const mainTray = new Tray(
    nativeImage.createFromPath(
      join(app.getAppPath(), 'resources',
        platform.isWindows
          ? "img/icons/logo.png"
          : "img/icons/tray_dark.png",
      )
    ).resize({ width: 16, height: 16 })
  );
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