import type { ICacheService } from '@shared/cache';

declare module 'fastify' {
  interface FastifyInstance {
    cache: ICacheService;
  }
}
