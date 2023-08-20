import db from '.'
const { setting } = db
export default {
  async all () {
    return await setting.toArray()
  },
  async find () {
    return await setting.get({ id: 0 })
  },
  async bulkAdd (doc) {
    return await setting.bulkAdd(doc)
  },
  async add (doc) {
    return await setting.add(doc)
  },
  async clear () {
    return await setting.clear()
  },
  async update (docs) {
    return await setting.update(0, docs)
  },
  get (key) {
    return  setting.get({ id: 0 }).then((res)=>{return res[key]})
  }
}
