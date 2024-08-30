import db from '../index';
import logger from '../../logger';
import { update3_3_1_to3_3_2, update3_3_3_to3_3_4, update3_3_4_to3_3_5, update3_3_6_to3_3_7 } from './data';
import { compare } from 'compare-versions';
import { app } from 'electron';

const updates = [
  { version: '3.3.2', update: update3_3_1_to3_3_2 },
  { version: '3.3.4', update: update3_3_3_to3_3_4 },
  { version: '3.3.5', update: update3_3_4_to3_3_5 },
  { version: '3.3.7', update: update3_3_6_to3_3_7 },
];

const magrite = () => {
  let dbVersion = db.get('tbl_setting').find({ key: 'version' }).value()?.value ?? '0.0.0';
  const appVersion = app.getVersion();
  logger.info(`[db][magrite][version] db:${dbVersion} - app:${appVersion}`);

  if (compare(dbVersion, appVersion, '<')) {
    for (const { version, update } of updates) {
      if (compare(dbVersion, version, '<')) {
        try {
          update();
          dbVersion = version;
          logger.info(`[db][magrite] ${version} success`);
        } catch (err) {
          logger.error(`[db][magrite] ${version} failed`, err);
        }
      }
    }
  }

  logger.info(`[db][magrite] completed`);
};

export default magrite;
