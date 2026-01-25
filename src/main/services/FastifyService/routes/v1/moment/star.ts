import { dbService } from '@main/services/DbService';
import {
  addSchema,
  deleteSchema,
  findDetailSchema,
  getDetailSchema,
  pageSchema,
  putSchema,
} from '@server/schemas/v1/moment/star';
import type { IModels } from '@shared/types/db';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'moment/star';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, { schema: addSchema }, async (req: FastifyRequest<{ Body: IModels['star'] }>) => {
    const dbRes = await dbService.star.add(req.body);
    return { code: 0, msg: 'ok', data: dbRes };
  });

  fastify.delete(
    `/${API_PREFIX}`,
    { schema: deleteSchema },
    async (req: FastifyRequest<{ Body: { id?: string[]; type?: IModels['star']['type'][] } | null }>) => {
      const { id = [], type = [] } = req.body || {};
      if (type && type.length !== 0) {
        await dbService.star.removeByField({ type });
      } else if (id && id.length !== 0) {
        await dbService.star.remove(id);
      } else {
        await dbService.star.clear();
      }
      return { code: 0, msg: 'ok', data: null };
    },
  );

  fastify.put(
    `/${API_PREFIX}`,
    { schema: putSchema },
    async (req: FastifyRequest<{ Body: { id: string[]; doc: IModels['star'] } }>) => {
      const { id, doc } = req.body;
      const dbRes = await dbService.star.update(id, doc);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/page`,
    { schema: pageSchema },
    async (
      req: FastifyRequest<{
        Querystring: { page: number; pageSize: number; kw?: string; type?: IModels['star']['type'][] };
      }>,
    ) => {
      const { page, pageSize, type, kw } = req.query;

      const dbResPage = await dbService.star.page(page, pageSize, kw, type);

      // 1:site 2: iptv 3:analyze
      const loaderMap: Record<number, string> = {
        1: 'site',
        2: 'iptv',
        3: 'analyze',
      } as const;

      const list = await Promise.all(
        dbResPage.list.map(async (item) => {
          const relateSite = (await dbService?.[loaderMap[item.type]]?.getByField({ key: item.relateId! }))?.[0] ?? {};
          return { ...item, relateSite };
        }),
      );

      return {
        code: 0,
        msg: 'ok',
        data: {
          list,
          total: dbResPage.total,
        },
      };
    },
  );

  fastify.get(
    `/${API_PREFIX}/find`,
    { schema: findDetailSchema },
    async (req: FastifyRequest<{ Querystring: { relateId: string; videoId: string; type?: number } }>) => {
      const { relateId, videoId, type } = req.query;
      const dbRes = await dbService.star.getByField({ relateId, videoId, ...(type ? { type } : {}) });
      const res = dbRes?.[0];
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/:id`,
    { schema: getDetailSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const dbRes = await dbService.star.get(id);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );
};

export default api;
