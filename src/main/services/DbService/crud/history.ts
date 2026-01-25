import { isArray, isArrayEmpty } from '@shared/modules/validate';
import type { IModels, IOrm, ISchemas } from '@shared/types/db';
import type { SQLWrapper } from 'drizzle-orm';
import { and, count, desc, eq, inArray, like, sql } from 'drizzle-orm';

export default {
  // Retrieves all records
  async all(orm: IOrm, schemas: ISchemas) {
    return orm.select().from(schemas.history);
  },

  // Updates records by ID and returns the updated rows
  async update(orm: IOrm, schemas: ISchemas, ids: Array<string>, doc: IModels['history']) {
    return await orm.update(schemas.history).set(doc).where(inArray(schemas.history.id, ids)).returning();
  },

  // Deletes all records
  async clear(orm: IOrm, schemas: ISchemas) {
    return await orm.delete(schemas.history);
  },

  // Retrieves a single record by its ID
  async get(orm: IOrm, schemas: ISchemas, id: string) {
    const [res] = await orm.select().from(schemas.history).where(eq(schemas.history.id, id));
    return res;
  },

  // Retrieves records matching specified fields with optional pagination
  async getByField(
    orm: IOrm,
    schemas: ISchemas,
    condition: Partial<{ [K in keyof IModels['history']]: any } & { page: number; pageSize: number }> = {},
  ) {
    const { page, pageSize, ...filterFields } = condition;
    const conds = Object.entries(filterFields).map(([k, v]) =>
      Array.isArray(v) ? inArray(schemas.history[k], v) : eq(schemas.history[k], v),
    );

    let query = orm
      .select()
      .from(schemas.history)
      .where(conds.length ? and(...conds) : sql`true`) as any;
    if (page && pageSize) {
      query = query.limit(pageSize).offset((page - 1) * pageSize);
    }

    const res = await query;
    return res;
  },

  // Clears the table and inserts new records
  async set(orm: IOrm, schemas: ISchemas, doc: Array<IModels['history']>) {
    await orm.delete(schemas.history);
    return await orm.insert(schemas.history).values(doc);
  },

  // Adds a new record and returns the inserted row
  async add(orm: IOrm, schemas: ISchemas, doc: IModels['history']) {
    return await orm.insert(schemas.history).values(doc).returning();
  },

  // Removes records by ID
  async remove(orm: IOrm, schemas: ISchemas, ids: Array<string>) {
    return await orm.delete(schemas.history).where(inArray(schemas.history.id, ids));
  },

  // Removes records matching specified fields
  async removeByField(orm: IOrm, schemas: ISchemas, condition: Partial<{ [K in keyof IModels['history']]: any }> = {}) {
    const conds = Object.entries(condition).map(([k, v]) =>
      Array.isArray(v) ? inArray(schemas.history[k], v) : eq(schemas.history[k], v),
    );

    const query = orm.delete(schemas.history).where(conds.length ? and(...conds) : sql`true`);

    const res = await query;
    return res;
  },

  // Retrieves a paginated list of records with optional keyword and type search
  async page(
    orm: IOrm,
    schemas: ISchemas,
    page: number = 1,
    pageSize: number = 20,
    kw?: string,
    type?: IModels['history']['type'][],
  ) {
    const conditions: SQLWrapper[] = [];
    if (kw) {
      conditions.push(like(schemas.history.videoName, `%${kw}%`));
    }

    if (isArray(type) && !isArrayEmpty(type)) {
      conditions.push(inArray(schemas.history.type, type));
    }

    const dataBaseQuery = orm.select().from(schemas.history);
    const dataConditionQuery = conditions.length > 0 ? dataBaseQuery.where(and(...conditions)) : dataBaseQuery;
    const dataQuery = dataConditionQuery
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(desc(schemas.history.updatedAt));
    const list = await dataQuery;

    const countBaseQuery = orm.select({ count: count() }).from(schemas.history);
    const countConditionQuery = conditions.length > 0 ? countBaseQuery.where(and(...conditions)) : countBaseQuery;
    const countQuery = await countConditionQuery;
    const total = countQuery[0]?.count || 0;

    return { list, total };
  },
};
