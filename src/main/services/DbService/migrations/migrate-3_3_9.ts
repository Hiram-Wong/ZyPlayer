import type { IOrm, ISchemas } from '@shared/types/db';
import { sql } from 'drizzle-orm';

const migrate = async (orm: IOrm, _schemas: ISchemas): Promise<void> => {
  // disable foreign key checks
  await orm.run(sql`PRAGMA foreign_keys=OFF;`);

  // tbl_site add column search
  await orm.run(sql`ALTER TABLE tbl_site ADD COLUMN search INTEGER;`);
  await orm.run(sql`UPDATE tbl_site SET search = CASE WHEN search = 1 THEN 1 ELSE 0 END;`);
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_site (
      id         TEXT PRIMARY KEY,
      key        TEXT NOT NULL UNIQUE,
      name       TEXT,
      api        TEXT,
      playUrl    TEXT,
      search     INTEGER NOT NULL DEFAULT 0, -- 1 = true, 0 = false
      "group"    TEXT,
      type       INTEGER NOT NULL,
      ext        TEXT,
      categories TEXT,
      isActive   INTEGER DEFAULT 1          -- 1 = true, 0 = false
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_site (id, key, name, api, playUrl, search, "group", type, ext, categories, isActive)
    SELECT id, key, name, api, playUrl, '', "group", type, ext, categories, isActive FROM tbl_site;
  `);
  await orm.run(sql`DROP TABLE tbl_site;`);
  await orm.run(sql`ALTER TABLE __new_tbl_site RENAME TO tbl_site;`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_site_key ON tbl_site(key);`);

  // tbl_drive add column showAll
  await orm.run(sql`ALTER TABLE tbl_drive ADD COLUMN showAll boolean default false;`);

  // enable foreign key checks
  await orm.run(sql`PRAGMA foreign_keys=ON;`);
};

export default migrate;
