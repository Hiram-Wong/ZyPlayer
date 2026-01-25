import type { IModels, IOrm, ISchemas } from '@shared/types/db';
import type { SQLWrapper } from 'drizzle-orm';
import { and, asc, count, eq, inArray, like, sql } from 'drizzle-orm';

export default {
  // Retrieves all records
  async all(orm: IOrm, schemas: ISchemas) {
    return orm.select().from(schemas.analyze);
  },

  // Retrieves all active records, ordered by name
  async active(orm: IOrm, schemas: ISchemas) {
    return await orm
      .select()
      .from(schemas.analyze)
      .where(eq(schemas.analyze.isActive, true))
      .orderBy(asc(schemas.analyze.createdAt));
  },

  // Updates records by ID and returns the updated rows
  async update(orm: IOrm, schemas: ISchemas, ids: Array<string>, doc: IModels['analyze']) {
    return await orm.update(schemas.analyze).set(doc).where(inArray(schemas.analyze.id, ids)).returning();
  },

  // Deletes all records
  async clear(orm: IOrm, schemas: ISchemas) {
    return await orm.delete(schemas.analyze);
  },

  // Retrieves a single record by its ID
  async get(orm: IOrm, schemas: ISchemas, id: string) {
    const [res] = await orm.select().from(schemas.analyze).where(eq(schemas.analyze.id, id));
    return res;
  },

  // Retrieves records matching specified fields with optional pagination
  async getByField(
    orm: IOrm,
    schemas: ISchemas,
    condition: Partial<{ [K in keyof IModels['analyze']]: any } & { page: number; pageSize: number }> = {},
  ) {
    const { page, pageSize, ...filterFields } = condition;
    const conds = Object.entries(filterFields).map(([k, v]) =>
      Array.isArray(v) ? inArray(schemas.analyze[k], v) : eq(schemas.analyze[k], v),
    );

    let query = orm
      .select()
      .from(schemas.analyze)
      .where(conds.length ? and(...conds) : sql`true`) as any;
    if (page && pageSize) {
      query = query.limit(pageSize).offset((page - 1) * pageSize);
    }

    const res = await query;
    return res;
  },

  // Clears the table and inserts new records
  async set(orm: IOrm, schemas: ISchemas, doc: Array<IModels['analyze']>) {
    await orm.delete(schemas.analyze);
    return await orm.insert(schemas.analyze).values(doc);
  },

  // Adds a new record and returns the inserted row
  async add(orm: IOrm, schemas: ISchemas, doc: IModels['analyze']) {
    return await orm.insert(schemas.analyze).values(doc).returning();
  },

  // Removes records by ID
  async remove(orm: IOrm, schemas: ISchemas, ids: Array<string>) {
    return await orm.delete(schemas.analyze).where(inArray(schemas.analyze.id, ids));
  },

  // Removes records matching specified fields
  async removeByField(orm: IOrm, schemas: ISchemas, condition: Partial<{ [K in keyof IModels['analyze']]: any }> = {}) {
    const conds = Object.entries(condition).map(([k, v]) =>
      Array.isArray(v) ? inArray(schemas.analyze[k], v) : eq(schemas.analyze[k], v),
    );

    const query = orm.delete(schemas.analyze).where(conds.length ? and(...conds) : sql`true`);

    const res = await query;
    return res;
  },

  // Retrieves a paginated list of records with optional keyword search
  async page(orm: IOrm, schemas: ISchemas, page: number = 1, pageSize: number = 20, kw?: string) {
    const conditions: SQLWrapper[] = [];
    if (kw) {
      conditions.push(like(schemas.analyze.name, `%${kw}%`));
    }

    const dataBaseQuery = orm.select().from(schemas.analyze);
    const dataConditionQuery = conditions.length > 0 ? dataBaseQuery.where(and(...conditions)) : dataBaseQuery;
    const dataQuery = dataConditionQuery
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(asc(schemas.analyze.createdAt));
    const list = await dataQuery;

    const countBaseQuery = orm.select({ count: count() }).from(schemas.analyze);
    const countConditionQuery = conditions.length > 0 ? countBaseQuery.where(and(...conditions)) : countBaseQuery;
    const countQuery = await countConditionQuery;
    const total = countQuery[0]?.count || 0;

    return { list, total };
  },
};
