import { eq } from 'drizzle-orm';
import { db, client, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  await client.exec(`
    ALTER TABLE tbl_star ADD COLUMN type VARCHAR(255);
    UPDATE tbl_star SET type = 'film';
    ALTER TABLE tbl_star ALTER COLUMN type SET NOT NULL;
  `);

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.4.0' } });

  logger.info('[db][magrite][update3_3_10to3_4_0]completed');
};

export default update;
