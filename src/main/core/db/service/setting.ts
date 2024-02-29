import _ from 'lodash';
import db from '../index';

const TABLE_NAME = 'tbl_setting';

export default {
  all () {
    const db_res = db.get(TABLE_NAME).value();
    return _.castArray(db_res);
  },
  format_all () {
    const db_res = _.castArray(db.get(TABLE_NAME).value());
    const res = _.reduce(_.map(db_res, obj => [obj.key, obj.value]), (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
    return res;
  },
  source () {
    return _.castArray(db.get(TABLE_NAME).value());
  },
  update (id, doc) {
    return db.get(TABLE_NAME).find({id}).assign(doc).write();
  },
  update_data (key, doc) {
    return db.get(TABLE_NAME).find({ key: key }).assign(doc).write();
  },
  clear () {
    return db.set(TABLE_NAME, []).write();
  },
  set (docs) {
    docs = _.castArray(docs);
    return db.set(TABLE_NAME, docs).write();
  },
  find (doc) {
    const res = db.get(TABLE_NAME).find(doc).value();
    if (res) return res;
    else return {
      id: '',
      key: '',
      value: ''
    };
  },
  filter (doc) {
    return db.get(TABLE_NAME).filter(doc).value();
  },
  get (id: string) {
    return db.get(TABLE_NAME).find({ id }).value();
  },
  add (doc) {
    return db.get(TABLE_NAME).insert(doc).write();
  },
  remove (id: string) {
    return db.get(TABLE_NAME).removeById(id).write();
  }
}
