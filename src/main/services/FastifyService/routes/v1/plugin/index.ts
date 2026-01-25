import { dbService } from '@main/services/DbService';
import { pluginService } from '@main/services/PluginService';
import {
  getDetailSchema,
  installSchema,
  pageSchema,
  startSchema,
  stopSchema,
  uninstallSchema,
} from '@server/schemas/v1/plugin';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'plugin';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}/page`,
    { schema: pageSchema },
    async (req: FastifyRequest<{ Querystring: { page: number; pageSize: number; kw?: string } }>) => {
      const { page = 1, pageSize = 10, kw } = req.query;
      const res = await dbService.plugin.page(page, pageSize, kw);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/:id`,
    { schema: getDetailSchema },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const { id } = req.params;
      const res = await dbService.plugin.get(id);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.post(
    `/${API_PREFIX}/install`,
    { schema: installSchema },
    async (req: FastifyRequest<{ Body: { id: string[] } }>) => {
      const { id } = req.body;
      const res = await pluginService.install(id);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.delete(
    `/${API_PREFIX}/uninstall`,
    { schema: uninstallSchema },
    async (req: FastifyRequest<{ Body: { id: string[] } }>) => {
      const { id } = req.body;
      const res = await pluginService.uninstall(id);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.put(
    `/${API_PREFIX}/start`,
    { schema: startSchema },
    async (req: FastifyRequest<{ Body: { id: string[] } }>) => {
      const { id } = req.body;
      const res = await pluginService.start(id);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.put(
    `/${API_PREFIX}/stop`,
    { schema: stopSchema },
    async (req: FastifyRequest<{ Body: { id: string[] } }>) => {
      const { id } = req.body;
      const res = await pluginService.stop(id);
      return { code: 0, msg: 'ok', data: res };
    },
  );
};

export default api;
