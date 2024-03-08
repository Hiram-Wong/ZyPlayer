import { platform } from '@electron-toolkit/utils';
import { shell, app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';
import { join } from "path";
import logger from './logger';

const createMenu = () => {
  if (!platform.isMacOS) {
    Menu.setApplicationMenu(null);
    return;
  }
  const menuBar: Array<MenuItemConstructorOptions | MenuItem> = [
    {
      label: 'zyplayer',
      submenu: [
        {
          label: '关于',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: '重启',
          click() {
            logger.info('[menu] restart app');
            app.relaunch();
            app.quit();
          },
        },
        {
          label: '退出',
          accelerator: platform.isMacOS ? 'Cmd+Q' : 'Alt+F4',
          click() {
            logger.info('[menu] quit app');
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
          click() {
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
          click() {
            logger.info('[menu] open devlop tool');
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              const webContents = focusedWindow.webContents;
              webContents && webContents.toggleDevTools(); 
            }
          },
        },
        {
          label: '访问官网',
          click() {
            logger.info('[menu] visit official website, url is http://zyplayer.fun/');
            const url = 'http://zyplayer.fun/';
            shell.openExternal(url);
          },
        },
        {
          label: '访问Github',
          click() {
            logger.info('[menu] visit official github, url is https://github.com/Hiram-Wong/ZyPlayer');
            const url = 'https://github.com/Hiram-Wong/ZyPlayer';
            shell.openExternal(url);
          },
        },
        {
          label: '打开日志',
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+T' : 'Ctrl+Shift+T',
          click() {
            const fileName = '/logs/';
            const url = join(app.getPath("userData"), fileName);
            logger.info(`[menu] visit local log, path is ${url}`);
            shell.openPath(url);
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
};

logger.info("[menu] menu module initialized");
export default createMenu;