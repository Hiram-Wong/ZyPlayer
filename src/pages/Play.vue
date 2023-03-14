<template>
  <div class="container mx-auto">
    <div class="container-header">
      <div class="player-top">
        <div class="player-top-left" :style="{ 'padding-left': platform === 'darwin' && !isMacFull ? '60px' : '0' }">
          <div class="open-main-win player-center" @click="openMainWinEvent">
            <home-icon size="1.5em" />
            <span class="tip-gotomain">回到主界面</span>
          </div>
        </div>
        <div class="player-top-spacer">
          <span v-if="type === 'film'">{{ `${info.vod_name}  ${selectPlayIndex}` }}</span>
          <span v-else>{{ info.name }}</span>
        </div>
        <div class="player-top-right">
          <div v-if="type === 'film'" class="player-top-right-popup player-top-right-item player-top-right-share">
            <t-popup
              trigger="click"
              :visible="isShareVisible"
              :on-visible-change="onShareVisibleChange"
              placement="bottom-right"
              :overlay-inner-style="{ background: '#2a2a31', boxShadow: 'none', marginTop: '16px' }"
              attach=".player-top-right-share"
            >
              <share-icon size="1.5em" @click="isShareVisible = !isShareVisible" />
              <template #content>
                <div class="share-container">
                  <div class="share-container-main">
                    <div class="share-container-main-left">
                      <div class="share-container-main-left-header">
                        <div class="header-name">扫一扫，手机继续看</div>
                        <div class="header-info">
                          推荐使用<span class="header-info-browser">夸克浏览器</span>-首页<photo-icon />-扫码
                        </div>
                        <div class="header-copyright">ZyPlayer提供支持,严禁传播资源</div>
                      </div>
                      <t-divider dashed style="margin: 5px 0" />
                      <div class="share-container-main-left-bottom">
                        <div v-if="type === 'film'" class="bottom-title">
                          {{ `${info.vod_name}  ${selectPlayIndex}` }}
                        </div>
                        <div v-else class="bottom-title">{{ info.name }}</div>
                      </div>
                    </div>
                    <div class="share-container-main-right">
                      <div class="bg"></div>
                      <div class="main">
                        <img class="qrcode" :src="qrCodeUrl" alt="二维码" />
                      </div>
                    </div>
                  </div>
                  <div class="bottom-copy">
                    <span class="bottom-copy-url">
                      <input id="bottom-copy-url-input" v-model="shareUrl" type="text" disabled />
                    </span>
                    <t-popup
                      trigger="click"
                      placement="right"
                      :overlay-inner-style="{
                        background: '#f5f5f5',
                        boxShadow: 'none',
                        color: '#848282',
                        fontSize: '10px',
                        marginTop: '5px',
                      }"
                    >
                      <span class="bottom-copy-btn" @click="shareUrlEvent">复制地址</span>
                    </t-popup>
                  </div>
                </div>
              </template>
            </t-popup>
          </div>
          <!-- <div class="player-top-right-popup player-top-right-item" @click="downloadEvent" v-if="type === 'film'">
            <DownloadIcon size="1.5em"/>
          </div> -->
          <div class="player-top-right-popup player-top-right-item" @click="winStickyEvnet">
            <pin-icon v-if="isPin" size="1.5em" />
            <pin-filled-icon v-else size="1.5em" />
          </div>
          <div class="player-top-right-window">
            <span v-show="platform !== 'darwin'" class="window-separator"></span>
            <window-view />
          </div>
        </div>
      </div>
    </div>
    <div class="container-main">
      <div class="container-main-left">
        <div class="container-player" :class="{ 'container-player-ext': showEpisode }">
          <div class="player-container">
            <div id="xgplayer" class="xgplayer"></div>
          </div>
        </div>

        <div class="player-wide-btn" @click="showEpisode = !showEpisode">
          <div class="player-wide-btn-box"></div>
          <chevron-left-icon v-if="showEpisode" class="player-wide-btn-icon" />
          <chevron-right-icon v-else class="player-wide-btn-icon" />
        </div>
      </div>

      <div class="container-episode">
        <div v-if="!showEpisode" class="episode-container">
          <div class="episode-panel-wrapper">
            <div v-if="type == 'iptv'" class="epg">
              <div class="epg-wrap-title">
                <p class="title">{{ info.name }}</p>
              </div>
              <div class="epg-wrap-info">
                <p class="info">节目单</p>
              </div>
              <div class="epg-scroll">
                <div v-for="(item, index) in epgData" :key="index" class="epg-item">
                  <div class="epg-item-content">
                    <div class="epg-item-content-start">{{ item.start }}</div>
                    <div class="epg-item-content-title">{{ item.title }}</div>
                    <div class="epg-item-content-status">
                      <span v-if="filterEpgStatus(item.start, item.end) === '已播放'" class="played">{{
                        filterEpgStatus(item.start, item.end)
                      }}</span>
                      <span v-if="filterEpgStatus(item.start, item.end) === '正在直播'" class="playing">{{
                        filterEpgStatus(item.start, item.end)
                      }}</span>
                      <span v-if="filterEpgStatus(item.start, item.end) === '未播放'" class="unplay">{{
                        filterEpgStatus(item.start, item.end)
                      }}</span>
                    </div>
                  </div>
                  <t-divider dashed style="margin: 5px 0" />
                </div>
              </div>
            </div>
            <div v-if="type == 'film'" class="film">
              <div v-if="!isProfile" class="contents-wrap">
                <div class="title-wrap">
                  <h3 class="title-name nowrap">{{ info.vod_name }}</h3>
                  <div class="title-binge">
                    <div v-if="isBinge" class="video-subscribe-text" @click="bingeEvnet">
                      <t-space :size="8">
                        <heart-icon size="1.2em" class="icon" />
                        <span class="tip">追</span>
                      </t-space>
                    </div>
                    <div v-else class="video-subscribe-text" @click="bingeEvnet">
                      <span class="tip">在追</span>
                    </div>
                  </div>
                  <div class="title-feature">
                    <span v-show="info.vod_douban_score" class="rate">
                      {{
                        info.vod_douban_score === '0.0' && info.vod_score === '0.0'
                          ? '暂无评分'
                          : info.vod_douban_score === '0.0'
                          ? info.vod_score
                          : info.vod_douban_score
                      }}
                    </span>
                    <span v-show="info.type_name">{{ info.type_name }}</span>
                    <span v-show="info.vod_area">{{ info.vod_area }}</span>
                    <span v-show="info.vod_year">{{ info.vod_year }}</span>
                    <p class="title-unfold" @click="isProfile = true">简介</p>
                  </div>
                </div>
                <div class="anthology-contents-scroll">
                  <h4 class="box-anthology-title">选集</h4>
                  <div class="box-anthology-items">
                    <t-tabs v-model="selectPlaySource" class="film-tabs">
                      <t-tab-panel v-for="(value, key, index) in season" :key="index" :value="key">
                        <template #label> {{ key }} </template>
                        <div style="padding-top: 25px">
                          <t-space break-line size="small" align="center">
                            <t-tag
                              v-for="item in value"
                              :key="item"
                              class="tag"
                              :class="{
                                select:
                                  formatName(item) ===
                                    (dataHistory.videoIndex ? dataHistory.videoIndex : selectPlayIndex) &&
                                  (dataHistory.siteSource ? dataHistory.siteSource : selectPlaySource) === key,
                              }"
                              @click="changeEvent(item)"
                            >
                              {{ formatName(item) }}
                            </t-tag>
                          </t-space>
                        </div>
                      </t-tab-panel>
                    </t-tabs>
                  </div>
                  <div v-show="recommend.length != 0">
                    <div class="component-title">猜你喜欢</div>
                    <div class="anthology-content">
                      <div v-for="content in recommend" :key="content.id" class="pic-text-item">
                        <div class="cover" @click="recommendEvent(content)">
                          <t-image
                            class="card-main-item"
                            :src="content.vod_pic"
                            :style="{ width: '126px', height: '70px', 'border-radius': '10px' }"
                            :lazy="true"
                            fit="cover"
                          >
                            <template #overlayContent>
                              <span
                                class="nowrap"
                                :style="{
                                  position: 'absolute',
                                  right: '2px',
                                  bottom: '2px',
                                  borderRadius: '10px',
                                  backgroundColor: '#25252a',
                                  padding: '0 5px',
                                  textAlign: 'right',
                                  maxWidth: '90%',
                                  fontSize: '10px',
                                }"
                              >
                                {{ content.vod_remarks }}
                              </span>
                            </template>
                          </t-image>
                        </div>
                        <div class="anthology-title-wrap">
                          <div class="title">{{ content.vod_name }}</div>
                          <div class="subtitle nowrap">
                            {{ content.vod_blurb ? content.vod_blurb.trim() : content.vod_blurb }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="profile">
                <h3>简介</h3>
                <p class="intro-exit" @click="isProfile = false"></p>
                <div class="intro-content">
                  <div class="intro-img">
                    <div class="img-wrap">
                      <t-image
                        class="card-main-item"
                        :src="info.vod_pic"
                        :style="{ width: '100%', height: '100%', 'border-radius': '5px' }"
                        :lazy="true"
                        fit="cover"
                      />
                    </div>
                  </div>
                  <h4>{{ info.vod_name }}</h4>
                  <div class="intro-detail">
                    <div class="intro-title">概述</div>
                    <div class="intro-desc">
                      <span v-html="filterContent(info.vod_content)" />
                    </div>
                    <div class="intro-title second">演职人员</div>
                    <div class="intro-desc">
                      <div v-show="info.vod_director">
                        <span class="title">导演：</span>
                        <span class="info">{{ info.vod_director }}</span>
                      </div>
                      <div v-show="info.vod_actor">
                        <span class="title">主演：</span>
                        <span class="info">{{ info.vod_actor }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch, onDeactivated } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  HomeIcon,
  HeartIcon,
  PhotoIcon,
  ShareIcon,
  // DownloadIcon,
  PinIcon,
  PinFilledIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'tdesign-icons-vue-next';
import _ from 'lodash';
import moment from 'moment';
import QRCode from 'qrcode';
import { useClipboard } from '@vueuse/core';
import Player from 'xgplayer';
import HlsPlugin from 'xgplayer-hls';
import 'xgplayer/dist/xgplayer.min.css';
import 'xgplayer-livevideo';
import LivePreset from 'xgplayer/es/presets/live';
import playerPlayIcon from '@/assets/player/play.svg?raw';
import playerPauseIcon from '@/assets/player/pause.svg?raw';
import playerPlayNextIcon from '@/assets/player/play-next.svg?raw';
import playerZoomIcon from '@/assets/player/zoom.svg?raw';
import playerZoomExitIcon from '@/assets/player/zoom-s.svg?raw';
import playerVoiceIcon from '@/assets/player/voice.svg?raw';
import playerVoiceNoIcon from '@/assets/player/voice-no.svg?raw';
import playerPipIcon from '@/assets/player/pip.svg?raw';
import windowView from '@/layouts/components/Window.vue';
import zy from '@/lib/site/tools';
import { setting, history, star } from '@/lib/dexie';
import { usePlayStore } from '@/store';

// 用于窗口管理
const { ipcRenderer } = require('electron');

const remote = window.require('@electron/remote');
const { BrowserWindow } = require('@electron/remote');

const win = remote.getCurrentWindow();
const { platform } = process;

// 获取pinia播放数据
const store = usePlayStore();
const type = computed(() => {
  return store.getType;
});
const data = computed(() => {
  return store.getData;
});
const set = computed(() => {
  return store.getSetting;
});
const info = ref(data.value.info);
const ext = ref(data.value.ext);

const { isSupported, copy } = useClipboard();
const isShareVisible = ref(false);

const config = ref({
  id: 'xgplayer',
  url: '',
  autoplay: true,
  pip: true,
  cssFullscreen: false,
  playbackRate: { index: 7 }, // pip:6 volume:1 fullscreen:1 playbackrate:0
  enableContextmenu: true, // 允许右键
  lastPlayTimeHideDelay: 5, // 提示文字展示时长（单位：秒）
  icons: {
    play: playerPlayIcon,
    pause: playerPauseIcon,
    playNext: playerPlayNextIcon,
    fullscreen: playerZoomIcon,
    exitFullscreen: playerZoomExitIcon,
    volumeSmall: playerVoiceIcon,
    volumeLarge: playerVoiceIcon,
    volumeMuted: playerVoiceNoIcon,
    pipIcon: playerPipIcon,
    pipIconExit: playerPipIcon,
  },
  plugins: [HlsPlugin],
  hls: {
    retryCount: 3, // 重试 3 次，默认值
    retryDelay: 1000, // 每次重试间隔 1 秒，默认值
    loadTimeout: 10000, // 请求超时时间为 10 秒，默认值
    fetchOptions: {
      // 该参数会透传给 fetch，默认值为 undefined
      mode: 'cors',
    },
  },
  width: 'auto',
  height: 'calc(100vh - 50px)',
}); // 西瓜播放器参数

const recommend = ref([]); // 推荐
const season = ref(); // 选集
const selectPlaySource = ref(); // 选择的播放源
const selectPlayIndex = ref();
const xg = ref(null); // 西瓜播放器
const showEpisode = ref(false); // 是否显示右侧栏
const epgData = ref(); // epg数据
const timer = ref(); // 定时器 用于刷新历史进度
const isBinge = ref(true); // true未收藏 false收藏
const isPin = ref(true); // true未置顶 false置顶
const qrCodeUrl = ref(); // 二维码图片流
const dataHistory = ref({}); // 历史
const isMacFull = ref(false); // mac最大化
// const iswideBtn = ref(false); // 视频划过显示按钮
const isProfile = ref(false); // 简介

const shareUrl = computed(() => {
  const soureUrl = 'https://hunlongyu.gitee.io/zy-player-web/?url=';
  let params = `${config.value.url}&name=${info.value.name}`;
  if (type.value === 'film') params = `${config.value.url}&name=${info.value.vod_name}  ${selectPlayIndex.value}`;
  return soureUrl + params;
}); // 分享地址

// 更新二维码
watch(
  () => selectPlayIndex.value,
  () => {
    qrCodeImg();
  },
);

onMounted(() => {
  initPlayer();
  minMaxEvent();
  macFullScreenEvent();
  // wideEvent();
});

onDeactivated(() => {
  clearInterval(timer.value);
});

const getHistoryData = async (type = false) => {
  const { key } = ext.value.site;
  const id = info.value.vod_id;
  await history.find({ siteKey: key, videoId: id }).then((res) => {
    let doc = {
      date: moment().format('YYYY-MM-DD'),
      siteKey: key,
      siteSource: selectPlaySource.value,
      playEnd: 0,
      videoId: id,
      videoImage: info.value.vod_pic,
      videoName: info.value.vod_name,
      videoIndex: selectPlayIndex.value,
      watchTime: 0,
      duration: null,
    };
    if (res) {
      if (!type) {
        selectPlaySource.value = res.siteSource;
        selectPlayIndex.value = res.videoIndex;
      }
      if (res.siteSource === selectPlaySource.value && res.videoIndex === selectPlayIndex.value) {
        doc = res;
      } else {
        history.update(res.id, doc);
      }
      dataHistory.value = doc;
      dataHistory.value.id = res.id;
    } else {
      dataHistory.value = doc;
      dataHistory.value.id = history.add(doc);
    }
  });
};

// 初始化播放器
const initPlayer = async (firstInit = false) => {
  if (set.value.softSolution) config.value.mediaType = 'live-video'; // 软解支持
  if (xg.value) xg.value.destroy(); // 存在播放器则摧毁
  if (type.value === 'iptv') {
    console.log(info.value.url);
    config.value.url = info.value.url; // 初始化播放链接
    if (data.value.ext.epg) {
      epgData.value = zy.iptvEpg(ext.value.epg, info.value.name, moment().format('YYYY-MM-DD'));
    } // 处理电子节目单
    zy.isLiveM3U8(info.value.url).then((res) => {
      config.value.isLive = res;
      config.value.presets = [LivePreset];
    }); // 判断是否直播
    xg.value = new Player(config.value);
  } else if (type.value === 'film') {
    getDetailInfo();
    // await getDoubanRate();
    getDoubanRecommend();
    await getBinge();
    if (!firstInit) {
      await getHistoryData().then(async () => {
        if (dataHistory.value.watchTime) config.value.startTime = dataHistory.value.watchTime;
        if (set.value.skipStartEnd) {
          if (dataHistory.value.watchTime < set.value.skipTimeInStart)
            config.value.startTime = set.value.skipTimeInStart;
        }

        _.forEach(season.value[selectPlaySource.value], (item) => {
          if (item.split('$')[0] === dataHistory.value.videoIndex) config.value.url = item.split('$')[1];
        });
        if (!config.value.url) config.value.url = season.value[selectPlaySource.value][0].split('$')[1]; // 初始化播放链接
        if (!config.value.url.endsWith('m3u8')) {
          config.value.url = await zy.parserFilmUrl(config.value.url);
        } // 判断是否做解析
        xg.value = new Player(config.value);
      });
    } else {
      if (dataHistory.value.watchTime) config.value.startTime = dataHistory.value.watchTime;
      if (set.value.skipStartEnd) {
        if (dataHistory.value.watchTime < set.value.skipTimeInStart) config.value.startTime = set.value.skipTimeInStart;
      }
      if (!config.value.url.endsWith('m3u8')) {
        config.value.url = await zy.parserFilmUrl(config.value.url);
      } // 判断是否做解析
      xg.value = new Player(config.value);
    }

    await timerUpdatePlayProcess();
  }
};

// 在追
const bingeEvnet = async () => {
  isBinge.value = !isBinge.value;
  const { key } = ext.value.site;
  const id = info.value.vod_id;
  const db = await star.find({ siteKey: key, videoId: id });
  console.log(db);
  if (!isBinge.value) {
    const doc = {
      siteKey: key,
      videoId: id,
      videoImage: info.value.vod_pic,
      videoName: info.value.vod_name,
      videoType: info.value.type_name,
      videoRemarks: info.value.vod_remarks,
    };
    if (!db) {
      star
        .add(doc)
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          MessagePlugin.error(`加入追剧列表失败:${error}`);
        });
    }
  } else star.remove(db.id);
};

