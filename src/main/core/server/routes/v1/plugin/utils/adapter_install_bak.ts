import npm from 'npm';
import { dirname, join, resolve } from 'path';
import workerpool from 'workerpool';
import { JsonDB, Config } from 'node-json-db';
import { pathToFileURL, fileURLToPath } from 'url';
import logger from '@main/core/logger';
import {
  deleteFile,
  fileExist,
  fileState,
  readJson,
  readFile,
  saveJson,
  createDir,
  deleteDir,
} from '@main/utils/hiker/file';

import { AdapterHandlerOptions, AdapterInfo } from './types';

const runModule = async (entryBasePath: string, modulePath: string, method: 'stop' | 'start') => {
  try {
    process.chdir(entryBasePath);

    const entry = await import(modulePath);
    if (entry?.method) await entry[method]();
    return { code: 0, msg: 'ok', data: null };
  } catch (err: any) {
    throw err;
  }
};

/**
 * 系统插件管理器
 * @class AdapterHandler
 */
class AdapterHandler {
  public baseDir: string; // 插件安装地址
  public pkgPath: string; // pkg配置文件路径
  public pluginPath: string; // 插件信息配置文件路径
  public pluginList: any[] = []; // 插件列表
  public syncModules = new Map();
  public dbTable: string = '/plugin';
  public db: JsonDB = {} as JsonDB;
  readonly registry: string; // 插件源地址

  /**
   * Creates an instance of AdapterHandler.
   * @param {AdapterHandlerOptions} options
   * @memberof AdapterHandler
   */
  constructor(options: AdapterHandlerOptions) {
    this.baseDir = options.baseDir;
    this.pkgPath = join(this.baseDir, 'package.json');
    this.pluginPath = join(this.baseDir, 'plugin.json');
    this.registry = options?.registry || 'https://registry.npmmirror.com/';

    (async () => await this.init())();
  }

  private async init() {
    // 初始化插件目录
    if (!await fileExist(this.baseDir)) await createDir(this.baseDir);
    if (!await fileExist(this.pluginPath) || await fileState(this.pluginPath) !== 'file') await saveJson(this.pluginPath, { plugin: [] });

    // 初始化插件列表
    this.db = new JsonDB(new Config(this.pluginPath, true, true, '/'));

    // 启动插件程序
    let plugins = await this.fetchList([], true);
    plugins = plugins.filter((p) => p.status === 'RUNNING');
    try {
      await this.start([...new Set(plugins.map((p) => p.name))]);
    } catch {}
  }

  /**
   * 读取JSON文件
   * @private
   * @param {string} filePath 文件路径
   * @returns {json} JSON对象
   */
  private async readJsonFile(filePath: string) {
    try {
      const content = await readJson(filePath);
      return content;
    } catch (err: any) {
      logger.error(`[plugin][readJsonFile][error] ${err.message}`);
      throw new Error(`Failed to read JSON file: ${filePath}`);
    }
  }

  async fetchList(plugins: any[] = [], all: boolean = false) {
    let infoList: AdapterInfo[] = [];

    try {
      if (all) {
        infoList = await this.db.getData(`${this.dbTable}`);
      } else {
        for (let plugin of plugins) {
          const index = await this.db.getIndex(`${this.dbTable}`, plugin, 'name');
          if (index === -1) continue;

          const pluginInfo = await this.db.getData(`${this.dbTable}[${index}]`);
          infoList.push(pluginInfo);
        }
      }
    } catch (err: any) {
      infoList = [];
      logger.error(`[plugin][fetchList][error] ${err.message}`);
    }

    return infoList;
  }

  /**
   * 列出所有已安装插件
   * @memberof AdapterHandler
   */
  async list() {
    try {
      return await this.fetchList([], true);
    } catch (err: any) {
      logger.error(`[plugin][list][error] ${err.message}`);
      return [];
    }
  }

