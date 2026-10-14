import { dirname } from 'node:path';

import { createDir, fileDelete, pathExist, readFile, saveFile } from '@main/utils/file';
import { APP_FILE_PATH } from '@main/utils/path';
import type {
  AddFileBody,
  AddFileParams,
  DeleteFileParams,
  GetFileParams,
  PutFileBody,
  PutFileParams,
} from '@server/schemas/v1/file/manage';
import { addSchema, deleteSchema, getSchema, putSchema } from '@server/schemas/v1/file/manage';
import type { FastifyPluginAsync } from 'fastify';

import { resolveManagedPath } from './path';

const API_PREFIX = 'file/manage';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Params: AddFileParams; Body: AddFileBody }>(
    `/${API_PREFIX}/:type/*`,
    {
      schema: addSchema,
    },
    async (req, reply) => {
      try {
        const { '*': path } = req.params;
        const filePath = await resolveManagedPath(APP_FILE_PATH, path);
        const content = req.body;
        const basePath = dirname(filePath);

        const isExist = await pathExist(basePath);
        if (!isExist) {
          createDir(basePath);
        }

        const status = await saveFile(filePath, content);
        return reply.code(200).send({ code: 0, msg: 'ok', data: { success: status } });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );

  fastify.delete<{ Params: DeleteFileParams }>(
    `/${API_PREFIX}/:type/*`,
    {
      schema: deleteSchema,
    },
    async (req, reply) => {
      try {
        const { '*': path } = req.params;
        const filePath = await resolveManagedPath(APP_FILE_PATH, path);
        const status = await fileDelete(filePath);
        return reply.code(200).send({ code: 0, msg: 'ok', data: { success: status } });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );

  fastify.put<{ Params: PutFileParams; Body: PutFileBody }>(
    `/${API_PREFIX}/:type/*`,
    {
      schema: putSchema,
    },
    async (req, reply) => {
      try {
        const { '*': path } = req.params;
        const filePath = await resolveManagedPath(APP_FILE_PATH, path);
        const content = req.body;
        const basePath = dirname(filePath);

        const isExist = await pathExist(basePath);
        if (!isExist) {
          createDir(basePath);
        }

        const status = await saveFile(filePath, content);
        return reply.code(200).send({ code: 0, msg: 'ok', data: { success: status } });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );

  fastify.get<{ Params: GetFileParams }>(
    `/${API_PREFIX}/:type/*`,
    {
      schema: getSchema,
    },
    async (req, reply) => {
      try {
        const { '*': path } = req.params;
        const filePath = await resolveManagedPath(APP_FILE_PATH, path);
        const content = await readFile(filePath);
        return reply.code(200).send(content);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ code: -1, msg: (error as Error).message, data: null });
      }
    },
  );
};

export default api;
