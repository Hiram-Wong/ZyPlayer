import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { getFilters, processCategories } from './utils';

const API_PREFIX = 'api/v1/lab/static-filter';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}/filter`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const { html, ci, f, f1, matchs, exclude_keys } = req.body;

    const res = getFilters(html, ci, f, f1, matchs, exclude_keys);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/category`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { contentHtml, class_parse, cate_exclude, reurl, url } = req.body;
    const res = processCategories(contentHtml, class_parse, cate_exclude, reurl, url);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
};

export default api;
