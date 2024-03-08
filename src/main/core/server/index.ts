import { app } from "electron";
import fastify from 'fastify';
import fastifyLogger from "fastify-logger";
import { join } from "path";
import logger from '../logger';
import { analyze, iptv, setting, drive, site, history, star, db } from './routes';


logger.info('[server] fastify module initialized');

let logOpt = {
  console: true, // 是否开启console.log 。。。
  file: join(app.getPath("userData"), 'logs/fastify.log'), // 文件路径  
  maxBufferLength: 4096, // 日志写入缓存队列最大长度
  flushInterval: 1000, // flush间隔
  logrotator: { // 分割配置
    byHour: true,
    byDay: false,    
    hourDelimiter: '_'
  }
}
const { opt } = fastifyLogger(logOpt);
opt.stream = null;

const initServer = async () => {
  const server = fastify({
    logger: opt,
    ignoreTrailingSlash: true,
    bodyLimit: 1024 * 1024 * 3 // 限制请求体大小为 3MB
  });

  try {
    server.get('/', async (_, reply) => {
      reply.code(200).send('zyplayer server is running!')
    })
    server.register(analyze);
    server.register(iptv);
    server.register(setting);
    server.register(drive);
    server.register(site);
    server.register(history);
    server.register(star);
    server.register(db);

    await server.listen({ port: 8345, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

export default initServer;