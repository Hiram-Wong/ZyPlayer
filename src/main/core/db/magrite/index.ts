import db from '../index';
import logger from '../../logger';
import { update3_3_1_to3_3_2, update3_3_3_to3_3_4, update3_3_4_to3_3_5 } from './data';
import { app } from "electron";

/**
 * 判断版本
 * @param versionA '3.3.3'
 * @param versionB '3.3.4'
 * @returns 1:大 -1小 0相等
 */
const compareVersion = (versionA:string, versionB:string) => {
  const partsA = versionA.split('.').map(Number);
  const partsB = versionB.split('.').map(Number);

  // Compare parts from left to right
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;

    if (partA !== partB) {
      return partA > partB ? -1 : 1;
    }
  }

  return 0;
}

const magrite = () => {
  const currentVersion = db.get('tbl_setting').find({ key: 'version' }).value()?.value ?? '';
  const lastVersion = app.getVersion();
  logger.info(`[db][magrite][version][current:${currentVersion}][last:${lastVersion}]`);

  if (compareVersion(currentVersion, lastVersion) === 1) {
    if (!currentVersion) update3_3_1_to3_3_2();
    if (compareVersion(currentVersion, '3.3.4') === 1) update3_3_3_to3_3_4();
    if (compareVersion(currentVersion, '3.3.5') === 1) update3_3_4_to3_3_5();
  }

  logger.info(`[db][magrite]magrite completed`);
}

export default magrite;
