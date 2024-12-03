import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import request from '@main/utils/request';
import { ipVersion } from 'is-ip';
import iconv from 'iconv-lite';

const API_PREFIX = 'api/v1/system';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/status`, async () => {
    return { code: 0, msg: 'ok', data: 'run' };
  });
  fastify.get(`/${API_PREFIX}/ip`, async () => {
    const urls = ['https://ipv6.icanhazip.com', 'https://ipv4.icanhazip.com'];
    const res: any = {
      ip: '',
      version: undefined,
    };

    for (const url of urls) {
      try {
        const response = await request({ url, method: 'GET' });
        if (response.trim()) res.ip = response.trim();
        res.version = ipVersion(res.ip);
      } catch {}
    }
    return { code: 0, msg: 'ok', data: res };
  });
  fastify.post(`/${API_PREFIX}/config`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const options = req.body;
    const res = await request({ ...options });
    return { code: 0, msg: 'ok', data: res };
  });
  fastify.post(`/${API_PREFIX}/html`, async (req: FastifyRequest<{ Body: { [key: string]: string } }>) => {
    const options = req.body;
    const encode = options.encode || 'UTF-8';
    delete options.encode;
    const response = await request({ ...options, responseType: 'arraybuffer' });
    const res = iconv.decode(Buffer.from(response), encode); // 假设后端编码为GBK

    return { code: 0, msg: 'ok', data: res || '' };
  });
};

export default api;
