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
  async get (id) {
    return await analyze.get(id)
  },
  async update (id, docs) {
    return await analyze.update(id, docs)
  },
  async remove (id) {
    return await analyze.delete(id)
  },
  async pagination() {
    const list = await analyze.toArray()
    const total = await analyze.count()
    return {
      list: list,
      total: total
    }
  },
}
