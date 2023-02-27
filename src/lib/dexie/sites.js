import db from './dexie'
const { sites } = db
export default {
  async all () {
    return await sites.toArray()
  },
  async update (id, docs) {
    return await sites.update(id, docs)
  },
  async clear () {
    return await sites.clear()
  },
  async bulkAdd (doc) {
    return await sites.bulkAdd(doc)
  },
  async find (doc) {
    return await sites.get(doc)
  },
  async get (id) {
    return await sites.get(id)
  },
  async add (doc) {
    return await sites.add(doc)
  },
  async remove (id) {
    return await sites.delete(id)
  },
  async pagination() {
    const list = await sites.toArray()
    const total = await sites.count()
    return {
      list: list,
      total: total
    }
  },
}
