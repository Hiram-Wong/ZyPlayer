import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/proxy`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      // @ts-ignore
      const dbData = await req.server.db.getData("/t3-proxy").catch(() => [500, 'text/plain', '缓存读取失败']);
      // @ts-ignore
      await req.server.db.delete('/t3-proxy');

      const [status, contentType, message] = dbData;
      reply.header('Content-Type', contentType);

      reply.code(Number.isInteger(status) ? status : parseInt(status)).send(message);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.post(`/proxy`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const body = req.body;
      // @ts-ignore
      const res = await req.server.db.push('/t3-proxy', body);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
}

export default api;