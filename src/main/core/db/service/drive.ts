import { eq, like, inArray } from 'drizzle-orm';
import { db, schema } from '../common';

export default {
  async all() {
    return await db.select().from(schema.drive);
  },
  async active() {
    return await db.select().from(schema.drive).where(eq(schema.drive.isActive, true));
  },
  async update(ids, doc) {
    return await db.update(schema.drive).set(doc).where(inArray(schema.drive.id, ids)).returning();
  },
  async clear() {
    return await db.delete(schema.drive);
  },
  async get(id) {
    const res = await db.select().from(schema.drive).where(eq(schema.drive.id, id));
    return res?.[0];
  },
  async set(doc) {
    await db.delete(schema.drive);
    return await db.insert(schema.drive).values(doc);
  },
  async add(doc) {
    return await db.insert(schema.drive).values(doc).returning();
  },
  async remove(ids) {
    return await db.delete(schema.drive).where(inArray(schema.drive.id, ids));
  },
  async page(page = 1, pageSize = 20, kw = '') {
    let query = db.select().from(schema.drive);
    let count = db.$count(schema.drive);

    if (kw) {
      query = query.where(like(schema.drive.name, `%${kw}%`));
      count = db.$count(schema.drive, like(schema.drive.name, `%${kw}%`));
    }
    query = query.limit(pageSize).offset((page - 1) * pageSize);

    const list = await query;
    const total = await count;
    return {
      list: list,
      total: total,
    };
  },
};
