import { tableNames } from '@main/services/DbService/schemas';
import { Schema } from '@main/types/server';
import { dataImportTypes, dataPages, dataPutTypes, dataRemoteTypes } from '@shared/config/data';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[data]db';

export const clearSchema = {
  tags: [API_PREFIX],
  summary: 'Clear data',
  description: 'Clear data, if provided type, only clear the specified type.',
  body: Type.Object({
    type: Type.Optional(
      Type.Array(Type.String({ enum: [...tableNames, ...dataPages, 'cache'] }), {
        description: 'table name or other type',
      }),
    ),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Boolean(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const exportSchema = {
  tags: [API_PREFIX],
  summary: 'Export data',
  description: 'Export data, if provided type, only export the specified type.',
  body: Type.Object({
    type: Type.Optional(
      Type.Array(Type.String({ enum: [...tableNames, ...dataPages] }), {
        description: 'table name',
      }),
    ),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Record(Type.String({ enum: tableNames }), Type.Any()), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const importSchema = {
  tags: [API_PREFIX],
  summary: 'Import data',
  description: 'Import data.',
  body: Type.Object({
    api: Type.String({ description: 'api' }),
    putType: Type.String({ enum: dataPutTypes, description: 'put type' }),
    importType: Type.String({ enum: dataImportTypes, description: 'import type' }),
    remoteType: Type.String({ enum: dataRemoteTypes, description: 'remote type' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Boolean(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
