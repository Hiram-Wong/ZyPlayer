import { eq } from 'drizzle-orm';
import { db, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  await db.insert(schema.setting).values({
    key: 'windowPosition',
    value: { data: { status: false, position: { width: 1000, height: 640 } } },
  });
  await db.delete(schema.setting).where(eq(schema.setting.key, 'restoreWindowPositionAndSize'));

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.3.2' } });

  logger.info('[db][magrite][update3_3_1to3_3_2]completed');
};

export default update;
