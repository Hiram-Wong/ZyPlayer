import { configManager } from '@main/services/ConfigManager';
import { dbService } from '@main/services/DbService';
import { windowService } from '@main/services/WindowService';
import { titleBarOverlayDark, titleBarOverlayLight } from '@shared/config/appinfo';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import type { ITheme } from '@shared/config/theme';
import { THEME } from '@shared/config/theme';
import { nativeTheme } from 'electron';

export class ThemeService {
  private static instance: ThemeService;
  private theme: ITheme = THEME.SYSTEM;

  constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static async getInstance(): Promise<ThemeService> {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
      ThemeService.instance.init();
    }
    return ThemeService.instance;
  }

  private init() {
    this.theme = configManager.theme || THEME.SYSTEM;

    if (this.theme === THEME.DARK || this.theme === THEME.LIGHT || this.theme === THEME.SYSTEM) {
      nativeTheme.themeSource = this.theme;
    }

    nativeTheme.on('updated', this.themeUpdatedHandler.bind(this));
  }

  private themeUpdatedHandler() {
    windowService.getAllWindows().forEach((win) => {
      if (win && !win.isDestroyed() && win.setTitleBarOverlay) {
        try {
          win.setTitleBarOverlay(nativeTheme.shouldUseDarkColors ? titleBarOverlayDark : titleBarOverlayLight);
        } catch {
          // don't throw error if setTitleBarOverlay failed
          // Because it may be called with some windows have some title bar
        }
      }
      win.webContents.send(IPC_CHANNEL.THEME_UPDATED, nativeTheme.shouldUseDarkColors ? THEME.DARK : THEME.LIGHT);
    });
  }

  public async setTheme(theme: ITheme) {
    if (theme === this.theme) {
      return;
    }

    this.theme = theme;
    nativeTheme.themeSource = theme;

    await dbService.setting.update({ key: 'theme', value: theme });
  }
}

export const themeService = ThemeService.getInstance();
