import { randomUUID } from '@shared/modules/crypto';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const analyze = sqliteTable(
  'tbl_analyze',
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
    flag: text('flag', { mode: 'json' }).$type<string[]>().default([]),
    headers: text('headers', { mode: 'json' }).$type<Record<string, any>>().default({}),
    script: text('script'),
    isActive: integer('isActive', { mode: 'boolean' }).default(true),
    createdAt: integer('createdAt', { mode: 'number' })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
    updatedAt: integer('updatedAt', { mode: 'number' })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .$onUpdate(() => Date.now())
      .notNull(),
  },
  (table) => [index('idx_analyze_key').on(table.key)],
);

export type AnalyzeModel = InferSelectModel<typeof analyze>;