// 格式化剧集名称
const formatName = (e) => {
  const num = e.split('$');
  if (num.length > 1) {
    return e.split('$')[0];
  }
  return `正片`;
};

// 获取播放源及剧集
const getDetailInfo = async () => {
  const videoList = info.value;

  // 播放源
  const playFrom = videoList.vod_play_from;
  const playSource = playFrom.split('$').filter((e) => e);
  const [source] = playSource;
  if (!selectPlaySource.value) selectPlaySource.value = source;

  // 剧集
  const playUrl = videoList.vod_play_url;
  const playUrlDiffPlaySource = playUrl.split('$$$'); // 分离不同播放源
  const playEpisodes = [];
  _.forEach(playUrlDiffPlaySource, (item) => {
    const playContont = item
      .replace(/\$+/g, '$')
      .split('#')
      .filter((e) => e && (e.startsWith('http') || (e.split('$')[1] && e.split('$')[1].startsWith('http'))));
    playEpisodes.push(playContont);
  });
  if (!selectPlayIndex.value) selectPlayIndex.value = playEpisodes[0][0].split('$')[0];

  // 合并播放源和剧集
  const fullList = _.zipObject(playSource, playEpisodes);

  videoList.fullList = fullList;
  info.value = videoList;
  season.value = fullList;
  // console.log(info.value, season.value);
};

