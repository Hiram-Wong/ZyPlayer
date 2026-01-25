import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../base';

const API_PREFIX = '[plugin]work';

const baseItemSchema = Type.Object({
  id: Type.String({ description: 'id' }),
  type: Type.Integer({ format: 'int32', enum: [1, 2, 3], description: 'type' }),
  name: Type.String({ description: 'plugin name' }),
  pluginName: Type.String({ description: 'plugin readable name' }),
  author: Type.String({ description: 'author' }),
  description: Type.String({ description: 'description' }),
  readme: Type.String({ description: 'readme' }),
  base: Type.String({ description: 'work path' }),
  main: Type.String({ description: 'main' }),
  web: Type.String({ description: 'web' }),
  version: Type.String({ description: 'version' }),
  logo: Type.String({ description: 'logo' }),
  homepage: Type.String({ description: 'homepage' }),
  isActive: Type.Boolean({ description: 'run status' }),
  createdAt: Type.Integer({ format: 'int64', description: 'created timestamp' }),
  updatedAt: Type.Integer({ format: 'int64', description: 'updated timestamp' }),
});

const outputItemSchema = baseItemSchema;

export const pageSchema = {
  tags: [API_PREFIX],
  summary: 'Get list',
  description: 'Get list with pagination and filtering.',
  querystring: Type.Object({
    page: Type.Integer({ format: 'int32', description: 'page number' }),
    pageSize: Type.Integer({ format: 'int32', description: 'page size' }),
    kw: Type.Optional(Type.String({ description: 'search keyword' })),
    type: Type.Optional(Type.Integer({ format: 'int32', enum: [1, 2, 3], description: 'search type' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        list: Type.Optional(Type.Array(baseItemSchema)),
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

export const installSchema = {
  tags: [API_PREFIX],
  summary: 'Install plugin',
  description: 'Install plugin by project path.',
  body: Type.Object({
    id: Type.Array(Type.String(), { description: 'install data path' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(outputItemSchema), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const uninstallSchema = {
  tags: [API_PREFIX],
  summary: 'Uninstall plugin',
  description: 'Uninstall plugin by id.',
  body: Type.Object({
    id: Type.Array(Type.String(), { description: 'uninstall data id' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(outputItemSchema), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const startSchema = {
  tags: [API_PREFIX],
  summary: 'Start plugin',
  description: 'Start plugin by id.',
  body: Type.Object({
    id: Type.Array(Type.String(), { description: 'start data id' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(outputItemSchema), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const stopSchema = {
  tags: [API_PREFIX],
  summary: 'Stop plugin',
  description: 'Stop plugin by id.',
  body: Type.Object({
    id: Type.Array(Type.String(), { description: 'stop data id' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(outputItemSchema), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
