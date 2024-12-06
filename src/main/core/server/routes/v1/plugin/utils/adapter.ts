import npm from 'npm';
import JSON5 from 'json5';
import { join, resolve } from 'path';
import workerpool from 'workerpool';
import request from '@main/utils/request';
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
    this.registry = options.registry || 'https://registry.npmmirror.com/';

    // 初始化插件目录
    if (!fileExist(this.baseDir)) createDir(this.baseDir);
    if (!fileExist(this.pkgPath) || fileState(this.pkgPath) !== 'file')
      saveJson(this.pkgPath, { dependencies: {}, devDependencies: {} });
    if (!fileExist(this.pluginPath) || fileState(this.pluginPath) !== 'file') saveJson(this.pluginPath, []);

    // 初始化插件列表
    this.pluginList = this.readJsonFile(this.pluginPath) || [];

    (async () => {
      let plugins = this.fetchList();
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

  /**
   * 深度克隆对象
   * @private
   * @param {*} obj
   * @returns {*}
   */
  private deepClone<T>(obj: T): T {
    try {
      return JSON5.parse(JSON5.stringify(obj));
    } catch (err: any) {
      logger.error(`[plugin][deepClone][error] ${err.message}`);
      throw new Error(`Failed to deepClone`);
    }
  }

  fetchList(plugins: any[] = []) {
    const infoList: AdapterInfo[] = [];
    const currentPlugins = this.pluginList;
    const namePlugins = plugins.map((plugin) => plugin.name);

    for (let plugin of currentPlugins) {
      const readmePath = join(this.baseDir, 'node_modules', plugin.name, 'README.md');
      if (fileExist(readmePath) && fileState(readmePath) === 'file') plugin.readme = readFile(readmePath);
      const pluginInfo: AdapterInfo = {
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

      if (plugins.length > 0) {
        if (namePlugins.includes(plugin.name)) {
          infoList.push(pluginInfo);
        }
      } else infoList.push(pluginInfo);
    }

    return infoList;
  }

  /**
   * 获取插件信息
   * @param {plugins}
   * @memberof PluginHandler
   */
  async info(plugins: any[]) {
    let infoList: AdapterInfo[] = [];
    try {
      infoList = this.fetchList(plugins);
    } catch (err: any) {
      logger.error(`[plugin][getAdapterInfo][error] ${err.message}`);
    } finally {
      return infoList;
    }
  }

  /**
   * 安装插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async install(plugins: any[]) {
    const currentPlugins = this.deepClone(this.pluginList);

    for (let plugin of plugins) {
      try {
        const cmd = plugin.isDev ? 'link' : 'install';
        const module = resolve(this.baseDir, 'modules', plugin.name);
        if (!fileExist(module) || fileState(module) !== 'dir') continue;
        await this.execCommand(cmd, [module]);

        const pkg = this.readJsonFile(join(this.baseDir, 'modules', plugin.name, 'package.json'));
        let info;
        if (plugin.isDev) {
          const pluginPath = resolve(this.baseDir, 'node_modules', pkg.name);
          const pluginInfo = this.readJsonFile(join(pluginPath, 'package.json'));
          info = { ...plugin, ...pluginInfo, pluginName: pkg.name };
        }

        const pluginIndex1 = plugins.findIndex((p) => p.name === plugin.name);
        plugins[pluginIndex1].name = pkg.name;
        const pluginIndex2 = currentPlugins.findIndex((p) => p.name === pkg.name);
        if (pluginIndex2 === -1) currentPlugins.unshift(info);
      } catch (err: any) {
        logger.error(`[plugin][install][error] ${err.message}`);
      }
    }

    this.pluginList = currentPlugins;
    this.writeJsonFile(this.pluginPath, this.pluginList);

    return this.fetchList(plugins);
  }

  /**
   * 卸载插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async uninstall(plugins: any[]) {
    const currentPlugins = this.deepClone(this.pluginList);

    for (const plugin of plugins) {
      try {
        const cmd = plugin.isDev ? 'unlink' : 'uninstall';
        const module = join(this.baseDir, 'node_modules', plugin.name);
        if (!fileExist(module) || fileState(module) !== 'dir') continue;

        await this.stop([plugin]);
        await this.execCommand(cmd, [module]);

        const index = currentPlugins.findIndex((p) => p.name === plugin.name);
        if (index > -1) currentPlugins.splice(index, 1);
      } catch (err: any) {
        logger.error(`[plugin][uninstall][error] ${err.message}`);
      }
    }

    this.pluginList = currentPlugins;
    this.writeJsonFile(this.pluginPath, this.pluginList);

    return this.fetchList(plugins);
  }

  /**
   * 更新指定插件
   * @param plugins 插件名称
   * @memberof AdapterHandler
   */
  async update(plugins: any[]) {
    const currentPlugins = this.deepClone(this.pluginList);

    for (const plugin of plugins) {
      const module = join(this.baseDir, 'node_modules', plugin.name);
      if (!fileExist(module) || fileState(module) !== 'dir') continue;
      await this.execCommand('update', [module]);

      const pluginPath = resolve(this.baseDir, 'node_modules', plugin.name);
      const pluginInfo = this.readJsonFile(join(pluginPath, 'package.json'));
      const pluginIndex = currentPlugins.findIndex((p) => `${p.name}` === `${plugin.name}`);
      if (pluginIndex !== -1) currentPlugins[pluginIndex].version = pluginInfo.version || '0.0.0';
    }

    this.pluginList = currentPlugins;
    this.writeJsonFile(this.pluginPath, this.pluginList);

    return this.fetchList(plugins);
  }

  /**
   * 升级插件
   * @param plugins
   * @memberof AdapterHandler
   */
  async upgrade(plugins: any[]) {
    for (let plugin of plugins) {
      try {
        const pkg = await this.readJsonFile(join(this.baseDir, 'package.json'));
        if (Object.keys(pkg.dependencies).length === 0 || !pkg.dependencies?.[plugin.name]) break;
        const installedVersion = pkg.dependencies[plugin.name].replace('^', '');
        let latestVersion = this.pluginCaches[plugin.name];
        if (!latestVersion) {
          const registryUrl = `${this.registry}${plugin.name}`;
          const data = await request({
            method: 'GET',
            url: registryUrl,
            timeout: 2000,
          });
          latestVersion = data['dist-tags'].latest;
          this.pluginCaches[plugin.name] = latestVersion;
        }
        if (latestVersion > installedVersion) {
          await this.install(plugin);
        }
      } catch (err: any) {
        logger.error(`[plugin][upgrade][error] ${err.message}`);
      }
    }

    return this.fetchList(plugins);
  }

  /**
   * 列出所有已安装插件
   * @memberof AdapterHandler
   */
  list() {
    try {
      if (!this.pluginList.length) this.pluginList = this.readJsonFile(this.pluginPath) || [];
      return this.fetchList();
    } catch (err: any) {
      logger.error(`[plugin][list][error] ${err.message}`);
      return [];
    }
  }

  async start(plugins: any[]) {
    const currentPlugins = this.deepClone(this.pluginList);

    for (const plugin of plugins) {
      const module = join(this.baseDir, 'node_modules', plugin.name);
      if (!fileExist(module) || fileState(module) !== 'dir') continue;

      const pluginIndex = currentPlugins.findIndex((p) => `${p.name}` === `${plugin.name}`);
      if (pluginIndex === -1) continue;

      const pluginInfo = currentPlugins[pluginIndex];

      if (pluginInfo?.main && pluginInfo?.main.endsWith('.js')) {
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
            if (res.code === 0) currentPlugins[pluginIndex].status = 'RUNNING';
          } catch (err: any) {
            currentPlugins[pluginIndex].status = 'STOPED';
            this.syncModules.delete(`${plugin.name}`);
            await pool.terminate();
            logger.error(`[plugin][run][error] ${err.message}`);
          }
        } catch (err: any) {
          logger.error(`[plugin][run][pool] ${err.message}`);
        }
      }
    }

    this.pluginList = currentPlugins;
    this.writeJsonFile(this.pluginPath, this.pluginList);

    return this.fetchList(plugins);
  }

  async stop(plugins: any[]) {
    const currentPlugins = this.deepClone(this.pluginList);

    for (const plugin of plugins) {
      const module = join(this.baseDir, 'node_modules', plugin.name);
      if (!fileExist(module) || fileState(module) !== 'dir') continue;

      const pluginIndex = currentPlugins.findIndex((p) => `${p.name}` === `${plugin.name}`);
      if (pluginIndex === -1) continue;

      const pluginInfo = currentPlugins[pluginIndex];

      if (pluginInfo?.main && pluginInfo?.main.endsWith('.js')) {
        try {
          let pool = this.syncModules.get(`${plugin.name}`);
          try {
            if (pool) {
              // let entryModule = resolve(module, pluginInfo.main);
              // if (process.platform === 'win32') entryModule = `file:///${entryModule}`;
              // const res = await pool.exec(runModule, [entryModule, 'stop']);
              // if (res.code === 0) currentPlugins[pluginIndex].status = 'STOPED';
              await pool.terminate();
              this.syncModules.delete(`${plugin.name}`);
              currentPlugins[pluginIndex].status = 'STOPED';
            }
          } catch (err: any) {
            currentPlugins[pluginIndex].status = 'STOPED';
            this.syncModules.delete(`${plugin.name}`);
            if (pool) await pool.terminate();
            logger.error(`[plugin][stop][error] ${err.message}`);
          }
        } catch (err: any) {
          logger.error(`[plugin][stop][pool] ${err.message}`);
        }
      }
    }

    this.pluginList = currentPlugins;
    this.writeJsonFile(this.pluginPath, this.pluginList);

    return this.fetchList(plugins);
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