// 切换选集
const changeEvent = async (e) => {
  if (timer.value) clearInterval(timer.value);
  const [index, url] = e.split('$');
  selectPlayIndex.value = index;
  config.value.url = url;
  const doc = {
    watchTime: xg.value ? xg.value.currentTime : 0,
    duration: null,
    siteSource: selectPlaySource.value,
    videoIndex: selectPlayIndex.value,
  };

  // 当前源dataHistory.value.siteSource 选择源selectPlaySource.value；当前集dataHistory.value.videoIndex 选择源index
  // 1. 同源 不同集 变   return true
  // 2. 同源 同集 不变   return true
  // 3. 不同源 不同集 变 return true
  // 4. 不同源 同集 不变 return true
  // 代优化 不同源的index不同，要重新索引  但是 综艺不对应
  if (dataHistory.value.siteSource === selectPlaySource.value) {
    if (dataHistory.value.videoIndex !== index) {
      doc.watchTime = 0;
      delete doc.duration;
    }
  } else if (dataHistory.value.videoIndex !== index) {
    doc.watchTime = 0;
    delete doc.duration;
  }

  console.log(doc);
  for (const key in doc) {
    dataHistory.value[key] = doc[key];
  }
  history.update(dataHistory.value.id, doc);
  await initPlayer(true);

  await getHistoryData(true);
};

