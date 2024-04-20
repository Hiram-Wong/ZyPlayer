import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import _ from 'lodash';
import { nanoid } from 'nanoid';

import { site, setting } from '../../db/service';

const API_VERSION = "api/v1";

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_VERSION}/lab/debugSource`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      let db = {text: '', oldSiteId: '', debugSiteId: ''};
      try {
        // @ts-ignore
        db = await req.server.db.getData("/debug-edit-source");
      } catch(error) {};
      const res = db?.text ?? '';

      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.post(`/${API_VERSION}/lab/debugSource`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      // @ts-ignore
      const { text } = req.body;
      let debugSiteId = nanoid();
      let db = {text: '', oldSiteId: '', debugSiteId: ''};
      let oldSiteId = await setting.find({ key: "defaultSite" }).value;
      try {
        // @ts-ignore
        db = await req.server.db.getData("/debug-edit-source");
      } catch(error) {};
      const { oldSiteId: dbOldSiteId, debugSiteId: dbDebugSiteId } = db;

      if (dbDebugSiteId) {
        debugSiteId = dbDebugSiteId;
      } else {
        const newSiteData = {
          id: debugSiteId,
          name: "debug-edit-source",
          api: "t3forjs",
          playUrl: "",
          search: 1,
          group: "debug",
          isActive: true,
          type: 7,
          ext: "http://127.0.0.1:9978/api/v1/lab/debugSource",
          categories: ""
        };
        await site.add(newSiteData);
      };
      if (dbOldSiteId) oldSiteId = dbOldSiteId;

      // @ts-ignore
      await req.server.db.push('/debug-edit-source', { oldSiteId, text: `${text}`, debugSiteId });
      const res = await setting.update_data('defaultSite', { value: debugSiteId });

      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
  fastify.delete(`/${API_VERSION}/lab/debugSource`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      let db = {text: '', oldSiteId: '', debugSiteId: ''};
      let res = {};
      try {
        // @ts-ignore
        db = await req.server.db.getData("/debug-edit-source");
      } catch(error) {};

      const { oldSiteId: dbOldSiteId, debugSiteId: dbDebugSiteId } = db;

      if (dbDebugSiteId) {
        await site.remove(dbDebugSiteId);
      }
      if (dbOldSiteId) {
        res = await setting.update_data('defaultSite', {value: dbOldSiteId});
      }
      // @ts-ignore
      await req.server.db.delete('/debug-edit-source');
      
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  })
}

export default api;