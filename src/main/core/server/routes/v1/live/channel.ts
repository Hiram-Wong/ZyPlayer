import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { channel, setting, iptv } from '@main/core/db/service';
import request from '@main/utils/request';

const API_PREFIX = 'api/v1/channel';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const dbRes = await channel.add(req.body);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.delete(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      await channel.clear();
    } else {
      await channel.remove(ids);
    }
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: object } }>) => {
    const { ids, doc } = req.body;
    const dbRes = await channel.update(ids, doc);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { page, pageSize, kw, group } = req.query;
    let dbResPage = await channel.page(parseInt(page), parseInt(pageSize), kw, group);
    const dbResSeeingLogo = await setting.get('defaultIptvLogo');
    const dbResIptvId = await setting.get('defaultIptv');
    const dbResSourceLogo = (await iptv.get(dbResIptvId)).logo;
    const defaultLogo = dbResSourceLogo || dbResSeeingLogo || '';
    dbResPage.list = dbResPage.list.map((item) => {
      let url = item['logo'];
      if (!url) url = defaultLogo.replace('{name}', item.name);
      return Object.assign(item, { logo: url });
    });
    const dbResClass = await channel.group();
    const res = {
      data: dbResPage['list'],
      total: dbResPage['total'],
      class: dbResClass,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/:id`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const { id } = req.params;
    const dbRes = await channel.get(id);

    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/epg`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { name, date } = req.query;
    const dbResIptvId = await setting.get('defaultIptv');
    const dbResSourceEpg = (await iptv.get(dbResIptvId)).epg;
    const dbResSeeingEpg = await setting.get('defaultIptvEpg');

    let defaultEpg = dbResSourceEpg || dbResSeeingEpg || '';
    if (!defaultEpg) {
      return {
        code: -1,
        msg: 'EPG URL not found',
        data: [],
      };
    }
    const epgUrl = defaultEpg.replace('{name}', name).replace('{date}', date);

    let epgRes = [];
    try {
      const res = await request({
        url: epgUrl,
        method: 'GET',
      });
      epgRes = res.epg_data;
    } catch (err: any) {
      console.log(`[live][utils][fetchChannelEpg] error: ${err.message}`);
    }

    return {
      code: 0,
      msg: 'ok',
      data: epgRes,
    };
  });
};

export default api;
