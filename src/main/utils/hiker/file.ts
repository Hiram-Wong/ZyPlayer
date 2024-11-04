import { app } from 'electron';
import { join } from 'path';

const APP_MARK = 'zy';
const APP_MARK_PATH = `${APP_MARK}://`;
const APP_STORE_PATH = join(app.getPath('userData'), 'docs');
const isCheckAppMark = (url: string) => url.startsWith(APP_MARK_PATH);
const isCheckAppStore = (url: string) => url.startsWith(APP_STORE_PATH);
const relative2absolute = (path: string) => {
  if (isCheckAppMark(path)) {
    return path.replace(APP_MARK_PATH, APP_STORE_PATH);
  }
  return path;
};
const absolute2relative = (path: string) => {
  if (isCheckAppStore(path)) {
    return path.replace(APP_STORE_PATH, APP_MARK_PATH);
  }
  return path;
};

const saveFile = (fileName: string, content: string, crypto: number = 0) => {};
const readFile = (fileName: string, crypto: number = 0) => {};
const deleteFile = (fileName: string) => {};
const fileExist = (fileName: string) => {};
const saveImage = (urls: string, path: '') => {};

const getParam = () => {};
