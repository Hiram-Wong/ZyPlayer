import type { Buffer } from 'node:buffer';
import path from 'node:path';

import { loggerService } from '@logger';
import { appLocale } from '@main/services/AppLocale';
import { appService } from '@main/services/AppService';
import AppUpdater from '@main/services/AppUpdater';
import { binaryService } from '@main/services/BinaryService';
import { fastifyService } from '@main/services/FastifyService';
import { fileStorage } from '@main/services/FileStorage';
import { menuService } from '@main/services/MenuService';
import NotificationService from '@main/services/NotificationService';
import { pluginService } from '@main/services/PluginService';
import { proxyManager } from '@main/services/ProxyManager';
import { shortcutService } from '@main/services/ShortcutService';
import { trayService } from '@main/services/TrayService';
import { windowService } from '@main/services/WindowService';
import { createDir, fileDelete, pathExist, readDirFaster, readFile, saveFile } from '@main/utils/file';
import type { IHomePath, ISystemPath, IUserPath } from '@main/utils/path';
import { getHomePath, getSystemPath, getUserPath } from '@main/utils/path';
import { execAsync } from '@main/utils/shell';
import { arch, isLinux, isMacOS, isPortable, isWindows, platform } from '@main/utils/systeminfo';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { LOG_MODULE } from '@shared/config/logger';
import type { INotification } from '@shared/config/notification';
import type { IProxyType } from '@shared/config/setting';
import { PROXY_TYPE } from '@shared/config/setting';
import type { IShortcutConfig, IShortcutType } from '@shared/config/shortcut';
import { WINDOW_NAME } from '@shared/config/windowName';
import type { ILang } from '@shared/locales';
import { isExternal, isHttp, isPositiveFiniteNumber } from '@shared/modules/validate';
import type { ProxyConfig } from 'electron';
import { BrowserWindow, ipcMain, shell, webContents } from 'electron';

const logger = loggerService.withContext(LOG_MODULE.APP_IPC);

