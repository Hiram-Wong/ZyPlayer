import { dbService } from '@main/services/DbService';
import { completionSchema, normalSchema } from '@server/schemas/v1/aigc/chat';
import { isHttp, isStrEmpty, isString } from '@shared/modules/validate';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import { chatCompletion } from './utils/chat';

const API_PREFIX = 'aigc/chat';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_PREFIX}/completion`,
    { schema: completionSchema },
    // @ts-expect-error Not all code paths return values。ts(7030)
    async (
      req: FastifyRequest<{
        Body: { prompt: string; model?: string; stream?: boolean; sessionId?: string; parentId?: string };
      }>,
      reply: FastifyReply<any>,
    ) => {
      const { prompt, model: rawModel, sessionId, parentId, stream } = req.body;

      const ai = (await dbService.setting.getValue('aigc')) || {};
      const model = rawModel || ai.model || '';

      if (!isString(prompt) || isStrEmpty(prompt)) {
        return reply.code(400).send({ code: -1, msg: 'Invalid Prompt', data: null });
      }

      if (![ai.server, model].some(isString) || !isHttp(ai.server) || isStrEmpty(model)) {
        return reply.code(400).send({ code: -1, msg: 'Invalid AI Configuration', data: null });
      }

      const resp = await chatCompletion.chatStandard(
        { prompt, stream, model, sessionId, parentId },
        { baseURL: ai.server, apiKey: ai.key },
      );

      if (stream) {
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });

        for await (const chunk of resp.completion) {
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        reply.raw.write('data: [DONE]\n\n');
        reply.raw.end();
      } else {
        return { code: 0, msg: 'ok', data: { sessionId: resp.sessionId, completion: resp.completion } };
      }
    },
  );

  fastify.post(
    `/${API_PREFIX}/normal`,
    { schema: normalSchema },
    async (
      req: FastifyRequest<{
        Body: { prompt: string; model?: string; sessionId?: string; parentId?: string };
      }>,
      reply: FastifyReply<any>,
    ) => {
      const { prompt, model: rawModel, sessionId, parentId } = req.body;

      const ai = (await dbService.setting.getValue('aigc')) || {};
      const model = rawModel || ai.model || '';

      if (!isString(prompt) || isStrEmpty(prompt)) {
        return reply.code(400).send({ code: -1, msg: 'Invalid Prompt', data: null });
      }

      if (![ai.server, model].some(isString) || !isHttp(ai.server) || isStrEmpty(model)) {
        return reply.code(400).send({ code: -1, msg: 'Invalid AI Configuration', data: null });
      }

      const resp = await chatCompletion.chatNormal(
        { prompt, stream: false, model, sessionId, parentId },
        { baseURL: ai.server, apiKey: ai.key },
      );

      return { code: 0, msg: 'ok', data: resp };
    },
  );
};

export default api;
