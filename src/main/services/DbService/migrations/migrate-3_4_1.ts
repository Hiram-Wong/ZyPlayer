import type { IOrm, ISchemas } from '@shared/types/db';
import { eq, sql } from 'drizzle-orm';

const migrate = async (orm: IOrm, schemas: ISchemas): Promise<void> => {
  // disable foreign key checks
  await orm.run(sql`PRAGMA foreign_keys=OFF;`);

  /**
   * tbl_analyze refactor
   * change column: url -> api
   * add column: script createdAt updatedAt
   */
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_analyze (
      id        TEXT PRIMARY KEY,
      key       TEXT NOT NULL UNIQUE,
      name      TEXT NOT NULL,
      api       TEXT NOT NULL,
      type      INTEGER NOT NULL,            -- 1 = web, 2 = json
      flag      TEXT DEFAULT '[]',           -- JSON
      headers   TEXT DEFAULT '{}',           -- JSON
      script    TEXT,
      isActive  INTEGER DEFAULT 1,           -- 0 = false, 1 = true
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  const system_flag: { data: string[] } = (
    await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'analyzeFlag'))
  )?.[0]?.value || { data: [] };
  const flag = system_flag?.data || [];
  await orm.run(sql`
    INSERT INTO __new_tbl_analyze (id, key, name, api, type, flag, headers, script, isActive)
    SELECT
      id, key, name, url,
      CASE type
        WHEN 'web' THEN 1
        WHEN 'json' THEN 2
        ELSE 0
      END,
      ${flag}, headers, '', isActive
    FROM tbl_analyze;
  `);
  await orm.run(sql`DROP TABLE tbl_analyze;`);
  await orm.run(sql`ALTER TABLE __new_tbl_analyze RENAME TO tbl_analyze;`);

  /**
   * tbl_channel refactor
   * change column: url -> api
   * add column: logo, playback, createdAt, updatedAt
   */
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_channel (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      api       TEXT NOT NULL,
      logo      TEXT,
      playback  TEXT,
      "group"   TEXT,
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(
    sql`INSERT INTO __new_tbl_channel (id, name, api, logo, playback, "group", createdAt, updatedAt)
    SELECT id, name, url, '', 0, "group", createdAt, updatedAt FROM tbl_channel;`,
  );
  await orm.run(sql`DROP TABLE tbl_channel;`);
  await orm.run(sql`ALTER TABLE __new_tbl_channel RENAME TO tbl_channel;`);

  /**
   * tbl_drive drop
   */
  await orm.run(sql`DROP TABLE tbl_drive;`);

  /**
   * tbl_history refactor
   * change column: date -> createdAt
   * add column: updatedAt
   * change type column value: film:1 live:2 parse:3 search:5 import:6
   */
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_history (
      id              TEXT PRIMARY KEY,
      type            INTEGER NOT NULL,      -- 1 = film, 2 = live, 3 = parse, 5 = search, 6 = simple-import, 7 = complete-import
      relateId        TEXT,
      siteSource      TEXT,
      playEnd         INTEGER DEFAULT 0,     -- 0 = false, 1 = true
      videoId         TEXT,
      videoImage      TEXT,
      videoName       TEXT,
      videoIndex      TEXT,
      watchTime       REAL DEFAULT 0,
      duration        REAL DEFAULT 0,
      skipTimeInEnd   REAL DEFAULT 0,
      skipTimeInStart REAL DEFAULT 0,
      createdAt       INTEGER DEFAULT (strftime('%s','now')),
      updatedAt       INTEGER DEFAULT (strftime('%s','now'))
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_history (
      id, type, relateId, siteSource, playEnd, videoId, videoImage, videoName, videoIndex,
      watchTime, duration, skipTimeInEnd, skipTimeInStart, createdAt
    )
    SELECT
      id,
      CASE type
        WHEN 'film' THEN 1
        WHEN 'iptv' THEN 2
        WHEN 'analyze' THEN 3
        WHEN 'search' THEN 5
        WHEN 'import' THEN 6
        ELSE 0
      END,
      relateId, siteSource, playEnd, videoId, videoImage, videoName, videoIndex,
      watchTime, duration, skipTimeInEnd, skipTimeInStart, date
    FROM tbl_history;
  `);
  await orm.run(sql`DROP TABLE tbl_history;`);
  await orm.run(sql`ALTER TABLE __new_tbl_history RENAME TO tbl_history;`);

  /**
   * tbl_iptv refactor
   * change column: url -> api
   * add column: createdAt, updatedAt
   * change type column value: remote:1 local:2 manual:3
   */
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_iptv (
      id        TEXT PRIMARY KEY,
      key       TEXT NOT NULL UNIQUE,
      name      TEXT NOT NULL,
      api       TEXT NOT NULL,
      type      INTEGER NOT NULL,            -- 1 = remote, 2 = local, 3 = manual
      epg       TEXT,
      logo      TEXT,
      headers   TEXT DEFAULT '{}',           -- JSON
      isActive  INTEGER DEFAULT 1,           -- 1 = true, 0 = false
      createdAt INTEGER DEFAULT (strftime('%s','now')),
      updatedAt INTEGER DEFAULT (strftime('%s','now'))
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_iptv (id, key, name, api, type, epg, logo, headers, isActive)
    SELECT
      id, key, name, url,
      CASE type
        WHEN 'remote' THEN 1
        WHEN 'local' THEN 2
        WHEN 'manual' THEN 3
        ELSE 0
      END, epg, logo, headers, isActive
    FROM tbl_iptv;
  `);
  await orm.run(sql`DROP TABLE tbl_iptv;`);
  await orm.run(sql`ALTER TABLE __new_tbl_iptv RENAME TO tbl_iptv;`);

  /**
   * add tbl_plugin
   */
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS tbl_plugin (
      id          TEXT PRIMARY KEY,
      type        INTEGER DEFAULT 1,         -- 1 = ui, 2 = system, 3 = mix
      name        TEXT NOT NULL,
      pluginName  TEXT NOT NULL,
      author      TEXT,
      description TEXT,
      readme      TEXT,
      base        TEXT NOT NULL,
      main        TEXT,
      web         TEXT,
      version     TEXT,
      logo        TEXT,
      homepage    TEXT,
      isActive    INTEGER DEFAULT 0,           -- 1 = true, 0 = false
      createdAt   INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt   INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);

  /**
   * tbl_setting refactor
   * add column: createdAt, updatedAt
   */
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_setting (
      id        TEXT PRIMARY KEY,
      key       TEXT NOT NULL UNIQUE,
      value     TEXT,                        -- JSON
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_setting (id, key, value)
    SELECT id, key, value FROM tbl_setting;
  `);
  await orm.run(sql`DROP TABLE tbl_setting;`);
  await orm.run(sql`ALTER TABLE __new_tbl_setting RENAME TO tbl_setting;`);

  /**
   * tbl_site refactor
   * add column: createdAt, updatedAt
   */
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_site (
      id         TEXT PRIMARY KEY,
      key        TEXT NOT NULL UNIQUE,
      name       TEXT NOT NULL,
      api        TEXT,
      playUrl    TEXT,
      search     INTEGER DEFAULT 1,          -- 1 = true, 0 = false
      "group"    TEXT,
      type       INTEGER NOT NULL,
      ext        TEXT,
      categories TEXT,
      isActive   INTEGER DEFAULT 1,          -- 1 = true, 0 = false
      createdAt  INTEGER DEFAULT (strftime('%s','now')),
      updatedAt  INTEGER DEFAULT (strftime('%s','now'))
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_site (id, key, name, api, playUrl, search, "group", type, ext, categories, isActive)
    SELECT id, key, name, api, playUrl, search, "group", type, ext, categories, isActive FROM tbl_site;
  `);
  await orm.run(sql`DROP TABLE tbl_site;`);
  await orm.run(sql`ALTER TABLE __new_tbl_site RENAME TO tbl_site;`);

  /**
   * tbl_star refactor
   * change column: date -> createdAt
   * add column: updatedAt
   * change type column value: film:1 live:2 parse:3
   */
  await orm.run(sql`
    CREATE TABLE IF NOT EXISTS __new_tbl_star (
      id            TEXT PRIMARY KEY,
      type          INTEGER NOT NULL,        -- 1 = film, 2 = live, 3 = parse
      relateId      TEXT,
      videoId       TEXT,
      videoImage    TEXT,
      videoName     TEXT,
      videoType     TEXT,
      videoRemarks  TEXT,
      createdAt     INTEGER DEFAULT (strftime('%s','now')),
      updatedAt     INTEGER DEFAULT (strftime('%s','now'))
    );
  `);
  await orm.run(sql`
    INSERT INTO __new_tbl_star (id, type, relateId, videoId, videoImage, videoName, videoType, videoRemarks, createdAt)
    SELECT
      id,
      CASE type
        WHEN 'film' THEN 1
        WHEN 'iptv' THEN 2
        WHEN 'analyze' THEN 3
        ELSE 0
      END,
      relateId, videoId, videoImage, videoName, videoType, videoRemarks, date FROM tbl_star;
  `);
  await orm.run(sql`DROP TABLE tbl_star;`);
  await orm.run(sql`ALTER TABLE __new_tbl_star RENAME TO tbl_star;`);

  // Create indexes for faster queries
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_analyze_key ON tbl_analyze(key);`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_iptv_key ON tbl_iptv(key);`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_setting_key ON tbl_setting(key);`);
  await orm.run(sql`CREATE INDEX IF NOT EXISTS idx_site_key ON tbl_site(key);`);

  // enable foreign key checks
  await orm.run(sql`PRAGMA foreign_keys=ON;`);

  // tbl_setting update key recordShortcut -> bossKey
  const old_bossKey: any = await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'recordShortcut'));
  if (old_bossKey.length > 0) {
    await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'recordShortcut'));
  }
  await orm.insert(schemas.setting).values({ key: 'bossKey', value: { data: old_bossKey || 'Shift+Alt+Z' } });

  // tbl_setting update key selfBoot -> autoStart
  const old_autoStart: { data?: boolean } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'selfBoot')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'selfBoot'));
  await orm.insert(schemas.setting).values({
    key: 'autoStart',
    value: { data: old_autoStart?.data || false },
  });

  // tbl_setting update key agreementMask -> disclaimer, default true(change of disclaimer)
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'agreementMask'));
  await orm.insert(schemas.setting).values({
    key: 'disclaimer',
    value: { data: true },
  });

  // tbl_setting update key defaultHot -> hot
  const old_hot: { data?: string } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'defaultHot')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultHot'));
  await orm.insert(schemas.setting).values({
    key: 'hot',
    value: { data: old_hot?.data || 'kylive' },
  });

  // tbl_setting update key playerMode -> player
  const old_player: { data?: { type: string; external: string } } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'playerMode')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'playerMode'));
  await orm.insert(schemas.setting).values({
    key: 'player',
    value: { data: old_player?.data || { type: 'artplayer', external: '' } },
  });

  // tbl_setting update key snifferMode -> sniffer
  const old_sniffer: { data?: { type: string; url: string } } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'snifferMode')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'snifferMode'));
  await orm.insert(schemas.setting).values({
    key: 'sniffer',
    value: {
      data: old_sniffer?.data || old_sniffer?.data?.type === 'pie' ? { type: 'cdp', url: '' } : old_sniffer?.data,
    },
  });

  // tbl_setting update key ai -> aigc
  const old_aigc: { data?: { server: string; key: string; model: string } } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'ai')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'ai'));
  await orm.insert(schemas.setting).values({
    key: 'aigc',
    value: {
      data: old_aigc?.data
        ? { type: 'openai', ...old_aigc?.data }
        : { type: 'openai', server: '', key: '', model: 'gpt-3.5-turbo' },
    },
  });

  // tbl_setting update value theme
  const old_theme: { data?: string } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'theme')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'theme'));
  await orm.insert(schemas.setting).values({
    key: 'theme',
    value: { data: !old_theme?.data || old_theme?.data === 'auto' ? 'system' : old_theme?.data },
  });

  // tbl_setting update value lang
  const old_lang: { data?: string } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'lang')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'lang'));
  await orm.insert(schemas.setting).values({
    key: 'lang',
    value: { data: !old_lang?.data || old_lang?.data === 'auto' ? 'system' : old_lang?.data },
  });

  // tbl_setting update collect defaultSearchType/defaultFilterType to site
  const old_site_search: { data?: string } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'defaultSearchType')))?.[0]?.value || {};
  const old_site_filter: { data?: boolean } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'defaultFilterType')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultSearchType'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultFilterType'));
  await orm.insert(schemas.setting).values({
    key: 'site',
    value: {
      data: {
        searchMode: old_site_search?.data || 'site',
        filterMode: old_site_filter?.data || false,
      },
    },
  });

  // tbl_setting update collect defaultIptvEpg/defaultIptvLogo/iptvMarkIp/iptvThumbnail/iptvDelay to iptv
  const old_iptv_epg: { data?: string } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'defaultIptvEpg')))?.[0]?.value || {};
  const old_iptv_logo: { data?: string } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'defaultIptvLogo')))?.[0]?.value || {};
  const old_iptv_mark: { data?: boolean } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'iptvMarkIp')))?.[0]?.value || {};
  const old_iptv_thumbnail: { data?: boolean } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'iptvThumbnail')))?.[0]?.value || {};
  const old_iptv_delay: { data?: boolean } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'iptvDelay')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultIptvEpg'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultIptvLogo'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'iptvMarkIp'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'iptvThumbnail'));
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'iptvDelay'));
  await orm.insert(schemas.setting).values({
    key: 'live',
    value: {
      data: {
        ipMark: old_iptv_mark?.data || false,
        thumbnail: old_iptv_thumbnail?.data || false,
        delay: old_iptv_delay?.data || false,
        epg: old_iptv_epg?.data || 'https://epg.112114.eu.org/?ch={name}&date={date}',
        logo: old_iptv_logo?.data || 'https://epg.112114.eu.org/logo/{name}.png',
      },
    },
  });

  // tbl_setting update collect webdav data to old_cloud
  const old_cloud: { data?: Record<string, any> } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'webdav')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'webdav'));
  await orm.insert(schemas.setting).values({
    key: 'old_cloud',
    value: {
      data: {
        sync: old_cloud?.data?.sync || false,
        type: 'webdav',
        url: old_cloud?.data?.url || 'https://dav.jianguoyun.com/dav/',
        username: old_cloud?.data?.username || '',
        password: old_cloud?.data?.password || '',
      },
    },
  });

  // tbl_setting update collect barrage data to barrage
  const old_barrage: { data?: Record<string, any> } =
    (await orm.select().from(schemas.setting).where(eq(schemas.setting.key, 'barrage')))?.[0]?.value || {};
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'barrage'));
  await orm.insert(schemas.setting).values({
    key: 'barrage',
    value: {
      data: {
        url: old_barrage?.data?.url || '',
        id: old_barrage?.data?.id || 'name',
        key: old_barrage?.data?.key || 'danmuku',
        support: old_barrage?.data?.support || [
          'youku',
          'qq',
          'iqiyi',
          'qiyi',
          'letv',
          'leshi',
          'sohu',
          'tudou',
          'pptv',
          'mgtv',
          'imgo',
        ],
        type: old_barrage?.data?.mode || 1,
        text: old_barrage?.data?.content || 4,
        time: old_barrage?.data?.start || 0,
        color: old_barrage?.data?.color || 2,
      },
    },
  });

  // tbl_setting delete key analyzeFlag
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'analyzeFlag'));

  // tbl_setting delete key defaultViewCasual
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'defaultViewCasual'));

  // tbl_setting delete key windowPosition
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'windowPosition'));

  // tbl_setting insert proxy
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'proxy'));
  await orm.insert(schemas.setting).values({
    key: 'proxy',
    value: { data: { type: 'system', url: '', bypass: '' } },
  });

  // tbl_setting insert zoom
  await orm.delete(schemas.setting).where(eq(schemas.setting.key, 'zoom'));
  await orm.insert(schemas.setting).values({
    key: 'zoom',
    value: { data: 1 },
  });
};

export default migrate;