export function registerIpc(mainWindow: BrowserWindow, app: Electron.App) {
  const appUpdater = new AppUpdater(mainWindow);

  // api
  ipcMain.handle(IPC_CHANNEL.API_SERVER_START, async () => {
    return await fastifyService.start();
  });

  ipcMain.handle(IPC_CHANNEL.API_SERVER_STOP, async () => {
    return await fastifyService.stop();
  });

  ipcMain.handle(IPC_CHANNEL.API_SERVER_RESTART, async () => {
    return await fastifyService.restart();
  });

  ipcMain.handle(IPC_CHANNEL.API_SERVER_STATUS, () => {
    return fastifyService.status();
  });

  // app
  ipcMain.handle(IPC_CHANNEL.APP_AUTO_LAUNCH, (_, isLaunchOnBoot: boolean) => {
    appService.setAppLaunchOnBoot(isLaunchOnBoot);
  });

  ipcMain.handle(IPC_CHANNEL.APP_DNS, (_, dns: string) => {
    if (isHttp(dns, true)) {
      logger.info(`Set DNS to ${dns}`);
      app.configureHostResolver({
        secureDnsMode: 'secure',
        secureDnsServers: [dns],
      });
    } else {
      app.configureHostResolver({ secureDnsMode: 'off' });
    }
  });

  ipcMain.handle(IPC_CHANNEL.APP_QUIT, () => {
    app.quit();
  });

  ipcMain.handle(IPC_CHANNEL.APP_REBOOT, (_, options?: Electron.RelaunchOptions) => {
    // Fix for .AppImage
    if (isLinux && process.env.APPIMAGE) {
      logger.info(`Relaunching app with options: ${process.env.APPIMAGE}`, options);
      // On Linux, we need to use the APPIMAGE environment variable to relaunch
      // https://github.com/electron-userland/electron-builder/issues/1727#issuecomment-769896927
      options = options || {};
      options.execPath = process.env.APPIMAGE;
      options.args = options.args || [];
      options.args.unshift('--appimage-extract-and-run');
    }
    if (isWindows && isPortable) {
      options = options || {};
      options.execPath = process.env.PORTABLE_EXECUTABLE_FILE;
      options.args = options.args || [];
    }
    app.relaunch(options);
    app.exit(0);
  });

  ipcMain.handle(IPC_CHANNEL.APP_PROXY, async (_, type: IProxyType, proxy?: string, bypass?: string) => {
    let proxyConfig: ProxyConfig;

    if (type === PROXY_TYPE.SYSTEM) {
      // system proxy will use the system filter by themselves
      proxyConfig = { mode: 'system' };
    } else if (proxy) {
      proxyConfig = { mode: 'fixed_servers', proxyRules: proxy, proxyBypassRules: bypass };
    } else {
      proxyConfig = { mode: 'direct' };
    }

    await proxyManager.configureProxy(proxyConfig);
  });

  ipcMain.handle(IPC_CHANNEL.APP_PROXY_SYSTEM, () => {
    if (platform === 'win32') shell.openExternal('ms-settings:network-proxy');
    if (platform === 'darwin') shell.openExternal('x-apple.systempreferences:com.apple.preference.network?Proxies');
    if (platform === 'linux') execAsync('gnome-control-center network'); // xdg-open settings://network
  });

  // binary
  ipcMain.handle(IPC_CHANNEL.BINARY_INSTALL, async (_, binaryName: string[]) => {
    return await binaryService.installBinary(binaryName);
  });

  // business
  ipcMain.handle(IPC_CHANNEL.CALL_PLAYER, async (_, app: string, url: string) => {
    if (!url || !app) return false;
    if (!isHttp(url) && !(await pathExist(url))) return false;

    const quote = (value: string) => {
      if (!value) return `""`;

      const trimmed = value.trim();
      const first = trimmed[0];
      const last = trimmed[trimmed.length - 1];

      if (first === `'` && last === `'`) {
        return `"${trimmed.slice(1, -1)}"`;
      }

      if (first === `"` && last === `"`) {
        return trimmed;
      }

      const cleaned = trimmed.replace(/^['"]|['"]$/g, '');

      return `"${cleaned}"`;
    };

    try {
      if (windowService.getWindow(WINDOW_NAME.PLAYER)) {
        windowService.closeWindow(WINDOW_NAME.PLAYER);
      }

      // Windows: "C:\Program Files\VLC\vlc.exe" "C:\Video\1.mp4"
      // Linux: "/usr/bin/vlc" "http://..."
      // Mac: open -a "/Applications/IINA.app" "http://..."
      const command = isMacOS ? `open -a ${quote(app)} ${quote(url)}` : `${quote(app)} ${quote(url)}`;
      logger.debug(`Calling player with command: ${command}`);

      const { stdout, stderr } = await execAsync(command);
      if (stdout) return true;
      if (stderr) logger.error(`Failed to call player:`, new Error(stderr));

      return false;
    } catch (error) {
      logger.error(`Failed to call player:`, error as Error);
      return false;
    }
  });

  // change
  ipcMain.handle(IPC_CHANNEL.CHANGE_LANG, async (_, lang: ILang) => {
    appLocale.changeLocale(lang);

    menuService.updateMenu(true);
    trayService.updateTray(true);
  });

  // file
  ipcMain.handle(IPC_CHANNEL.FILE_SELECT_FOLDER_DIALOG, (_, options?: Electron.OpenDialogOptions) => {
    return fileStorage.selectFolderDialog(options);
  });

  ipcMain.handle(IPC_CHANNEL.FILE_SELECT_FILE_DIALOG, (_, options?: Electron.OpenDialogOptions) => {
    return fileStorage.selectFileDialog(options);
  });

  ipcMain.handle(IPC_CHANNEL.FILE_SAVE_FILE_DIALOG, (_, options?: Electron.SaveDialogOptions) => {
    return fileStorage.saveFileDialog(options);
  });

  ipcMain.handle(IPC_CHANNEL.FILE_SELECT_FOLDER_READ, (_, options?: Electron.OpenDialogOptions) => {
    return fileStorage.selectFileRead(options);
  });

  ipcMain.handle(
    IPC_CHANNEL.FILE_SELECT_FILE_WRITE,
    (_, content: string | Buffer, options?: Electron.SaveDialogOptions) => {
      return fileStorage.selectFolderWrite(content, options);
    },
  );

  // fs
  ipcMain.handle(IPC_CHANNEL.FS_EXIST, async (_, path: string) => {
    return await pathExist(path);
  });

  ipcMain.handle(IPC_CHANNEL.FS_DELETE, async (_, path: string) => {
    return await fileDelete(path);
  });

  ipcMain.handle(IPC_CHANNEL.FS_FILE_READ, async (_, path: string, encoding: BufferEncoding = 'utf-8') => {
    return await readFile(path, encoding);
  });

  ipcMain.handle(
    IPC_CHANNEL.FS_FILE_WRITE,
    async (_, path: string, data: string | Buffer, encoding: BufferEncoding = 'utf-8') => {
      return await saveFile(path, data, encoding);
    },
  );

  ipcMain.handle(IPC_CHANNEL.FS_DIR_READ, async (_, path: string, depth: number = 0, exclude?, include?) => {
    return await readDirFaster(path, depth, exclude, include);
  });

  ipcMain.handle(IPC_CHANNEL.FS_DIR_CREATE, async (_, path: string) => {
    return await createDir(path);
  });

  // notification
  ipcMain.handle(
    IPC_CHANNEL.NOTIFICATION_SEND,
    async (event: Electron.IpcMainInvokeEvent, notification: INotification) => {
      const win = BrowserWindow.fromWebContents(event.sender)!;
      const notificationService = new NotificationService(win);
      await notificationService.sendNotification(notification);
    },
  );

  // open
  ipcMain.handle(IPC_CHANNEL.OPEN_PATH, async (_, path: string) => {
    await shell.openPath(path);
  });

  ipcMain.handle(IPC_CHANNEL.OPEN_WEBSITE, async (_, url: string) => {
    await shell.openExternal(url);
  });

  // path
  ipcMain.handle(IPC_CHANNEL.PATH_RESOLVE, (_, ...paths: string[]) => {
    return path.resolve(...paths);
  });

  ipcMain.handle(IPC_CHANNEL.PATH_JOIN, (_, ...paths: string[]) => {
    return path.join(...paths);
  });

  ipcMain.handle(IPC_CHANNEL.PATH_SYSTEM, (_, name: ISystemPath) => {
    return getSystemPath(name);
  });

  ipcMain.handle(IPC_CHANNEL.PATH_HOME, (_, name: IHomePath) => {
    return getHomePath(name);
  });

  ipcMain.handle(IPC_CHANNEL.PATH_USER, (_, name: IUserPath) => {
    return getUserPath(name);
  });

  // plugin
  ipcMain.handle(IPC_CHANNEL.PLUGIN_INSTALL, async (_, plugins: string[]) => {
    return await pluginService.install(plugins);
  });

  ipcMain.handle(IPC_CHANNEL.PLUGIN_UNINSTALL, async (_, plugins: string[]) => {
    return await pluginService.uninstall(plugins);
  });

  ipcMain.handle(IPC_CHANNEL.PLUGIN_START, async (_, plugins: string[]) => {
    return await pluginService.start(plugins);
  });

  ipcMain.handle(IPC_CHANNEL.PLUGIN_STOP, async (_, plugins: string[]) => {
    return await pluginService.stop(plugins);
  });

  // shortcut
  ipcMain.handle(IPC_CHANNEL.SHORTCUTS_IS_REGISTERD, (_, type: IShortcutType, id: string, winName?: string) => {
    return shortcutService.isRegistered(type, id, winName);
  });

  ipcMain.handle(IPC_CHANNEL.SHORTCUT_REGISTER, (_, id: string, config: IShortcutConfig, force: boolean) => {
    return shortcutService.register(id, config, force);
  });

  ipcMain.handle(IPC_CHANNEL.SHORTCUT_UNREGISTER, (_, type: IShortcutType, id: string, winName?: string) => {
    return shortcutService.unregister(type, id, winName);
  });

  ipcMain.handle(IPC_CHANNEL.SHORTCUT_CLEAR, () => {
    shortcutService.clear();
  });

  // system
  ipcMain.handle(IPC_CHANNEL.SYSTEM_ARCH, () => {
    return arch;
  });

  ipcMain.handle(IPC_CHANNEL.SYSTEM_PLATFORM, () => {
    return platform;
  });

  // update
  ipcMain.handle(IPC_CHANNEL.UPDATE_CHECK, async () => {
    return await appUpdater.checkForUpdates();
  });

  ipcMain.handle(IPC_CHANNEL.UPDATE_INSTALL, async () => {
    await appUpdater.install();
  });

  ipcMain.handle(IPC_CHANNEL.UPDATE_DOWNLOAD, async (_, status: boolean) => {
    if (status) await appUpdater.startDownload();
    else await appUpdater.cancelDownload();
  });

  // webview
  ipcMain.handle(IPC_CHANNEL.WEBVIEW_SPELL_CHECK, (_, webviewId: number, mode: 1 | 2) => {
    const webview = webContents.fromId(webviewId);
    if (!webview) return;

    if (isPositiveFiniteNumber(mode)) {
      if (mode === 1) webview.session.setSpellCheckerEnabled(true);
      else if (mode === 2) webview.session.setSpellCheckerEnabled(false);
    }

    return webview.session.isSpellCheckerEnabled();
  });

  ipcMain.handle(
    IPC_CHANNEL.WEBVIEW_LINK_BLOCK,
    (event: Electron.IpcMainInvokeEvent, webviewId: number, mode: 1 | 2) => {
      const webview = webContents.fromId(webviewId);
      if (!webview) return;

      if (isPositiveFiniteNumber(mode)) {
        if (mode === 1) {
          webview.setWindowOpenHandler(({ url }) => {
            const win = BrowserWindow.fromWebContents(event.sender)!;
            win.webContents.send(IPC_CHANNEL.WEBVIEW_LINK_BLOCK_RELAY, url);
            return { action: 'deny' };
          });
        } else if (mode === 2) {
          webview.setWindowOpenHandler(() => {
            return { action: 'allow' };
          });
        }
      }
    },
  );

  // window
  ipcMain.handle(IPC_CHANNEL.WINDOW_SIZE, (event: Electron.IpcMainInvokeEvent, width: number, height: number) => {
    const win = BrowserWindow.fromWebContents(event.sender)!;

    if (isPositiveFiniteNumber(width) && isPositiveFiniteNumber(height)) {
      win.setSize(width, height);
    }

    return win.getSize();
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_PIN, (event: Electron.IpcMainInvokeEvent, mode: 0 | 1 | 2) => {
    const win = BrowserWindow.fromWebContents(event.sender)!;

    if (isPositiveFiniteNumber(mode)) {
      if (mode === 0) win.setAlwaysOnTop(!win.isAlwaysOnTop());
      else if (mode === 1) win.setAlwaysOnTop(true);
      else if (mode === 2) win.setAlwaysOnTop(false);
    }

    return win.isAlwaysOnTop();
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_CLOSE, (event: Electron.IpcMainInvokeEvent, mode: 1) => {
    const win = BrowserWindow.fromWebContents(event.sender)!;

    if (isPositiveFiniteNumber(mode)) {
      if (mode === 1 && win.isClosable()) win.close();
    }

    return !win.isClosable();
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_MIN, (event: Electron.IpcMainInvokeEvent, mode: 0 | 1 | 2) => {
    const win = BrowserWindow.fromWebContents(event.sender)!;

    if (isPositiveFiniteNumber(mode)) {
      if (mode === 0) {
        win.isMinimized() ? win.restore() : win.minimize();
      } else if (mode === 1 && !win.isMinimized()) {
        win.minimize();
      } else if (mode === 2 && win.isMinimized()) {
        win.restore();
      }
    }

    return win.isMinimized();
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_MAX, (event: Electron.IpcMainInvokeEvent, mode: 0 | 1 | 2) => {
    const win = BrowserWindow.fromWebContents(event.sender)!;

    if (!win.isResizable()) return win.isMaximized();

    if (isPositiveFiniteNumber(mode)) {
      if (mode === 0) {
        win.isMaximized() ? win.unmaximize() : win.maximize();
      } else if (mode === 1 && !win.isMaximized()) {
        win.maximize();
      } else if (mode === 2 && win.isMaximized()) {
        win.unmaximize();
      }
    }

    return win.isMaximized();
  });

  ipcMain.handle(
    IPC_CHANNEL.WINDOW_POSITION,
    (event: Electron.IpcMainInvokeEvent, mode: 'relative' | 'absolute', { dx, dy }) => {
      const win = BrowserWindow.fromWebContents(event.sender)!;

      const [x, y] = win.getPosition();

      if (mode === 'absolute') win.setPosition(dx, dy);
      else if (mode === 'relative') win.setPosition(x + dx, y + dy);

      return win.getPosition();
    },
  );

  ipcMain.handle(IPC_CHANNEL.WINDOW_DESTROY, (_, name: string) => {
    const window = windowService.getWindow(name);
    if (window && !window.isDestroyed()) {
      windowService.closeWindow(window);
    }
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_HIDE, (_, name: string) => {
    const window = windowService.getWindow(name);
    if (window && !window.isDestroyed()) {
      windowService.hideWindow(window);
    }
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_SHOW, (_, name: string) => {
    const window = windowService.getWindow(name);
    if (window && !window.isDestroyed()) {
      windowService.showWindow(window);
    }
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_STATUS, (_, name: string) => {
    const window = windowService.getWindow(name);
    return !!window;

    // const window = windowService.getWindowName(name);
    // return !!window;
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_PLAYER, () => {
    const window = windowService.getWindow(WINDOW_NAME.PLAYER);
    if (window && !window.isDestroyed()) {
      windowService.showWindow(window);
      windowService.reloadWindow(window);
    } else {
      windowService.createPlayerWindow();
    }
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_MAIN, () => {
    const window = windowService.getWindow(WINDOW_NAME.MAIN);
    if (window && !window.isDestroyed()) {
      windowService.showWindow(window);
    } else {
      windowService.createMainWindow();
    }
  });

  ipcMain.handle(IPC_CHANNEL.WINDOW_BROWSER, (_event: Electron.IpcMainInvokeEvent, url: string) => {
    if (!isExternal(url)) return;

    let window = windowService.getWindow(WINDOW_NAME.BROWSER);
    if (window && !window.isDestroyed()) {
      windowService.showWindow(window);
      window.webContents.send(IPC_CHANNEL.BROWSER_NAVIGATE, url);
    } else {
      window = windowService.createBrowserWindow();
      window.webContents.once('did-stop-loading', () => {
        setTimeout(() => {
          window!.webContents.send(IPC_CHANNEL.BROWSER_NAVIGATE, url);
        }, 1000);
      });
    }
  });
}
