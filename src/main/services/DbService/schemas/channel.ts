import { randomUUID } from '@shared/modules/crypto';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const channel = sqliteTable('tbl_channel', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey()
    .notNull(),
  name: text('name').notNull(),
  api: text('api').notNull(),
  logo: text('logo'),
  playback: text('playback'),
  group: text('group'),
  createdAt: integer('createdAt', { mode: 'number' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
  updatedAt: integer('updatedAt', { mode: 'number' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .$onUpdate(() => Date.now())
    .notNull(),
});

export type ChannelModel = InferSelectModel<typeof channel>;
