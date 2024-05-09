import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

import { star, setting } from '../../db/service';

const API_VERSION = 'api/v1';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_VERSION}/star`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await star.add(req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.delete(
    `/${API_VERSION}/star/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await star.remove(req.params.id);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.put(
    `/${API_VERSION}/star/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await star.update(req.params.id, req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/star/list`, async (_, reply: FastifyReply) => {
    try {
      const data = await star.all();
      const tacitly = await setting.find({ key: 'defaultSite' }).value;
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
    `/${API_VERSION}/star/page`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const { page, limit } = req.query;
        const res = await star.pagination(parseInt(page), parseInt(limit));
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.delete(`/${API_VERSION}/star/clear`, async (_, reply: FastifyReply) => {
    try {
      const res = await star.clear();
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.post(
    `/${API_VERSION}/star/detail`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await star.find(req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
};

export default api;
