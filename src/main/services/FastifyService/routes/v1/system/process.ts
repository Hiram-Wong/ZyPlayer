import { killPid, matchPort, matchPs } from '@main/utils/process';
import { processKillSchema, processMatchSchema } from '@server/schemas/v1/system/process';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'system/process';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}/kill`,
    { schema: processKillSchema },
    async (req: FastifyRequest<{ Querystring: { pid: number[] } }>) => {
      const { pid = [] } = req.query;
      const resp = await killPid(pid);
      return { code: 0, msg: 'ok', data: resp };
    },
  );

  fastify.get(
    `/${API_PREFIX}/match`,
    { schema: processMatchSchema },
    async (req: FastifyRequest<{ Querystring: { type: string; kw: string | number } }>) => {
      const { type, kw } = req.query;
      const pids = type === 'port' ? await matchPort(Number(kw)) : await matchPs(String(kw));
      return { code: 0, msg: 'ok', data: pids };
    },
  );
};

export default api;
