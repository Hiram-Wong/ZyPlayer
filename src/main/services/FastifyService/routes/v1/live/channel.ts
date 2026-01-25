import { dbService } from '@main/services/DbService';
import {
  addSchema,
  deleteSchema,
  getDetailSchema,
  getEpgSchema,
  pageSchema,
  putSchema,
} from '@server/schemas/v1/live/channel';
import { isStrEmpty } from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { convertToStandard } from './utils/epg';

const API_PREFIX = 'live/channel';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, { schema: addSchema }, async (req: FastifyRequest<{ Body: IModels['channel'] }>) => {
    const dbRes = await dbService.channel.add(req.body);
    return { code: 0, msg: 'ok', data: dbRes };
  });

  fastify.delete(
    `/${API_PREFIX}`,
    { schema: deleteSchema },
    async (req: FastifyRequest<{ Body: { id?: string[] } | null }>) => {
      const { id } = req.body || {};
      if (id && id.length !== 0) {
        await dbService.channel.remove(id);
      } else {
        await dbService.channel.clear();
      }
      return { code: 0, msg: 'ok', data: null };
    },
  );

  fastify.put(
    `/${API_PREFIX}`,
    { schema: putSchema },
    async (req: FastifyRequest<{ Body: { id: string[]; doc: IModels['channel'] } }>) => {
      const { id, doc } = req.body;
      const dbRes = await dbService.channel.update(id, doc);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/page`,
    { schema: pageSchema },
    async (
      req: FastifyRequest<{
        Querystring: { page: number; pageSize: number; kw?: string; group?: string };
      }>,
    ) => {
      const { page = 1, pageSize = 10, kw, group } = req.query;

      const [dbResPage, defaultIptvId, defaultIptv, dbResGroup] = await Promise.all([
        dbService.channel.page(page, pageSize, kw, group),
        dbService.setting.getValue('defaultIptv'),
        dbService.setting.getValue('live'),
        dbService.channel.group(),
      ]);

      const { logo: dbResSourceLogo = '' } = (await dbService.iptv.get(defaultIptvId)) || {};
      const defaultLogo = dbResSourceLogo || defaultIptv?.logo || '';

      const list = dbResPage.list.map((item) => ({
        ...item,
        logo: item?.logo || defaultLogo.replace('{name}', item.name),
      }));

      return {
        code: 0,
        msg: 'ok',
        data: { list, total: dbResPage.total, class: dbResGroup },
      };
    },
  );

  fastify.get(
    `/${API_PREFIX}/:id`,
    { schema: getDetailSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const dbRes = await dbService.channel.get(id);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/epg`,
    { schema: getEpgSchema },
    async (req: FastifyRequest<{ Querystring: { ch: string; date: string } }>) => {
      const { ch, date } = req.query;
      if (isStrEmpty(ch)) {
        return { code: -1, msg: 'Invalid parameters', data: [] };
      }

      const dbResIptvId = await dbService.setting.getValue('defaultIptv');
      const dbResSourceEpg = (await dbService.iptv.get(dbResIptvId))?.epg;
      const dbResSeeingEpg = (await dbService.setting.getValue('live'))?.epg;

      const api = dbResSourceEpg || dbResSeeingEpg || '';
      if (isStrEmpty(api)) {
        return { code: -1, msg: 'EPG URL not found', data: [] };
      }

      try {
        const res = await convertToStandard(api, ch, date);
        return { code: 0, msg: 'ok', data: res };
      } catch {
        return { code: 0, msg: 'ok', data: [] };
      }
    },
  );
};

export default api;
