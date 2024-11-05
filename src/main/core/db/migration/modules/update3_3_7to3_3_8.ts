import { eq } from 'drizzle-orm';
import { db, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  const old_site = await db.select().from(schema.site);
  if (old_site.length > 0) {
    old_site.forEach(async (item: { [key: string]: any }) => {
      if (item.type === 3 || item.type === 4) {
        await db.update(schema.site).set({ type: 11 }).where(eq(schema.analyze.id, item.id));
      }
    });
  }

  await db.delete(schema.setting).where(eq(schema.setting.key, 'iptvSkipIpv6'));
  await db.insert(schema.setting).values({ key: 'iptvMarkIp', value: { data: true } });

  await db.delete(schema.setting).where(eq(schema.setting.key, 'iptvStatus'));
  await db.insert(schema.setting).values({ key: 'iptvDelay', value: { data: false } });

  await db.delete(schema.setting).where(eq(schema.setting.key, 'analyzeFlag'));
  await db
    .insert(schema.setting)
    .values({
      key: 'analyzeFlag',
      value: { data: ['youku', 'qq', 'iqiyi', 'qiyi', 'letv', 'leshi', 'sohu', 'tudou', 'pptv', 'mgtv', 'imgo'] },
    });

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.3.8' } });

  logger.info('[db][magrite][update3_3_7to3_3_8]completed');
};

export default update;