// 获取豆瓣评分
// const getDoubanRate = async () => {
//   const rate = info.value.vod_douban_score;
//   const id = info.value.vod_douban_id;
//   if (rate && rate === '0.0') {
//     const name = info.value.vod_name;
//     const { year } = info.value;
//     info.value.rate = await zy.doubanRate(id, name, year);
//   }
// };

// 获取豆瓣影片推荐
const getDoubanRecommend = async () => {
  const { key } = ext.value.site;
  const name = info.value.vod_name;
  const year = info.value.vod_year;
  const id = info.value.vod_douban_id;
  await zy.doubanRecommendations(id, name, year).then((resName) => {
    _.forEach(resName, async (element) => {
      await zy.searchFirstDetail(key, element).then((res) => {
        if (res) {
          if (recommend.value.length < 10) recommend.value.push(res);
        }
      });
    });
  });
};

// 替换style
const filterContent = (item) => {
  return _.replace(item, /style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};

// 自动隐藏wide
// const wideEvent = () => {};

// 定时更新播放进度
const timerUpdatePlayProcess = () => {
  timer.value = setInterval(async () => {
    const doc = {
      watchTime: xg.value.currentTime,
      duration: xg.value.duration,
    };
    await history.update(dataHistory.value.id, doc);

    console.log(timer.value);
  }, 10000);
};

// 获取是否追剧
const getBinge = async () => {
  console.log(ext.value.site.key, info.value.vod_id);
  await star.find({ siteKey: ext.value.site.key, videoId: info.value.vod_id }).then((res) => {
    if (res) isBinge.value = false;
  });
};

// 电子节目单播放状态
const filterEpgStatus = (start, end) => {
  const nowTimestamp = moment();
  const startTimestamp = moment(`${moment().format('YYYY-MM-DD')} ${start}`);
  const endTimestamp = moment(`${moment().format('YYYY-MM-DD')} ${end}`);
  if (nowTimestamp.isBetween(startTimestamp, endTimestamp)) {
    return '正在直播';
  }
  if (nowTimestamp === moment.min(nowTimestamp, endTimestamp)) {
    return '未播放';
  }
  return '已播放';
};

// 生成二维码
const qrCodeImg = () => {
  const opts = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: 0.3,
    margin: 4,
  };
  QRCode.toDataURL(shareUrl.value, opts, (err, url) => {
    qrCodeUrl.value = url;
  });
};

