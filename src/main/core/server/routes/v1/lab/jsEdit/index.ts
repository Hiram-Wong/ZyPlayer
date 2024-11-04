import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { pdfa, pdfh } from '@main/utils/hiker/htmlParser';
import { getMubans } from '../../site/cms/adapter/drpy/template';
import { site, setting } from '@main/core/db/service';

const API_PREFIX = 'api/v1/lab/js-edit';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}/pdfa`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const { html, parse } = req.body;

    const res = pdfa(html, parse);
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.post(`/${API_PREFIX}/pdfh`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { html, parse, baseUrl } = req.body;
    const res = pdfh(html, parse, baseUrl);
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
  fastify.post(`/${API_PREFIX}/debug-init`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const { doc } = req.body;
    const dbResSite = await site.findByKey('debug');
    let res;
    if (!dbResSite) {
      res = await site.add({
        name: 'debug',
        key: 'debug',
        type: 7,
        api: 'csp_DRPY',
        search: true,
        playUrl: '',
        group: 'debug',
        category: '',
        ext: doc,
      });
    } else {
      res = await site.update([dbResSite?.id], { ext: doc });
    }
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
};

export default api;
