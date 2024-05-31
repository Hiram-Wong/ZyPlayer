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

  db.get('tbl_setting').find({ key: 'version' }).assign({ key: 'version', value: '3.3.7' }).write();
  logger.info('[db][magrite][update3_3_6_to3_3_7]completed');
};

export default update3_3_6_to3_3_7;
