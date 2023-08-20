import db from '.'
const { channelList } = db
export default {
  async all () {
    return await channelList.toArray()
  },
  async clear () {
    return await channelList.clear()
  },
  async add (doc) {
    return await channelList.add(doc)
  },
  async bulkAdd (doc) {
    return await channelList.bulkAdd(doc)
  },
  async find (doc) {
    return await channelList.get(doc)
  },
  async update (id, docs) {
    return await channelList.update(id, docs)
  },
  async remove (id) {
    return await channelList.delete(id)
  },
  async pagination(pageIndex = 0, pageSize = 10, key = '', group = '全部') {
    let list = []
    let total = []
    const jumpCount = pageIndex > 0 ? pageIndex*pageSize : 0
    if (group == '全部') {
      list = await channelList.filter((x) => {
        return x.name.toLowerCase().indexOf(key) > -1;
      }).offset(jumpCount).limit(pageSize).toArray()
      total = await channelList.filter((x) => {
        return x.name.toLowerCase().indexOf(key) > -1;
      }).count()
    } else {
      list = await channelList.where('group').equalsIgnoreCase(group).filter((x) => {
        return x.name.toLowerCase().indexOf(key) > -1;
      }).offset(jumpCount).limit(pageSize).toArray()
      total = await channelList.where('group').equalsIgnoreCase(group).filter((x) => {
        return x.name.toLowerCase().indexOf(key) > -1;
      }).count()
    }
    
    return {
      list: list,
      total: total
    }
  },
  async total(){
    return await channelList.count()
  },
  async class(){
    const groupListLabel = []
    const groupListValue = []
    for (const i of await this.all()) {
      if (groupListLabel.indexOf(i.group) < 0) {
        groupListLabel.push(i.group)
        groupListValue.push(i.group)
      }
    }
    const res = groupListLabel.map((label, i) => ({ 'id': label, 'name': groupListValue[i] }))
    return res
  }
}
