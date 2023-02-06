import db from './dexie'
const { analyze } = db
export default {
  async all () {
    return await analyze.toArray()
  },
  async clear () {
    return await analyze.clear()
  },
  async add (doc) {
    return await analyze.add(doc)
  },
  async bulkAdd (doc) {
    return await analyze.bulkAdd(doc)
  },
  async find (doc) {
    return await analyze.get(doc)
  },
  async update (id, docs) {
    return await analyze.update(id, docs)
  },
  async remove (id) {
    return await analyze.delete(id)
  }
}
