import { app } from 'electron';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyLogger from 'fastify-logger';
import fastifyPlugin from 'fastify-plugin';

import { JsonDB, Config } from 'node-json-db';
import { join } from 'path';
import logger from '@main/core/logger';
import routesV1Modules from './routes/v1';
import webdev from '@main/utils/webdev';
import { setting, db } from '@main/core/db/service';

async function jsonDbPlugin(fastify) {
  const db = new JsonDB(new Config(join(app.getPath('userData'), 'cache.json'), true, true, '/'));
  fastify.decorate('db', db);
}

const wrappedJsonDbPlugin = fastifyPlugin(jsonDbPlugin, {
  fastify: '5.x',
  name: 'json-db-plugin',
});

let logOpt = {
  console: true,
  file: join(app.getPath('userData'), 'logs/fastify.log'), // 文件路径
  maxBufferLength: 4096, // 日志写入缓存队列最大长度
  flushInterval: 1000, // flush间隔
  logrotator: {
    byHour: false,
    byDay: true,
    hourDelimiter: '_',
  },
};
const { opt } = fastifyLogger(logOpt);
opt.stream = null;

const setup = async () => {
  const server = fastify({
    logger: opt, // 是否开启日志
    forceCloseConnections: true, // 是否强制关闭连接
    ignoreTrailingSlash: true, // 是否忽略斜杠
    maxParamLength: 10240, // 参数长度限制
    bodyLimit: 1024 * 1024 * 3, // 限制请求体大小为 3MB
  });

  try {
    server.setErrorHandler((error, _request, reply) => {
      server.log.error(error);

      reply.status(500).send({
        code: -1,
        msg: `Internal Server Error - ${error.name}`,
        data: error.message,
      });
    });

    server.register(wrappedJsonDbPlugin);
    server.register(fastifyMultipart);
    server.register(fastifyCors);

    // 注册 v1 路由
    Object.keys(routesV1Modules).forEach((key) => {
      server.register(routesV1Modules[key]);
    });

    await server.listen({ port: 9978, host: '0.0.0.0' });
    logger.info('[server][init] listen:http://0.0.0.0:9978');

    const syncWebdevData = async () => {
      logger.info('[webdev][sync][start] try');

      try {
        const dbResWebdev = await setting.get('webdev');
        if (!dbResWebdev || !dbResWebdev.sync) {
          logger.info('[webdev][sync][skip] not open sync');
          return;
        }

        const webdevConfig = dbResWebdev.data;
        if (!webdevConfig.url || !webdevConfig.username || !webdevConfig.password) {
          logger.info('[webdev][sync][fail] incomplete config');
          return;
        }

        let instance: webdev | null = new webdev({
          url: webdevConfig.url,
          username: webdevConfig.username,
          password: webdevConfig.password,
        });

        const initRes = await instance.initializeWebdavClient();
        if (initRes) {
          const doc = await db.all();
          await instance.rsyncRemote(doc);
          instance = null; // 释放内存
          logger.info('[webdev][sync][success]');
        } else {
          logger.info('[webdev][sync][fail] init error');
        }
      } catch (err: any) {
        logger.info(`[webdev][sync][fail] ${err.message}`);
      }
    };

    setInterval(syncWebdevData, 5 * 60 * 1000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

export default setup;
