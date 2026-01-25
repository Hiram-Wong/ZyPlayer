import type { IPlatform } from '@shared/types/systeminfo';

export const platformNavigator: IPlatform = (() => {
  const plat = (navigator as any).userAgentData?.platform || navigator.platform;
  if (/win/i.test(plat)) return 'win32';
  if (/mac|darwin/i.test(plat)) return 'darwin';
  if (/openharmony/i.test(plat)) return 'ohos'; // It has to be prioritized over Linux, which is the underlying layer of OpenHarmony.
  if (/linux/i.test(plat)) return 'linux';
  return 'unknown';
})();
export const platformElectron: IPlatform = (() => {
  const plat = window.electron.process.platform;
  if (plat === 'win32') return 'win32';
  if (plat === 'darwin') return 'darwin';
  if (plat === 'linux') return 'linux';
  if (plat === 'ohos') return 'ohos';
  return 'unknown';
})();
export const platform: IPlatform = (() => {
  if (window?.electron?.process?.platform) {
    return platformElectron;
  }
  return platformNavigator;
})();

export const isMacOS: boolean = platform === 'darwin';
export const isWindows: boolean = platform === 'win32';
export const isLinux: boolean = platform === 'linux';
export const isOhOS: boolean = platform === 'ohos';

export const isElectronNavigator: boolean = navigator.userAgent.toLowerCase().includes('electron');
export const isElectronElectron: boolean = !!window.electron.process.versions.electron;
export const isElectron: boolean = (() => {
  if (window?.electron?.process?.versions?.electron) {
    return isElectronNavigator;
  }
  return isElectronNavigator;
})();

export const isDev: boolean = import.meta.env.DEV;
export const isProd: boolean = import.meta.env.PROD;

export const delimiter = isWindows ? '\\' : '/';

export default {
  isElectron,
  isWindows,
  isLinux,
  isMacOS,
  isOhOS,
  isDev,
  isProd,
  delimiter,
  platform,
};
