import { eq } from 'drizzle-orm';
import { db, client, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  await client.exec(`
    ALTER TABLE tbl_history ALTER COLUMN "videoId" TYPE varchar(1024);
    ALTER TABLE tbl_history ALTER COLUMN "videoImage" TYPE varchar(1024);
    ALTER TABLE tbl_history ALTER COLUMN "videoIndex" TYPE varchar(510);
    ALTER TABLE tbl_history ALTER COLUMN "videoName" TYPE varchar(510);

    ALTER TABLE tbl_star ALTER COLUMN "videoId" TYPE varchar(1024);
    ALTER TABLE tbl_star ALTER COLUMN "videoImage" TYPE varchar(1024);
    ALTER TABLE tbl_star ALTER COLUMN "videoName" TYPE varchar(510);
    ALTER TABLE tbl_star ADD COLUMN date INTEGER;
    UPDATE tbl_star SET date = EXTRACT(EPOCH FROM now())::INTEGER;

    ALTER TABLE tbl_channel ALTER COLUMN url TYPE varchar(1024);
  `);

  const old_defaultFilterType = await db.select().from(schema.setting).where(eq(schema.setting.key, 'defaultFilterType'));
  if (old_defaultFilterType.length > 0) {
    // @ts-ignore
    const defaultFilterTypeValue = old_defaultFilterType[0].value.data === 'on' ? true : false;
    await db.update(schema.setting).set({ value: { data: defaultFilterTypeValue } }).where(eq(schema.setting.key, 'defaultFilterType'));
  } else {
    await db.insert(schema.setting).values({ key: 'defaultFilterType', value: { data: false } });
  }

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.3.10' } });

  logger.info('[db][magrite][update3_3_9to3_3_10]completed');
};

export default update;
