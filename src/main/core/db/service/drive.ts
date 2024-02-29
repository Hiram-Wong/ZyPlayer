import _ from 'lodash';
import db from '../index';

const TABLE_NAME = 'tbl_drive';

export default {
  all () {
    const db_res = db.get(TABLE_NAME).value();
    return _.castArray(db_res);
  },
  update (id, doc) {
    return db.get(TABLE_NAME).find({id}).assign(doc).write();
  },
  clear () {
    return db.set(TABLE_NAME, []).write();
  },
  set (docs) {
    docs = _.castArray(docs);
    return db.set(TABLE_NAME, docs).write();
  },
  find (doc) {
    return db.get(TABLE_NAME).find(doc).value();
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
  },
  pagination(kw) {
    let data = _.castArray(db.get(TABLE_NAME).value());
    if (kw) {
      data = db.get(TABLE_NAME).filter(item => item.name.includes(kw)).value();
    };
    const total = data.length
    return {
      data: data,
      total: total
    }
  },
  search(keyword) {
    let list = db.get(TABLE_NAME).value();
    if (keyword) list = list.filter(item => item.name.includes(keyword))
    const total = list.length
    return {
      list: list,
      total: total
    }
  }
}
