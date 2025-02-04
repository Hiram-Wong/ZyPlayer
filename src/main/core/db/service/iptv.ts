import { asc, eq, ilike, inArray } from 'drizzle-orm';
import { db, schema } from '../common';

export default {
  async all() {
    return await db.select().from(schema.iptv);
  },
  async active() {
    return await db.select().from(schema.iptv).where(eq(schema.iptv.isActive, true)).orderBy(asc(schema.iptv.name));
  },
  async update(ids, doc) {
    return await db.update(schema.iptv).set(doc).where(inArray(schema.iptv.id, ids)).returning();
  },
  async clear() {
    return await db.delete(schema.iptv);
  },
  async get(id) {
    const res = await db.select().from(schema.iptv).where(eq(schema.iptv.id, id));
    return res?.[0];
  },
  async set(doc) {
    await db.delete(schema.iptv);
    return await db.insert(schema.iptv).values(doc);
  },
  async add(doc) {
    return await db.insert(schema.iptv).values(doc).returning();
  },
  async remove(ids) {
    return await db.delete(schema.iptv).where(inArray(schema.iptv.id, ids));
  },
  async page(page = 1, pageSize = 20, kw = '') {
    let query = db.select().from(schema.iptv);
    let count = db.$count(schema.iptv);

    if (kw) {
      query = query.where(ilike(schema.iptv.name, `%${kw}%`));
      count = db.$count(schema.iptv, ilike(schema.iptv.name, `%${kw}%`));
    }
    query = query
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(asc(schema.iptv.name));

    const list = await query;
    const total = await count;
    return {
      list: list,
      total: total,
    };
  },
};
