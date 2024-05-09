import logger from '../../../logger';
import db from '../../index';

const update3_3_3_to3_3_4 = () => {
  const TABLE_NAME = 'tbl_setting';

  if (db.get(TABLE_NAME).find({ key: 'lang' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'lang' }).write();
  }
  db.get(TABLE_NAME).insert({ key: 'lang', value: 'zh_CN' }).write();
  if (db.get(TABLE_NAME).find({ key: 'defaultViewCasual' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'defaultViewCasual' }).write();
  }
  db.get(TABLE_NAME).insert({ key: 'defaultViewCasual', value: '' }).write();
  if (db.get(TABLE_NAME).find({ key: 'barrage' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'barrage' }).write();
  }
  db.get(TABLE_NAME)
    .insert({
      key: 'barrage',
      value: {
        url: '',
        key: 'danmuku',
        support: ['qq', 'qiyi', 'youku', 'mgtv'],
        start: '0',
        mode: '1',
        color: '2',
        content: '4',
      },
    })
    .write();
  if (db.get(TABLE_NAME).find({ key: 'playerMode' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'playerMode' }).write();
  }
  db.get(TABLE_NAME)
    .insert({
      key: 'playerMode',
      value: {
        type: db.get(TABLE_NAME).find({ key: 'broadcasterType' }).value()?.value || 'xgplayer',
        external: db.get(TABLE_NAME).find({ key: 'externalPlayer' }).value()?.value || '',
      },
    })
    .write();
  if (db.get(TABLE_NAME).find({ key: 'snifferMode' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'snifferMode' }).write();
  }
  db.get(TABLE_NAME)
    .insert({
      key: 'snifferMode',
      value: {
        type: db.get(TABLE_NAME).find({ key: 'snifferType' }).value()?.value || 'pie',
        url: '',
      },
    })
    .write();
  if (db.get(TABLE_NAME).find({ key: 'webdev' }).value()?.value) {
    db.get(TABLE_NAME).remove({ key: 'webdev' }).write();
  }
  db.get(TABLE_NAME)
    .insert({
      key: 'webdev',
      value: {
        sync: false,
        data: {
          url: db.get(TABLE_NAME).find({ key: 'webdevUrl' }).value()?.value || 'https://dav.jianguoyun.com/dav/',
          username: db.get(TABLE_NAME).find({ key: 'webdevUsername' }).value()?.value || '',
          password: db.get(TABLE_NAME).find({ key: 'webdevPassword' }).value()?.value || '',
        },
      },
    })
    .write();
  db.get(TABLE_NAME).remove({ key: 'webdevUrl' }).write();
  db.get(TABLE_NAME).remove({ key: 'webdevUsername' }).write();
  db.get(TABLE_NAME).remove({ key: 'webdevPassword' }).write();
  db.get(TABLE_NAME).remove({ key: 'snifferType' }).write();
  db.get(TABLE_NAME).remove({ key: 'broadcasterType' }).write();
  db.get(TABLE_NAME).remove({ key: 'externalPlayer' }).write();
  db.get(TABLE_NAME).find({ key: 'version' }).assign({ key: 'version', value: '3.3.4' }).write();

  logger.info('[db][magrite][update3_3_3_to3_3_4]completed');
};

export default update3_3_3_to3_3_4;
