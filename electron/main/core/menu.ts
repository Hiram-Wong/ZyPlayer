import { shell, app, dialog, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';

export const registerAppMenu = (win: BrowserWindow) => {
  const menuBar: Array<MenuItemConstructorOptions | MenuItem> = [
    {
      label: 'zyplayer',
      submenu: [
        {
          label: '关于',
          click() {
            dialog.showMessageBox({
              title: '关于',
              message: `关于 v${app.getVersion()}`,
              detail: '我的世界里不能没有影视',
              icon: '../../../build/icons/64x64.png',
            });
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click() {
            // 退出程序
            app.quit();
          },
        },
      ],
    },
    ,
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
          accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R',
          click() {
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
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+I' : 'Ctrl+Shift+I',
          click() {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow && focusedWindow.toggleDevTools();
          },
        },
        {
          label: '访问官网',
          click() {
            const url = 'http://zyplayer.fun/';
            shell.openExternal(url);
          },
        },
        {
          label: '访问Github',
          click() {
            const url = 'https://github.com/Hiram-Wong/ZyPlayer';
            shell.openExternal(url);
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
};
