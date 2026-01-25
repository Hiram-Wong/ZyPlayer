import { dbService } from '@main/services/DbService';
import {
  addSchema,
  deleteSchema,
  getActiveSchema,
  getDetailByKeySchema,
  getDetailSchema,
  pageSchema,
  putSchema,
  setDefaultSchema,
} from '@server/schemas/v1/flim/site';
import type { IModels } from '@shared/types/db';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'film/site';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, { schema: addSchema }, async (req: FastifyRequest<{ Body: IModels['site'] }>) => {
    const dbRes = await dbService.site.add(req.body);
    return { code: 0, msg: 'ok', data: dbRes };
  });

  fastify.delete(
    `/${API_PREFIX}`,
    { schema: deleteSchema },
    async (req: FastifyRequest<{ Body: { id?: string[] } | null }>) => {
      const { id } = req.body || {};
      if (id && id.length !== 0) {
        await dbService.site.remove(id);
      } else {
        await dbService.site.clear();
      }
      return { code: 0, msg: 'ok', data: null };
    },
  );

  fastify.put(
    `/${API_PREFIX}`,
    { schema: putSchema },
    async (req: FastifyRequest<{ Body: { id: string[]; doc: IModels['site'] } }>) => {
      const { id, doc } = req.body;
      const dbRes = await dbService.site.update(id, doc);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/page`,
    { schema: pageSchema },
    async (req: FastifyRequest<{ Querystring: { page: number; pageSize: number; kw?: string } }>) => {
      const { page = 1, pageSize = 10, kw } = req.query;

      const [dbResPage, dbResGroup, dbResDefaultId] = await Promise.all([
        dbService.site.page(page, pageSize, kw),
        dbService.site.group(),
        dbService.setting.getValue('defaultSite'),
      ]);

      return {
        code: 0,
        msg: 'ok',
        data: {
          list: dbResPage.list,
          total: dbResPage.total,
          default: dbResDefaultId,
          group: dbResGroup,
        },
      };
    },
  );

  fastify.get(`/${API_PREFIX}/active`, { schema: getActiveSchema }, async () => {
    const [dbResAll, dbResGroup, dbResDefaultId, dbResSite] = await Promise.all([
      dbService.site.active(),
      dbService.site.group(),
      dbService.setting.getValue('defaultSite'),
      dbService.setting.getValue('site'),
    ]);

    const dbResDefault = await dbService.site.get(dbResDefaultId);

    return {
      code: 0,
      msg: 'ok',
      data: {
        list: dbResAll,
        default: dbResDefault,
        extra: {
          group: dbResGroup,
          filter: dbResSite.filterMode,
          search: dbResSite.searchMode,
        },
      },
    };
  });

  fastify.get(
    `/${API_PREFIX}/:id`,
    { schema: getDetailSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const dbRes = await dbService.site.get(id);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/key/:key`,
    { schema: getDetailByKeySchema },
    async (req: FastifyRequest<{ Params: { key: string } }>) => {
      const { key } = req.params;
      const dbRes = await dbService.site.getByField({ key });
      const res = dbRes?.[0];
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.put(
    `/${API_PREFIX}/default/:id`,
    { schema: setDefaultSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      await dbService.setting.update({ key: 'defaultSite', value: id });
      return { code: 0, msg: 'ok', data: true };
    },
  );
};

export default api;
