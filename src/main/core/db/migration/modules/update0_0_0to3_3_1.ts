import { db, client, schema } from '../../common';
import { tblSetting } from './init';
import logger from '@main/core/logger';

const update = async () => {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS tbl_setting (
      id uuid DEFAULT gen_random_uuid(),
      key varchar(255) not null,
      value text DEFAULT null
    );

    CREATE TABLE IF NOT EXISTS tbl_site (
      id uuid DEFAULT gen_random_uuid(),
      name varchar(255) not null,
      key varchar(255) not null,
      api varchar(255) not null,
      "playUrl" varchar(255),
      search integer not null default 0,
      "group" varchar(255),
      type integer not null,
      ext text,
      categories varchar(255),
      "isActive" boolean not null default true
    );

    CREATE TABLE IF NOT EXISTS tbl_iptv (
      id uuid DEFAULT gen_random_uuid(),
      key varchar(255) not null,
      name varchar(255) not null,
      url text not null,
      type varchar(255) not null,
      epg varchar(255),
      logo varchar(255),
      headers varchar(2048),
      "isActive" boolean not null default true
    );

    CREATE TABLE IF NOT EXISTS tbl_channel (
      id uuid DEFAULT gen_random_uuid(),
      name varchar(255) not null,
      url varchar(1024) not null,
      "group" varchar(255)
    );

    CREATE TABLE IF NOT EXISTS tbl_drive (
      id uuid DEFAULT gen_random_uuid(),
      key varchar(255) not null,
      name varchar(255) not null,
      server varchar(255) not null,
      "startPage" varchar(255),
      search boolean not null default false,
      headers varchar(2048),
      params varchar(2048),
      "showAll" boolean default false,
      "isActive" boolean not null default true
    );

    CREATE TABLE IF NOT EXISTS tbl_analyze (
      id uuid DEFAULT gen_random_uuid(),
      key varchar(255) not null,
      name varchar(255) not null,
      url varchar(255) not null,
      type integer not null default 0,
      headers varchar(2048),
      "isActive" boolean not null default true
    );

    CREATE TABLE IF NOT EXISTS tbl_star (
      id uuid DEFAULT gen_random_uuid(),
      "date" integer,
      "type" varchar(255) not null,
      "relateId" varchar(255) not null,
      "videoId" varchar(1024) not null,
      "videoImage" varchar(2048),
      "videoName" varchar(1024),
      "videoType" varchar(1024),
      "videoRemarks" varchar(1024)
    );

    CREATE TABLE IF NOT EXISTS tbl_history (
      id uuid DEFAULT gen_random_uuid(),
      "date" integer,
      "type" varchar(255) not null,
      "relateId" varchar(255),
      "siteSource" varchar(255),
      "playEnd" boolean,
      "videoId" varchar(1024),
      "videoImage" varchar(2048),
      "videoName" varchar(1024),
      "videoIndex" varchar(2048),
      "watchTime" real,
      "duration" real,
      "skipTimeInEnd" real,
      "skipTimeInStart" real
    );
  `);

  if ((await db.select().from(schema.setting)).length === 0) {
    tblSetting.forEach(async (item) => {
      await db.insert(schema.setting).values({ key: item.key, value: { data: item.value } });
    });
  }

  logger.info('[db][init]completed');
};

export default update;
