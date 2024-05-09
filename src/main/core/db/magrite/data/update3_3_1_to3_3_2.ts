import logger from '../../../logger';
import db from '../../index';

const update3_3_1_to3_3_2 = () => {
  const TABLE_NAME = 'tbl_setting';
  db.get(TABLE_NAME)
    .find({ key: 'windowPosition' })
    .assign({
      key: 'windowPosition',
      value: {
        status: false,
        position: { width: 1000, height: 640 },
      },
    })
    .write();
  db.get(TABLE_NAME).remove({ key: 'restoreWindowPositionAndSize' }).write();
  db.get(TABLE_NAME).insert({ key: 'version', value: '3.3.2' }).write();

  logger.info('[db][magrite][update3_3_1_to3_3_2]completed');
};

export default update3_3_1_to3_3_2;
