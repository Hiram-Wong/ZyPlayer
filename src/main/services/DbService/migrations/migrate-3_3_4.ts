import type { IOrm, ISchemas } from '@shared/types/db';
import { eq } from 'drizzle-orm';

const migrate = async (orm: IOrm, schemas: ISchemas): Promise<void> => {
  // tbl_setting update lang
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'lang'));
  await orm.insert(schemas.setting).values({ key: 'lang', value: { data: 'zh_CN' } });

  // tbl_setting update defaultViewCasual
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultViewCasual'));
  await orm.insert(schemas.setting).values({ key: 'defaultViewCasual', value: { data: '' } });

  // tbl_setting update barrage
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'barrage'));
  await orm.insert(schemas.setting).values({
    key: 'barrage',
    value: {
      data: {
        url: '',
        id: '',
        key: 'danmuku',
        support: ['qq', 'qiyi', 'youku', 'mgtv'],
        start: 0,
        mode: 1,
        color: 2,
        content: 4,
      },
    },
  });

  // tbl_setting update playerMode
  const old_broadcasterType =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'broadcasterType'))?.[0]?.value) || {};
  const old_externalPlayer =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'externalPlayer'))?.[0]?.value) || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'playerMode'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'externalPlayer'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'broadcasterType'));
  await orm.insert(schemas.setting).values({
    key: 'playerMode',
    value: {
      data: {
        type: old_broadcasterType?.data || 'xgplayer',
        external: old_externalPlayer?.data || '',
      },
    },
  });

  // tbl_setting update snifferMode
  const old_snifferType =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'snifferType'))?.[0]?.value) || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'snifferMode'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'snifferType'));
  await orm.insert(schemas.setting).values({
    key: 'snifferMode',
    value: {
      data: {
        type: old_snifferType?.data || 'pie',
        url: '',
      },
    },
  });

  // tbl_setting update webdav
  const old_webdavUrl =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'webdavUrl'))?.[0]?.value) || {};
  const old_webdavUsername =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'webdavUsername'))?.[0]?.value) || {};
  const old_webdavPassword =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'webdavPassword'))?.[0]?.value) || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'webview'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'webdavUrl'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'webdavUsername'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'webdavPassword'));
  await orm.insert(schemas.setting).values({
    key: 'webdav',
    value: {
      data: {
        sync: false,
        data: {
          url: old_webdavUrl?.data || 'https://dav.jianguoyun.com/dav/',
          username: old_webdavUsername?.data || '',
          password: old_webdavPassword?.data || '',
        },
      },
    },
  });
};

export default migrate;
