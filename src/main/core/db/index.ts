import { compare } from 'compare-versions';
import { eq } from 'drizzle-orm';
import { app } from 'electron';
import { join } from 'path';
import { db, schema, webdev } from './common';
import migration from './migration';
import * as service from './service';
import logger from '@main/core/logger';

const DB_PATH = join(app.getPath('userData'), 'database');

const updates = [
  { version: '3.3.2', update: migration.update3_3_1to3_3_2 },
  { version: '3.3.4', update: migration.update3_3_3to3_3_4 },
  { version: '3.3.5', update: migration.update3_3_4to3_3_5 },
  { version: '3.3.7', update: migration.update3_3_6to3_3_7 },
  { version: '3.3.8', update: migration.update3_3_7to3_3_8 },
  { version: '3.3.9', update: migration.update3_3_8to3_3_9 },
];

const magrite = async () => {
  const tbl_setting_exit = await db.execute(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tbl_setting'`,
  );
  if (tbl_setting_exit.rows.length === 0) {
    await migration.update0_0_0to3_3_1();
  }

  let dbVersion = (await db.select().from(schema.setting).where(eq(schema.setting.key, 'version')))?.[0]?.['value']?.[
    'data'
  ];

  const appVersion = app.getVersion();
  logger.info(`[db][magrite][version] db:${dbVersion} - app:${appVersion}`);

  if (compare(dbVersion, appVersion, '<')) {
    for (const { version, update } of updates) {
      if (compare(dbVersion, version, '<')) {
        try {
          await update();
          dbVersion = version;
          logger.info(`[db][magrite] ${version} success`);
        } catch (err) {
          logger.error(`[db][magrite] ${version} failed`, err);
        }
      }
    }
  }

  logger.info(`[db][magrite] completed`);
};

const setup = async () => {
  await magrite();
  logger.info(`[db][init] path:${DB_PATH}`);
};

export { db, schema, setup, magrite, service, webdev };
