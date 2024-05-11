import badWords from 'bad-words';
import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import _ from 'lodash';
import axios from 'axios';
import { nanoid } from 'nanoid';

import { setting } from '../../db/service';

const API_VERSION = 'api/v1';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_VERSION}/barrge/v3`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const barrage = await setting.find({ key: 'barrage' }).value;
        // { "id": "http://www.iqiyi.com/v_14za0ot37y8.html", "author": "ZyPlayer", "time": 46.032141, "text": "111", "type": 0 }
        const { id, author, time, text, color, type } = req.body as any;
        const doc = {
          player: id,
          author,
          time,
          text,
          color: `#${color.toString(16)}`,
          type: type === 0 ? 'scroll' : type === 1 ? 'top' : 'bottom',
          size: '27.5px',
        };
        await axios.post(barrage.url, doc);
        reply.code(200).send({
          code: 23,
          danmuku: true,
        });
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
  fastify.get(
    `/${API_VERSION}/barrge/v3`,
    async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
      try {
        const barrage = await setting.find({ key: 'barrage' }).value;
        const id = req.query.id;
        let data: any = {
          code: 0, //成功
          data: [],
        };
        const { url, key, support, start, mode, color, content } = barrage;

        if (!id || !(url && key && support && start && mode && color && content)) {
          reply.code(200).send(data);
          return;
        }
        const response = await axios(`${url}${id}`);
        const text: any = response.data;
        const filter = new badWords();
        const cleanedData = text[key].map((item: any) => {
          const cleanedContent = filter.isProfane(item[content]) ? filter.clean(item[content]) : item[content];
          return { ...item, [content]: cleanedContent };
        });

        // { time: 230.523, type: "right", color: "#fff", author: "618c713c", text: "键盘妹子挺好看？" }
        data.data = cleanedData.map((item: any) => [
          parseFloat(item[start]),
          item[mode] === 'bottom' ? 2 : item[mode] === 'top' ? 1 : 0,
          item[color],
          nanoid(),
          item[content],
        ]);
        reply.code(200).send(data);
      } catch (err) {
        reply.code(500).send(err);
      }
    },
  );
};

export default api;
