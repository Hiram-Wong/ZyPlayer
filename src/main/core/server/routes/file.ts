import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import fs from 'fs-extra';
import { app } from 'electron';
import { nanoid } from 'nanoid';
import { join, relative, basename, extname, dirname } from 'path';

const API_VERSION = 'api/v1';
const BASE_PATH = join(app.getPath('userData'), 'file'); // 文件路径

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete(
    `/${API_VERSION}/file/:filename(.*)`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
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
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(
    `/${API_VERSION}/file/*`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      // 注入给index.js文件main函数里使用
      const pathLib = {
        join,
        dirname,
        readDir: fs.readdirSync,
        readFile: fs.readFileSync,
        stat: fs.statSync,
      };
      try {
        // @ts-ignore
        const filename = req.params['*'];
        let path = join(BASE_PATH, filename);
        const exists = await fs.pathExists(path);
        let content = '';
        if (exists) {
          if (pathLib.stat(path).isDirectory()) {
            path = pathLib.join(path, './index.js');
            content = await fs.readFile(path, 'utf8');
          } else {
            content = await fs.readFile(path, 'utf8');
          }
          const path_dir = dirname(path);
          let response: string = '';
          if (path.endsWith('index.js')) {
            console.log('path_dir:', path_dir);
            try {
              response = await eval(content + '\nmain()');
            } catch (e) {
              response = `发生了错误:${e.message}}`;
            }
          } else {
            response = content;
          }
          reply.code(200).send(response);
        } else {
          reply.code(404).send({ error: 'File not found' });
        }
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(`/${API_VERSION}/file/config`, async (_, reply: FastifyReply) => {
    try {
      const doc: any = {
        sites: [],
      };

      const walk = async (directoryPath: string, rootDirectory: string) => {
        const files = await fs.readdir(directoryPath);

        for (const file of files) {
          const filePath = join(directoryPath, file);
          const stats = await fs.stat(filePath);

          if (stats.isDirectory()) {
            await walk(filePath, rootDirectory);
          } else {
            if (/\.js(?:\?.*)?$/.test(filePath)) {
              const relativePath = relative(rootDirectory, filePath);
              const fileName = basename(relativePath, extname(relativePath));

              doc.sites.push({
                key: nanoid(),
                name: fileName,
                type: 3,
                api: `http://127.0.0.1:9978/api/v1/file/${relativePath}`,
                searchable: 1,
                quickSearch: 0,
                filterable: 1,
                ext: `./${relativePath}`,
              });
            }
          }
        }
      };

      await walk(BASE_PATH, BASE_PATH);

      reply.code(200).send(doc);
    } catch (err) {
      reply.code(500).send(err);
    }
  });
};

export default api;
