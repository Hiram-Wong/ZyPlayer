import Dexie from 'dexie'
import { sites, iptv, setting, channelList, analyze, history, analyzeHistory } from './initData'

interface DexieDatabase extends Dexie {
  setting: Dexie.Table<Setting, number>;
  star: Dexie.Table<Star, number>;
  sites: Dexie.Table<Site, number>;
  history: Dexie.Table<History, number>;
  iptv: Dexie.Table<Iptv, number>;
  channelList: Dexie.Table<ChannelList, number>;
  analyze: Dexie.Table<Analyze, number>;
  analyzeHistory: Dexie.Table<AnalyzeHistory, number>;
}

const db = new Dexie('zy') as DexieDatabase

db.version(4).stores({
  setting: 'id, theme, externalPlayer, rootClassFilter, r18ClassFilter, defaultHot, defaultSearch, defaultCheckModel, defaultChangeModel, defaultIptvEpg, iptvSkipIpv6, iptvThumbnail, restoreWindowPositionAndSize, pauseWhenMinimize, defaultSite, defaultIptv, defaultAnalyze, analyzeSupport, softSolution, skipStartEnd, agreementMask, recordShortcut, selfBoot, hardwareAcceleration, doh',
  star: '++id, [siteKey+videoId], siteKey, videoId, videoImage, videoName, videoType, videoUpdate',
  sites: '++id, key, name, api, download, jiexiUrl, type, isActive, group',
  history: '++id, [siteKey+videoId], date, siteKey, siteSource, duration, playType, playEnd, videoId, videoImage, videoName, videoIndex, watchTime',
  iptv: '++id, name, url, epg, isActive',
  channelList: '++id, name, logo, url, group',
  analyze: '++id, name, url, isActive',
  analyzeHistory: '++id, [analyzeId+videoUrl], date, analyzeId, videoUrl, videoName',
})

// 开发和稳定版同一版本号会有不同的数据库
// 参考https://github.com/dfahlander/Dexie.js/releases/tag/v3.0.0-alpha.3  upgrade可以改变主键和表名了
// https://dexie.org/docs/Version/Version.stores()
// https://dexie.org/docs/Version/Version.upgrade()
// https://ahuigo.github.io/b/ria/js-indexedDB#/  比较旧，适当参考

db.version(15).stores({
  star: '++id, [siteKey+videoId], siteKey, videoId, videoImage, videoName, videoType, videoUpdate', 
}).upgrade(trans => {
  trans.star.toCollection().modify(star => {
    star.videoUpdate = false
  })
})

db.version(16).stores({
  setting: 'id, theme, externalPlayer, rootClassFilter, r18ClassFilter, defaultHot, defaultSearch, defaultCheckModel, defaultChangeModel, defaultIptvEpg, iptvSkipIpv6, iptvThumbnail, restoreWindowPositionAndSize, pauseWhenMinimize, defaultSite, defaultIptv, defaultAnalyze, analyzeSupport, softSolution, skipStartEnd, agreementMask, recordShortcut, selfBoot, hardwareAcceleration, doh, ua',
}).upgrade(trans => {
  trans.setting.toCollection().modify(setting => {
    setting.ua = ''
  })
})

db.version(17).stores({
  iptv: '++id, name, url, epg, type, isActive',
  setting: 'id, theme, externalPlayer, rootClassFilter, r18ClassFilter, defaultHot, defaultSearch, defaultCheckModel, defaultChangeModel, defaultIptvEpg, iptvSkipIpv6, iptvThumbnail, restoreWindowPositionAndSize, pauseWhenMinimize, defaultSite, defaultIptv, defaultAnalyze, analyzeSupport, analyzeQuickSearchType, softSolution, skipStartEnd, agreementMask, recordShortcut, selfBoot, hardwareAcceleration, doh, communitySubscribe',
}).upgrade(trans => {
  trans.iptv.toCollection().modify(iptv => {
    iptv.type = 'local'
  })
  trans.setting.toCollection().modify(setting => {
    setting.analyzeQuickSearchType = 'platform'
    setting.communitySubscribe = ''
  })
})


