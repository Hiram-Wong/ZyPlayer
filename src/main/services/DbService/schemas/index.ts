import type { ResultSet } from '@libsql/client';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core';

import type { AnalyzeModel } from './analyze';
import { analyze } from './analyze';
import type { ChannelModel } from './channel';
import { channel } from './channel';
import type { HistoryModel } from './history';
import { history } from './history';
import type { IptvModel } from './iptv';
import { iptv } from './iptv';
import type { PluginModel } from './plugin';
import { plugin } from './plugin';
import type { SettingModel } from './setting';
import { setting } from './setting';
import type { SiteModel } from './site';
import { site } from './site';
import type { StarModel } from './star';
import { star } from './star';

export const schemas = {
  analyze,
  channel,
  history,
  iptv,
  plugin,
  setting,
  site,
  star,
} as const;

export const tableNames = Object.keys(schemas) as (keyof Schemas)[];

export type Schemas = typeof schemas;

export type TableName = keyof Schemas;

export interface Models {
  analyze: AnalyzeModel;
  channel: ChannelModel;
  history: HistoryModel;
  iptv: IptvModel;
  plugin: PluginModel;
  setting: SettingModel;
  site: SiteModel;
  star: StarModel;
}

export type AppTransaction<TMode extends 'async' | 'sync' = 'async'> = SQLiteTransaction<
  TMode,
  ResultSet,
  Schemas,
  ExtractTablesWithRelations<Schemas>
>;

export type Transaction = AppTransaction<'async'>;
