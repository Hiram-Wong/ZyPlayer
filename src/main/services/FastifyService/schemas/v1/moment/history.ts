import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[moment]history';

const baseItemSchema = Type.Object({
  id: Type.String({ description: 'id' }),
  type: Type.Integer({ format: 'int32', enum: [1, 2, 3, 5, 6, 7], description: 'type' }),
  relateId: Type.String({ description: 'relate id' }),
  siteSource: Type.Union([Type.String(), Type.Null()], { description: 'site source' }),
  playEnd: Type.Boolean({ description: 'watch end' }),
  videoId: Type.String({ description: 'video id' }),
  videoImage: Type.Union([Type.String(), Type.Null()], { description: 'video image' }),
  videoName: Type.Union([Type.String(), Type.Null()], { description: 'video name' }),
  videoIndex: Type.Union([Type.String(), Type.Null()], { description: 'video index' }),
  watchTime: Type.Union([Type.Number({ format: 'float' }), Type.Null()], { description: 'watch time' }),
  duration: Type.Union([Type.Number({ format: 'float' }), Type.Null()], { description: 'video duration' }),
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
  body: Type.Partial(
    Type.Object({
      id: Type.Optional(Type.Array(Type.String(), { description: 'data id' })),
      type: Type.Optional(
        Type.Array(Type.Integer({ format: 'int32', enum: [1, 2, 3, 5, 6, 7] }), { description: 'search type' }),
      ),
    }),
  ),
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
    type: Type.Optional(
      Type.Array(Type.Integer({ format: 'int32', enum: [1, 2, 3, 5, 6, 7] }), { description: 'search type' }),
    ),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        list: Type.Optional(
          Type.Array(
            Type.Intersect([
              outputItemSchema,
              Type.Object({
                relateSite: Type.Any({ description: 'relate info' }),
              }),
            ]),
          ),
        ),
        total: Type.Optional(Type.Integer({ format: 'int32' })),
      }),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const findDetailSchema = {
  tags: [API_PREFIX],
  summary: 'Get detail',
  description: 'Get detail by joint parameterization.',
  querystring: Type.Object({
    relateId: Type.String({ description: 'relate id' }),
    videoId: Type.String({ description: 'video id' }),
    type: Type.Optional(Type.Integer({ format: 'int32', enum: [1, 2, 3, 5, 6, 7], description: 'type' })),
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
