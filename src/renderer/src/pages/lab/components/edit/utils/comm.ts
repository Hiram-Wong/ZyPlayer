import type { ISiteType } from '@shared/config/film';
import { siteTypes } from '@shared/config/film';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { isNil, isStrEmpty } from '@shared/modules/validate';

import { DEBUG_PREFIX, SITE_PATH_MAP, SITE_SUFFIX_MAP } from './config';

const utilsReadFileDialog = async (filePath: string): Promise<string> => {
  const result = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FILE_SELECT_FOLDER_READ, {
    defaultPath: filePath,
    filters: [
      { name: 'JavaScript Files', extensions: ['js'] },
      { name: 'Py Files', extensions: ['py'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  return result?.content ?? '';
};

const utilsWriteFileDialog = async (filePath: string, content: string): Promise<boolean> => {
  const result = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FILE_SELECT_FILE_WRITE, content, {
    defaultPath: filePath,
  });
  return !!result?.status;
};

const utilsReadFileSilence = async (filePath: string): Promise<string> => {
  const result = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FS_FILE_READ, filePath);
  return result ?? '';
};

const utilsWriteFileSilence = async (filePath: string, content: string): Promise<boolean> => {
  const result = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FS_FILE_WRITE, filePath, content);
  return !!result;
};

const utilsCommonPath = async (): Promise<string> => {
  return await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PATH_SYSTEM, 'userData');
};

const utilsJoinPath = async (...paths: string[]): Promise<string> => {
  return await window.electron.ipcRenderer.invoke(IPC_CHANNEL.PATH_JOIN, ...paths);
};

export const openFolder = async (type?: ISiteType): Promise<void> => {
  const path = await getPath(type);
  await window.electron.ipcRenderer.invoke(IPC_CHANNEL.OPEN_PATH, path);
};

export const getPath = async (type?: ISiteType): Promise<string> => {
  const commonPath = await utilsCommonPath();

  if (isNil(type) || !siteTypes.includes(type)) return commonPath;

  const relativePath = SITE_PATH_MAP[type];
  if (isStrEmpty(relativePath)) return commonPath;

  return await utilsJoinPath(commonPath, relativePath);
};

export const readFile = async (type: ISiteType, mode: 'dialog' | 'silence' = 'silence'): Promise<string> => {
  const suffix = SITE_SUFFIX_MAP?.[type] ?? 'txt';
  const prefixPath = (await getPath(type)) ?? '';
  const path = await utilsJoinPath(prefixPath, `${DEBUG_PREFIX}.${suffix}`);
  return mode === 'dialog' ? await utilsReadFileDialog(path) : await utilsReadFileSilence(path);
};

export const writeFile = async (
  type: ISiteType,
  content: string,
  mode: 'dialog' | 'silence' = 'silence',
): Promise<boolean> => {
  const suffix = SITE_SUFFIX_MAP?.[type] ?? 'txt';
  const prefixPath = (await getPath(type)) ?? '';
  const path = await utilsJoinPath(prefixPath, `${DEBUG_PREFIX}.${suffix}`);
  return mode === 'dialog' ? await utilsWriteFileDialog(path, content) : await utilsWriteFileSilence(path, content);
};
