import { randomUUID } from '@shared/modules/crypto';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const setting = sqliteTable(
  'tbl_setting',
  {
    id: text('id')
      .$defaultFn(() => randomUUID())
      .primaryKey()
      .notNull(),
    key: text('key').notNull().unique(),
    value: text('value', { mode: 'json' }).$type<{ data: any }>(),
    createdAt: integer('createdAt', { mode: 'number' })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
    updatedAt: integer('updatedAt', { mode: 'number' })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .$onUpdate(() => Date.now())
      .notNull(),
  },
  (table) => [index('idx_setting_key').on(table.key)],
);

export type SettingModel = InferSelectModel<typeof setting>;
