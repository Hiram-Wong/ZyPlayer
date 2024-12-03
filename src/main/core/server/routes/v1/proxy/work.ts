import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { pipeline } from 'stream';
import { hash, base64 } from '@main/utils/crypto';
import request, { completeRequest } from '@main/utils/request';

const API_PREFIX = 'proxy';
const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}`,
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
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { text, url } = req.body;
    // @ts-ignore
    const res = await req.server.db.push(`/proxy/${hash['md5-16'](url)}`, text);
    return {
      code: 0,
      msg: 'ok',
      data: `http://127.0.0.1:9978/proxy?do=js&url=${url}`,
    };
  });
  fastify.get(
    `/${API_PREFIX}/video`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      const { url, headers } = req.query;
      const response = await completeRequest({
        method: 'get',
        url: url,
        responseType: 'stream', // 重要：设置响应类型为流
        // headers: { 'Custom-Header': 'Custom Value' }
      });
      reply.raw.on('close', () => {
        console.log('Client disconnected, stopping stream.');
        response.data.destroy(); // 销毁目标流
      });
      reply.status(response.code);
      for (const [key, value] of Object.entries(response.headers)) {
        reply.header(key, value);
      }
      // response.pipe(reply.raw);
      pipeline(response.data, reply.raw, (err) => {
        if (err) {
          console.error('Pipeline error:', err);
          if (!reply.raw.headersSent) {
            reply.code(500).send({ error: 'Streaming error' });
          }
        }
      });
    },
  );
};

export default api;
