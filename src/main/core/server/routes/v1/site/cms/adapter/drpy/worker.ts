/*!
 * @module worker
 * @brief web-worker 专属线程处理
 * @version  3.3.8
 * @author HiramWong <admin@catni.cn>
 * @date 2024-10-25T17:46:29+08:00
 */

import { category, detail, home, homeVod, init, play, proxy, search, runMain } from './drpy3';

const drpyWork = (parms) => {
  const { type, data } = parms;
  let res = { type, data };

  switch (type) {
    case 'init':
      res.data = init(data);
      break;
    case 'home':
      res.data = home();
      res.data = JSON.parse(res.data);
      break;
    case 'homeVod':
      res.data = homeVod();
      res.data = JSON.parse(res.data);
      break;
    case 'category':
      const { tid, page: categoryPg, f } = data;
      const filter = JSON.parse(f || '{}');
      res.data = category(
        tid,
        categoryPg,
        Object.keys(filter).length > 0 ? true : false,
        Object.keys(filter).length > 0 ? filter : {},
      );
      res.data = JSON.parse(res.data);
      break;
    case 'detail':
      const { id: deatilId } = data;
      res.data = detail(deatilId);
      res.data = JSON.parse(res.data);
      break;
    case 'play':
      const { flag, input } = data;
      res.data = play(flag, input, []);
      res.data = JSON.parse(res.data);
      break;
    case 'search':
      const { wd, quick, page: searchPg } = data;
      res.data = search(wd, quick || false, searchPg);
      res.data = JSON.parse(res.data);
      break;
    case 'proxy':
      res.data = proxy(data);
      break;
    case 'runMain':
      const { func, arg } = data;
      res.data = runMain(func, arg);
      break;
    default:
      break;
  }
  return res;
};

process.on('message', (message: { [key: string]: any }) => {
  const res: any = drpyWork(message);
  process.send!(res);
});
