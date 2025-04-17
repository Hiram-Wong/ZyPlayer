// (node) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added to [ChildProcess]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
import { fork, ChildProcess } from 'child_process';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import treeKill from 'tree-kill';
import LruCache from '@main/utils/lrucache';
import logger from '@main/core/logger';

const cacheQueueSize: number = 6;

class workerLruCache extends LruCache {
  constructor(capacity: number) {
    super(capacity);
  }

  put(key: string, value: any) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this._terminateProcess(this.cache.get(firstKey)!);
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
    return value;
  }

  delete(key: string): boolean {
    if (this.cache.has(key)) {
      this._terminateProcess(this.cache.get(key)!);
    }
    return this.cache.delete(key);
  }

  private _terminateProcess(child: ChildProcess): void {
    child.removeAllListeners();
    treeKill(child.pid!, 'SIGTERM');
  }
};

const lruCache = new workerLruCache(cacheQueueSize);

class T3Adapter {
  id: string;
  ext: string;
  categoryfilter: string[];
  timeout: number;
  debug: boolean;
  isInit: boolean;
  child: ChildProcess | null;

  constructor(source: { id: string; ext: string; categories: string[] }) {
    this.id = source.id;
    this.ext = source.ext;
    this.categoryfilter = source.categories;
    this.timeout = globalThis.variable.timeout || 5000;
    this.debug = globalThis.variable.debug || false;
    this.isInit = false;
    this.child = null;
  }

  private doWork(child: ChildProcess, data: { [key: string]: any }): Promise<any> {
    return new Promise((resolve, reject) => {
      const handleMessage = (message: any) => {
        resolve(message);
        child.off('message', handleMessage);
      };
      const handleClose = (code: number) => {
        logger.error(`[t3][worker][exit] code ${code}`);
        reject(new Error('Worker closed unexpectedly'));
        child.off('close', handleClose);
      };
      const handleError = (err: Error) => {
        logger.error(`[t3][worker][error] ${err.message}`);
        reject(err);
        child.off('error', handleError);
      };

      child.once('message', handleMessage);
      child.once('close', handleClose);
      child.once('error', handleError);

      child.send(data);
    });
  }

  private async execCtx(options: { [key: string]: any }): Promise<any> {
    this.child = lruCache.get(this.id) || fork(
      resolve(__dirname, 'site_drpy_worker.js'),
      [
        `T3Fork-execCtx-${uuidv4()}`,
        this.timeout.toString(),
        this.debug.toString()
      ]
    );
    lruCache.put(this.id, this.child!);

    if (!this.isInit) {
      if (options.type !== 'init') await this.doWork(this.child!, { type: 'init', data: this.ext });
      this.isInit = true;
    };

    const res = await this.doWork(this.child!, { ...options });
    return res.data;
  }

  async init(): Promise<any> {
    return this.execCtx({ type: 'init', data: this.ext });
  }

  async home(): Promise<{ class: any[]; filters: any }> {
    const res = await this.execCtx({ type: 'home', data: null });
    let classes: any[] = [];

    if (res?.class) {
      const categories = res.class.map((cls: any) => cls.type_name.trim());
      if (this.categoryfilter.length > 0) {
        categories.filter((v: string) => this.categoryfilter.includes(v));
      }
      classes = res.class.map((cls: any) => ({
        type_id: cls.type_id.toString(),
        type_name: cls.type_name.trim(),
      }));

      if (this.categoryfilter.length > 0) {
        classes = classes.filter((cls) => this.categoryfilter.includes(cls.type_name));
      }

      if (this.categoryfilter.length > 0) {
        classes = classes.sort((a, b) => this.categoryfilter.indexOf(a.type_name) - this.categoryfilter.indexOf(b.type_name));
      }
    }

    return {
      class: classes,
      filters: res?.filters || {},
    };
  }

  async homeVod(): Promise<any> {
    return this.execCtx({ type: 'homeVod', data: null });
  }

  async category(doc: { [key: string]: string }): Promise<any> {
    return this.execCtx({ type: 'category', data: doc });
  }

  async detail(doc: { [key: string]: string }): Promise<any> {
    return this.execCtx({ type: 'detail', data: doc });
  }

  async search(doc: { [key: string]: string }): Promise<any> {
    return this.execCtx({ type: 'search', data: doc });
  }

  async play(doc: { [key: string]: string }): Promise<any> {
    return this.execCtx({ type: 'play', data: doc });
  }

  async proxy(doc: { [key: string]: string }): Promise<any> {
    return this.execCtx({ type: 'proxy', data: doc });
  }

  async runMain(doc: { [key: string]: string }): Promise<any> {
    return this.execCtx({ type: 'runMain', data: doc });
  }
}

export default T3Adapter;
