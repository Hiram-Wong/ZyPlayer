/*
 * @File     : spider.js
 * @Author   : jade
 * @Date     : 2024/3/22 15:17
 * @Email    : jadehh@1ive.com
 * @Software : Samples
 * @Desc     :
 */

import { Spider } from '../utils/spider';
import { JadeLogging } from '../utils/log';
import { _ } from '../utils/encodings/cat';
import { VodDetail } from '../utils/spider/vod';

class NodeJSSpider extends Spider {
  constructor() {
    super();
    this.jadeLog = new JadeLogging(this.getAppName(), 'DEBUG');
  }

  async init(inReq, _outResp) {
    await this.jadeLog.info('初始化', true);
    try {
      await await req(`http://127.0.0.1:8099/clear`, { timeout: 0.1 });
      this.siteKey = this.getJSName();
      this.siteType = this.getType();
      this.cfgObj = inReq.server.config[this.siteKey];
      this.deviceKey = inReq.server.prefix + '/';
      this.db = inReq.server.db;
      this.catOpenStatus = true;
      this.danmuStaus = false;
      try {
        if (await this.loadFilterAndClasses()) {
          await this.jadeLog.debug(`读取缓存列表和二级菜单成功`);
        } else {
          await this.jadeLog.warning(`读取缓存列表和二级菜单失败`);
          await this.writeFilterAndClasses();
        }
      } catch (e) {
        await this.db.push(this.deviceKey + 'classes', {});
        await this.db.push(this.deviceKey + 'filterObj', {});
        await this.jadeLog.error('读取缓存失败,失败原因为:' + e, false);
      }
    } catch (e) {
      await this.jadeLog.error(`初始化失败,失败原因为:${e}`);
    }
    await this.jadeLog.info('初始化完成', true);
  }

  async loadFilterAndClasses() {
    // 强制清空
    // await local.set(this.siteKey, "classes", JSON.stringify([]));
    // await local.set(this.siteKey, "filterObj", JSON.stringify({}));
    this.classes = await this.getClassesCache();
    this.filterObj = await this.getFiletObjCache();
    if (this.classes.length > 0) {
      return true;
    } else {
      await this.db.push(this.deviceKey + 'classes', {});
      await this.db.push(this.deviceKey + 'filterObj', {});
      return false;
    }
  }

  async writeFilterAndClasses() {
    if (this.catOpenStatus) {
      this.classes.push({ type_name: '最近更新', type_id: '最近更新' });
    }
    await this.setClasses();
    await this.setFilterObj();
    await this.db.push(this.deviceKey + 'classes', this.classes);
    await this.db.push(this.deviceKey + 'filterObj', this.filterObj);
  }

  async getClassesCache() {
    let cacheClasses = await this.db.getObjectDefault(this.deviceKey + 'classes', {});
    if (!_.isEmpty(cacheClasses)) {
      return cacheClasses;
    } else {
      return this.classes;
    }
  }

  async getFiletObjCache() {
    let cacheFilterObj = await this.db.getObjectDefault(this.deviceKey + 'filterObj', {});
    if (!_.isEmpty(cacheFilterObj)) {
      return cacheFilterObj;
    } else {
      return this.filterObj;
    }
  }

  async home(inReq, _outResp) {
    this.vodList = [];
    await this.jadeLog.info('正在解析首页类别', true);
    await this.setHome();
    await this.jadeLog.debug(`首页类别内容为:${this.result.home(this.classes, [], this.filterObj)}`);
    await this.jadeLog.info('首页类别解析完成', true);
    return this.result.home(this.classes, [], this.filterObj);
  }

  async homeVod() {
    await this.jadeLog.info('正在解析首页内容', true);
    try {
      await this.setHomeVod();
      await this.jadeLog.debug(`首页内容为:${this.result.homeVod(this.homeVodList)}`);
      await this.jadeLog.info('首页内容解析完成', true);
      return this.result.homeVod(this.homeVodList);
    } catch (e) {
      await this.jadeLog.error(`首页内容解析失败,失败原因为:${e}`);
    }
  }

  async category(inReq, _outResp) {
    const tid = inReq.body.id;
    const pg = inReq.body.page;
    const filter = true;
    const extend = inReq.body.filters;
    this.page = parseInt(pg);
    await this.jadeLog.info(`正在解析分类页面,tid = ${tid},pg = ${pg},extend = ${JSON.stringify(extend)}`);
    if (tid === '最近更新') {
      this.page = 0;
      return await this.homeVod();
    } else {
      try {
        this.vodList = [];
        await this.setCategory(tid, pg, filter, extend);
        await this.jadeLog.debug(
          `分类页面内容为:${this.result.category(this.vodList, this.page, this.count, this.limit, this.total)}`,
        );
        await this.jadeLog.info('分类页面解析完成', true);
        return this.result.category(this.vodList, this.page, this.count, this.limit, this.total);
      } catch (e) {
        await this.jadeLog.error(`分类页解析失败,失败原因为:${e}`);
      }
    }
  }

