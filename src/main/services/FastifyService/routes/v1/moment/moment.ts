import { dbService } from '@main/services/DbService';
import { getRelatedSchema } from '@server/schemas/v1/moment/moment';
import type { FastifyPluginAsync } from 'fastify';

const API_PREFIX = 'moment';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/related`, { schema: getRelatedSchema }, async () => {
    const [dbResAnalyze, dbResIptv, dbResSite] = await Promise.all([
      dbService.analyze.active(),
      dbService.iptv.active(),
      dbService.site.active(),
    ]);

    const res = {
      parse: dbResAnalyze,
      live: dbResIptv,
      film: dbResSite,
    };
    return { code: 0, msg: 'ok', data: res };
  });
};

export default api;
