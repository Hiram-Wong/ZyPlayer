import { app } from 'electron';
import { join } from 'path';
import fs from 'fs-extra';
import { gzip } from '@main/utils/crypto';

const APP_MARK = 'zy';
const APP_MARK_PATH = `${APP_MARK}://`;
const APP_STORE_PATH = app.getPath('userData');
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

const joinPath = (path: string) => {
  if (isCheckAppMark(path)) {
    return join(path.replace(APP_MARK_PATH, APP_STORE_PATH));
  }
  if (isCheckAppStore(path)) {
    return join(path);
  }
  return join(APP_STORE_PATH, path);
};

const saveFile = (fileName: string, content: string, crypto: number = 0) => {
  try {
    if (!content || !fileName) return false;
    if (crypto !== 0) content = gzip.encode(content);
    fs.writeFileSync(joinPath(fileName), content, 'utf8');
    return true;
  } catch {
    return false;
  }
};

const saveJson = (fileName: string, content: object, crypto: number = 0) => {
  try {
    if (!content || !fileName) return false;
    fs.writeJsonSync(joinPath(fileName), content, 'utf8');
    return true;
  } catch {
    return false;
  }
};

const readFile = (fileName: string, crypto: number = 0) => {
  try {
    if (!fileName) return '';
    let content = fs.readFileSync(joinPath(fileName), 'utf8');
    if (crypto !== 0) content = gzip.encode(content);
    return content;
  } catch {
    return '';
  }
};

const readJson = (fileName: string, crypto: number = 0) => {
  const defaultData = JSON.parse(JSON.stringify(''));
  try {
    if (!fileName) return defaultData;
    let content = fs.readJSONSync(joinPath(fileName), 'utf8');
    if (crypto !== 0) content = gzip.encode(content);
    return content;
  } catch {
    return defaultData;
  }
};

const deleteFile = (fileName: string) => {
  try {
    if (!fileName) return false;
    fs.unlinkSync(joinPath(fileName));
    return true;
  } catch {
    return false;
  }
};

const fileExist = (fileName: string) => {
  try {
    if (!fileName) return false;
    return fs.existsSync(joinPath(fileName));
  } catch {
    return false;
  }
};

const fileState = (fileName: string) => {
  try {
    if (!fileName) return undefined;
    const stat = fs.statSync(joinPath(fileName));
    if (stat.isDirectory()) return 'dir';
    else return 'file';
  } catch {
    return undefined;
  }
};

const readDir = (path: string) => {
  try {
    if (!path) return [];
    return fs.readdirSync(joinPath(path));
  } catch {
    return [];
  }
};

const deleteDir = (path: string) => {
  try {
    if (!path) return false;
    fs.rmdirSync(joinPath(path), { recursive: true });
    return true;
  } catch {
    return false;
  }
};

const createDir = (path: string) => {
  try {
    if (!path) return false;
    fs.mkdirSync(joinPath(path), { recursive: true });
    return true;
  } catch {
    return false;
  }
};

export {
  APP_STORE_PATH,
  fileExist,
  fileState,
  deleteFile,
  readFile,
  saveFile,
  saveJson,
  readDir,
  readJson,
  deleteDir,
  createDir,
  relative2absolute,
  absolute2relative,
};
