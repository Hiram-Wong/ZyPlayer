import _ from 'lodash';
import db from '../index';

const TABLE_NAME = 'tbl_channel';

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
  search(keyword) {
    let list = db.get(TABLE_NAME).value();
    if (keyword) list = list.filter(item => item.name.includes(keyword))
    const total = list.length
    return {
      list: list,
      total: total
    }
  },
  pagination(pageIndex = 0, pageSize = 10, kw = '', group = '全部') {
    let list = [];
    let total = 0;
    const jumpCount = pageIndex * pageSize;
    if (group == '全部') {
      const items = db.get(TABLE_NAME).filter((x) => {
        return x.name.toLowerCase().includes(kw.toLowerCase());
      }).value();
      list  = _.slice(items, jumpCount, jumpCount + pageSize);
      total = _.size(items);
    } else {
      const items = db.get(TABLE_NAME).filter((x) => {
        return x.group === group && x.name.toLowerCase().includes(kw.toLowerCase());
      }).value();
      list  = _.slice(items, jumpCount, jumpCount + pageSize);
      total = _.size(items);
    }
    
    return {
      list: list,
      total: total
    }
  },
  async class() {
    const group_query = await db.get(TABLE_NAME).map('group').uniq().value();
    const group_query_format = group_query.map(group => ({ type_id: group, type_name: group }))
    const group_all = _.unionWith([{ type_id: '全部', type_name: '全部' }], group_query_format, _.isEqual);
    return group_all;
  }
}
