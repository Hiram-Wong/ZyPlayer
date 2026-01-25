import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[system]ffmpeg';

export const ffmpegInfoSchema = {
  tags: [API_PREFIX],
  summary: 'Get media info',
  description: 'Media info.',
  body: Type.Object({
    url: Type.String({ format: 'uri', description: 'request url' }),
    options: Type.Optional(
      Type.Object({
        headers: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: 'request headers' })),
        timeout: Type.Optional(Type.Integer({ minimum: 0, maximum: 2147480, description: 'timeout (ms)' })),
      }),
    ),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        duration: Type.Optional(Type.Number({ description: 'duration (s)', format: 'float' })),
        video: Type.Optional(
          Type.Object({
            codec: Type.Optional(Type.String({ description: 'video codec' })),
            width: Type.Optional(Type.Integer({ description: 'video width', format: 'int32' })),
            height: Type.Optional(Type.Integer({ description: 'video height', format: 'int32' })),
            resolution: Type.Optional(Type.String({ description: 'video resolution' })),
            fps: Type.Optional(Type.Integer({ description: 'video fps', format: 'int32' })),
            bitrate: Type.Optional(Type.Integer({ description: 'video bitrate (kbps)', format: 'int32' })),
          }),
        ),
        audio: Type.Optional(
          Type.Object({
            codec: Type.Optional(Type.String({ description: 'audio codec' })),
            sampleRate: Type.Optional(Type.Integer({ description: 'audio sample rate (hz)', format: 'int32' })),
            channelCount: Type.Optional(Type.Integer({ description: 'audio channel count', format: 'int32' })),
            channelType: Type.Optional(Type.String({ description: 'audio channel type' })),
            bitrate: Type.Optional(Type.Integer({ description: 'audio bitrate (kbps)', format: 'int32' })),
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

export const ffmpegScreenshotSchema = {
  tags: [API_PREFIX],
  summary: 'Get media screenshot',
  description: 'Media screenshot base64.',
  body: Type.Object({
    url: Type.String({ format: 'uri', description: 'request url' }),
    options: Type.Optional(
      Type.Object({
        headers: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: 'request headers' })),
        timeout: Type.Optional(Type.Integer({ minimum: 0, maximum: 2147480, description: 'timeout (ms)' })),
        timestamp: Type.Optional(Type.String({ description: 'timestamp (HH:mm:ss)' })),
      }),
    ),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.String({ description: 'screenshot base64' }), {
      description: 'Successful Operation',
    }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
