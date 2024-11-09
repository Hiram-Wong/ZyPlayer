import star from './star';
import history from './history';
import setting from './setting';
import { db } from './db';
import proxy from './proxy';
// import catbox from './catbox';
import { ad, ai, jsEdit, staticFilter } from './lab';
import file from './file';
import { barrage } from './player';
import system from './system';

import { db as driveDb, work as driveWork } from './drive';
import { channel, iptv } from './live';
import { db as analyzeDb, work as analyzeWork } from './parse';
import { cms, hot, db as sietDb, recomm } from './site';

const routesModules = {
  analyzeDb,
  analyzeWork,
  cms,
  sietDb,
  star,
  history,
  hot,
  recomm,
  driveDb,
  driveWork,
  setting,
  iptv,
  channel,
  db,
  proxy,
  // catbox,
  ad,
  ai,
  jsEdit,
  staticFilter,
  file,
  barrage,
  system,
};

export default routesModules;
