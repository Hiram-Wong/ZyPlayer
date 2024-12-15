import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { setting } from '@main/core/db/service';
import request from '@main/utils/request';

const API_PREFIX = 'api/v1/barrage';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}/:version`, async (req: FastifyRequest<{ Body: { [key: string]: string | number } }>) => {
    const dbResBarrage = await setting.get('barrage');
    // { "id": "http://www.iqiyi.com/v_14za0ot37y8.html", "author": "zyfun", "time": 46.032141, "text": "111", "type": 0 }
    const { id, author, time, text, color, type } = req.body;
    const doc = {
      player: id,
      author,
      time,
      text,
      color: `#${color.toString(16)}`,
      type: type === 0 ? 'scroll' : type === 1 ? 'top' : 'bottom',
      size: '27.5px',
    };
    await request({
      url: dbResBarrage.url,
      method: 'POST',
      data: doc,
    });

    return {
      code: 23,
      danmuku: true,
    };
  });
  fastify.get(`/${API_PREFIX}/:version`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>) => {
    let { id } = req.query;
    if (!id) return { code: 0, msg: 'no id', data: [] };
    if (/^(http:\/\/|https:\/\/)/.test(id)) {
      const { origin, pathname } = new URL(id);
      id = `${origin}${pathname}`;
    }

    const dbResBarrage = await setting.get('barrage');
    let { url, id: barrageId, key, support, start, mode, color, content } = dbResBarrage;

    // 分组条件
    const isValidUrl = typeof url === 'string' && /^(https?:\/\/)/.test(url);
    const isValidId = barrageId && ['string', 'number'].includes(typeof barrageId);
    const isValidKey = typeof key === 'string' && key.length > 0;
    const isValidSupport = (Array.isArray(support) && support.length > 0);
    const isValidNumbers = [start, mode, color, content].every(value => typeof value === 'number');
    // 综合判断
    if (!(isValidUrl && isValidId && isValidKey && isValidSupport && isValidNumbers)) return { code: 0, msg: 'no config', data: [] };

    const reqRes = await request({
      url: `${url}${id}`,
      method: 'GET',
    });
    const barrageRes = reqRes?.[key] || [];
    if (!Array.isArray(barrageRes) || barrageRes.length === 0) return { code: 0, msg: 'no comment', data: [] };

    // { time: 230.523, type: "right", color: "#fff", author: "618c713c", text: "键盘妹子挺好看？" }
    const formatBarrage: any[] = barrageRes.map((item) => [
      parseFloat(item[start]),
      item[mode] === 'bottom' ? 2 : item[mode] === 'top' ? 1 : 0,
      item[color],
      uuidv4(),
      item[content],
    ]);
    const res = formatBarrage.concat([]).sort((a, b) => a.time - b.time);

    return { code: 0, msg: 'ok', data: res };
  });
};

export default api;
