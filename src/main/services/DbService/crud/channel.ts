import type { IModels, IOrm, ISchemas } from '@shared/types/db';
import type { SQLWrapper } from 'drizzle-orm';
import { and, asc, count, eq, inArray, isNotNull, like, ne, sql } from 'drizzle-orm';

export default {
  // Retrieves all records
  async all(orm: IOrm, schemas: ISchemas) {
    return await orm.select().from(schemas.channel);
  },

  // Updates records by ID and returns the updated rows
  async update(orm: IOrm, schemas: ISchemas, ids: Array<string>, doc: IModels['channel']) {
    return await orm.update(schemas.channel).set(doc).where(inArray(schemas.channel.id, ids)).returning();
  },

  // Deletes all records
  async clear(orm: IOrm, schemas: ISchemas) {
    return await orm.delete(schemas.channel);
  },

  // Retrieves a single record by its ID
  async get(orm: IOrm, schemas: ISchemas, id: string) {
    const [res] = await orm.select().from(schemas.channel).where(eq(schemas.channel.id, id));
    return res;
  },

  // Retrieves records matching specified fields with optional pagination
  async getByField(
    orm: IOrm,
    schemas: ISchemas,
    condition: Partial<{ [K in keyof IModels['channel']]: any } & { page: number; pageSize: number }> = {},
  ) {
    const { page, pageSize, ...filterFields } = condition;
    const conds = Object.entries(filterFields).map(([k, v]) =>
      Array.isArray(v) ? inArray(schemas.channel[k], v) : eq(schemas.channel[k], v),
    );

    let query = orm
      .select()
      .from(schemas.channel)
      .where(conds.length ? and(...conds) : sql`true`) as any;
    if (page && pageSize) {
      query = query.limit(pageSize).offset((page - 1) * pageSize);
    }

    const res = await query;
    return res;
  },

  // Clears the table and inserts new records
  async set(orm: IOrm, schemas: ISchemas, doc: Array<IModels['channel']>) {
    await orm.delete(schemas.channel);
    return await orm.insert(schemas.channel).values(doc);
  },

  // Adds a new record and returns the inserted row
  async add(orm: IOrm, schemas: ISchemas, doc: IModels['channel']) {
    return await orm.insert(schemas.channel).values(doc).returning();
  },

  // Removes records by ID
  async remove(orm: IOrm, schemas: ISchemas, ids: Array<string>) {
    return await orm.delete(schemas.channel).where(inArray(schemas.channel.id, ids));
  },

  // Removes records matching specified fields
  async removeByField(orm: IOrm, schemas: ISchemas, condition: Partial<{ [K in keyof IModels['channel']]: any }> = {}) {
    const conds = Object.entries(condition).map(([k, v]) =>
      Array.isArray(v) ? inArray(schemas.channel[k], v) : eq(schemas.channel[k], v),
    );

    const query = orm.delete(schemas.channel).where(conds.length ? and(...conds) : sql`true`);

    const res = await query;
    return res;
  },

  // Retrieves a paginated list of records with optional keyword search
  async page(orm: IOrm, schemas: ISchemas, page: number = 1, pageSize: number = 20, kw?: string, group?: string) {
    const conditions: SQLWrapper[] = [];
    if (kw) {
      conditions.push(like(schemas.channel.name, `%${kw}%`));
    }
    if (group) {
      conditions.push(eq(schemas.channel.group, group!));
    }

    const dataBaseQuery = orm.select().from(schemas.channel);
    const dataConditionQuery = conditions.length > 0 ? dataBaseQuery.where(and(...conditions)) : dataBaseQuery;
    const dataQuery = dataConditionQuery
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy(asc(schemas.channel.createdAt));
    const list = await dataQuery;

    const countBaseQuery = orm.select({ count: count() }).from(schemas.channel);
    const countConditionQuery = conditions.length > 0 ? countBaseQuery.where(and(...conditions)) : countBaseQuery;
    const countQuery = await countConditionQuery;
    const total = countQuery[0]?.count || 0;

    return { list, total };
  },

  // Retrieves the group information
  async group(orm: IOrm, schemas: ISchemas) {
    return await orm
      .select({
        label: schemas.channel.group,
        value: schemas.channel.group,
      })
      .from(schemas.channel)
      .where(and(isNotNull(schemas.channel.group), ne(schemas.channel.group, '')))
      .groupBy(schemas.channel.group);
  },
};
