import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { hash, base64 } from '@main/utils/crypto';
const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/proxy`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      const { url } = req.query;
      try {
        const cacheKey = `/proxy/${hash['md5-16'](url)}`;
        // @ts-ignore
        const resCacheData = await req.server.db.getData(cacheKey).catch(() => null);

        if (!resCacheData) {
          throw new Error('缓存读取失败');
        }

        const [status, contentType, message, ...rest] = resCacheData;
        const headers = rest.length > 0 ? rest[0] : null;
        const to_bytes = rest.length > 1 ? rest[1] : null;

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
            content = base64.decode(content);
          } catch (e) {
            throw new Error('解密失败');
          }
        }
        reply.code(Number.isInteger(status) ? status : parseInt(status)).send(content);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.post(`/proxy`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { text, url } = req.body;
    // @ts-ignore
    const res = await req.server.db.push(`/proxy/${hash['md5-16'](url)}`, text);
    return {
      code: 0,
      msg: 'ok',
      data: `http://127.0.0.1:9978/proxy?do=js&url=${url}`,
    };
  });
};

export default api;
