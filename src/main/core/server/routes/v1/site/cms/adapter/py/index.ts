import { exec } from 'child_process';
import JSON5 from 'json5';
import { join } from 'path';
import { PythonShell, PythonShellError } from 'python-shell';
import { promisify } from 'util';
import { platform } from 'process';
import logger from '@main/core/logger';
import request from '@main/utils/request';
import { getAppDefaultPath } from '@main/utils/hiker/path';

const execAsync = promisify(exec);

class T3PyAdapter {
  pythonPath: string = '';
  scriptPath: string = '';
  isPythonInstalled: number = -2; // 0已安装 -1为安装 -2 未检测
  api: string = '';
  extend: any = '';
  categoryfilter: string[] = [];
  fileContent: string = '';

  constructor(source: { api: string; extend: any; categories?: string }) {
    // 基础数据
    this.scriptPath = join(getAppDefaultPath('resources'), 't3PyBase');

    this.isPythonInstalled = -2;
    this.api = source.api;
    this.extend = source.extend;
    this.categoryfilter = source.categories ? source.categories.split(/[,，]/).map((category) => category.trim()) : [];
  }

  // 检查 Python 是否安装
  async checkPython(): Promise<boolean> {
    const command = platform === 'win32' ? 'where python || where python3' : 'which python || which python3';

    try {
      const { stdout } = await execAsync(command);
      const paths = stdout.trim().split('\n').filter(Boolean);

      if (paths.length > 0) {
        this.pythonPath = paths[0];
        this.isPythonInstalled = 0;
        logger.info(`Python found at: ${this.pythonPath}`);
        return true;
      }

      this.isPythonInstalled = -1;
      logger.warn('Python not found in PATH');
      return false;

    } catch (err) {
      this.isPythonInstalled = -1;
      logger.error('Failed to locate Python:', err);
      return false;
    }
  }

  async execCtx(method: string, data: any[] = []): Promise<any> {
    if (this.isPythonInstalled === -2) await this.checkPython();
    if (this.isPythonInstalled === -1) throw new Error('Python not installed');

    return new Promise(async (resolve, reject) => {
      const pyShell = new PythonShell('main.py', {
        mode: 'text',
        pythonOptions: ['-u'],
        scriptPath: this.scriptPath,
        pythonPath: this.pythonPath,
        args: [this.api, method, JSON.stringify(data)],
      });

      let transcript: string = '';

      pyShell.on('message', (message: string) => {
        console.log('message', message);
        transcript = message;
      });

      pyShell.end((err: PythonShellError, _code: number, _signal: string) => {
        console.log('end', err, _code, _signal);

        if (err) {
          logger.error('PythonShell error:', err);
          reject(err);
        } else {
          try {
            resolve(JSON5.parse(transcript));
          } catch (err) {
            logger.error('Failed to parse transcript:', err);
            resolve(transcript);
          }
        }
      });
    });
  }

  async init(): Promise<any> {
    this.fileContent = await request({
      url: this.api,
      method: 'GET',
    });
    return await this.execCtx('homeContent', [this.extend]);
  }

  async home(): Promise<any> {
    const res = await this.execCtx('homeContent', [true]);
    let classes: any[] = [];

    // 分类
    if (res?.class) {
      let categories: any[] = [];
      for (const cls of res?.class) {
        const n = cls.type_name.toString().trim();
        if (categories && categories.length > 0) {
          if (categories.indexOf(n) < 0) continue;
        }
        classes.push({
          type_id: cls.type_id.toString(),
          type_name: n,
        });
      }
      if (categories && categories.length > 0 && this.categoryfilter && this.categoryfilter.length > 0) {
        categories = categories.filter((v) => this.categoryfilter.includes(v.type_name));
      }
      if (categories && categories.length > 0) {
        classes = classes.sort((a, b) => {
          return categories.indexOf(a.type_name) - categories.indexOf(b.type_name);
        });
      }
    }

    return {
      class: classes,
      filters: res?.filters || {},
    };
  }

  async homeVod(): Promise<any> {
    return await this.execCtx('homeVideoContent', []);
  }

  async category(doc: { page: string; tid: string; f: string }): Promise<any> {
    const { page, tid, f } = doc;
    const extend = JSON.parse(f || '{}');
    const filter = Object.keys(extend).length > 0 ? true : false;
    return await this.execCtx('categoryContent', [tid, page, filter, extend]);
  }

  async detail(doc: { id: string }): Promise<any> {
    const { id } = doc;
    return await this.execCtx('detailContent', [[id]]);
  }

  async search(doc: { wd: string; quick?: boolean; pg?: string }): Promise<any> {
    const { wd, quick = false, pg } = doc;
    return await this.execCtx('searchContent', [wd, quick, pg]);
  }

  async play(doc: { flag: string; input: string; flags?: string[] }): Promise<any> {
    const { flag, input, flags = [] } = doc;
    return await this.execCtx('playerContent', [flag, input, flags]);
  }

  runMain(): string {
    return '';
  }
}

export default T3PyAdapter;
