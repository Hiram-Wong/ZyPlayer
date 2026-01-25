// don't reorder this file, it's used to initialize the app data dir and
// other which should be run before the main process is ready

import process from 'node:process';

import { electronApp, optimizer } from '@electron-toolkit/utils';
import { loggerService } from '@logger';
import { registerIpc } from '@main/ipc';
import { appLocale } from '@main/services/AppLocale';
import { configManager } from '@main/services/ConfigManager';
import { dbService } from '@main/services/DbService';
import { fastifyService } from '@main/services/FastifyService';
import { terminate as filmCmsTerminate } from '@main/services/FastifyService/routes/v1/film/cms/utils/cache';
import { fileStorage } from '@main/services/FileStorage';
import { MenuService } from '@main/services/MenuService';
import { pluginService } from '@main/services/PluginService';
import { handleProtocolUrl, setupAppImageDeepLink } from '@main/services/ProtocolClient';
import { proxyManager } from '@main/services/ProxyManager';
import { TrayService } from '@main/services/TrayService';
import { windowService } from '@main/services/WindowService';
import { isDev, isLinux, isMacOS, isWindows } from '@main/utils/systeminfo';
import { APP_NAME, APP_NAME_PROTOCOL } from '@shared/config/appinfo';
import { LOG_MODULE } from '@shared/config/logger';
import { runAsyncFunction } from '@shared/modules/function';
import { isBoolean, isHttp } from '@shared/modules/validate';
import { app, crashReporter } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';

const logger = loggerService.withContext(LOG_MODULE.MAIN);

// enable local crash reports
crashReporter.start({
  productName: APP_NAME,
  submitURL: '',
  uploadToServer: false,
});

/**
 * Environment Variable Repair
 */
const setupEnv = () => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ignore TLS certificate errors
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; // disable security warnings

  // in production mode, handle uncaught exception and unhandled rejection globally
  if (!isDev) {
    // handle uncaught exception
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
    });

    // handle unhandled rejection
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
    });
  }
};

/**
 * Application Initialization Processing
 */
const setupApp = async () => {
  /**
   * Disable hardware acceleration if setting is enabled
   */
  const dbHardwareAcceleration = configManager.hardwareAcceleration;
  const disableHardwareAcceleration = isBoolean(dbHardwareAcceleration) ? !dbHardwareAcceleration : false;
  if (disableHardwareAcceleration) {
    app.disableHardwareAcceleration();
  }

  /**
   * Disable chromium's window animations
   * main purpose for this is to avoid the transparent window flashing when it is shown
   * (especially on Windows for SelectionAssistant Toolbar)
   * Know Issue: https://github.com/electron/electron/issues/12130#issuecomment-627198990
   */
  if (isWindows) {
    app.commandLine.appendSwitch('wm-window-animations-disabled');
  }

  /**
   * Enable GlobalShortcutsPortal for Linux Wayland Protocol
   * see: https://www.electronjs.org/docs/latest/api/global-shortcut
   */
  if (isLinux && process.env.XDG_SESSION_TYPE === 'wayland') {
    app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal');
  }

  /**
   * Set window class and name for Linux
   * This ensures the window manager identifies the app correctly on both X11 and Wayland
   */
  if (isLinux) {
    app.commandLine.appendSwitch('class', APP_NAME);
    app.commandLine.appendSwitch('name', APP_NAME);
  }

  /**
   * Enable Chromium features
   * https://github.com/microsoft/vscode/pull/241640/files
   */
  const enableFeatures = [
    'DocumentPolicyIncludeJSCallStacksInCrashReports', // unresponsive renderer js call stacks
    'EarlyEstablishGpuChannel', // early establish gpu channel
    'EstablishGpuChannelAsync', // early establish gpu channel
    'PlatformHEVCDecoderSupport', // HEVC video decoding support
    'VaapiVideoDecoder', // VA-API video decoder
    'UseMultiPlaneFormatForHardwareVideo', // Fix frame pool issue
    'VaapiIgnoreDriverChecks', // Ignore driver compatibility check
    'CanvasOopRasterization', // Canvas OOP rasterization
  ];
  app.commandLine.appendSwitch('enable-features', enableFeatures.join(','));
  app.commandLine.appendSwitch('ignore-certificate-errors'); // ignore certificate errors
  app.commandLine.appendSwitch('disable-web-security'); // disable web security
  app.commandLine.appendSwitch('disable-http-cache'); // disable HTTP cache

  /**
   * Disable Chromium features
   */
  const disableFeatures = [
    'OutOfBlinkCors', // Disable CORS for cross-origin requests
    'SameSiteByDefaultCookies', // Enable SameSite cookies by default
    'CookiesWithoutSameSiteMustBeSecure', // Allow cookies without SameSite to be secure
    'BlockInsecurePrivateNetworkRequests', // Block insecure requests initiated by private networks
  ];
  app.commandLine.appendSwitch('disable-features', disableFeatures.join(','));
};

/**
 * Application Ready Processing
 */
const setupReady = () => {
  app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId(import.meta.env.VITE_MAIN_BUNDLE_ID || 'com.player.zyfun');

    // Set doh
    const hostResolver = configManager.dns;
    if (isHttp(hostResolver, true)) {
      logger.info(`Using secure dns: ${hostResolver}`);
      app.configureHostResolver({
        secureDnsMode: 'secure',
        secureDnsServers: [hostResolver],
      });
    }

    const mainWindow = windowService.createMainWindow();

    // eslint-disable-next-line no-new
    new TrayService();
    // eslint-disable-next-line no-new
    new MenuService();

    registerIpc(mainWindow, app);

    // Setup deep link for AppImage on Linux
    await setupAppImageDeepLink();

    if (isDev) {
      installExtension([VUEJS_DEVTOOLS])
        .then(([...args]) => logger.info(`Added devtool extensions: ${args.map((arg) => arg.name).join(', ')}`))
        .catch((error) => logger.error('An error occurred: ', error));
    }
  });

  app.on('activate', function () {
    const windowNames = windowService.getAllNames();
    if (windowNames.length === 0) {
      windowService.createMainWindow();
    } else {
      windowService.showAllWindows();
    }
  });

  app.on('window-all-closed', () => {
    if (!isMacOS) app.quit();
  });

  // macOS specific: handle protocol when app is already running
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleProtocolUrl(url);
  });

  const handleOpenUrl = (args: string[]) => {
    const url = args.find((arg) => arg.startsWith(APP_NAME_PROTOCOL));
    if (url) handleProtocolUrl(url);
  };

  // for windows to start with url
  handleOpenUrl(process.argv);

  // Listen for second instance
  app.on('second-instance', (_event, argv) => {
    windowService.showAllWindows();

    // Protocol handler for Windows/Linux
    // The commandLine is an array of strings where the last item might be the URL
    handleOpenUrl(argv);
  });

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('before-quit', async () => {
    app.isQuitting = true;
  });

  app.on('will-quit', async (e: Electron.Event) => {
    e.preventDefault();

    await filmCmsTerminate();
    await fastifyService.stop();
    await pluginService.clean();
    logger.finish();

    app.exit(0);
  });

  // In this file you can include the rest of your app"s specific main process
  // code. You can also put them in separate files and require them here.
};

const main = async () => {
  setupEnv();
  setupApp();

  if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
  } else {
    await fileStorage.initRequireDir();
    await dbService.init();
    await proxyManager.configureProxy(configManager.proxy);
    await fastifyService.start();

    appLocale.init();
    setupReady();

    runAsyncFunction(() => {
      pluginService.autoLaunch();
    });
  }
};

main();
