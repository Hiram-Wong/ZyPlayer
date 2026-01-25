import type { IOrm, ISchemas } from '@shared/types/db';
import { eq } from 'drizzle-orm';

const migrate = async (orm: IOrm, schemas: ISchemas): Promise<void> => {
  // tbl_analyze update column type
  const tblAnalyze = (await orm.select().from(schemas.analyze)) || [];
  for (const item of tblAnalyze) {
    await orm
      .update(schemas.analyze)
      .set({ type: item?.type || 0 })
      .where(eq(schemas.analyze.id, item.id));
  }

  // tbl_setting update timeout
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'timeout'));
  await orm.insert(schemas.setting).values({
    key: 'timeout',
    value: { data: 10000 },
  });

  // tbl_setting update ai
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'ai'));
  await orm.insert(schemas.setting).values({
    key: 'ai',
    value: { data: { server: '', key: '', model: '' } },
  });
};

export default migrate;
