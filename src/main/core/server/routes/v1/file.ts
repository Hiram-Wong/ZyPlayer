import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import fs from 'fs-extra';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { join, relative, basename, extname, dirname } from 'path';

const API_VERSION = 'api/v1';
const BASE_PATH = join(app.getPath('userData'), 'file'); // 文件路径

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete(
    `/${API_VERSION}/file/*`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const fileName = (req.params as { '*': string })['*'];
        const filePath = join(BASE_PATH, fileName);
        const exists = await fs.pathExists(filePath);

        if (exists) {
          await fs.unlink(filePath);
          reply.code(200).send({ code: 200, msg: 'file deleted successfully' });
        } else {
          reply.code(404).send({ code: 404, msg: 'file not found' });
        }
      } catch (err) {
        reply.code(500).send({ code: 500, msg: err });
      }
    },
  );
  fastify.get(
    `/${API_VERSION}/file/*`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      const pathLib = {
        join,
        dirname,
        readDir: fs.readdirSync,
        readFile: fs.readFileSync,
        stat: fs.statSync,
      }; // 注入给index.js文件main函数里使用

      try {
        const fileName = (req.params as { '*': string })['*'];
        const filePath = join(BASE_PATH, fileName);
        const exists = await fs.pathExists(filePath);

        let response = '';
        if (exists) {
          const stats = await fs.statSync(filePath);
          if (stats.isDirectory()) {
            const indexPath = join(filePath, './index.js');
            const indexStats = await fs.statSync(indexPath);

            if (indexStats.isFile()) {
              const content = await fs.readFile(indexPath, 'utf8');
              try {
                const path_dir = dirname(indexPath);
                const func = new Function('pathLib', 'path_dir', `${content}\n return main;`);
                // response = await eval(content + '\nmain()');
                response = await func(pathLib, path_dir)();
                await fs.writeFile(indexPath.replace('index.js', 'index.json'), response, 'utf-8');
              } catch (err) {
                response = `Error: ${(err as Error).message}`;
                return reply.code(500).send(response);
              }
            } else {
              return reply.code(404).send({ code: 404, msg: 'index.js not found' });
            }
          } else if (stats.isFile()) {
            response = await fs.readFile(filePath, 'utf8');
          }
          reply.code(200).send(response);
        } else {
          reply.code(404).send({ code: 404, msg: 'file not found' });
        }
      } catch (err) {
        reply.code(500).send({ code: 500, msg: err });
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
                key: uuidv4(),
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
      reply.code(500).send({ code: 500, msg: err });
    }
  });
};

export default api;
