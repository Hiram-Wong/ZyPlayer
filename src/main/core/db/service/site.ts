import { asc, eq, like, inArray } from 'drizzle-orm';
import { db, schema } from '../common';

export default {
  async all() {
    return await db.select().from(schema.site);
  },
  async active() {
    return await db.select().from(schema.site).where(eq(schema.site.isActive, true));
  },
  async update(ids, doc) {
    return await db.update(schema.site).set(doc).where(inArray(schema.site.id, ids)).returning();
  },
  async clear() {
    return await db.delete(schema.site);
  },
  async get(id) {
    const res = await db.select().from(schema.site).where(eq(schema.site.id, id));
    return res?.[0];
  },
  async findByKey(key) {
    const res = await db.select().from(schema.site).where(eq(schema.site.key, key));
    return res?.[0];
  },
  async set(doc) {
    await db.delete(schema.site);
    return await db.insert(schema.site).values(doc);
  },
  async add(doc) {
    return await db.insert(schema.site).values(doc).returning();
  },
  async remove(ids) {
    return await db.delete(schema.site).where(inArray(schema.site.id, ids));
  },
  async page(page = 1, pageSize = 20, kw = '') {
    let query = db.select().from(schema.site);
    let count = db.$count(schema.site);

    if (kw) {
      query = query.where(like(schema.site.name, `%${kw}%`));
      count = db.$count(schema.site, like(schema.site.name, `%${kw}%`));
    }
    query = query
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(asc(schema.site.name));

    const list = await query;
    const total = await count;
    return {
      list: list,
      total: total,
    };
  },
  async group() {
    const res = await db.select({ group: schema.site.group }).from(schema.site).groupBy(schema.site.group);
    const resFormat = res.map((item) => ({ label: item.group, value: item.group }));
    return resFormat;
  },
};
