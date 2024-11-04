import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { fixAdM3u8Ai } from './utils';

const API_PREFIX = 'api/v1/lab/ad';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      const { url = '', type = '', headers = {} } = req.query;

      let data = {
        code: 500,
        msg: 'fail',
        url,
        headers: headers ? JSON.parse(headers as string) : null,
        type,
        content: null,
      };

      if (!type || !type.endsWith('.m3u8')) {
        data.msg = 'Invalid type provided';
        data.code = 500;
      } else {
        // 逻辑处理
        const content = (await fixAdM3u8Ai(url, data.headers)) || '';
        // 结果处理
        data.code = content.includes('.ts') ? 200 : 500;
        data.msg = content.includes('.ts') ? 'success' : 'fail';
        data.content = content;
      }

      if (data.code === 200 && data.content) {
        reply.code(data.code).header('Content-Type', 'application/vnd.apple.mpegurl').send(data.content);
      } else if (url && url.startsWith('http')) {
        reply.redirect(url);
      } else {
        reply.code(200).send(data);
      }
    },
  );
};

export default api;
