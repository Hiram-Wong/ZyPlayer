import type { IMediaInfoOptions, IMediaScreenshotOptions } from '@main/services/FFmpegService';
import { ffmpegService } from '@main/services/FFmpegService';
import { ffmpegInfoSchema, ffmpegScreenshotSchema } from '@server/schemas/v1/system/ffmpeg';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

const API_PREFIX = 'system/ffmpeg';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    `/${API_PREFIX}/info`,
    { schema: ffmpegInfoSchema },
    async (req: FastifyRequest<{ Body: { url: string; options?: IMediaInfoOptions } }>) => {
      const { url, options } = req.body;
      await ffmpegService.prepare();
      const resp = await ffmpegService.getBaseInfo(url, options);
      return { code: 0, msg: 'ok', data: resp };
    },
  );

  fastify.post(
    `/${API_PREFIX}/screenshot`,
    { schema: ffmpegScreenshotSchema },
    async (req: FastifyRequest<{ Body: { url: string; options?: IMediaScreenshotOptions } }>) => {
      const { url, options } = req.body;
      await ffmpegService.prepare();
      const resp = await ffmpegService.getScreenshot(url, options);
      return { code: 0, msg: 'ok', data: resp };
    },
  );
};

export default api;