const shareUrlEvent = () => {
  copy(shareUrl.value);
  if (isSupported) {
    MessagePlugin.info('复制成功，快分享给好友吧！');
    isShareVisible.value = false;
  } else MessagePlugin.info('当前环境不支持一键复制，请手动复制链接！');
};

const onShareVisibleChange = (_, context) => {
  // trigger=document 表示点击非浮层元素触发
  if (context.trigger === 'document') isShareVisible.value = false;
};

// 推荐刷新数据
const recommendEvent = (e) => {
  info.value = e;
  recommend.value = [];
  dataHistory.value = {};
  selectPlaySource.value = '';
  selectPlayIndex.value = '';
  season.value = '';
  isBinge.value = false;
  store.updateConfig({
    type: 'film',
    data: {
      info: e,
      ext: ext.value,
    },
  });
  initPlayer();
};

// 下载
// const downloadEvent = () => {};

// electron窗口置顶
const winStickyEvnet = () => {
  if (win.isAlwaysOnTop()) {
    win.setAlwaysOnTop(false);
    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'no');
    isPin.value = true;
  } else {
    win.setAlwaysOnTop(true);
    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'yes');
    isPin.value = false;
  }
};

// 最小化暂停播放
const minMaxEvent = () => {
  win.on('minimize', () => {
    if (xg.value && xg.value.hasStart && setting.value.pauseWhenMinimize) {
      xg.value.pause();
    }
  });
  win.on('restore', () => {
    if (xg.value && xg.value.hasStart) {
      xg.value.play();
    }
  });
};

