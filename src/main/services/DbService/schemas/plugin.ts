import { randomUUID } from '@shared/modules/crypto';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const plugin = sqliteTable('tbl_plugin', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey()
    .notNull(),
  type: integer('type').default(2),
  name: text('name'),
  pluginName: text('pluginName').notNull(),
  author: text('author'),
  description: text('description'),
  readme: text('readme'),
  base: text('base').notNull(),
  main: text('main'),
  web: text('web'),
  version: text('version'),
  logo: text('logo'),
  homepage: text('homepage'),
  isActive: integer('isActive', { mode: 'boolean' }).default(false),
  createdAt: integer('createdAt', { mode: 'number' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
  updatedAt: integer('updatedAt', { mode: 'number' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .$onUpdate(() => Date.now())
    .notNull(),
});

export type PluginModel = InferSelectModel<typeof plugin>;
