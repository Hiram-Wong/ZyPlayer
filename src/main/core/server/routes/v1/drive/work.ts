import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import AListAdapter from './utils/alist';
import { drive } from '@main/core/db/service';
import { singleton } from '@main/utils/tool';
import LruCache from '@main/utils/lrucache';

const API_PREFIX = 'api/v1/alist';

const lruCache = new LruCache(10);

const init = async (id: string) => {
  if (lruCache.has(id)) {
    return lruCache.get(id);
  } else {
    try {
      const dbResSource = await drive.get(id);
      const singleAdapter = singleton(AListAdapter);
      const adapter = new singleAdapter(dbResSource);
      lruCache.put(id, adapter);
      return adapter;
    } catch (err: any) {
      console.error(`Error init drive adapter:${err.message}`);
      throw err;
    }
  }
};

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/init`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId } = req.query;
    const adapter = await init(sourceId);
    return {
      code: 0,
      msg: 'ok',
      data: adapter,
    };
  });
  fastify.get(`/${API_PREFIX}/dir`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId, path, pg = '1' } = req.query;
    const adapter = await init(sourceId);
    const res = await adapter!.dir({ path, pg: parseInt(pg) });
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/file`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId, path } = req.query;
    const adapter = await init(sourceId);
    const res = await adapter!.file(path);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
};

export default api;
