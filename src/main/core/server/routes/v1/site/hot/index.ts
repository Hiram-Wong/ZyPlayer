import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { setting } from '@main/core/db/service';
import hotAdapter from './adapter';

const API_PREFIX = 'api/v1/hot';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/active`, async () => {
    const dbResHot = await setting.get('defaultHot');
    const res = {
      default: dbResHot,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const parms = req.query;
    const dbResHot = await setting.get('defaultHot');
    const res = await hotAdapter?.[dbResHot](parms);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
};

export default api;
