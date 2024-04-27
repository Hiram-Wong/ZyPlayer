import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import fs from 'fs-extra';
import { app } from 'electron';
import { join } from "path";

const API_VERSION = "api/v1";
const BASE_PATH = join(app.getPath("userData"), 'file'); // 文件路径 

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete(`/${API_VERSION}/file/:filename(.*)`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      // @ts-ignore
      const filename = req.params['*'];
      const path = join(BASE_PATH, filename);

      const exists = await fs.pathExists(path);
      if (exists) {
        await fs.unlink(path);
        reply.code(200).send({ message: 'File deleted successfully' });
      } else {
        reply.code(404).send({ error: 'File not found' });
      }
    } catch (err) {
      reply.code(500).send(err)
    }
  });
  fastify.get(`/${API_VERSION}/file/*`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      // @ts-ignore
      const filename = req.params['*'];
      const path = join(BASE_PATH, filename);

      const exists = await fs.pathExists(path);
      if (exists) {
        const content = await fs.readFile(path, 'utf8');
        reply.code(200).send(content);
      } else {
        reply.code(404).send({ error: 'File not found' });
      }
    } catch (err) {
      reply.code(500).send(err)
    }
  });
}

export default api;