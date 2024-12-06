import { db } from './db';
import { db as driveDb, work as driveWork } from './drive';
import { work as fileWork } from './file';
import { work as historyWork } from './history';
import { ad, ai, jsEdit, staticFilter } from './lab';
import { channel, iptv } from './live';
import { db as analyzeDb, work as analyzeWork } from './parse';
import { barrage } from './player';
import { work as pluginWork } from './plugin';
import { work as proxyWork } from './proxy';
import { work as settingWork } from './setting';
import { cms, hot, db as sietDb, recomm } from './site';
import { work as systemWork } from './system';
import { work as starWork } from './star';

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
  pluginWork,
};

export default routesModules;
