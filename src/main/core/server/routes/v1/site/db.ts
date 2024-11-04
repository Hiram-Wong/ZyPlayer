import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { site, setting } from '@main/core/db/service';

const API_PREFIX = 'api/v1/site';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const dbRes = await site.add(req.body);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.delete(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      await site.clear();
    } else {
      await site.remove(ids);
    }
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: object } }>) => {
    const { ids, doc } = req.body;
    const dbRes = await site.update(ids, doc);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { page, pageSize, kw } = req.query;
    const dbResPage = await site.page(parseInt(page), parseInt(pageSize), kw);
    const dbResDefault = await setting.get('defaultSite');
    const dbResGroup = await site.group();
    const res = {
      data: dbResPage.list,
      total: dbResPage.total,
      default: dbResDefault,
      group: dbResGroup,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/active`, async () => {
    const dbResData = await site.active();
    const dbResDefaultId = await setting.get('defaultSite');
    const dbResDefault = await site.get(dbResDefaultId);
    const dbResSearch = await setting.get('defaultSearchType');
    const dbResFilter = await setting.get('defaultFilterType');
    const dbResGroup = await site.group();
    const res = {
      data: dbResData,
      search: dbResSearch,
      group: dbResGroup,
      filter: dbResFilter,
      default: dbResDefault,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.put(`/${API_PREFIX}/default/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    await setting.update(['defaultSite'], id);

    return {
      code: 0,
      msg: 'ok',
      data: true,
    };
  });
  fastify.get(`/${API_PREFIX}/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    const dbRes = await site.get(id);

    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
};

export default api;
