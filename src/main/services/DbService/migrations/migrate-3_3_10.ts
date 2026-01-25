import type { IOrm, ISchemas } from '@shared/types/db';
import { eq, sql } from 'drizzle-orm';

const migrate = async (orm: IOrm, schemas: ISchemas): Promise<void> => {
  // disable foreign key checks
  await orm.run(sql`PRAGMA foreign_keys=OFF;`);

  // tbl_star add column date
  await orm.run(sql`ALTER TABLE tbl_star ADD COLUMN date INTEGER;`);
  await orm.run(sql`UPDATE tbl_star SET date = (strftime('%s', 'now') * 1000);`);

  // enable foreign key checks
  await orm.run(sql`PRAGMA foreign_keys=ON;`);

  // tbl_setting update playerMode
  const old_playerMode: { data?: Record<string, string> } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'playerMode')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'playerMode'));
  await orm.insert(schemas.setting).values({
    key: 'playerMode',
    value: {
      data: {
        type:
          old_playerMode?.data?.type && ['dplayer', 'nplayer'].includes(old_playerMode.data.type)
            ? old_playerMode.data.type
            : 'artplayer',
        external: old_playerMode?.data?.external || '',
      },
    },
  });

  // tbl_setting update defaultFilterType
  const old_defaultFilterType: { data?: string } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'defaultFilterType')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultFilterType'));
  await orm.insert(schemas.setting).values({
    key: 'defaultFilterType',
    value: { data: old_defaultFilterType?.data === 'on' || false },
  });
};

export default migrate;
