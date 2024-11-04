import { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { star, site } from '@main/core/db/service';

const API_PREFIX = 'api/v1/star';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const dbRes = await star.add(req.body);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.delete(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      await star.clear();
    } else {
      await star.remove(ids);
    }
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: object } }>) => {
    const { ids, doc } = req.body;
    const dbRes = await star.update({ id: ids }, doc);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { page, pageSize, type } = req.query;
    const dbResStar = await star.page(parseInt(page), parseInt(pageSize), type);
    // 使用 map 来处理异步操作，并且使用 Promise.all 来等待所有的异步操作完成
    const processedList = await Promise.all(
      dbResStar.list.map(async (item) => {
        const dbResSite = await site.findByKey(item.relateId);
        return { ...item, relateSite: dbResSite || {} };
      }),
    );

    const res = processedList;
    return {
      code: 0,
      msg: 'ok',
      data: {
        list: res,
        total: dbResStar.total,
      },
    };
  });
  fastify.post(`/${API_PREFIX}/find`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { relateId, videoId } = req.body;
    const dbRes = await star.find(relateId, videoId);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    const dbRes = await star.get(id);

    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
};

export default api;
