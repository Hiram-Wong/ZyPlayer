import db from '.'
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
  async pagination(keyword) {
    let list = await sites.toArray()
    if (keyword) list = list.filter(item => item.name.includes(keyword))
    const total = list.length
    return {
      list: list,
      total: total
    }
  },
  async group(){
    const groupListLabel = []
    const groupListValue = []
    for (const i of await this.all()) {
      if (groupListLabel.indexOf(i.group) < 0) {
        groupListLabel.push(i.group)
        groupListValue.push(i.group)
      }
    }
    const res = groupListLabel.map((label, i) => ({ label, value: groupListValue[i] }))
    return res
  },
}
