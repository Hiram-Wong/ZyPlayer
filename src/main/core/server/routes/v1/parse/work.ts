import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import * as cheerio from 'cheerio';
import request from '@main/utils/request';

const API_PREFIX = 'api/v1/analyze';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/title`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    const { url } = req.query;
    const reqRes = await request({
      url,
      method: 'GET',
    });
    const html = Buffer.from(reqRes).toString('utf-8');
    const $ = cheerio.load(html);
    const titleRes = $('title').text();
    const res = {
      title: titleRes,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
};

export default api;
