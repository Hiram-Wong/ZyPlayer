import { Buffer } from 'node:buffer';
import { join } from 'node:path';
import readline from 'node:readline';

import TailFile from '@logdna/tail-file';
import { getNetwork } from '@main/utils/ip';
import { APP_LOG_PATH } from '@main/utils/path';
import { request } from '@main/utils/request';
import { healthSchema, ipSchema, logSchema, m3u8AdRemoveSchema, reqSchema } from '@server/schemas/v1/system/other';
import { APP_VERSION } from '@shared/config/appinfo';
import type { ILogModuleType, LogLevel } from '@shared/config/logger';
import { LEVEL_MAP, LOG_MODULE } from '@shared/config/logger';
import type { IReqEncode } from '@shared/config/req';
import { reqEncodes } from '@shared/config/req';
import { toUnix, toYMD } from '@shared/modules/date';
import { isHttp, isJsonStr, isNil } from '@shared/modules/validate';
import type { AxiosRequestConfig } from 'axios';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import iconv from 'iconv-lite';

import { fixAdM3u8Ai } from './utils/m3u8';

const API_PREFIX = 'system';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/health`, { schema: healthSchema }, async () => {
    return { code: 0, msg: 'ok', data: { timestamp: toUnix(), version: APP_VERSION } };
  });

  fastify.get(`/${API_PREFIX}/ip`, { schema: ipSchema }, async () => {
    const resp = await getNetwork();
    return { code: 0, msg: 'ok', data: resp };
  });

  fastify.post(
    `/${API_PREFIX}/req`,
    { schema: reqSchema },
    async (req: FastifyRequest<{ Body: AxiosRequestConfig & { encode?: IReqEncode } }>) => {
      const { encode, ...config } = req.body;

      if (!isNil(encode) && reqEncodes.includes(encode)) {
        const resp = await request.request({ ...config, responseType: 'arraybuffer' });
        resp.data = iconv.decode(Buffer.from(resp.data), encode);
        const res = { code: resp.status, data: resp.data, headers: resp.headers };
        return { code: 0, msg: 'ok', data: res };
      } else {
        const resp = await request.request(config);
        const res = { code: resp.status, data: resp.data, headers: resp.headers };
        return { code: 0, msg: 'ok', data: res };
      }
    },
  );

  fastify.get(
    `/${API_PREFIX}/m3u8/adremove`,
    { schema: m3u8AdRemoveSchema },
    async (req: FastifyRequest<{ Querystring: { url: string; headers?: string } }>, reply: FastifyReply) => {
      const M3U8_CONTENT_TYPES = ['application/vnd.apple.mpegurl', 'application/x-mpegURL', 'application/octet-stream'];

      const { url, headers: rawHeaders = '{}' } = req.query;
      const headers = isJsonStr(rawHeaders) ? JSON.parse(rawHeaders) : {};

      if (!isHttp(url)) {
        return reply.code(400).send({ code: -1, msg: 'Invalid m3u8 URL' });
      }

      try {
        const ext = new URL(url).pathname.split('.').pop();
        if (ext !== 'm3u8') {
          const { data: resp } = await request.request({ url, method: 'HEAD', headers });

          const contentType = resp?.headers?.['content-type'];
          if (!contentType || !M3U8_CONTENT_TYPES.includes(contentType)) {
            return reply.code(400).send({ code: -1, msg: 'Invalid m3u8 URL' });
          }
        }

        const content = await fixAdM3u8Ai(url, headers);
        if (content && content.includes('.ts')) {
          return reply.code(200).header('Content-Type', 'application/vnd.apple.mpegurl').send(content);
        }

        return reply.code(302).redirect(url);
      } catch {
        return reply.code(302).redirect(url);
      }
    },
  );

  fastify.get(
    `/${API_PREFIX}/log`,
    { schema: logSchema },
    async (req: FastifyRequest<{ Querystring: { type?: string; level?: LogLevel } }>, reply: FastifyReply<any>) => {
      const { type: rawType = '', level = 'none' } = req.query;

      const modules = Object.values(LOG_MODULE) as ILogModuleType[];

      const type = rawType.split(',').filter((t) => {
        if (modules.includes(t as ILogModuleType)) return true;
        const lt = t.indexOf('<');
        return lt !== -1 && t.endsWith('>') && modules.includes(t.slice(0, lt) as ILogModuleType);
      });

      const filePath = join(APP_LOG_PATH, `app.${toYMD()}.log`);
      const minLevel = LEVEL_MAP[level];

      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      reply.raw.write(': heartbeat\n\n');
      const heartbeat = setInterval(() => {
        reply.raw.write(': heartbeat\n\n');
      }, 15000);

      let tail: TailFile | null = null;

      const quit = async () => {
        clearInterval(heartbeat);
        if (tail) {
          await tail.quit();
          tail = null;
        }
        reply.raw.write('data: [DONE]\n\n');
        reply.raw.end();
      };

      tail = new TailFile(filePath).on('tail_error', (error) => {
        fastify.log.error(`TailFile error: ${error.message}`);
        quit();
      });
      await tail.start();

      reply.raw.write('data: [READY]\n\n');

      const linesplitter = readline.createInterface({ input: tail });
      linesplitter.on('line', (line) => {
        try {
          const obj = JSON.parse(line);
          if (LEVEL_MAP[obj.level] < minLevel) return;
          if (!type.includes(obj.module) && type.length !== 0) return;

          reply.raw.write(`data: ${JSON.stringify(obj)}\n\n`);
        } catch (error) {
          fastify.log.error(`Invalid log line: ${(error as Error).message}`);
        }
      });

      req.raw.on('close', quit);
    },
  );
};

export default api;
