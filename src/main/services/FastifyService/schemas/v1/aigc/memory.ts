import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[aigc]memory';

const chatMessageSchema = Type.Object({
  role: Type.String({ enum: ['system', 'user', 'assistant'] }),
  content: Type.String(),
});

const outputItemSchema = Type.Object({
  id: Type.String(),
  messages: Type.Union([Type.Array(chatMessageSchema), Type.Null()]),
});

export const addMessageSchema = {
  tags: [API_PREFIX],
  summary: 'Add message data',
  description: 'Add a new message data.',
  body: Type.Object({
    id: Type.String({ description: 'data id' }),
    messages: Type.Union([chatMessageSchema, Type.Array(chatMessageSchema)], { description: 'messages' }),
  }),
  response: {
    200: createHttpSuccessResponseSchema(outputItemSchema, { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const deleteMessageSchema = {
  tags: [API_PREFIX],
  summary: 'Delete message data',
  description: 'Delete message data as supplied, or if the index is empty, delete all sessions supplied with id.',
  body: Type.Object({
    id: Type.String({ description: 'data id' }),
    index: Type.Optional(Type.Array(Type.Integer(), { description: 'message index' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(outputItemSchema, { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const putMessageSchema = {
  tags: [API_PREFIX],
  summary: 'Set message data',
  description: 'Set message data.',
  body: Type.Object({
    id: Type.String({ description: 'data id' }),
    updates: Type.Array(
      Type.Object({
        index: Type.Integer(),
        message: chatMessageSchema,
      }),
      { description: 'updates' },
    ),
  }),
  response: {
    200: createHttpSuccessResponseSchema(outputItemSchema, { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getMessageSchema = {
  tags: [API_PREFIX],
  summary: 'Get message data',
  description:
    'Get message data, limit by recentCount or maxTokens, if both are provided, recentCount will be ignored, if none is provided, return all.',
  params: Type.Object({
    id: Type.String({ description: 'data id' }),
  }),
  querystring: Type.Object({
    recentCount: Type.Optional(Type.String()),
    maxTokens: Type.Optional(Type.String()),
  }),
  response: {
    200: createHttpSuccessResponseSchema(outputItemSchema, { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const createSessionSchema = {
  tags: [API_PREFIX],
  summary: 'Create session data',
  description: 'Create a new session data.',
  body: Type.Optional(
    Type.Object({
      messages: Type.Optional(Type.Array(chatMessageSchema, { description: 'initial messages' })),
    }),
  ),
  response: {
    200: createHttpSuccessResponseSchema(outputItemSchema, { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const clearSessionSchema = {
  tags: [API_PREFIX],
  summary: 'Delete session data',
  description: 'Delete session all data.',
  body: Type.Object({
    id: Type.Optional(Type.Array(Type.String(), { description: 'data id' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.Boolean(), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const getSessionIdsSchema = {
  tags: [API_PREFIX],
  summary: 'Get session id data',
  description: 'Get all session id.',
  response: {
    200: createHttpSuccessResponseSchema(Type.Array(Type.String()), { description: 'Successful Operation' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
