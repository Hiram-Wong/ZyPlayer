import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

import { analyze, setting } from '../../db/service';

const API_VERSION = 'api/v1';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_VERSION}/analyze`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await analyze.add(req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.delete(
    `/${API_VERSION}/analyze/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const idStr = req.params.id;
        const idList = idStr.split(',');
        // 使用 Promise.all() 并行执行所有删除操作
        await Promise.all(
          idList.map(async (item) => {
            await analyze.remove(item);
          }),
        );
        reply.code(200);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.put(
    `/${API_VERSION}/analyze/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await analyze.update(req.params.id, req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.put(
    `/${API_VERSION}/analyze/status/:status/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const { status, id } = req.params;
        const validStatuses = ['enable', 'disable'];

        if (!validStatuses.includes(status)) {
          throw new Error('Invalid status value. Must be "enable" or "disable".');
        }

        const idList = id.split(',');

        await Promise.all(
          idList.map(async itemId => {
            const currentData = await analyze.get(itemId);
            const updatedData = { ...currentData, isActive: status === 'enable' };
            await analyze.update(itemId, updatedData);
          }),
        );
        reply.code(200);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/analyze/list`, async (_, reply: FastifyReply) => {
    try {
      const data = await analyze.all();
      const tacitly = await setting.find({ key: 'defaultAnalyze' }).value;
      const res = {
        data,
        default: tacitly,
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(
    `/${API_VERSION}/analyze/page`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const { kw } = req.query;
        const page = await analyze.pagination(kw);
        const tacitly = await setting.find({ key: 'defaultAnalyze' }).value;
        const flag = await setting.find({ key: 'analyzeFlag' }).value;
        const res = {
          data: page.data,
          total: page.total,
          default: tacitly,
          flag: flag,
        };
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/analyze/active`, async (_, reply: FastifyReply) => {
    try {
      const data = await analyze.filter({ isActive: true });
      const tacitly_id = await setting.find({ key: 'defaultAnalyze' }).value;
      const tacitly = await analyze.find({ id: tacitly_id });
      const res = {
        data,
        default: tacitly,
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(`/${API_VERSION}/analyze/default`, async (_, reply: FastifyReply) => {
    try {
      const tacitly_id = await setting.find({ key: 'defaultAnalyze' }).value;
      const tacitly = await analyze.find({ id: tacitly_id });
      const flag = await setting.find({ key: 'analyzeFlag' }).value;
      const res = {
        default: tacitly,
        flag: flag,
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(`/${API_VERSION}/analyze/play`, async (_, reply: FastifyReply) => {
    try {
      const tacitly_id = await setting.find({ key: 'defaultAnalyze' }).value;
      const tacitly = await analyze.find({ id: tacitly_id });
      const flag = await setting.find({ key: 'analyzeFlag' }).value;
      const active = await analyze.filter({ isActive: true });
      const res = {
        default: tacitly,
        flag: flag,
        active: active,
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(
    `/${API_VERSION}/analyze/search`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await analyze.search(req.query.kw);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(
    `/${API_VERSION}/analyze/title`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const url = req.query.url;
        const response = await fetch(url);
        const body = await response.text();
        const $ = cheerio.load(body);
        const res = $('title').text();
        reply.code(200).send({ title: res });
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
};

export default api;
