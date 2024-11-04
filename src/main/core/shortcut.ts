import { globalShortcut } from 'electron';
import { toggleWindowVisibility } from '@main/utils/tool';

const customShortcutResgin = (shortcut, func) => {
  if (!shortcut) return;
  globalShortcut.register(shortcut, () => {
    func();
  });
};

const bossShortcutResgin = () => {
  if (global.variable.recordShortcut) {
    globalShortcut.register(global.variable.recordShortcut, () => {
      toggleWindowVisibility();
    });
  }
};

export { customShortcutResgin, bossShortcutResgin };
