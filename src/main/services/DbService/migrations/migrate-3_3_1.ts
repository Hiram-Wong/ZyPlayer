import { settingList as tblSetting } from '@shared/config/tblSetting';
import type { IOrm, ISchemas } from '@shared/types/db';
import { sql } from 'drizzle-orm';

const migrate = async (orm: IOrm, schemas: ISchemas): Promise<void> => {
  // Create tables if not exists
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_analyze (
      id        TEXT PRIMARY KEY,
      key       TEXT NOT NULL UNIQUE,
      name      TEXT NOT NULL,
      api       TEXT NOT NULL,
      type      INTEGER NOT NULL,            -- 1 = web, 2 = json
      flag      TEXT DEFAULT '[]',           -- JSON
      headers   TEXT DEFAULT '{}',           -- JSON
      script    TEXT,
      isActive  INTEGER DEFAULT 1,           -- 0 = false, 1 = true
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_channel (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      api       TEXT NOT NULL,
      logo      TEXT,
      playback  TEXT,
      "group"   TEXT,
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_history (
      id              TEXT PRIMARY KEY,
      type            INTEGER NOT NULL,      -- 1 = film, 2 = live, 3 = parse, 5 = search, 6 = simple-import, 7 = complete-import
      relateId        TEXT,
      siteSource      TEXT,
      playEnd         INTEGER DEFAULT 0,     -- 0 = false, 1 = true
      videoId         TEXT,
      videoImage      TEXT,
      videoName       TEXT,
      videoIndex      TEXT,
      watchTime       REAL DEFAULT 0,
      duration        REAL DEFAULT 0,
      skipTimeInEnd   REAL DEFAULT 0,
      skipTimeInStart REAL DEFAULT 0,
      createdAt       INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt       INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_iptv (
      id        TEXT PRIMARY KEY,
      key       TEXT NOT NULL UNIQUE,
      name      TEXT NOT NULL,
      api       TEXT NOT NULL,
      type      INTEGER NOT NULL,            -- 1 = remote, 2 = local, 3 = manual
      epg       TEXT,
      logo      TEXT,
      headers   TEXT DEFAULT '{}',           -- JSON
      isActive  INTEGER DEFAULT 1,           -- 1 = true, 0 = false
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_plugin (
      id          TEXT PRIMARY KEY,
      type        INTEGER DEFAULT 2,         -- 1 = ui, 2 = system, 3 = mix
      name        TEXT NOT NULL,
      pluginName  TEXT NOT NULL,
      author      TEXT,
      description TEXT,
      readme      TEXT,
      base        TEXT NOT NULL,
      main        TEXT,
      web         TEXT,
      version     TEXT,
      logo        TEXT,
      homepage    TEXT,
      isActive    INTEGER DEFAULT 0,           -- 1 = true, 0 = false
      createdAt   INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt   INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_setting (
      id        TEXT PRIMARY KEY,
      key       TEXT NOT NULL UNIQUE,
      value     TEXT,                        -- JSON
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_site (
      id         TEXT PRIMARY KEY,
      key        TEXT NOT NULL UNIQUE,
      name       TEXT NOT NULL,
      api        TEXT,
      playUrl    TEXT,
      search     INTEGER DEFAULT 1,          -- 1 = true, 0 = false
      "group"    TEXT,
      type       INTEGER NOT NULL,
      ext        TEXT,
      categories TEXT,
      isActive   INTEGER DEFAULT 1,          -- 1 = true, 0 = false
      createdAt  INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt  INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_star (
      id            TEXT PRIMARY KEY,
      type          INTEGER NOT NULL,        -- 1 = film, 2 = live, 3 = parse
      relateId      TEXT,
      videoId       TEXT,
      videoImage    TEXT,
      videoName     TEXT,
      videoType     TEXT,
      videoRemarks  TEXT,
      createdAt     INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt     INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);

  // Create indexes for faster queries
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_analyze_key ON tbl_analyze(key);`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_iptv_key ON tbl_iptv(key);`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_setting_key ON tbl_setting(key);`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_site_key ON tbl_site(key);`);

  // tbl_setting insert default values
  if ((await orm.$count(schemas.setting)) === 0) {
    for (const item of tblSetting) {
      await orm.insert(schemas.setting).values({ key: item.key, value: { data: item.value } });
    }
  }
};

export default migrate;
