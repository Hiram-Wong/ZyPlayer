import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { analyze, setting } from '@main/core/db/service';

const API_PREFIX = 'api/v1/analyze';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const dbRes = await analyze.add(req.body);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.delete(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      await analyze.clear();
    } else {
      await analyze.remove(ids);
    }
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: object } }>) => {
    const { ids, doc } = req.body;
    const dbRes = await analyze.update(ids, doc);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { page, pageSize, kw } = req.query;
    const dbResPage = await analyze.page(parseInt(page), parseInt(pageSize), kw);
    const dbResDefault = await setting.get('defaultAnalyze');
    const dbResFlag = await setting.get('analyzeFlag');
    const res = {
      data: dbResPage.list,
      total: dbResPage.total,
      default: dbResDefault,
      flag: dbResFlag,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/active`, async () => {
    const dbResAll = await analyze.active();
    const dbResDefaultId = await setting.get('defaultAnalyze');
    const dbResDefault = await analyze.get(dbResDefaultId);
    const dbResFlag = await setting.get('analyzeFlag');

    const res = {
      data: dbResAll,
      default: dbResDefault,
      flag: dbResFlag,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.put(`/${API_PREFIX}/default/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    await setting.update(['defaultAnalyze'], id);

    return {
      code: 0,
      msg: 'ok',
      data: true,
    };
  });
  fastify.get(`/${API_PREFIX}/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    const dbRes = await analyze.get(id);

    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
};

export default api;
