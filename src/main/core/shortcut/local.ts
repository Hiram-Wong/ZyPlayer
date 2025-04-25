import * as localShortcutModule from 'electron-localshortcut';
import { getWin, getAllWin } from '@main/core/winManger';
import logger from '@main/core/logger';

type RegisterParams = {
  win: string | Electron.BrowserWindow;
  shortcut: Electron.Accelerator | Electron.Accelerator[];
  func: () => void;
  name: string;
  override?: boolean;
};

type UnregisterParams = {
  win: string | Electron.BrowserWindow;
  shortcut?: Electron.Accelerator | Electron.Accelerator[];
  name?: string | string[];
};

type IsRegisteredParams = {
  win: string | Electron.BrowserWindow;
  shortcut?: Electron.Accelerator;
  name?: string;
};

const shortcutPool = new Map<string, Electron.Accelerator | Electron.Accelerator[]>();

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

export default localShortcut;
