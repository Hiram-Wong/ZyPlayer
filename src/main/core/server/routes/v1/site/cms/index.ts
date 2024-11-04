import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { site } from '@main/core/db/service';
import {
  AppYsV2Adapter,
  CatvodAdapter,
  DrpyJs0Adapter,
  T0Adapter,
  T1Adapter,
  T3Adapter,
  T4Adapter,
  XbpqAdapter,
  XyqAdapter,
} from './adapter';
import { singleton } from '@main/utils/tool';
import LruCache from '@main/utils/lrucache';

const API_PREFIX = 'api/v1/cms';

const adapterRelation = {
  0: T0Adapter,
  1: T1Adapter,
  2: DrpyJs0Adapter,
  6: T4Adapter,
  7: T3Adapter,
  8: CatvodAdapter,
  9: XbpqAdapter,
  10: XyqAdapter,
  11: AppYsV2Adapter,
};

const lruCache = new LruCache(10);

const init = async (id: string) => {
  const dbResSource = await site.get(id);
  if (dbResSource.type !== 7 && lruCache.has(id)) {
    return lruCache.get(id);
  } else {
    try {
      if (dbResSource.type === 7) lruCache.delete(id);
      const singleAdapter = singleton(adapterRelation[dbResSource.type!]);
      const adapter = new singleAdapter(dbResSource);
      await adapter.init(); // 确保适配器初始化成功
      lruCache.put(id, adapter);
      return adapter;
    } catch (err: any) {
      console.error(`Error init cms adapter:${err.message}`);
      throw err;
    }
  }
};

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/init`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId } = req.query;
    await init(sourceId);
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.get(`/${API_PREFIX}/home`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId } = req.query;
    const adapter = await init(sourceId);
    const res = await adapter.home();
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/homeVod`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId } = req.query;
    const adapter = await init(sourceId);
    const res = await adapter.homeVod();
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/category`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId, ...doc } = req.query;
    const adapter = await init(sourceId);
    let res = {
      list: [
        {
          vod_name: '无数据,防无限请求',
          vod_id: 'no_data',
          vod_remarks: '不要点,会崩的',
          vod_pic: 'https://ghproxy.net/https://raw.githubusercontent.com/hjdhnx/dr_py/main/404.jpg',
        },
      ],
      total: 1,
      pagecount: 1,
      page: 1,
      limit: 1,
    };
    if (doc.tid === 'homeVod') {
      res = await adapter.homeVod();
    } else {
      res = await adapter.category(doc);
    }
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/detail`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId, ...doc } = req.query;
    const adapter = await init(sourceId);
    const res = await adapter.detail(doc);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/search`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId, ...doc } = req.query;
    const adapter = await init(sourceId);
    const res = await adapter.search(doc);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/play`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { sourceId, ...doc } = req.query;
    const adapter = await init(sourceId);
    const res = await adapter.play(doc);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/runMain`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { sourceId, ...doc } = req.body;
    console.log(doc);
    const adapter = await init(sourceId);
    const res = await adapter.runMain(doc);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
};

export default api;
