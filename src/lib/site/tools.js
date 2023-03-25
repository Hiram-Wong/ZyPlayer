import { sites, setting } from '../dexie';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';
import { Parser as M3u8Parser } from 'm3u8-parser';
import _ from 'lodash';
const { getCurrentWindow } = window.require('@electron/remote');
// // import FLVDemuxer from 'xgplayer-flv.js/src/flv/demux/flv-demuxer.js'
// import SocksProxyAgent from 'socks-proxy-agent'

// 代理设置
// axios使用系统代理  https://evandontje.com/2020/04/02/automatic-system-proxy-configuration-for-electron-applications/
// xgplayer使用chromium代理设置，浏览器又默认使用系统代理 https://www.chromium.org/developers/design-documents/network-settings
// 要在设置中添加代理设置，可参考https://stackoverflow.com/questions/37393248/how-connect-to-proxy-in-electron-webview
const http = window.require('http')
const https =  window.require('http')
const session = getCurrentWindow().webContents.session

// const URL = require('url')
// const request = require('request')


// 定义代理地址
let proxyURL

// 取消axios重复请求  浅析cancelToken https://juejin.cn/post/6844904168277147661 https://masteringjs.io/tutorials/axios/cancel
const CancelToken = axios.CancelToken
const source = CancelToken.source()
const cancelToken = source.token

//axios全局参数
axios.defaults.timeout = 10000 // 请求超时时限，单位毫秒
const TIMEOUT = 20000
axios.defaults.retry = 3 // 重试次数
axios.defaults.retryDelay = 1000 // 请求的间隙

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  if (config.__retryCount === undefined) {
    config.timeout = TIMEOUT
  } else {
    // 时间*增加重试次数
    config.timeout = TIMEOUT * (config.__retryCount + 1)
  }
  return config
}, function (err) {
  return Promise.reject(err)
})

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  return response
}, function (err) { // 请求错误时做些事
  // 请求超时的之后，抛出 err.code = ECONNABORTED的错误..错误信息是 timeout of  xxx ms exceeded
  if (err.code === 'ECONNABORTED' && err.message.indexOf('timeout') !== -1) {
    const config = err.config
    config.__retryCount = config.__retryCount || 0

    if (config.__retryCount >= config.retry) {
      err.message = '多次请求均超时'
      return Promise.reject(err)
    }

    config.__retryCount += 1

    const backoff = new Promise(function (resolve) {
      setTimeout(function () {
        resolve()
      }, config.retryDelay || 1)
    })

    return backoff.then(function () {
      return axios(config)
    })
  } else {
    if (err && !err.response) {
      err.message = '连接服务器失败!'
    }
    return Promise.reject(err)
  }
})

const instance = axios.create();

// 初始化对象xml转json https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/1.GettingStarted.md
const options = { // XML 转 JSON 配置
  trimValues: true,
  textNodeName: '_t',
  ignoreAttributes: false,
  attributeNamePrefix: '_',
  parseAttributeValue: true
}
const parser = new XMLParser(options);

