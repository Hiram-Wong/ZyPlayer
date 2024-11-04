import { eq, inArray } from 'drizzle-orm';
import { db, schema } from '../common';

export default {
  async all() {
    const res = await db.select().from(schema.setting);
    let resFormat = {};
    res.map((item) => {
      resFormat[item['key']] = item['value']?.['data'];
    });
    return resFormat;
  },
  async update(ids, doc) {
    return await db
      .update(schema.setting)
      .set({ value: { data: doc } })
      .where(inArray(schema.setting.key, ids))
      .returning();
  },
  async clear() {
    return await db.delete(schema.setting);
  },
  async get(id) {
    const res = await db.select().from(schema.setting).where(eq(schema.setting.key, id));
    const resFormat = res?.[0]?.['value']?.['data'];
    return resFormat || null;
  },
  async set(doc) {
    await db.delete(schema.setting);
    let newDoc: any[] = [];
    for (const key in doc) {
      newDoc.push({ key: key, value: { data: doc[key] } });
    }
    return await db.insert(schema.setting).values(newDoc);
  },
  async add(doc) {
    return await db.insert(schema.setting).values(doc).returning();
  },
  async remove(ids) {
    return await db.delete(schema.setting).where(inArray(schema.setting.key, ids));
  },
};
