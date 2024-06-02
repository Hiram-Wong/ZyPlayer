/*
 * @File     : push.js
 * @Author   : jade
 * @Date     : 2024/3/29 13:59
 * @Email    : jadehh@1ive.com
 * @Software : Samples
 * @Desc     :
 */

import { NodeJSSpider } from './spider';
import { detailContent, initCloud, playContent, getHeaders } from '../cloud';
import { VodDetail } from '../utils/spider/vod';
import * as Utils from '../utils';
import { _ } from '../utils/encodings/cat';

class PushSpider extends NodeJSSpider {
  constructor() {
    super();
  }

  getName() {
    return '┃推送┃';
  }

  getAppName() {
    return '推送';
  }

  getJSName() {
    return 'push';
  }

  getType() {
    return 4;
  }

  async init(inReq, _outResp) {
    await this.jadeLog.debug('初始化', true);
    await initCloud(inReq.server.config);
    return {};
  }

  async check(_inReq, _outResp) {
    const clip = _inReq.body.clip;
    // CatVodOpen目前支持http链接和https链接
    await this.jadeLog.debug(`剪切板输入内容为:${clip}`);
    if (clip.startsWith('http')) {
      await this.jadeLog.debug('满足推送条件', true);
      return 'true';
    } else {
      await this.jadeLog.debug('不满足推送条件', true);
      return 'false';
    }
  }

  async parseVodDetailfromJson(id) {
    let vodDetail = new VodDetail();
    vodDetail.vod_pic = Utils.RESOURCEURL + '/resources/push.jpg';
    let mather = Utils.patternAli.exec(id);
    let quarkMatcher = Utils.patternQuark.exec(id);
    if (mather !== null && mather.length > 0) {
      let playVod = await detailContent([id]);
      vodDetail.vod_play_from = _.keys(playVod).join('$$$');
      vodDetail.vod_play_url = _.values(playVod).join('$$$');
    } else if (quarkMatcher !== null && quarkMatcher.length > 0) {
      let playVod = await detailContent([id]);
      vodDetail.vod_play_from = _.keys(playVod).join('$$$');
      vodDetail.vod_play_url = _.values(playVod).join('$$$');
    } else {
      vodDetail.vod_play_from = '推送';
      vodDetail.vod_play_url = '推送$' + id;
    }
    return vodDetail;
  }

  async setDetail(id) {
    this.vodDetail = await this.parseVodDetailfromJson(id);
  }

  async setPlay(flag, id, flags) {
    if (flag === '推送') {
      this.playUrl = id;
    } else {
      this.playUrl = await playContent(flag, id, flags);
      this.result.setHeader(getHeaders(flag));
    }
  }
}

let spider = new PushSpider();
async function init(_inReq, _outResp) {
  return await spider.init(_inReq, _outResp);
}

async function support(_inReq, _outResp) {
  return await spider.check(_inReq, _outResp);
}

async function detail(inReq, _outResp) {
  return await spider.detail(inReq, _outResp);
}

async function play(inReq, _outResp) {
  return await spider.play(inReq, _outResp);
}

export default {
  meta: {
    key: 'push',
    name: '推送',
    type: 4,
  },
  api: async (fastify) => {
    fastify.post('/init', init);
    fastify.post('/support', support);
    fastify.post('/detail', detail);
    fastify.post('/play', play);
  },
  spider: {
    init: init,
    support: support,
    detail: detail,
    play: play,
  },
};
