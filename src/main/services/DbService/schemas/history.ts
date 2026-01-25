import { randomUUID } from '@shared/modules/crypto';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const history = sqliteTable('tbl_history', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey()
    .notNull(),
  type: integer('type').notNull(),
  relateId: text('relateId'),
  siteSource: text('siteSource'),
  playEnd: integer('playEnd', { mode: 'boolean' }).default(false),
  videoId: text('videoId'),
  videoImage: text('videoImage'),
  videoName: text('videoName'),
  videoIndex: text('videoIndex'),
  watchTime: real('watchTime').default(0),
  duration: real('duration').default(0),
  skipTimeInEnd: real('skipTimeInEnd').default(0),
  skipTimeInStart: real('skipTimeInStart').default(0),
  createdAt: integer('createdAt', { mode: 'number' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
  updatedAt: integer('updatedAt', { mode: 'number' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .$onUpdate(() => Date.now())
    .notNull(),
});

export type HistoryModel = InferSelectModel<typeof history>;
