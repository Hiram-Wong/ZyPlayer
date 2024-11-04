import { eq } from 'drizzle-orm';
import { db, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  const old_windowPosition = await db.select().from(schema.setting).where(eq(schema.setting.key, 'windowPosition'));
  if (old_windowPosition.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'windowPosition'));
  }
  await db.insert(schema.setting).values({
    key: 'windowPosition',
    value: {
      data: {
        status: false,
        position_main: { width: 1000, height: 640 },
        position_play: { width: 875, height: 550 },
      },
    },
  });

  const old_defaultFilterType = await db
    .select()
    .from(schema.setting)
    .where(eq(schema.setting.key, 'defaultFilterType'));
  if (old_defaultFilterType.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'defaultFilterType'));
  }
  await db.insert(schema.setting).values({ key: 'defaultFilterType', value: { data: 'off' } });

  const old_debug = await db.select().from(schema.setting).where(eq(schema.setting.key, 'debug'));
  if (old_debug.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'debug'));
  }
  await db.insert(schema.setting).values({ key: 'debug', value: { data: false } });

  const old_dns = await db.select().from(schema.setting).where(eq(schema.setting.key, 'dns'));
  if (old_dns.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'dns'));
  }
  await db.insert(schema.setting).values({ key: 'dns', value: { data: '' } });

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.3.7' } });

  logger.info('[db][magrite][update3_3_6to3_3_7]completed');
};

export default update;
