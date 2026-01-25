import { loggerService } from '@logger';
import { LOG_MODULE } from '@shared/config/logger';
import type { IShortcutConfig, IShortcutType } from '@shared/config/shortcut';
import { SHORTCUT_TYPE } from '@shared/config/shortcut';
import { isFunction, isNil, isStrEmpty, isString } from '@shared/modules/validate';
import { globalShortcut } from 'electron';
import * as localShortcut from 'electron-localshortcut';

import { windowService } from './WindowService';

interface IShortcutPool {
  type: IShortcutType;
  winName?: string;
  shortcut: string;
  handler: () => Promise<void> | void;
  callback?: () => Promise<void> | void;
}

const logger = loggerService.withContext(LOG_MODULE.APP_SHORTCUT);

export class ShortcutService {
  private static instance: ShortcutService;
  private shortcutPool = new Map<string, IShortcutPool>();

  constructor() {}

  public static getInstance(): ShortcutService {
    if (!ShortcutService.instance) {
      ShortcutService.instance = new ShortcutService();
    }
    return ShortcutService.instance;
  }

  private shortcutHandler = {
    bossKey: () => windowService.toggleAllWindows(),
  };

  // convert the shortcut recorded by JS keyboard event key value to electron global shortcut format
  // see: https://www.electronjs.org/zh/docs/latest/api/accelerator
  private convertShortcutFormat = (shortcut: string | string[]): string => {
    const keys = Array.isArray(shortcut) ? shortcut : shortcut.split('+').map((k) => k.trim());

    return keys
      .map((key) => {
        switch (key) {
          case 'CommandOrControl':
            return 'CommandOrControl';
          case 'Ctrl':
            return 'Ctrl';
          case 'Alt':
            return 'Alt'; // Use `Alt` instead of `Option`. The `Option` key only exists on macOS, whereas the `Alt` key is available on all platforms.
          case 'Meta':
            return 'Meta'; // `Meta` key is mapped to the Windows key on Windows and Linux, `Cmd` on macOS.
          case 'Shift':
            return 'Shift';
          case 'ArrowUp':
            return 'Up';
          case 'ArrowDown':
            return 'Down';
          case 'ArrowLeft':
            return 'Left';
          case 'ArrowRight':
            return 'Right';
          case 'AltGraph':
            return 'AltGr';
          case 'Slash':
            return '/';
          case 'Semicolon':
            return ';';
          case 'BracketLeft':
            return '[';
          case 'BracketRight':
            return ']';
          case 'Backslash':
            return '\\';
          case 'Quote':
            return "'";
          case 'Comma':
            return ',';
          case 'Minus':
            return '-';
          case 'Equal':
            return '=';
          default:
            return key;
        }
      })
      .join('+');
  };

  public registerGlobal(id: string, config: IShortcutConfig, force: boolean = false): boolean {
    const { type, shortcut: shortcutRaw, handler: handlerRaw, cb } = config;

    if (isNil(id) || type !== SHORTCUT_TYPE.GLOBAL || isNil(shortcutRaw)) return false;

    const shortcut = this.convertShortcutFormat(shortcutRaw);
    const handler = isFunction(handlerRaw)
      ? (handlerRaw as () => Promise<void> | void)
      : (this.shortcutHandler[String(handlerRaw)] ?? (() => {}));

    const fn = () => {
      logger.debug(`Global shortcut triggered: ${shortcut}`);
      handler();
      cb?.();
    };

    if (globalShortcut.isRegistered(shortcut)) {
      if (!force) return false; // already registered

      const entry = [...this.shortcutPool.entries()].find(
        ([, conf]) => conf.type === SHORTCUT_TYPE.GLOBAL && conf.shortcut === shortcut,
      );

      if (!entry) {
        logger.warn(`Global shortcut occupied by system or other app: ${shortcut}`);
        return false;
      } // unregister the existing one

      const [key, conf] = entry;
      globalShortcut.unregister(conf.shortcut);
      if (globalShortcut.isRegistered(conf.shortcut)) {
        logger.warn(`Failed to unregister global shortcut: ${shortcut}`);
        return false;
      }
      this.shortcutPool.delete(key);
    }

    globalShortcut.register(shortcut, fn);
    if (!globalShortcut.isRegistered(shortcut)) return false;

    this.shortcutPool.set(id, { type, shortcut, handler: fn });

    logger.info(`Registered global shortcut: ${shortcut}`);

    return true;
  }

  public registerLocal(id: string, config: IShortcutConfig, force: boolean = false): boolean {
    const { type, winName, shortcut: shortcutRaw, handler: handlerRaw, cb } = config;

    if (isNil(id) || type !== SHORTCUT_TYPE.LOCAL || isNil(shortcutRaw) || isNil(winName)) return false;

    const win = windowService.getWindow(winName);
    if (!win) {
      logger.warn(`Failed to register local shortcut: ${winName} window not found`);
      return false;
    }

    const shortcut = this.convertShortcutFormat(shortcutRaw);
    const handler = isFunction(handlerRaw)
      ? (handlerRaw as () => Promise<void> | void)
      : (this.shortcutHandler[String(handlerRaw)] ?? (() => {}));

    const fn = () => {
      logger.debug(`Local shortcut triggered: ${shortcut} for window: ${winName}`);
      handler();
      cb?.();
    };

    const onWindowClosed = () => {
      if (this.shortcutPool.has(id)) this.shortcutPool.delete(id);
    };
    win.once('closed', onWindowClosed);

    if (localShortcut.isRegistered(win, shortcut)) {
      if (!force) return false; // already registered

      const entry = [...this.shortcutPool.entries()].find(
        ([, conf]) => conf.type === SHORTCUT_TYPE.LOCAL && conf.shortcut === shortcut && conf.winName === winName,
      );

      if (!entry) {
        logger.warn(`Local shortcut occupied by system or other app: ${shortcut} for window: ${winName}`);
        return false;
      } // unregister the existing one

      const [key, conf] = entry;
      localShortcut.unregister(win, conf.shortcut);
      if (localShortcut.isRegistered(win, conf.shortcut)) {
        logger.warn(`Failed to unregister local shortcut: ${shortcut} for window: ${winName}`);
        return false;
      }

      this.shortcutPool.delete(key);
    }

    localShortcut.register(win, shortcut, fn);
    if (!localShortcut.isRegistered(win, shortcut)) return false;

    this.shortcutPool.set(id, { type, winName, shortcut, handler: fn });

    logger.info(`Registered local shortcut: ${shortcut} for window: ${winName}`);

    return true;
  }

