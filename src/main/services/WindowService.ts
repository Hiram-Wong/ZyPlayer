import { join } from 'node:path';
import url from 'node:url';

import { loggerService } from '@logger';
import { appLocale } from '@main/services/AppLocale';
import { configManager } from '@main/services/ConfigManager';
import { APP_DATABASE_PATH, APP_FILE_PATH } from '@main/utils/path';
import { isDev, isLinux, isMacOS, isPackaged, isWindows } from '@main/utils/systeminfo';
import { titleBarOverlayDark, titleBarOverlayLight } from '@shared/config/appinfo';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { LOG_MODULE } from '@shared/config/logger';
import { WINDOW_NAME } from '@shared/config/windowName';
import { convertUriToStandard, ELECTRON_TAG, isLocalhostURI, UNSAFE_HEADERS } from '@shared/modules/headers';
import { isUndefined } from '@shared/modules/validate';
import type { BrowserWindowConstructorOptions } from 'electron';
import { app, BrowserWindow, ipcMain, nativeImage, nativeTheme, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { merge } from 'es-toolkit';

import iconPath from '../../../build/icon.png?asset';
import { contextMenu } from './ContextMenu';
import { initSessionUserAgent } from './WebviewService';

const logger = loggerService.withContext(LOG_MODULE.APP_WINDOW);

const linuxIcon = isLinux ? nativeImage.createFromPath(iconPath) : undefined;

export class WindowService {
  private static instance: WindowService | null = null;
  private winPool = new Map<string, { window: BrowserWindow | null; lastCrashTime: number }>();

  public static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService();
    }
    return WindowService.instance;
  }

  public getAllNames(): string[] {
    return Array.from(this.winPool.keys());
  }

  public getAllWindows(): BrowserWindow[] {
    return Array.from(this.winPool.values())
      .map((item) => item.window!)
      .filter((win) => win instanceof BrowserWindow);
  }

  public getWindowName(mainWindow: BrowserWindow): string | null {
    for (const [name, item] of this.winPool.entries()) {
      if (item.window === mainWindow) {
        return name;
      }
    }

    return null;
  }

  public getWindow(window: string | BrowserWindow): BrowserWindow | null {
    if (typeof window === 'string') {
      if (this.winPool.has(window)) {
        return this.winPool.get(window)?.window as BrowserWindow;
      }
    } else if (typeof window === 'object' && window instanceof BrowserWindow) {
      return window;
    }

    return null;
  }

  public showWindow(window: string | BrowserWindow) {
    const mainWindow = this.getWindow(window);

    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    if (isWindows) {
      mainWindow.setOpacity(1);
    }

    /**
     * [Linux] Special handling for window activation
     * When the window is visible but covered by other windows, simply calling show() and focus()
     * is not enough to bring it to the front. We need to hide it first, then show it again.
     * This mimics the "close to tray and reopen" behavior which works correctly.
     */
    if (isLinux && mainWindow.isVisible() && !mainWindow.isFocused()) {
      mainWindow.hide();
      setImmediate(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
      return;
    }

    /**
     * About setVisibleOnAllWorkspaces
     *
     * [macOS] Known Issue
     *  setVisibleOnAllWorkspaces true/false will NOT bring window to current desktop in Mac (works fine with Windows)
     *  AppleScript may be a solution, but it's not worth
     *
     * [Linux] Known Issue
     *  setVisibleOnAllWorkspaces In Linux environments (especially KDE Wayland) this can cause windows to go into a "false popup" state
     */
    if (!isLinux) {
      mainWindow.setVisibleOnAllWorkspaces(true);
    }

    /**
     * [macOS] After being closed in fullscreen, the fullscreen behavior will become strange when window shows again
     * So we need to set it to FALSE explicitly.
     * althougle other platforms don't have the issue, but it's a good practice to do so
     *
     *  Check if window is visible to prevent interrupting fullscreen state when clicking dock icon
     */
    if (mainWindow.isFullScreen() && !mainWindow.isVisible()) {
      mainWindow.setFullScreen(false);
    }

    mainWindow.webContents.setAudioMuted(false);
    mainWindow.show();
    mainWindow.focus();

    if (!isLinux) {
      mainWindow.setVisibleOnAllWorkspaces(false);
    }
  }

  public showAllWindows() {
    const windows = this.getAllWindows();
    windows.forEach((win) => this.showWindow(win));
  }

  public hideWindow(window: string | BrowserWindow) {
    const mainWindow = this.getWindow(window);

    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.setAudioMuted(true);

    // [macOs/Windows] hacky fix
    // previous window(not self-app) should be focused again after miniWindow hide
    // this workaround is to make previous window focused again after miniWindow hide
    if (isWindows) {
      mainWindow.setOpacity(0); // don't show the minimizing animation
      mainWindow.minimize();
      return;
    } else if (isMacOS) {
      mainWindow.hide();
      app.hide();
      return;
    }

    mainWindow.hide();
  }

  public hideAllWindows() {
    const windows = this.getAllWindows();
    windows.forEach((win) => this.hideWindow(win));
  }

  public toggleWindow(window: string | BrowserWindow) {
    const mainWindow = this.getWindow(window);

    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    // should not toggle main window when in full screen
    // but if the main window is close to tray when it's in full screen, we can show it again
    // (it's a bug in macos, because we can close the window when it's in full screen, and the state will be remained)
    // if (mainWindow?.isFullScreen() && mainWindow.isVisible()) {
    //   return;
    // }

    mainWindow.isVisible() ? this.hideWindow(mainWindow) : this.showWindow(mainWindow);
  }

  public toggleAllWindows() {
    const windows = this.getAllWindows();
    const isVisable = windows.some((win) => win.isVisible());

    windows.forEach((win) => {
      isVisable ? this.hideWindow(win) : this.showWindow(win);
    });
  }

  public closeWindow(window: string | BrowserWindow) {
    const mainWindow = this.getWindow(window);
    const mainWindowName = this.getWindowName(mainWindow!);

    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.close();
      } catch {
        mainWindow.destroy();
      }
    }

    if (mainWindowName) {
      this.winPool.delete(mainWindowName);
    }
  }

  public closeAllWindows = () => {
    const windows = this.getAllWindows();
    windows.forEach((win) => this.closeWindow(win));
    this.winPool.clear();
  };

  public reloadWindow(window: string | BrowserWindow, force: boolean = false) {
    const mainWindow = this.getWindow(window);

    if (mainWindow && !mainWindow.isDestroyed()) {
      force ? mainWindow.webContents.reloadIgnoringCache() : mainWindow.webContents.reload();
    }
  }

  public reloadAllWindows(force: boolean = false) {
    const windows = this.getAllWindows();
    windows.forEach((win) => this.reloadWindow(win, force));
  }

  private safeClose(mainWindow: BrowserWindow) {
    const finish = () => {
      ipcMain.removeListener(IPC_CHANNEL.WINDOW_DESTROY_RELAY, onAck);
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.destroy();
    };

    const onAck = () => {
      if (timer) clearTimeout(timer);
      finish();
    };

    const timer = setTimeout(() => onAck(), 800);

    ipcMain.once(IPC_CHANNEL.WINDOW_DESTROY_RELAY, onAck);
    mainWindow.webContents.send(IPC_CHANNEL.WINDOW_DESTROY);
  }

  private setupWindowMonitor(mainWindow: BrowserWindow) {
    mainWindow.webContents.on('render-process-gone', (_, details) => {
      logger.error(`Renderer process crashed with: ${JSON.stringify(details)}`);
      const currentTime = Date.now();
      const mainWindowName = this.getWindowName(mainWindow)!;
      const lastCrashTime = this.winPool.get(mainWindowName)?.lastCrashTime || 0;
      this.winPool.set(mainWindowName, { window: mainWindow, lastCrashTime });
      if (currentTime - lastCrashTime > 60 * 1000) {
        // If greater than 1 minute, restart the rendering process
        mainWindow.webContents.reload();
      } else {
        // If less than 1 minute, exit the application
        app.exit(1);
      }
    });
  }

  private setupContextMenu(mainWindow: BrowserWindow) {
    contextMenu.contextMenu(mainWindow.webContents);
    // setup context menu for all webviews
    app.on('web-contents-created', (_, webContents) => {
      contextMenu.contextMenu(webContents);
    });

    // Dangerous API
    if (isDev) {
      // mainWindow.webContents.on('will-attach-webview', (_, webPreferences) => {
      //   webPreferences.preload = join(import.meta.dirname, '../preload/index.js');
      // });
    }
  }

  private setupWindowEvents(mainWindow: BrowserWindow) {
    mainWindow.once('ready-to-show', () => {
      // mainWindow.webContents.setZoomFactor(configManager.zoom);

      // [mac]hacky-fix: miniWindow set visibleOnFullScreen:true will cause dock icon disappeared
      app.dock?.show();
      mainWindow.show();
    });

    // set the zoom factor again when the window is going to resize
    //
    // this is a workaround for the known bug that
    // the zoom factor is reset to cached value when window is resized after routing to other page
    // see: https://github.com/electron/electron/issues/10572
    //
    mainWindow.on('will-resize', () => {
      mainWindow.webContents.setZoomFactor(configManager.zoom);
      mainWindow.webContents.send(IPC_CHANNEL.WINDOW_SIZE, mainWindow.getSize());
    });

    // set the zoom factor again when the window is going to restore
    // minimize and restore will cause zoom reset
    mainWindow.on('restore', () => {
      mainWindow.webContents.setZoomFactor(configManager.zoom);
    });

    // ARCH: as `will-resize` is only for Win & Mac,
    // linux has the same problem, use `resize` listener instead
    // but `resize` will fliker the ui
    if (isLinux) {
      mainWindow.on('resize', () => {
        mainWindow.webContents.setZoomFactor(configManager.zoom);
        mainWindow.webContents.send(IPC_CHANNEL.WINDOW_SIZE, mainWindow.getSize());
      });
    }

    mainWindow.on('maximize', () => {
      mainWindow.webContents.send(IPC_CHANNEL.WINDOW_MAX, mainWindow.isMaximized());
    });

    mainWindow.on('unmaximize', () => {
      mainWindow.webContents.send(IPC_CHANNEL.WINDOW_MAX, mainWindow.isMaximized());
    });

    mainWindow.on('enter-full-screen', () => {
      mainWindow.webContents.send(IPC_CHANNEL.WINDOW_FULLSCREEN, mainWindow.isFullScreen());
    });

    mainWindow.on('leave-full-screen', () => {
      mainWindow.webContents.send(IPC_CHANNEL.WINDOW_FULLSCREEN, mainWindow.isFullScreen());
    });
  }

  private setupWebContentsHandlers(mainWindow: BrowserWindow) {
    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url.includes('localhost:5173')) {
        return;
      }

      event.preventDefault();
      shell.openExternal(url);
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
      const { url } = details;

      const oauthProviderUrls = ['github.com', 'catni.cn', 'pagespy.org'];

      if (oauthProviderUrls.some((link) => url.includes(link))) {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            webPreferences: {
              partition: 'persist:webview',
            },
          },
        };
      }

      if (url.includes('http://file/')) {
        const fileName = url.replace('http://file/', '');
        const filePath = `${APP_FILE_PATH}/${fileName}`;
        shell.openPath(filePath).catch((error) => logger.error('Failed to open file:', error));
      } else {
        // mainWindow.webContents.send(IPC_CHANNEL.URI_BLOCKED, url);
        // shell.openExternal(details.url);

        let window = this.getWindow(WINDOW_NAME.BROWSER);
        if (window && !window.isDestroyed()) {
          this.showWindow(window);
          window.webContents.send(IPC_CHANNEL.BROWSER_NAVIGATE, url);
        } else {
          window = this.createBrowserWindow();
          window.webContents.once('did-finish-load', () => {
            setTimeout(() => {
              window!.webContents.send(IPC_CHANNEL.BROWSER_NAVIGATE, url);
            }, 1000);
          });
        }
      }

      return { action: 'deny' };
    });

    this.setupWebRequestHeaders(mainWindow);
  }

  private setupWebRequestHeaders(mainWindow: BrowserWindow) {
    const reqMap = new Map<number, { redirect: string; headers: Record<string, any> }>();

    mainWindow.webContents.session.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
      const { id, url } = details;

      // Block devtools detector requests
      if (['devtools-detector', 'disable-devtool'].some((f) => url.includes(f))) {
        callback({ cancel: true });
        return;
      }

      const { redirect, headers } = convertUriToStandard(url);
      if (headers && Object.keys(headers).length && url !== redirect) {
        reqMap.set(id, { redirect, headers });
        callback({ cancel: false, redirectURL: redirect });
      } else {
        callback({ cancel: false });
      }
    });

    mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      const { id, requestHeaders, url } = details;
      const customHeaders = reqMap.has(id) ? reqMap.get(id)!.headers : {};
      if (reqMap.has(id)) reqMap.delete(id);

      UNSAFE_HEADERS.forEach((key) => {
        requestHeaders[key] = !isUndefined(customHeaders[key])
          ? customHeaders[key]
          : !isUndefined(requestHeaders[`${ELECTRON_TAG}-${key}`])
            ? requestHeaders[`${ELECTRON_TAG}-${key}`]
            : requestHeaders[key];
        delete requestHeaders[`${ELECTRON_TAG}-${key}`];

        if (key === 'User-Agent' && requestHeaders[key]?.includes(ELECTRON_TAG)) {
          requestHeaders[key] = configManager.ua;
        }

        if (isUndefined(requestHeaders[key]) || isLocalhostURI(requestHeaders[key])) {
          delete requestHeaders[key];
        }
      });

      // Accept-Language
      const language = appLocale.defaultLang();
      requestHeaders['Accept-Language'] = `${language}, en;q=0.9, *;q=0.5`;

      // Custom Header
      if (url.includes('doubanio.com') && !requestHeaders.Referer) {
        requestHeaders.Referer = 'https://api.douban.com/';
      }

      // Handle redirect mode
      if (requestHeaders.Redirect === 'manual') reqMap.set(id, { redirect: url, headers: requestHeaders });

      callback({ requestHeaders });
    });

    mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: ['*://*/*'] }, (details, callback) => {
      const { id, responseHeaders } = details;

      // Frame
      ['X-Frame-Options', 'x-frame-options'].forEach((key) => delete responseHeaders?.[key]);

      // Content-Security-Policy
      ['Content-Security-Policy', 'content-security-policy'].forEach((key) => delete responseHeaders?.[key]);

      // Set-Cookie
      ['Set-Cookie', 'set-cookie'].forEach((key) => {
        if (responseHeaders?.[key]) {
          responseHeaders[key] = responseHeaders![key].map((ck) => `${ck}; SameSite=None; Secure`);
        }
      });

      if (reqMap.has(id)) reqMap.delete(id);

      callback({ cancel: false, responseHeaders });
    });
  }

  // see: https://github.com/electron/electron/issues/42055#issuecomment-2449365647
  private replaceDevtoolsFont = (mainWindow: BrowserWindow) => {
    // only for windows and dev, don't do this in production to avoid performance issues
    if (isWindows && isDev) {
      mainWindow.webContents.on('devtools-opened', () => {
        const css = `
          :root {
            --sys-color-base: var(--ref-palette-neutral100);
            --source-code-font-family: consolas !important;
            --source-code-font-size: 12px;
            --monospace-font-family: consolas !important;
            --monospace-font-size: 12px;
            --default-font-family: system-ui, sans-serif;
            --default-font-size: 12px;
            --ref-palette-neutral99: #ffffffff;
          }
          .theme-with-dark-background {
            --sys-color-base: var(--ref-palette-secondary25);
          }
          body {
            --default-font-family: system-ui, sans-serif;
          }
      `;
        mainWindow.webContents.devToolsWebContents?.executeJavaScript(`
          const overriddenStyle = document.createElement('style');
          overriddenStyle.innerHTML = '${css.replaceAll('\n', ' ')}';
          document.body.append(overriddenStyle);
          document.querySelectorAll('.platform-windows').forEach(el => el.classList.remove('platform-windows'));
          addStyleToAutoComplete();
          const observer = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
              if (mutation.type === 'childList') {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                  const item = mutation.addedNodes[i];
                  if (item.classList.contains('editor-tooltip-host')) {
                      addStyleToAutoComplete();
                  }
                }
              }
            }
          });
          observer.observe(document.body, {childList: true});
          function addStyleToAutoComplete() {
            document.querySelectorAll('.editor-tooltip-host').forEach(element => {
              if (element.shadowRoot.querySelectorAll('[data-key="overridden-dev-tools-font"]').length === 0) {
                const overriddenStyle = document.createElement('style');
                overriddenStyle.setAttribute('data-key', 'overridden-dev-tools-font');
                overriddenStyle.innerHTML = '.cm-tooltip-autocomplete ul[role=listbox] {font-family: consolas !important;}';
                element.shadowRoot.append(overriddenStyle);
              }
            });
          }
      `);
      });
    }
  };

  public createWindow(windowName: string, options?: BrowserWindowConstructorOptions): BrowserWindow {
    let mainWindow = this.getWindow(windowName);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
      return mainWindow;
    }

    mainWindow = new BrowserWindow(
      merge(
        {
          width: 960,
          height: 600,
          show: false,
          autoHideMenuBar: true,
          transparent: false,
          ...(isLinux ? { icon: linuxIcon } : {}),
          webPreferences: {
            allowRunningInsecureContent: true,
            backgroundThrottling: false,
            contextIsolation: true,
            nodeIntegration: false,
            preload: join(import.meta.dirname, '../preload/index.js'),
            sandbox: false,
            spellcheck: false,
            webSecurity: false,
            zoomFactor: configManager.zoom,
          },
        },
        options || {},
      ),
    );

    this.replaceDevtoolsFont(mainWindow);
    this.setupContextMenu(mainWindow);
    this.setupWindowMonitor(mainWindow);

    mainWindow.on('closed', () => {
      this.winPool.delete(windowName);

      if (app.isQuitting && this.getAllWindows().length === 0) {
        app.quit();
      }
    });

    this.winPool.set(windowName, { window: mainWindow, lastCrashTime: 0 });

    return mainWindow;
  }

  public createMainWindow(): BrowserWindow {
    const mainWindowState = windowStateKeeper({
      path: APP_DATABASE_PATH,
      file: `${WINDOW_NAME.MAIN}-window-state.json`,
      defaultWidth: 1000,
      defaultHeight: 640,
      fullScreen: false,
      maximize: false,
    });

    const mainWindow = this.createWindow(WINDOW_NAME.MAIN, {
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 1000,
      minHeight: 640,
      show: false,
      autoHideMenuBar: true,
      transparent: false,
      vibrancy: 'sidebar',
      visualEffectState: 'active',
      // For Windows and Linux, we use frameless window with custom controls
      // For Mac, we keep the native title bar style
      ...(isMacOS
        ? {
            titleBarStyle: 'hidden',
            titleBarOverlay: nativeTheme.shouldUseDarkColors ? titleBarOverlayDark : titleBarOverlayLight,
            trafficLightPosition: { x: 8, y: 14 },
          }
        : {
            frame: false, // Frameless window for Windows and Linux
          }),
      backgroundColor: isMacOS ? undefined : nativeTheme.shouldUseDarkColors ? '#181818' : '#FFFFFF',
      darkTheme: nativeTheme.shouldUseDarkColors,
      webPreferences: {
        webviewTag: true,
      },
    });

    mainWindowState.manage(mainWindow);

    this.setupWindowEvents(mainWindow);
    this.setupWebContentsHandlers(mainWindow);

    if (!isPackaged && process.env.ELECTRON_RENDERER_URL) {
      mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
      mainWindow.loadFile(join(import.meta.dirname, '../renderer/index.html'));
    }

    // init webview useragent
    initSessionUserAgent();

    return mainWindow;
  }

  public createPlayerWindow(): BrowserWindow {
    const mainWindowState = windowStateKeeper({
      path: APP_DATABASE_PATH,
      file: `${WINDOW_NAME.PLAYER}-window-state.json`,
      defaultWidth: 960,
      defaultHeight: 600,
      fullScreen: false,
      maximize: false,
    });

    const mainWindow = this.createWindow(WINDOW_NAME.PLAYER, {
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 528,
      minHeight: 297,
      show: false,
      autoHideMenuBar: true,
      transparent: false,
      vibrancy: 'sidebar',
      visualEffectState: 'active',
      // For Windows and Linux, we use frameless window with custom controls
      // For Mac, we keep the native title bar style
      ...(isMacOS
        ? {
            titleBarStyle: 'hidden',
            titleBarOverlay: nativeTheme.shouldUseDarkColors ? titleBarOverlayDark : titleBarOverlayLight,
            trafficLightPosition: { x: 8, y: 14 },
          }
        : {
            frame: false, // Frameless window for Windows and Linux
          }),
      backgroundColor: isMacOS ? undefined : nativeTheme.shouldUseDarkColors ? '#181818' : '#FFFFFF',
      darkTheme: nativeTheme.shouldUseDarkColors,
    });

    mainWindowState.manage(mainWindow);

    this.setupWindowEvents(mainWindow);
    this.setupWebContentsHandlers(mainWindow);

    mainWindow.on('close', (event: Electron.Event) => {
      event.preventDefault();
      this.safeClose(mainWindow);

      if (!app.isQuitting) {
        const window = this.getWindow(WINDOW_NAME.MAIN);
        if (window && !window.isDestroyed()) {
          this.showWindow(window);
        } else {
          this.createMainWindow();
        }
      }
    });

    if (!isPackaged && process.env.ELECTRON_RENDERER_URL) {
      mainWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/#/player`);
    } else {
      mainWindow.loadURL(
        url.format({
          pathname: join(import.meta.dirname, '../renderer/index.html'),
          protocol: 'file:',
          slashes: true,
          hash: 'player',
        }),
      );
    }

    return mainWindow;
  }

  public createBrowserWindow(): BrowserWindow {
    const mainWindowState = windowStateKeeper({
      path: APP_DATABASE_PATH,
      file: `${WINDOW_NAME.BROWSER}-window-state.json`,
      defaultWidth: 1000,
      defaultHeight: 640,
      fullScreen: false,
      maximize: false,
    });

    const mainWindow = this.createWindow(WINDOW_NAME.BROWSER, {
      minWidth: 1000,
      minHeight: 640,
      show: false,
      autoHideMenuBar: true,
      transparent: false,
      vibrancy: 'sidebar',
      visualEffectState: 'active',
      // For Windows and Linux, we use frameless window with custom controls
      // For Mac, we keep the native title bar style
      ...(isMacOS
        ? {
            titleBarStyle: 'hidden',
            titleBarOverlay: nativeTheme.shouldUseDarkColors ? titleBarOverlayDark : titleBarOverlayLight,
            trafficLightPosition: { x: 8, y: 14 },
          }
        : {
            frame: false, // Frameless window for Windows and Linux
          }),
      backgroundColor: isMacOS ? undefined : nativeTheme.shouldUseDarkColors ? '#181818' : '#FFFFFF',
      darkTheme: nativeTheme.shouldUseDarkColors,
      webPreferences: {
        webviewTag: true,
      },
    });

    mainWindowState.manage(mainWindow);

    this.setupWindowEvents(mainWindow);
    this.setupWebContentsHandlers(mainWindow);

    mainWindow.on('close', (event: Electron.Event) => {
      event.preventDefault();
      this.safeClose(mainWindow);
    });

    if (!isPackaged && process.env.ELECTRON_RENDERER_URL) {
      mainWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/#/browser`);
    } else {
      mainWindow.loadURL(
        url.format({
          pathname: join(import.meta.dirname, '../renderer/index.html'),
          protocol: 'file:',
          slashes: true,
          hash: 'browser',
        }),
      );
    }

    return mainWindow;
  }

  public createSnifferWindow(uuid: string): BrowserWindow {
    const mainWindow = this.createWindow(`${WINDOW_NAME.SNIFFER}-${uuid}`, {});

    const debug = configManager.debug;

    if (debug) {
      mainWindow.once('ready-to-show', () => {
        mainWindow.webContents.setZoomFactor(configManager.zoom);

        // [mac]hacky-fix: miniWindow set visibleOnFullScreen:true will cause dock icon disappeared
        app.dock?.show();
        mainWindow.show();
      });
    }

    return mainWindow;
  }
}

export const windowService = WindowService.getInstance();
