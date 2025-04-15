import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import OpenAIApp from './utils';
import { setting } from '@main/core/db/service';
import { singleton } from '@main/utils/tool';

const API_PREFIX = 'api/v1/lab/ai';

const singleAdapter = singleton(OpenAIApp);
const adapter = new singleAdapter();

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}/chat`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>, reply: FastifyReply<any>) => {
    const ai = await setting.get('ai');
    if (!ai.key && !ai.server) {
      return { code: -1, msg: 'openai parms missing', data: null, };
    };

    const isVisable = adapter.checkClient({ apiKey: ai.key, baseURL: ai.server });
    if (!isVisable) {
      return { code: -1, msg: 'openai init  fail', data: null, };
    };

    const { prompt, model, sessionId, stream = false } = req.body;

    const { result, sessionId: sid } = await adapter.chat({
      prompt,
      sessionId,
      stream,
      model,
    });

    if (stream) {
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      result.once('end', () => {
        reply.raw.end('data: [DONE]\n\n');
      });

      result.on('data', (chunk: Buffer) => {
        const text = Buffer.from(chunk).toString();

        if (!reply.raw.writableEnded) {
          reply.raw.write(`data: ${text}\n\n`);
        } else {
          reply.raw.end('data: [DONE]\n\n');
        }
      });
    } else {
      return { sessionId: sid, reply: result.choices?.[0]?.message?.content };
    }
  });
  fastify.post(`/${API_PREFIX}/cache/create`, async () => {
    const res = adapter.cacheCreate();
    return { code: 0, msg: 'ok', data: res };
  });
  fastify.post(`/${API_PREFIX}/cache`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const { ids, metadata } = req.body;
    const res = adapter.cacheAdd(ids, metadata);
    return { code: 0, msg: 'ok', data: res };
  });
  fastify.delete(`/${API_PREFIX}/cache`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const { ids, metadata } = req.body;
    const res = adapter.cacheDel(ids, metadata);
    return { code: 0, msg: 'ok', data: res };
  });
  fastify.put(`/${API_PREFIX}/cache`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const { ids, metadata } = req.body;
    const res = adapter.cachePut(ids, metadata);
    return { code: 0, msg: 'ok', data: res };
  });
  fastify.get(`/${API_PREFIX}/cache`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { ids } = req.body;
    const res = adapter.cacheFetch(ids);
    return { code: 0, msg: 'ok', data: res };
  });
};

export default api;
