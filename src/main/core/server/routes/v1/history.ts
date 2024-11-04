import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { history, site } from '@main/core/db/service';

const API_PREFIX = 'api/v1/history';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const dbRes = await history.add(req.body);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.delete(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { ids, type } = req.body;
    if (type) {
      await history.removeByType(type);
    } else {
      if (!ids || ids.length === 0) {
        await history.clear();
      } else {
        await history.remove(ids);
      }
    }
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: object } }>) => {
    const { ids, doc } = req.body;
    const dbRes = await history.update(ids, doc);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { page, pageSize, type, kw } = req.query;
    const dbResHistory = await history.page(parseInt(page), parseInt(pageSize), type, kw);
    // 使用 map 来处理异步操作，并且使用 Promise.all 来等待所有的异步操作完成
    const processedList = await Promise.all(
      dbResHistory.list.map(async (item) => {
        if (item.type === 'film') {
          const dbResSite = await site.findByKey(item.relateId);
          return { ...item, relateSite: dbResSite || {} };
        }
        return item;
      }),
    );

    const res = processedList;
    return {
      code: 0,
      msg: 'ok',
      data: {
        list: res,
        total: dbResHistory.total,
      },
    };
  });
  fastify.post(`/${API_PREFIX}/find`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { relateId, videoId } = req.body;
    const dbRes = await history.find(relateId, videoId);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    const dbRes = await history.get(id);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
};

export default api;
