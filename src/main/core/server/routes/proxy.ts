import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/proxy`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        // @ts-ignore
        const dbData = await req.server.db.getData('/t3-proxy').catch(() => [500, 'text/plain', '缓存读取失败']);
        // @ts-ignore
        await req.server.db.delete('/t3-proxy');

        const [status, contentType, message] = dbData;
        const headers = dbData.length > 3 ? dbData[3] : null;
        const to_bytes = dbData.length > 4 ? dbData[4] : null;
        reply.header('Content-Type', contentType);
        if (headers) {
          Object.keys(headers).forEach((key) => {
            reply.header(key, headers[key]);
          });
        }
        let content = message;
        if (to_bytes) {
          try {
            if (content.includes('base64,')) {
              content = decodeURIComponent(content.split('base64,')[1]);
            }
            content = Buffer.from(content, 'base64');
          } catch (e) {

          }
        }
        reply.code(Number.isInteger(status) ? status : parseInt(status)).send(content);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.post(
    `/proxy`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        // @ts-ignore
        const { text } = req.body;
        // @ts-ignore
        const res = await req.server.db.push('/t3-proxy', text);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
};

export default api;
