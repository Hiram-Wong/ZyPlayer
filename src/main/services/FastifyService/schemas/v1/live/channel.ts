import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[live]channel';

const baseItemSchema = Type.Object({
  id: Type.String({ description: 'id' }),
  name: Type.Union([Type.String(), Type.Null()], { description: 'name' }),
  api: Type.String({ description: 'api' }),
  logo: Type.Union([Type.String(), Type.Null()], { description: 'logo' }),
  playback: Type.Union([Type.String(), Type.Null()], { description: 'playback' }),
  group: Type.Union([Type.String(), Type.Null()], { description: 'group' }),
  createdAt: Type.Integer({ format: 'int64', description: 'created timestamp' }),
  updatedAt: Type.Integer({ format: 'int64', description: 'updated timestamp' }),
});

const inputItemSchema = Type.Partial(Type.Omit(baseItemSchema, ['id', 'createdAt', 'updatedAt']));

const putItemSchema = Type.Partial(baseItemSchema);

const outputItemSchema = baseItemSchema;

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
    group: Type.Optional(Type.String({ description: 'search group' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        list: Type.Optional(Type.Array(outputItemSchema)),
        total: Type.Optional(Type.Integer({ format: 'int32' })),
        class: Type.Optional(Type.Array(Type.Object({ label: Type.String(), value: Type.String() }))),
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

export const getEpgSchema = {
  tags: [API_PREFIX],
  summary: 'Get epg',
  description: 'Get epg by channel and date.',
  querystring: Type.Object({
    ch: Type.String({ description: 'data channel' }),
    date: Type.Optional(Type.String({ format: 'date', description: 'data date' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Array(
        Type.Object({
          start: Type.String({ pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', description: 'start time' }),
          desc: Type.Optional(Type.String({ description: 'data description' })),
          end: Type.String({ pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', description: 'end time' }),
          title: Type.String({ description: 'data title' }),
        }),
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
