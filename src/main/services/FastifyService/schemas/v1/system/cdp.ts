import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[system]cdp';

export const cdpSnifferMediaSchema = {
  tags: [API_PREFIX],
  summary: 'Sniffer media',
  description: 'Sniffer media.',
  body: Type.Object({
    url: Type.String({ format: 'uri', description: 'media url' }),
    options: Type.Optional(
      Type.Object({
        runScript: Type.Optional(Type.String({ description: 'run script' })),
        initScript: Type.Optional(Type.String({ description: 'init script' })),
        customRegex: Type.Optional(Type.String({ description: 'match regex' })),
        snifferExclude: Type.Optional(Type.String({ description: 'exclude regex' })),
        headers: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: 'request headers' })),
        timeout: Type.Optional(Type.Integer({ format: 'int32', minimum: 0, description: 'timeout (ms)' })),
      }),
    ),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        url: Type.String({ description: 'media url' }),
        headers: Type.Record(Type.String(), Type.Any(), { description: 'request headers' }),
      }),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
