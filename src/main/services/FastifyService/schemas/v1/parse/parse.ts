import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[parse]other';

export const mediaDirectSchema = {
  tags: [API_PREFIX],
  summary: 'Get media direct',
  description: 'Get media direct url.',
  querystring: Type.Object({
    id: Type.String({ description: 'Specified analyze id' }),
    url: Type.String({ description: 'parse url' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        url: Type.String({ description: 'parsed url' }),
        headers: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: 'parsed headers' })),
      }),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
