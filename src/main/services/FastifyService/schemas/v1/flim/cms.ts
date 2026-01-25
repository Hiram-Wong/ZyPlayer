import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[film]cms';

export const getInitchema = {
  tags: [API_PREFIX],
  summary: 'Get cms init',
  description: 'Cms init.',
  querystring: Type.Object({
    uuid: Type.String(),
    force: Type.Optional(Type.Boolean()),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Boolean(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getHomeSchema = {
  tags: [API_PREFIX],
  summary: 'Get cms home',
  description: 'Cms home.',
  querystring: Type.Object({
    uuid: Type.String(),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        class: Type.Optional(
          Type.Array(
            Type.Object({
              type_id: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
              type_name: Type.String(),
            }),
          ),
        ),
        filters: Type.Optional(
          Type.Record(
            Type.String(),
            Type.Array(
              Type.Object({
                key: Type.String(),
                name: Type.String(),
                value: Type.Array(
                  Type.Object({
                    n: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
                    v: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
                  }),
                ),
              }),
            ),
          ),
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

export const getHomeVodSchema = {
  tags: [API_PREFIX],
  summary: 'Get cms homeVod',
  description: 'Cms homeVod.',
  querystring: Type.Object({
    uuid: Type.String(),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        page: Type.Optional(Type.Integer({ format: 'int32' })),
        pagecount: Type.Optional(Type.Integer({ format: 'int32' })),
        total: Type.Optional(Type.Integer({ format: 'int32' })),
        list: Type.Optional(
          Type.Array(
            Type.Object({
              vod_id: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
              vod_name: Type.String(),
              vod_pic: Type.Optional(Type.String()),
              vod_remarks: Type.Optional(Type.String()),
              vod_blurb: Type.Optional(Type.String()),
              vod_tag: Type.Optional(Type.String({ enum: ['folder', 'file'] })),
            }),
          ),
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

export const getCategorySchema = {
  tags: [API_PREFIX],
  summary: 'Get cms category',
  description: 'Cms category.',
  querystring: Type.Object({
    uuid: Type.String(),
    tid: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
    page: Type.Optional(Type.Integer({ format: 'int32' })),
    extend: Type.Optional(Type.String()),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        page: Type.Optional(Type.Integer({ format: 'int32' })),
        pagecount: Type.Optional(Type.Integer({ format: 'int32' })),
        total: Type.Optional(Type.Integer({ format: 'int32' })),
        list: Type.Array(
          Type.Object({
            vod_id: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
            vod_name: Type.String(),
            vod_pic: Type.Optional(Type.String()),
            vod_remarks: Type.Optional(Type.String()),
            vod_blurb: Type.Optional(Type.String()),
            vod_tag: Type.Optional(Type.String({ enum: ['folder', 'file', 'action', ''] })),
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

export const getDetailSchema = {
  tags: [API_PREFIX],
  summary: 'Get cms detail',
  description: 'Cms detail.',
  querystring: Type.Object({
    uuid: Type.String(),
    ids: Type.String(),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        page: Type.Optional(Type.Integer({ format: 'int32' })),
        pagecount: Type.Optional(Type.Integer({ format: 'int32' })),
        total: Type.Optional(Type.Integer({ format: 'int32' })),
        list: Type.Array(
          Type.Object({
            vod_id: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
            vod_name: Type.String(),
            vod_pic: Type.Optional(Type.String()),
            vod_lang: Type.Optional(Type.String()),
            vod_year: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
            vod_area: Type.Optional(Type.String()),
            vod_remarks: Type.Optional(Type.String()),
            vod_score: Type.Optional(Type.String()),
            vod_state: Type.Optional(Type.String()),
            vod_class: Type.Optional(Type.String()),
            vod_actor: Type.Optional(Type.String()),
            vod_director: Type.Optional(Type.String()),
            vod_content: Type.Optional(Type.String()),
            vod_blurb: Type.Optional(Type.String()),
            vod_play_from: Type.String(),
            vod_play_url: Type.String(),
            vod_episode: Type.Optional(
              Type.Record(Type.String(), Type.Array(Type.Object({ text: Type.String(), link: Type.String() }))),
            ),
            type_name: Type.Optional(Type.String()),
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

export const getSearchSchema = {
  tags: [API_PREFIX],
  summary: 'Get cms search',
  description: 'Cms search.',
  querystring: Type.Object({
    uuid: Type.String(),
    wd: Type.String(),
    page: Type.Optional(Type.Integer({ format: 'int32' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        page: Type.Optional(Type.Integer({ format: 'int32' })),
        pagecount: Type.Optional(Type.Integer({ format: 'int32' })),
        total: Type.Optional(Type.Integer({ format: 'int32' })),
        list: Type.Array(
          Type.Object({
            vod_id: Type.Union([Type.String(), Type.Integer({ format: 'int32' })]),
            vod_name: Type.String(),
            vod_pic: Type.Optional(Type.String()),
            vod_remarks: Type.Optional(Type.String()),
            vod_blurb: Type.Optional(Type.String()),
            vod_tag: Type.Optional(Type.String({ enum: ['folder', 'file'] })),
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

export const getPlaySchema = {
  tags: [API_PREFIX],
  summary: 'Get cms play',
  description: 'Cms play.',
  querystring: Type.Object({
    uuid: Type.String(),
    play: Type.String(),
    flag: Type.Optional(Type.String()),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        url: Type.String(),
        quality: Type.Optional(Type.Array(Type.Union([Type.String(), Type.Number()]))),
        jx: Type.Optional(Type.Integer({ format: 'int32' })),
        parse: Type.Optional(Type.Integer({ format: 'int32' })),
        headers: Type.Optional(Type.Record(Type.String(), Type.Any())),
        script: Type.Optional(Type.Record(Type.String(), Type.String())),
      }),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getProxySchema = {
  tags: [API_PREFIX],
  summary: 'Get cms proxy',
  description: 'Cms proxy.',
  querystring: Type.Object(
    {
      uuid: Type.String({ format: 'uuid' }),
      do: Type.String({ enum: ['js', 'py'] }),
      url: Type.String({ format: 'uri' }),
    },
    { additionalProperties: true },
  ),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Union([Type.Tuple([Type.Integer({ format: 'int32' }), Type.String(), Type.String()]), Type.Tuple([])]),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getCheckSchema = {
  tags: [API_PREFIX],
  summary: 'Check cms validity',
  description: 'Check cms validity.',
  querystring: Type.Object({
    uuid: Type.String({ format: 'uuid' }),
    type: Type.String({ enum: ['simple', 'complete'], default: 'check type' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Boolean(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