// 资源爬虫
const zy = {
  /**
   * 获取本地资源站点等信息
   * @param {*} key 资源网 key
   * @returns
   */
  getSite (key) {
    return new Promise((resolve, reject) => {
      sites.all().then(res => {
        for (const i of res) {
          if (key === i.key) {
            resolve(i)
          }
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
   * 获取资源分类 和 所有资源的总数, 分页等信息
   * @param {*} key 资源网 key
   * @returns
   */
  class (key) {
    return new Promise((resolve, reject) => {
      this.getSite(key).then(res => {
        const url = res.api
        axios.get(url).then(res => {
          const json = res.data
          const jsondata = json?.rss === undefined ? json : json.rss
          if (!jsondata?.class || !jsondata?.list) resolve()
          const doc = {
            class: jsondata.class,
            page: jsondata.page,
            pagecount: jsondata.pagecount,
            pagesize: parseInt(jsondata.limit),
            recordcount: jsondata.total
          }
          resolve(doc)
        }).catch(err => {
          reject(err)
        })
      })
    })
  },
  /**
   * 获取资源列表
   * @param {*} key 资源网 key
   * @param {number} [pg=1] 翻页 page
   * @param {*} t 分类 type
   * @returns
   */
  list (key, pg = 1, t) {
    return new Promise((resolve, reject) => {
      this.getSite(key).then(res => {
        const site = res
        let url = null
        if (t) {
          url = `${site.api}?ac=videolist&t=${t}&pg=${pg}`
        } else {
          url = `${site.api}?ac=videolist&pg=${pg}`
        }
        axios.get(url).then(async res => {
          const json = res.data
          const jsondata = json.rss === undefined ? json : json.rss
          const videoList = jsondata.list
          if (videoList && videoList.length) {
            resolve(videoList)
          } else {
            resolve([])
          }
        }).catch(err => {
          reject(err)
        })
      })
    })
  },
  /**
   * 获取资源热榜列表
   * @param {*} key 资源网 key
   * @param {number} [pg=1] 翻页 page
   * @param {*} t 分类 type
   * @param {*} h 时间 time
   * @returns
   */
  // https://y.ioszxc123.me/api/v1/Vod/hot?limit=10&order=1&os=2&page=1&type=2
  hot (key, h) {
    return new Promise((resolve, reject) => {
      this.getSite(key).then(res => {
        const site = res
        let url = null
        url = `${site.api}?ac=hot&h=${h}`
        axios.get(url).then(async res => {
          const json = res.data
          const jsondata = json.rss === undefined ? json : json.rss
          const videoList = jsondata.list
          if (videoList && videoList.length) {
            resolve(videoList)
          } else {
            resolve([])
          }
        }).catch(err => {
          reject(err)
        })
      })
    })
  },
  /**
   * 获取总资源数, 以及页数
   * @param {*} key 资源网
   * @param {*} t 分类 type
   * @returns page object
   */
  page (key, t) {
    return new Promise((resolve, reject) => {
      this.getSite(key).then(res => {
        const site = res
        let url = ''
        if (t) {
          url = `${site.api}?ac=videolist&t=${t}`
        } else {
          url = `${site.api}?ac=videolist`
        }
        axios.get(url).then(async res => {
          const data = res.data.match(/<list [^>]*>/)[0] + '</list>' // 某些源站不含页码时获取到的数据parser无法解析
          const json = parser.parse(data)
          const jsondata = json.rss === undefined ? json : json.rss
          const pg = {
            page: jsondata.list._page,
            pagecount: jsondata.list._pagecount,
            pagesize: jsondata.list._pagesize,
            recordcount: jsondata.list._recordcount
          }
          resolve(pg)
        }).catch(err => {
          reject(err)
        })
      })
    })
  },
  /**
   * 搜索资源
   * @param {*} key 资源网 key
   * @param {*} wd 搜索关键字
   * @returns
   */
  search (key, wd) {
    return new Promise((resolve, reject) => {
      this.getSite(key).then(res => {
        const site = res
        const url = `${site.api}?wd=${encodeURI(wd)}`
        axios.get(url, { timeout: 3000 }).then(res => {
          const json = res.data
          const jsondata = json?.rss === undefined ? json : json.rss
          if (json && jsondata.total > 0) {
            let videoList = jsondata.list
            if (Object.prototype.toString.call(videoList) === '[object Object]') videoList = [].concat(videoList)
            if (videoList?.length) {
              resolve(videoList)
            } else {
              resolve()
            }
          } else {
            resolve()
          }
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
   * 搜索资源详情
   * @param {*} key 资源网 key
   * @param {*} wd 搜索关键字
   * @returns
   */
  searchFirstDetail (key, wd) {
    return new Promise((resolve, reject) => {
      this.getSite(key).then(res => {
        const site = res
        const url = `${site.api}?wd=${encodeURI(wd)}`
        axios.get(url, { timeout: 3000 }).then(res => {
          const json = res.data
          const jsondata = json?.rss === undefined ? json : json.rss
          if (jsondata|| jsondata?.list) {
            let videoList = jsondata.list
            if (Object.prototype.toString.call(videoList) === '[object Object]') videoList = [].concat(videoList)
            if (videoList?.length) {
              this.detail(key, videoList[0].vod_id).then(detailRes => {
                resolve(detailRes)
              })
            } else {
              resolve()
            }
          } else {
            resolve()
          }
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
   * 获取资源详情
   * @param {*} key 资源网 key
   * @param {*} id 资源唯一标识符 id
   * @returns
   */
  detail (key, id) {
    return new Promise((resolve, reject) => {
      this.getSite(key).then(res => {
        const url = `${res.api}?ac=videolist&ids=${id}`
        axios.get(url).then(res => {
          const json = res.data
          const jsondata = json?.rss === undefined ? json : json.rss
          const videoList = jsondata?.list[0]
          if (!videoList) resolve()
          // Parse video 
            // 播放源
            const playFrom = videoList.vod_play_from;
            const playSource = playFrom.split('$').filter(e=> e);

            // 剧集
            const playUrl  = videoList.vod_play_url;
            const playUrlDiffPlaySource = playUrl.split('$$$') // 分离不同播放源
            let playEpisodes = []
            _.forEach(playUrlDiffPlaySource, (item) => {
              const playContont = item
              .replace(/\$+/g, '$')
              .split('#')
              .filter((e) => e && (e.startsWith('http') || (e.split('$')[1] && e.split('$')[1].startsWith('http'))));
              playEpisodes.push(playContont);
              // startsWith(playContont, 'http') ? playEpisodes.push(`默认$${playContont}`) : playEpisodes.push(playContont);
            });

            // 合并播放源和剧集
            const fullList= _.zipObject(playSource, playEpisodes)
            videoList.fullList = fullList
          resolve(videoList)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
   * 下载资源
   * @param {*} key 资源网 key
   * @param {*} id 资源唯一标识符 id
   * @returns
   */
  download (key, id, videoFlag) {
    return new Promise((resolve, reject) => {
      let info = ''
      let downloadUrls = ''
      this.getSite(key).then(res => {
        const site = res
        if (site.download) {
          const url = `${site.download}?ac=videolist&ids=${id}&ct=1`
          axios.get(url).then(res => {
            const data = res.data
            const json = parser.parse(data)
            const jsondata = json.rss === undefined ? json : json.rss
            const videoList = jsondata.list.video
            const dd = videoList.dl.dd
            const type = Object.prototype.toString.call(dd)
            if (type === '[object Array]') {
              for (const i of dd) {
                downloadUrls = i._t.replace(/\$+/g, '$').split('#').map(e => encodeURI(e.includes('$') ? e.split('$')[1] : e)).join('\n')
              }
            } else {
              downloadUrls = dd._t.replace(/\$+/g, '$').split('#').map(e => encodeURI(e.includes('$') ? e.split('$')[1] : e)).join('\n')
            }
            if (downloadUrls) {
              info = '调用下载接口获取到的链接已复制, 快去下载吧!'
              resolve({ downloadUrls: downloadUrls, info: info })
            } else {
              throw new Error()
            }
          }).catch((err) => {
            err.info = '无法获取到下载链接，请通过播放页面点击“调试”按钮获取'
            reject(err)
          })
        } else {
          zy.detail(key, id).then(res => {
            const dl = res.fullList.find(e => e.flag === videoFlag) || res.fullList[0]
            for (const i of dl.list) {
              const url = encodeURI(i.includes('$') ? i.split('$')[1] : i)
              downloadUrls += (url + '\n')
            }
            if (downloadUrls) {
              info = '视频源链接已复制, 快去下载吧!'
              resolve({ downloadUrls: downloadUrls, info: info })
            } else {
              throw new Error()
            }
          }).catch((err) => {
            err.info = '无法获取到下载链接，请通过播放页面点击“调试”按钮获取'
            reject(err)
          })
        }
      })
    })
  },
  /**
   * 检查资源
   * @param {*} key 资源网 key
   * @returns boolean
   */
  async check (key) {
    try {
      const cls = await this.class(key)
      if (cls) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  },
  /**
   * 检查直播源
   * @param {*} channel 直播频道 url
   * @returns boolean
   */
   async checkChannel (url) {
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        const manifest = res.data
        const parser = new M3u8Parser()
        parser.push(manifest)
        parser.end()
        const parsedManifest = parser.manifest
        console.log(parsedManifest)
        if (parsedManifest.segments.length > 0) {
          resolve(true)
        } else {
          // 兼容性处理 抓包多次请求规则 #EXT-X-STREAM-INF 带文件路径的相对路径
          const responseURL = res.request.responseURL
          const { uri } = parsedManifest.playlists[0]
          let newUrl
          if (res.data.indexOf("encoder") > 0) {
            // request1: http://1.204.169.243/live.aishang.ctlcdn.com/00000110240389_1/playlist.m3u8?CONTENTID=00000110240389_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
            // #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8000000,CODECS="avc,mp21" encoder/0/playlist.m3u8?CONTENTID=00000110240127_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
            // request2: http://1.204.169.243/live.aishang.ctlcdn.com/00000110240303_1/encoder/0/playlist.m3u8?CONTENTID=00000110240303_1&AUTHINFO=FABqh274XDn8fkurD5614t%2B1RvYajgx%2Ba3PxUJe1SMO4OjrtFitM6ZQbSJEFffaD35hOAhZdTXOrK0W8QvBRom%2BXaXZYzB%2FQfYjeYzGgKhP%2Fdo%2BXpr4quVxlkA%2BubKvbU1XwJFRgrbX%2BnTs60JauQUrav8kLj%2FPH8LxkDFpzvkq75UfeY%2FVNDZygRZLw4j%2BXtwhj%2FIuXf1hJAU0X%2BheT7g%3D%3D&USERTOKEN=eHKuwve%2F35NVIR5qsO5XsuB0O2BhR0KR
            const index = responseURL.lastIndexOf("\/");
            const urlLastParam= responseURL.substring(0, index+1);
            newUrl = urlLastParam + uri;
            resolve(this.checkChannel(newUrl));
          } else if (uri.indexOf("http")  === 0|| uri.indexOf("//") === 0) {
            // request1: http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/index.m3u8?IASHttpSessionId=OTT8798520230127055253191816
            // #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8468480 http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/1000.m3u8?IASHttpSessionId=OTT8798520230127055253191816&zte_bandwidth=1000&bandwidth=8468480&ispcode=888&timeformat=local&channel=3221225491&m3u8_level=2&ztecid=3221225491
            // request2: http://[2409:8087:3869:8021:1001::e5]:6610/PLTV/88888888/224/3221225491/2/1000.m3u8?IASHttpSessionId=OTT8867820230127053805215983&zte_bandwidth=1000&bandwidth=8467456&ispcode=888&timeformat=local&channel=3221225491&m3u8_level=2&ztecid=3221225491
            newUrl = uri
            resolve(this.checkChannel(newUrl));
          } else if (/^\/[^\/]/.test(uri) || (/^[^\/]/.test(uri) && uri.indexOf("http" === 0))) {
            // request1: http://baidu.live.cqccn.com/__cl/cg:live/__c/hxjc_4K/__op/default/__f//index.m3u8
            // #EXT-X-STREAM-INF:BANDWIDTH=15435519,AVERAGE-BANDWIDTH=15435519,RESOLUTION=3840x2160,CODECS="hvc1.1.6.L150.b0,mp4a.40.2",AUDIO="audio_mp4a.40.2_48000",CLOSED-CAPTIONS=NONE,FRAME-RATE=25 1/v15M/index.m3u8
            // request2: http://baidu.live.cqccn.com/__cl/cg:live/__c/hxjc_4K/__op/default/__f//1/v15M/index.m3u8
            const index = responseURL.lastIndexOf("\/");
            const urlLastParam= responseURL.substring(0, index+1);
            newUrl = urlLastParam + uri;
            resolve(this.checkChannel(newUrl));
          }
          resolve(false);
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
   * 检查直播源
   * @param {*} parserFilmUrl film url
   * @returns boolean
   */
  async parserFilmUrl (url) {
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        const urlDomain = url.match(/(\w+):\/\/([^\:|\/]+)(\:\d*)?(\/)/)[0];
        console.log(urlDomain);
        const urlParm = res.data.match(/\/(.*?)(\.m3u8)/)[0];
        const urlPlay = urlDomain + urlParm;
        console.log(urlParm);
        console.log(urlPlay);
        resolve(urlPlay);
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
  * 获取直播源电子节目单
  * @param {*} url epg阶段单api
  * @param {*} tvg_name 节目名称
  * @param {*} date 日期 2023-01-31
  * @returns 直播源电子节目单列表
  */
  iptvEpg (url, tvg_name, date) {
    return new Promise((resolve, reject) => {
      axios.get(url,{params: {
        ch: tvg_name,
        date: date
      }}).then(res => {
        const epgData = res.data.epg_data
        resolve(epgData)
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
  * 判断 m3u8 文件是否为直播流
  * @param {*} url m3u8地址
  * @returns 是否是直播流
  */
  isLiveM3U8(url)  {
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        const data = res.data
        const isLive = !data.includes('#EXT-X-ENDLIST');
        resolve(isLive)
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
   * 获取豆瓣页面链接
   * @param {*} id 视频唯一标识
   * @param {*} name 视频名称
   * @param {*} year 视频年份
   * @returns 豆瓣页面链接，如果没有搜到该视频，返回搜索页面链接
   */
  doubanLink (id, name, year) {
    return new Promise((resolve, reject) => {
      // 豆瓣搜索链接
      let nameToSearch
      let doubanSearchLink
      if (id && parseInt(id) !== 0) doubanSearchLink = `https://movie.douban.com/subject/${id}`
      else {
        nameToSearch = name.replace(/\s/g, '')
        doubanSearchLink = `https://www.douban.com/search?cat=1002&q=${nameToSearch}`
      }
      axios.get(doubanSearchLink).then(res => {
        const $ = cheerio.load(res.data)
        // 查询所有搜索结果, 看名字和年代是否相符
        let link = ''
        $('div.result').each(function () {
          const linkInDouban = $(this).find('div>div>h3>a').first()
          const nameInDouban = linkInDouban.text().replace(/\s/g, '')
          const subjectCast = $(this).find('span.subject-cast').text()
          if (nameToSearch === nameInDouban && subjectCast &&subjectCast.includes(year)) {
            link = linkInDouban.attr('href')
            return
          }
        })
        if (link) {
          resolve(link)
        } else {
          // 如果没找到符合的链接，返回搜索页面
          resolve(doubanSearchLink)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
   * 获取豆瓣评分
   * @param {*} id 视频唯一标识
   * @param {*} name 视频名称
   * @param {*} year 视频年份
   * @returns 豆瓣评分
   */
  doubanRate (id, name, year) {
    return new Promise((resolve, reject) => {
      this.doubanLink(id, name, year).then(link => {
        if (link.includes('https://www.douban.com/search')) {
          resolve('暂无评分')
        } else {
          axios.get(link).then(response => {
            const parsedHtml = cheerio.load(response.data)
            const rating = parsedHtml('body').find('#interest_sectl').first().find('strong').first()
            if (rating.text()) {
              resolve(rating.text().replace(/\s/g, ''))
            } else {
              resolve('暂无评分')
            }
          }).catch(err => {
            reject(err)
          })
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
  * 获取豆瓣相关视频推荐列表
  * @param {*} id 视频唯一标识
  * @param {*} name 视频名称
  * @param {*} year 视频年份
  * @returns 豆瓣相关视频推荐列表
  */
  doubanRecommendations (id, name, year) {
    return new Promise((resolve, reject) => {
      const recommendations = []
      this.doubanLink(id, name, year).then(link => {
        if (link.includes('https://www.douban.com/search')) {
          resolve(recommendations)
        } else {
          axios.get(link).then(response => {
            const $ = cheerio.load(response.data)
            $('div.recommendations-bd').find('div>dl>dd>a').each(function (index, element) {
              recommendations.push($(element).text())
            })
            resolve(recommendations)
          }).catch(err => {
            reject(err)
          })
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
  * 获取豆瓣热点视频列表
  * @param {*} type 类型
  * @param {*} tag 标签
  * @param {*} limit 显示条数
  * @param {*} start 跳过
  * @returns 豆瓣热点视频推荐列表
  */
  doubanHot (type, tag, limit = 20, start = 0) {
    return new Promise((resolve, reject) => {
      let hotList = []
      const doubanHotLink = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURI(tag)}&page_limit=${limit}&page_start=${start}`
      axios.get(doubanHotLink).then(res => {
        let data = res.data.subjects
        data.forEach((item) => {
          const itemData = {
            vod_id: item.id,
            vod_name: item.title,
            vod_remarks: item.episodes_info
          }
          hotList.push(itemData)
        })
        resolve(hotList)
      }).catch(err => {
        reject(err)
      })
    })
  },
  /**
   * 获取解析url链接的标题
   * @param {*} url 需要解析的地址
   * @returns 解析标题
  */
  getAnalysizeTitle (url) {
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        const $ = cheerio.load(res.data);
        const title = $("title").text();
        resolve(title)
      }).catch(err => { reject(err) })
    })
  },
  /**
   * 获取配置文件
   * @param {*} url 需要获取的地址
   * @returns 配置文件
  */
  getConfig (url) {
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        if (res.data) resolve(res.data)
        else resolve(false);
      }).catch(err => { reject(err) })
    })
  },
  getDefaultSites (url) {
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        resolve(res.data)
      }).catch(err => { reject(err) })
    })
  },
  /**
   * 判断是否支持ipv6
   * @returns ture/false
  */
  checkSupportIpv6 () {
    return new Promise((resolve, reject) => {
      // https://ipw.cn/ipv6/
      axios.get('https://6.ipw.cn').then(res => {
        const ip = res.data
        const isIpv6 = /([0-9a-z]*:{1,4}){1,7}[0-9a-z]{1,4}/i.test(ip);
        resolve(isIpv6)
      }).catch(err => { reject(err) })
    })
  },
  proxy () {
    return new Promise((resolve, reject) => {
      setting.find().then(db => {
        const mode = db.proxy.type
        switch (mode) {
          case 'manual': {
            proxyURL = db.proxy.scheme + '://' + db.proxy.url.trim() + ':' + db.proxy.port.trim()
            session.setProxy({
              proxyRules: proxyURL
            });
            break;
          }
          case 'system': {
            session.setProxy({ mode: 'system' });
            break;
          }
          case 'disable':
          default:
            session.setProxy({ mode: 'direct' });
            break;
        }
        // axios.get('https://api.my-ip.io/ip').then(res => console.log(res))
      })
    })
  }
}

zy.proxy()

export default zy
