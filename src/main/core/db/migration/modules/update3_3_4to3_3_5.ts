import { eq } from 'drizzle-orm';
import { db, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  const old_analyze = await db.select().from(schema.analyze);
  if (old_analyze.length > 0) {
    old_analyze.forEach(async (item: { [key: string]: any }) => {
      await db
        .update(schema.analyze)
        .set({ type: item?.type || 0 })
        .where(eq(schema.analyze.id, item.id));
    });
  }

  const old_timeout = await db.select().from(schema.setting).where(eq(schema.setting.key, 'timeout'));
  if (old_timeout.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'timeout'));
  }
  await db.insert(schema.setting).values({
    key: 'timeout',
    value: { data: 5000 },
  });

  const old_ai = await db.select().from(schema.setting).where(eq(schema.setting.key, 'ai'));
  if (old_ai.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'ai'));
  }
  await db.insert(schema.setting).values({
    key: 'ai',
    value: {
      data: {
        server: '',
        key: '',
        model: '',
      },
    },
  });

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.3.5' } });

  logger.info('[db][magrite][update3_3_4_to3_3_5]completed');
};

export default update;
