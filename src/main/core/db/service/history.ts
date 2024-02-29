import _ from 'lodash';
import db from '../index';

const TABLE_NAME = 'tbl_history';

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
  clear_part (type) {
    return db.get(TABLE_NAME).remove({ type }).write()
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
  pagination(pageIndex = 0, pageSize = 10, type = 'all') {
    let data = [];
    let total = 0;
    const jumpCount = pageIndex > 0 ? pageIndex*pageSize : 0;

    let items;
    if (type === 'all') {
      items = db.get(TABLE_NAME).orderBy('date', 'desc').value();
    } else {
      items = db.get(TABLE_NAME).filter({ type }).orderBy('date', 'desc').value();
    };

    data = _.slice(items, jumpCount, jumpCount + pageSize);
    total = _.size(items);

    return {
      data: data,
      total: total
    }
  }
}
