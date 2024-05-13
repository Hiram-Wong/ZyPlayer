import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import _ from 'lodash';
import { nanoid } from 'nanoid';

import { fixAdM3u8Ai } from './ad';
import { site, setting } from '../../../db/service';
import logger from '../../../logger';


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
        } catch (error) {
        }

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
        } catch (error) {
        }
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
        } catch (error) {
        }

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
        const { url, type, headers } = req.query;
        let _headers = null;
        if (headers) {
          try {
            _headers = JSON.parse(headers);
          } catch (e) {
          }
        }

        let data = {
          code: 500,
          msg: 'fail',
          url: url,
          headers: _headers,
          type: type,
          content: null,
        };

        if (!type || !type.includes('.m3u8')) {
          data.msg = 'fail';
          data.code = 500;
        } else {
          // 逻辑处理
          const content = await fixAdM3u8Ai(url, _headers);
          // 结果处理
          if (content.indexOf('.ts') > -1) {
            // const id = nanoid();
            // // @ts-ignore
            // await req.server.db.push(`/ad/${id}`, content);
            data.code = 200;
            // data.url = `http://127.0.0.1:9978/api/v1/lab/stream/${id}.m3u8`;
            data.msg = 'success';
            data.content = content;
          } else {
            data.code = 500;
            data.msg = 'fail';
          }
        }
        if (data.content) {
          reply.code(data.code).header('Content-Type', 'application/vnd.apple.mpegurl').send(data.content);
        } else if (url && url.startsWith('http')) {
          reply.redirect(302, url);
        } else {
          reply.code(200).send(data);
        }
        // reply.code(200).send(data);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(
    `/${API_VERSION}/lab/stream/:id.m3u8`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        let data = '';
        let id = '';
        let code = 200;
        try {
          // @ts-ignore
          id = req.params.id;
        } catch (err) {
          code = 500;
        }

        try {
          // @ts-ignore
          const db = await req.server.db.getData(`/ad/${id}`);
          logger.info(db);

          data = db;
        } catch (err) {
          logger.info(err);
          code = 500;
        }

        reply.code(code).header('Content-Type', 'application/vnd.apple.mpegurl').send(data);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
};

export default api;
