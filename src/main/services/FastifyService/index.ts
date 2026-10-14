import type { Buffer } from 'node:buffer';
import { Writable } from 'node:stream';

import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { loggerService } from '@logger';
import { configManager } from '@main/services/ConfigManager';
import { Schema } from '@main/types/server';
import { isDev } from '@main/utils/systemInfo';
import { APP_NAME, APP_VERSION } from '@shared/config/appInfo';
import { PORT } from '@shared/config/env';
import { LOG_MODULE } from '@shared/config/logger';
import { CacheService } from '@shared/modules/cache';
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastify from 'fastify';
import JSON5 from 'json5';
import qs from 'qs';

import { isApiTokenValid, isPublicApiPath, isTrustedCorsOrigin } from './auth';
import routeModules from './routes';
import { ResponseErrorSchema, ResponseRedirectSchema, ResponseSuccessSchema } from './schemas/base';

const logger = loggerService.withContext(LOG_MODULE.FASTIFY);

export class FastifyService {
  private static instance: FastifyService | null = null;
  private server: FastifyInstance | null = null;
  private PORT: number = PORT;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): FastifyService {
    if (!FastifyService.instance) {
      FastifyService.instance = new FastifyService();
    }
    return FastifyService.instance;
  }

  public async start(): Promise<boolean> {
    if (this.server) return true;

    try {
      this.server = fastify({
        ajv: {
          customOptions: {
            allErrors: true,
            coerceTypes: 'array',
            removeAdditional: false,
            // useDefaults: true,
          },
        },
        bodyLimit: 1024 * 1024 * 3,
        connectionTimeout: 65_000,
        disableRequestLogging: true,
        forceCloseConnections: true,
        logger: {
          level: isDev || configManager.debug ? 'debug' : 'info',
          stream: this.createLogStream(),
        },
        requestTimeout: 60_000,
        routerOptions: {
          ignoreTrailingSlash: true,
          maxParamLength: 1024 * 10,
          querystringParser: (str: string) => qs.parse(str),
        },
        trustProxy: true,
      }); // Initialize Fastify server
      this.server.withTypeProvider<TypeBoxTypeProvider>(); // Set TypeBox as the default type provider

      this.registerHandlers(); // Register handlers
      this.registerHooks(); // Register hooks
      this.registerSchemas(); // Register schemas
      await this.registerPlugins(); // Register plugins
      await this.registerRoutes(); // Register routes

      await this.server!.ready(); // Finalize server setup
      if (isDev || configManager.debug) this.server!.swagger(); // swagger documentation
      await this.server!.listen({ port: this.PORT, host: '127.0.0.1' });
    } catch (error) {
      logger.error(`Fastify Service Start Failed: ${(error as Error).message}`);
    }

    return this.status();
  }

  public async stop(): Promise<boolean> {
    if (this.server) {
      try {
        this.server.server.close();
        await this.server.close();
        this.server = null;
      } catch (error) {
        logger.error(`Fastify Service Stop Failed: ${(error as Error).message}`);
      }
    }

    return !this.status();
  }

  public async restart(): Promise<boolean> {
    if (this.server) return true;

    try {
      await this.stop();
      await this.start();
    } catch (error) {
      logger.error(`Fastify Service Restart Failed: ${(error as Error).message}`);
    }

    return this.status();
  }

  public status(): boolean {
    return !!this.server;
  }

  private async registerHandlers(): Promise<void> {
    this.server!.setErrorHandler((error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
      req.log.error(`Fastify Service Uncaught Exception: ${error.message}`);

      const statusCode = error.statusCode ?? 500;

      return reply.code(statusCode).send({
        code: -1,
        msg: statusCode >= 500 && isDev ? 'Internal Server Error' : error.message,
        data: error.validation,
      });
    });
  }

  private async registerHooks(): Promise<void> {
    this.server!.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
      if (req.method === 'OPTIONS') return;
      if (isPublicApiPath(req.method, req.url)) return;
      if (isApiTokenValid(req.headers.authorization)) return;

      return reply.code(401).send({ code: -1, msg: 'Unauthorized', data: null });
    });

    this.server!.addHook('onTimeout', async (req: FastifyRequest, reply: FastifyReply) => {
      req.log.warn(`Fastify Response Timeout: ${req.url}`);

      return reply.code(408).send({
        code: -1,
        msg: 'Request Timeout',
        data: null,
      });
    });
  }

  private async registerPlugins(): Promise<void> {
    // Register CORS
    await this.server!.register(fastifyCors, {
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      origin: (origin, callback) => {
        if (isTrustedCorsOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin is not allowed'), false);
      },
    });

    // Register multipart
    await this.server!.register(fastifyMultipart);

    // Register cache
    this.server!.decorate('cache', CacheService);

    // Register swagger
    if (isDev || configManager.debug) {
      await this.server!.register(fastifySwagger, {
        openapi: {
          openapi: '3.1.0',
          info: {
            title: `${APP_NAME} api`,
            description: 'The Swagger API documentation for the project',

            version: APP_VERSION,
            license: {
              name: 'License',
              url: 'https://www.gnu.org/licenses/agpl-3.0.html',
            },
          },
          externalDocs: {
            url: 'https://swagger.io',
            description: 'Find out more about Swagger',
          },
          servers: [
            {
              url: 'http://127.0.0.1:9978',
              description: 'Development server',
            },
          ],
        },
      });

      await this.server!.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'list',
          deepLinking: true,
          filter: true,
        },
      });
    }
  }

  private async registerSchemas(): Promise<void> {
    this.server!.addSchema({ ...ResponseSuccessSchema, $id: Schema.ApiReponseSuccess });
    this.server!.addSchema({ ...ResponseErrorSchema, $id: Schema.ApiReponseError });
    this.server!.addSchema({ ...ResponseRedirectSchema, $id: Schema.ApiReponseRedirect });
  }

  private async registerRoutes(): Promise<void> {
    const config = {
      routeTimeout: 0,
      routeTimeoutMessage: JSON.stringify({ code: 408, msg: 'Request Timeout' }),
      routeTimeoutGracefully: true, // Trigger onResponse hook even after timeout
    };

    const routes = routeModules;
    for (const { plugin, prefix } of routes) {
      await this.server!.register(plugin, prefix ? { ...config, prefix } : { ...config });
    }
  }

  private createLogStream(): Writable {
    return new Writable({
      write: (chunk: Buffer, _encoding, callback) => {
        try {
          const logData = JSON5.parse(chunk.toString());

          // Pino: trace=10, debug=20, info=30, warn=40, error=50, fatal=60
          const level = logData.level as number;
          const message = logData.msg || '';

          if (level >= 50) {
            logger.error(message);
          } else if (level >= 40) {
            logger.warn(message);
          } else if (level >= 30) {
            logger.info(message);
          } else if (level >= 20) {
            logger.debug(message);
          } else if (level >= 10) {
            logger.silly(message);
          } else {
            logger.debug(message);
          }
        } catch {
          logger.debug(chunk.toString());
        }
        callback();
      },
    });
  }
}

export const fastifyService = FastifyService.getInstance();
