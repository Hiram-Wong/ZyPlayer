import db from '.'
const { searchHistory } = db
export default {
  async add (doc) {
    console.log(doc)
    return await searchHistory.add(doc)
  },
  async find (doc) {
    return await searchHistory.get(doc)
  },
  async bulkAdd (doc) {
    return await searchHistory.bulkAdd(doc)
  },
  async update (id, docs) {
    return await searchHistory.update(id, docs)
  },
  async all () {
    return await searchHistory.toArray()
  },
  async remove (id) {
    return await searchHistory.delete(id)
  },
  async clear () {
    return await searchHistory.clear()
  },
  async pagination(pageIndex = 0, pageSize = 5) {
    const jumpCount = pageIndex > 0 ? pageIndex*pageSize : 0
    return await searchHistory.offset(jumpCount).limit(pageSize).reverse().toArray()
  },
}
