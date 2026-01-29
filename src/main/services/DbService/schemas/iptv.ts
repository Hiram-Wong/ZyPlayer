import { randomUUID } from '@shared/modules/crypto';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const iptv = sqliteTable(
  'tbl_iptv',
  {
    id: text('id')
      .$defaultFn(() => randomUUID())
      .primaryKey()
      .notNull(),
    key: text('key')
      .$defaultFn(() => randomUUID())
      .unique()
      .notNull(),
    name: text('name').notNull(),
    api: text('api').notNull(),
    type: integer('type').notNull(),
    epg: text('epg'),
    logo: text('logo'),
    headers: text('headers', { mode: 'json' }).$type<Record<string, any>>().default({}),
    isActive: integer('isActive', { mode: 'boolean' }).default(true),
    createdAt: integer('createdAt', { mode: 'number' })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
    updatedAt: integer('updatedAt', { mode: 'number' })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .$onUpdate(() => Date.now())
      .notNull(),
  },
  (table) => [index('idx_iptv_key').on(table.key)],
);

export type IptvModel = InferSelectModel<typeof iptv>;
