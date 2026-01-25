import { basename, dirname, extname, join } from 'node:path';

import {
  fileState,
  fileStateSync,
  pathExist,
  readDirFaster,
  readDirSync,
  readFile,
  readFileSync,
  saveFile,
} from '@main/utils/file';
import { APP_FILE_PATH } from '@main/utils/path';
import { autoSchema, makeSchema } from '@server/schemas/v1/file/film';
import { randomUUID } from '@shared/modules/crypto';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'file/film';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    `/${API_PREFIX}/auto/:type/*`,
    { schema: autoSchema },
    async (req: FastifyRequest<{ Params: { type: 'system' | 'file'; '*': string } }>) => {
      const { type = 'file', '*': path } = req.params || {};
      const filePath = type === 'file' ? join(APP_FILE_PATH, path) : path;

      const files = await readDirFaster(filePath, 3, (path, _isDirectory) => {
        return !/\.(?:js|py)(?:\?.*)?$/.test(path);
      });

      const matchApi = (ext: string, path: string) => {
        if (ext === '.js') {
          return 'https://raw.githubusercontent.com/hjdhnx/drpy-webpack/refs/heads/main/src/drpy2.min.js';
        }
        if (ext === '.py') return `http://127.0.0.1:9978/api/v1/file/manage/${type}/${path}`;
        return '';
      };
      const matchExt = (ext: string, path: string) => {
        if (ext === '.js') {
          return `http://127.0.0.1:9978/api/v1/file/manage/${type}/${path}`;
        }
        if (ext === '.py') return '';
        return '';
      };

      const sites = files.map((path) => {
        const uuid = randomUUID();

        const fullName = basename(path);
        const ext = extname(fullName);
        const name = basename(fullName, ext);

        const relativePath = type === 'file' ? path.replace(`${APP_FILE_PATH}/`, '') : path;

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
      const res = { sites };

      return res;
    },
  );

  fastify.get(
    `/${API_PREFIX}/make/:type/*`,
    { schema: makeSchema },
    async (req: FastifyRequest<{ Params: { type: 'system' | 'file'; '*': string } }>) => {
      const { type = 'file', '*': path } = req.params || {};
      const filePath = type === 'file' ? join(APP_FILE_PATH, path) : path;

      const exists = await pathExist(filePath);
      if (!exists) {
        return {};
      }

      const state = await fileState(filePath);
      if (state !== 'dir' && state !== 'file') {
        return {};
      }

      const indexPath = join(filePath, 'index.js');
      const jsonPath = join(filePath, 'index.json');

      const indexState = await fileState(indexPath);
      if (indexState === 'file') {
        const content = await readFile(indexPath);

        // eslint-disable-next-line no-new-func
        const func = new Function('pathLib', 'path_dir', `${content}\n return main;`);
        const fn = func(
          {
            join,
            dirname,
            readDir: readDirSync,
            readFile: readFileSync,
            stat: fileStateSync,
          },
          filePath,
        );
        const resp = await fn();

        await saveFile(join(filePath, 'index.json'), resp);
      }

      const jsonState = await fileState(jsonPath);
      if (jsonState === 'file') {
        const content = await readFile(jsonPath);
        return content;
      }

      return {};
    },
  );
};

export default api;
