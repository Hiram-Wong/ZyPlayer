import { platform } from '@electron-toolkit/utils';
import { shell, app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';
import logger from '@main/core/logger';

const createMenu = () => {
  if (!platform.isMacOS) {
    Menu.setApplicationMenu(null);
    return;
  }
  const menuBar: Array<MenuItemConstructorOptions | MenuItem> = [
    {
      label: 'zyfun',
      submenu: [
        {
          label: '关于',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: '重启',
          click: () => {
            app.relaunch();
            app.quit();
          },
        },
        {
          label: '退出',
          accelerator: platform.isMacOS ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' },
      ],
    },
    {
      label: '视图',
      submenu: [
        {
          label: '刷新',
          accelerator: platform.isMacOS ? 'Cmd+R' : 'Ctrl+R',
          click: () => {
            logger.info('[menu] refresh view');
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              focusedWindow.reload();
            }
          },
        },
        { type: 'separator' },
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+=',
          role: 'zoomIn',
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          role: 'zoomOut',
        },
        {
          label: '重置',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetZoom',
        },
        { type: 'separator' },
        { label: '全屏', role: 'togglefullscreen' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '打开控制台',
          accelerator: platform.isMacOS ? 'Cmd+Shift+I' : 'Ctrl+Shift+I',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              const webContents = focusedWindow.webContents;
              webContents && webContents.toggleDevTools();
            }
          },
        },
        {
          label: '访问Github',
          click: () => {
            const url = 'https://github.com/Hiram-Wong/ZyPlayer';
            shell.openExternal(url);
          },
        },
        {
          label: '打开数据目录',
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+T' : 'Ctrl+Shift+T',
          click: () => {
            shell.openPath(app.getPath('userData'));
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
};

logger.info('[menu][init]');
export default createMenu;
