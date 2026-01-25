import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[film]rec';

export const getBarrageSchema = {
  tags: [API_PREFIX],
  summary: 'Get Recommend Barrage',
  description: 'Recommend Barrage.',
  querystring: Type.Object({
    id: Type.String({ description: 'id' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object(
        {
          id: Type.Optional(Type.String()),
          list: Type.Optional(
            Type.Array(
              Type.Object({
                id: Type.String(),
                text: Type.String(),
                type: Type.String({ enum: ['top', 'bottom', 'left', 'right'] }),
                time: Type.Number(),
                color: Type.String(),
              }),
            ),
          ),
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

export const sendBarrageSchema = {
  tags: [API_PREFIX],
  summary: 'Post Barrage',
  description: 'Post Barrage.',
  body: Type.Object({
    id: Type.String({ description: 'id' }),
    time: Type.Number({ format: 'float', description: 'time' }),
    text: Type.String({ description: 'text' }),
    type: Type.String({ enum: ['top', 'bottom', 'left', 'right'], description: 'type' }),
    color: Type.Optional(Type.String({ description: 'color' })),
    size: Type.Optional(Type.String({ description: 'size' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Boolean({ description: 'Successful Operation' })),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getHotSchema = {
  tags: [API_PREFIX],
  summary: 'Get Recommend Hot',
  description: 'Recommend Hot.',
  querystring: Type.Optional(
    Type.Object({
      source: Type.Optional(
        Type.String({ enum: ['komect', 'douban', 'quark', 'baidu', 'kylive', 'enlightent'], description: 'source' }),
      ),
      date: Type.Optional(Type.String({ description: 'date' })),
      type: Type.Optional(
        Type.Integer({ format: 'int32', enum: [1, 2, 3, 4], description: '1:movie 2:tv 3:art 4:anime(child)' }),
      ),
      page: Type.Optional(Type.Integer({ format: 'int32', description: 'page' })),
      pageSize: Type.Optional(Type.Integer({ format: 'int32', description: 'pageSize' })),
    }),
  ),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Array(
        Type.Object({
          vod_id: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
          vod_name: Type.String(),
          vod_hot: Type.Number(),
          vod_pic: Type.Optional(Type.String()),
          vod_remarks: Type.Optional(Type.String()),
        }),
      ),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getMatchSchema = {
  tags: [API_PREFIX],
  summary: 'Get Douban Recommend',
  description: 'Douban Recommend with (name and year) or (id and type).',
  querystring: Type.Object({
    name: Type.Optional(Type.String({ description: 'name' })),
    year: Type.Optional(Type.String({ description: 'year' })),
    id: Type.Optional(Type.String({ description: 'id' })),
    type: Type.Optional(Type.String({ description: 'type' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Array(
        Type.Object({
          vod_name: Type.String(),
          vod_pic: Type.Optional(Type.String()),
          vod_douban_id: Type.Optional(Type.String()),
          vod_douban_type: Type.Optional(Type.String()),
        }),
      ),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
