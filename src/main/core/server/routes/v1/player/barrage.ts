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
    const { id } = req.query;
    if (!id) return { code: 0, msg: 'no id', data: [] };

    const dbResBarrage = await setting.get('barrage');
    let { url, key, support, start, mode, color, content } = dbResBarrage;
    if (!(url && key && support && start && mode && color && content)) return { code: 0, msg: 'no config', data: [] };
    url = url.replace('url=', 'id=');
    const reqRes = await request({
      url: `${url}${id}`,
      method: 'GET',
    });
    if (!reqRes?.[key]) return { code: 0, msg: 'no comment', data: [] };
    const cleanedData = reqRes[key];

    // { time: 230.523, type: "right", color: "#fff", author: "618c713c", text: "键盘妹子挺好看？" }
    const comments = cleanedData.map((item: any) => [
      parseFloat(item[start]),
      item[mode] === 'bottom' ? 2 : item[mode] === 'top' ? 1 : 0,
      item[color],
      uuidv4(),
      item[content],
    ]);
    const res = comments.concat([]).sort((a, b) => a.time - b.time);

    return { code: 0, msg: 'ok', data: res };
  });
};

export default api;
