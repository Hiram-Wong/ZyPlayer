import { Buffer } from 'node:buffer';
import { basename, dirname, extname, join } from 'node:path';

import { hash } from '@shared/modules/crypto';
import type { ISizeOption } from '@shared/modules/size';
import { calculateSize } from '@shared/modules/size';
import {
  isBase64,
  isBinary,
  isFunction,
  isJson,
  isPermissionNumber,
  isPositiveFiniteNumber,
  isStrEmpty,
  isString,
} from '@shared/modules/validate';
import { fdir as Fdir } from 'fdir';
import fs from 'fs-extra';
import JSON5 from 'json5';
import mime from 'mime-types';

import { relativeToAbsolute } from './path';

export type IFileState = 'file' | 'dir' | 'unknown';
export type IFileLink = 'link' | 'strict' | 'unknown';
export type IFileMode = fs.Mode;
export interface IFileMetadata {
  name: string;
  path: string;
  created_at: string;
  size: number;
  ext: string;
  mime: string;
}

const bufferEncoding: Array<BufferEncoding> = [
  'ascii',
  'utf8',
  'utf-8',
  'utf16le',
  'utf-16le',
  'ucs2',
  'ucs-2',
  'base64',
  'base64url',
  'latin1',
  'binary',
  'hex',
];

/**
 * Check if path exists
 * @param filePath File path
 * @returns Whether the path exists
 */
