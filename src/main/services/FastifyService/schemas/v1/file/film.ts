import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

const API_PREFIX = '[file]film';

const filmSchema = Type.Object({
  lives: Type.Array(
    Type.Object({
      group: Type.String(),
      channels: Type.Object({
        name: Type.String(),
        urls: Type.Array(Type.String()),
      }),
    }),
    { description: 'live item' },
  ),
  parses: Type.Array(
    Type.Object({
      name: Type.String(),
      type: Type.Integer({ format: 'int32', enum: [1, 2] }),
      url: Type.String(),
      header: Type.Optional(Type.Record(Type.String(), Type.String())),
      ext: Type.Optional(Type.Object({ flag: Type.Array(Type.String()) })),
    }),
    { description: 'parse item' },
  ),
  sites: Type.Array(
    Type.Object({
      name: Type.String(),
      key: Type.String(),
      type: Type.Integer({ format: 'int32', enum: [0, 1, 2, 3, 4] }),
      api: Type.String(),
      playUrl: Type.Optional(Type.String()),
      quickSearch: Type.Optional(Type.Integer({ format: 'int32', enum: [0, 1] })),
      searchable: Type.Optional(Type.Integer({ format: 'int32', enum: [0, 1] })),
      filterable: Type.Optional(Type.Integer({ format: 'int32', enum: [0, 1] })),
      ext: Type.Optional(Type.Any()),
      categories: Type.Optional(Type.Array(Type.String())),
    }),
    { description: 'site item' },
  ),

  flags: Type.Array(Type.String(), { description: 'flags' }),

  ads: Type.Array(Type.String(), { description: 'ads' }),
  ijk: Type.Array(
    Type.Object({
      group: Type.String(),
      options: Type.Array(
        Type.Object({
          category: Type.Integer({ format: 'int32' }),
          name: Type.String(),
          value: Type.String(),
        }),
      ),
    }),
    { description: 'ijk' },
  ),

  homeLogo: Type.String({ description: 'home logo url' }),
  homePage: Type.String({ description: 'home page url' }),
  spider: Type.String({ description: 'spider jar url' }),
  wallpaper: Type.String({ description: 'wallpaper url' }),
});

export const autoSchema = {
  tags: [API_PREFIX],
  summary: 'Get auto content',
  description:
    'Get a file content by path level(three levels), operating system files if the type is system, which is a dangerous operation.',
  params: Type.Object({
    type: Type.String({ enum: ['file', 'system'], description: 'file type' }),
    '*': Type.String({ description: 'file path' }),
  }),
  response: {
    200: Type.Partial(filmSchema, { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const makeSchema = {
  tags: [API_PREFIX],
  summary: 'Get make content',
  description:
    'Get a file content by generate index.json from index.js, operating system files if the type is system, which is a dangerous operation.',
  params: Type.Object({
    type: Type.String({ enum: ['file', 'system'], description: 'file type' }),
    '*': Type.String({ description: 'file path' }),
  }),
  response: {
    200: Type.Partial(filmSchema, { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
