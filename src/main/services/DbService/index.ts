import { join } from 'node:path';

import { createClient } from '@libsql/client';
import { loggerService } from '@logger';
import type { IStoreKey } from '@main/services/ConfigManager';
import { configManager, STORE_KEYS } from '@main/services/ConfigManager';
import { ICloudStorage, WebdavStorage } from '@main/services/StorageService';
import { fileDelete } from '@main/utils/file';
import { APP_DATABASE_PATH } from '@main/utils/path';
import { LOG_MODULE } from '@shared/config/logger';
import type { ISetting, ISettingKey } from '@shared/config/tblSetting';
import { isArrayEmpty, isObjectEmpty } from '@shared/modules/validate';
import type { IClient, IConfig, IMigrations, IModels, IOrm, ITableName } from '@shared/types/db';
import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import semver from 'semver';

import operater from './crud';
import { initMigrate, latestVersion, updateMigrate } from './migrations';
import { schemas, tableNames } from './schemas';

const logger = loggerService.withContext(LOG_MODULE.DATABASE);

export class DbService {
  private static instance: DbService | null = null;
  private dbURI: string = '';
  private client: IClient | null = null;
  private orm: IOrm | null = null;
  private watcher: FSWatcher | null = null;
  private subscribers: Map<string, Array<(newValue: any) => void>> = new Map();

  private constructor() {
    this.dbURI = `file:${join(APP_DATABASE_PATH, 'data.db')}`;
  }

  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  public static reload(): DbService {
    if (DbService.instance) {
      DbService.instance.close();
    }
    DbService.instance = new DbService();
    return DbService.instance;
  }

  /**
   * Connect to database
   */
  private conn(): void {
    const DB_CONFIG: IConfig = {
      url: this.dbURI,
    };

    if (!this.client) this.client = createClient(DB_CONFIG);
    if (!this.orm) this.orm = drizzle({ client: this.client, schema: schemas });
  }

  public async cloudBackup(
    type: ISetting['cloud']['type'],
    options: Omit<ISetting['cloud'], 'type' | 'sync'>,
  ): Promise<boolean> {
    try {
      const { url, username, password } = options || {};
      const content = await this.db.all();

      if (type === 'webdav') {
        const webdav = new WebdavStorage();
        await webdav.initClient({ url, username, password });
        await webdav.putFileContents('config.json', JSON.stringify(content));
      } else if (type === 'icloud') {
        const icloud = new ICloudStorage();
        await icloud.putFileContents('config.json', JSON.stringify(content));
      }
      return true;
    } catch {
      return false;
    }
  }

  public async cloudResume(
    type: ISetting['cloud']['type'],
    options: Omit<ISetting['cloud'], 'type' | 'sync'>,
  ): Promise<boolean> {
    try {
      const { url, username, password } = options || {};

      if (type === 'webdav') {
        const webdav = new WebdavStorage();
        await webdav.initClient({ url, username, password });
        const text = await webdav.getFileContents('config.json');
        const content = JSON.parse(text as string);
        await this.db.init(content);
      } else if (type === 'icloud') {
        const icloud = new ICloudStorage();
        const text = await icloud.getFileContents('config.json');
        const content = JSON.parse(text as string);
        await this.db.init(content);
      }
      return true;
    } catch {
      return false;
    }
  }

  private startWatcher(): void {
    const path = this.dbURI.replace('file:', '');

    this.watcher = chokidar.watch(path, {
      awaitWriteFinish: {
        stabilityThreshold: 500,
      },
    });

    this.watcher.on('change', async () => {
      try {
        const cloudConf = await this.setting.getValue('cloud');
        const { sync = false, type, ...options } = cloudConf || {};

        if (sync) {
          await this.cloudBackup(type, options);
        }
      } catch (error) {
        logger.error('Failed to cloud sync:', error as Error);
      }

      try {
        this.dbSyncStore();
      } catch (error) {
        logger.error('Failed to local sync:', error as Error);
      }
    });
  }

