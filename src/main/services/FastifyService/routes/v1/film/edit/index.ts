import { pd, pdfa, pdfh, pdfl } from '@main/utils/hiker/htmlParser';
import {
  decryptSchema,
  domPdfaSchema,
  domPdfhSchema,
  domPdflSchema,
  domPdSchema,
  siftCategorySchema,
  siftFilterSchema,
  templateDetailSchema,
  templateNameSchema,
} from '@server/schemas/v1/flim/edit';
import type { ISiteType } from '@shared/config/film';
import { SITE_TYPE } from '@shared/config/film';
import { isObjectEmpty } from '@shared/modules/validate';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { convertOriginalCode as t3DrpyDecrypt } from '../cms/adapter/t3Drpy/decrypt';
import { renderTemplate as t3DrpyTemplates } from '../cms/adapter/t3Drpy/templates';
import { siftCategory, siftFilter } from './utils/sift';

const TEMPLATES_MAP = {
  [SITE_TYPE.T3_DRPY]: t3DrpyTemplates,
};

const DECRYPT_MAP = {
  [SITE_TYPE.T3_DRPY]: t3DrpyDecrypt,
  [SITE_TYPE.T4_DRPYS]: t3DrpyDecrypt,
};

const API_PREFIX = 'film/edit';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_PREFIX}/dom/pd`,
    { schema: domPdSchema },
    async (req: FastifyRequest<{ Body: { html: string; rule: string; baseUrl?: string } }>) => {
      const { html, rule, baseUrl } = req.body;
      const res = pd(html, rule, baseUrl);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.post(
    `/${API_PREFIX}/dom/pdfa`,
    { schema: domPdfaSchema },
    async (req: FastifyRequest<{ Body: { html: string; rule: string } }>) => {
      const { html, rule } = req.body;
      const res = pdfa(html, rule);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.post(
    `/${API_PREFIX}/dom/pdfh`,
    { schema: domPdfhSchema },
    async (req: FastifyRequest<{ Body: { html: string; rule: string; baseUrl?: string } }>) => {
      const { html, rule, baseUrl } = req.body;
      const res = pdfh(html, rule, baseUrl);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.post(
    `/${API_PREFIX}/dom/pdfl`,
    { schema: domPdflSchema },
    async (
      req: FastifyRequest<{
        Body: { html: string; rule: string; listText: string; listUrl: string; urlKey?: string };
      }>,
    ) => {
      const { html, rule, listText, listUrl, urlKey = '' } = req.body;
      const res = pdfl(html, rule, listText, listUrl, urlKey);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.post(
    `/${API_PREFIX}/sift/category`,
    { schema: siftCategorySchema },
    async (
      req: FastifyRequest<{
        Body: {
          html: string;
          baseUrl: string;
          categoryUrl: string;
          categoryRule: string;
          categoryExclude?: string;
        };
      }>,
    ) => {
      const { html, baseUrl, categoryUrl, categoryRule, categoryExclude = '' } = req.body;
      const res = siftCategory(html, baseUrl, categoryUrl, categoryRule, categoryExclude);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.post(
    `/${API_PREFIX}/sift/filter`,
    { schema: siftFilterSchema },
    async (
      req: FastifyRequest<{
        Body: {
          html: string;
          baseRule: string;
          detailRule: string;
          matchs: Record<string, string>;
          ci?: string;
          excludeKeys?: string;
        };
      }>,
    ) => {
      const { html, baseRule, detailRule, matchs, ci = '', excludeKeys = '' } = req.body;
      const res = siftFilter(html, baseRule, detailRule, matchs, ci, excludeKeys);
      return { code: 0, msg: 'ok', data: res };
    },
  );

  fastify.get(
    `/${API_PREFIX}/template/:type`,
    { schema: templateNameSchema },
    async (req: FastifyRequest<{ Params: { type: ISiteType } }>) => {
      const { type: rawType } = req.params;
      const type = Number.parseInt(rawType as unknown as string);

      if (isObjectEmpty(TEMPLATES_MAP[type]?.templates || {})) return { code: 0, msg: 'ok', data: [] };
      const templates = Object.keys(TEMPLATES_MAP[type].templates);

      return { code: 0, msg: 'ok', data: templates };
    },
  );

  fastify.get(
    `/${API_PREFIX}/template/:type/:name`,
    { schema: templateDetailSchema },
    async (req: FastifyRequest<{ Params: { type: ISiteType; name: string } }>) => {
      const { type: rawType, name } = req.params;
      const type = Number.parseInt(rawType as unknown as string);

      if (!Object.hasOwn(TEMPLATES_MAP[type]?.templates || {}, name)) return { code: 0, msg: 'ok', data: '' };
      const template = TEMPLATES_MAP[type].detail(name) || '';

      return { code: 0, msg: 'ok', data: template };
    },
  );

  fastify.post(
    `/${API_PREFIX}/decrypt/:type`,
    { schema: decryptSchema },
    async (req: FastifyRequest<{ Params: { type: ISiteType }; Body: string }>) => {
      const rawCode = req.body;
      const { type: rawType } = req.params;
      const type = Number.parseInt(rawType as unknown as string);

      if (!Object.hasOwn(DECRYPT_MAP, type)) return { code: 0, msg: 'ok', data: '' };
      const code = DECRYPT_MAP[type]?.(rawCode) || '';

      return { code: 0, msg: 'ok', data: code };
    },
  );
};

export default api;
