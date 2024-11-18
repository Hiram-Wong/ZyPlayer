import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { fixAdM3u8Ai } from './utils';

const API_PREFIX = 'api/v1/lab/ad';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      let { url, type, headers = '{}' } = req.query;
      if (!type || type !== 'm3u8' || !url || !url.startsWith('http')) {
        reply.code(500).send({ code: -1, msg: 'Invalid type provided or url' });
      } else {
        url = decodeURI(url);
        headers = JSON.parse(headers);
        const content = (await fixAdM3u8Ai.v2(url, headers as any)) || '';
        if (content.includes('.ts')) {
          reply.code(200).header('Content-Type', 'application/vnd.apple.mpegurl').send(content);
        } else {
          reply.redirect(url);
        }
      }
    },
  );
};

export default api;
