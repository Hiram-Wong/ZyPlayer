// (node) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added to [ChildProcess]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
import { join } from 'path';
import workerpool from 'workerpool';
import LruCache from '@main/utils/lrucache';

const cacheQueueSize: number = 6;

class workerLruCache extends LruCache {
  constructor(capacity: number) {
    super(capacity);
  }
  async put(key: string, value: any) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      const pool = this.cache.get(firstKey);
      await pool.terminate(true);
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
    return value;
  }
  async delete(key: string) {
    if (this.cache.has(key)) {
      const pool = this.cache.get(key);
      await pool.terminate(true);
    }
    return this.cache.delete(key);
  }
}

const lruCache = new workerLruCache(cacheQueueSize);

class T3DrpyAdapter {
  id: string = '';
  ext: string = '';
  categoryfilter: any[] = [];
  timeout: number = 5000;
  cacheQueueSize: number = 6;
  debug: boolean = false;
  isInit: boolean = false;

  constructor(source) {
    this.id = source.id;
    this.ext = source.ext;
    this.categoryfilter = source.categories;
    this.timeout = globalThis.variable.timeout || 5000;
    this.debug = globalThis.variable.debug || false;
    this.cacheQueueSize = cacheQueueSize;
  }

  private async execCtx(options: { [key: string]: any }): Promise<any> {
    let pool = lruCache!.get(this.id);
    if (!pool) {
      pool = workerpool.pool(
        join(__dirname, 'site_drpy_worker.js'),
        { workerType: 'process', maxWorkers: this.cacheQueueSize }
      );
      lruCache!.put(this.id, pool);
    };

    if (!this.isInit) {
      if (options.type !== 'init') {
        await pool.exec(
          'siteDrpyWork',
          [{ type: 'init', data: this.ext }, { timeout: this.timeout, debug: this.debug }]
        );
      }
      this.isInit = true;
    };

    const res = await pool.exec('siteDrpyWork', [{ ...options }, { timeout: this.timeout, debug: this.debug }]);
    return res.data;
  }

  async init() {
    const res = await this.execCtx({ type: 'init', data: this.ext });
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

export default T3DrpyAdapter;
