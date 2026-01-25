import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[system]process';

export const processKillSchema = {
  tags: [API_PREFIX],
  summary: 'Process kill',
  description: 'Kill system process.',
  querystring: Type.Object({
    pid: Type.Array(Type.Integer({ format: 'int32', description: 'process id' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Boolean(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const processMatchSchema = {
  tags: [API_PREFIX],
  summary: 'Process match',
  description: 'Match system process.',
  querystring: Type.Object({
    type: Type.String({ enum: ['port', 'ps'], description: 'match type' }),
    kw: Type.Union([Type.String(), Type.Integer({ format: 'int32' })], { description: 'keyword' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(Type.Number()), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
