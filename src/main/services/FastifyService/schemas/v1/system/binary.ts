import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[system]binary';

const baseItemSchema = Type.Object({
  name: Type.String({ description: 'name' }),
  path: Type.String({ description: 'path' }),
  exist: Type.Boolean({ description: 'exist' }),
});

export const outputItemSchema = baseItemSchema;

export const getBinaryListSchema = {
  tags: [API_PREFIX],
  summary: 'Get binary list',
  description: 'Get binary list.',
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object(
        {
          list: Type.Array(outputItemSchema, { description: 'binary list' }),
          total: Type.Number({ description: 'total count' }),
        },
        { description: 'Successful Operation' },
      ),
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const installBinarySchema = {
  tags: [API_PREFIX],
  summary: 'Install binary',
  description: 'Install binary.',
  body: Type.Object({
    id: Type.Array(Type.String(), { description: 'binary name' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(outputItemSchema), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
