import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { enlightentHot, kyLiveHot } from './hot';
import { classify, detail, get_hipy_play_url, get_drpy_play_url, check, search, list } from './cms';

import { site, setting } from '../../../db/service';

const API_VERSION = "api/v1";

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_VERSION}/site`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await site.add(req.body);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.delete(`/${API_VERSION}/site/:id`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const idStr = req.params.id;
      const idList = idStr.split(',');
      // 使用 Promise.all() 并行执行所有删除操作
      await Promise.all(idList.map(async (item) => {
        await site.remove(item);
      }));
      reply.code(200);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/site/:id`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await site.get(req.params.id);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.put(`/${API_VERSION}/site/:id`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await site.update(req.params.id, req.body);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/site/list`, async (_, reply: FastifyReply) => {
    try {
      const data = await site.all();
      const tacitly = await setting.find({ key: "defaultSite"}).value;
      const res = {
        data,
        default: tacitly
      }
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/site/search`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { kw } = req.query;
      const res = await site.all(kw);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/site/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { kw } = req.query;
      const page = await site.pagination(kw);
      const tacitly = await setting.find({ key: "defaultSite"}).value;
      const res = {
        data: page.data,
        total: page.total,
        default: tacitly
      }
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/site/active`, async (_, reply: FastifyReply) => {
    try {
      const data = await site.filter({ isActive: true });
      const tacitly_id = await setting.find({ key: "defaultSite" }).value;
      const tacitly = await site.find({ id: tacitly_id }) || {};
      const search = await setting.find({ key: "defaultSearchType" }).value;
      const res = {
        data,
        search,
        default: tacitly
      }
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/site/group`, async (_, reply: FastifyReply) => {
    try {
      const res = await site.group();
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/hot/enlightent`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { date, sort, channelType, day } = req.query;
      const res = await enlightentHot(date, sort, channelType, day);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/hot/ky`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { date, type, plat } = req.query;
      const res = await kyLiveHot(date, type, plat);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/film/class`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { id } = req.query;
      const res = await classify(id);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/film/get_hipy_play_url`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { id, flag, play } = req.query;
      const res = await get_hipy_play_url(id, flag, play);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/film/get_drpy_play_url`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { id, url } = req.query;
      const res = await get_drpy_play_url(id, url);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/film/check`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { id } = req.query;
      const res = await check(id);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/film/search`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { id, kw } = req.query;
      const res = await search(id, kw);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/film/list`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      let { id, pg, t, f } = req.query;
      if (!pg) pg = 1;
      if (!f) f = {};
      const res = await list(id, pg, t, f);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.get(`/${API_VERSION}/film/detail`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { id, video_id } = req.query;
      const res = await detail(id, video_id);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
}

export default api;