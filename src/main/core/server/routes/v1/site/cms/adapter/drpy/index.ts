// (node) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added to [ChildProcess]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
import { fork, ChildProcess } from 'child_process';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import treeKill from 'tree-kill';

let child: ChildProcess | null = null;
const restart = (): void => {
  if (child) {
    child.removeAllListeners();
    treeKill(child.pid!, 'SIGTERM');
  }
  child = null;
  child = fork(resolve(__dirname, 'worker.js'), [`T3DrpyWorker-${uuidv4()}`]);
};

const doWork = (data: { [key: string]: string | object | null }): Promise<{ [key: string]: any }> => {
  return new Promise((resolve, reject) => {
    // 使用 once 来确保监听器只会被触发一次，并且之后自动移除
    child!.once('message', (message: { [key: string]: any }) => {
      resolve(message.data);
    });

    child!.once('close', (code) => {
      console.error(`[worker[T3Drpy][exit] code ${code}`);
      reject(new Error('Worker closed unexpectedly'));
    });

    child!.once('error', (err) => {
      console.error(`[worker[T3Drpy][error] ${err.message}`);
      reject(err);
    });

    child!.send(data);
  });
};
const terminateWork = (): Promise<{ msg: string; code: number }> => {
  return new Promise((resolve, reject) => {
    if (child) {
      child.removeAllListeners();
      treeKill(child.pid!, 'SIGTERM');
      resolve({ msg: 'Worker terminated successfully.', code: 0 });
    } else {
      reject(new Error('Worker is not defined or already terminated.'));
    }
  });
};

export { doWork, terminateWork };

class T3Adapter {
  ext: string = '';
  categoryfilter: any[] = [];
  constructor(source) {
    this.ext = source.ext;
    this.categoryfilter = source.categories;
  }

  async init() {
    restart();
    return await doWork({ type: 'init', data: this.ext });
  }
  async home() {
    const response: any = await doWork({ type: 'home', data: null });
    let classes: any[] = [];

    // 分类
    if (response?.class) {
      let categories: any[] = [];
      for (const cls of response?.class) {
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
      filters: response?.filters || {},
    };
  }
  async homeVod() {
    return await doWork({ type: 'homeVod', data: null });
  }
  async category(doc: { [key: string]: string }) {
    return await doWork({ type: 'category', data: doc });
  }
  async detail(doc: { [key: string]: string }) {
    return await doWork({ type: 'detail', data: doc });
  }
  async search(doc: { [key: string]: string }) {
    return await doWork({ type: 'search', data: doc });
  }
  async play(doc: { [key: string]: string }) {
    return await doWork({ type: 'play', data: doc });
  }
  async runMain(doc: { [key: string]: string }) {
    return await doWork({ type: 'runMain', data: doc });
  }
}

export default T3Adapter;
