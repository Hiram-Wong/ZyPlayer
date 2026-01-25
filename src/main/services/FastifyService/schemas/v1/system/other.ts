import { Schema } from '@main/types/server';
import { LEVEL, LOG_MODULE } from '@shared/config/logger';
import { reqEncodes, reqMethods } from '@shared/config/req';
import { Type } from '@sinclair/typebox';

import {
  createHttpErrorResponseSchema,
  createHttpRedirectResponseSchema,
  createHttpSuccessResponseSchema,
} from '../../base';

const API_PREFIX = '[system]other';

export const healthSchema = {
  tags: [API_PREFIX],
  summary: 'Get server health',
  description: 'Server health.',
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        timestamp: Type.Integer({ format: 'int64', description: 'timestamp' }),
        version: Type.String({ description: 'version' }),
      }),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const ipSchema = {
  tags: [API_PREFIX],
  summary: 'Get server ip',
  description: 'Server ip address.',
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        ip: Type.Union([Type.String({ format: 'ipv4' }), Type.String({ format: 'ipv6' }), Type.String()], {
          description: 'ip address',
        }),
        version: Type.Integer({ enum: [4, 6, -1], format: 'int32', description: 'ip version' }),
        valid: Type.Boolean({ description: 'ip valid' }),
        location: Type.Object({
          country: Type.Optional(Type.String({ description: 'country' })),
          region: Type.Optional(Type.String({ description: 'region' })),
          city: Type.Optional(Type.String({ description: 'city' })),
          isp: Type.Optional(Type.String({ description: 'isp' })),
        }),
      }),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const reqSchema = {
  tags: [API_PREFIX],
  summary: 'Axios request',
  description: 'same as axios request.',
  body: Type.Object({
    url: Type.String({ format: 'uri', description: 'request url' }),
    method: Type.String({ enum: reqMethods, description: 'request method' }),
    headers: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: 'request headers' })),
    data: Type.Optional(Type.Any({ description: 'request data' })),
    params: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: 'request params' })),
    timeout: Type.Optional(Type.Integer({ minimum: 0, description: 'timeout (ms)' })),
    encode: Type.Optional(Type.String({ enum: reqEncodes, description: 'encoding format' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        code: Type.Integer({ format: 'int32', description: 'response code' }),
        data: Type.Any({ description: 'response data' }),
        headers: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: 'response headers' })),
      }),
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const m3u8AdRemoveSchema = {
  tags: [API_PREFIX],
  summary: 'Remove m3u8 segment',
  description: 'Remove ad from m3u8 segment.',
  querystring: Type.Object({
    url: Type.String({ format: 'uri', description: 'm3u8 url' }),
    headers: Type.Optional(Type.String({ description: 'request headers' })),
  }),
  response: {
    200: {
      content: {
        'application/vnd.apple.mpegurl': { schema: Type.String() },
        'application/x-mpegURL': { schema: Type.String() },
        'application/octet-stream': { schema: Type.String() },
      },
      description: 'Successful Operation',
    },
    302: createHttpRedirectResponseSchema(),
    400: createHttpErrorResponseSchema(Type.String(), { description: 'Parameter Verification Error' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const logSchema = {
  tags: [API_PREFIX],
  summary: 'Get log',
  description: 'Get log by type and level, default is all',
  querystring: Type.Object({
    type: Type.Optional(
      Type.String({ description: `log type(comma split), allowed values: ${Object.values(LOG_MODULE).join(', ')}` }),
    ),
    level: Type.Optional(Type.String({ enum: Object.values(LEVEL), description: 'log level' })),
  }),
  response: {
    200: {
      content: {
        'text/event-stream': {
          schema: Type.Union([
            Type.Object({
              level: Type.String({ enum: Object.values(LEVEL), description: 'log level' }),
              message: Type.Any(),
              module: Type.String({ enum: Object.values(LOG_MODULE), description: 'log module' }),
              timestamp: Type.String({ description: 'timestamp' }),
              process: Type.String({ enum: ['main', 'renderer'], description: 'process name' }),
            }),
            Type.String(),
          ]),
        },
      },
      description: 'Successful Operation',
    },
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
