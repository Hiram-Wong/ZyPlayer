import { globalShortcut as globalShortcutModule } from 'electron';
import * as localShortcutModule from 'electron-localshortcut';
import { getWin, getAllWin } from '@main/core/winManger';

const globalShortcut = {
  register: (shortcut: Electron.Accelerator, func: () => void): void => {
    if (!shortcut || typeof func !== 'function') return;
    globalShortcutModule.register(shortcut, func);
  },
  registerAll: (shortcuts: Electron.Accelerator[], func: () => void): void => {
    if (!Array.isArray(shortcuts) || shortcuts.length === 0 || typeof func !== 'function') return;
    globalShortcutModule.registerAll(shortcuts, func);
  },
  unregister: (shortcut: Electron.Accelerator): void => {
    if (!shortcut) return;
    globalShortcutModule.unregister(shortcut);
  },
  unregisterAll: (): void => {
    globalShortcutModule.unregisterAll();
  },
  isRegistered: (shortcut: Electron.Accelerator): boolean => {
    if (!shortcut) return false;
    return globalShortcutModule.isRegistered(shortcut);
  }
};

const localShortcut = {
  register: (
    win: string | Electron.BrowserWindow,
    shortcut: Electron.Accelerator,
    func: () => void
  ): void => {
    const instance = typeof win === 'string' ? getWin(win) : win;
    if (!instance || instance.isDestroyed() || typeof func !== 'function') return;
    localShortcutModule.register(instance, shortcut, func);
  },
  registerAll: (
    wins: Array<string | Electron.BrowserWindow>,
    shortcuts: Electron.Accelerator[],
    func: () => void
  ): void => {
    if (!Array.isArray(shortcuts) || shortcuts.length === 0 || typeof func !== 'function') return;

    const instances = wins.length === 0 ? getAllWin() : wins.map((win) => (typeof win === 'string' ? getWin(win) : win)).filter(Boolean) as Electron.BrowserWindow[];

    instances.forEach((instance) => {
      localShortcutModule.register(instance!, shortcuts, func);
    });
  },
  unRegister: (
    win: string | Electron.BrowserWindow,
    shortcut: Electron.Accelerator
  ): void => {
    const instance = typeof win === 'string' ? getWin(win) : win;
    if (!instance || instance.isDestroyed()) return;
    localShortcutModule.unregister(instance, shortcut);
  },
  unRegisterAll: (wins: Array<string | Electron.BrowserWindow> = []) => {
    const instances = wins.length === 0 ? getAllWin() : wins.map((win) => (typeof win === 'string' ? getWin(win) : win)).filter(Boolean) as Electron.BrowserWindow[];

    instances.forEach((instance) => {
      localShortcutModule.unregisterAll(instance);
    });
  },
  isRegistered: (
    win: string | Electron.BrowserWindow,
    shortcut: Electron.Accelerator
  ): boolean => {
    const instance = typeof win === 'string' ? getWin(win) : win;
    if (!instance || instance.isDestroyed()) return false;
    return localShortcutModule.isRegistered(instance, shortcut);
  }
}

export { globalShortcut, localShortcut };
