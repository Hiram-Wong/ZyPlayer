import { dirname, join } from 'node:path';

import { createDir, fileDelete, pathExist, readFile, saveFile } from '@main/utils/file';
import { APP_FILE_PATH } from '@main/utils/path';
import { addSchema, deleteSchema, getSchema, putSchema } from '@server/schemas/v1/file/manage';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'file/manage';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_PREFIX}/:type/*`,
    { schema: addSchema },
    async (req: FastifyRequest<{ Params: { type: 'system' | 'file'; '*': string }; Body: string }>) => {
      const { type = 'file', '*': path } = req.params || {};
      const filePath = type === 'file' ? join(APP_FILE_PATH, path) : path;
      const content = req.body;

      const basePath = dirname(filePath);

      const isExist = await pathExist(basePath);
      if (!isExist) {
        createDir(basePath);
      }

      const status = await saveFile(filePath, content);

      return { code: 0, msg: 'ok', data: status };
    },
  );

  fastify.delete(
    `/${API_PREFIX}/:type/*`,
    { schema: deleteSchema },
    async (req: FastifyRequest<{ Params: { type: 'system' | 'file'; '*': string }; Body: string }>) => {
      const { type = 'file', '*': path } = req.params || {};
      const filePath = type === 'file' ? join(APP_FILE_PATH, path) : path;

      const status = await fileDelete(filePath);
      return { code: 0, msg: 'ok', data: status };
    },
  );

  fastify.put(
    `/${API_PREFIX}/:type/*`,
    { schema: putSchema },
    async (req: FastifyRequest<{ Params: { type: 'system' | 'file'; '*': string }; Body: string }>) => {
      const { type = 'file', '*': path } = req.params || {};
      const filePath = type === 'file' ? join(APP_FILE_PATH, path) : path;
      const content = req.body;

      const basePath = dirname(filePath);

      const isExist = await pathExist(basePath);
      if (!isExist) {
        createDir(basePath);
      }

      const status = await saveFile(filePath, content);

      return { code: 0, msg: 'ok', data: status };
    },
  );

  fastify.get(
    `/${API_PREFIX}/:type/*`,
    { schema: getSchema },
    async (req: FastifyRequest<{ Params: { type: 'system' | 'file'; '*': string } }>) => {
      const { type = 'file', '*': path } = req.params || {};
      const filePath = type === 'file' ? join(APP_FILE_PATH, path) : path;

      const content = await readFile(filePath);
      return content;
    },
  );
};

export default api;
