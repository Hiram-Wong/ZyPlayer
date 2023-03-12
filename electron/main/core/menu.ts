import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';

export const createMenu = (win: BrowserWindow) => {
  const template: Array<MenuItemConstructorOptions | MenuItem> = [
    {
      label: '帮助',
      submenu: [
        {
          label: '打开开发者工具',
          click: async () => {
            win.webContents.openDevTools();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
