import npm from 'npm';
import { join, resolve } from 'path';
import workerpool from 'workerpool';
import { JsonDB, Config } from 'node-json-db';
import logger from '@main/core/logger';
import { fileExist, fileState, readJson, readFile, saveJson, createDir } from '@main/utils/hiker/file';

import { AdapterHandlerOptions, AdapterInfo } from './types';

const runModule = async (modulePath: string, method: 'stop' | 'start') => {
  try {
    const entry = await import(modulePath);
    const res = await entry?.[method]();
    return { code: 0, msg: 'ok', data: res };
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
  public db: JsonDB;
  private pluginCaches: Record<string, string> = {}; // 缓存插件版本
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

    // 初始化插件目录
    if (!fileExist(this.baseDir)) createDir(this.baseDir);
    if (!fileExist(this.pkgPath) || fileState(this.pkgPath) !== 'file') saveJson(this.pkgPath, { dependencies: {} });
    if (!fileExist(this.pluginPath) || fileState(this.pluginPath) !== 'file') saveJson(this.pluginPath, { plugin: [] });

    // 初始化插件列表
    this.db = new JsonDB(new Config(this.pluginPath, true, true, '/'));

    // 启动插件程序
    (async () => {
      let plugins = await this.fetchList();
      plugins = plugins.filter((p) => p.status === 'RUNNING');
      try {
        await this.start(plugins);
      } catch {}
    })();
  }

  /**
   * 读取JSON文件
   * @private
   * @param {string} filePath 文件路径
   * @returns {json} JSON对象
   */
  private readJsonFile(filePath: string) {
    try {
      const content = readJson(filePath);
      return content;
    } catch (err: any) {
      logger.error(`[plugin][readJsonFile][error] ${err.message}`);
      throw new Error(`Failed to read JSON file: ${filePath}`);
    }
  }

  /**
   * 写入JSON文件
   * @private
   * @param {string} filePath 文件路径
   * @param {json} content JSON对象
   */
  private writeJsonFile(filePath: string, content: object) {
    try {
      saveJson(filePath, content);
    } catch (err: any) {
      logger.error(`[plugin][writeJsonFile][error] ${err.message}`);
      throw new Error(`Failed to write JSON file: ${filePath}`);
    }
  }

  async fetchList(plugins: any[] = []) {
    let infoList: AdapterInfo[] = [];

    try {
      if (plugins.length === 0) {
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
   * 获取插件信息
   * @param {plugins}
   * @memberof PluginHandler
   */
  async info(plugins: any[]) {
    try {
      const res = await this.fetchList([...new Set(plugins.map((p) => p.name))]);
      return res;
    } catch (err: any) {
      logger.error(`[plugin][getAdapterInfo][error] ${err.message}`);
    } finally {
      return [];
    }
  }

  /**
   * 安装插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async install(plugins: any[]) {
    // 赋值目录名
    plugins = plugins.map((plugin) => {
      const updatedPlugin = { ...plugin };
      updatedPlugin.pluginName = plugin.name;
      return updatedPlugin;
    });

    for (let plugin of plugins) {
      try {
        // 1.默认参数
        const pkgInfo = this.readJsonFile(join(this.baseDir, 'modules', plugin.pluginName, 'package.json'));
        if (!pkgInfo) continue;
        plugin.name = pkgInfo.name;

        // 2.停止插件
        const index = await this.db.getIndex(`${this.dbTable}`, plugin.name, 'name');
        if (index > -1) await this.stop([plugin]);

        // 3.安装插件
        const module = resolve(this.baseDir, 'modules', plugin.pluginName);
        if (!fileExist(module) || fileState(module) !== 'dir') continue;
        const cmd = plugin.isDev ? 'link' : 'install';
        await this.execCommand(cmd, [module]);

        // 4.插件参数
        if (plugin.isDev) {
          const pluginPath = join(this.baseDir, 'node_modules', plugin.name);
          const pluginInfo = this.readJsonFile(join(pluginPath, 'package.json'));
          const readmePath = join(this.baseDir, 'node_modules', plugin.name, 'README.md');
          if (fileExist(readmePath) && fileState(readmePath) === 'file') plugin.readme = readFile(readmePath);

          plugin = { ...plugin, ...pluginInfo };
        }

        const data = {
          type: plugin?.pluginType || 'system',
          name: plugin?.name || '',
          pluginName: plugin?.pluginName || '',
          author: plugin?.author || '',
          description: plugin?.description || '',
          readme: plugin?.readme || '',
          main: plugin?.main || '',
          version: plugin?.version || '0.0.0',
          logo: plugin?.logo || '',
          status: plugin?.status || 'STOPED',
        };

        if (index > -1) await this.db.push(`${this.dbTable}[${index}]`, data, true);
        else await this.db.push(`${this.dbTable}[]`, data);
      } catch (err: any) {
        logger.error(`[plugin][install][error] ${err.message}`);
      }
    }

    const res = await this.fetchList([...new Set(plugins.map((p) => p.name))]);
    return res;
  }

  /**
   * 卸载插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async uninstall(plugins: any[]) {
    for (const plugin of plugins) {
      try {
        const index = await this.db.getIndex(`${this.dbTable}`, plugin.name, 'name');
        if (index === -1) continue;

        // 停止插件
        await this.stop([plugin]);

        // 卸载插件
        const module = join(this.baseDir, 'node_modules', plugin.name);
        if (!fileExist(module) || fileState(module) !== 'dir') continue;
        const cmd = plugin.isDev ? 'unlink' : 'uninstall';
        await this.execCommand(cmd, [module]);

        // 插件参数
        await this.db.delete(`${this.dbTable}[${index}]`);
      } catch (err: any) {
        logger.error(`[plugin][uninstall][error] ${err.message}`);
      }
    }

    const res = await this.fetchList([...new Set(plugins.map((p) => p.name))]);
    return res;
  }

  /**
   * 升级插件
   * @param plugins 插件名称
   * @memberof AdapterHandler
   */
  async update(plugins: any[]) {
    for (const plugin of plugins) {
      try {
        const module = join(this.baseDir, 'node_modules', plugin.name);
        if (!fileExist(module) || fileState(module) !== 'dir') continue;

        // await this.execCommand('update', [module]);

        const index = await this.db.getIndex(`${this.dbTable}`, plugin.name, 'name');
        if (index === -1) continue;
        const pluginInfo = await this.db.getData(`${this.dbTable}[${index}]`);

        const pkgPath = join(this.baseDir, 'node_modules', plugin.name);
        const pkgInfo = this.readJsonFile(join(pkgPath, 'package.json'));
        if (!pkgInfo) continue;

        if (index > -1 && pkgInfo) {
          const latestVersion = pkgInfo?.version || '0.0.0';
          const installedVersion = pluginInfo?.version || '0.0.0';
          if (latestVersion > installedVersion) await this.install([plugin]);
        }
      } catch (err: any) {
        logger.error(`[plugin][update][error] ${err.message}`);
      }
    }

    const res = await this.fetchList([...new Set(plugins.map((p) => p.name))]);
    return res;
  }

  /**
   * 列出所有已安装插件
   * @memberof AdapterHandler
   */
  async list() {
    try {
      return await this.fetchList();
    } catch (err: any) {
      logger.error(`[plugin][list][error] ${err.message}`);
      return [];
    }
  }

  async start(plugins: any[]) {
    for (const plugin of plugins) {
      const module = join(this.baseDir, 'node_modules', plugin.name);
      if (!fileExist(module) || fileState(module) !== 'dir') continue;

      const index = await this.db.getIndex(`${this.dbTable}`, plugin.name, 'name');
      if (index === -1) continue;
      const pluginInfo = await this.db.getData(`${this.dbTable}[${index}]`);

      if (pluginInfo?.main && pluginInfo?.main.endsWith('.js')) {
        let status = pluginInfo?.status || 'STOPED';
        try {
          let pool = this.syncModules.get(`${plugin.name}`);
          if (!pool) {
            pool = workerpool.pool();
            this.syncModules.set(`${plugin.name}`, pool);
          }

          try {
            let entryModule = resolve(module, pluginInfo.main);
            if (process.platform === 'win32') entryModule = `file:///${entryModule}`;
            const res = await pool.exec(runModule, [entryModule, 'start']);
            if (res.code === 0) status = 'RUNNING';
          } catch (err: any) {
            status = 'STOPED';
            this.syncModules.delete(`${plugin.name}`);
            await pool.terminate();
            logger.error(`[plugin][run][error] ${err.message}`);
          }
        } catch (err: any) {
          logger.error(`[plugin][run][pool] ${err.message}`);
        } finally {
          await this.db.push(`${this.dbTable}[${index}]`, Object.assign({}, pluginInfo, { status }), true);
        }
      }
    }

    const res = await this.fetchList([...new Set(plugins.map((p) => p.name))]);
    return res;
  }

  async stop(plugins: any[]) {
    for (const plugin of plugins) {
      const module = join(this.baseDir, 'node_modules', plugin.name);
      if (!fileExist(module) || fileState(module) !== 'dir') continue;

      const index = await this.db.getIndex(`${this.dbTable}`, plugin.name, 'name');
      if (index === -1) continue;
      const pluginInfo = await this.db.getData(`${this.dbTable}[${index}]`);

      if (pluginInfo?.main && pluginInfo?.main.endsWith('.js')) {
        let status = pluginInfo?.status || 'STOPED';
        try {
          let pool = this.syncModules.get(`${plugin.name}`);
          try {
            status = 'STOPED';
            this.syncModules.delete(`${plugin.name}`);
            if (pool) await pool.terminate();
          } catch (err: any) {
            status = 'STOPED';
            this.syncModules.delete(`${plugin.name}`);
            if (pool) await pool.terminate();
            logger.error(`[plugin][stop][error] ${err.message}`);
          }
        } catch (err: any) {
          logger.error(`[plugin][stop][pool] ${err.message}`);
        } finally {
          await this.db.push(`${this.dbTable}[${index}]`, Object.assign({}, pluginInfo, { status }), true);
        }
      }
    }

    const res = await this.fetchList([...new Set(plugins.map((p) => p.name))]);
    return res;
  }

  /**
   * 执行包管理器命令
   * @memberof AdapterHandler
   */
  private async execCommand(cmd: string, modules: string[]): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      const module = cmd !== 'uninstall' && cmd !== 'link' ? modules.map((m) => `${m}@latest`) : modules;
      const config: { [key: string]: any } = {
        prefix: this.baseDir,
        save: true,
        cache: join(this.baseDir, 'cache'),
        registry: this.registry,
      };

      npm.load(config, (loadErr: any) => {
        if (loadErr) {
          logger.error(`[plugin][execCommand][error] ${loadErr.message}`);
          reject({ code: -1, msg: loadErr.message, data: null });
        }

        npm.commands[cmd](module, function (cmdErr: any, data: any[]) {
          if (cmdErr) {
            logger.error(`[plugin][execCommand][error] ${cmdErr.message}`);
            // reject({ code: -1, msg: cmdErr.message, data: null });
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
