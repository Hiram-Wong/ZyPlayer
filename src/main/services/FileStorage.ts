import type { Buffer } from 'node:buffer';

import { loggerService } from '@logger';
import { clearDir, ensureDir, readFile, saveFile } from '@main/utils/file';
import { APP_REQUIRE_PATH, APP_TEMP_PATH } from '@main/utils/path';
import { LOG_MODULE } from '@shared/config/logger';
import type { OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import { dialog, session, shell } from 'electron';
import { merge } from 'es-toolkit';

const logger = loggerService.withContext(LOG_MODULE.FILE_STORAGE);

class FileStorage {
  private static instance: FileStorage;
  private requireDir = APP_REQUIRE_PATH;

  constructor() {}

  public static getInstance(): FileStorage {
    if (!FileStorage.instance) {
      FileStorage.instance = new FileStorage();
    }
    return FileStorage.instance;
  }

  public initRequireDir = async (): Promise<void> => {
    try {
      for (const dir of this.requireDir) {
        await ensureDir(dir);
      }
    } catch (error) {
      logger.error('Failed to initialize storage:', error as Error);
      throw error;
    }
  };

  public clear = async (): Promise<void> => {
    try {
      for (const dir of this.requireDir) {
        await clearDir(dir);
      }
      await this.initRequireDir();
    } catch (error) {
      logger.error('Failed to clear storage:', error as Error);
      throw error;
    }
  };

  public clearTemp = async (): Promise<void> => {
    await clearDir(APP_TEMP_PATH);
  };

  public clearCache = async (): Promise<void> => {
    const sessions = [session.defaultSession, session.fromPartition('persist:webview')];

    await Promise.all(
      sessions.map(async (session) => {
        await session.clearCache();
        await session.clearStorageData({
          storages: [
            'indexdb',
            'localstorage',
            'cookies',
            'filesystem',
            'shadercache',
            'websql',
            'serviceworkers',
            'cachestorage',
          ],
        });
      }),
    );
  };

  public clearTempCache = async (): Promise<void> => {
    await this.clearCache();
    await this.clearTemp();
  };

  public selectFileDialog = async (options?: OpenDialogOptions): Promise<string[]> => {
    const defaultOptions: OpenDialogOptions = {
      properties: ['openFile', 'showHiddenFiles'],
      filters: [{ name: 'All Files', extensions: ['*'] }],
    };

    const dialogOptions: OpenDialogOptions = merge(defaultOptions, options || {});

    const result: OpenDialogReturnValue = await dialog.showOpenDialog(dialogOptions);

    if (result.canceled || !result.filePaths.length) {
      return [];
    }

    return result.filePaths;
  };

  public selectFolderDialog = async (options?: OpenDialogOptions): Promise<string[]> => {
    const defaultOptions: OpenDialogOptions = {
      properties: ['openDirectory', 'showHiddenFiles'],
    };

    const dialogOptions: OpenDialogOptions = merge(defaultOptions, options || {});

    const result: OpenDialogReturnValue = await dialog.showOpenDialog(dialogOptions);

    if (result.canceled || !result.filePaths.length) {
      return [];
    }

    return result.filePaths;
  };

  public saveFileDialog = async (options?: SaveDialogOptions): Promise<string> => {
    const defaultOptions: SaveDialogOptions = {
      properties: ['createDirectory', 'showHiddenFiles'],
    };

    const dialogOptions: SaveDialogOptions = merge(defaultOptions, options || {});

    const result: SaveDialogReturnValue = await dialog.showSaveDialog(dialogOptions);

    if (result.canceled || !result.filePath) {
      return '';
    }

    return result.filePath;
  };

  public selectFileRead = async (
    options?: OpenDialogOptions,
  ): Promise<{ path: string | null; content: string | null }> => {
    try {
      const paths = await this.selectFileDialog(options || {});
      if (!paths.length) return { path: null, content: null };

      const path = paths[0];
      const content = await readFile(path);
      return { path, content };
    } catch (error) {
      logger.error('An error occurred opening the file with read:', error as Error);
      return { path: null, content: null };
    }
  };

  public selectFolderWrite = async (
    content: string | Buffer,
    options?: SaveDialogOptions,
  ): Promise<{ path: string | null; status: boolean }> => {
    try {
      const path = await this.saveFileDialog(options || {});
      if (!path) return { path: null, status: false };

      const status = await saveFile(path, content);
      return { path, status };
    } catch (error) {
      logger.error('An error occurred opening the file with write:', error as Error);
      return { path: null, status: false };
    }
  };

  public openPath = async (path: string): Promise<void> => {
    shell.openPath(path).catch((error) => logger.error('Failed to open file:', error));
  };
}

export const fileStorage = FileStorage.getInstance();
