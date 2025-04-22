import { platform } from '@electron-toolkit/utils';
import { shell, app, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';
import logger from '@main/core/logger';
import { APP_STORE_PATH } from '@main/utils/hiker/path';

const createMenu = () => {
  if (!platform.isMacOS) {
    Menu.setApplicationMenu(null);
    return;
  }

  const menuBar: Array<MenuItemConstructorOptions | MenuItem> = [
    {
      label: 'zyfun',
      submenu: [
        { label: '关于', role: 'about' },
        { type: 'separator' },
        {
          label: '重启',
          click: () => {
            app.relaunch();
            app.quit();
          },
        },
        { label: '退出', role: 'quit' },
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
        { label: '粘贴并匹配样式', role: 'pasteAndMatchStyle' },
        { label: '删除', role: 'delete' },
        { label: '全选', role: 'selectAll' },
      ],
    },
    {
      label: '显示',
      submenu: [
        { label: '重载', role: 'reload' },
        { label: '强制重载', role: 'forceReload' },
        { label: '切换开发者工具', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '放大', role: 'zoomIn' },
        { label: '缩小', role: 'zoomOut' },
        { label: '重置',  role: 'resetZoom' },
        { type: 'separator' },
        { label: '切换全屏', role: 'togglefullscreen' },
      ],
    },
    {
      label: '窗口',
      role: 'window',
      submenu: [
        { label: '最小化', role: 'minimize' },
        { label: '关闭', role: 'close' },
      ],
    },
    {
      label: '帮助',
      submenu: [
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
            shell.openPath(APP_STORE_PATH);
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
  logger.info('[menu][init] completed');
};

export default createMenu;
