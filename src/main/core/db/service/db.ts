import _ from 'lodash';
import db from '../index';

export default {
  all () {
    return db.value();
  },
  clear () {
    return db.setState({}).write();
  },
  init (docs) {
    return db.setState(docs).write();
  }
}