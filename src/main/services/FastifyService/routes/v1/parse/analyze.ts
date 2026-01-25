import { dbService } from '@main/services/DbService';
import {
  addSchema,
  deleteSchema,
  getActiveSchema,
  getCheckSchema,
  getDetailByKeySchema,
  getDetailSchema,
  pageSchema,
  putSchema,
  setDefaultSchema,
} from '@server/schemas/v1/parse/analyze';
import type { IAnalyzeType } from '@shared/config/parse';
import { isHttp, isNumber } from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { convertToStandard } from './utils/mediaDirect';

const API_PREFIX = 'parse/analyze';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, { schema: addSchema }, async (req: FastifyRequest<{ Body: IModels['analyze'] }>) => {
    const dbRes = await dbService.analyze.add(req.body);
    return { code: 0, msg: 'ok', data: dbRes };
  });

  fastify.delete(
    `/${API_PREFIX}`,
    { schema: deleteSchema },
    async (req: FastifyRequest<{ Body: { id?: string[] } | null }>) => {
      const { id } = req.body || {};
      if (id && id.length !== 0) {
        await dbService.analyze.remove(id);
      } else {
        await dbService.analyze.clear();
      }
      return { code: 0, msg: 'ok', data: null };
    },
  );

  fastify.put(
    `/${API_PREFIX}`,
    { schema: putSchema },
    async (req: FastifyRequest<{ Body: { id: string[]; doc: IModels['analyze'] } }>) => {
      const { id, doc } = req.body;
      const dbRes = await dbService.analyze.update(id, doc);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/page`,
    { schema: pageSchema },
    async (req: FastifyRequest<{ Querystring: { page: number; pageSize: number; kw?: string } }>) => {
      const { page = 1, pageSize = 10, kw } = req.query;

      const [dbResPage, dbResDefaultId] = await Promise.all([
        dbService.analyze.page(page, pageSize, kw),
        dbService.setting.getValue('defaultAnalyze'),
      ]);

      return {
        code: 0,
        msg: 'ok',
        data: {
          list: dbResPage.list,
          total: dbResPage.total,
          default: dbResDefaultId,
        },
      };
    },
  );

  fastify.get(`/${API_PREFIX}/active`, { schema: getActiveSchema }, async () => {
    const [dbResAll, dbResDefaultId] = await Promise.all([
      dbService.analyze.active(),
      dbService.setting.getValue('defaultAnalyze'),
    ]);

    const dbResDefault = await dbService.analyze.get(dbResDefaultId);

    return {
      code: 0,
      msg: 'ok',
      data: { list: dbResAll, default: dbResDefault, extra: {} },
    };
  });

  fastify.get(
    `/${API_PREFIX}/:id`,
    { schema: getDetailSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const dbRes = await dbService.analyze.get(id);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/key/:key`,
    { schema: getDetailByKeySchema },
    async (req: FastifyRequest<{ Params: { key: string } }>) => {
      const { key } = req.params;
      const dbRes = await dbService.analyze.getByField({ key });
      const res = dbRes?.[0];
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.put(
    `/${API_PREFIX}/default/:id`,
    { schema: setDefaultSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      await dbService.setting.update({ key: 'defaultAnalyze', value: id });
      return { code: 0, msg: 'ok', data: true };
    },
  );

  fastify.get(
    `/${API_PREFIX}/check/:id`,
    { schema: getCheckSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const dbResDetail = await dbService.analyze.get(id);
      const { api, type, script, headers } = dbResDetail || {};
      if (!isHttp(api) || !isNumber(type)) return { code: -1, msg: 'Invalid parameters', data: false };

      const RANDOM_URL = [
        'https://v.qq.com/x/cover/mzc00200f19q8q5/t41011onk2h.html', // 许我耀眼
        'https://www.iqiyi.com/v_aky0eua8jg.html', // 命悬一生
        'https://www.mgtv.com/b/779771/23643138.html', // 花儿与少年
        'https://v.youku.com/v_show/id_XNjUwNjI3NDg0OA==.html', // 暗河传
      ];

      const url = `${api}${RANDOM_URL[Math.floor(Math.random() * RANDOM_URL.length)]}`;
      const resp = await convertToStandard(url, type as IAnalyzeType, headers as Record<string, any>, script as string);
      const status = isHttp(resp.url);

      return { code: 0, msg: 'ok', data: status };
    },
  );
};

export default api;
