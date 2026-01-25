import { Buffer } from 'node:buffer';

import { request } from '@main/utils/request';
import { getSchema, setSchema } from '@server/schemas/v0/proxy';
import { base64, hash } from '@shared/modules/crypto';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

const API_PREFIX = 'proxy';

const generateCacheKey = (url: string): string => {
  return `proxy-${hash['md5-16']({ src: url })}`;
};

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}`,
    { schema: getSchema },
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      const { url } = req.query;

      if (!url) {
        reply.code(400).send({ code: -1, msg: 'Invalid URL', data: null });
        return;
      }

      const cacheKey = generateCacheKey(url);

      const cacheData: Array<string> | null = await fastify.cache.get(cacheKey);
      if (cacheData && cacheData.length > 0) {
        const [status, contentType, content, ...rest] = cacheData;
        const headers = rest.length > 0 ? rest[0] : null;
        const isBase64 = rest.length > 1 ? rest[1] : null;

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            reply.header(key, value);
          });
        }

        let responseContent = content;
        if (isBase64) {
          if (content.includes('base64,')) {
            responseContent = decodeURIComponent(content.split('base64,')[1]);
          }
          responseContent = base64.decode({ src: responseContent });
        }

        reply
          .code(typeof status === 'number' ? status : Number.parseInt(status))
          .header('Content-Type', contentType)
          .send(responseContent);
      }

      if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].some((ext) => url.toLowerCase().includes(ext))) {
        const { data: resp } = await request.request({
          url,
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.82',
          },
        });
        if (typeof resp === 'string' && resp.includes('base64,')) {
          const parts = resp.split(';base64,');
          if (parts.length === 2) {
            const imageType = parts[0].split(':')[1];
            const imageBuffer = Buffer.from(parts[1], 'base64');

            reply.type(imageType).send(imageBuffer);
          }
        }
      }

      reply.code(302).redirect(url);
    },
  );

  fastify.post(
    `/${API_PREFIX}`,
    { schema: setSchema },
    async (req: FastifyRequest<{ Body: { url: string; text: Array<string | number> } }>) => {
      const { text, url } = req.body;

      if (!text || !url) {
        return { code: -1, msg: 'Text and URL parameters are required', data: null };
      }

      const cacheKey = generateCacheKey(url);
      fastify.cache.set(cacheKey, text);

      return { code: 0, msg: 'ok', data: `http://127.0.0.1:9978/proxy?url=${encodeURIComponent(url)}` };
    },
  );
};

export default api;
