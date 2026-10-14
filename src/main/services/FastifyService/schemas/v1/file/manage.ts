import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

import { ResponseErrorSchema, ResponseSuccessSchema } from '../../base';

const API_PREFIX = 'file';

export const addSchema = {
  tags: [API_PREFIX],
  summary: 'Add file',
  description: 'Add a new file under the application-managed file directory',
  params: Type.Object({
    type: Type.Literal('file', { description: 'managed file type' }),
    '*': Type.String({ description: 'file path' }),
  }),
  body: Type.String({ description: 'file content' }),
  response: {
    200: Type.Object(
      {
        ...Type.Omit(ResponseSuccessSchema, ['data']).properties,
        data: Type.Object({
          success: Type.Boolean({ description: 'Indicates whether the operation was successful' }),
        }),
      },
      { description: 'Response schema for add file' },
    ),
    500: ResponseErrorSchema,
  },
};

export const deleteSchema = {
  tags: [API_PREFIX],
  summary: 'Delete file',
  description: 'Delete a file under the application-managed file directory',
  params: Type.Object({
    type: Type.Literal('file', { description: 'managed file type' }),
    '*': Type.String({ description: 'file path' }),
  }),
  response: {
    200: Type.Object(
      {
        ...Type.Omit(ResponseSuccessSchema, ['data']).properties,
        data: Type.Object({
          success: Type.Boolean({ description: 'Indicates whether the operation was successful' }),
        }),
      },
      { description: 'Response schema for delete file' },
    ),
    500: ResponseErrorSchema,
  },
};

export const putSchema = {
  tags: [API_PREFIX],
  summary: 'Update file content',
  description: 'Update a file under the application-managed file directory',
  params: Type.Object({
    type: Type.Literal('file', { description: 'managed file type' }),
    '*': Type.String({ description: 'file path' }),
  }),
  body: Type.String({ description: 'file content' }),
  response: {
    200: Type.Object(
      {
        ...Type.Omit(ResponseSuccessSchema, ['data']).properties,
        data: Type.Object({
          success: Type.Boolean({ description: 'Indicates whether the operation was successful' }),
        }),
      },
      { description: 'Response schema for update file content' },
    ),
    500: ResponseErrorSchema,
  },
};

export const getSchema = {
  tags: [API_PREFIX],
  summary: 'Get file content',
  description: 'Get a file under the application-managed file directory',
  params: Type.Object({
    type: Type.Literal('file', { description: 'managed file type' }),
    '*': Type.String({ description: 'file path' }),
  }),
  response: {
    200: Type.Any({ description: 'file content' }),
    500: ResponseErrorSchema,
  },
};

export type AddFileParams = Static<typeof addSchema.params>;
export type AddFileBody = Static<typeof addSchema.body>;
export type DeleteFileParams = Static<typeof deleteSchema.params>;
export type PutFileParams = Static<typeof putSchema.params>;
export type PutFileBody = Static<typeof putSchema.body>;
export type GetFileParams = Static<typeof getSchema.params>;
