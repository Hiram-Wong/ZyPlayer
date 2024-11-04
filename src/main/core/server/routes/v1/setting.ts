import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import transform from 'lodash/transform';
import entries from 'lodash/entries';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { setting } from '@main/core/db/service';

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
    const dbRes = await setting.all();

    const diffObject = transform(
      entries(dbRes),
      (result, [key, value]) => {
        if (!isEqual(value, get(destination, key))) {
          result[key] = { from: value, to: get(destination, key, 'undefined') };
        }
      },
      {},
    );

    for (const i in diffObject) {
      await setting.update([i], diffObject[i]['to']);
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
