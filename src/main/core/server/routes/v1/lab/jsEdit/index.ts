import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { pdfa, pdfh } from '@main/utils/hiker/htmlParser';
import { getMubans } from '../../site/cms/adapter/drpy/template';
import { site } from '@main/core/db/service';

const API_PREFIX = 'api/v1/lab/js-edit';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}/pdfa`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const { html, rule } = req.body;

    const res = pdfa(html, rule);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/pdfh`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { html, rule, baseUrl } = req.body;
    const res = pdfh(html, rule, baseUrl);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/muban`, async () => {
    return {
      code: 0,
      msg: 'ok',
      data: getMubans(),
    };
  });
  fastify.get(`/${API_PREFIX}/debug`, async () => {
    const dbResSite = await site.findByKey('debug');
    return {
      code: 0,
      msg: 'ok',
      data: dbResSite,
    };
  });
};

export default api;
