import { app } from 'electron';
import { join } from 'path';

type AppDefaultPath =
  | 'home'
  | 'appData'
  | 'userData'
  | 'sessionData'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'
  | 'recent'
  | 'logs'
  | 'crashDumps'

type AppPath = 'runtime' | 'resources' | AppDefaultPath;

const getAppDefaultPath = (name: AppPath): string => {
  // 定义支持的路径名称
  const appPaths = ['home', 'appData', 'userData', 'sessionData', 'temp', 'exe', 'module', 'desktop', 'documents', 'downloads', 'music', 'pictures', 'videos', 'recent', 'logs', 'crashDumps'];

  // 运行状态路径
  if (name === 'runtime') {
    return app.getAppPath();
  }

  // 公告文件夹路径
  if (name === 'resources') {
    const resourcesPath = join(app.getAppPath(), 'resources');
    return app.isPackaged ? resourcesPath.replace("app.asar", "app.asar.unpacked") : resourcesPath;
  }

  // 检查是否是支持的路径名称
  if (appPaths.includes(name)) {
    return app.getPath(name as AppDefaultPath);
  }

  // 如果名称不匹配，返回空字符串
  return '';
};

const APP_MARK = 'zy';
const APP_MARK_PATH = `${APP_MARK}://`;

const APP_STORE_PATH = getAppDefaultPath('userData');
const APP_TMP_PATH = join(APP_STORE_PATH, 'tmp');
const APP_DB_PATH = join(APP_STORE_PATH, 'database');
const APP_LOG_PATH = join(APP_STORE_PATH, 'log');
const APP_PLUGIN_PATH = join(APP_STORE_PATH, 'plugin');
const APP_FILE_PATH = join(APP_STORE_PATH, 'file');

const APP_PUBLIC_PATH = getAppDefaultPath('resources');
const APP_RUNTIME_PATH = getAppDefaultPath('runtime');

// 检查路径是否以特定前缀开头
const isAppMarkPath = (url: string): boolean => url.startsWith(APP_MARK_PATH);
const isAppStorePath = (url: string): boolean => url.startsWith(APP_STORE_PATH);

// 路径转换：相对路径转绝对路径
const relativeToAbsolute = (path: string): string => {
  return isAppMarkPath(path) ? path.replace(APP_MARK_PATH, APP_STORE_PATH) : path;
};

// 路径转换：绝对路径转相对路径
const absoluteToRelative = (path: string): string => {
  return isAppStorePath(path) ? path.replace(APP_STORE_PATH, APP_MARK_PATH) : path;
};

export {
  APP_MARK,
  APP_MARK_PATH,
  APP_STORE_PATH,
  APP_TMP_PATH,
  APP_DB_PATH,
  APP_LOG_PATH,
  APP_PLUGIN_PATH,
  APP_FILE_PATH,
  APP_PUBLIC_PATH,
  APP_RUNTIME_PATH,
  isAppMarkPath,
  isAppStorePath,
  getAppDefaultPath,
  relativeToAbsolute,
  absoluteToRelative,
};
