import type { ISettingKey } from '@shared/config/tblSetting';
import type { IOrm, ISchemas } from '@shared/types/db';
import { eq, inArray } from 'drizzle-orm';

export default {
  // Retrieves all records
  async all(orm: IOrm, schemas: ISchemas) {
    const res = await orm.select().from(schemas.setting);

    return res.reduce((acc, item) => {
      acc[item.key] = (item.value as { data?: any })?.data;
      return acc;
    }, {});
  },

  // Updates records by ID and returns the updated rows
  async update(orm: IOrm, schemas: ISchemas, doc: { key: ISettingKey; value: any }) {
    return await orm
      .update(schemas.setting)
      .set({ value: { data: doc.value } })
      .where(eq(schemas.setting.key, doc.key))
      .returning();
  },

  // Deletes all records
  async clear(orm: IOrm, schemas: ISchemas) {
    return await orm.delete(schemas.setting);
  },

  // Retrieves a single record by its key
  async get(orm: IOrm, schemas: ISchemas, key: ISettingKey) {
    const [res] = await orm.select().from(schemas.setting).where(eq(schemas.setting.key, key));
    return res;
  },

  // Clears the table and inserts new records
  async set(orm: IOrm, schemas: ISchemas, doc: Array<{ key: ISettingKey; value: any }>) {
    await orm.delete(schemas.setting);

    const newDocs = Object.entries(doc).map(([key, value]) => ({
      key,
      value: { data: value },
    }));

    return await orm.insert(schemas.setting).values(newDocs);
  },

  // Adds a new record and returns the inserted row
  async add(orm: IOrm, schemas: ISchemas, doc: { key: ISettingKey; value: any }) {
    return await orm
      .insert(schemas.setting)
      .values({ key: doc.key, value: { data: doc.value } })
      .returning();
  },

  // Removes records by key
  async remove(orm: IOrm, schemas: ISchemas, keys: Array<ISettingKey>) {
    return await orm.delete(schemas.setting).where(inArray(schemas.setting.key, keys));
  },
};