  async detail(inReq, _outResp) {
    await this.jadeLog.debug(`获取详情页面:${JSON.stringify(inReq.body)}`);
    const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
    const id = ids[0];
    this.vodDetail = new VodDetail();
    await this.jadeLog.info(`正在获取详情页面,id为:${id}`);
    try {
      await this.setDetail(id);
      await this.jadeLog.debug(`详情页面内容为:${this.result.detail(this.vodDetail)}`);
      await this.jadeLog.info('详情页面解析完成', true);
      this.vodDetail.vod_id = id;
      return this.result.detail(this.vodDetail);
    } catch (e) {
      await this.jadeLog.error('详情界面获取失败,失败原因为:' + e);
    }
  }

  async play(inReq, _outResp) {
    const flag = inReq.body.flag;
    const id = inReq.body.id;
    const flags = [];
    await this.jadeLog.info(`正在解析播放页面,flag:${flag},id:${id},flags:${flags}`, true);
    try {
      let return_result;
      await this.setPlay(flag, id, flags);
      if (this.playUrl['content'] !== undefined) {
        return this.playUrl;
      } else {
        await this.jadeLog.debug('不需要加载弹幕', true);
        if (this.result.jx === 1 && this.playUrl.indexOf('.m3u8') < 0) {
          const sniffer = await inReq.server.messageToDart({
            action: 'sniff',
            opt: {
              url: id,
              timeout: 60000,
              rule: 'http((?!http).){12,}?\\.m3u8?',
            },
          });
          if (sniffer && sniffer.url) {
            const hds = {};
            if (sniffer.headers) {
              if (sniffer.headers['user-agent']) {
                hds['User-Agent'] = sniffer.headers['user-agent'];
              }
              if (sniffer.headers['referer']) {
                hds['Referer'] = sniffer.headers['referer'];
              }
            }
            await this.jadeLog.debug(`嗅探成功,播放连接为:${sniffer.url}`);
            return_result = JSON.stringify({ parse: 0, url: sniffer.url, header: sniffer.headers, jx: '0' });
          } else {
            await this.jadeLog.error('解析失败,无法嗅探到播放连接');
            return_result = JSON.stringify({ parse: 0, url: '', jx: '0' });
          }
        } else {
          return_result = this.result.play(this.playUrl);
        }
        await this.jadeLog.info('播放页面解析完成', true);
        await this.jadeLog.debug(`播放页面内容为:${return_result}`);
        return return_result;
      }
    } catch (e) {
      await this.jadeLog.error('解析播放页面出错,失败原因为:' + e);
    }
  }

  async search(inReq, _outResp) {
    const pg = inReq.body.page;
    const wd = inReq.body.wd;
    let quick = true;
    this.vodList = [];
    await this.jadeLog.info(`正在解析搜索页面,关键词为 = ${wd},quick = ${quick},pg = ${pg}`);
    await this.setSearch(wd, quick, pg);
    if (this.vodList.length === 0) {
      if (wd.indexOf(' ') > -1) {
        await this.jadeLog.debug(`搜索关键词为:${wd},其中有空格,去除空格在搜索一次`);
        await this.search(wd.replaceAll(' ', '').replaceAll('?', ''), quick);
      }
    }
    await this.jadeLog.debug(`搜索页面内容为:${this.result.search(this.vodList)}`);
    await this.jadeLog.info('搜索页面解析完成', true);
    return this.result.search(this.vodList);
  }

  async proxy(inReq, outResp) {
    try {
      const what = inReq.params.what;
      let headers = {};
      try {
        headers = JSON.parse(inReq.params.ids);
      } catch (e) {}
      const purl = decodeURIComponent(inReq.params.end);
      let resp = JSON.parse(await this.setProxy([what, purl], headers));
      if (what === 'dash') {
        await this.jadeLog.debug(`dash:${JSON.stringify(resp)}`);
        outResp.code(resp.code).headers(resp.headers);
        return resp.content;
      } else {
        if (resp.code === 200) {
          outResp.code(resp.code).headers(resp.headers);
          return Buffer.from(resp.content, 'base64');
        } else {
          outResp.code(500);
          return '';
        }
      }
    } catch (e) {
      await this.jadeLog.error(`代理回调失败,失败原因为:${e}`);
    }
  }
}

export { NodeJSSpider };
