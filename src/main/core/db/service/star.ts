import { and, eq, desc, like, inArray } from 'drizzle-orm';
import { db, schema } from '../common';

export default {
  async all() {
    return await db.select().from(schema.star);
  },
  async update(ids, doc) {
    return await db.update(schema.star).set(doc).where(inArray(schema.star.id, ids)).returning();
  },
  async clear() {
    return await db.delete(schema.star);
  },
  async get(id) {
    const res = await db.select().from(schema.star).where(eq(schema.star.id, id));
    return res?.[0];
  },
  async find(relateId, videoId) {
    const res = await db
      .select()
      .from(schema.star)
      .where(and(eq(schema.star.relateId, relateId), eq(schema.star.videoId, videoId)));
    return res?.[0];
  },
  async set(doc) {
    await db.delete(schema.star);
    return await db.insert(schema.star).values(doc);
  },
  async add(doc) {
    return await db.insert(schema.star).values(doc).returning();
  },
  async remove(ids) {
    return await db.delete(schema.star).where(inArray(schema.star.id, ids));
  },
  async page(page = 1, pageSize = 20, kw = '') {
    let query = db.select().from(schema.star);
    let count = db.$count(schema.star);

    if (kw) {
      query = query.where(like(schema.star.name, `%${kw}%`));
      count = db.$count(schema.star, like(schema.star.name, `%${kw}%`));
    }
    query = query
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(schema.star.date));

    const list = await query;
    const total = await count;
    return {
      list: list,
      total: total,
    };
  },
};
