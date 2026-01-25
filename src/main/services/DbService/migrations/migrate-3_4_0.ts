import type { IOrm, ISchemas } from '@shared/types/db';
import { sql } from 'drizzle-orm';

const migrate = async (orm: IOrm, _schemas: ISchemas): Promise<void> => {
  // disable foreign key checks
  await orm.run(sql`PRAGMA foreign_keys=OFF;`);

  // tbl_star add column type
  await orm.run(sql`ALTER TABLE tbl_star ADD COLUMN type TEXT;`);
  await orm.run(sql`UPDATE tbl_star SET type = 'film';`);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_star (
      id            TEXT PRIMARY KEY,
      date          INTEGER,
      type          TEXT NOT NULL,
      relateId      TEXT,
      videoId       TEXT,
      videoImage    TEXT,
      videoName     TEXT,
      videoType     TEXT,
      videoRemarks  TEXT
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_star (id, date, type, relateId, videoId, videoImage, videoName, videoType, videoRemarks)
    SELECT id, date, type, relateId, videoId, videoImage, videoName, videoType, videoRemarks FROM tbl_star;
  `);
  await orm.run(sql`DROP TABLE tbl_star;`);
  await orm.run(sql`ALTER TABLE __new_tbl_star RENAME TO tbl_star;`);

  // tbl_iptv add column key headers
  await orm.run(sql`ALTER TABLE tbl_iptv ADD COLUMN key TEXT;`);
  await orm.run(sql`ALTER TABLE tbl_iptv ADD COLUMN headers TEXT;`);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_iptv (
      id            TEXT PRIMARY KEY,
      key           TEXT NOT NULL UNIQUE,
      name          TEXT,
      url           TEXT NOT NULL,
      type          TEXT NOT NULL,
      epg           TEXT,
      logo          TEXT,
      headers       TEXT,
      isActive      INTEGER DEFAULT 1        -- 1 = true, 0 = false
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_iptv (id, name, url, type, epg, logo, headers, isActive)
    SELECT id, CAST(id AS TEXT), name, url, type, epg, logo, '{}', isActive FROM tbl_iptv;
  `);
  await orm.run(sql`DROP TABLE tbl_iptv;`);
  await orm.run(sql`ALTER TABLE __new_tbl_iptv RENAME TO tbl_iptv;`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_iptv_key ON tbl_iptv(key);`);

  // tbl_drive add column key
  await orm.run(sql`ALTER TABLE tbl_drive ADD COLUMN key TEXT;`);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_drive (
      id            TEXT PRIMARY KEY,
      key           TEXT NOT NULL UNIQUE,
      name          TEXT,
      server        TEXT NOT NULL,
      startPage     TEXT,
      headers       TEXT,
      params        TEXT,
      search        INTEGER DEFAULT 0,       -- 1 = true, 0 = false
      showAll       INTEGER DEFAULT 0,       -- 1 = all, 0 = video
      isActive      INTEGER DEFAULT 1        -- 1 = true, 0 = false
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_drive (id, name, server, startPage, headers, params, search, showAll, isActive)
    SELECT id, CAST(id AS TEXT), name, server, startPage, headers, params, search, showAll, isActive FROM tbl_drive;
  `);
  await orm.run(sql`DROP TABLE tbl_drive;`);
  await orm.run(sql`ALTER TABLE __new_tbl_drive RENAME TO tbl_drive;`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_drive_key ON tbl_drive(key);`);

  // tbl_analyze add column key headers
  await orm.run(sql`ALTER TABLE tbl_analyze ADD COLUMN key TEXT;`);
  await orm.run(sql`ALTER TABLE tbl_analyze ADD COLUMN headers TEXT;`);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_analyze (
      id            TEXT PRIMARY KEY,
      key           TEXT NOT NULL UNIQUE,
      name          TEXT,
      url           TEXT NOT NULL,
      type          TEXT NOT NULL,
      headers       TEXT,
      isActive      INTEGER DEFAULT 1        -- 1 = true, 0 = false
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_analyze (id, name, url, type, headers, isActive)
    SELECT id, CAST(id AS TEXT), name, url, type, '{}', isActive FROM tbl_analyze;
  `);
  await orm.run(sql`DROP TABLE tbl_analyze;`);
  await orm.run(sql`ALTER TABLE __new_tbl_analyze RENAME TO tbl_analyze;`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_analyze_key ON tbl_analyze(key);`);

  // enable foreign key checks
  await orm.run(sql`PRAGMA foreign_keys=ON;`);
};

export default migrate;
