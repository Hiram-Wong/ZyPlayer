import _ from 'lodash';
import { FastifyReply, FastifyPluginAsync, FastifyRequest } from 'fastify';

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
      const destination = req.body;
      const source = await setting.source();

      for (let i in destination) {
        const index = _.findIndex(source, { key: i });
        if (index !== -1) {
          source[index]["value"] = destination[i];
        }
      }
      const res = await setting.set(source);
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
      const broadcasterType = await setting.find({ key: "broadcasterType"}).value;
      
      const res = {
        agreementMask,
        theme,
        skipStartEnd,
        broadcasterType
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