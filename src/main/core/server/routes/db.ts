import _ from 'lodash';
import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

import { history, setting, star, site, iptv, channel, analyze, drive, db } from '../../db/service';

const API_VERSION = "api/v1";

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete(`/${API_VERSION}/db/clear`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const data = req.body;

      const clearFunctions = {
        site: () => site.clear(),
        analyze: () => analyze.clear(),
        drive: () => drive.clear(),
        iptv: () => iptv.clear(),
        channel: () => channel.clear(),
        history: () => history.clear(),
        star: () => star.clear(),
        setting: () => setting.clear(),
        all: () => db.clear()
      };

      const clearData = async (type) => {
        if (clearFunctions[type]) {
          return await clearFunctions[type]();
        }
        throw new Error("Invalid type");
      };

      if (_.isArray(data)) {
        await Promise.all(data.map(clearData));
      }

      reply.code(200);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.post(`/${API_VERSION}/db/export`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const data = req.body;
      let res = {};

      const exportFunctions = {
        site: () => site.all(),
        analyze: () => analyze.all(),
        drive: () => drive.all(),
        iptv: () => iptv.all(),
        channel: () => channel.all(),
        history: () => history.all(),
        star: () => star.all(),
        setting: () => setting.all(),
        all: () => db.all()
      };

      const exportData = async (type) => {
        if (!exportFunctions[type]) {
          throw new Error("Invalid type");
        }
        if (type === "all") {
          res = await exportFunctions[type]();
        } else {
          const result = await exportFunctions[type]();
          res[`tbl_${type}`] = result;
        }
      };

      if (_.isArray(data)) {
        await Promise.all(data.map(exportData));
      }

      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
  fastify.post(`/${API_VERSION}/db/init`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const data = req.body;
      const tables = ['tbl_site', 'tbl_iptv', 'tbl_channel', 'tbl_analyze', 'tbl_drive', 'tbl_history', 'tbl_star', 'tbl_setting'];

      const tableSetters = {
        'site': site.set,
        'iptv': iptv.set,
        'channel': channel.set,
        'analyze': analyze.set,
        'drive': drive.set,
        'history': history.set,
        'star': star.set,
        'setting': setting.set
      };
      
      if (_.every(tables, table => _.has(data, table))) {
        const res = db.init(data);
        reply.code(200).send(res);
      } else {
        tables.forEach(table => {
          const prefix = table.substring(4);
          if (_.has(data, table) && tableSetters[prefix]) {
            tableSetters[prefix](data[table]);
          }
        });
        reply.code(200).send('Tables processed individually.');
      }
    } catch (err) {
      reply.code(500).send(err);
    }
  });
}

export default api;