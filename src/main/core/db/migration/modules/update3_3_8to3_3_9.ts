import { eq } from 'drizzle-orm';
import { db, client, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  await client.exec(`
    ALTER TABLE tbl_site ADD COLUMN search_new integer not null default 0;
    UPDATE tbl_site SET search_new = CASE WHEN search = TRUE THEN 1 ELSE 0 END;
    ALTER TABLE tbl_site DROP COLUMN search;
    ALTER TABLE tbl_site rename search_new to search;
  `);

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.3.9' } });

  logger.info('[db][magrite][update3_3_8to3_3_9]completed');
};

export default update;
