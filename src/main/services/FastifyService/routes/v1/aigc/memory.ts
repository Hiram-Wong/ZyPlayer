import {
  addMessageSchema,
  clearSessionSchema,
  createSessionSchema,
  deleteMessageSchema,
  getMessageSchema,
  getSessionIdsSchema,
  putMessageSchema,
} from '@server/schemas/v1/aigc/memory';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import type { ChatMessage, RecentMessageOptions } from './utils/memory';
import { memoryManager } from './utils/memory';

const API_PREFIX = 'aigc/memory';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_PREFIX}/message`,
    { schema: addMessageSchema },
    async (req: FastifyRequest<{ Body: { id: string; messages: ChatMessage | ChatMessage[] } }>) => {
      const { id, messages } = req.body;
      const session = memoryManager.addMessage(id, messages);
      return { code: 0, msg: 'ok', data: session };
    },
  );

  fastify.delete(
    `/${API_PREFIX}/message`,
    { schema: deleteMessageSchema },
    async (req: FastifyRequest<{ Body: { id: string; index?: number[] } }>) => {
      const { id, index } = req.body;
      const session = memoryManager.deleteMessage(id, index);
      return { code: 0, msg: 'ok', data: session };
    },
  );

  fastify.put(
    `/${API_PREFIX}/message`,
    { schema: putMessageSchema },
    async (req: FastifyRequest<{ Body: { id: string; updates: { index: number; message: ChatMessage }[] } }>) => {
      const { id, updates } = req.body;
      const session = memoryManager.replaceMessage(id, updates);
      return { code: 0, msg: 'ok', data: session };
    },
  );

  fastify.get(
    `/${API_PREFIX}/message/:id`,
    { schema: getMessageSchema },
    async (
      req: FastifyRequest<{ Params: { id: string }; Querystring: { recentCount?: string; maxTokens?: string } }>,
    ) => {
      const { id } = req.params;
      const { recentCount, maxTokens } = req.query;
      const options: RecentMessageOptions = {};

      if (recentCount) options.recentCount = Number.parseInt(recentCount);
      if (maxTokens) options.maxTokens = Number.parseInt(maxTokens);

      const session = memoryManager.getMessage(id, options);
      return { code: 0, msg: 'ok', data: session };
    },
  );

  fastify.post(
    `/${API_PREFIX}/session`,
    { schema: createSessionSchema },
    async (req: FastifyRequest<{ Body: { messages?: ChatMessage[] } }>) => {
      const { messages = [] } = req.body;
      const session = memoryManager.createSession(messages);
      return { code: 0, msg: 'ok', data: session };
    },
  );

  fastify.delete(
    `/${API_PREFIX}/session`,
    { schema: clearSessionSchema },
    async (req: FastifyRequest<{ Body: { id?: string[] } | null }>) => {
      const { id } = req.body || {};
      if (id && id.length !== 0) {
        memoryManager.delSession(id);
      } else {
        memoryManager.clearSession();
      }
      return { code: 0, msg: 'ok', data: null };
    },
  );

  fastify.get(`/${API_PREFIX}/session/id`, { schema: getSessionIdsSchema }, async () => {
    const id = memoryManager.getSessionIds();
    return { code: 0, msg: 'ok', data: id };
  });
};

export default api;