  private async stopWatcher(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
    }
    this.watcher = null;
  }

  /**
   * Close database connection
   */
  public async close() {
    if (this.client) {
      this.client.close();
      this.client = null;
      this.orm = null;
    }
    if (this.watcher) {
      await this.stopWatcher();
    }
  }

  /**
   * Get current database version
   * @returns string
   */
  private async getDbVersion(): Promise<string> {
    if (!this.client || !this.orm) {
      return '0.0.0';
    }

    try {
      const dbRes = (await this.setting.getValue('version')) || '0.0.0';
      const version = semver.valid(dbRes) || '0.0.0';
      return version;
    } catch {
      return '0.0.0';
    }
  }

  /**
   * Migrate database to the latest version
   */
  public async migrate(): Promise<void> {
    if (!this.client || !this.orm) {
      return;
    }

    const dbVersion = await this.getDbVersion();
    logger.info(`Current version: ${dbVersion}`);

    if (semver.gte(dbVersion, latestVersion)) return;

    const migrationList: IMigrations =
      dbVersion === '0.0.0' ? [initMigrate] : updateMigrate.filter((m) => semver.gt(m.version, dbVersion));

    for (const { version, migrate } of migrationList) {
      try {
        await migrate(this.orm, schemas);
        await this.orm
          .update(schemas.setting)
          .set({ value: { data: dbVersion === '0.0.0' ? latestVersion : version } })
          .where(eq(schemas.setting.key, 'version'));

        logger.info(`Migrate to ${version} success`);
      } catch (error) {
        if (dbVersion === '0.0.0') {
          await fileDelete(this.dbURI);
        }
        throw new Error(`Migrate to ${version} failed: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  /**
   * Sync database to config manager
   */
  private async dbSyncStore(): Promise<void> {
    const config = await this.setting.all();

    STORE_KEYS.forEach((key) => {
      if (config[key] !== undefined) {
        configManager.set(key as IStoreKey, config[key] as any);
      }
    });
  }

  /**
   * Initialize the database connection and create tables
   */
  public async init(): Promise<void> {
    try {
      this.conn();
      await this.migrate();
      await this.dbSyncStore();
      this.startWatcher();

      logger.info('Initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error as Error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public subscribe<T>(key: string, callback: (newValue: T) => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key)!.push(callback);
  }

  public unsubscribe<T>(key: string, callback: (newValue: T) => void) {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      this.subscribers.set(
        key,
        subscribers.filter((subscriber) => subscriber !== callback),
      );
    }
  }

  private notifySubscribers<T>(key: string, newValue: T) {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach((subscriber) => subscriber(newValue));
    }
  }

  public get tableNames() {
    return tableNames;
  }

  public get db() {
    const TABLE_OPERATIONS = {
      analyze: this.analyze,
      channel: this.channel,
      history: this.history,
      iptv: this.iptv,
      plugin: this.plugin,
      setting: this.setting,
      site: this.site,
      star: this.star,
    };

    return {
      all: async (tableNames: ITableName[] = []): Promise<Partial<Record<ITableName, any>>> => {
        if (isArrayEmpty(tableNames) || isArrayEmpty(tableNames.filter(Boolean))) {
          tableNames = Object.keys(TABLE_OPERATIONS) as ITableName[];
        }

        const results = await Promise.all(tableNames.map((name) => TABLE_OPERATIONS[name].all()));

        return Object.fromEntries(tableNames.map((name, i) => [name, results[i]]));
      },

      init: async (doc: Partial<Record<ITableName, any>>): Promise<Partial<Record<ITableName, any>>> => {
        const tableNames = Object.keys(doc).filter((name) =>
          name in TABLE_OPERATIONS && name === 'setting' ? !isObjectEmpty(doc[name]) : !isArrayEmpty(doc[name]),
        ) as ITableName[];
        const results = await Promise.all(tableNames.map((name) => TABLE_OPERATIONS[name].set(doc[name])));
        return Object.fromEntries(tableNames.map((name, i) => [name, results[i]]));
      },

      clear: async (tableNames: ITableName[] = []): Promise<Partial<Record<ITableName, any>>> => {
        if (isArrayEmpty(tableNames)) {
          tableNames = Object.keys(TABLE_OPERATIONS) as ITableName[];
        }

        const results = await Promise.all(tableNames.map((name) => TABLE_OPERATIONS[name].clear()));

        return Object.fromEntries(tableNames.map((name, i) => [name, results[i]]));
      },
    };
  }

  public get analyze() {
    return {
      all: () => operater.analyze.all(this.orm!, schemas),
      active: () => operater.analyze.active(this.orm!, schemas),
      get: (id: string) => operater.analyze.get(this.orm!, schemas, id),
      getByField: (doc: Partial<{ [K in keyof IModels['analyze']]: any } & { page: number; pageSize: number }>) =>
        operater.analyze.getByField(this.orm!, schemas, doc),
      add: (doc: IModels['analyze']) => operater.analyze.add(this.orm!, schemas, doc),
      update: (ids: string[], doc: IModels['analyze']) => operater.analyze.update(this.orm!, schemas, ids, doc),
      remove: (ids: string[]) => operater.analyze.remove(this.orm!, schemas, ids),
      removeByField: (doc: Partial<{ [K in keyof IModels['analyze']]: any }>) =>
        operater.analyze.removeByField(this.orm!, schemas, doc),
      set: (doc: Array<IModels['analyze']>) => operater.analyze.set(this.orm!, schemas, doc),
      clear: () => operater.analyze.clear(this.orm!, schemas),
      page: (page: number = 1, pageSize: number = 20, kw?: string) =>
        operater.analyze.page(this.orm!, schemas, page, pageSize, kw),
    };
  }

  public get channel() {
    return {
      all: () => operater.channel.all(this.orm!, schemas),
      get: (id: string) => operater.channel.get(this.orm!, schemas, id),
      getByField: (doc: Partial<{ [K in keyof IModels['channel']]: any } & { page: number; pageSize: number }>) =>
        operater.channel.getByField(this.orm!, schemas, doc),
      add: (doc: IModels['channel']) => operater.channel.add(this.orm!, schemas, doc),
      update: (ids: string[], doc: IModels['channel']) => operater.channel.update(this.orm!, schemas, ids, doc),
      remove: (ids: string[]) => operater.channel.remove(this.orm!, schemas, ids),
      removeByField: (doc: Partial<{ [K in keyof IModels['channel']]: any }>) =>
        operater.channel.removeByField(this.orm!, schemas, doc),
      set: (doc: Array<IModels['channel']>) => operater.channel.set(this.orm!, schemas, doc),
      clear: () => operater.channel.clear(this.orm!, schemas),
      page: (page: number = 1, pageSize: number = 20, kw: string = '', group: string = '') =>
        operater.channel.page(this.orm!, schemas, page, pageSize, kw, group),
      group: () => operater.channel.group(this.orm!, schemas),
    };
  }

  public get history() {
    return {
      all: () => operater.history.all(this.orm!, schemas),
      get: (id: string) => operater.history.get(this.orm!, schemas, id),
      getByField: (doc: Partial<{ [K in keyof IModels['history']]: any } & { page: number; pageSize: number }>) =>
        operater.history.getByField(this.orm!, schemas, doc),
      add: (doc: IModels['history']) => operater.history.add(this.orm!, schemas, doc),
      update: (ids: string[], doc: IModels['history']) => operater.history.update(this.orm!, schemas, ids, doc),
      remove: (ids: string[]) => operater.history.remove(this.orm!, schemas, ids),
      removeByField: (doc: Partial<{ [K in keyof IModels['history']]: any }>) =>
        operater.history.removeByField(this.orm!, schemas, doc),
      set: (doc: Array<IModels['history']>) => operater.history.set(this.orm!, schemas, doc),
      clear: () => operater.history.clear(this.orm!, schemas),
      page: (page: number = 1, pageSize: number = 20, kw?: string, type?: IModels['history']['type'][]) =>
        operater.history.page(this.orm!, schemas, page, pageSize, kw, type),
    };
  }

  public get iptv() {
    return {
      all: () => operater.iptv.all(this.orm!, schemas),
      active: () => operater.iptv.active(this.orm!, schemas),
      get: (id: string) => operater.iptv.get(this.orm!, schemas, id),
      getByField: (doc: Partial<{ [K in keyof IModels['iptv']]: any } & { page: number; pageSize: number }>) =>
        operater.iptv.getByField(this.orm!, schemas, doc),
      add: (doc: IModels['iptv']) => operater.iptv.add(this.orm!, schemas, doc),
      update: (ids: string[], doc: IModels['iptv']) => operater.iptv.update(this.orm!, schemas, ids, doc),
      remove: (ids: string[]) => operater.iptv.remove(this.orm!, schemas, ids),
      removeByField: (doc: Partial<{ [K in keyof IModels['iptv']]: any }>) =>
        operater.iptv.removeByField(this.orm!, schemas, doc),
      set: (doc: Array<IModels['iptv']>) => operater.iptv.set(this.orm!, schemas, doc),
      clear: () => operater.iptv.clear(this.orm!, schemas),
      page: (page: number = 1, pageSize: number = 20, kw?: string) =>
        operater.iptv.page(this.orm!, schemas, page, pageSize, kw),
    };
  }

  public get plugin() {
    return {
      all: () => operater.plugin.all(this.orm!, schemas),
      get: (id: string) => operater.plugin.get(this.orm!, schemas, id),
      getByField: (doc: Partial<{ [K in keyof IModels['plugin']]: any } & { page: number; pageSize: number }>) =>
        operater.plugin.getByField(this.orm!, schemas, doc),
      add: (doc: IModels['plugin']) => operater.plugin.add(this.orm!, schemas, doc),
      update: (ids: string[], doc: IModels['plugin']) => operater.plugin.update(this.orm!, schemas, ids, doc),
      remove: (ids: string[]) => operater.plugin.remove(this.orm!, schemas, ids),
      removeByField: (doc: Partial<{ [K in keyof IModels['plugin']]: any }>) =>
        operater.plugin.removeByField(this.orm!, schemas, doc),
      set: (doc: Array<IModels['plugin']>) => operater.plugin.set(this.orm!, schemas, doc),
      clear: () => operater.plugin.clear(this.orm!, schemas),
      page: (page: number = 1, pageSize: number = 20, kw?: string) =>
        operater.plugin.page(this.orm!, schemas, page, pageSize, kw),
    };
  }

  public get setting() {
    return {
      all: () => operater.setting.all(this.orm!, schemas),
      get: (key: ISettingKey) => operater.setting.get(this.orm!, schemas, key),
      getValue: async (key: ISettingKey) => {
        const result = await operater.setting.get(this.orm!, schemas, key);
        return result?.value?.data ?? '';
      },
      add: async (doc: { key: ISettingKey; value: any }) => {
        const result = await operater.setting.add(this.orm!, schemas, doc);
        this.notifySubscribers(`setting:${doc.key}`, doc.value);
        return result;
      },
      update: async (doc: { key: ISettingKey; value: any }) => {
        const result = await operater.setting.update(this.orm!, schemas, doc);
        this.notifySubscribers(`setting:${doc.key}`, doc.value);
        return result;
      },
      remove: async (keys: ISettingKey[]) => {
        const result = await operater.setting.remove(this.orm!, schemas, keys);
        keys.forEach((key) => {
          this.notifySubscribers(`setting:${key}`, null);
        });
        return result;
      },
      set: async (doc: Array<{ key: ISettingKey; value: any }>) => {
        const result = await operater.setting.set(this.orm!, schemas, doc);
        Object.entries(doc).forEach(([key, value]) => {
          this.notifySubscribers(`setting:${key}`, value);
        });
        return result;
      },
      clear: async () => {
        const result = await operater.setting.clear(this.orm!, schemas);
        this.notifySubscribers('setting:*', null);
        return result;
      },
    };
  }

  public get site() {
    return {
      all: () => operater.site.all(this.orm!, schemas),
      active: () => operater.site.active(this.orm!, schemas),
      get: (id: string) => operater.site.get(this.orm!, schemas, id),
      getByField: (doc: Partial<{ [K in keyof IModels['site']]: any } & { page: number; pageSize: number }>) =>
        operater.site.getByField(this.orm!, schemas, doc),
      add: (doc: IModels['site']) => operater.site.add(this.orm!, schemas, doc),
      update: (ids: string[], doc: IModels['site']) => operater.site.update(this.orm!, schemas, ids, doc),
      remove: (ids: string[]) => operater.site.remove(this.orm!, schemas, ids),
      removeByField: (doc: Partial<{ [K in keyof IModels['site']]: any }>) =>
        operater.site.removeByField(this.orm!, schemas, doc),
      set: (doc: Array<IModels['site']>) => operater.site.set(this.orm!, schemas, doc),
      clear: () => operater.site.clear(this.orm!, schemas),
      page: (page: number = 1, pageSize: number = 20, kw?: string) =>
        operater.site.page(this.orm!, schemas, page, pageSize, kw),
      group: () => operater.site.group(this.orm!, schemas),
    };
  }

  public get star() {
    return {
      all: () => operater.star.all(this.orm!, schemas),
      get: (id: string) => operater.star.get(this.orm!, schemas, id),
      getByField: (doc: Partial<{ [K in keyof IModels['star']]: any } & { page: number; pageSize: number }>) =>
        operater.star.getByField(this.orm!, schemas, doc),
      add: (doc: IModels['star']) => operater.star.add(this.orm!, schemas, doc),
      update: (ids: string[], doc: IModels['star']) => operater.star.update(this.orm!, schemas, ids, doc),
      remove: (ids: string[]) => operater.star.remove(this.orm!, schemas, ids),
      removeByField: (doc: Partial<{ [K in keyof IModels['star']]: any }>) =>
        operater.star.removeByField(this.orm!, schemas, doc),
      set: (doc: Array<IModels['star']>) => operater.star.set(this.orm!, schemas, doc),
      clear: () => operater.star.clear(this.orm!, schemas),
      page: (page: number = 1, pageSize: number = 20, kw?: string, type?: IModels['star']['type'][]) =>
        operater.star.page(this.orm!, schemas, page, pageSize, kw, type),
    };
  }
}

export const dbService = DbService.getInstance();