export const pathExist = async (filePath: string): Promise<boolean> => {
  if (isStrEmpty(filePath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    return await fs.pathExists(absolutePath);
  } catch {
    return false;
  }
};

/**
 * Synchronously check if path exists
 * @param filePath File path
 * @returns Whether the path exists
 */
export const pathExistSync = (filePath: string): boolean => {
  if (isStrEmpty(filePath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    return fs.pathExistsSync(absolutePath);
  } catch {
    return false;
  }
};

/**
 * Check if path is soft link
 * @param filePath File path
 * @returns Whether the path is soft link
 */
export const pathLink = async (filePath: string): Promise<IFileLink> => {
  if (!(await pathExist(filePath))) {
    return 'unknown';
  }

  try {
    const stats = await fs.lstat(filePath);
    if (stats.isSymbolicLink()) {
      return 'link';
    }
    return 'strict';
  } catch {
    return 'unknown';
  }
};

/**
 * Synchronously check if path is soft link
 * @param filePath File path
 * @returns Whether the path is soft link
 */
export const pathLinkSync = (filePath: string): IFileLink => {
  if (!pathExistSync(filePath)) {
    return 'unknown';
  }

  try {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      return 'link';
    }
    return 'strict';
  } catch {
    return 'unknown';
  }
};

/**
 * Get path state
 * @param filePath File path
 * @returns File state
 */
export const fileState = async (filePath: string): Promise<IFileState> => {
  if (!(await pathExist(filePath))) {
    return 'unknown';
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const state = await fs.stat(absolutePath);
    if (state.isFile()) return 'file';
    if (state.isDirectory()) return 'dir';
    return 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Synchronously check path state
 * @param filePath File path
 * @returns File state
 */
export const fileStateSync = (filePath: string): IFileState => {
  if (!pathExistSync(filePath)) {
    return 'unknown';
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const state = fs.statSync(absolutePath);
    if (state.isFile()) return 'file';
    if (state.isDirectory()) return 'dir';
    return 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Get file line count
 * @param filePath File path
 * @returns File line count
 */
export const fileLineCount = async (filePath: string): Promise<number> => {
  if (!(await pathExist(filePath))) {
    return 0;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const content = (await readFile(absolutePath, 'utf8')) || '';
    return content.split('\n').length;
  } catch {
    return 0;
  }
};

/**
 * Synchronously get file line count
 * @param filePath File path
 * @returns File line count
 */
export const fileLineCountSync = (filePath: string): number => {
  if (!pathExistSync(filePath)) {
    return 0;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const content = readFileSync(absolutePath, 'utf8') || '';
    return content.split('\n').length;
  } catch {
    return 0;
  }
};

/**
 * Get file permission
 * @param filePath File path
 * @returns File permission
 */
export const filePermission = async (
  filePath: string,
): Promise<{ read: boolean; writ: boolean; exec: boolean; code: number }> => {
  const defaultValue = { read: false, writ: false, exec: false, code: 0 };

  if (!(await pathExist(filePath))) {
    return defaultValue;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    const check = async (type: 'read' | 'writ' | 'exec'): Promise<boolean> => {
      try {
        const permit = {
          read: fs.constants.R_OK,
          writ: fs.constants.W_OK,
          exec: fs.constants.X_OK,
        };

        await fs.access(absolutePath, permit[type]);
        return true;
      } catch {
        return false;
      }
    };

    const read = await check('read');
    const writ = await check('writ');
    const exec = await check('exec');

    const code = ((read ? 4 : 0) + (writ ? 2 : 0) + (exec ? 1 : 0)) * 111;

    return { read, writ, exec, code };
  } catch {
    return defaultValue;
  }
};

/**
 * Synchronously get file permission
 * @param filePath File path
 * @returns File permission
 */
export const filePermissionSync = (filePath: string): { read: boolean; writ: boolean; exec: boolean; code: number } => {
  const defaultValue = { read: false, writ: false, exec: false, code: 0 };

  if (!pathExistSync(filePath)) {
    return defaultValue;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    const check = (type: 'read' | 'writ' | 'exec'): boolean => {
      try {
        const permit = {
          read: fs.constants.R_OK,
          writ: fs.constants.W_OK,
          exec: fs.constants.X_OK,
        };

        fs.accessSync(absolutePath, permit[type]);
        return true;
      } catch {
        return false;
      }
    };

    const read = check('read');
    const writ = check('writ');
    const exec = check('exec');

    const code = ((read ? 4 : 0) + (writ ? 2 : 0) + (exec ? 1 : 0)) * 111;

    return { read, writ, exec, code };
  } catch {
    return defaultValue;
  }
};

/**
 * Modify file permission
 * @param filePath File path
 * @param mode File permission
 * @returns Whether the operation was successful
 */
export const fileChmod = async (filePath: string, mode: IFileMode): Promise<boolean> => {
  if (!(await pathExist(filePath))) {
    return false;
  }

  if (!isPermissionNumber(mode)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const octalMode = Number.parseInt(mode.toString(), 8);
    await fs.chmod(absolutePath, octalMode);
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously modify file permission
 * @param filePath File path
 * @param mode File permission
 * @returns Whether the operation was successful
 */
export const fileChmodSync = (filePath: string, mode: IFileMode): boolean => {
  if (!pathExistSync(filePath)) {
    return false;
  }

  if (!isPermissionNumber(mode)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const octalMode = Number.parseInt(mode.toString(), 8);
    fs.chmodSync(absolutePath, octalMode);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file metadata
 * @param filePath File path
 * @returns File metadata
 */
export const fileMetadata = async (filePath: string): Promise<IFileMetadata> => {
  const defaultValue: IFileMetadata = { name: '', ext: '', path: '', size: 0, created_at: '', mime: 'unknown' };

  if (!(await pathExist(filePath))) {
    return defaultValue;
  }

  if ((await fileState(filePath)) !== 'file') {
    return defaultValue;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const stats = await fs.stat(absolutePath);
    return {
      name: basename(absolutePath),
      ext: extname(absolutePath).slice(1),
      mime: mime.lookup(absolutePath) || 'unknown',
      path: absolutePath,
      size: stats.size,
      created_at: stats.birthtime.toISOString(),
    };
  } catch {
    return defaultValue;
  }
};

/**
 * Synchronously get file metadata
 * @param filePath File path
 * @returns File metadata
 */
export const fileMetadataSync = (filePath: string): IFileMetadata => {
  const defaultValue: IFileMetadata = { name: '', ext: '', path: '', size: 0, created_at: '', mime: 'unknown' };

  if (!pathExistSync(filePath)) {
    return defaultValue;
  }

  if (fileStateSync(filePath) !== 'file') {
    return defaultValue;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const stats = fs.statSync(absolutePath);
    return {
      name: basename(absolutePath),
      ext: extname(absolutePath).slice(1),
      mime: mime.lookup(absolutePath) || 'unknown',
      path: absolutePath,
      size: stats.size,
      created_at: stats.birthtime.toISOString(),
    };
  } catch {
    return defaultValue;
  }
};

/**
 * Compute file hash
 * @param filePath File path
 * @returns File hash
 */
export const fileHash = async (filePath: string, algo: 'sha1' | 'sha256' | 'md5' = 'md5'): Promise<string> => {
  if (!(await pathExist(filePath))) {
    return '';
  }

  if ((await fileState(filePath)) !== 'file') {
    return '';
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const content = await readFile(absolutePath);
    switch (algo) {
      case 'sha1':
        return hash.sha1({ src: content! });
      case 'sha256':
        return hash.sha256({ src: content! });
      case 'md5':
      default:
        return hash['md5-32']({ src: content! });
    }
  } catch {
    return '';
  }
};

/**
 * Synchronously compute file hash
 * @param filePath File path
 * @returns File hash
 */
export const fileHashSync = async (filePath: string, algo: 'sha1' | 'sha256' | 'md5' = 'md5'): Promise<string> => {
  if (!pathExistSync(filePath)) {
    return '';
  }

  if (fileStateSync(filePath) !== 'file') {
    return '';
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const content = readFileSync(absolutePath);
    switch (algo) {
      case 'sha1':
        return hash.sha1({ src: content! });
      case 'sha256':
        return hash.sha256({ src: content! });
      case 'md5':
      default:
        return hash['md5-32']({ src: content! });
    }
  } catch {
    return '';
  }
};

/**
 * Copy a file or directory. The directory can have contents.
 * @param srcPath src file path
 * @param destPath dest file path
 * @returns Whether the copy was successful
 */
export const fileCopy = async (srcPath: string, destPath: string): Promise<boolean> => {
  if (!(await pathExist(srcPath))) {
    return false;
  }

  try {
    const absoluteSrcPath = relativeToAbsolute(srcPath);
    const absoluteDestPath = relativeToAbsolute(destPath);

    const copyStat = await fileState(srcPath);
    if (copyStat === 'unknown') return false;
    const destDir = copyStat === 'file' ? dirname(destPath) : destPath;
    const stats = await ensureDir(destDir);
    if (!stats) {
      return false;
    }

    await fs.copy(absoluteSrcPath, absoluteDestPath, { overwrite: true });
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously copy a file or directory. The directory can have contents.
 * @param srcPath src file path
 * @param destPath dest file path
 * @returns Whether the copy was successful
 */
export const fileCopySync = (srcPath: string, destPath: string): boolean => {
  if (!pathExistSync(srcPath)) {
    return false;
  }

  try {
    const absoluteSrcPath = relativeToAbsolute(srcPath);
    const absoluteDestPath = relativeToAbsolute(destPath);

    const copyStat = fileStateSync(srcPath);
    if (copyStat === 'unknown') return false;
    const destDir = copyStat === 'file' ? dirname(destPath) : destPath;
    const stats = ensureDirSync(destDir);
    if (!stats) {
      return false;
    }

    fs.copySync(absoluteSrcPath, absoluteDestPath, { overwrite: true });
    return true;
  } catch {
    return false;
  }
};

/**
 * Move a file or directory, even across devices
 * @param srcPath src file path
 * @param destPath dest file path
 * @returns Whether the move was successful
 */
export const fileMove = async (srcPath: string, destPath: string): Promise<boolean> => {
  if (!(await pathExist(srcPath))) {
    return false;
  }

  try {
    const absoluteSrcPath = relativeToAbsolute(srcPath);
    const absoluteDestPath = relativeToAbsolute(destPath);

    const copyStat = await fileState(srcPath);
    if (copyStat === 'unknown') return false;
    const destDir = copyStat === 'file' ? dirname(destPath) : destPath;
    const stats = await ensureDir(destDir);
    if (!stats) {
      return false;
    }

    await fs.move(absoluteSrcPath, absoluteDestPath, { overwrite: true });
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously move a file or directory, even across devices
 * @param srcPath src file path
 * @param destPath dest file path
 * @returns Whether the move was successful
 */
export const fileMoveSync = (srcPath: string, destPath: string): boolean => {
  if (!pathExistSync(srcPath)) {
    return false;
  }

  try {
    const absoluteSrcPath = relativeToAbsolute(srcPath);
    const absoluteDestPath = relativeToAbsolute(destPath);

    const copyStat = fileStateSync(srcPath);
    if (copyStat === 'unknown') return false;
    const destDir = copyStat === 'file' ? dirname(destPath) : destPath;
    const stats = ensureDirSync(destDir);
    if (!stats) {
      return false;
    }

    fs.moveSync(absoluteSrcPath, absoluteDestPath, { overwrite: true });
    return true;
  } catch {
    return false;
  }
};

/**
 * Rename the file or directory from oldPath to newPath
 * @param filePath file path
 * @param newName new file name
 * @returns Whether the rename was successful
 */
export const fileRename = async (filePath: string, newName: string): Promise<boolean> => {
  if (!(await pathExist(filePath))) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const newFilePath = join(dirname(absolutePath), newName);
    await fs.rename(absolutePath, newFilePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously rename the file or directory from oldPath to newPath
 * @param filePath file path
 * @param newName new file name
 * @returns Whether the rename was successful
 */
export const fileRenameSync = (filePath: string, newName: string): boolean => {
  if (!pathExistSync(filePath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const newFilePath = join(dirname(absolutePath), newName);
    fs.renameSync(absolutePath, newFilePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Save file (supports string and Buffer)
 * @param filePath File path
 * @param content File content (string or Buffer)
 * @param encoding File encoding, defaults to utf8 (only applies to strings)
 * @returns Whether the save was successful
 */
export const saveFile = async (
  filePath: string,
  content: string | Buffer = '',
  encoding: BufferEncoding = 'utf8',
): Promise<boolean> => {
  if (isStrEmpty(filePath)) {
    return false;
  }

  if (!isString(content) && !isBinary(content)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    if (isString(content)) {
      await fs.outputFile(absolutePath, content, encoding);
      return true;
    } else if (isBinary(content)) {
      const binary = Buffer.from(content);
      await fs.outputFile(absolutePath, binary);
      return true;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously save file (supports string and Buffer)
 * @param filePath File path
 * @param content File content (string or Buffer)
 * @param encoding File encoding, defaults to utf8 (only applies to strings)
 * @returns Whether the save was successful
 */
export const saveFileSync = (
  filePath: string,
  content: string | Buffer = '',
  encoding: BufferEncoding = 'utf8',
): boolean => {
  if (isStrEmpty(filePath)) {
    return false;
  }

  if (!isString(content) && !isBinary(content)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    if (isString(content)) {
      fs.outputFileSync(absolutePath, content, encoding);
      return true;
    } else if (isBinary(content)) {
      const binary = Buffer.from(content);
      fs.outputFileSync(absolutePath, binary);
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

/**
 * Read file (supports string and NonSharedBuffer)
 * @param filePath File path
 * @param encoding File encoding, defaults to utf8, pass null to return NonSharedBuffer
 * @returns File content (string or NonSharedBuffer), returns null on failure
 */
export const readFile = async <T extends BufferEncoding | null = 'utf8'>(
  filePath: string,
  encoding: T = 'utf8' as T,
): Promise<T extends null ? NonSharedBuffer | null : string | null> => {
  if (!(await pathExist(filePath))) {
    return null;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    const state = fileStateSync(absolutePath);
    if (state !== 'file') {
      return null;
    }

    const encodingFormat = encoding !== null && bufferEncoding.includes(encoding) ? encoding : null;
    const content = await fs.readFile(absolutePath, { encoding: encodingFormat });
    return content as T extends null ? NonSharedBuffer | null : string | null;
  } catch {
    return null;
  }
};

/**
 * Synchronously read file (supports string and NonSharedBuffer)
 * @param filePath File path
 * @param encoding File encoding, defaults to utf8, pass null to return NonSharedBuffer
 * @returns File content (string or NonSharedBuffer), returns null on failure
 */
export const readFileSync = <T extends BufferEncoding | null = 'utf8'>(
  filePath: string,
  encoding: T = 'utf8' as T,
): T extends null ? NonSharedBuffer | null : string | null => {
  if (!pathExistSync(filePath)) {
    return null;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    const state = fileStateSync(absolutePath);
    if (state !== 'file') {
      return null;
    }

    const encodingFormat = encoding !== null && bufferEncoding.includes(encoding) ? encoding : null;
    const content = fs.readFileSync(absolutePath, { encoding: encodingFormat });
    return content as T extends null ? NonSharedBuffer | null : string | null;
  } catch {
    return null;
  }
};

/**
 * Save JSON file
 * @param filePath File path
 * @param content JSON object
 * @param spaces Number of spaces for indentation, defaults to 2
 * @returns Whether the save was successful
 */
export const saveJson = async (filePath: string, content: object = {}, spaces: number = 2): Promise<boolean> => {
  if (isStrEmpty(filePath)) {
    return false;
  }

  if (!isJson(content)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const contentFormat = JSON5.parse(JSON.stringify(content));
    const spacesFormat = isPositiveFiniteNumber(spaces) ? spaces : 2;
    await fs.outputJson(absolutePath, contentFormat, { spaces: spacesFormat });
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously save JSON file
 * @param filePath File path
 * @param content JSON object
 * @param spaces Number of spaces for indentation, defaults to 2
 * @returns Whether the save was successful
 */
export const saveJsonSync = (filePath: string, content: object = {}, spaces: number = 2): boolean => {
  if (isStrEmpty(filePath)) {
    return false;
  }

  if (!isJson(content)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    const contentFormat = JSON5.parse(JSON.stringify(content));
    const spacesFormat = isPositiveFiniteNumber(spaces) ? spaces : 2;
    fs.outputJsonSync(absolutePath, contentFormat, { spaces: spacesFormat });
    return true;
  } catch {
    return false;
  }
};

/**
 * Read JSON file
 * @param filePath File path
 * @returns JSON object, returns null on failure
 */
export const readJson = async (filePath: string): Promise<any | null> => {
  if (!(await pathExist(filePath))) {
    return null;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    if (!(await pathExist(absolutePath))) {
      return null;
    }

    const state = await fileState(absolutePath);
    if (state !== 'file') {
      return null;
    }

    const content = await fs.readJson(absolutePath);
    return content;
  } catch {
    return null;
  }
};

/**
 * Synchronously read JSON file
 * @param filePath File path
 * @returns JSON object, returns null on failure
 */
export const readJsonSync = (filePath: string): any | null => {
  if (!pathExistSync(filePath)) {
    return null;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    if (!pathExistSync(absolutePath)) {
      return null;
    }

    const state = fileStateSync(absolutePath);
    if (state !== 'file') {
      return null;
    }

    const content = fs.readJsonSync(absolutePath);
    return content;
  } catch {
    return null;
  }
};

/**
 * Save image from base64
 * @param filePath File path
 * @param base64Data Base64 data
 * @returns Whether the save was successful
 */
export const saveImageBase64 = async (filePath: string, base64Data: string): Promise<boolean> => {
  if (isStrEmpty(filePath)) {
    return false;
  }

  if (!isBase64(base64Data)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    const base64String = base64Data.replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');

    await saveFile(absolutePath, buffer);

    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously save image from base64
 * @param filePath File path
 * @param base64Data Base64 data
 * @returns Whether the save was successful
 */
export const saveImageBase64Sync = (filePath: string, base64Data: string): boolean => {
  if (isStrEmpty(filePath)) {
    return false;
  }

  if (!isBase64(base64Data)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    const base64String = base64Data.replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');

    saveFileSync(absolutePath, buffer);

    return true;
  } catch {
    return false;
  }
};

/**
 * Read image file as base64
 * @param filePath File path
 * @returns Base64 encoded image data, returns null on failure
 */
export const readImageBase64 = async (filePath: string): Promise<string | null> => {
  if (!(await pathExist(filePath))) {
    return null;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    if (!(await pathExist(absolutePath))) {
      return null;
    }

    const state = await fileState(absolutePath);
    if (state !== 'file') {
      return null;
    }

    const mimeinfo = mime.lookup(absolutePath);
    if (!mimeinfo || !mimeinfo.startsWith('image')) {
      return null;
    }

    const ext = extname(filePath).slice(1);
    const content = await readFile(absolutePath, 'base64');
    return `data:${ext};base64,${content}`;
  } catch {
    return null;
  }
};

/**
 * Synchronously read image file as base64
 * @param filePath File path
 * @returns Base64 encoded image data, returns null on failure
 */
export const readImageBase64Sync = (filePath: string): string | null => {
  if (!pathExistSync(filePath)) {
    return null;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);

    if (!pathExistSync(absolutePath)) {
      return null;
    }

    const state = fileStateSync(absolutePath);
    if (state !== 'file') {
      return null;
    }

    const mimeinfo = mime.lookup(absolutePath);
    if (!mimeinfo || !mimeinfo.startsWith('image')) {
      return null;
    }

    const ext = extname(filePath).slice(1);
    const content = readFileSync(absolutePath, 'base64');
    return `data:${ext};base64,${content}`;
  } catch {
    return null;
  }
};

/**
 * Delete file or directory
 * @param filePath File path
 * @returns Whether the deletion was successful
 */
export const fileDelete = async (filePath: string): Promise<boolean> => {
  if (!(await pathExist(filePath))) {
    return true;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    await fs.remove(absolutePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously delete file or directory
 * @param filePath File path
 * @returns Whether the deletion was successful
 */
export const fileDeleteSync = (filePath: string): boolean => {
  if (!pathExistSync(filePath)) {
    return true;
  }

  try {
    const absolutePath = relativeToAbsolute(filePath);
    fs.removeSync(absolutePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Read directory contents
 * @param dirPath Directory path
 * @returns Array of directory contents, returns null on failure
 */
export const readDir = async (dirPath: string): Promise<string[]> => {
  if (!(await pathExist(dirPath))) {
    return [];
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);

    const state = await fileState(absolutePath);
    if (state === 'file') {
      return [absolutePath];
    }

    const entries = await fs.readdir(absolutePath);
    return entries;
  } catch {
    return [];
  }
};

/**
 * Read directory contents faster
 * @see https://github.com/thecodrr/fdir
 *
 * @param dirPath Directory path
 * @param depth Maximum depth, default is 0
 * @param exclude Exclude callback function
 * @param include Include callback function
 * @returns Array of directory contents, returns null on failure
 */
export const readDirFaster = async (
  dirPath: string,
  depth: number = 0,
  exclude?: (path: string, isDirectory: boolean) => boolean,
  include?: (path: string, isDirectory: boolean) => boolean,
): Promise<string[]> => {
  if (!(await pathExist(dirPath))) {
    return [];
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);

    const state = await fileState(absolutePath);
    if (state === 'file') {
      return [absolutePath];
    }

    const api = new Fdir()
      .withFullPaths()
      .withDirs()
      .filter((path: string, isDirectory: boolean) => {
        if (!isDirectory && path.endsWith('.DS_Store')) return false;
        if (exclude && isFunction(exclude) && exclude(path, isDirectory)) return false;
        if (include && isFunction(include) && !include(path, isDirectory)) return false;
        return true;
      });
    if (isPositiveFiniteNumber(depth)) api.withMaxDepth(depth);

    const entries = await api.crawl(absolutePath).withPromise();
    return entries;
  } catch {
    return [];
  }
};

/**
 * Synchronously read directory contents
 * @param dirPath Directory path
 * @returns Array of directory contents, returns null on failure
 */
export const readDirSync = (dirPath: string): Array<string> => {
  if (!pathExistSync(dirPath)) {
    return [];
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);

    const state = fileStateSync(absolutePath);
    if (state === 'file') {
      return [absolutePath];
    }

    const entries = fs.readdirSync(absolutePath);
    return entries;
  } catch {
    return [];
  }
};

/**
 * Synchronously read  directory contents faster
 * @see https://github.com/thecodrr/fdir
 *
 * @param dirPath Directory path
 * @param depth Maximum depth, default is 0
 * @param exclude Exclude callback function
 * @param include Include callback function
 * @returns Array of directory contents, returns null on failure
 */
export const readDirFasterSync = (
  dirPath: string,
  depth: number = 0,
  exclude?: (path: string, isDirectory: boolean) => boolean,
  include?: (path: string, isDirectory: boolean) => boolean,
): string[] => {
  if (!pathExistSync(dirPath)) {
    return [];
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);

    const state = fileStateSync(absolutePath);
    if (state === 'file') {
      return [absolutePath];
    }

    const api = new Fdir()
      .withFullPaths()
      .withDirs()
      .filter((path: string, isDirectory: boolean) => {
        if (!isDirectory && path.endsWith('.DS_Store')) return false;
        if (exclude && isFunction(exclude) && exclude(path, isDirectory)) return false;
        if (include && isFunction(include) && !include(path, isDirectory)) return false;
        return true;
      });
    if (isPositiveFiniteNumber(depth)) api.withMaxDepth(depth);

    const entries = api.crawl(absolutePath).sync();
    return entries;
  } catch {
    return [];
  }
};

/**
 * Create directory
 * @param dirPath Directory path
 * @returns Whether the creation was successful
 */
export const createDir = async (dirPath: string): Promise<boolean> => {
  if (isStrEmpty(dirPath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);
    await fs.ensureDir(absolutePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously create directory
 * @param dirPath Directory path
 * @returns Whether the creation was successful
 */
export const createDirSync = (dirPath: string): boolean => {
  if (isStrEmpty(dirPath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);
    fs.ensureDirSync(absolutePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file or directory size
 * @param dirPath File or directory path
 * @param ignoreLink Whether to ignore symbolic links (default: true)
 * @param unit Output size unit (optional, auto-select if not specified)
 * @returns Size information, returns {format: 0, unit: 'B', formatted: '0B'} on failure
 */
export const fileSize = async (
  dirPath: string,
  ignoreLink: boolean = true,
  unit: ISizeOption['unit'] = 'auto',
): Promise<{ size: number; unit: string; format: string }> => {
  if (!(await pathExist(dirPath))) {
    return { size: 0, unit: 'B', format: '0B' };
  }

  const processedInodes = new Set<string | number>();

  try {
    const absolutePath = relativeToAbsolute(dirPath);
    const bytes = await calculateBytes(absolutePath);
    const size = calculateSize(bytes, { unit });
    const res = {
      size: size.count,
      unit: size.unit,
      format: `${size.count}${size.unit}`,
    };
    return res;
  } catch {
    return { size: 0, unit: 'B', format: '0B' };
  }

  async function calculateBytes(itemPath: string): Promise<number> {
    if (!(await pathExist(itemPath))) {
      return 0;
    }

    try {
      // check if it's a symbolic link
      if (ignoreLink) {
        const linkState = await pathLink(itemPath);
        if (linkState === 'link') {
          return 0;
        }
      }

      const stats = await fs.lstat(itemPath);

      // check if it's already been processed
      if (processedInodes.has(stats.ino)) {
        return 0;
      }
      processedInodes.add(stats.ino);

      // If it's a file, return the size directly
      if (stats.isFile()) {
        return stats.size;
      }

      // If it's a directory, recursively calculate the content size
      if (stats.isDirectory()) {
        const entries = await readDir(itemPath);

        if (!entries || entries.length === 0) {
          return 0;
        }

        const sizes = await Promise.all(entries.map((entry) => calculateBytes(join(itemPath, entry))));

        return sizes.reduce((total, size) => total + size, 0);
      }

      return 0;
    } catch {
      return 0;
    }
  }
};

/**
 * Synchronously get file or directory size
 * @param dirPath File or directory path
 * @param ignoreLink Whether to ignore symbolic links (default: true)
 * @param unit Output size unit (optional, auto-select if not specified)
 * @returns Size information, returns {size: 0, unit: 'B', format: '0B'} on failure
 */
export const fileSizeSync = (
  dirPath: string,
  ignoreLink: boolean = true,
  unit: ISizeOption['unit'] = 'auto',
): { size: number; unit: string; format: string } => {
  if (!pathExistSync(dirPath)) {
    return { size: 0, unit: 'B', format: '0B' };
  }

  // Track processed inodes to avoid counting hard links multiple times
  const processedInodes = new Set<string | number>();

  try {
    const absolutePath = relativeToAbsolute(dirPath);
    const bytes = calculateBytesSync(absolutePath);
    const size = calculateSize(bytes, { unit });
    const res = {
      size: size.count,
      unit: size.unit,
      format: `${size.count}${size.unit}`,
    };
    return res;
  } catch {
    return { size: 0, unit: 'B', format: '0B' };
  }

  function calculateBytesSync(itemPath: string): number {
    if (!pathExistSync(itemPath)) {
      return 0;
    }

    try {
      // Check if it's a symbolic link
      if (ignoreLink) {
        const linkState = pathLinkSync(itemPath);
        if (linkState === 'link') {
          return 0;
        }
      }

      const stats = fs.lstatSync(itemPath);

      // Check if it's already been processed (avoid counting hard links multiple times)
      if (processedInodes.has(stats.ino)) {
        return 0;
      }
      processedInodes.add(stats.ino);

      // If it's a file, return the size directly
      if (stats.isFile()) {
        return stats.size;
      }

      // If it's a directory, recursively calculate the content size
      if (stats.isDirectory()) {
        const entries = readDirSync(itemPath);

        if (!entries || entries.length === 0) {
          return 0;
        }

        // Calculate total size by summing all entries
        let totalSize = 0;
        for (const entry of entries) {
          const entryPath = join(itemPath, entry);
          totalSize += calculateBytesSync(entryPath);
        }

        return totalSize;
      }

      return 0;
    } catch {
      return 0;
    }
  }
};

/**
 * Ensure directory exists
 * @param dirPath Directory path
 * @returns Whether the operation was successful
 */
export const ensureDir = async (dirPath: string): Promise<boolean> => {
  if (isStrEmpty(dirPath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);

    if (!(await pathExist(absolutePath))) {
      await createDir(absolutePath);
    } else {
      const state = await fileState(absolutePath);
      if (state !== 'dir') {
        await fileDelete(absolutePath);
        await createDir(absolutePath);
      }
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously ensure directory exists
 * @param dirPath Directory path
 * @returns Whether the operation was successful
 */
export const ensureDirSync = (dirPath: string): boolean => {
  if (isStrEmpty(dirPath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);

    if (!pathExistSync(absolutePath)) {
      createDirSync(absolutePath);
    } else {
      const state = fileStateSync(absolutePath);
      if (state !== 'dir') {
        fileDeleteSync(absolutePath);
        createDirSync(absolutePath);
      }
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Clear directory contents
 * @param dirPath Directory path
 * @returns Whether the operation was successful
 */
export const clearDir = async (dirPath: string): Promise<boolean> => {
  if (isStrEmpty(dirPath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);

    if (!(await pathExist(absolutePath))) {
      await createDir(absolutePath);
    } else {
      const state = await fileState(absolutePath);
      if (state !== 'dir') {
        await fileDelete(absolutePath);
        await createDir(absolutePath);
      } else {
        await fs.emptyDir(absolutePath);
      }
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Synchronously clear directory contents
 * @param dirPath Directory path
 * @returns Whether the operation was successful
 */
export const clearDirSync = (dirPath: string): boolean => {
  if (isStrEmpty(dirPath)) {
    return false;
  }

  try {
    const absolutePath = relativeToAbsolute(dirPath);

    if (!pathExistSync(absolutePath)) {
      createDirSync(absolutePath);
    } else {
      const state = fileStateSync(absolutePath);
      if (state !== 'dir') {
        fileDeleteSync(absolutePath);
        createDirSync(absolutePath);
      } else {
        fs.emptyDirSync(absolutePath);
      }
    }
    return true;
  } catch {
    return false;
  }
};

export default {
  pathExist,
  pathExistSync,
  pathLink,
  pathLinkSync,
  fileState,
  fileStateSync,
  filePermission,
  filePermissionSync,
  fileChmod,
  fileChmodSync,
  fileLineCount,
  fileLineCountSync,
  fileMetadata,
  fileMetadataSync,
  fileDelete,
  fileDeleteSync,
  fileSize,
  fileSizeSync,
  fileHash,
  fileHashSync,
  fileCopy,
  fileCopySync,
  fileMove,
  fileMoveSync,
  fileRename,
  fileRenameSync,
  saveFile,
  saveFileSync,
  readFile,
  readFileSync,
  saveJson,
  saveJsonSync,
  readJson,
  readJsonSync,
  saveImageBase64,
  saveImageBase64Sync,
  readImageBase64,
  readImageBase64Sync,
  readDir,
  readDirFaster,
  readDirSync,
  readDirFasterSync,
  createDir,
  createDirSync,
  ensureDir,
  ensureDirSync,
  clearDir,
  clearDirSync,
};
