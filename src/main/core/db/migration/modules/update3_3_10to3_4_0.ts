import { eq } from 'drizzle-orm';
import { db, client, schema } from '../../common';
import logger from '@main/core/logger';

const update = async () => {
  await client.exec(`
    ALTER TABLE tbl_star ADD COLUMN "type" VARCHAR(255);
    UPDATE tbl_star SET "type" = 'film';
    ALTER TABLE tbl_star ALTER COLUMN "type" SET NOT NULL;
    ALTER TABLE tbl_star ALTER COLUMN "videoName" TYPE varchar(1024);
    ALTER TABLE tbl_star ALTER COLUMN "videoType" TYPE varchar(1024);
    ALTER TABLE tbl_star ALTER COLUMN "videoRemarks" TYPE varchar(1024);
    ALTER TABLE tbl_star ALTER COLUMN "videoImage" TYPE varchar(2048);

    ALTER TABLE tbl_history ALTER COLUMN "videoName" TYPE varchar(1024);
    ALTER TABLE tbl_history ALTER COLUMN "videoIndex" TYPE varchar(2048);
    ALTER TABLE tbl_history ALTER COLUMN "videoImage" TYPE varchar(2048);

    ALTER TABLE tbl_iptv ADD COLUMN key VARCHAR(255);
    UPDATE tbl_iptv SET key = CAST(id AS TEXT);
    ALTER TABLE tbl_iptv ALTER COLUMN key SET NOT NULL;
    ALTER TABLE tbl_iptv ADD COLUMN headers VARCHAR(2048);

    ALTER TABLE tbl_drive ADD COLUMN key VARCHAR(255);
    UPDATE tbl_drive SET key = CAST(id AS TEXT);
    ALTER TABLE tbl_drive ALTER COLUMN key SET NOT NULL;
    ALTER TABLE tbl_drive ALTER COLUMN headers TYPE varchar(2048);
    ALTER TABLE tbl_drive ALTER COLUMN params TYPE varchar(2048);

    ALTER TABLE tbl_analyze ADD COLUMN key VARCHAR(255);
    UPDATE tbl_analyze SET key = CAST(id AS TEXT);
    ALTER TABLE tbl_analyze ALTER COLUMN key SET NOT NULL;
    ALTER TABLE tbl_analyze ADD COLUMN headers VARCHAR(2048);
  `);

  const old_version = await db.select().from(schema.setting).where(eq(schema.setting.key, 'version'));
  if (old_version.length > 0) {
    await db.delete(schema.setting).where(eq(schema.setting.key, 'version'));
  }
  await db.insert(schema.setting).values({ key: 'version', value: { data: '3.4.0' } });

  logger.info('[db][magrite][update3_3_10to3_4_0]completed');
};

export default update;
