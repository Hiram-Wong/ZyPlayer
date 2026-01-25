import { dbService } from '@main/services/DbService';
import {
  addSchema,
  deleteSchema,
  getDetailSchema,
  getDetailValueSchema,
  getListSchema,
  getSetupSchema,
  putSchema,
  putSourceSchema,
} from '@server/schemas/v1/setting';
import type { ISettingKey } from '@shared/config/tblSetting';
import { settingList as tblSetting, setupKeys } from '@shared/config/tblSetting';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'setting';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_PREFIX}`,
    { schema: addSchema },
    async (req: FastifyRequest<{ Body: { key: ISettingKey; value: any } }>) => {
      const { key, value } = req.body;
      const doc = { key, value };
      const dbRes = await dbService.setting.add(doc);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.delete(
    `/${API_PREFIX}`,
    { schema: deleteSchema },
    async (req: FastifyRequest<{ Body: { keys?: ISettingKey[] } | null }>) => {
      const { keys } = req.body || {};
      if (!keys || keys.length === 0) {
        await dbService.setting.clear();
      } else {
        await dbService.setting.remove(keys);
      }
      return { code: 0, msg: 'ok', data: null };
    },
  );

  fastify.put(
    `/${API_PREFIX}`,
    { schema: putSchema },
    async (req: FastifyRequest<{ Body: { key: ISettingKey; value: any } }>) => {
      const { key, value } = req.body;
      const doc = { key, value };
      const dbRes = await dbService.setting.update(doc);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(`/${API_PREFIX}/list`, { schema: getListSchema }, async () => {
    const dbRes = await dbService.setting.all();
    return { code: 0, msg: 'ok', data: dbRes };
  });

  fastify.get(`/${API_PREFIX}/setup`, { schema: getSetupSchema }, async () => {
    const dbRes = Object.fromEntries(
      await Promise.all(setupKeys.map(async (key) => [key, await dbService.setting.getValue(key)])),
    );
    return { code: 0, msg: 'ok', data: dbRes };
  });

  fastify.get(
    `/${API_PREFIX}/:key`,
    { schema: getDetailSchema },
    async (req: FastifyRequest<{ Params: { key: ISettingKey } }>) => {
      const { key } = req.params;
      const dbRes = await dbService.setting.get(key);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.get(
    `/${API_PREFIX}/value/:key`,
    { schema: getDetailValueSchema },
    async (req: FastifyRequest<{ Params: { key: ISettingKey } }>) => {
      const { key } = req.params;
      const dbRes = await dbService.setting.getValue(key);
      return { code: 0, msg: 'ok', data: dbRes };
    },
  );

  fastify.put(
    `/${API_PREFIX}/source`,
    { schema: putSourceSchema },
    async (req: FastifyRequest<{ Body: Record<ISettingKey, any> }>) => {
      // 1. Pre-generated Map for quick reading
      const destMap = new Map(Object.entries(req.body || {}));
      const settingMap = new Map(tblSetting.map((s) => [s.key, s.value]));

      const dbValue = await dbService.setting.all();

      // 2. Concurrency: updates or additions
      const upsertPromises: Promise<unknown>[] = [];
      for (const [key, fallback] of settingMap) {
        const value = destMap.get(key) ?? fallback;
        if (!Object.hasOwn(dbValue, key)) {
          upsertPromises.push(dbService.setting.add({ key, value }));
        } else if (dbValue[key] !== value) {
          upsertPromises.push(dbService.setting.update({ key, value }));
        }
      }
      await Promise.all(upsertPromises);

      // 3. Concurrency: removing redundant keys
      const toDelete = Object.keys(dbValue).filter((k) => !settingMap.has(k as ISettingKey));
      if (toDelete.length) {
        await dbService.setting.remove(toDelete as ISettingKey[]);
      }

      const dbRes = await dbService.setting.all();

      return { code: 0, msg: 'ok', data: dbRes };
    },
  );
};

export default api;
