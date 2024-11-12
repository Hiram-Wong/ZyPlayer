import { globalShortcut } from 'electron';
import { toggleWindowVisibility } from '@main/utils/tool';

const customShortcutResgin = (shortcut, func) => {
  if (!shortcut) return;
  globalShortcut.register(shortcut, () => {
    func();
  });
};

const bossShortcutResgin = () => {
  if (globalThis.variable.recordShortcut) {
    globalShortcut.register(globalThis.variable.recordShortcut, () => {
      toggleWindowVisibility();
    });
  }
};

export { customShortcutResgin, bossShortcutResgin };
