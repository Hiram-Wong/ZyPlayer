import db from '.'
const { drive } = db
export default {
  async all () {
    return await drive.toArray()
  },
  async clear () {
    return await drive.clear()
  },
  async add (doc) {
    return await drive.add(doc)
  },
  async bulkAdd (doc) {
    return await drive.bulkAdd(doc)
  },
  async find (doc) {
    return await drive.get(doc)
  },
  async get (id) {
    return await drive.get(id)
  },
  async update (id, docs) {
    return await drive.update(id, docs)
  },
  async remove (id) {
    return await drive.delete(id)
  },
  async pagination(keyword) {
    let list = await drive.toArray()
    if (keyword) list = list.filter(item => item.name.includes(keyword))
    const total = list.length
    return {
      list: list,
      total: total
    }
  },
}
