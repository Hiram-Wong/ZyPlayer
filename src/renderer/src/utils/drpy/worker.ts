import { init, home, homeVod, category, detail, play, search, proxy, sniffer, isVideo } from './drpy3';

const drpyWork = (parms) => {
  const { type, data } = parms;
  let res = { type, data };
  switch (type) {
    case 'init':
      try {
        init(data);
        res.data = 'sucess';
      } catch(_){
        res.data = 'error';
      }
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
    default:
      break;
  }
  return res;
};

self.onmessage = (e) => {
  const res = drpyWork(e.data);
  self.postMessage(res);
};