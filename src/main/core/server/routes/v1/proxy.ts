import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { hash, base64 } from '@main/utils/crypto';
import request from '@main/utils/request';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/proxy`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      const { url } = req.query;

      try {
        const cacheKey = `/proxy/${hash['md5-16'](url)}`;
        // @ts-ignore
        const resCacheData = await req.server.db.getData(cacheKey).catch(() => null);
        if (resCacheData) {
          const [status, contentType, message, ...rest] = resCacheData;
          const headers = rest.length > 0 ? rest[0] : null;
          const to_bytes = rest.length > 1 ? rest[1] : null;
          let content = message;
          if (headers) {
            Object.keys(headers).forEach((key) => {
              reply.header(key, headers[key]);
            });
          }
          if (to_bytes) {
            if (content.includes('base64,')) {
              content = decodeURIComponent(content.split('base64,')[1]);
            }
            content = base64.decode(content);
          }
          reply
            .code(Number.isInteger(status) ? status : parseInt(status))
            .header('Content-Type', contentType)
            .send(content);
        }

        if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].some((ext) => url.toLowerCase().includes(ext))) {
          const resReqContent = await request({
            url: url,
            method: 'GET',
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.82',
            },
          });
          const parts = resReqContent.split(';base64,');
          const imageType = parts[0].split(':')[1];
          const imageBuffer = Buffer.from(parts[1], 'base64');

          reply.type(imageType).send(imageBuffer);
        }

        reply.redirect(url);
      } catch (err: any) {
        reply.code(500).send({ code: -1, msg: err.message, data: err });
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
