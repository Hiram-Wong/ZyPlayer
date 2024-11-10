import { asc, eq, like, inArray } from 'drizzle-orm';
import { db, schema } from '../common';

export default {
  async all() {
    return await db.select().from(schema.analyze);
  },
  async active() {
    return await db.select().from(schema.analyze).where(eq(schema.analyze.isActive, true));
  },
  async update(ids, doc) {
    return await db.update(schema.analyze).set(doc).where(inArray(schema.analyze.id, ids)).returning();
  },
  async clear() {
    return await db.delete(schema.analyze);
  },
  async get(id) {
    const res = await db.select().from(schema.analyze).where(eq(schema.analyze.id, id));
    return res?.[0];
  },
  async set(doc) {
    await db.delete(schema.analyze);
    return await db.insert(schema.analyze).values(doc);
  },
  async add(doc) {
    return await db.insert(schema.analyze).values(doc).returning();
  },
  async remove(ids) {
    return await db.delete(schema.analyze).where(inArray(schema.analyze.id, ids));
  },
  async page(page = 1, pageSize = 20, kw = '') {
    let query = db.select().from(schema.analyze);
    let count = db.$count(schema.analyze);

    if (kw) {
      query = query.where(like(schema.analyze.name, `%${kw}%`));
      count = db.$count(schema.analyze, like(schema.analyze.name, `%${kw}%`));
    }
    query = query
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(asc(schema.analyze.name));

    const list = await query;
    const total = await count;
    return {
      list: list,
      total: total,
    };
  },
};
