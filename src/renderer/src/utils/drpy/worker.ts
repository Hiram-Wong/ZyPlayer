/*!
 * @module worker
 * @brief web-worker 专属线程处理
 * @version  0.0.1
 * @author HiramWong <admin@catni.cn>
 * @date 2023-03-24T18:21:29+08:00
 */

import {
  category,
  clearConsoleHistory,
  detail,
  encryptJs,
  getConsoleHistory,
  getOriginalJs,
  home,
  homeVod,
  init,
  keepUnUse,
  play,
  proxy,
  search,
} from './drpy3';

const initUtils = () => {
  console.log(`[worker][prevent tree-shake] init t3 not use module`);
  keepUnUse.useful();
};

if (!import.meta.env.DEV) initUtils(); // 防止tree-shake

const drpyWork = (parms) => {
  const { type, data } = parms;
  let res = { type, data };
  switch (type) {
    case 'init':
      res.data = init(data);
      break;
    case 'home':
      res.data = home();
      break;
    case 'homeVod':
      res.data = homeVod();
      break;
    case 'category':
      const { tid, pg: categoryPg, filter, extend } = data;
      res.data = category(tid, categoryPg, filter, extend);
      break;
    case 'detail':
      res.data = detail(data);
      break;
    case 'play':
      const { flag, id, flags } = data;
      res.data = play(flag, id, flags);
      break;
    case 'search':
      const { wd, quick, pg: searchPg } = data;
      res.data = search(wd, quick, searchPg);
      break;
    case 'proxy':
      res.data = proxy(data);
      break;
    case 'decode':
      res.data = getOriginalJs(data);
      break;
    case 'encode':
      const { txt, method } = data;
      res.data = encryptJs(txt, method);
      break;
    case 'console':
      const { type } = data;
      if (type === 'get') res.data = getConsoleHistory();
      else if (type === 'clear') res.data = clearConsoleHistory();
      break;
    default:
      break;
  }
  return res;
};

self.onmessage = (e) => {
  const res = drpyWork(e.data);
  self.postMessage(res);
};
