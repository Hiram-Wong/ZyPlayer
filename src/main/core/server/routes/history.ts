import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

import { history } from '../../db/service';

const API_VERSION = "api/v1";

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_VERSION}/history`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await history.add(req.body);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.delete(`/${API_VERSION}/history/:id`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await history.remove(req.params.id);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.get(`/${API_VERSION}/history/:id`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await history.find(req.params.id);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.put(`/${API_VERSION}/history/:id`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await history.update(req.params.id, req.body);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.post(`/${API_VERSION}/history/detail`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await history.find(req.body);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.get(`/${API_VERSION}/history/list`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { action } = req.query;
      let res;
      if (action) {
        res = await history.filter({ type: action });
      } else {
        res = await history.all();
      }
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.get(`/${API_VERSION}/history/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { page, limit, action } = req.query;
      const res = await history.pagination(page, limit, action);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.delete(`/${API_VERSION}/history/clear`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await history.clear_part(req.query.action);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.get(`/${API_VERSION}/history/find`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { id, video_id } = req.query;
      const res = await history.filter({relateId: id, video_id});
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
}

export default api;