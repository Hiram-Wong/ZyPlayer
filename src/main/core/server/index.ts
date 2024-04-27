import { app } from "electron";
import fastify from 'fastify';
import fastifyLogger from "fastify-logger";
import fastifyMultipart from "fastify-multipart";

import { JsonDB, Config } from 'node-json-db';
import { join } from "path";
import logger from '../logger';
import { analyze, iptv, setting, drive, site, history, star, db, proxy, catbox, cache, lab, file } from './routes';
import initConfig from './routes/catbox/config';

logger.info('[server] fastify module initialized');

let logOpt = {
  console: true, // 是否开启console.log 。。。
  file: join(app.getPath("userData"), 'logs/fastify.log'), // 文件路径  
  maxBufferLength: 4096, // 日志写入缓存队列最大长度
  flushInterval: 1000, // flush间隔
  logrotator: { // 分割配置
    byHour: false,
    byDay: true,    
    hourDelimiter: '_'
  }
}
const { opt } = fastifyLogger(logOpt);
opt.stream = null;

const initServer = async () => {
  const server = fastify({
    logger: opt, // 是否开启日志
    forceCloseConnections: true, // 是否强制关闭连接
    ignoreTrailingSlash: true, // 是否忽略斜杠
    maxParamLength: 10240, // 参数长度限制
    bodyLimit: 1024 * 1024 * 3, // 限制请求体大小为 3MB
  });

  try {
    server.addHook('onError', async (_request, _reply, error) => {
      logger.error(error);
      if (!error.statusCode) error.statusCode = 500;
      return error;
    });

    server.decorate('config', initConfig);
    server.decorate('db', new JsonDB(new Config(join(app.getPath("userData"), "cache.json"), true, true, '/')));

    server.get('/', async (_, reply) => {
      reply.code(200).send({status: 'run'})
    })
    server.register(fastifyMultipart);
    server.register(analyze);
    server.register(iptv);
    server.register(setting);
    server.register(drive);
    server.register(site);
    server.register(history);
    server.register(star);
    server.register(db);
    server.register(proxy);
    server.register(catbox);
    server.register(cache);
    server.register(lab);
    server.register(file);

    await server.listen({ port: 9978, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

export default initServer;