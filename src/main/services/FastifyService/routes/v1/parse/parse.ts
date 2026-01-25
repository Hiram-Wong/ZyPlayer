import { dbService } from '@main/services/DbService';
import { mediaDirectSchema } from '@server/schemas/v1/parse/parse';
import type { IAnalyzeType } from '@shared/config/parse';
import { isHttp, isNumber, isStrEmpty, isString } from '@shared/modules/validate';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { convertToStandard } from './utils/mediaDirect';

const API_PREFIX = 'parse';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}/media-direct`,
    { schema: mediaDirectSchema },
    async (req: FastifyRequest<{ Querystring: { id: string; url: string } }>) => {
      const { id, url: rawUrl } = req.query;
      const dbResDetail = await dbService.analyze.get(id);
      const { api, type, script, headers } = dbResDetail || {};
      if (!isHttp(api) || !isNumber(type)) return { code: -1, msg: 'Invalid parameters', data: false };
      if (!isString(rawUrl) || isStrEmpty(rawUrl)) return { code: -1, msg: 'Invalid URL', data: false };

      try {
        const url = `${api}${rawUrl}`;
        const res = await convertToStandard(
          url,
          type as IAnalyzeType,
          headers as Record<string, any>,
          script as string,
        );
        return { code: 0, msg: 'ok', data: res };
      } catch {
        return { code: 0, msg: 'ok', data: { url: '', headers: {} } };
      }
    },
  );
};

export default api;
