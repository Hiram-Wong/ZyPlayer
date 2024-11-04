import star from './star';
import history from './history';
import setting from './setting';
import { db } from './db';
// import proxy from './proxy';
// import catbox from './catbox';
import { ai, jsEdit, staticFilter } from './lab';
import file from './file';
import { barrge } from './player';
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
  // proxy,
  // catbox,
  ai,
  jsEdit,
  staticFilter,
  file,
  barrge,
  system,
};

export default routesModules;
