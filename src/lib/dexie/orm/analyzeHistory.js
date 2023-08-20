import db from '.'
const { analyzeHistory } = db
export default {
  async add (doc) {
    return await analyzeHistory.add(doc)
  },
  async bulkAdd (doc) {
    return await analyzeHistory.bulkAdd(doc)
  },
  async find (doc) {
    return await analyzeHistory.where(doc).first()
  },
  async update (id, docs) {
    return await analyzeHistory.update(id, docs)
  },
  async all () {
    return await analyzeHistory.toArray()
  },
  async remove (id) {
    return await analyzeHistory.delete(id)
  },
  async get (id) {
    return await analyzeHistory.get(id)
  },
  async clear () {
    return await analyzeHistory.clear()
  },
  async pagination(pageIndex = 0, pageSize = 10) {
    const jumpCount = pageIndex > 0 ? pageIndex*pageSize : 0
    const list = await analyzeHistory.offset(jumpCount).limit(pageSize).reverse().toArray()
    const total = await analyzeHistory.count()
    return {
      list: list,
      total: total
    }
  },
}
