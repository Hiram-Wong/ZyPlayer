import { Schema } from '@main/types/server';
import { siteTypes } from '@shared/config/film';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[film]site';

const baseItemSchema = Type.Object({
  id: Type.String({ description: 'id' }),
  key: Type.String({ description: 'key' }),
  name: Type.Union([Type.String(), Type.Null()], { description: 'name' }),
  api: Type.String({ description: 'api' }),
  playUrl: Type.Union([Type.String(), Type.Null()], { description: 'play parse json url' }),
  search: Type.Boolean({ description: 'search' }),
  group: Type.Union([Type.String(), Type.Null()], { description: 'group' }),
  type: Type.Integer({ format: 'int32', enum: siteTypes, description: 'type' }),
  ext: Type.Union([Type.String(), Type.Record(Type.String(), Type.String()), Type.Null()], { description: 'ext' }),
  categories: Type.Union([Type.String(), Type.Null()], { description: 'categories' }),
  isActive: Type.Boolean({ description: 'active status' }),
  createdAt: Type.Integer({ format: 'int64', description: 'created timestamp' }),
  updatedAt: Type.Integer({ format: 'int64', description: 'updated timestamp' }),
});

const inputItemSchema = Type.Partial(Type.Omit(baseItemSchema, ['id', 'createdAt', 'updatedAt']));

const putItemSchema = Type.Partial(baseItemSchema);

export const outputItemSchema = baseItemSchema;

export const addSchema = {
  tags: [API_PREFIX],
  summary: 'Add data',
  description: 'Add a new data.',
  body: inputItemSchema,
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
  description: 'Delete data by id or type, if id and type is empty, delete all.',
  body: Type.Object({
    id: Type.Optional(Type.Array(Type.String(), { description: 'data id' })),
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
    id: Type.Array(Type.String(), { description: 'updated data id' }),
    doc: putItemSchema,
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(outputItemSchema), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const pageSchema = {
  tags: [API_PREFIX],
  summary: 'Get list',
  description: 'Get list with pagination and filtering.',
  querystring: Type.Object({
    page: Type.Integer({ format: 'int32', description: 'page number' }),
    pageSize: Type.Integer({ format: 'int32', description: 'page size' }),
    kw: Type.Optional(Type.String({ description: 'search keyword' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        list: Type.Optional(Type.Array(outputItemSchema)),
        total: Type.Optional(Type.Integer({ format: 'int32' })),
        default: Type.Optional(Type.String()),
        group: Type.Optional(Type.Array(Type.Object({ label: Type.String(), value: Type.String() }))),
      }),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getActiveSchema = {
  tags: [API_PREFIX],
  summary: 'Get active',
  description: 'Get active data.',
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        list: Type.Optional(Type.Array(outputItemSchema)),
        default: Type.Optional(outputItemSchema),
        extra: Type.Optional(
          Type.Object({
            group: Type.Optional(Type.Array(Type.Object({ label: Type.String(), value: Type.String() }))),
            filter: Type.Optional(Type.Boolean()),
            search: Type.Optional(Type.String()),
          }),
        ),
      }),
      { description: 'Successful Operation' },
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
  description: 'Get detail by id.',
  params: Type.Object({
    id: Type.String({ description: 'data id' }),
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

export const getDetailByKeySchema = {
  tags: [API_PREFIX],
  summary: 'Get detail',
  description: 'Get detail by key.',
  params: Type.Object({
    key: Type.String({ description: 'data key' }),
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

export const setDefaultSchema = {
  tags: [API_PREFIX],
  summary: 'Set default',
  description: 'Set default by id.',
  params: Type.Object({
    id: Type.String({ description: 'data id' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Boolean(), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
