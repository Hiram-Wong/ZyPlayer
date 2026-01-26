import { t } from '@main/services/AppLocale';
import { APP_STORE_PATH } from '@main/utils/path';
import { isLinux, isMacOS, isWindows } from '@main/utils/systeminfo';
import { APP_NAME, APP_VERSION, DOCUMENT_URL, ISSUE_URL, WEBSITE_URL } from '@shared/config/appinfo';
import { WINDOW_NAME } from '@shared/config/windowName';
import { isNil } from '@shared/modules/validate';
import type { MenuItemConstructorOptions } from 'electron';
import { Menu, nativeImage, nativeTheme, shell, Tray } from 'electron';

import icon from '../../../build/tray_icon.png?asset';
import iconDark from '../../../build/tray_icon_dark.png?asset';
import iconLight from '../../../build/tray_icon_light.png?asset';
import { windowService } from './WindowService';

class TrayService {
  private static instance: TrayService;
  private tray: Tray | null = null;
  private contextMenu: Menu | null = null;

  constructor() {}

  public static getInstance(): TrayService {
    if (!TrayService.instance) {
      TrayService.instance = new TrayService();
    }
    return TrayService.instance;
  }

  private createTray() {
    this.destroyTray();

    const iconPath = isMacOS ? (nativeTheme.shouldUseDarkColors ? iconLight : iconDark) : icon;

    const tray = new Tray(iconPath);

    if (isWindows) {
      tray.setImage(iconPath);
    } else if (isMacOS) {
      const image = nativeImage.createFromPath(iconPath);
      const resizedImage = image.resize({ width: 16, height: 16 });
      resizedImage.setTemplateImage(true);
      tray.setImage(resizedImage);
    } else if (isLinux) {
      const image = nativeImage.createFromPath(iconPath);
      const resizedImage = image.resize({ width: 16, height: 16 });
      tray.setImage(resizedImage);
    }

    this.tray = tray;

    this.updateContextMenu();

    this.tray.setToolTip(APP_NAME);

    // only windows and macos support right-click event and popUpContextMenu
    if (isLinux) {
      this.tray.setContextMenu(this.contextMenu);
    } else {
      this.tray.on('right-click', () => {
        if (this.contextMenu) {
          this.tray?.popUpContextMenu(this.contextMenu);
        }
      });
    }

    this.tray.on('click', () => {
      windowService.showAllWindows();
    });
  }

  private updateContextMenu() {
    const template = [
      {
        label: t('system.tray.open', { name: APP_NAME }),
        click: () => windowService.showAllWindows(),
      },
      {
        label: t('system.tray.version', { version: APP_VERSION }),
        enabled: false,
      },
      { type: 'separator' },
      {
        label: t('system.tray.website'),
        click: () => shell.openExternal(WEBSITE_URL),
      },
      {
        label: t('system.tray.document'),
        click: () => shell.openExternal(DOCUMENT_URL),
      },
      {
        label: t('system.tray.reportIssue'),
        click: () => shell.openExternal(ISSUE_URL),
      },
      { type: 'separator' },
      {
        label: t('system.tray.openData'),
        click: () => shell.openPath(APP_STORE_PATH),
      },
      // { label: t('system.view.toggleDevTools'), role: 'toggleDevTools' },
      {
        label: t('system.view.toggleDevTools'),
        click() {
          [WINDOW_NAME.MAIN, WINDOW_NAME.PLAYER, WINDOW_NAME.BROWSER].forEach((name) => {
            const win = windowService.getWindow(name);
            if (isNil(win) || !win?.isDestroyed) return;

            win?.webContents?.toggleDevTools();
          });
        },
      },
      { type: 'separator' },
      { label: t('system.app.quit', { name: APP_NAME }), role: 'quit' },
    ].filter(Boolean) as MenuItemConstructorOptions[];

    this.contextMenu = Menu.buildFromTemplate(template);
  }

  public updateTray(showTray: boolean = false) {
    if (showTray) {
      if (!this.tray) {
        this.createTray();
      } else {
        this.updateContextMenu();
        if (isLinux) {
          this.tray.setContextMenu(this.contextMenu);
        }
      }
    } else {
      this.destroyTray();
    }
  }

  private destroyTray() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

export const trayService = TrayService.getInstance();
