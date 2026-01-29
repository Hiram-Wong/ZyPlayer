import os from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loggerService } from '@logger';
import { appLocale } from '@main/services/AppLocale';
import { dbService } from '@main/services/DbService';
import { fileDelete, fileState, pathExist, readFile, readJson } from '@main/utils/file';
import { APP_PLUGIN_PATH } from '@main/utils/path';
import { LOG_MODULE } from '@shared/config/logger';
import { isArrayEmpty, isJson, isNil, isObjectEmpty } from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import npminstall from 'npminstall';
import workerpool from 'workerpool';

export interface IPluginOptions {
  registry: string;
}

export enum IPluginType {
  UI = 1,
  SYSTEM = 2,
  MIX = 3,
}

export interface IPluginInfo {
  type: `${IPluginType}`;
  name: string;
  pluginName: string;
  author: string;
  description: string;
  readme: string;
  main: string;
  web: string;
  base: string;
  version: string;
  logo: string;
  homepage: string;
  status: boolean;
}

export interface IRawModuleExports {
  start: () => Promise<boolean>;
  stop: () => Promise<boolean>;
  default: {
    start: () => Promise<boolean>;
    stop: () => Promise<boolean>;
  };
}

export interface IModuleExports {
  start: () => Promise<boolean>;
  stop: () => Promise<boolean>;
}

const logger = loggerService.withContext(LOG_MODULE.PLUGIN);

const manageModule = async (entryBasePath: string, modulePath: string, method: 'stop' | 'start'): Promise<boolean> => {
  const workerpool = await import('workerpool');

  ['log', 'info', 'warn', 'error', 'debug'].forEach((method) => {
    const level = method === 'log' ? 'verbose' : method;
    console[method] = (...msgRaw: any[]) => {
      const msg = {
        type: msgRaw.length > 1 ? 'multiple' : 'single',
        msg: msgRaw,
      };

      workerpool.workerEmit({ type: 'log', level, msg });
    };
  });

  const convertValToBool = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value >= 0;
    if (typeof value === 'string') {
      if (['true', 'ok', 'success'].includes(value.toLowerCase())) return true;
      if (['false', 'fail', 'error'].includes(value.toLowerCase())) return false;
      return false;
    }
    if (value instanceof Error) return false;
    return false;
  };

  const hasLifecycle = (obj: unknown, method: 'start' | 'stop'): obj is Record<typeof method, () => unknown> => {
    return typeof obj === 'object' && obj !== null && typeof (obj as any)[method] === 'function';
  };

  try {
    process.chdir(entryBasePath);

    let rawMod: Partial<IRawModuleExports> | undefined;
    if (method === 'start') {
      rawMod = await import(modulePath);
      globalThis.entryModule = rawMod;
    } else if (method === 'stop') {
      rawMod = globalThis.entryModule;
    }

    if (!rawMod) {
      console.warn(`Module not found`);
      return false;
    }

    const cand1 = rawMod?.default ?? undefined;
    const cand2 = (() => {
      const { default: _default, ...rest } = rawMod;
      return Object.keys(rest).length > 0 ? rest : undefined;
    })();

    let mod: Partial<IModuleExports> = {};
    if (hasLifecycle(cand1, method)) mod = cand1;
    if (hasLifecycle(cand2, method)) mod = cand2;

    if (mod && typeof mod === 'object' && Object.keys(mod).length === 0) {
      console.warn(`Module not implement ${method} method`);
      return false;
    }

    const fn = mod?.[method];
    if (typeof fn === 'function') {
      const resp = await fn();
      return convertValToBool(resp);
    }

    return false;
  } catch (error) {
    console.error(`Module execution failed for ${method}`, (error as Error).message);
    return false;
  }
};

class PluginService {
  private static instance: PluginService;
  private baseDir: string = APP_PLUGIN_PATH;
  private syncModules = new Map<string, workerpool.Pool>();
  private readonly registry: string;
  private readonly maxWorkers: number;

  constructor(options?: Partial<IPluginOptions>) {
    this.registry =
      options?.registry ??
      (appLocale.isChinaMainland() ? 'https://registry.npmmirror.com/' : 'https://registry.npmjs.org/');
    this.maxWorkers = Math.max(1, os.cpus().length - 1);
  }

  public static getInstance(): PluginService {
    if (!PluginService.instance) {
      PluginService.instance = new PluginService();
    }
    return PluginService.instance;
  }

  public async autoLaunch(): Promise<void> {
    try {
      const plugins = await dbService.plugin.all();
      const runningPlugins = plugins.filter((p) => p.isActive);

      if (isArrayEmpty(runningPlugins)) return;

      const runningPluginIds = runningPlugins.map((p) => p.id);
      const runningPluginNames = runningPlugins.map((p) => p.pluginName);

      await this.start(runningPluginIds);

      logger.info(`Launched plugins: ${runningPluginNames.join(', ')}`);
    } catch (error) {
      logger.error('Restart plugins failed', error as Error);
    }
  }