// 最小化暂停播放
const macFullScreenEvent = () => {
  win.on('maxmize', () => {
    isMacFull.value = true;
  });
  win.on('restore', () => {
    isMacFull.value = false;
  });
};

// 打开主窗口
const openMainWinEvent = () => {
  ipcRenderer.send('showMainWin');
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';
.container {
  height: calc(100vh);
  overflow-y: hidden;
  .nowrap {
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    height: auto;
    width: auto;
    font-weight: normal;
  }
  .container-header {
    -webkit-app-region: drag;
    height: 50px;
    flex-shrink: 0;
    background: #1e2022;
    .player-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      white-space: nowrap;
      color: #fff;
      padding: 10px 15px;
      .player-center {
        align-items: center;
      }
      .player-top-left {
        -webkit-app-region: no-drag;
        .open-main-win {
          height: 30px;
          width: 120px;
          border-radius: 5px;
          background-color: #2f3134;
          padding: 2px 10px;
          cursor: pointer;
          .tip-gotomain {
            display: inline-block;
            margin-left: 5px;
          }
        }
        :hover {
          background-color: #47494d;
        }
      }
      .player-top-spacer {
        flex: 1 1 auto;
        overflow: hidden;
        width: 100px;
        text-align: center;
        span {
          font-weight: 900;
          text-align: center;
          display: inline-block;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .player-top-right {
        -webkit-app-region: no-drag;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 100%;
        &-popup {
          line-height: 20px;
          position: relative;
          width: 100%;
          height: 100%;
          user-select: none;
          font-size: 13px;
          color: #fff;
          letter-spacing: 0;
          font-weight: 400;
          margin: 0 8px;
        }
        &-item {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 5px;
          text-align: center;
          line-height: 25px;
          &:hover {
            background-color: #2f3134;
          }
        }
        &-share {
          .share-container {
            width: 350px;
            padding: 20px;
            border-radius: 8px;
            margin-top: 5px;
            position: relative;
            background-color: #2a2a31;
            &-main {
              display: flex;
              justify-content: flex-start;
              &-left {
                width: 190px;
                &-header {
                  .header-name {
                    color: #e0e0e1;
                    font-size: 15px;
                    line-height: 40px;
                  }
                  .header-info {
                    color: #4d4d53;
                    font-size: 12px;
                    line-height: 20px;
                    &-browser {
                      color: #89eff9;
                    }
                  }
                  .header-copyright {
                    color: #4d4d53;
                    font-size: 12px;
                    line-height: 20px;
                  }
                }
                &-bottom {
                  .bottom-title {
                    line-height: 20px;
                    color: #fbfbfb;
                  }
                }
              }
              &-right {
                position: relative;
                .bg {
                  position: relative;
                  background-color: #16161a;
                  width: 30px;
                  height: 90px;
                  border-radius: 2px;
                }
                .main {
                  position: absolute;
                  top: -5px;
                  left: 30px;
                  .qrcode {
                    width: 100px;
                    height: 100px;
                    border-radius: 5px;
                  }
                }
              }
            }

            .bottom-copy {
              position: relative;
              margin-top: 10px;
              width: 100%;
              height: 35px;
              border-radius: 20px;
              color: #777;
              font-size: 12px;
              line-height: 35px;
              &-url {
                float: left;
                width: 200px;
                height: 100%;
                padding: 0 10px;
                border-radius: 20px 0 0 20px;
                color: #999;
                background-color: #f5f5f5;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                word-wrap: normal;
                word-break: keep-all;
                input {
                  display: block;
                  width: 100%;
                  border: none;
                  background: 0 0;
                  line-height: 30px;
                  height: 30px;
                  color: #848282;
                  outline: none;
                  overflow: visible;
                }
              }
              &-btn {
                position: absolute;
                top: 0;
                right: 0;
                width: 110px;
                height: 100%;
                border-radius: 0 20px 20px 0;
                color: #222;
                background-color: #fff;
                text-align: center;
              }
            }
          }
        }
        &-window {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          .window-separator {
            display: block;
            border: 0.5px solid #47494d;
            border-radius: 2px;
            height: 15px;
          }
        }
      }
    }
  }
  .container-main {
    height: calc(100vh - 50px);
    color: #fff;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    position: relative;
    background-color: #000000;
    .container-main-left {
      width: 100vw;
      position: relative;
      transition: 0.15s ease-out;
      .container-player-ext {
        width: 100vw !important;
      }
      .container-player {
        position: relative;
        width: 100%;
        height: 100%;
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        z-index: 0;
        .player-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }
      }
      .player-wide-btn {
        cursor: pointer;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        .player-wide-btn-box {
          z-index: 999;
          border-radius: 5px 0 0 5px;
          background: rgba(0, 0, 0, 0.5);
          width: 20px;
          height: 120px;
        }
        .player-wide-btn-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          fill: #848494;
          cursor: pointer;
          left: 3px;
        }
      }
    }
    .container-episode {
      width: 300px;
      position: relative;
      .episode-container {
        padding: 0 10px;
        position: relative;
        right: 0;
        bottom: 0;
        top: 0;
        box-sizing: border-box;
        flex-shrink: 0;
        height: 100%;
        background: #18191c;
        .episode-panel-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          width: 270px;
          position: relative;
          .epg {
            width: 100%;
            height: 100%;
            padding-top: 20px;
            &-wrap-title {
              height: 26px;
              line-height: 26px;
              .title {
                display: block;
                float: left;
                width: 180px;
                font-size: 16px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                color: hsla(0, 0%, 100%, 0.87);
              }
            }
            &-wrap-info {
              max-height: 34px;
              width: 100%;
              font-size: 12px;
              line-height: 17px;
              overflow: hidden;
              margin-top: 10px;
              padding-bottom: 20px;
              .info {
                font-size: 12px;
                line-height: 17px;
                color: hsla(0, 0%, 100%, 0.6);
              }
            }
            &-scroll {
              height: calc(100% - 90px);
              width: 100%;
              overflow-y: scroll;
              display: flex;
              flex-direction: column;
              .epg-item {
                &-content {
                  display: flex;
                  justify-content: flex-start;
                  font-weight: 500;
                  &-start {
                    width: 40px;
                    color: #f09736;
                    margin-right: 10px;
                  }
                  &-title {
                    width: calc(100% - 110px);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }
                  &-status {
                    width: 60px;
                    text-align: right;
                    .played {
                      color: #2774f6;
                    }
                    .playing {
                      color: #f09736;
                    }
                    .unplay {
                      color: #f0f0f1;
                    }
                  }
                }
              }
            }
          }

          .film {
            width: 100%;
            padding-top: 20px;
            overflow-y: hidden;
            .contents-wrap {
              .title-wrap {
                position: relative;
                .title-name {
                  max-width: 190px;
                  font-size: 20px;
                  min-height: 32px;
                  line-height: 32px;
                  font-weight: 500;
                  color: #fff;
                  position: relative;
                }
                .title-binge {
                  position: absolute;
                  right: 0;
                  top: 0;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: hsla(0, 0%, 100%, 0.6);
                  background-color: hsla(0, 0%, 100%, 0.08);
                  border-radius: 36px;
                  width: 74px;
                  height: 32px;
                }
                .title-feature {
                  position: relative;
                  font-size: 14px;
                  line-height: 18px;
                  padding: 12px 45px 9px 0;
                  color: hsla(0, 0%, 100%, 0.9);
                  font-weight: 400;
                  .rate {
                    color: #65d444;
                    font-weight: bold;
                  }
                  span {
                    margin-right: 6px;
                  }
                }
                .title-unfold {
                  position: absolute;
                  right: 0;
                  top: 12px;
                  display: inline-block;
                  line-height: 20px;
                  color: hsla(0, 0%, 100%, 0.6);
                  cursor: pointer;
                  padding-right: 15px;
                  &:after {
                    content: '';
                    width: 6px;
                    height: 6px;
                    border: 2px solid hsla(0, 0%, 100%, 0.6);
                    border-bottom: none;
                    border-left: none;
                    position: absolute;
                    right: 5px;
                    top: 6px;
                    -webkit-transform: rotate(45deg);
                    -ms-transform: rotate(45deg);
                    transform: rotate(45deg);
                  }
                }
              }
              .anthology-contents-scroll {
                position: relative;
                height: calc(100vh - 160px);
                margin-top: 5px;
                overflow-y: auto;
                overflow-x: hidden;
                .box-anthology-title {
                  position: relative;
                  font-size: 18px;
                  line-height: 25px;
                  color: hsla(0, 0%, 100%, 0.9);
                  font-weight: 600;
                }
                .box-anthology-items {
                  padding-bottom: 18px;
                  overflow: hidden;
                  .film-tabs {
                    background-color: rgba(0, 0, 0, 0) !important;
                    :deep(.t-tabs__nav-item-text-wrapper) {
                      color: rgba(255, 255, 255, 0.9) !important;
                    }
                    :deep(.tag) {
                      color: rgba(255, 255, 255, 0.9) !important;
                      background-color: #393939 !important;
                      cursor: pointer;
                    }
                    .select {
                      color: #85d46e !important;
                    }
                    :deep(.t-tabs__nav-item:not(.t-is-disabled):not(.t-is-active):hover .t-tabs__nav-item-wrapper) {
                      background-color: #393939 !important;
                    }
                    :deep(.t-tabs__nav-container.t-is-top:after) {
                      background-color: rgba(0, 0, 0, 0) !important;
                    }
                    :deep(.t-tabs__bar) {
                      background-color: var(--td-brand-color) !important;
                    }
                  }
                }
                .component-title {
                  font-size: 18px;
                  height: 25px;
                  line-height: 25px;
                  display: block;
                  margin: 18px 0 9px;
                  font-weight: 600;
                  color: hsla(0, 0%, 100%, 0.9);
                }
                .anthology-content {
                  .pic-text-item {
                    position: relative;
                    display: block;
                    margin-bottom: 18px;
                    overflow: hidden;
                    height: 70px;
                    cursor: pointer;
                    .cover {
                      position: relative;
                      float: left;
                      margin-right: 10px;
                      font-size: 12px;
                      height: 100%;
                      overflow: hidden;
                    }
                    .anthology-title-wrap {
                      margin-left: 138px;
                      height: 70px;
                      position: relative;
                      overflow: hidden;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      .title {
                        font-size: 14px;
                        line-height: 20px;
                        max-height: 40px;
                        overflow: hidden;
                        -o-text-overflow: ellipsis;
                        text-overflow: ellipsis;
                        word-break: break-all;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        color: #fff;
                      }
                      .subtitle {
                        color: #797979;
                        font-size: 10px;
                      }
                    }
                  }
                }
              }
            }
            .profile {
              position: absolute;
              height: 100%;
              width: 100%;
              box-sizing: border-box;
              left: 0;
              top: 0;
              z-index: 100;
              animation: previewIn 0.3s cubic-bezier(0.86, 0, 0.07, 1);
              animation-fill-mode: forwards;
              h3 {
                font-size: 20px;
                height: 49px;
                line-height: 49px;
                color: #fbfbfb;
                font-weight: 600;
                text-align: left;
                border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
              }
              .intro-exit {
                cursor: pointer;
                display: block;
                width: 24px;
                height: 24px;
                position: absolute;
                right: 0;
                top: 13px;
                &:before {
                  content: '';
                  width: 2px;
                  height: 16px;
                  background: #fff;
                  transform: rotate(45deg);
                  position: absolute;
                  left: 11px;
                  top: 4px;
                }
                &:after {
                  content: '';
                  width: 2px;
                  height: 16px;
                  background: #fff;
                  transform: rotate(-45deg);
                  position: absolute;
                  left: 11px;
                  top: 4px;
                }
              }
              .intro-content {
                width: 100%;
                height: calc(100% - 50px);
                overflow-y: scroll;
                .intro-img {
                  margin-top: 20px;
                  .img-wrap {
                    width: 120px;
                    height: 165px;
                    margin: 0 auto;
                    border-radius: 13px;
                    position: relative;
                    overflow: hidden;
                  }
                }
                h4 {
                  margin-top: 10px;
                  font-size: 15px;
                  font-weight: 500;
                  color: #fff;
                  height: 33px;
                  line-height: 33px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  text-align: center;
                }
                .intro-detail {
                  margin-top: 15px;
                  padding-bottom: 18px;
                  padding-right: 3px;
                }
                .intro-title {
                  font-size: 15px;
                  line-height: 21px;
                  font-weight: 800;
                }
                .intro-desc {
                  margin-top: 7px;
                  line-height: 24px;
                  color: hsla(0, 0%, 100%, 0.5);
                  font-size: 15px;
                  font-weight: 400;
                }
                .second {
                  margin-top: 27px;
                }
              }
            }
          }
        }
      }
    }
  }
}
:deep(.xgplayer-icon svg) {
  width: 1.4em !important;
  height: 100% !important;
}
:deep(.xgplayer .xg-pos) {
  padding: 0 13px;
}
</style>
