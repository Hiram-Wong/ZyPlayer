import { binaryService } from '@main/services/BinaryService';
import { getBinaryListSchema, installBinarySchema } from '@server/schemas/v1/system/binary';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'system/binary';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(`/${API_PREFIX}/list`, { schema: getBinaryListSchema }, async () => {
    const resp = await binaryService.getBinaryList();
    return { code: 0, msg: 'ok', data: resp };
  });

  fastify.post(
    `/${API_PREFIX}/install`,
    { schema: installBinarySchema },
    async (req: FastifyRequest<{ Body: { id: string[] } }>) => {
      const { id } = req.body;
      const resp = await binaryService.installBinary(id);
      return { code: 0, msg: 'ok', data: resp };
    },
  );
};

export default api;
