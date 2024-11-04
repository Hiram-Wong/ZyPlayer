import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { join, relative, basename, extname, dirname } from 'path';
import {
  APP_STORE_PATH,
  fileExist,
  fileState,
  readFile,
  saveFile,
  deleteFile,
  readDir,
  deleteDir,
} from '@main/utils/hiker/file';

const API_PREFIX = 'api/v1/file';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete(`/${API_PREFIX}/*`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const fileName = req.params['*'];
    const exists = await fileExist(fileName);

    if (exists) {
      const stat = await fileState(fileName);
      if (stat === 'dir') await deleteFile(fileName);
      else if (stat === 'file') await deleteDir(fileName);
      return {
        code: 0,
        msg: 'ok',
        data: null,
      };
    } else {
      return {
        code: -1,
        msg: 'file not found',
        data: null,
      };
    }
  });
  fastify.get(`/${API_PREFIX}/*`, async (req: FastifyRequest<{ Params: { [key: string]: string } }>) => {
    const pathLib = {
      join,
      dirname,
      readDir: readDir,
      readFile: readFile,
      stat: fs.statSync,
    }; // 注入给index.js文件main函数里使用

    const fileName = req.params['*'];
    const exists = await fileExist(fileName);

    let response: any = '';
    if (exists) {
      const stats = await fileState(fileName);
      if (stats === 'dir') {
        const indexPath = join(fileName, './index.js');
        const indexStats = await fileState(indexPath);

        if (indexStats === 'file') {
          const content = await readFile(indexPath);
          try {
            const path_dir = dirname(indexPath);
            const func = new Function('pathLib', 'path_dir', `${content}\n return main;`);
            // response = await eval(content + '\nmain()');
            response = await func(pathLib, path_dir)();
            await saveFile(indexPath.replace('index.js', 'index.json'), response);
          } catch (err: any) {
            return {
              code: -1,
              msg: err.message,
              data: null,
            };
          }
        } else {
          return {
            code: -1,
            msg: 'index.js not found',
            data: null,
          };
        }
      } else if (stats === 'file') {
        response = await readFile(fileName);
      }
      return response;
    } else {
      return {
        code: -1,
        msg: 'file not found',
        data: null,
      };
    }
  });
  fastify.get(`/${API_PREFIX}/config`, async () => {
    const doc: { [key: string]: any[] } = {
      sites: [],
    };

    const walk = async (directoryPath: string, rootDirectory: string) => {
      const stat = await fileState(directoryPath);
      if (stat === 'dir') {
        const files = await readDir(directoryPath);

        for (const file of files) {
          const filePath = join(directoryPath, file);
          const stat = await fileState(filePath);

          if (stat === 'dir') {
            await walk(filePath, rootDirectory);
          } else if (stat === 'file') {
            if (/\.js(?:\?.*)?$/.test(filePath)) {
              const relativePath = relative(rootDirectory, filePath);
              const fileName = basename(relativePath, extname(relativePath));

              doc.sites.push({
                id: uuidv4(),
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
      }
    };

    await walk(APP_STORE_PATH, APP_STORE_PATH);

    return doc;
  });
};

export default api;
