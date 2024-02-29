import fastify from 'fastify';
import logger from '../logger';
import { analyze, iptv, setting, drive, site, history, star, db } from './routes';


logger.info('[server] fastify module initialized')

const initServer = async () => {
  const server = fastify({
    logger: true,
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