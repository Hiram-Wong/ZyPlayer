import { globalShortcut as globalShortcutModule } from 'electron';
import logger from '@main/core/logger';

type RegisterParams = {
  shortcut: Electron.Accelerator | Electron.Accelerator[];
  func: () => void;
  name: string;
  override?: boolean;
};

type UnregisterParams = {
  name?: string | string[];
  shortcut?: Electron.Accelerator | Electron.Accelerator[];
};

type IsRegisteredParams = {
  shortcut?: Electron.Accelerator;
  name?: string;
};

const shortcutPool = new Map<string, Electron.Accelerator | Electron.Accelerator[]>();

const globalShortcut = {
  register({ shortcut, func, name, override = false }: RegisterParams): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
    shortcuts.forEach(sc => result[sc] = false);

    if (!shortcuts.length || typeof func !== 'function' || !name) {
      logger.warn('[globalShortcut][register] 参数不合法');
      return result;
    }

    if (shortcutPool.has(name)) {
      if (!override) {
        logger.warn(`[globalShortcut][register] 名称已存在: ${name}`);
        return result;
      }
      this.unregister({ name }); // 先注销
    }

    const successList: Electron.Accelerator[] = [];

    for (const sc of shortcuts) {
      try {
        const ok = globalShortcutModule.register(sc, func);
        result[sc] = ok;
        if (ok) successList.push(sc);
      } catch (err) {
        logger.error(`[globalShortcut][register] 注册失败: ${sc}`, err);
      }
    }

    if (successList.length > 0) {
      shortcutPool.set(name, successList.length === 1 ? successList[0] : successList);
    }

    return result;
  },

  unregister({ name, shortcut }: UnregisterParams): Record<string, boolean> {
    const result: Record<string, boolean> = {};

    // 1. 通过 name 注销
    if (name) {
      const names = Array.isArray(name) ? name : [name];
      for (const n of names) {
        result[n] = false;
        const shortcuts = shortcutPool.get(n);
        if (!shortcuts) continue;

        try {
          if (Array.isArray(shortcuts)) {
            shortcuts.forEach(sc => globalShortcutModule.unregister(sc));
          } else {
            globalShortcutModule.unregister(shortcuts);
          }
          shortcutPool.delete(n);
          result[n] = true;
        } catch (err) {
          logger.error(`[globalShortcut][unregister] name 取消注册失败: ${n}`, err);
        }
      }
    }

    // 2. 通过 shortcut 注销
    if (shortcut) {
      const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
      for (const sc of shortcuts) {
        try {
          globalShortcutModule.unregister(sc);
          result[sc] = true;
        } catch (err) {
          logger.error(`[globalShortcut][unregister] shortcut 取消注册失败: ${sc}`, err);
          result[sc] = false;
        }
      }
    }

    return result;
  },

  clear(): boolean {
    try {
      globalShortcutModule.unregisterAll();
      shortcutPool.clear();
      return true;
    } catch (err) {
      logger.error('[globalShortcut][clear] 取消所有快捷键失败:', err);
      return false;
    }
  },

  isRegistered({ shortcut, name }: IsRegisteredParams): boolean {
    if (!shortcut && !name) return false;
    try {
      if (shortcut) {
        return globalShortcutModule.isRegistered(shortcut);
      }
      return !!shortcutPool.get(name!);
    } catch (err) {
      logger.error(`[globalShortcut][isRegistered] 检查失败: ${shortcut}`, err);
      return false;
    }
  }
};

export default globalShortcut;
