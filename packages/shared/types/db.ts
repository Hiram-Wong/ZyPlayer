import type { Client, Config } from '@libsql/client';
import type { Models, Schemas, TableName } from '@main/services/DbService/schemas';
import type { ISetting } from '@shared/config/tblSetting';
import type { drizzle } from 'drizzle-orm/libsql';

export type IClient = Client;

export type IConfig = Config;

export type IOrm = ReturnType<typeof drizzle>;

export type ISchemas = Schemas;

export type IModels = Models;

export type ITableName = TableName;

export type IMigrate = (orm: IOrm, schemas: ISchemas) => Promise<void>;

export interface IMigration {
  version: string;
  migrate: IMigrate;
}

export type IMigrations = readonly IMigration[];

export type IDb = {
  [K in keyof IModels]: IModels[K][];
};

export type IDbStore = {
  [K in keyof IModels]?: K extends 'setting' ? Partial<ISetting> : IModels[K][];
};
