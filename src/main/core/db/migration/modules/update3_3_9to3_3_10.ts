import { eq } from 'drizzle-orm';
import { db, client, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  await client.exec(`
    ALTER TABLE tbl_history ALTER COLUMN "videoId" TYPE varchar(510);
    ALTER TABLE tbl_history ALTER COLUMN "videoImage" TYPE varchar(510);
    ALTER TABLE tbl_history ALTER COLUMN "videoIndex" TYPE varchar(510);
    ALTER TABLE tbl_history ALTER COLUMN "videoName" TYPE varchar(510);

    ALTER TABLE tbl_star ALTER COLUMN "videoId" TYPE varchar(510);
    ALTER TABLE tbl_star ALTER COLUMN "videoImage" TYPE varchar(510);
    ALTER TABLE tbl_star ALTER COLUMN "videoName" TYPE varchar(510);
  `);

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.3.10' } });

  logger.info('[db][magrite][update3_3_9to3_3_10]completed');
};

export default update;
