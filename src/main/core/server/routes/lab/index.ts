import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import _ from 'lodash';
import { nanoid } from 'nanoid';

import { fixAdM3u8Ai } from './ad';
import { createOpenAI } from './ai';
import { site, setting } from '../../../db/service';

const API_VERSION = 'api/v1';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_VERSION}/lab/debugSource`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const action = req.query.action;
        let db = { text: '', oldSiteId: '', debugSiteId: '' };
        let res;
        try {
          // @ts-ignore
          db = await req.server.db.getData('/debug-edit-source');
        } catch (error) {}

        if (action === 'all') {
          res = db?.text || '';
        } else {
          res = db?.text[action];
        }

        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.post(
    `/${API_VERSION}/lab/debugSource`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        // @ts-ignore
        const text = req.body;
        let debugSiteId = nanoid();
        let db = { text: '', oldSiteId: '', debugSiteId: '' };
        let oldSiteId = await setting.find({ key: 'defaultSite' }).value;
        try {
          // @ts-ignore
          db = await req.server.db.getData('/debug-edit-source');
        } catch (error) {}
        const { oldSiteId: dbOldSiteId, debugSiteId: dbDebugSiteId } = db;

        if (dbDebugSiteId) {
          debugSiteId = dbDebugSiteId;
        } else {
          const newSiteData = {
            id: debugSiteId,
            name: 'debug-edit-source',
            api: 't3forjs',
            playUrl: '',
            search: 1,
            group: 'debug',
            isActive: true,
            type: 7,
            ext: 'http://127.0.0.1:9978/api/v1/lab/debugSource?action=content',
            categories: '',
          };
          await site.add(newSiteData);
        }
        if (dbOldSiteId) oldSiteId = dbOldSiteId;

        // @ts-ignore
        await req.server.db.push('/debug-edit-source', { oldSiteId, text, debugSiteId });
        const res = await setting.update_data('defaultSite', { value: debugSiteId });

        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.delete(
    `/${API_VERSION}/lab/debugSource`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        let db = { text: '', oldSiteId: '', debugSiteId: '' };
        let res = {};
        try {
          // @ts-ignore
          db = await req.server.db.getData('/debug-edit-source');
        } catch (error) {}

        const { oldSiteId: dbOldSiteId, debugSiteId: dbDebugSiteId } = db;

        if (dbDebugSiteId) {
          await site.remove(dbDebugSiteId);
        }
        if (dbOldSiteId) {
          res = await setting.update_data('defaultSite', { value: dbOldSiteId });
        }
        // @ts-ignore
        await req.server.db.delete('/debug-edit-source');

        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(
    `/${API_VERSION}/lab/removeAd`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const { url = '', type = '', headers = null } = req.query;

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
          reply.redirect(302, url);
        } else {
          reply.code(200).send(data);
        }
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.post(
    `/${API_VERSION}/lab/ai`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      let data: any = {
        code: 500,
        msg: 'fail',
        data: '',
      };
      try {
        const ai = await setting.find({ key: 'ai' }).value;
        if (!ai.key && !ai.server && !ai.model) {
          data.data = 'not config openai parms';
          reply.code(200).send(data);
          return;
        }
        const config = {
          clientOptions: {
            apiKey: ai.key,
            baseURL: ai.server,
          },
          defaultModel: { chatModel: ai.model },
        };
        const crawlOpenAIApp = createOpenAI(config);

        // @ts-ignore
        const { type, codeSnippet, demand } = req.body;

        switch (type) {
          case 'filter':
            data.data = (await crawlOpenAIApp.parseElements(codeSnippet, demand)).filters;
            data.code = 200;
            data.msg = 'success';
            break;
          case 'cssSelector':
            data.data = (await crawlOpenAIApp.getElementSelectors(codeSnippet, demand)).selectors;
            data.code = 200;
            data.msg = 'success';
            break;
          case 'qa':
            data.data = await crawlOpenAIApp.help(demand);
            data.code = 200;
            data.msg = 'success';
            break;
        }
        reply.code(200).send(data);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
};

export default api;