  /**
   * 获取插件信息
   * @param {plugins}
   * @memberof PluginHandler
   */
  async info(plugins: any[]) {
    plugins = [...new Set(plugins)];

    try {
      const res = await this.fetchList(plugins);
      return res;
    } catch (err: any) {
      logger.error(`[plugin][getAdapterInfo][error] ${err.message}`);
      return [];
    }
  }

  /**
   * 安装插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async install(plugins: any[]) {
    plugins = [...new Set(plugins)];
    const projects: any[] = [];

    for (const plugin of plugins) {
      let info: { [key: string]: string } = {};

      try {
        // 1.判断项目存在
        const pluginBasePath = join(this.baseDir, plugin);
        if (!await fileExist(pluginBasePath) || await fileState(pluginBasePath) !== 'dir') continue;

        // 2.设置默认参数
        const pkgPath = join(pluginBasePath, 'package.json');
        if (!await fileExist(pkgPath) || await fileState(pkgPath) !== 'file') continue;
        const pkgInfo = await this.readJsonFile(pkgPath);
        if (!pkgInfo || typeof pkgInfo !== 'object') continue;

        info = { ...info, ...pkgInfo };

        // 2.1 type
        info.type = pkgInfo?.pluginType || 'system';
        // 2.1 readme
        const readmePath = join(pluginBasePath, 'README.md');
        info.readme = `### empty`;
        if (await fileExist(readmePath) && await fileState(readmePath) === 'file') info.readme = (await readFile(readmePath)) || '';
        // 2.2 main
        if (info.type === 'ui') {
          info.main = info?.main ? pathToFileURL(resolve(pluginBasePath, info.main)).toString() : 'about:blank';
        } else if (info?.type === 'system') {
          info.main = info?.main ? pathToFileURL(resolve(pluginBasePath, info.main)).toString() : '';
        }

        // 2.停止插件
        const index = await this.db.getIndex(`${this.dbTable}`, info.name, 'name');
        if (index > -1) await this.stop([info.name]);

        // 3.删除lock文件
        const pluginPkgLockPath = join(pluginBasePath, 'package-lock.json');
        if (await fileExist(pluginPkgLockPath)) await deleteFile(pluginPkgLockPath);

        // 4.安装插件
        const execRes = await this.execCommand('install', { prefix: pluginBasePath }, []);
        if (execRes.code === -1) continue;

        // 5.插件参数
        const data = {
          type: info?.type || 'system',
          name: info?.name || '',
          pluginName: info?.pluginName || info?.name || '',
          pathName: plugin,
          author: info?.author || '',
          description: info?.description || '',
          readme: info?.readme || '',
          main: info?.main || '',
          version: info?.version || '0.0.0',
          logo: info?.logo || '',
          status: info?.status || 'STOPED',
        };
        logger.info(`[plugin][install][data]`, data);

        if (index > -1) await this.db.push(`${this.dbTable}[${index}]`, data, true);
        else await this.db.push(`${this.dbTable}[]`, data);
        projects.push(data.name);
      } catch (err: any) {
        logger.error(`[plugin][install][error] ${err.message}`);
      }
    }

    const res = await this.fetchList(projects, false);
    return res;
  }

  /**
   * 卸载插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async uninstall(plugins: any[]) {
    plugins = [...new Set(plugins)];

    for (const plugin of plugins) {
      try {
        // 1.获取插件信息
        const index = await this.db.getIndex(`${this.dbTable}`, plugin, 'name');
        if (index === -1) continue;
        const pluginInfo = await this.db.getData(`${this.dbTable}[${index}]`);
        if (Object.keys(pluginInfo).length === 0) continue;

        // 2.判断项目存在
        const pluginBasePath = join(this.baseDir, pluginInfo.pathName);
        if (!await fileExist(pluginBasePath) || await fileState(pluginBasePath) !== 'dir') {
          if (index > -1) await this.db.delete(`${this.dbTable}[${index}]`);
          continue;
        }

        // 3.停止插件
        if (index > -1) await this.stop([pluginInfo.name]);

        // 4.删除必要依赖
        const pluginNodeModulesPath = join(pluginBasePath, 'node_modules');
        if (await fileExist(pluginNodeModulesPath) && await fileState(pluginBasePath) === 'dir') await deleteDir(pluginNodeModulesPath);
        const pluginPkgLockPath = join(pluginBasePath, 'package-lock.json');
        if (await fileExist(pluginPkgLockPath) && await fileState(pluginPkgLockPath) === 'file') await deleteFile(pluginPkgLockPath);

        // 5.插件参数
        await this.db.delete(`${this.dbTable}[${index}]`);
      } catch (err: any) {
        logger.error(`[plugin][uninstall][error] ${err.message}`);
      }
    }

    const res = await this.fetchList(plugins, false);
    return res;
  }

  /**
   * 升级插件
   * @param plugins 插件名称
   * @memberof AdapterHandler
   */
  async update(plugins: any[]) {
    plugins = [...new Set(plugins)];

    for (const plugin of plugins) {
      try {
        // 1.获取插件信息
        const index = await this.db.getIndex(`${this.dbTable}`, plugin, 'name');
        if (index === -1) continue;
        const pluginInfo = await this.db.getData(`${this.dbTable}[${index}]`);
        if (Object.keys(pluginInfo).length === 0) continue;

        // 2.判断项目存在
        const pluginBasePath = join(this.baseDir, pluginInfo.pathName);
        if (!await fileExist(pluginBasePath) || await fileState(pluginBasePath) !== 'dir') {
          if (index > -1) await this.db.delete(`${this.dbTable}[${index}]`);
          continue;
        }

        // 3.获取pkg参数
        const pkgPath = join(pluginBasePath, 'package.json');
        if (!await fileExist(pkgPath) || await fileState(pkgPath) !== 'file') continue;
        const pkgInfo = await this.readJsonFile(pkgPath);
        if (!pkgInfo || typeof pkgInfo !== 'object') continue;

        const latestVersion = pkgInfo?.version || '0.0.0';
        const installedVersion = pluginInfo?.version || '0.0.0';
        if (latestVersion > installedVersion) await this.install([pluginInfo.pathName]);
      } catch (err: any) {
        logger.error(`[plugin][update][error] ${err.message}`);
      }
    }

    const res = await this.fetchList(plugins, false);
    return res;
  }

