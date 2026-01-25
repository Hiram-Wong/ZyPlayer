import type { IOrm, ISchemas } from '@shared/types/db';
import { eq } from 'drizzle-orm';

const migrate = async (orm: IOrm, schemas: ISchemas): Promise<void> => {
  // tbl_setting update windowPosition
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'windowPosition'));
  await orm.insert(schemas.setting).values({
    key: 'windowPosition',
    value: {
      data: {
        status: false,
        position_main: { width: 1000, height: 640 },
        position_play: { width: 875, height: 550 },
      },
    },
  });

  // tbl_setting update defaultFilterType
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultFilterType'));
  await orm.insert(schemas.setting).values({ key: 'defaultFilterType', value: { data: 'off' } });

  // tbl_setting update dns
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'dns'));
  await orm.insert(schemas.setting).values({ key: 'dns', value: { data: '' } });

  // tbl_setting update debug
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'debug'));
  await orm.insert(schemas.setting).values({ key: 'debug', value: { data: false } });
};

export default migrate;
