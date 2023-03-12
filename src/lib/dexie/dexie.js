import Dexie from 'dexie'
import { sites, iptv, setting, channelList, analyze,history } from './initData'

const db = new Dexie('zy')
db.version(4).stores({
  search: '++id, keywords',
  setting: 'id, theme, site, shortcut, view, volume, externalPlayer, searchGroup, excludeRootClasses, excludeR18Films, forwardTimeInSec, starViewMode, recommandationViewMode, searchViewMode, password, proxy, allowPassWhenIptvCheck, autocleanWhenIptvCheck',
  star: '++id, [key+ids], site, name, detail, index, rate, hasUpdate',
  sites: '++id, key, name, api, download, isActive, group',
  history: '++id, [site+ids], name, type, year, index, time, duration, detail',
  iptv: '++id, name, url, isActive',
  channelList: '++id, name, prefer, channels, group, isActive'
})

// 开发和稳定版同一版本号会有不同的数据库
// 参考https://github.com/dfahlander/Dexie.js/releases/tag/v3.0.0-alpha.3  upgrade可以改变主键和表名了
// https://dexie.org/docs/Version/Version.stores()
// https://dexie.org/docs/Version/Version.upgrade()
// https://ahuigo.github.io/b/ria/js-indexedDB#/  比较旧，适当参考

db.version(7).stores({
  sites: '++id, key, name, api, download, jiexiUrl, isActive, group',
  history: '++id, [site+ids], name, type, year, index, time, duration, detail, onlinePlay'
}).upgrade(trans => {
  trans.sites.toCollection().modify(site => {
    site.jiexiUrl = ''
  })
  trans.history.toCollection().modify(record => {
    record.detail.fullList = [].concat(record.detail.m3u8List)
    delete record.detail.m3u8List
  })
  trans.star.toCollection().modify(favorite => {
    favorite.detail.fullList = [].concat(favorite.detail.m3u8List)
    delete favorite.detail.m3u8List
  })
})

db.version(8).stores({
}).upgrade(trans => {
  trans.sites.toCollection().modify(site => {
    if (site.api.includes('7kjx.com')) site.jiexiUrl = 'default'
  })
  trans.setting.toCollection().modify(setting => {
    setting.waitingTimeInSec = 15
    setting.autoChangeSourceWhenIptvStalling = true
  })
})

db.version(9).stores({
  history: '++id, [site+ids], name, type, year, index, time, duration, detail, onlinePlay, hasUpdate'
})

db.version(10).stores({
  setting: 'id, theme, shortcut, view, volume, externalPlayer, searchGroup, excludeRootClasses, excludeR18Films, forwardTimeInSec, starViewMode, recommandationViewMode, searchViewMode, password, proxy, allowPassWhenIptvCheck, autocleanWhenIptvCheck, rootClassFilter, r18ClassFilter, classFilter'
}).upgrade(trans => {
  trans.setting.toCollection().modify(setting => {
    delete setting.site
    setting.rootClassFilter = ['电影', '电影片', '电视剧', '连续剧', '综艺', '动漫']
    setting.r18ClassFilter = ['伦理', '论理', '倫理', '福利', '激情', '理论', '写真', '情色', '美女', '街拍', '赤足', '性感', '里番', 'VIP']
    setting.classFilter = ['电影', '电影片', '电视剧', '连续剧', '综艺', '动漫', '伦理', '论理', '倫理', '福利', '激情', '理论', '写真', '情色', '美女', '街拍', '赤足', '性感', '里番', 'VIP']
  })
})

db.version(11).stores({
  setting: 'id, theme, shortcut, view, volume, externalPlayer, searchGroup, excludeRootClasses, excludeR18Films, forwardTimeInSec, starViewMode, recommandationViewMode,' +
    'searchViewMode, password, proxy, allowPassWhenIptvCheck, autocleanWhenIptvCheck, rootClassFilter, r18ClassFilter, classFilter, restoreWindowPositionAndSize,' +
    'windowPositionAndSize, pauseWhenMinimize, sitesDataURL, defaultParseURL'
}).upgrade(trans => {
  trans.setting.toCollection().modify(setting => {
    setting.restoreWindowPositionAndSize = false
    setting.windowPositionAndSize = {
      x: 0,
      y: 0,
      width: 1080,
      height: 720
    }
    setting.pauseWhenMinimize = false
    setting.sitesDataURL = 'https://raw.iqiq.io/Hunlongyu/ZY-Player-Resources/main/Sites/20220713.json'
    setting.defaultParseURL = 'https://jx.bpba.cc/?v='
    setting.proxy = {
      type: none,
      scheme: "",
      url: "",
      port: ""
    }
  })
})

db.version(12).stores({
  sites: '++id, key, name, api, download, jiexiUrl, type, isActive, group'
}).upgrade(trans => {
  trans.sites.toCollection().modify(site => {
    site.type = 1
  })
})

db.version(13).stores({
  channelList: '++id, name, logo, url, group',
  analyze: '++id, name, url, isActive',
  history: '++id, [siteKey+videoId], date, siteKey, siteSource, duration, playType, playEnd, videoId, videoImage, videoName, videoIndex, watchTime',
  star: '++id, [siteKey+videoId], siteKey, videoId, videoImage, videoName, videoType, videoRemarks', 
  iptv: '++id, name, url, epg, isActive',
})

db.version(14).stores({
  analyzeHistory: '++id, [analyzeId+videoUrl], date, analyzeId, videoUrl, videoName',
})

db.on('populate', () => {
  db.setting.bulkAdd(setting)
  db.sites.bulkAdd(sites)
  db.iptv.bulkAdd(iptv)
  db.channelList.bulkAdd(channelList)
  db.analyze.bulkAdd(analyze)
  db.history.bulkAdd(history)
})

db.open()

export default db