  /**
   * 启动插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async start(plugins: string[]) {
    plugins = [...new Set(plugins)];

    for (const plugin of plugins) {
      try {
        // 1.获取插件信息
        const index = await this.db.getIndex(`${this.dbTable}`, plugin, 'name');
        if (index === -1) continue;
        const pluginInfo = await this.db.getData(`${this.dbTable}[${index}]`);
        if (Object.keys(pluginInfo).length === 0) continue;

        // 2.判断项目存在
        const pluginBasePath = join(this.baseDir, pluginInfo.pathName);
        if (!await fileExist(pluginBasePath) || await fileState(pluginBasePath) !== 'dir') {
          if (index > -1) await this.db.delete(`${this.dbTable}[${index}]`);
          continue;
        }

        // 3.启动插件
        if (pluginInfo?.main && pluginInfo?.main.toString().endsWith('.js')) {
          let status = pluginInfo?.status || 'STOPED';

          try {
            let pool = this.syncModules.get(`${pluginInfo.name}`);
            if (!pool) {
              pool = workerpool.pool({ workerType: 'process' });
              this.syncModules.set(`${pluginInfo.name}`, pool);
            }

            try {
              logger.info(`[plugin][start][${pluginInfo.name}] 入口: ${pluginInfo.main}`);
              const entryBasePath = fileURLToPath(dirname(pluginInfo.main));
              const res = await pool.exec(runModule, [entryBasePath, pluginInfo.main, 'start']);
              if (res.code === 0) status = 'RUNNING';
              else status = 'STOPED';
            } catch (err: any) {
              status = 'STOPED';
              this.syncModules.delete(`${pluginInfo.name}`);
              await pool.terminate();
              logger.error(`[plugin][start][exec][error] ${err.message}`);
            }
          } catch (err: any) {
            logger.error(`[plugin][start][pool][error] ${err.message}`);
          } finally {
            await this.db.push(`${this.dbTable}[${index}]`, Object.assign({}, pluginInfo, { status }), true);
          }
        }
      } catch (err: any) {
        logger.error(`[plugin][start][error] ${err.message}`);
      }
    }

    const res = await this.fetchList(plugins, false);
    return res;
  }

  /**
   * 停止插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async stop(plugins: string[]) {
    plugins = [...new Set(plugins)];

    for (const plugin of plugins) {
      try {
        // 1.获取插件信息
        const index = await this.db.getIndex(`${this.dbTable}`, plugin, 'name');
        if (index === -1) continue;
        const pluginInfo = await this.db.getData(`${this.dbTable}[${index}]`);
        if (Object.keys(pluginInfo).length === 0) continue;

        // 2.判断项目存在
        const pluginBasePath = join(this.baseDir, pluginInfo.pathName);
        if (!await fileExist(pluginBasePath) || await fileState(pluginBasePath) !== 'dir') {
          if (index > -1) await this.db.delete(`${this.dbTable}[${index}]`);
          continue;
        }

        // 3.停止插件
        if (pluginInfo?.main && pluginInfo?.main.toString().endsWith('.js')) {
          let status = pluginInfo?.status || 'STOPED';

          try {
            let pool = this.syncModules.get(`${pluginInfo.name}`);

            try {
              status = 'STOPED';
              this.syncModules.delete(`${pluginInfo.name}`);
              if (pool) await pool.terminate();
            } catch (err: any) {
              status = 'STOPED';
              this.syncModules.delete(`${pluginInfo.name}`);
              if (pool) await pool.terminate();
              logger.error(`[plugin][stop][exec][error] ${err.message}`);
            }
          } catch (err: any) {
            logger.error(`[plugin][stop][pool][error] ${err.message}`);
          } finally {
            await this.db.push(`${this.dbTable}[${index}]`, Object.assign({}, pluginInfo, { status }), true);
          }
        }
      } catch (err: any) {
        logger.error(`[plugin][stop][error] ${err.message}`);
      }
    }

    const res = await this.fetchList(plugins, false);
    return res;
  }

  /**
   * 执行包管理器命令
   * @memberof AdapterHandler
   */
  private async execCommand(
    cmd: string,
    options: { [key: string]: string },
    modules: string[] = [],
  ): Promise<{ code: number; msg: string; data: any[] }> {
    return new Promise(async (resolve: any, reject: any) => {
      const config: { [key: string]: any } = {
        save: true,
        registry: this.registry,
      };

      npm.load(config, (loadErr: any) => {
        npm.config.prefix = options?.prefix || this.baseDir; // 重要, 刷新项目工作路径
        logger.info(`[plugin][execCommand][env][prefix] ${npm.config.prefix}`);

        if (loadErr) {
          logger.error(`[plugin][execCommand][load][error] ${loadErr.message}`);
          reject({ code: -1, msg: loadErr.message, data: null });
        }

        npm.commands[cmd](modules, function (cmdErr: any, data: any[]) {
          if (cmdErr) {
            logger.error(`[plugin][execCommand][${cmd}][error] ${cmdErr.message}`);
            reject({ code: -1, msg: cmdErr.message, data: null });
          }
          logger.info(`[plugin][execCommand][data]`, data);
          resolve({ code: 0, msg: 'ok', data });
        });

        npm.on('log', (message) => {
          logger.info(`[plugin][execCommand][log] ${message}`);
        });
      });
    });
  }
}

export default AdapterHandler;
