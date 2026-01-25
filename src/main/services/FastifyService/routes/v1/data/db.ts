import { dbService } from '@main/services/DbService';
import { fileStorage } from '@main/services/FileStorage';
import { clearSchema, exportSchema, importSchema } from '@server/schemas/v1/data/db';
import type { IDataImportType, IDataPage, IDataPutType, IDataRemoteType } from '@shared/config/data';
import { DATA_PAGE, DATA_PUT_TYPE, DATA_TABLE_PAGE } from '@shared/config/data';
import { isArrayEmpty } from '@shared/modules/validate';
import type { ITableName } from '@shared/types/db';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { convertToStandard } from './utils/data';

const API_PREFIX = 'data/db';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.delete(
    `/${API_PREFIX}/clear`,
    { schema: clearSchema },
    async (req: FastifyRequest<{ Body: { type?: (ITableName | IDataPage | 'cache')[] } }>) => {
      const { type = [] } = req.body;

      const TABLE_NAMES = dbService.tableNames;
      const tables = type.filter((t) => TABLE_NAMES.includes(t as ITableName));
      if (type.includes(DATA_PAGE.FILM)) tables.push(...DATA_TABLE_PAGE.FILM);
      if (type.includes(DATA_PAGE.LIVE)) tables.push(...DATA_TABLE_PAGE.LIVE);
      if (type.includes(DATA_PAGE.MOMENT)) tables.push(...DATA_TABLE_PAGE.MOMENT);
      if (type.includes(DATA_PAGE.PARSE)) tables.push(...DATA_TABLE_PAGE.PARSE);
      const others = type.filter((t) => !TABLE_NAMES.includes(t as ITableName));

      const otherActions: Record<string, () => Promise<void>> = {
        cache: async () => {
          await fileStorage.clearTempCache();
        },
      };

      if (!isArrayEmpty(tables)) await dbService.db.clear(tables as ITableName[]);
      await Promise.all(others.filter((t) => t in otherActions).map((t) => otherActions[t]()));

      return { code: 0, msg: 'ok', data: true };
    },
  );

  fastify.post(
    `/${API_PREFIX}/export`,
    { schema: exportSchema },
    async (req: FastifyRequest<{ Body: { type?: (ITableName | IDataPage)[] } }>) => {
      const { type = [] } = req.body;

      const TABLE_NAMES = dbService.tableNames;
      const tables = type.filter((t) => TABLE_NAMES.includes(t as ITableName));
      if (type.includes(DATA_PAGE.FILM)) tables.push(...DATA_TABLE_PAGE.FILM);
      if (type.includes(DATA_PAGE.LIVE)) tables.push(...DATA_TABLE_PAGE.LIVE);
      if (type.includes(DATA_PAGE.MOMENT)) tables.push(...DATA_TABLE_PAGE.MOMENT);
      if (type.includes(DATA_PAGE.PARSE)) tables.push(...DATA_TABLE_PAGE.PARSE);

      const res = await dbService.db.all(tables as ITableName[]);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.post(
    `/${API_PREFIX}/import`,
    { schema: importSchema },
    async (
      req: FastifyRequest<{
        Body: {
          api: string;
          putType: IDataPutType;
          importType: IDataImportType;
          remoteType: IDataRemoteType;
          url: string;
        };
      }>,
    ) => {
      const { api, putType, importType, remoteType } = req.body;
      const method = putType === DATA_PUT_TYPE.ADDITIONAL ? 'add' : 'set';

      const data = await convertToStandard(importType, remoteType, api);
      if (putType === DATA_PUT_TYPE.ADDITIONAL) delete data.setting;

      const ops = (Object.keys(data) as ITableName[]).map((t) => dbService[t][method](data[t] as any));
      const res = await Promise.allSettled(ops);

      const ststus = res.filter((r) => r.status === 'rejected').length === 0;
      return { code: 0, msg: 'ok', data: ststus };
    },
  );
};

export default api;