  public register(id: string, config: IShortcutConfig, force: boolean = false): boolean {
    if (
      isNil(id) ||
      ![SHORTCUT_TYPE.GLOBAL, SHORTCUT_TYPE.LOCAL].includes(config.type) ||
      !isString(config.shortcut) ||
      isStrEmpty(config.shortcut) ||
      (config.type === SHORTCUT_TYPE.LOCAL && !(isString(config.winName) && !isStrEmpty(config.winName)))
    ) {
      return false;
    }

    if (config.type === SHORTCUT_TYPE.GLOBAL) {
      return this.registerGlobal(id, config, force);
    }
    if (config.type === SHORTCUT_TYPE.LOCAL) {
      return this.registerLocal(id, config, force);
    }
    return false;
  }

  public isRegisteredGlobal(id: string): boolean {
    if (isNil(id)) return false;

    const conf = this.shortcutPool.get(id);
    if (!conf) return false;

    if (!globalShortcut.isRegistered(conf.shortcut)) {
      this.shortcutPool.delete(id);
      return false;
    }

    return true;
  }

  public isRegisteredLocal(id: string, winName: string): boolean {
    if (isNil(id) || !isString(winName) || isStrEmpty(winName)) return false;

    const conf = this.shortcutPool.get(id);
    if (!conf) return false;

    const win = windowService.getWindow(winName);
    if (!win) {
      logger.warn(`Failed to check local shortcut: ${winName} window not found`);
      this.shortcutPool.delete(id);
      return false;
    }

    if (!localShortcut.isRegistered(win, conf.shortcut)) {
      this.shortcutPool.delete(id);
      return false;
    }

    return true;
  }

  public isRegistered(type: IShortcutType, id: string, winName?: string): boolean {
    if (
      isNil(id) ||
      ![SHORTCUT_TYPE.GLOBAL, SHORTCUT_TYPE.LOCAL].includes(type) ||
      (type === SHORTCUT_TYPE.LOCAL && !(isString(winName) && !isStrEmpty(winName)))
    ) {
      return false;
    }

    if (type === SHORTCUT_TYPE.GLOBAL) {
      return this.isRegisteredGlobal(id);
    }
    if (type === SHORTCUT_TYPE.LOCAL) {
      return this.isRegisteredLocal(id, winName!);
    }
    return false;
  }

  public unregisterGlobal(id: string): boolean {
    if (isNil(id)) return true;

    const conf = this.shortcutPool.get(id);
    if (!conf) return true;

    globalShortcut.unregister(conf.shortcut);
    if (globalShortcut.isRegistered(conf.shortcut)) {
      logger.warn(`Failed to unregister global shortcut: ${conf.shortcut}`);
      return false;
    }

    this.shortcutPool.delete(id);

    logger.info(`Unregistered global shortcut: ${conf.shortcut}`);

    return true;
  }

  public unregisterLocal(id: string, winName: string): boolean {
    if (isNil(id) || !isString(winName) || isStrEmpty(winName)) return true;

    const conf = this.shortcutPool.get(id);
    if (!conf) return true;

    const win = windowService.getWindow(winName);
    if (!win) {
      logger.warn(`Failed to unregister local shortcut: ${winName} window not found`);
      this.shortcutPool.delete(id);
      return false;
    }

    localShortcut.unregister(win, conf.shortcut);
    if (localShortcut.isRegistered(win, conf.shortcut)) {
      logger.warn(`Failed to unregister local shortcut: ${conf.shortcut} for window: ${winName}`);
      return false;
    }

    this.shortcutPool.delete(id);

    logger.info(`Unregistered local shortcut: ${conf.shortcut} for window: ${winName}`);

    return true;
  }

  public unregister(type: IShortcutType, id: string, winName?: string): boolean {
    if (
      isNil(id) ||
      ![SHORTCUT_TYPE.GLOBAL, SHORTCUT_TYPE.LOCAL].includes(type) ||
      (type === SHORTCUT_TYPE.LOCAL && !(isString(winName) && !isStrEmpty(winName)))
    ) {
      return true;
    }

    if (type === SHORTCUT_TYPE.GLOBAL) {
      return this.unregisterGlobal(id);
    }
    if (type === SHORTCUT_TYPE.LOCAL) {
      return this.unregisterLocal(id, winName!);
    }
    return true;
  }

  public clear(): void {
    for (const [id, conf] of this.shortcutPool) {
      this.unregister(conf.type, id, conf.winName);
    }

    this.shortcutPool.clear();

    logger.info('Cleared all shortcuts');
  }
}

export const shortcutService = ShortcutService.getInstance();
