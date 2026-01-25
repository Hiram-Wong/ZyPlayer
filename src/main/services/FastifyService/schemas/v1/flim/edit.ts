import { Schema } from '@main/types/server';
import { siteTypes } from '@shared/config/film';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[film]edit';

export const domPdSchema = {
  tags: [API_PREFIX],
  summary: 'Parser pd',
  description: 'Parsing content with the pd function.',
  body: Type.Object({
    rule: Type.String({ description: 'rule' }),
    html: Type.String({ description: 'html, post-transfer incoming' }),
    baseUrl: Type.Optional(Type.String({ description: 'base url' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.String(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const domPdfaSchema = {
  tags: [API_PREFIX],
  summary: 'Parser pdfa',
  description: 'Parsing content with the pdfa function.',
  body: Type.Object({
    rule: Type.String({ description: 'rule' }),
    html: Type.String({ description: 'html, post-transfer incoming' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(Type.String()), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const domPdfhSchema = {
  tags: [API_PREFIX],
  summary: 'Parser pdfh',
  description: 'Parsing content with the pdfh function.',
  body: Type.Object({
    rule: Type.String({ description: 'rule' }),
    html: Type.String({ description: 'html, post-transfer incoming' }),
    baseUrl: Type.Optional(Type.String({ description: 'base url' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.String(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const domPdflSchema = {
  tags: [API_PREFIX],
  summary: 'Parser pdfl',
  description: 'Parsing content with the pdfl function.',
  body: Type.Object({
    rule: Type.String({ description: 'rule' }),
    html: Type.String({ description: 'html, post-transfer incoming' }),
    listText: Type.String({ description: 'list text' }),
    listUrl: Type.String({ description: 'list url' }),
    baseUrl: Type.Optional(Type.String({ description: 'baseurl' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.String(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const siftCategorySchema = {
  tags: [API_PREFIX],
  summary: 'Parser sift category',
  description: 'Parsing content with the sift category function.',
  body: Type.Object({
    html: Type.String({ description: 'html, post-transfer incoming' }),
    categoryRule: Type.String({ description: 'category parse' }),
    categoryExclude: Type.Optional(Type.String({ description: 'category exclude, vertical line split' })),
    categoryUrl: Type.String({ description: 'category url, "fyclass" instead of category uuid' }),
    baseUrl: Type.String({ description: 'base url' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        title: Type.String(),
        uuid: Type.String(),
        raw: Type.Array(
          Type.Object({
            title: Type.String(),
            uuid: Type.String(),
            path_url: Type.Optional(Type.String()),
            source_url: Type.Optional(Type.String()),
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

export const siftFilterSchema = {
  tags: [API_PREFIX],
  summary: 'Parser sift filter',
  description: 'Parsing content with the sift filter function.',
  body: Type.Object({
    html: Type.String({ description: 'html, post-transfer incoming' }),
    baseRule: Type.String({ description: 'base rule' }),
    detailRule: Type.String({ description: 'detail rule' }),
    matchs: Type.Record(Type.String(), Type.String(), { description: 'matchs' }),
    ci: Type.Optional(Type.String({ description: 'ci' })),
    excludeKeys: Type.Optional(Type.String({ description: 'exclude keys, vertical line split' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Any(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const templateNameSchema = {
  tags: [API_PREFIX],
  summary: 'Get template names',
  description: 'Get template names by type.',
  params: Type.Object({
    type: Type.Integer({ format: 'int32', enum: siteTypes, description: 'type' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(Type.String()), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const templateDetailSchema = {
  tags: [API_PREFIX],
  summary: 'Get template detail',
  description: 'Get template detail by type and name.',
  params: Type.Object({
    type: Type.Integer({ format: 'int32', enum: siteTypes, description: 'type' }),
    name: Type.String({ description: 'name' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Any(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const decryptSchema = {
  tags: [API_PREFIX],
  summary: 'Decrypt code',
  description: 'Decrypt code content.',
  consumes: ['text/plain'],
  params: Type.Object({
    type: Type.Integer({ format: 'int32', enum: siteTypes, description: 'type' }),
  }),
  body: Type.String({ description: 'code content' }),
  response: {
    200: createHttpSuccessResponseSchema(Type.String(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
