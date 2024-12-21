import { is } from '@electron-toolkit/utils';
import { enable as renoteEnable } from '@electron/remote/main';
import { attachTitleBarToWindow } from '@electron-uikit/titlebar';
import { app, BrowserWindow, nativeTheme, shell } from 'electron';
import { register as localshortcutRegister, unregisterAll as localshortcutUnregisterAll } from 'electron-localshortcut';
import { join } from 'path';
import url from 'url';
import { setting } from '@main/core/db/service';
import logger from '@main/core/logger';

const winPool = {};
const DEFAULT_WIDTH_MAIN = 1000;
const DEFAULT_HEIGHT_MAIN = 640;
const DEFAULT_WIDTH_PLAY = 875;
const DEFAULT_HEIGHT_PLAY = 550;

const setupMessageTools = (win) => {
  if (is.dev) {
    win.webContents.on('console-message', (_, level, message, line, sourceId) => {
      logger.info(
        `[vue][level: ${level}][file: ${sourceId}][line: ${line}] ${typeof message === 'object' ? JSON.stringify(message) : message}`,
      );
    });
  }
};

const createWin = (name: string, options) => {
  const args = Object.assign({}, options);

  let win = getWin(name);

  if (win && !win.isDestroyed()) {
    if (!win.isVisible()) win.show();
    win!.focus();
    setTimeout(() => {
      win!.reload();
    }, 0);
  } else {
    win = new BrowserWindow(args);
    renoteEnable(win.webContents);
    attachTitleBarToWindow(win);
    win.on('ready-to-show', () => {
      localshortcutRegister(win!, ['CommandOrControl+Shift+I', 'F12'], () => {
        if (win!.webContents.isDevToolsOpened()) {
          win!.webContents.closeDevTools();
        } else {
          win!.webContents.openDevTools({ mode: 'right' });
        }
      });
    });
    win.on('close', () => {
      localshortcutUnregisterAll(win!);
    });
    setupMessageTools(win);
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
  logger.info(`[winManager][getWin]name:${name} id:${id}`);

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
      nodeIntegration: true,
      contextIsolation: false,
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
      nodeIntegration: true,
      contextIsolation: false,
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
