import { basename, extname, relative } from 'node:path';

import { fileState, pathExist, readDirFaster, readFile } from '@main/utils/file';
import { APP_FILE_PATH } from '@main/utils/path';
import type { TvboxAutoParams, TvboxMakeParams } from '@server/schemas/v1/file/tvbox';
import { autoSchema, makeSchema } from '@server/schemas/v1/file/tvbox';
import { PREFIX_API } from '@shared/config/env';
import { randomUUID } from '@zy/crypto';
import type { FastifyPluginAsync } from 'fastify';

import { resolveManagedPath } from './path';

const API_PREFIX = 'file/film';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Params: TvboxAutoParams }>(
    `/${API_PREFIX}/auto/:type/*`,
    {
      schema: autoSchema,
    },
    async (req, reply) => {
      try {
        const { '*': path } = req.params;
        const filePath = await resolveManagedPath(APP_FILE_PATH, path);

        const files = await readDirFaster(filePath, 3, (path, _isDirectory) => {
          return !/\.(?:js|py)(?:\?.*)?$/.test(path);
        });

        const matchApi = (ext: string, path: string) => {
          if (ext === '.js') {
            return 'https://raw.githubusercontent.com/hjdhnx/drpy-webpack/refs/heads/main/src/drpy2.min.js';
          }
          if (ext === '.py') return `${PREFIX_API}/v1/file/manage/file/${path}`;
          return '';
        };
        const matchExt = (ext: string, path: string) => {
          if (ext === '.js') {
            return `${PREFIX_API}/v1/file/manage/file/${path}`;
          }
          if (ext === '.py') return '';
          return '';
        };

        const sites = files.map((path) => {
          const uuid = randomUUID();

          const fullName = basename(path);
          const ext = extname(fullName);
          const name = basename(fullName, ext);

          const relativePath = relative(APP_FILE_PATH, path).replaceAll('\\', '/');

          return {
            id: uuid,
            key: uuid,
            name,
            type: 3,
            api: matchApi(ext, relativePath),
            searchable: 1,
            quickSearch: 0,
            filterable: 1,
            ext: matchExt(ext, relativePath),
          };
        });

        return reply.code(200).send({ sites });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );

  fastify.get<{ Params: TvboxMakeParams }>(
    `/${API_PREFIX}/make/:type/*`,
    {
      schema: makeSchema,
    },
    async (req, reply) => {
      try {
        const { '*': path } = req.params;
        const filePath = await resolveManagedPath(APP_FILE_PATH, path);

        const exists = await pathExist(filePath);
        if (!exists) {
          return reply.code(200).send({});
        }

        const state = await fileState(filePath);
        if (state !== 'dir' && state !== 'file') {
          return reply.code(200).send({});
        }

        const jsonPath = state === 'dir' ? await resolveManagedPath(APP_FILE_PATH, `${path}/index.json`) : filePath;
        const jsonState = await fileState(jsonPath);
        if (jsonState === 'file' && extname(jsonPath).toLowerCase() === '.json') {
          const content = await readFile(jsonPath);
          return reply.code(200).send(content);
        }

        return reply.code(200).send({});
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );
};

export default api;
