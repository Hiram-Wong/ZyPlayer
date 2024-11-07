import { and, eq, like, inArray } from 'drizzle-orm';
import { db, schema } from '../common';

export default {
  async all() {
    return await db.select().from(schema.history);
  },
  async update(ids, doc) {
    return await db.update(schema.history).set(doc).where(inArray(schema.history.id, ids)).returning();
  },
  async clear() {
    return await db.delete(schema.history);
  },
  async get(id) {
    const res = await db.select().from(schema.history).where(eq(schema.history.id, id));
    return res?.[0];
  },
  async find(relateId, videoId) {
    const res = await db
      .select()
      .from(schema.history)
      .where(and(eq(schema.history.relateId, relateId), eq(schema.history.videoId, videoId)));
    return res?.[0];
  },
  async set(doc) {
    await db.delete(schema.history);
    return await db.insert(schema.history).values(doc);
  },
  async add(doc) {
    return await db.insert(schema.history).values(doc).returning();
  },
  async remove(ids) {
    return await db.delete(schema.history).where(inArray(schema.history.id, ids));
  },
  async removeByType(type) {
    return await db.delete(schema.history).where(eq(schema.history.type, type));
  },
  async page(page = 1, pageSize = 20, type = 'all', kw = '') {
    const baseQuery = db.select().from(schema.history);
    const conditions: any[] = [];

    if (type !== 'all') {
      conditions.push(eq(schema.history.type, type));
    }
    if (kw) {
      conditions.push(like(schema.history.videoName, `%${kw}%`));
    }

    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    query.limit(pageSize).offset((page - 1) * pageSize);
    const list = await query;

    const countQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const total = await countQuery;

    return {
      list: list,
      total: total.length,
    };
  },
};
