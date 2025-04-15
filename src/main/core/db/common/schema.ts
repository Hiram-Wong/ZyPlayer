import { pgTableCreator, boolean, varchar, integer, text, jsonb, uuid, real } from 'drizzle-orm/pg-core';

const pgTable = pgTableCreator((name) => `tbl_${name}`);

const setting = pgTable('setting', {
  id: uuid().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: jsonb('value'),
});

const site = pgTable('site', {
  id: uuid().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  api: varchar('api', { length: 255 }),
  playUrl: varchar('playUrl', { length: 255 }),
  search: integer('search'),
  group: varchar('group', { length: 255 }),
  type: integer('type'),
  ext: text('ext'),
  categories: varchar('categories', { length: 255 }),
  isActive: boolean('isActive'),
});

const iptv = pgTable('iptv', {
  id: uuid().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  url: text('url'),
  type: varchar('type', { length: 255 }),
  epg: varchar('epg', { length: 255 }),
  logo: varchar('logo', { length: 255 }),
  headers: varchar('headers', { length: 2048 }),
  isActive: boolean('isActive'),
});

const channel = pgTable('channel', {
  id: uuid().defaultRandom(),
  name: varchar('name', { length: 255 }),
  url: varchar('url', { length: 1024 }),
  group: varchar('group', { length: 255 }),
});

const drive = pgTable('drive', {
  id: uuid().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  server: varchar('server', { length: 255 }),
  startPage: varchar('startPage', { length: 255 }),
  headers: varchar('headers', { length: 2048 }),
  params: varchar('params', { length: 2048 }),
  search: integer('search'),
  showAll: boolean('showAll'),
  isActive: boolean('isActive'),
});

const analyze = pgTable('analyze', {
  id: uuid().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  url: varchar('url', { length: 255 }),
  type: integer('type'),
  headers: varchar('headers', { length: 2048 }),
  isActive: boolean('isActive'),
});

const history = pgTable('history', {
  id: uuid().defaultRandom(),
  date: integer('date'),
  type: varchar('type', { length: 255 }),
  relateId: varchar('relateId', { length: 255 }),
  siteSource: varchar('siteSource', { length: 255 }),
  playEnd: boolean('playEnd'),
  videoId: varchar('videoId', { length: 1024 }),
  videoImage: varchar('videoImage', { length: 2048 }),
  videoName: varchar('videoName', { length: 1024 }),
  videoIndex: varchar('videoIndex', { length: 2048 }),
  watchTime: real('watchTime'),
  duration: real('duration'),
  skipTimeInEnd: real('skipTimeInEnd'),
  skipTimeInStart: real('skipTimeInStart'),
});

const star = pgTable('star', {
  id: uuid().defaultRandom(),
  date: integer('date'),
  type: varchar('type', { length: 255 }),
  relateId: varchar('relateId', { length: 255 }),
  videoId: varchar('videoId', { length: 1024 }),
  videoImage: varchar('videoImage', { length: 2048 }),
  videoName: varchar('videoName', { length: 1024 }),
  videoType: varchar('videoType', { length: 1024 }),
  videoRemarks: varchar('videoRemarks', { length: 1024 }),
});

export { setting, site, iptv, channel, drive, analyze, history, star };
export type Setting = typeof setting.$inferSelect;
export type Site = typeof site.$inferSelect;
export type Iptv = typeof iptv.$inferSelect;
export type Channel = typeof channel.$inferSelect;
export type Drive = typeof drive.$inferSelect;
export type Analyze = typeof analyze.$inferSelect;
export type History = typeof history.$inferSelect;
export type Star = typeof star.$inferSelect;
