import { work as starWork } from './star';
import { work as historyWork } from './history';
import { work as settingWork } from './setting';
import { db } from './db';
import { work as proxyWork } from './proxy';
import { ad, ai, jsEdit, staticFilter } from './lab';
import { work as fileWork } from './file';
import { barrage } from './player';
import { work as systemWork } from './system';

import { db as driveDb, work as driveWork } from './drive';
import { channel, iptv } from './live';
import { db as analyzeDb, work as analyzeWork } from './parse';
import { cms, hot, db as sietDb, recomm } from './site';

const routesModules = {
  analyzeDb,
  analyzeWork,
  cms,
  sietDb,
  starWork,
  historyWork,
  hot,
  recomm,
  driveDb,
  driveWork,
  settingWork,
  iptv,
  channel,
  db,
  proxyWork,
  ad,
  ai,
  jsEdit,
  staticFilter,
  fileWork,
  barrage,
  systemWork,
};

export default routesModules;