db.version(18).stores({
  sites: '++id, key, name, api, download, playUrl, type, isActive, group, search',
  setting: 'id, theme, externalPlayer, rootClassFilter, r18ClassFilter, defaultHot, defaultSearch, defaultCheckModel, defaultChangeModel, defaultIptvEpg, iptvSkipIpv6, iptvThumbnail, restoreWindowPositionAndSize, pauseWhenMinimize, defaultSite, defaultIptv, defaultAnalyze, analyzeFlag, analyzeSupport, softSolution, skipStartEnd, agreementMask, recordShortcut, selfBoot, hardwareAcceleration, doh',
}).upgrade(trans => {
  trans.sites.toCollection().modify(sites => {
    sites.search = 1
  })
  trans.setting.toCollection().modify(setting => {
    setting.analyzeFlag = [
      "youku",
      "qq",
      "iqiyi",
      "qiyi",
      "letv",
      "sohu",
      "tudou",
      "pptv",
      "mgtv"
    ]
  })
})

db.version(19).stores({
  setting: 'id, theme, externalPlayer, rootClassFilter, r18ClassFilter, defaultHot, defaultSearch, defaultCheckModel, defaultChangeModel, defaultIptvEpg, iptvSkipIpv6, iptvThumbnail, restoreWindowPositionAndSize, pauseWhenMinimize, defaultSite, defaultIptv, defaultAnalyze, analyzeFlag, analyzeSupport, broadcasterType, softSolution, skipStartEnd, agreementMask, recordShortcut, selfBoot, hardwareAcceleration, doh',
  history: '++id, [siteKey+videoId], date, siteKey, siteSource, duration, playType, playEnd, videoId, videoImage, videoName, videoIndex, watchTime, skipTimeInStart, skipTimeInEnd',
}).upgrade(trans => {
  trans.setting.toCollection().modify(setting => {
    setting.broadcasterType = "xgplayer"
    setting.softSolution = false
  })
  trans.history.toCollection().modify(history => {
    history.skipTimeInStart = 0
    history.skipTimeInEnd = 0
  })
})

// db.version(20).stores({
//   setting: 'id, theme, externalPlayer, rootClassFilter, r18ClassFilter, defaultHot, defaultSearchRecommend, defaultSearchType, defaultCheckModel, defaultChangeModel, defaultIptvEpg, iptvSkipIpv6, iptvThumbnail, restoreWindowPositionAndSize, pauseWhenMinimize, defaultSite, defaultIptv, defaultAnalyze, analyzeFlag, analyzeSupport, broadcasterType, softSolution, skipStartEnd, agreementMask, recordShortcut, selfBoot, hardwareAcceleration, doh',
//   sites: '++id, key, name, api, download, playUrl, type, isActive, group, search, resource',
// }).upgrade(trans => {
//   trans.setting.toCollection().modify(setting => {
//     setting.defaultSearchType = setting.defaultSearch
//     setting.defaultSearchRecommend = setting.defaultHot
//     setting.defaultHot = "kylive"
//   })
// })

db.version(20).stores({
  sites: '++id, key, name, api, download, playUrl, type, isActive, group, search, resource',
})

db.version(21).stores({
  setting: 'id, theme, externalPlayer, rootClassFilter, r18ClassFilter, defaultHot, defaultSearchRecommend, defaultSearchType, defaultCheckModel, defaultChangeModel, defaultIptvEpg, iptvSkipIpv6, iptvThumbnail, restoreWindowPositionAndSize, pauseWhenMinimize, defaultSite, defaultIptv, defaultAnalyze, analyzeFlag, analyzeSupport, broadcasterType, softSolution, skipStartEnd, agreementMask, recordShortcut, selfBoot, hardwareAcceleration, doh',
}).upgrade(trans => {
  trans.setting.toCollection().modify(setting => {
    setting.defaultSearchType = setting.defaultSearch
    setting.defaultSearchRecommend = setting.defaultHot
    setting.defaultHot = "kylive"
  })
})

db.on('populate', () => {
  db.setting.bulkAdd(setting)
  db.sites.bulkAdd(sites)
  db.iptv.bulkAdd(iptv)
  db.channelList.bulkAdd(channelList)
  db.analyze.bulkAdd(analyze)
  db.history.bulkAdd(history)
  db.analyzeHistory.bulkAdd(analyzeHistory)
})

db.open()

export default db
