import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { completeRequest } from '@main/utils/request';
import fixAdM3u8Ai from './utils';

const API_PREFIX = 'api/v1/lab/ad';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      const m3u8ContentType = ['application/vnd.apple.mpegurl', 'application/x-mpegURL', 'application/octet-stream'];

      let { url, headers = '{}' } = req.query;

      if (!url || !/^(http:\/\/|https:\/\/)/.test(url)) {
        reply.code(500).send({ code: -1, msg: 'Invalid m3u8 url' });
        return;
      } else {
        url = decodeURI(url);
        headers = JSON.parse(headers);

        const res = await completeRequest({ url, method: 'HEAD', headers } as any);

        if (res?.headers?.['content-type'] && m3u8ContentType.includes(res.headers['content-type'])) {
          const content = (await fixAdM3u8Ai.latest(url, headers as any)) || '';
          if (content.includes('.ts')) {
            reply.code(200).header('Content-Type', 'application/vnd.apple.mpegurl').send(content);
            return;
          } else {
            reply.redirect(url);
            return;
          }
        } else {
          reply.code(500).send({ code: -1, msg: 'Invalid url type provided' });
          return;
        }
      }
    },
  );
};

export default api;
