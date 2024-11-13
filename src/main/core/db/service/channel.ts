import { and, asc, eq, like, inArray } from 'drizzle-orm';
import { db, schema } from '../common';

export default {
  async all() {
    return await db.select().from(schema.channel);
  },
  async update(ids, doc) {
    return await db.update(schema.channel).set(doc).where(inArray(schema.channel.id, ids)).returning();
  },
  async clear() {
    return await db.delete(schema.channel);
  },
  async get(id) {
    const res = await db.select().from(schema.channel).where(eq(schema.channel.id, id));
    return res?.[0];
  },
  async set(doc) {
    await db.delete(schema.channel);
    return await db.insert(schema.channel).values(doc);
  },
  async add(doc) {
    return await db.insert(schema.channel).values(doc).returning();
  },
  async remove(ids) {
    return await db.delete(schema.channel).where(inArray(schema.channel.id, ids));
  },
  async page(page = 1, pageSize = 20, kw = '', group = '全部') {
    const baseQuery = db.select().from(schema.channel);
    const conditions: any[] = [];

    if (group !== '全部') {
      conditions.push(eq(schema.channel.group, group));
    }
    if (kw) {
      conditions.push(like(schema.channel.name, `%${kw}%`));
    }

    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    query
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(asc(schema.channel.name));
    const list = await query;

    const countQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const total = await countQuery;

    return {
      list: list,
      total: total.length,
    };
  },
  async group() {
    const res = await db.select({ group: schema.channel.group }).from(schema.channel).groupBy(schema.channel['group']);
    const resFormat = res.map((item) => ({ type_id: item.group, type_name: item.group }));
    return resFormat;
  },
};
