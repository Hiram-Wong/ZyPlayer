import { isJsonStr, isNil } from '@shared/modules/validate';
import workerpool from 'workerpool';

import drpy from './drpy2.min';

const { category, detail, home, homeVod, init, play, proxy, search } = drpy;

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

const handlers: Record<string, (options?: Record<string, any>) => Promise<any>> = {
  async init(options) {
    const resp = init(options);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async home() {
    const resp = home();
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async homeVod() {
    const resp = homeVod();
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async category(options) {
    const { tid, page, extend } = options!;
    const resp = category(tid, page, Object.keys(extend).length > 0, Object.keys(extend).length > 0 ? extend : {});
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async detail(options) {
    const { ids } = options!;
    const resp = detail(ids);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async play(options) {
    const { flag, play: input } = options!;
    const resp = play(flag, input, []);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async search(options) {
    const { wd, page } = options!;
    const resp = search(wd, false, page);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async proxy(options) {
    const resp = proxy(options);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },
};

const main = async (type: string, options?: Record<string, any>) => {
  const handler = handlers[type];
  if (isNil(handler)) throw new Error(`Method not found for type: ${type}`);
  return await handler(options);
};

workerpool.worker({ main });
