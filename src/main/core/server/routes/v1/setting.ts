import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { setting } from '@main/core/db/service';
import initSettingData from '@main/core/db/migration/modules/init/tbl_setting.json';

const API_PREFIX = 'api/v1/setting';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    await setting.add(req.body);
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}/source`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const destination = req.body;
    const initRes = initSettingData;
    const dbRes = await setting.all();

    for (const item of initRes) {
      const dbValue = dbRes[item.key];
      const destValue = destination[item.key];

      if (dbValue !== undefined) {
        if (destValue !== undefined && dbValue !== destValue) {
          await setting.update([item.key], destValue);
        }
      } else {
        if (destValue !== undefined) {
          await setting.add({ key: item.key, value: { data: destValue } });
        } else {
          await setting.add({ key: item.key, value: { data: item.value } });
        }
      }
    }

    for (const key in dbRes) {
      if (initRes.find((item) => item.key === key) === undefined) {
        await setting.remove([key]);
      }
    }

    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: object } }>) => {
    const { key, doc } = req.body;
    await setting.update([key], doc);
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.get(`/${API_PREFIX}/list`, async () => {
    const dbRes = await setting.all();

    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/setup`, async () => {
    const agreementMask = await setting.get('agreementMask');
    const theme = await setting.get('theme');
    const playerMode = await setting.get('playerMode');
    const webdev = await setting.get('webdev');
    const barrage = await setting.get('barrage');
    const timeout = await setting.get('timeout');
    const debug = await setting.get('debug');

    const res = {
      agreementMask,
      theme,
      playerMode,
      webdev,
      barrage,
      timeout,
      debug,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/detail`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { key } = req.query;
    const dbRes = await setting.get(key);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
};

export default api;
