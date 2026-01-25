import { Schema } from '@main/types/server';
import { settingKeys, setupKeys } from '@shared/config/tblSetting';
import type { TLiteral } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../base';

const API_PREFIX = '[setting]work';

const baseItemSchema = Type.Object({
  id: Type.String({ description: 'id' }),
  key: Type.String({ description: 'key' }),
  value: Type.Any({ description: 'value' }),
  createdAt: Type.Integer({ format: 'int64', description: 'created timestamp' }),
  updatedAt: Type.Integer({ format: 'int64', description: 'updated timestamp' }),
});

const outputItemSchema = baseItemSchema;

export const addSchema = {
  tags: [API_PREFIX],
  summary: 'Add data',
  description: 'Add a new data.',
  body: Type.Object({
    key: Type.String({ enum: settingKeys, description: 'key' }),
    value: Type.Any({ description: 'value' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(outputItemSchema), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const deleteSchema = {
  tags: [API_PREFIX],
  summary: 'Delete data',
  description: 'Delete data by keys, if keys is empty, delete all.',
  body: Type.Object({
    keys: Type.Optional(Type.Array(Type.String(), { description: 'data ids' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Null(), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const putSchema = {
  tags: [API_PREFIX],
  summary: 'Set data',
  description: 'Set data.',
  body: Type.Object({
    key: Type.String({ enum: settingKeys, description: 'key' }),
    value: Type.Any({ description: 'value' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(outputItemSchema), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getSetupSchema = {
  tags: [API_PREFIX],
  summary: 'Get setup',
  description: 'Get setup.',
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Partial(
        Type.Record(
          Type.Union(setupKeys.map((k) => Type.Literal(k)) as TLiteral<(typeof setupKeys)[number]>[]),
          Type.Any(),
        ),
      ),
      {
        description: 'Successful Operation',
      },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getListSchema = {
  tags: [API_PREFIX],
  summary: 'Get list',
  description: 'Get list.',
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Partial(
        Type.Record(
          Type.Union(settingKeys.map((k) => Type.Literal(k)) as TLiteral<(typeof settingKeys)[number]>[]),
          Type.Any(),
        ),
      ),
      {
        description: 'Successful Operation',
      },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getDetailSchema = {
  tags: [API_PREFIX],
  summary: 'Get detail',
  description: 'Get detail by key.',
  params: Type.Object({
    key: Type.String({ enum: settingKeys, description: 'key' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(outputItemSchema, {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getDetailValueSchema = {
  tags: [API_PREFIX],
  summary: 'Get detail',
  description: 'Get detail by key.',
  params: Type.Object({
    key: Type.String({ enum: settingKeys, description: 'key' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Any(), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const putSourceSchema = {
  tags: [API_PREFIX],
  summary: 'Set all data',
  description: 'Set all data.',
  body: Type.Partial(
    Type.Record(
      Type.Union(settingKeys.map((k) => Type.Literal(k)) as TLiteral<(typeof settingKeys)[number]>[]),
      Type.Any(),
    ),
    { description: 'settings' },
  ),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Partial(
        Type.Record(
          Type.Union(settingKeys.map((k) => Type.Literal(k)) as TLiteral<(typeof settingKeys)[number]>[]),
          Type.Any(),
        ),
      ),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
