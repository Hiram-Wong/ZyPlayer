import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isPackaged } from '@main/utils/systeminfo';
import { APP_NAME_ALIAS, APP_NAME_PROTOCOL } from '@shared/config/appinfo';
import { isStrEmpty } from '@shared/modules/validate';
import { app } from 'electron';

export const ELECTRON_PATHS = [
  'home',
  'appData',
  'userData',
  'sessionData',
  'temp',
  'exe',
  'module',
  'desktop',
  'documents',
  'downloads',
  'music',
  'pictures',
  'videos',
  'recent', // only windows
  'logs',
  'crashDumps',
] as const;

export type IElectronPath = (typeof ELECTRON_PATHS)[number];

export const SYSTEM_PATHS = ['runtime', 'resources', ...ELECTRON_PATHS] as const;

export type ISystemPath = (typeof SYSTEM_PATHS)[number];

export const HOME_PATHS = ['bin'] as const;

export type IHomePath = (typeof HOME_PATHS)[number];

export const USER_PATHS = ['database', 'file', 'log', 'plugin', 'temp'] as const;

export type IUserPath = (typeof USER_PATHS)[number];

export const getSystemPath = (name: ISystemPath): string => {
  // runtime path
  if (name === 'runtime') {
    return app.getAppPath();
  }

  // public resources path
  if (name === 'resources') {
    const resourcesPath = join(app.getAppPath(), 'resources');
    return isPackaged ? resourcesPath.replace('app.asar', 'app.asar.unpacked') : resourcesPath;
  }

  // electron path
  if (ELECTRON_PATHS.includes(name)) {
    return app.getPath(name);
  }

  return '';
};

export const getHomePath = (name: IHomePath): string => {
  if (HOME_PATHS.includes(name)) {
    return join(getSystemPath('home'), `.${APP_NAME_ALIAS}`, name);
  }

  return '';
};

export const getUserPath = (name: IUserPath): string => {
  if (USER_PATHS.includes(name)) {
    return join(getSystemPath('userData'), name);
  }

  return '';
};

/**
 * Windows: %APPDATA%\Roaming
 * Linux: $XDG_CONFIG_HOME or ~/.config
 * macOS: ~/Library/Application\ Support
 */
export const APP_CRASH_PATH: string = getSystemPath('crashDumps');
export const APP_EXE_PATH: string = getSystemPath('exe');
export const APP_HOME_PATH: string = getSystemPath('home');
export const APP_PUBLIC_PATH: string = getSystemPath('resources');
export const APP_RUNTIME_PATH: string = getSystemPath('runtime');
export const APP_STORE_PATH: string = getSystemPath('userData');

export const APP_DATABASE_PATH: string = getUserPath('database');
export const APP_FILE_PATH: string = getUserPath('file');
export const APP_LOG_PATH: string = getUserPath('log');
export const APP_PLUGIN_PATH: string = getUserPath('plugin');
export const APP_TEMP_PATH: string = getUserPath('temp');

export const HOME_BIN_PATH: string = getHomePath('bin');

export const APP_REQUIRE_PATH: string[] = [
  HOME_BIN_PATH,
  APP_DATABASE_PATH,
  APP_LOG_PATH,
  APP_PLUGIN_PATH,
  APP_FILE_PATH,
  APP_TEMP_PATH,
];

/**
 * Validate and normalize path string
 * @param path Path string to validate
 * @returns Normalized path or empty string if invalid
 */
const validateAndNormalizePath = (path: string): string => {
  if (isStrEmpty(path)) {
    return '';
  }
  return path.trim() || '';
};

/**
 * Check if URL starts with app mark path
 * @param path URL to check
 * @returns Whether URL starts with app mark path
 */
export const isAppMarkPath = (path: string): boolean => {
  const normalized = validateAndNormalizePath(path);
  return normalized.length > 0 && normalized.startsWith(APP_NAME_PROTOCOL);
};

export const isAppFilePath = (path: string): boolean => {
  const normalized = validateAndNormalizePath(path);
  return normalized.length > 0 && normalized.startsWith('file://');
};

/**
 * Check if URL starts with app store path
 * @param path URL to check
 * @returns Whether URL starts with app store path
 */
export const isAppStorePath = (path: string): boolean => {
  const normalized = validateAndNormalizePath(path);
  return normalized.length > 0 && normalized.startsWith(APP_STORE_PATH);
};

/**
 * Convert relative path to absolute path
 * @param path Path to convert
 * @returns Absolute path
 */
export const relativeToAbsolute = (path: string): string => {
  const normalized = validateAndNormalizePath(path);
  if (!normalized) return '';

  if (isAppMarkPath(normalized)) {
    return normalized.replace(APP_NAME_PROTOCOL, APP_STORE_PATH);
  }

  if (isAppFilePath(normalized)) {
    return fileURLToPath(normalized);
  }

  return normalized;
};

/**
 * Convert absolute path to relative path
 * @param path Path to convert
 * @returns Relative path
 */
export const absoluteToRelative = (path: string): string => {
  const normalized = validateAndNormalizePath(path);
  if (!normalized) return '';
  return isAppStorePath(normalized) ? normalized.replace(APP_STORE_PATH, APP_NAME_PROTOCOL) : normalized;
};

export default {
  absoluteToRelative,
  APP_CRASH_PATH,
  APP_DATABASE_PATH,
  APP_EXE_PATH,
  APP_FILE_PATH,
  APP_HOME_PATH,
  APP_LOG_PATH,
  APP_PLUGIN_PATH,
  APP_PUBLIC_PATH,
  APP_RUNTIME_PATH,
  APP_STORE_PATH,
  APP_TEMP_PATH,
  getSystemPath,
  getUserPath,
  isAppMarkPath,
  isAppStorePath,
  relativeToAbsolute,
};
