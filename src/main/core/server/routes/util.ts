import _ from 'lodash';
import axios from 'axios';
import PQueue from 'p-queue';
import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { setting } from '../../db/service';
import logger from '../../logger';

const API_VERSION = 'api/v1';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_VERSION}/util/batchFetch`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        // @ts-ignore
        const { items, max_workers = 5 } = req.body;
        const queue = new PQueue({ concurrency: max_workers });

        const timeout = (await setting.find({ key: 'timeout' }).value) || 5000;

        const promises: Promise<any>[] = items.map((item) => {
          return queue.add(async () => {
            try {
              const response = await axios(
                Object.assign({}, item?.options, {
                  url: item.url,
                  method: item?.options?.method || 'GET',
                  timeout: item?.options?.timeout || timeout,
                  responseType: 'text',
                }),
              );
              return response.data;
            } catch (error) {
              logger.error(`[util][batchFetch][error] ${item.url}: ${error}`);
              return null;
            }
          });
        });
        const results = await Promise.all(promises);

        reply.code(200).send({ code: 200, data: results, msg: 'success' });
      } catch (err) {
        reply.code(200).send({ code: 500, data: err, msg: 'fail' });
      }
    },
  );
};

export default api;
