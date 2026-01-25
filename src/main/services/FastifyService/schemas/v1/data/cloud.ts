import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[data]cloud';

export const backupSchema = {
  tags: [API_PREFIX],
  summary: 'Data backup',
  description: 'Local data backup to cloud.',
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

export const resumeSchema = {
  tags: [API_PREFIX],
  summary: 'Data resume',
  description: 'Local data resume from cloud.',
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
