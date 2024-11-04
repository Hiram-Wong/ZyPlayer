import { FastifyReply, FastifyPluginAsync } from 'fastify';

import { kunyu77, kkys, push, ffm3u8 } from './spider';
import logger from '../../../../logger';

const API_VERSION = 'api/v1';
const spiderPrefix = '/spider';
const spiders = [kunyu77, kkys, push, ffm3u8];

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  // register all spider router
  spiders.forEach((spider) => {
    const path = spiderPrefix + '/' + spider.meta.key + '/' + spider.meta.type;

    fastify.register(spider.api, { prefix: path });
    logger.info('Register spider: ' + path);
  });
  fastify.get(`/${API_VERSION}/catvod`, async (_, reply: FastifyReply) => {
    try {
      const config = {
        video: {
          sites: [],
        },
        read: {
          sites: [],
        },
        comic: {
          sites: [],
        },
        music: {
          sites: [],
        },
        pan: {
          sites: [],
        },
      };
      spiders.forEach((spider) => {
        let meta = Object.assign({}, spider.meta);
        meta.api = spiderPrefix + '/' + meta.key + '/' + meta.type;
        meta.key = 'nodejs_' + meta.key;
        const stype = spider.meta.type;
        if (stype < 10) {
          config.video.sites.push(meta);
        } else if (stype >= 10 && stype < 20) {
          config.read.sites.push(meta);
        } else if (stype >= 20 && stype < 30) {
          config.comic.sites.push(meta);
        } else if (stype >= 30 && stype < 40) {
          config.music.sites.push(meta);
        } else if (stype >= 40 && stype < 50) {
          config.pan.sites.push(meta);
        }
      });
      reply.code(200).send(config);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
};

export default api;
