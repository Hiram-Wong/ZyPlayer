import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

import { iptv, channel, setting } from '../../db/service';

const API_VERSION = 'api/v1';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_VERSION}/iptv`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await iptv.add(req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.delete(
    `/${API_VERSION}/iptv/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const idStr = req.params.id;
        const idList = idStr.split(',');
        // 使用 Promise.all() 并行执行所有删除操作
        await Promise.all(
          idList.map(async (item) => {
            await iptv.remove(item);
          }),
        );
        reply.code(200);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.put(
    `/${API_VERSION}/iptv/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await iptv.update(req.params.id, req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.put(
    `/${API_VERSION}/iptv/status/:status/:id`,
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
            const currentData = await iptv.get(itemId);
            const updatedData = { ...currentData, isActive: status === 'enable' };
            await iptv.update(itemId, updatedData);
          }),
        );
        reply.code(200);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/iptv/list`, async (_, reply: FastifyReply) => {
    try {
      const data = await iptv.all();
      const tacitly = await setting.find({ key: 'defaultIptv' }).value;
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
    `/${API_VERSION}/iptv/page`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const { kw } = req.query;
        const page = await iptv.pagination(kw);
        const tacitly = await setting.find({ key: 'defaultIptv' }).value;
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
  fastify.get(`/${API_VERSION}/iptv/active`, async (_, reply: FastifyReply) => {
    try {
      const data = await iptv.filter({ isActive: true });
      const tacitly_id = await setting.find({ key: 'defaultIptv' }).value;
      const tacitly = await iptv.find({ id: tacitly_id });
      const epg = await setting.find({ key: 'defaultIptvEpg' }).value;
      const logo = await setting.find({ key: 'defaultIptvLogo' }).value;
      const skipIpv6 = await setting.find({ key: 'iptvSkipIpv6' }).value;
      const status = await setting.find({ key: 'iptvStatus' }).value;
      const thumbnail = await setting.find({ key: 'iptvThumbnail' }).value;
      const res = {
        data,
        default: tacitly,
        ext: {
          epg,
          logo,
          skipIpv6,
          status,
          thumbnail,
        },
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(`/${API_VERSION}/iptv/search`, async (_, reply: FastifyReply) => {
    try {
      const res = await iptv.search(req.query.kw);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.post(
    `/${API_VERSION}/channel`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await channel.set(req.body);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/channel/list`, async (_, reply: FastifyReply) => {
    try {
      const data = await iptv.all();
      const tacitly = await setting.find({ key: 'defaultIptv' }).value;
      const res = {
        data,
        default: tacitly,
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(`/${API_VERSION}/channel/class`, async (_, reply: FastifyReply) => {
    try {
      const res = await channel.class();
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.delete(`/${API_VERSION}/channel/clear`, async (_, reply: FastifyReply) => {
    try {
      const res = await channel.clear();
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.get(
    `/${API_VERSION}/channel/page`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const { page, limit, key, group } = req.query;
        const data_page = await channel.pagination(parseInt(page), parseInt(limit), key, group);
        const data_class = await channel.class();
        const res = {
          data: data_page['list'],
          total: data_page['total'],
          class: data_class,
        };
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.delete(
    `/${API_VERSION}/channel/:id`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const res = await channel.remove(req.params.id);
        reply.code(200).send(res);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/channel/search`, async (_, reply: FastifyReply) => {
    try {
      const res = await channel.search(req.query.kw);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
};

export default api;
