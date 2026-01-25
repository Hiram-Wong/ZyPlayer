import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpErrorResponseSchema, createHttpSuccessResponseSchema } from '../../base';

const API_PREFIX = '[aigc]chat';

export const completionSchema = {
  tags: [API_PREFIX],
  summary: 'Ai Chat Completion',
  description: 'Ai Chat Completion.',
  body: Type.Object({
    prompt: Type.String({ description: 'The prompt to generate a completion for.' }),
    model: Type.Optional(Type.String({ description: 'The model to use.' })),
    stream: Type.Optional(Type.Boolean({ description: 'Whether to stream the response.' })),
    sessionId: Type.Optional(Type.String({ description: 'The session ID for the conversation.' })),
    parentId: Type.Optional(Type.String({ description: 'The parent message ID for threading.' })),
  }),
  response: {
    200: {
      content: {
        'text/event-stream': {
          schema: Type.Union([
            Type.Object({
              id: Type.String(),
              object: Type.String(Type.Literal('chat.completion.chunk')),
              created: Type.Integer({ format: 'int64' }),
              model: Type.String(),
              choices: Type.Array(
                Type.Object({
                  index: Type.Integer({ format: 'int32' }),
                  delta: Type.Object({
                    role: Type.String({ enum: ['system', 'user', 'assistant'] }),
                    content: Type.String(),
                  }),
                  finish_reason: Type.Union([Type.String(), Type.Null()]),
                }),
              ),
              usage: Type.Optional(
                Type.Object({
                  prompt_tokens: Type.Integer({ format: 'int32' }),
                  completion_tokens: Type.Integer({ format: 'int32' }),
                  total_tokens: Type.Integer({ format: 'int32' }),
                }),
              ),
            }),
            Type.String(),
          ]),
        },
        'application/json': {
          schema: createHttpSuccessResponseSchema(
            Type.Object({
              sessionId: Type.String(),
              completion: Type.Object({
                id: Type.String(),
                object: Type.String(Type.Literal('chat.completion')),
                created: Type.Integer({ format: 'int64' }),
                model: Type.String(),
                choices: Type.Array(
                  Type.Object({
                    index: Type.Integer({ format: 'int32' }),
                    message: Type.Object({
                      role: Type.String({ enum: ['system', 'user', 'assistant'] }),
                      content: Type.String(),
                    }),
                    finish_reason: Type.String(),
                  }),
                ),
                usage: Type.Optional(
                  Type.Object({
                    prompt_tokens: Type.Integer({ format: 'int32' }),
                    completion_tokens: Type.Integer({ format: 'int32' }),
                    total_tokens: Type.Integer({ format: 'int32' }),
                  }),
                ),
              }),
            }),
          ),
        },
      },
      description: 'Successful Operation',
    },
    400: createHttpErrorResponseSchema(Type.String(), { description: 'Parameter Verification Error' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};

export const normalSchema = {
  tags: [API_PREFIX],
  summary: 'Ai Chat Normal',
  description: 'Ai Chat Normal, only return message.',
  body: Type.Object({
    prompt: Type.String({ description: 'The prompt to generate a completion for.' }),
    model: Type.Optional(Type.String({ description: 'The model to use.' })),
    sessionId: Type.Optional(Type.String({ description: 'The session ID for the conversation.' })),
    parentId: Type.Optional(Type.String({ description: 'The parent message ID for threading.' })),
  }),
  response: {
    200: createHttpSuccessResponseSchema(Type.String(), { description: 'Successful Operation' }),
    400: createHttpErrorResponseSchema(Type.String(), { description: 'Parameter Verification Error' }),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
