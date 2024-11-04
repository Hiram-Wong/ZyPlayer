import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { channel, iptv, setting } from '@main/core/db/service';
import { parseChannel } from './utils';

const API_PREFIX = 'api/v1/iptv';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const dbRes = await iptv.add(req.body);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.delete(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      await iptv.clear();
    } else {
      await iptv.remove(ids);
    }
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: object } }>) => {
    const { ids, doc } = req.body;
    const dbRes = await iptv.update(ids, doc);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { page, pageSize, kw } = req.query;
    const dbResPage = await iptv.page(parseInt(page), parseInt(pageSize), kw);
    const dbResDefault = await setting.get('defaultIptv');
    const res = {
      data: dbResPage.list,
      total: dbResPage.total,
      default: dbResDefault,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/active`, async () => {
    const dbResAll = await iptv.active();
    const dbResDefaultId = await setting.get('defaultIptv');
    const dbResDefault = await iptv.get(dbResDefaultId);
    const dbResEpg = await setting.get('defaultIptvEpg');
    const dbResLogo = await setting.get('defaultIptvLogo');
    const dbResMarkIp = await setting.get('iptvMarkIp');
    const dbResDelay = await setting.get('iptvDelay');
    const dbResThumbnail = await setting.get('iptvThumbnail');
    const res = {
      data: dbResAll,
      default: dbResDefault,
      ext: {
        epg: dbResEpg,
        logo: dbResLogo,
        markIp: dbResMarkIp,
        delay: dbResDelay,
        thumbnail: dbResThumbnail,
      },
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.put(`/${API_PREFIX}/default/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    const dbResDetail = await iptv.get(id);
    const parseRes = await parseChannel(dbResDetail['type'] as 'remote' | 'url' | 'local', dbResDetail['url']!);
    await channel.clear();
    await channel.add(parseRes);
    await setting.update(['defaultIptv'], id);

    return {
      code: 0,
      msg: 'ok',
      data: true,
    };
  });
  fastify.get(`/${API_PREFIX}/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    const dbRes = await iptv.get(id);

    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
};

export default api;
