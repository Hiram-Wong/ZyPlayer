import { globalShortcut } from 'electron';

import { toggleWindowVisibility } from '../utils/tool';

const createDevShortcut = (win) => {
  // 刷新程序
  globalShortcut.register('CmdOrCtrl+Shift+R', () => {
    if (win && win.isFocused()) win?.reload();
  });

  // 打开开发者工具
  globalShortcut.register('CmdOrCtrl+Shift+I', () => {
    if (win && win.isFocused()) {
      win?.webContents.openDevTools({
        mode: 'right',
        activate: true,
      });
    }
  });
};

const createCustomShortcut = (shortcut, func) => {
  if (!shortcut) return;
  globalShortcut.register(shortcut, () => {
    func();
  });
};

const createBossShortcut = (shortcut) => {
  if (!shortcut) return;
  globalShortcut.register(shortcut, () => {
    toggleWindowVisibility();
  });
};

export { createCustomShortcut, createDevShortcut, createBossShortcut };
