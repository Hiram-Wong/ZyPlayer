import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

import { drive, setting } from '../../../db/service';
import { init, dir, file, search } from './alist';

const API_VERSION = 'api/v1';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_VERSION}/drive`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await drive.add(req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.delete(
    `/${API_VERSION}/drive/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const idStr = req.params.id;
        const idList = idStr.split(',');
        // 使用 Promise.all() 并行执行所有删除操作
        await Promise.all(
          idList.map(async (item) => {
            await drive.remove(item);
          }),
        );
        reply.code(200);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.put(
    `/${API_VERSION}/drive/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await drive.update(req.params.id, req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.put(
    `/${API_VERSION}/drive/status/:status/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const { status, id } = req.params;
        const validStatuses = ['enable', 'disable'];

        if (!validStatuses.includes(status)) {
          throw new Error('Invalid status value. Must be "enable" or "disable".');
        }

        const idList = id.split(',');

        await Promise.all(
          idList.map(async itemId => {
            const currentData = await drive.get(itemId);
            const updatedData = { ...currentData, isActive: status === 'enable' };
            await drive.update(itemId, updatedData);
          }),
        );
        reply.code(200);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/drive/list`, async (_, reply: FastifyReply) => {
    try {
      const data = await drive.all();
      const tacitly = await setting.find({ key: 'defaultDrive' }).value;
      const res = {
        data,
        default: tacitly,
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(
    `/${API_VERSION}/drive/page`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const { kw } = req.query;
        const page = await drive.pagination(kw);
        const tacitly = await setting.find({ key: 'defaultDrive' }).value;
        const res = {
          data: page.data,
          total: page.total,
          default: tacitly,
        };
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/drive/active`, async (_, reply: FastifyReply) => {
    try {
      const data = await drive.filter({ isActive: true });
      const tacitly_id = await setting.find({ key: 'defaultDrive' }).value;
      const tacitly = await drive.find({ id: tacitly_id });
      const res = {
        data,
        default: tacitly,
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(
    `/${API_VERSION}/drive/search`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await drive.search(req.query.kw);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.post(
    `/${API_VERSION}/drive/init`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await init(req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
};

export default api;
