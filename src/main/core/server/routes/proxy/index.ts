import proxy from './lib';
import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/proxy`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      // const { do: action, url } = req.query;
      // const parms = {
      //   do: action,
      //   url
      // }
      // const res = await proxy(parms);
      // reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
}

export default api;