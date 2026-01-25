import { Schema } from '@main/types/server';
import { Type } from '@sinclair/typebox';

import { createHttpSuccessResponseSchema } from '../../base';
import { outputItemSchema as siteSchema } from '../flim/site';
import { outputItemSchema as iptvSchema } from '../live/iptv';
import { outputItemSchema as analyzeSchema } from '../parse/analyze';

const API_PREFIX = '[moment]other';

export const getRelatedSchema = {
  tags: [API_PREFIX],
  summary: 'Get related',
  description: 'Get related site.',
  response: {
    200: createHttpSuccessResponseSchema(
      Type.Object({
        parse: Type.Array(analyzeSchema),
        live: Type.Array(iptvSchema),
        film: Type.Array(siteSchema),
      }),
      { description: 'Successful Operation' },
    ),
    default: {
      description: 'Unexpected Error',
      $ref: Schema.ApiReponseError,
    },
  },
};
