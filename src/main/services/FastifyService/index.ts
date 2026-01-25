import type { FastifyCorsOptions } from '@fastify/cors';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import type { SwaggerOptions as FastifySwaggerOptions } from '@fastify/swagger';
import fastifySwagger from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { loggerService } from '@logger';
import { Schema } from '@main/types/server';
import { APP_DESC, APP_NAME, APP_VERSION } from '@shared/config/appinfo';
import { LOG_MODULE } from '@shared/config/logger';
import { CacheService } from '@shared/modules/cache';
import type { FastifyBaseLogger, FastifyInstance } from 'fastify';
import fastify from 'fastify';
import StatusCodes from 'http-status-codes';
import qs from 'qs';

import routeModules from './routes';
import { HttpErrorResponseSchema, HttpRedirectResponseSchema, HttpSuccessResponseSchema } from './schemas/base';

const logger = loggerService.withContext(LOG_MODULE.FASTIFY);

export class FastifyService {
  private static instance: FastifyService | null = null;
  private server: FastifyInstance | null = null;
  private PORT: number = 9978;

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
        logger: false,
        routerOptions: {
          ignoreTrailingSlash: true,
          maxParamLength: 1024 * 10,
          querystringParser: (str: string) => qs.parse(str),
        },
        forceCloseConnections: true,
        bodyLimit: 1024 * 1024 * 3,
        trustProxy: true,
        requestTimeout: 60_000,
        connectionTimeout: 65_000,
        ajv: {
          customOptions: {
            allErrors: true,
            coerceTypes: 'array',
            removeAdditional: false,
            // useDefaults: true,
          },
        },
      }); // Initialize Fastify server
      this.server.withTypeProvider<TypeBoxTypeProvider>(); // Set TypeBox as the default type provider
      this.server.log = this.customLogger(); // Set custom logger

      this.registerHandlers(); // Register handlers
      this.registerHooks(); // Register hooks
      this.registerSchemas(); // Register schemas
      await this.registerPlugins(); // Register plugins
      await this.registerRoutes(); // Register routes

      await this.server!.ready(); // Finalize server setup
      this.server!.swagger(); // swagger documentation
      await this.server!.listen({ port: this.PORT, host: '0.0.0.0' });
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
    this.server!.setErrorHandler((error: Error, _request, reply) => {
      logger.error(`Fastify Service Uncaught Exception: ${error.message}`);

      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ code: -1, msg: `Internal Server Error - ${error.name}`, data: error.message });
    });
  }

  private async registerHooks(): Promise<void> {
    this.server!.addHook('onTimeout', async (req, reply) => {
      logger.warn(`Fastify Response Timeout: ${req.url}`);
      reply.status(StatusCodes.REQUEST_TIMEOUT).send({ code: -1, msg: 'Request Timeout', data: null });
    });
  }

  private async registerPlugins(): Promise<void> {
    // Register CORS
    await this.server!.register(fastifyCors, {
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      origin: '*',
    } as FastifyCorsOptions);

    // Register multipart
    await this.server!.register(fastifyMultipart);

    // Register cache
    this.server!.decorate('cache', CacheService);

    // Register swagger
    await this.server!.register(fastifySwagger, {
      openapi: {
        info: {
          title: `${APP_NAME} - openapi`,
          description: APP_DESC,
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
      },
    } as FastifySwaggerOptions);
    await this.server!.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
        tryItOutEnabled: true,
        layout: 'BaseLayout',
      },
      staticCSP: true,
      transformSpecificationClone: true,
    } as FastifySwaggerUiOptions);
  }

  private async registerSchemas(): Promise<void> {
    this.server!.addSchema({ ...HttpSuccessResponseSchema, $id: Schema.ApiReponseSuccess });
    this.server!.addSchema({ ...HttpErrorResponseSchema, $id: Schema.ApiReponseError });
    this.server!.addSchema({ ...HttpRedirectResponseSchema, $id: Schema.ApiReponseRedirect });
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

  private customLogger(): FastifyBaseLogger {
    return {
      info: (o: any, ...n: any[]) => logger.info(o, ...(n as any)),
      debug: (o: any, ...n: any[]) => logger.debug(o, ...(n as any)),
      warn: (o: any, ...n: any[]) => logger.warn(o, ...(n as any)),
      error: (o: any, ...n: any[]) => logger.error(o, ...(n as any)),
      fatal: (o: any, ...n: any[]) => logger.error(o, ...(n as any)),
      trace: (o: any, ...n: any[]) => logger.debug(o, ...(n as any)),
      silent: () => {},
      child: () => this.customLogger(),
      level: 'info',
    };
  }
}

export const fastifyService = FastifyService.getInstance();
