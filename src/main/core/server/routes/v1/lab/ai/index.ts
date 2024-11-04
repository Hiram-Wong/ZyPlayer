import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { createOpenAI } from './utils';
import { setting } from '@main/core/db/service';

const API_PREFIX = 'api/v1/lab/ai';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { type, codeSnippet, demand } = req.body;

    const ai = await setting.get('ai');
    if (!ai.key && !ai.server && !ai.model) {
      return {
        code: -1,
        msg: 'not config openai parms',
        data: null,
      };
    }
    const config = {
      clientOptions: {
        apiKey: ai.key,
        baseURL: ai.server,
      },
      defaultModel: { chatModel: ai.model },
    };
    const crawlOpenAIApp = createOpenAI(config);

    let response: any = '';
    switch (type) {
      case 'filter':
        response = (await crawlOpenAIApp.parseElements(codeSnippet, demand)).filters;
        break;
      case 'cssSelector':
        response = (await crawlOpenAIApp.getElementSelectors(codeSnippet, demand)).selectors;
        break;
      case 'qa':
        response = await crawlOpenAIApp.help(demand);
        break;
    }

    if (response?.includes('AI encountered an error or timeout')) {
      return {
        code: -1,
        msg: 'AI encountered an error or timeout',
        data: null,
      };
    } else {
      return {
        code: 0,
        msg: 'ok',
        data: response,
      };
    }
  });
};

export default api;
