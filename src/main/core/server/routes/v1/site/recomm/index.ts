import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { fetchDoubanRecomm } from './utils/douban';

const API_PREFIX = 'api/v1/recommend';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/douban`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { name, year, id, type } = req.query;
    const res = await fetchDoubanRecomm(name, year, id, type);

    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
};

export default api;
