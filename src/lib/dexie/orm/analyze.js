import db from '.'
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
  async pagination(keyword) {
    let list = await analyze.toArray()
    if (keyword) list = list.filter(item => item.name.includes(keyword))
    const total = list.length
    return {
      list: list,
      total: total
    }
  },
}
