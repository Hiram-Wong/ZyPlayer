import { base64 } from '@shared/modules/crypto';
import { isArray, isFunction, isJsonStr, isNil } from '@shared/modules/validate';
import workerpool from 'workerpool';

import { BaseSpider, getProxy, req } from './inject';

globalThis.BaseSpider = BaseSpider;
globalThis.getProxy = getProxy;
globalThis.req = req;

let spider: any;

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
    let { id, code, ext, libPath } = options!;

    const cfg = {
      stype: 4,
      skey: id,
      sourceKey: id,
      ext,
    };

    if (code.includes('assets://js/lib/')) {
      code = code.replaceAll('assets://js/lib', `file://${libPath}`);
    }

    const dataUri = `data:text/javascript;base64,${base64.encode({ src: code })}`;
    const modRaw = await import(dataUri);
    const mod = isFunction(modRaw.__jsEvalReturn) ? modRaw.__jsEvalReturn() : (modRaw.default ?? modRaw);

    spider = mod;
    await mod.init(cfg);

    return mod;
  },

  async home() {
    const resp = await spider.home(true);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async homeVod() {
    const resp = await spider.homeVod();
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async category(options) {
    const { tid, page, extend } = options!;
    const resp = await spider.category(
      tid,
      page,
      Object.keys(extend).length > 0,
      Object.keys(extend).length > 0 ? extend : {},
    );
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async detail(options) {
    const { ids } = options!;
    let resp = '{}';
    if (isFunction(spider.detailContent)) {
      resp = await spider.detailContent(isArray(ids) ? ids : [ids]);
    } else {
      resp = await spider.detail(ids);
    }
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async play(options) {
    const { flag, play: input } = options!;
    const resp = await spider.play(flag, input, []);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async search(options) {
    const { wd, page } = options!;
    const resp = await spider.search(wd, false, page);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },

  async proxy(options) {
    const resp = await spider.proxy(options);
    const res = isJsonStr(resp) ? JSON.parse(resp) : resp;
    return res;
  },
};

const main = async (type: string, options?: Record<string, any>) => {
  const handler = handlers[type];
  if (isNil(handler)) throw new Error(`Handler not found for type: ${type}`);
  return await handler(options);
};

workerpool.worker({ main });
