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
} from '@server/schemas/v1/live/iptv';
import type { IIptvType } from '@shared/config/live';
import { isArrayEmpty, isNumber, isStrEmpty } from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { convertToStandard } from './utils/channel';

const API_PREFIX = 'live/iptv';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, { schema: addSchema }, async (req: FastifyRequest<{ Body: IModels['iptv'] }>) => {
    const dbRes = await dbService.iptv.add(req.body);
    return { code: 0, msg: 'ok', data: dbRes };
  });

  fastify.delete(
    `/${API_PREFIX}`,
    { schema: deleteSchema },
    async (req: FastifyRequest<{ Body: { id?: string[] } | null }>) => {
      const { id } = req.body || {};
      if (id && id.length !== 0) {
        await dbService.iptv.remove(id);
      } else {
        await dbService.iptv.clear();
      }
      return { code: 0, msg: 'ok', data: null };
    },
  );

  fastify.put(
    `/${API_PREFIX}`,
    { schema: putSchema },
    async (req: FastifyRequest<{ Body: { id: string[]; doc: IModels['iptv'] } }>) => {
      const { id, doc } = req.body;
      const dbRes = await dbService.iptv.update(id, doc);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/page`,
    { schema: pageSchema },
    async (req: FastifyRequest<{ Querystring: { page: number; pageSize: number; kw?: string } }>) => {
      const { page = 1, pageSize = 10, kw } = req.query;

      const [dbResPage, dbResDefaultId] = await Promise.all([
        dbService.iptv.page(page, pageSize, kw),
        dbService.setting.getValue('defaultIptv'),
      ]);

      return {
        code: 0,
        msg: 'ok',
        data: { list: dbResPage.list, total: dbResPage.total, default: dbResDefaultId },
      };
    },
  );

  fastify.get(`/${API_PREFIX}/active`, { schema: getActiveSchema }, async () => {
    const [dbResAll, dbResDefaultId, dbResIptv, dbResGroup] = await Promise.all([
      dbService.iptv.active(),
      dbService.setting.getValue('defaultIptv'),
      dbService.setting.getValue('live'),
      dbService.channel.group(),
    ]);

    const dbResDefault = await dbService.iptv.get(dbResDefaultId);

    return {
      code: 0,
      msg: 'ok',
      data: {
        list: dbResAll,
        default: dbResDefault,
        class: dbResGroup,
        extra: {
          epg: dbResIptv?.epg ?? '',
          logo: dbResIptv?.logo ?? '',
          ipMark: dbResIptv?.ipMark ?? '',
          delay: dbResIptv?.delay ?? '',
          thumbnail: dbResIptv?.thumbnail ?? '',
        },
      },
    };
  });

  fastify.get(
    `/${API_PREFIX}/:id`,
    { schema: getDetailSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const dbRes = await dbService.iptv.get(id);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/key/:key`,
    { schema: getDetailByKeySchema },
    async (req: FastifyRequest<{ Params: { key: string } }>) => {
      const { key } = req.params;
      const dbRes = await dbService.iptv.getByField({ key });
      const res = dbRes?.[0];
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.put(
    `/${API_PREFIX}/default/:id`,
    { schema: setDefaultSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const dbResDetail = await dbService.iptv.get(id);
      const { api, type } = dbResDetail || {};
      if (isStrEmpty(api) || !isNumber(type)) return { code: -1, msg: 'Invalid parameters', data: false };

      const parseRes = await convertToStandard(api, type as IIptvType);

      if (!isArrayEmpty(parseRes)) {
        await dbService.channel.set(parseRes as IModels['channel'][]); // clear && insert
        await dbService.setting.update({ key: 'defaultIptv', value: id });
      }

      return { code: 0, msg: 'ok', data: true };
    },
  );

  fastify.get(
    `/${API_PREFIX}/check/:id`,
    { schema: getCheckSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const dbResDetail = await dbService.iptv.get(id);
      const { api, type } = dbResDetail || {};
      if (isStrEmpty(api) || !isNumber(type)) return { code: -1, msg: 'Invalid parameters', data: false };

      const parseRes = await convertToStandard(api, type as IIptvType);

      if (!isArrayEmpty(parseRes)) {
        return { code: 0, msg: 'ok', data: true };
      }

      return { code: 0, msg: 'ok', data: false };
    },
  );
};

export default api;
