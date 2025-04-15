import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { star, site, analyze, iptv, drive } from '@main/core/db/service';

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
    const { ids, type } = req.body;
    if (type) {
      await star.removeByType(type);
    } else {
      if (!ids || ids.length === 0) {
        await star.clear();
      } else {
        await star.remove(ids);
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
    const dbRes = await star.update({ id: ids }, doc);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: any } }>) => {
    let { page, pageSize, 'type[]': type, kw } = req.query;
    if (!Array.isArray(type)) type = [type];
    const dbResStar = await star.page(parseInt(page), parseInt(pageSize), type, kw);
    // 使用 map 来处理异步操作，并且使用 Promise.all 来等待所有的异步操作完成
    const processedList = await Promise.all(
      dbResStar.list.map(async (item) => {
        if (item.type === 'film') {
          const dbResSite = await site.findByKey(item.relateId);
          return { ...item, relateSite: dbResSite || {} };
        } else if (item.type === 'iptv') {
          const dbResSite = await iptv.findByKey(item.relateId);
          return { ...item, relateSite: dbResSite || {} };
        } else if (item.type === 'analyze') {
          const dbResSite = await analyze.findByKey(item.relateId);
          return { ...item, relateSite: dbResSite || {} };
        } else if (item.type === 'drive') {
          const dbResSite = await drive.findByKey(item.relateId);
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