  public async clean(): Promise<void> {
    try {
      const poolKeys = this.syncModules.keys();
      for (const key of poolKeys) {
        const pool = this.syncModules.get(key);
        if (pool) {
          pool.terminate();
          this.syncModules.delete(key);
        }
      }
      this.syncModules.clear();
    } catch (error) {
      logger.error('Clean plugin pool failed', error as Error);
    }
  }

  /**
   * Install plugin
   */
  public async install(projects: string[]): Promise<IModels['plugin'][]> {
    const plugins: string[] = [];

    for (const plugin of projects) {
      try {
        const pluginBasePath = join(this.baseDir, plugin);
        if (!(await pathExist(pluginBasePath)) || (await fileState(pluginBasePath)) !== 'dir') {
          logger.warn(`Not found plugin working directory`);
          continue;
        }

        const pkgPath = join(pluginBasePath, 'package.json');
        if (!(await pathExist(pkgPath)) || (await fileState(pkgPath)) !== 'file') {
          logger.warn(`Not found package.json`);
          continue;
        }

        const pkgInfo = await readJson(pkgPath);
        if (isNil(pkgInfo) || isObjectEmpty(pkgInfo)) {
          logger.warn(`Not compliant documents in package.json`);
          continue;
        }

        const dbInfo = (await dbService.plugin.getByField({ base: pluginBasePath }))?.[0] || {};

        // meta
        const type = pkgInfo?.pluginType ?? 'system';
        const readmePath = join(pluginBasePath, 'README.md');
        const readme = (await pathExist(readmePath)) ? await readFile(readmePath) : '### Empty';
        const main =
          type !== 'ui' && pkgInfo?.main ? pathToFileURL(resolve(pluginBasePath, pkgInfo.main)).toString() : '';
        const web =
          type !== 'system' && pkgInfo?.web ? pathToFileURL(resolve(pluginBasePath, pkgInfo.web)).toString() : '';
        if (!main && !web) continue;

        const data = {
          name: pkgInfo?.name || plugin,
          pluginName: pkgInfo?.pluginName || pkgInfo?.name || plugin,
          type: type === 'ui' ? 1 : type === 'system' ? 2 : 3,
          description: pkgInfo?.description ?? '',
          readme,
          base: pluginBasePath,
          main,
          web,
          version: pkgInfo?.version ?? '0.0.0',
          author: pkgInfo?.author ?? '',
          homepage: pkgInfo?.homepage ?? '',
          logo: pkgInfo?.logo ?? '',
          isActive: false,
        } as IModels['plugin'];

        const pluginNodeModulesPath = join(pluginBasePath, 'node_modules');
        await fileDelete(pluginNodeModulesPath);
        const pluginPkgLockPath = join(pluginBasePath, 'package-lock.json');
        await fileDelete(pluginPkgLockPath);

        await npminstall({ root: pluginBasePath, registry: this.registry, ignoreScripts: false });

        if (pluginBasePath === dbInfo?.base) {
          await dbService.plugin.update([dbInfo.id], data);
          plugins.push(dbInfo.id);
        } else {
          const newPlugin = await dbService.plugin.add(data);
          plugins.push(newPlugin?.[0]?.id);
        }
      } catch (error) {
        logger.error('Plugin install error', error as Error);
      }
    }

    return await dbService.plugin.getByField({ id: plugins });
  }

  /**
   * Uninstall plugin
   */
  public async uninstall(plugins: string[]): Promise<IModels['plugin'][]> {
    for (const plugin of plugins) {
      try {
        const pluginInfo = await dbService.plugin.get(plugin);
        if (isNil(pluginInfo) || isObjectEmpty(pluginInfo)) {
          logger.warn(`Not found plugin in database`);
          await dbService.plugin.remove([plugin]);
          continue;
        }

        const pluginBasePath = pluginInfo.base;
        if (!(await pathExist(pluginBasePath)) || (await fileState(pluginBasePath)) !== 'dir') {
          logger.warn(`Not found plugin working directory`);
          await dbService.plugin.remove([plugin]);
          continue;
        }

        await this.stop([plugin]);

        const pluginNodeModulesPath = join(pluginBasePath, 'node_modules');
        await fileDelete(pluginNodeModulesPath);
        const pluginPkgLockPath = join(pluginBasePath, 'package-lock.json');
        await fileDelete(pluginPkgLockPath);

        await dbService.plugin.remove([plugin]);
      } catch (error) {
        logger.error('Plugin uninstall error', error as Error);
      }
    }

    return await dbService.plugin.getByField({ id: plugins });
  }

