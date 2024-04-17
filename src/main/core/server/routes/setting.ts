import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';
import _ from 'lodash';
import { nanoid } from 'nanoid';

import { setting } from '../../db/service';

const API_VERSION = "api/v1";

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_VERSION}/setting`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const res = await setting.add(req.body);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.post(`/${API_VERSION}/setting/default`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { type, id } = req.body;
      const res = await setting.update_data(type, {value: id});
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.get(`/${API_VERSION}/setting/list`, async (_, reply: FastifyReply) => {
    try {
      const res = await setting.format_all();
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.put(`/${API_VERSION}/setting`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const mergeCustomizer = (objValue, srcValue) => {
        // PlainObject检查是否是由 Object 构造函数创建
        if (_.isPlainObject(objValue) && _.isPlainObject(srcValue)) {
          return _.mergeWith({}, objValue, srcValue, mergeCustomizer);
        }
        return srcValue; // 保留源对象非对象属性的值
      };

      const destination = req.body || {};
      const source = await setting.source();
      const mergedSettings = _.mergeWith(_.cloneDeep(source), destination, mergeCustomizer);

      // 添加具有生成ID的新设置项
      const existingKeys = source.map((item) => item.key);
      Object.entries(destination).forEach(([key, value]) => {
        if (!existingKeys.includes(key)) {
          mergedSettings.push({ key, value, id: nanoid() });
        }
      });

      const res = await setting.set(mergedSettings);
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.get(`/${API_VERSION}/setting/setup`, async (_, reply: FastifyReply) => {
    try {
      const agreementMask = await setting.find({ key: "agreementMask"}).value;
      const theme = await setting.find({ key: "theme"}).value;
      const skipStartEnd = await setting.find({ key: "skipStartEnd"}).value;
      const playerMode = await setting.find({ key: "playerMode"}).value;
      const webdev = await setting.find({ key: "webdev"}).value;
      
      const res = {
        agreementMask,
        theme,
        skipStartEnd,
        playerMode,
        webdev
      };
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
  fastify.get(`/${API_VERSION}/setting/detail`, async (req: FastifyRequest<{ Querystring: { [key: string]: string } }>, reply: FastifyReply) => {
    try {
      const { key } = req.query;
      const res = await setting.find({key});
      reply.code(200).send(res);
    } catch (err) {
      reply.code(500).send(err)
    }
  })
}

export default api;