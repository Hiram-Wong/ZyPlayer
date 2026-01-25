import { randomUUID } from '@shared/modules/crypto';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const star = sqliteTable('tbl_star', {
  id: text('id')
    .$defaultFn(() => randomUUID())
    .primaryKey()
    .notNull(),
  type: integer('type').notNull(),
  relateId: text('relateId'),
  videoId: text('videoId'),
  videoImage: text('videoImage'),
  videoName: text('videoName'),
  videoType: text('videoType'),
  videoRemarks: text('videoRemarks'),
  createdAt: integer('createdAt', { mode: 'number' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
  updatedAt: integer('updatedAt', { mode: 'number' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .$onUpdate(() => Date.now())
    .notNull(),
});

export type StarModel = InferSelectModel<typeof star>;
