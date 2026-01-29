import { randomUUID } from '@shared/modules/crypto';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const site = sqliteTable(
  'tbl_site',
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
    api: text('api'),
    playUrl: text('playUrl'),
    search: integer('search', { mode: 'boolean' }).default(true),
    group: text('group'),
    type: integer('type').notNull(),
    ext: text('ext'),
    categories: text('categories'),
    isActive: integer('isActive', { mode: 'boolean' }).default(true),
    createdAt: integer('createdAt', { mode: 'number' })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
    updatedAt: integer('updatedAt', { mode: 'number' })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .$onUpdate(() => Date.now())
      .notNull(),
  },
  (table) => [index('idx_site_key').on(table.key)],
);

export type SiteModel = InferSelectModel<typeof site>;
