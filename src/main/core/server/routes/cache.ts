import _ from 'lodash';
import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_VERSION = "api/v1";
const CACHE_NAME = "t3";

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete(`/${API_VERSION}/cache/:key`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      // @ts-ignore
      const { key } = req.params;
      // @ts-ignore
      await req.server.db.delete(`/${CACHE_NAME}/${key}`);
      reply.code(200).send({code: 200, msg: 'sucess'});
    } catch (err) {
      reply.code(500).send({code: 500, msg: err});
    }
  });
  fastify.post(`/${API_VERSION}/cache`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      // @ts-ignore
      const { key, value } = req.body;
      // @ts-ignore
      await req.server.db.push(`/${CACHE_NAME}/${key}`, value);
      reply.code(200).send({code: 200, msg: 'sucess'});
    } catch (err) {
      reply.code(500).send({code: 500, msg: err});
    }
  });
  fastify.get(`/${API_VERSION}/cache/:key`, async (req, reply: FastifyReply) => {
    try {
      // @ts-ignore
      const { key } = req.params;
      // @ts-ignore
      const res = await req.server.db.getData(`/${CACHE_NAME}/${key}`);
      reply.code(200).send({code: 200, msg: 'sucess', data: res});
    } catch (err) {
      reply.code(500).send({code: 500, msg: err, data: ''});
    }
  });
}

export default api;