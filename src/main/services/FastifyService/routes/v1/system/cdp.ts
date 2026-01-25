import type { ISnifferOptions } from '@main/services/CdpElectron';
import { cdpSnifferMediaSchema } from '@server/schemas/v1/system/cdp';
import { isHttp } from '@shared/modules/validate';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { snifferMediaToStandard } from './utils/sniffer';

const API_PREFIX = 'system/cdp';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_PREFIX}/sniffer/media`,
    { schema: cdpSnifferMediaSchema },
    async (req: FastifyRequest<{ Body: { url: string; options?: ISnifferOptions } }>) => {
      const { url, options } = req.body;
      if (!isHttp(url)) return { code: -1, msg: 'Invalid URL', data: { url: '', headers: {} } };

      const resp = await snifferMediaToStandard(url, options);

      return { code: 0, msg: 'ok', data: resp };
    },
  );
};

export default api;
