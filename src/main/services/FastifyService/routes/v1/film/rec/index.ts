import { dbService } from '@main/services/DbService';
import { getBarrageSchema, getHotSchema, getMatchSchema, sendBarrageSchema } from '@server/schemas/v1/flim/rec';
import { isObject, isObjectEmpty, isStrEmpty, isString } from '@shared/modules/validate';
import type { IBarrageSendOptions } from '@shared/types/barrage';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { fetchBarrage, sendBarrage } from './utils/barrage';
import { fetchDoubanRecomm } from './utils/douban';
import fetchHot from './utils/hot';

const API_PREFIX = 'film/rec';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}/barrage`,
    { schema: getBarrageSchema },
    async (req: FastifyRequest<{ Querystring: { id?: string } }>) => {
      const { id } = req.query || {};
      if (!isString(id) || isStrEmpty(id)) return { code: -1, msg: 'Invalid parameters', data: [] };

      const dbResBarrage = await dbService.setting.getValue('barrage');
      const res = await fetchBarrage(id, dbResBarrage);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.post(
    `/${API_PREFIX}/barrage`,
    { schema: sendBarrageSchema },
    async (req: FastifyRequest<{ Body: IBarrageSendOptions }>) => {
      const options = req.body;
      if (!isObject(options) || isObjectEmpty(options)) return { code: -1, msg: 'Invalid parameters', data: false };

      const dbResBarrage = await dbService.setting.getValue('barrage');
      const res = await sendBarrage(dbResBarrage?.url, options);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/hot`,
    { schema: getHotSchema },
    async (
      req: FastifyRequest<{
        Querystring: {
          source?: 'komect' | 'douban' | 'quark' | 'baidu' | 'kylive' | 'enlightent';
          date?: string;
          type?: number;
          page?: number;
          pageSize?: number;
        };
      }>,
    ) => {
      const { page = 1, pageSize = 10, source, date, type = 1 } = req.query || {};

      const dataSource = source || (await dbService.setting.getValue('hot')) || 'komect';
      if (!['komect', 'douban', 'quark', 'baidu', 'kylive', 'enlightent'].includes(dataSource)) {
        return { code: 0, msg: 'ok', data: [] };
      }

      const res = await fetchHot[dataSource]({ date, type, page, pageSize });
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/match`,
    { schema: getMatchSchema },
    async (req: FastifyRequest<{ Querystring: { name?: string; year?: number; id?: string; type?: string } }>) => {
      const { name, year, id, type } = req.query || {};
      const res = await fetchDoubanRecomm({ name, year, id, type });
      return { code: 0, msg: 'ok', data: res };
    },
  );
};

export default api;
