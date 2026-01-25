import type { IOrm, ISchemas } from '@shared/types/db';
import { eq } from 'drizzle-orm';

const migrate = async (orm: IOrm, schemas: ISchemas): Promise<void> => {
  // tbl_site update column type
  const tblSite = (await orm.select().from(schemas.site)) || [];
  for (const item of tblSite) {
    if (item.type === 3 || item.type === 4) {
      await orm.update(schemas.site).set({ type: 11 }).where(eq(schemas.site.id, item.id));
    }
  }

  // tbl_setting update iptvMarkIp
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'iptvSkipIpv6'));
  await orm.insert(schemas.setting).values({ key: 'iptvMarkIp', value: { data: true } });

  // tbl_setting update iptvDelay
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'iptvStatus'));
  await orm.insert(schemas.setting).values({ key: 'iptvDelay', value: { data: false } });

  // tbl_setting update analyzeFlag
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'analyzeFlag'));
  await orm.insert(schemas.setting).values({
    key: 'analyzeFlag',
    value: { data: ['youku', 'qq', 'iqiyi', 'qiyi', 'letv', 'leshi', 'sohu', 'tudou', 'pptv', 'mgtv', 'imgo'] },
  });
};

export default migrate;
