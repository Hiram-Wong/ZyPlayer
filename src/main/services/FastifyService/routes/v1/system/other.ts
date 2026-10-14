import { Buffer } from 'node:buffer';
import { join } from 'node:path';
import readline from 'node:readline';

import TailFile from '@logdna/tail-file';
import { getNetwork } from '@main/utils/ip';
import { APP_LOG_PATH } from '@main/utils/path';
import { request } from '@main/utils/request';
import type {
  SystemIpQuery,
  SystemLogQuery,
  SystemM3u8AdRemoveQuery,
  SystemReqBody,
} from '@server/schemas/v1/system/other';
import { healthSchema, ipSchema, logSchema, m3u8AdRemoveSchema, reqSchema } from '@server/schemas/v1/system/other';
import { APP_VERSION } from '@shared/config/appInfo';
import type { ILogModuleType, LogLevel } from '@shared/config/logger';
import { LEVEL_MAP, LOG_MODULE } from '@shared/config/logger';
import type { IReqEncode } from '@shared/config/req';
import { reqEncodes } from '@shared/config/req';
import { toUnix, toYMD } from '@shared/modules/date';
import { convertHeaders, isLocalhostURI } from '@shared/modules/headers';
import { isHttp, isNil, isUndefined } from '@shared/modules/validate';
import type { AxiosRequestConfig } from 'axios';
import type { FastifyPluginAsync } from 'fastify';
import iconv from 'iconv-lite';
import JSON5 from 'json5';

import { checkM3u8, fixAdM3u8Ai } from './utils/m3u8';

const API_PREFIX = 'system';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}/health`,
    {
      schema: healthSchema,
    },
    async (_req, reply) => {
      try {
        const data = {
          timestamp: toUnix(),
          version: APP_VERSION,
        };
        return reply.code(200).send({ code: 0, msg: 'ok', data });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );

  fastify.get<{ Querystring: SystemIpQuery }>(
    `/${API_PREFIX}/ip`,
    {
      schema: ipSchema,
    },
    async (req, reply) => {
      try {
        const { preferIPv6 = true } = req.query;
        const resp = await getNetwork(preferIPv6);
        return reply.code(200).send({ code: 0, msg: 'ok', data: resp });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );

  fastify.post<{ Body: SystemReqBody }>(
    `/${API_PREFIX}/req`,
    {
      schema: reqSchema,
    },
    async (req, reply) => {
      try {
        const { encode, ...config } = req.body as unknown as { encode?: IReqEncode } & AxiosRequestConfig;

        if (!isNil(encode) && reqEncodes.includes(encode)) {
          const resp = await request.request({ ...config, responseType: 'arraybuffer' });
          resp.data = iconv.decode(Buffer.from(resp.data), encode);
          const res = { code: resp.status, data: resp.data, headers: resp.headers };
          return reply.code(200).send({ code: 0, msg: 'ok', data: res });
        } else {
          const resp = await request.request(config);
          const res = { code: resp.status, data: resp.data, headers: resp.headers };
          return reply.code(200).send({ code: 0, msg: 'ok', data: res });
        }
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );

  fastify.head<{ Querystring: SystemM3u8AdRemoveQuery }>(
    `/${API_PREFIX}/m3u8/adremove`,
    {
      schema: m3u8AdRemoveSchema,
    },
    async (req, reply) => {
      try {
        const { url } = req.query;

        if (!isHttp(url)) {
          return reply.code(400).send({ code: -1, msg: 'Invalid m3u8 URL', data: null });
        }

        const headers = Object.entries(convertHeaders(req.headers)).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (isUndefined(value) || isLocalhostURI(value)) return acc;
            acc[key] = value;
            return acc;
          },
          {},
        );

        try {
          if (!(await checkM3u8(url, headers))) {
            return reply.code(302).header('Location', url).send();
          }
          return reply.code(200).header('Content-Type', 'application/vnd.apple.mpegurl').send();
        } catch {}

        return reply.code(302).header('Location', url).send();
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send();
      }
    },
  );

  fastify.get<{ Querystring: SystemM3u8AdRemoveQuery }>(
    `/${API_PREFIX}/m3u8/adremove`,
    {
      schema: m3u8AdRemoveSchema,
      exposeHeadRoute: false,
    },
    async (req, reply) => {
      try {
        const { url } = req.query;

        if (!isHttp(url)) {
          return reply.code(400).send({ code: -1, msg: 'Invalid m3u8 URL', data: null });
        }

        const headers = Object.entries(convertHeaders(req.headers)).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (isUndefined(value) || isLocalhostURI(value)) return acc;
            acc[key] = value;
            return acc;
          },
          {},
        );

        try {
          if (!(await checkM3u8(url, headers))) {
            return reply.code(302).redirect(url);
          }

          const content = await fixAdM3u8Ai(url, headers);
          if (content && content.includes('.ts')) {
            return reply.code(200).header('Content-Type', 'application/vnd.apple.mpegurl').send(content);
          }
        } catch {}

        return reply.code(302).redirect(url);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );

  fastify.get<{ Querystring: SystemLogQuery }>(
    `/${API_PREFIX}/log`,
    {
      schema: logSchema,
    },
    async (req, reply) => {
      const { type: rawType = '', level = 'none' } = req.query as { type?: string; level?: LogLevel };

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
          const obj = JSON5.parse(line);
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
