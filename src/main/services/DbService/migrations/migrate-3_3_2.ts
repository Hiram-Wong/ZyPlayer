import type { IOrm, ISchemas } from '@shared/types/db';
import { eq } from 'drizzle-orm';

const migrate = async (orm: IOrm, schemas: ISchemas): Promise<void> => {
  // tbl_setting update windowPosition
  await orm.insert(schemas.setting).values({
    key: 'windowPosition',
    value: { data: { status: false, position: { width: 1000, height: 640 } } },
  });
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'restoreWindowPositionAndSize'));
};

export default migrate;
