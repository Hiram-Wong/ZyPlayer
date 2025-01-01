// (node) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added to [ChildProcess]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
import { fork, ChildProcess } from 'child_process';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import treeKill from 'tree-kill';
import LruCache from '@main/utils/lrucache';
import logger from '@main/core/logger';

class workerLruCache extends LruCache {
  constructor(capacity: number) {
    super(capacity);
  }
  async put(key: string, value: any) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      const child = this.cache.get(firstKey);
      child.removeAllListeners();
      treeKill(child.pid, 'SIGTERM');
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
    return value;
  }
  delete(key: string) {
    if (this.cache.has(key)) {
      const child = this.cache.get(key);
      child.removeAllListeners();
      treeKill(child.pid, 'SIGTERM');
    }
    return this.cache.delete(key);
  }
}

const lruCache = new workerLruCache(3);
var check_init_child: ChildProcess | null = null;
var check_id: string = '';

class T3Adapter {
  id: string = '';
  ext: string = '';
  categoryfilter: any[] = [];
  private timeout: number = 5000;
  isolatedContext: any;
  child: ChildProcess | null = null;

  constructor(source) {
    this.id = source.id;
    this.ext = source.ext;
    this.categoryfilter = source.categories;
    this.timeout = globalThis.variable.timeout || 5000;
  }

  private doWork = (
    child: ChildProcess | null,
    data: { [key: string]: string | object | null },
  ): Promise<{ [key: string]: any }> => {
    return new Promise((resolve, reject) => {
      child!.once('message', (message: { [key: string]: any }) => {
        resolve(message);
      });

      child!.once('close', (code) => {
        logger.error(`[t3][worker][exit] code ${code}`);
        reject(new Error('Worker closed unexpectedly'));
      });

      child!.once('error', (err) => {
        logger.error(`[t3][worker][error] ${err.message}`);
        reject(err);
      });

      child!.send(data);
    });
  };

  private async execCtx(options: { [key: string]: any }): Promise<any> {
    var lru_flag: boolean = lruCache.get(this.id);
    if (!lru_flag && options.type == 'check_init') {
      if (check_init_child && typeof check_init_child.pid === 'number') {
        check_init_child.removeAllListeners();
        treeKill(check_init_child.pid, 'SIGTERM');
      }
      check_id = this.id;
      check_init_child = fork(resolve(__dirname, 'worker.js'), [`T3Fork-execCtx-${uuidv4()}`, this.timeout.toString()]);
      const res = await this.doWork(check_init_child!, { ...options });
      return res.data;
    } else if (!lru_flag && this.id == check_id) {
      const res = await this.doWork(check_init_child!, { ...options });
      return res.data;
    }

    if (lru_flag) {
      this.child = lruCache.get(this.id);
    } else {
      this.child = fork(resolve(__dirname, 'worker.js'), [`T3Fork-execCtx-${uuidv4()}`, this.timeout.toString()]);
      lruCache.put(this.id, this.child);
      if (options.type !== 'init') await this.doWork(this.child!, { type: 'init', data: this.ext });
    }
    const res = await this.doWork(this.child!, { ...options });
    return res.data;
  }

  async init() {
    const res = await this.execCtx({ type: 'init', data: this.ext });
    return res;
  }

  async check_init() {
    const res = await this.execCtx({ type: 'check_init', data: this.ext });
    return res;
  }

  async home() {
    const res = await this.execCtx({ type: 'home', data: null });

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
  async homeVod() {
    const res = await this.execCtx({ type: 'homeVod', data: null });
    return res;
  }
  async category(doc: { [key: string]: string }) {
    const res = this.execCtx({ type: 'category', data: doc });
    return res;
  }
  async detail(doc: { [key: string]: string }) {
    const res = this.execCtx({ type: 'detail', data: doc });
    return res;
  }
  async search(doc: { [key: string]: string }) {
    const res = this.execCtx({ type: 'search', data: doc });
    return res;
  }
  async play(doc: { [key: string]: string }) {
    const res = this.execCtx({ type: 'play', data: doc });
    return res;
  }
  async proxy(doc: { [key: string]: string }) {
    const res = this.execCtx({ type: 'proxy', data: doc });
    return res;
  }
  async runMain(doc: { [key: string]: string }) {
    const res = this.execCtx({ type: 'runMain', data: doc });
    return res;
  }
}

export default T3Adapter;
