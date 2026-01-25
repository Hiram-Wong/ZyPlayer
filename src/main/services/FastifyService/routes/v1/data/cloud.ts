import { dbService } from '@main/services/DbService';
import { backupSchema, resumeSchema } from '@server/schemas/v1/data/cloud';
import type { FastifyPluginAsync } from 'fastify';

const API_PREFIX = 'data/cloud';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/backup`, { schema: backupSchema }, async () => {
    const cloudConf = await dbService.setting.getValue('cloud');
    const { sync: _sync, type, ...options } = cloudConf || {};

    const status = await dbService.cloudBackup(type, options);
    return { code: 0, msg: 'ok', data: status };
  });

  fastify.get(`/${API_PREFIX}/resume`, { schema: resumeSchema }, async () => {
    const cloudConf = await dbService.setting.getValue('cloud');
    const { sync: _sync, type, ...options } = cloudConf || {};

    const status = await dbService.cloudResume(type, options);
    return { code: 0, msg: 'ok', data: status };
  });
};

export default api;