  /**
   * Start plugin
   */
  public async start(plugins: string[]): Promise<IModels['plugin'][]> {
    for (const plugin of plugins) {
      try {
        const pluginInfo = await dbService.plugin.get(plugin);
        if (isNil(pluginInfo) || isObjectEmpty(pluginInfo)) {
          logger.warn(`Not found plugin in database`);
          continue;
        }

        const pluginBasePath = pluginInfo.base;
        if (!(await pathExist(pluginBasePath)) || (await fileState(pluginBasePath)) !== 'dir') {
          logger.warn(`Not found plugin working directory`);
          await dbService.plugin.remove([plugin]);
          continue;
        }

        if (pluginInfo.type !== IPluginType.SYSTEM) continue;
        // if (pluginInfo.isActive) return true;

        if (pluginInfo.main?.endsWith('.js')) {
          const poolKey = pluginInfo.name!;
          let pool = this.syncModules.get(poolKey);
          if (pool) continue;

          const entryBasePath = fileURLToPath(dirname(pluginInfo.main));

          pool = workerpool.pool({
            maxWorkers: this.maxWorkers,
            workerType: 'process',
            forkOpts: {
              cwd: entryBasePath,
            },
          });

          this.syncModules.set(poolKey, pool);

          let status = false;
          try {
            // pool.
            const resp = await pool.exec(manageModule, [entryBasePath, pluginInfo.main, 'start'], {
              on(payload) {
                const { type, level, msg } = payload;

                if (type === 'log') {
                  const msgType = msg?.type;
                  const msgList = msg?.msg ?? [];

                  const log =
                    msgType === 'single'
                      ? msgList[0]
                      : msgList.map((t: any) => (isJson(t) ? JSON.stringify(t) : t)).join(' ');

                  const logger = loggerService.withContext(`${LOG_MODULE.PLUGIN}<${pluginInfo.pluginName}>`);
                  logger[level](log);
                }
              },
            });
            status = resp;
          } catch (error) {
            logger.error(`Plugin ${plugin} startup error:`, error as Error);
          } finally {
            if (!status) {
              await pool.terminate();
              this.syncModules.delete(poolKey);
            }
            await dbService.plugin.update([pluginInfo.id], { isActive: status } as IModels['plugin']);
          }
        }
      } catch (error) {
        logger.error('plugin start error', error as Error);
      }
    }

    return await dbService.plugin.getByField({ id: plugins });
  }

  /**
   * Stop plugin
   */
  public async stop(plugins: string[]): Promise<IModels['plugin'][]> {
    for (const plugin of plugins) {
      try {
        const pluginInfo = await dbService.plugin.get(plugin);
        if (isNil(pluginInfo) || isObjectEmpty(pluginInfo)) {
          logger.warn(`Not found plugin in database`);
          continue;
        }

        const pluginBasePath = pluginInfo.base;
        if (!(await pathExist(pluginBasePath)) || (await fileState(pluginBasePath)) !== 'dir') {
          logger.warn(`Not found plugin working directory`);
          await dbService.plugin.remove([plugin]);
          continue;
        }

        if (pluginInfo.type !== IPluginType.SYSTEM) continue;
        // if (!pluginInfo.isActive) continue;

        if (pluginInfo.main?.endsWith('.js')) {
          const poolKey = pluginInfo.name!;
          const pool = this.syncModules.get(poolKey);
          if (!pool) continue;

          try {
            const entryBasePath = fileURLToPath(dirname(pluginInfo.main));
            await pool.exec(manageModule, [entryBasePath, pluginInfo.main, 'stop'], {
              on(payload) {
                const { type, level, msg } = payload;

                if (type === 'log') {
                  const msgType = msg?.type;
                  const msgList = msg?.msg ?? [];

                  const log =
                    msgType === 'single'
                      ? msgList[0]
                      : msgList.map((t: any) => (isJson(t) ? JSON.stringify(t) : t)).join(' ');

                  const logger = loggerService.withContext(`${LOG_MODULE.PLUGIN}<${pluginInfo.pluginName}>`);
                  logger[level](log);
                }
              },
            });
          } catch (error) {
            logger.warn(`Plugin ${plugin} stop error:`, error as Error);
          } finally {
            await pool.terminate();
            this.syncModules.delete(poolKey);
            await dbService.plugin.update([pluginInfo.id], { isActive: false } as IModels['plugin']);
          }
        }
      } catch (error) {
        logger.error('plugin stop error', error as Error);
      }
    }

    return await dbService.plugin.getByField({ id: plugins });
  }
}

export const pluginService = PluginService.getInstance();
