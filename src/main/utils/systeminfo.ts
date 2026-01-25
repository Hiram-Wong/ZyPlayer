import os from 'node:os';
import process from 'node:process';

import { APP_NAME, APP_VERSION } from '@shared/config/appinfo';
import type { IArch, IPlatform, ISystemInfo } from '@shared/types/systeminfo';
import { app } from 'electron';
import macosRelease from 'macos-release';
import windowsRelease from 'windows-release';

export const platform: IPlatform = (() => {
  const plat = process.platform as NodeJS.Platform | 'ohos';
  if (plat === 'win32') return 'win32';
  if (plat === 'darwin') return 'darwin';
  if (plat === 'linux') return 'linux';
  if (plat === 'ohos') return 'ohos';
  return 'unknown';
})();

export const release: string = (() => {
  const plat = process.platform as NodeJS.Platform | 'ohos';
  if (plat === 'win32') return windowsRelease() || 'unknown';
  if (plat === 'darwin') return macosRelease().version;
  if (plat === 'linux') return os.release();
  if (plat === 'ohos') return os.release();
  return 'unknown';
})();

export const arch: IArch = (() => {
  const a = process.arch as NodeJS.Architecture;
  if (a === 'x64') return 'x86_64';
  if (a === 'ia32') return 'x86_32';
  if (a === 'arm64') return 'arm_64';
  if (a === 'arm') return 'arm_32';
  if (a === 'mips' || a === 'mipsel') return 'mips';
  if (a === 'loong64') return 'loong_64';
  if (a === 'riscv64') return 'riscv_64';
  return 'unknown';
})();

export const isMacOS: boolean = platform === 'darwin';
export const isWindows: boolean = platform === 'win32';
export const isLinux: boolean = platform === 'linux';
export const isOhOS: boolean = platform === 'ohos';

export const isMacOSTahoe = isMacOS && Number.parseInt(macosRelease().version) >= 26;
export const isWindows11 =
  isWindows &&
  (() => {
    const parts = os.release().split('.');
    const buildNumber = Number.parseInt(parts[2], 10);
    return buildNumber >= 22000;
  })();

export const isElectron: boolean = !!(process?.versions && process?.versions.electron);

export const isDev: boolean = process.env.NODE_ENV === 'development';
export const isProd: boolean = process.env.NODE_ENV === 'production';
export const isPortable: boolean = isWindows && 'PORTABLE_EXECUTABLE_DIR' in process.env; // only available on Windows
export const isPackaged: boolean = app.isPackaged;

export const delimiter = isWindows ? '\\' : '/';
export const linebreak = isWindows ? '\r\n' : '\n';

/**
 * Get system information
 * @returns {ISystemInfo} Complete system information object
 */
export function getSystemInfo(): ISystemInfo {
  const plat = platform;
  const osRelease = os.release();

  let osString = '';

  switch (plat) {
    case 'win32': {
      // Get Windows version
      const parts = osRelease.split('.');
      const buildNumber = Number.parseInt(parts[2], 10);
      osString = buildNumber >= 22000 ? 'Windows 11' : 'Windows 10';
      break;
    }
    case 'darwin': {
      // macOS version handling using macos-release for better accuracy
      try {
        const macVersionInfo = macosRelease();
        const versionString = macVersionInfo.version.replace(/\./g, '_'); // 15.0.0 -> 15_0_0
        osString = arch === 'arm_64' ? `Mac OS X ${versionString}` : `Intel Mac OS X ${versionString}`; // Mac OS X 15_0_0
      } catch {
        // Fallback to original logic if macos-release fails
        const macVersion = osRelease.split('.').slice(0, 2).join('_');
        osString = arch === 'arm_64' ? `Mac OS X ${macVersion}` : `Intel Mac OS X ${macVersion}`;
      }
      break;
    }
    case 'linux': {
      osString = `Linux ${arch}`;
      break;
    }
    case 'ohos': {
      osString = `OpenHarmony ${arch}`;
      break;
    }
    default: {
      osString = `${platform} ${arch}`;
    }
  }

  return { platform, arch, release, osString };
}

/**
 * Generate User-Agent string based on user system data
 * @returns {string} Dynamically generated User-Agent string
 */
export function generateUserAgent(): string {
  const systemInfo = getSystemInfo();
  const ua = `Mozilla/5.0 (${systemInfo.osString}; ${systemInfo.arch}) AppleWebKit/537.36 (KHTML, like Gecko) ${APP_NAME}/${APP_VERSION} Chrome/124.0.0.0 Safari/537.36`;
  return ua;
}

export default {
  isElectron,
  isWindows,
  isLinux,
  isMacOS,
  isOhOS,
  isDev,
  isProd,
  isPackaged,
  isPortable,
  delimiter,
  platform,
  getSystemInfo,
  generateUserAgent,
};
