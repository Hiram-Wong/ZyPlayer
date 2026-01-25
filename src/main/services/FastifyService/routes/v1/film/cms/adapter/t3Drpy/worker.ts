import workerpool from 'workerpool';

import drpy from './drpy2.min';

const { category, detail, home, homeVod, init, play, proxy, runMain, search } = drpy;

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

const work = (type: string, options?: Record<string, any>) => {
  switch (type) {
    case 'init': {
      const rawResp = init(options);
      try {
        const resp = JSON.parse(rawResp);
        return resp;
      } catch {
        return rawResp;
      }
    }
    case 'home': {
      const rawResp = home();
      const resp = JSON.parse(rawResp);
      return resp;
    }
    case 'homeVod': {
      const rawResp = homeVod();
      const resp = JSON.parse(rawResp);
      return resp;
    }
    case 'category': {
      const { tid, page, extend } = options!;
      const rawResp = category(tid, page, Object.keys(extend).length > 0, Object.keys(extend).length > 0 ? extend : {});
      const resp = JSON.parse(rawResp);
      return resp;
    }
    case 'detail': {
      const { ids } = options!;
      const rawResp = detail(ids);
      const resp = JSON.parse(rawResp);
      return resp;
    }
    case 'play': {
      const { flag, play: input } = options!;
      const rawResp = play(flag, input, []);
      const resp = JSON.parse(rawResp);
      return resp;
    }
    case 'search': {
      const { wd, page } = options!;
      const rawResp = search(wd, false, page);
      const resp = JSON.parse(rawResp);

      return resp;
    }
    case 'proxy': {
      const rawResp = proxy(options);
      const resp = JSON.parse(rawResp);
      return resp;
    }
    case 'runMain': {
      const { func, arg } = options || {};
      const rawResp = runMain(func, arg);
      const resp = JSON.parse(rawResp);
      return resp;
    }
  }
  return null;
};

const main = async (type: string, options?: Record<string, any>) => {
  const resp = work(type, options);
  return resp;
};

workerpool.worker({ main });
