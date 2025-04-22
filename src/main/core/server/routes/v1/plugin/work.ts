import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { APP_PLUGIN_PATH } from '@main/utils/hiker/path';
import adapter from './utils/adapter_install';

const API_PREFIX = 'api/v1/plugin';
const PLUGIN_PATH = APP_PLUGIN_PATH;

const pluginAdapter = new adapter({ baseDir: PLUGIN_PATH });

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/list`, async () => {
    const res = await pluginAdapter.list();
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/info`, async (req: FastifyRequest<{ Body: any[] }>) => {
    const plugins = req.body;
    const res = await pluginAdapter.info(plugins);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/install`, async (req: FastifyRequest<{ Body: any[] }>) => {
    const plugins = req.body;
    const res = await pluginAdapter.install(plugins);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/uninstall`, async (req: FastifyRequest<{ Body: any[] }>) => {
    const plugins = req.body;
    const res = await pluginAdapter.uninstall(plugins);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/update`, async (req: FastifyRequest<{ Body: any[] }>) => {
    const plugins = req.body;
    const res = await pluginAdapter.update(plugins);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/start`, async (req: FastifyRequest<{ Body: any[] }>) => {
    const plugins = req.body;
    const res = await pluginAdapter.start(plugins);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/stop`, async (req: FastifyRequest<{ Body: any[] }>) => {
    const plugins = req.body;
    const res = await pluginAdapter.stop(plugins);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
};

export default api;
