import { eq } from 'drizzle-orm';
import { db, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  const old_lang = await db.select().from(schema.setting).where(eq(schema.setting.key, 'lang'));
  if (old_lang.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'lang'));
  }
  await db.insert(schema.setting).values({ key: 'lang', value: { data: 'zh_CN' } });

  const old_defaultViewCasual = await db
    .select()
    .from(schema.setting)
    .where(eq(schema.setting.key, 'defaultViewCasual'));
  if (old_defaultViewCasual.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'defaultViewCasual'));
  }
  await db.insert(schema.setting).values({ key: 'defaultViewCasual', value: { data: '' } });

  const old_barrage = await db.select().from(schema.setting).where(eq(schema.setting.key, 'barrage'));
  if (old_barrage.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'barrage'));
  }
  await db.insert(schema.setting).values({
    key: 'barrage',
    value: {
      data: {
        url: '',
        key: 'danmuku',
        support: ['qq', 'qiyi', 'youku', 'mgtv'],
        start: 0,
        mode: 1,
        color: 2,
        content: 4,
      },
    },
  });

  const old_playerMode = await db.select().from(schema.setting).where(eq(schema.setting.key, 'playerMode'));
  const old_broadcasterType = await db.select().from(schema.setting).where(eq(schema.setting.key, 'broadcasterType'));
  const old_externalPlayer = await db.select().from(schema.setting).where(eq(schema.setting.key, 'externalPlayer'));
  if (old_playerMode.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'playerMode'));
  }
  await db.insert(schema.setting).values({
    key: 'playerMode',
    value: {
      data: {
        type: old_broadcasterType?.[0]?.['value']?.['data'] || 'xgplayer',
        external: old_externalPlayer?.[0]?.['value']?.['data'] || '',
      },
    },
  });
  if (old_broadcasterType.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'old_broadcasterType'));
  }
  if (old_externalPlayer.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'old_externalPlayer'));
  }

  const old_snifferMode = await db.select().from(schema.setting).where(eq(schema.setting.key, 'snifferMode'));
  const old_snifferType = await db.select().from(schema.setting).where(eq(schema.setting.key, 'snifferType'));
  if (old_snifferMode.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'snifferMode'));
  }
  await db.insert(schema.setting).values({
    key: 'snifferMode',
    value: {
      data: {
        type: old_snifferType?.[0]?.['value']?.['data'] || 'pie',
        url: '',
      },
    },
  });
  if (old_snifferType.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'snifferType'));
  }

  const old_webdev = await db.select().from(schema.setting).where(eq(schema.setting.key, 'webdev'));
  const old_webdevUrl = await db.select().from(schema.setting).where(eq(schema.setting.key, 'webdevUrl'));
  const old_webdevUsername = await db.select().from(schema.setting).where(eq(schema.setting.key, 'webdevUsername'));
  const old_webdevPassword = await db.select().from(schema.setting).where(eq(schema.setting.key, 'webdevPassword'));
  if (old_webdev.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'webdev'));
  }
  await db.insert(schema.setting).values({
    key: 'webdev',
    value: {
      data: {
        sync: false,
        data: {
          url: old_webdevUrl?.[0]?.['value']?.['data'] || 'https://dav.jianguoyun.com/dav/',
          username: old_webdevUsername?.[0]?.['value']?.['data'] || '',
          password: old_webdevPassword?.[0]?.['value']?.['data'] || '',
        },
      },
    },
  });
  if (old_webdev.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'old_webdevUrl'));
  }
  if (old_webdevUsername.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'webdevUsername'));
  }
  if (old_webdevPassword.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'webdevPassword'));
  }

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.3.4' } });

  logger.info('[db][magrite][update3_3_3_to3_3_4]completed');
};

export default update;
