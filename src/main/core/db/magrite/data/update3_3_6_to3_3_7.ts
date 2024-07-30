import logger from '../../../logger';
import db from '../../index';

const update3_3_6_to3_3_7 = () => {
  const TABLE_NAME = 'tbl_setting';
  db.get(TABLE_NAME)
    .find({ key: 'windowPosition' })
    .assign({
      key: 'windowPosition',
      value: {
        status: false,
        position_main: { width: 1000, height: 640 },
        position_play: { width: 875, height: 550 },
      },
    })
    .write();

  if (db.get(TABLE_NAME).find({ key: 'defaultFilterType' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'defaultFilterType' }).write();
  };
  db.get(TABLE_NAME).insert({ key: 'defaultFilterType', value: 'off' }).write();

  if (db.get(TABLE_NAME).find({ key: 'debug' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'debug' }).write();
  };
  db.get(TABLE_NAME).insert({ key: 'debug', value: false }).write();

  if (db.get(TABLE_NAME).find({ key: 'dns' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'dns' }).write();
  };
  db.get(TABLE_NAME).insert({ key: 'dns', value: false }).write();

  db.get(TABLE_NAME).find({ key: 'version' }).assign({ key: 'version', value: '3.3.7' }).write();
  logger.info('[db][magrite][update3_3_6_to3_3_7]completed');
};

export default update3_3_6_to3_3_7;
