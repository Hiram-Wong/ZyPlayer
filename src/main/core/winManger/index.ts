import { is } from '@electron-toolkit/utils';
import { attachTitleBarToWindow } from '@electron-uikit/titlebar';
import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, nativeTheme, shell } from 'electron';
import { register as localshortcutRegister, unregisterAll as localshortcutUnregisterAll } from 'electron-localshortcut';
import { join } from 'path';
import url from 'url';
import { setting } from '@main/core/db/service';
import logger from '@main/core/logger';

const winPool: { [key: number]: BrowserWindow } = {};
const DEFAULT_WIDTH_MAIN: number = 1000;
const DEFAULT_HEIGHT_MAIN: number = 640;
const DEFAULT_WIDTH_PLAY: number = 875;
const DEFAULT_HEIGHT_PLAY: number = 550;

const createWin = (name: string, options: { [key: string]: any } ) => {
  const { debug } = globalThis.variable;
  const args = Object.assign({}, options);

  let win: BrowserWindow | null = getWin(name);

  if (win && !win.isDestroyed()) {
    if (!win.isVisible()) win.show();
    win!.focus();
    setTimeout(() => win!.reload(), 0);
  } else {
    win = new BrowserWindow(args);
    attachTitleBarToWindow(win);

    win.on('ready-to-show', () => {
      // 开发者
      localshortcutRegister(win!, ['CommandOrControl+Shift+I', 'F12'], () => {
        if (win!.webContents.isDevToolsOpened()) {
          win!.webContents.closeDevTools();
        } else {
          win!.webContents.openDevTools({ mode: 'right' });
        }
        win!.focus();
      });
      // 重载
      localshortcutRegister(win!, ['CommandOrControl+R'], () => {
        win!.reload();
      });
    });

    win.on('close', () => {
      localshortcutUnregisterAll(win!);
    });

    win.on('enter-full-screen', () => {
      win!.webContents.send('fullscreen', win!.isFullScreen());
    });

    win.on('leave-full-screen', () => {
      win!.webContents.send('fullscreen', win!.isFullScreen());
    });

    if (debug) {
      win.webContents.on('console-message', (_, level, message, line, file) => {
        if (message === null || message === undefined) {
          message = 'null';
        } else if (typeof message === 'object') {
          message = JSON.stringify(message, null, 2);
        }
        logger[level < 3 ? 'info' : 'error'](
          `[vue][file: ${file}][line: ${line}]`, message,
        );
      });
    };

    win.webContents.on('context-menu', () => {
      const menu: Array<MenuItemConstructorOptions | MenuItem> = [
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' },
        { type: 'separator' },
        { label: '刷新', role: 'reload' },
      ];
      Menu.buildFromTemplate(menu).popup({ window: win! })
    })

    winPool[name] = win.id;
  }

  return win;
};

const destroyWin = (name: string) => {
  let win = getWin(name);

  if (win && !win.isDestroyed()) {
    win.close();
  }
};

const getWin = (name: string) => {
  const id = winPool[name];
  logger.info(`[winManager][win] name:${name}-id:${id}`);

  if (id) return BrowserWindow.fromId(Number(id));
  return null;
};

const getAllWin = () => BrowserWindow.getAllWindows();

const closeAllWin = () => {
  for (let i in winPool) {
    const win = getWin(i);
    if (win && !win.isDestroyed()) {
      win.close();
    }
  }
  app.quit();
};

const createMain = async () => {
  const db = await getWindowState('main');
  const mainWindow: BrowserWindow = createWin('main', {
    width: db.status ? db.position.width : DEFAULT_WIDTH_MAIN,
    height: db.status ? db.position.height : DEFAULT_HEIGHT_MAIN,
    x: db.status ? db.position.x : null,
    y: db.status ? db.position.y : null,
    minWidth: 1000,
    minHeight: 640,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000' : '#fff',
    titleBarStyle: 'hidden',
    show: false,
    frame: false,
    autoHideMenuBar: true,
    title: 'zyfun',
    trafficLightPosition: { x: 12, y: 20 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false,
      spellcheck: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
    },
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    mainWindow!.webContents.send('blockUrl', details.url);
    if (['github.com', 'openai.com'].some((url) => details.url.includes(url))) {
      shell.openExternal(details.url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show();
  });

  mainWindow.on('close', () => {
    saveWindowState('main');
  });

  mainWindow.on('closed', () => {
    delete winPool['main'];
  });

  mainWindow.webContents.on('did-attach-webview', (_, wc) => {
    wc.setWindowOpenHandler((details) => {
      mainWindow!.webContents.send('blockUrl', details.url);
      return { action: 'deny' };
    });
  });
};

const createPlay = async () => {
  const db = await getWindowState('play');
  const playWindow: BrowserWindow = createWin('play', {
    width: db.status ? db.position.width : DEFAULT_WIDTH_PLAY,
    height: db.status ? db.position.height : DEFAULT_HEIGHT_PLAY,
    x: db.status ? db.position.x : null,
    y: db.status ? db.position.y : null,
    minWidth: 525,
    minHeight: 280,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000' : '#fff',
    titleBarStyle: 'hidden',
    show: false,
    frame: false,
    autoHideMenuBar: true,
    title: 'zyfun-play',
    trafficLightPosition: { x: 12, y: 20 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      spellcheck: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
    },
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    playWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/play`);
  } else {
    playWindow.loadURL(
      url.format({
        pathname: join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true,
        hash: 'play',
      }),
    );
  }

  playWindow!.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  playWindow.on('ready-to-show', () => {
    playWindow!.show();
  });

  playWindow.on('close', () => {
    saveWindowState('play');
    if (playWindow) playWindow.webContents.send('destroy-playerWindow');
  });

  playWindow.on('closed', () => {
    delete winPool['play'];
    const mainWindow = getWin('main');
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMain();
    } else {
      mainWindow.show();
    }
  });
};

const getWindowState = async (name: string) => {
  const db = (await setting.get('windowPosition')) || {
    status: false,
    position_main: { width: DEFAULT_WIDTH_MAIN, height: DEFAULT_HEIGHT_MAIN },
    position_play: { width: DEFAULT_WIDTH_PLAY, height: DEFAULT_HEIGHT_PLAY },
  };
  return name === 'all' ? db : { status: db.status, position: db[`position_${name}`] };
};

const saveWindowState = async (name: string) => {
  const win = getWin(name);
  if (!win) return;
  const bounds = win.getBounds();
  const db = await getWindowState('all');
  db[`position_${name}`] = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  await setting.update(['windowPosition'], db);
};

export { closeAllWin, createWin, destroyWin, createMain, createPlay, getAllWin, getWin };
