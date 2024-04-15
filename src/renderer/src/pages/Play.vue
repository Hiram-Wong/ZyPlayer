<template>
  <div class="container">
    <div class="container-header" :class="!isVisible.macMaximize ? 'drag' : 'no-drag'">
      <div class="left no-drag" :style="{ 'padding-left': platform === 'darwin' && !isVisible.macMaximize ? '60px' : '0' }">
        <div class="open-main-win" @click="openMainWinEvent">
          <home-icon size="1.5em" />
          <span class="tip-gotomain">{{ $t('pages.player.header.backMain') }}</span>
        </div>
      </div>
      <div class="spacer">
        <span v-if="type === 'film'">{{ `${info.vod_name} ${selectPlayIndex}` }}</span>
        <span v-else>{{ info.name }}</span>
      </div>
      <div class="right no-drag">
        <div class="system-functions">
          <div v-if="type === 'film'" class="setting">
            <div class="popup item" @click="isSettingVisible = true">
              <setting-icon size="1.3em" />
            </div>
            <t-dialog v-model:visible="isSettingVisible" header="设置" placement="center" :footer="false" width="508">
              <div class="setting-warp">
                <div class="setting-item-warp">
                  <span>自动跳过片头片尾</span>
                  <t-switch v-model="set.skipStartEnd" @change="updateLocalPlayer">
                    <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
                  </t-switch>
                </div>
                <div v-if="set.skipStartEnd" class="setting-item-warp">
                  <div class="skip-time-in-start">
                    <t-input-number v-model="skipConfig.skipTimeInStart" theme="normal" align="right">
                      <template #label>开头: </template>
                      <template #suffix> 秒</template>
                    </t-input-number>
                  </div>
                  <div class="skip-time-in-end">
                    <t-input-number v-model="skipConfig.skipTimeInEnd" theme="normal" align="right">
                      <template #label>结尾: </template>
                      <template #suffix> 秒</template>
                    </t-input-number>
                  </div>
                </div>

                <div class="tip-warp">
                  <span>开关全局生效，跳过时间仅资源生效</span>
                </div>
              </div>
            </t-dialog>
          </div>
          <div class="staple">
            <div class="popup item" @click="toggleAlwaysOnTop">
              <pin-filled-icon v-if="isVisible.pin" size="1.3em" />
              <pin-icon v-else size="1.3em" />
            </div>
          </div>
        </div>
        <system-control v-if="platform !== 'darwin'"/>
      </div>
    </div>
    <div class="container-main">
      <div class="player">
        <div class="container-player" :class='["subject", isVisible.aside ? "subject-ext": "" ]'>
          <div class="player-panel">
            <div v-show="!onlineUrl" class="player-media">
              <div
                v-show="xg"
                id="xgplayer"
                ref="xgpayerRef"
                class="xgplayer player"
              ></div>
              <div v-show="tc" ref="tcplayerRef">
                <video id="tcplayer" preload="auto" playsinline webkit-playsinline class="tcplayer player"></video>
              </div>
              <div
                v-show="dp"
                id="dplayer"
                ref="dplayerRef"
                class="dplayer player"
              ></div>
            </div>
          </div>
        </div>
        <div class="btn-box dock-show" @click="isVisible.aside = !isVisible.aside">
          <chevron-left-icon v-if="isVisible.aside" class="btn-icon" />
          <chevron-right-icon v-else class="btn-icon" />
        </div>
      </div>
      <div class="aside" v-show="!isVisible.aside">
        <div v-if="type == 'iptv'" class="iptv content">
          <div class="title-warp">
            <p class="title nowrap">{{ info.name }}</p>
          </div>
          <div class="iptv-main content-main">
            <t-tabs v-model="active.iptvNav" class="iptv-tabs tabs">
              <t-tab-panel value="epg" :label="$t('pages.player.iptv.epg')">
                <div class="contents-wrap scroll-y epg-wrap">
                  <div v-for="(item, index) in iptvConfig.epgData" :key="index" class="content">
                    <div class="content-item content-item-between">
                      <div class="time-warp">{{ item.start }}</div>
                      <div class="title-wrap nowrap title-warp-epg">{{ item.title }}</div>
                      <div class="status-wrap">
                        <span v-if="filterEpgStatus(item.start, item.end) === 'played'" class="played">
                          {{ $t(`pages.player.status.${filterEpgStatus(item.start, item.end)}`) }}
                        </span>
                        <span v-if="filterEpgStatus(item.start, item.end) === 'playing'" class="playing">
                          {{ $t(`pages.player.status.${filterEpgStatus(item.start, item.end)}`) }}
                        </span>
                        <span v-if="filterEpgStatus(item.start, item.end) === 'unplay'" class="unplay">
                          {{ $t(`pages.player.status.${filterEpgStatus(item.start, item.end)}`) }}
                        </span>
                      </div>
                    </div>
                    <t-divider dashed style="margin: 5px 0" />
                  </div>
                </div>
              </t-tab-panel>
              <t-tab-panel value="channel" :label="$t('pages.player.iptv.channel')">
                <div class="contents-wrap scroll-y channel-wrap">
                  <div v-for="item in iptvConfig.channelData" :key="item.id" class="content">
                    <div class="content-item content-item-start" @click="changeIptvEvent(item)">
                      <div class="logo-wrap">
                        <t-image
                          class="logo"
                          fit="contain"
                          :src="item.logo"
                          :style="{ width: '64px', height: '32px', maxHeight: '32px', background: 'none' }"
                          :lazy="true"
                          :loading="renderLoading"
                          :error="renderError"
                        >
                        </t-image>
                      </div>
                      <div class="title-wrap nowrap title-warp-channel">{{ item.name }}</div>
                      <div class="status-wrap">
                        <span :class="item.id === info.id ? 'playing' : 'unplay'">
                          {{ item.id === info.id ? $t('pages.player.status.playing') : $t('pages.player.status.unplay') }}
                        </span>
                      </div>
                    </div>
                    <t-divider dashed style="margin: 5px 0" />
                  </div>
                  <infinite-loading style="text-align: center; color: #fdfdfd" :distance="200" @infinite="load">
                    <template #complete>{{ $t('pages.player.infiniteLoading.complete') }}</template>
                    <template #error>{{ $t('pages.player.infiniteLoading.error') }}</template>
                  </infinite-loading>
                </div>
              </t-tab-panel>
            </t-tabs>
          </div>
        </div>
        <div v-if="type == 'film'" class="film content">
          <div v-if="!active.profile" class="contents-wrap">
            <div class="tvg-block">
              <div class="title-album">
                <div class="title-text nowrap">{{ info.vod_name }}</div>
                <div class="title-desc" @click="active.profile = true">
                  <span class="title-unfold">{{ $t('pages.player.film.desc') }}</span>
                  <chevron-right-s-icon />
                </div>
              </div>
              <div class="hot-block">
                <span v-show="info.vod_douban_score" class="rate">
                  <star-icon />
                  {{
                    info.vod_douban_score === '0.0' && info.vod_score === '0.0'
                      ? '0.0'
                      : info.vod_douban_score === '0.0'
                      ? info.vod_score
                      : info.vod_douban_score
                  }}
                </span>
                <t-divider layout="vertical" v-show="info.type_name" />
                <span v-show="info.type_name">{{ info.type_name }}</span>
                <t-divider layout="vertical" v-show="info.vod_area" />
                <span v-show="info.vod_area">{{ info.vod_area }}</span>
                <t-divider layout="vertical" v-show="info.vod_year" />
                <span v-show="info.vod_year">{{ info.vod_year }}</span>
              </div>
              <div class="function">
                <div class="func-item like" @click="bingeEvent">
                  <span>
                    <heart-icon class="icon" v-if="isVisible.binge"/>
                    <heart-filled-icon class="icon" v-else/>
                  </span>
                  <span class="tip">{{ $t('pages.player.film.like') }}</span>
                </div>
                <div class="dot"></div>
                <div class="func-item download" @click="downloadEvent">
                  <download-icon class="icon" />
                  <span class="tip">{{ $t('pages.player.film.download') }}</span>
                </div>
                <div class="dot"></div>
                <div class="func-item share" @click="shareEvent">
                  <share-popup v-model:visible="isVisible.share" :data="shareData">
                    <template #customize>
                      <div style="display: flex;flex-direction: row;align-items: center;">
                        <share-1-icon class="icon" />
                        <span class="tip">{{ $t('pages.player.film.share') }}</span>
                      </div>
                    </template>
                  </share-popup>
                </div>
              </div>
              <dialog-download-view :data="downloadDialogData" v-model:visible="isVisible.download" />
            </div>
            <div class="anthology-contents-scroll">
              <div class="box-anthology-header">
                <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
                <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
                  <order-descending-icon v-if="reverseOrder" size="1.2em" />
                  <order-ascending-icon v-else size="1.2em" />
                </div>
              </div>
              <div class="listbox">
                <t-tabs v-model="selectPlaySource" class="film-tabs">
                  <t-tab-panel v-for="(value, key, index) in season" :key="index" :value="key">
                    <template #label> {{ key }} </template>
                    <div class="tag-container">
                      <div
                        class="mainVideo-num"
                        :class='["mainVideo-num", formatName(item) ===
                              (dataHistory.videoIndex ? dataHistory.videoIndex : selectPlayIndex) &&
                            (dataHistory.siteSource ? dataHistory.siteSource : selectPlaySource) === key ? "mainVideo-selected" : ""]
                        '
                        v-for="(item, index) in value"
                        :key="item"
                        @click="changeEvent(item)"
                      >
                        <t-tooltip :content="formatName(item)">
                          <div class="mainVideo_inner">
                            {{ index+1 }}
                            <div class="playing"></div>
                          </div>
                        </t-tooltip>
                      </div>
                    </div>
                  </t-tab-panel>
                </t-tabs>
              </div>
              <div class="recommend" v-show="recommend.length != 0">
                <div class="component-title">{{ $t('pages.player.film.recommend') }}</div>
                <div class="component-list">
                  <div v-for="content in recommend" :key="content.id" class="videoItem-card">
                    <div class="videoItem-left" @click="recommendEvent(content)">
                      <t-image
                        class="card-main-item"
                        :src="content.vod_pic"
                        :style="{ width: '126px', height: '70px', 'border-radius': '5px' }"
                        :lazy="true"
                        fit="cover"
                      >
                        <template #overlayContent>
                          <span
                            class="nowrap"
                            :style="{
                              position: 'absolute',
                              right: '6px',
                              bottom: '2px',
                              maxWidth: '90%',
                              color: '#fff'
                            }"
                          >
                            {{ content.vod_remarks }}
                          </span>
                        </template>
                      </t-image>
                    </div>
                    <div class="videoItem-right">
                      <div class="title nowrap">{{ content.vod_name }}</div>
                      <div class="subtitle nowrap">
                        {{ content.vod_blurb ? content.vod_blurb.trim() : '' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="profile">
            <div class="side-head">
              <div class="title">{{ $t('pages.player.film.desc') }}</div>
              <close-icon size="1.3em" class="icon" @click="active.profile = false"/>
            </div>
            <t-divider dashed style="margin: 5px 0" />
            <div class="side-body scroll-y ">
              <div class="card">
                <div class="cover">
                  <t-image
                    class="card-main-item"
                    :src="info.vod_pic"
                    :style="{ width: '100%', height: '100%', 'border-radius': '5px' }"
                    :lazy="true"
                    fit="cover"
                  />
                </div>
                <div class="content">
                  <div class="name">{{ info.vod_name }}</div>
                  <div class="type">{{ info.type_name }}</div>
                  <div class="num">{{ info.vod_remarks }}</div>
                </div>
              </div>
              <div class="text">
                <span v-html="filterContent(info.vod_content)" />
              </div>
              <div class="case">
                <div class="title">{{ $t('pages.player.film.actors') }}</div>
                <div class="content">
                  <div v-show="info.vod_director">
                    <span class="name">{{ $t('pages.player.film.director') }}: </span>
                    <span class="role">{{ info.vod_director }}</span>
                  </div>
                  <div v-show="info.vod_actor">
                    <span class="name">{{ $t('pages.player.film.actor') }}: </span>
                    <span class="role">{{ info.vod_actor }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="type == 'drive'" class="drive content">
          <div class="title-warp">
            <p class="title nowrap">{{ info.name }}</p>
          </div>
          <div class="drive-main content-main">
            <t-tabs v-model="active.driveNav" class="drive-tabs tabs">
              <t-tab-panel value="season" :label="$t('pages.player.drive.anthology')">
                <div class="contents-wrap scroll-y drive-wrap">
                  <div v-for="item in driveDataList" :key="item.id" class="content">
                    <template v-if="item.type === 10">
                      <div class="content-item content-item-start" @click="changeDriveEvent(item)">
                        <div class="logo-wrap">
                          <t-image
                            class="logo"
                            fit="cover"
                            :src="item.thumb"
                            :style="{ width: '64px', height: '32px', background: 'none', borderRadius: '6px' }"
                            :lazy="true"
                            :loading="renderLoading"
                            :error="renderError"
                          />
                        </div>
                        <div class="title-wrap nowrap title-warp-channel">{{ item.name }}</div>
                        <div class="status-wrap">
                          <span :class="info.name === item.name ? 'playing' : 'unplay'">
                            {{ item.name === info.name ? $t('pages.player.status.playing') : $t('pages.player.status.unplay') }}
                          </span>
                        </div>
                      </div>
                      <t-divider dashed style="margin: 5px 0" />
                    </template>
                  </div>
                </div>
              </t-tab-panel>
            </t-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import '@/style/player/veplayer.css';
import 'v3-infinite-loading/lib/style.css';

import DPlayer from 'dplayer';
import flvjs from 'flv.js';
import Hls from 'hls.js';
import _ from 'lodash';
import moment from 'moment';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronRightSIcon,
  CloseIcon,
  Tv1Icon,
  DownloadIcon,
  HeartIcon,
  HeartFilledIcon,
  HomeIcon,
  LoadingIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
  PinFilledIcon,
  PinIcon,
  StarIcon,
  SettingIcon,
  Share1Icon
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { computed, onMounted, ref, reactive, watch } from 'vue';
import Player, { Events } from 'xgplayer';
import LivePreset from 'xgplayer/es/presets/live';
import FlvPlugin from 'xgplayer-flv';
import HlsPlugin from 'xgplayer-hls';
import Mp4Plugin from 'xgplayer-mp4';

import SystemControl from '@/layouts/components/SystemControl.vue';
import DialogDownloadView from './play/componets/DialogDownload.vue';
import { t } from '@/locales';
import { setDefault } from '@/api/setting';
import { fetchAnalyzeDefault } from '@/api/analyze';
import { fetchFilmDetail } from '@/api/site';
import { updateHistory, detailHistory, addHistory } from '@/api/history';
import { detailStar, addStar, delStar } from '@/api/star';
import { fetchChannelList } from '@/api/iptv';

import { getConfig, checkMediaType, checkUrlIpv6, checkLiveM3U8 } from '@/utils/tool';
import { __jsEvalReturn } from '@/utils/alist_open';
import { fetchDrpyPlayUrl, fetchHipyPlayUrl, fetchT3PlayUrl, fetchDetail, fetchSearch, t3RuleInit, catvodRuleInit, fetchCatvodPlayUrl, fetchDoubanRecommend } from '@/utils/cms';
import { fetchChannelEpg } from '@/utils/channel';
import sniffer from '@/utils/sniffer';
import { usePlayStore } from '@/store';

import SharePopup from '../components/share-popup/index.vue';

const remote = window.require('@electron/remote');
const { BrowserWindow } = require('@electron/remote');

const win = remote.getCurrentWindow();
const { platform } = window.electron.process;

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

const downloadDialogData = ref({ season: '', current: '' });

const commonConfig = {
  url: '',
  autoplay: true,
  pip: true,
  cssFullscreen: false,
  enableContextmenu: true,
  topBarAutoHide: false,
  lastPlayTimeHideDelay: 5,
  startTime: 0,
  playbackRate: {
    list: [
      2,
      1.5,
      1.25,
      {
        rate: 1,
        iconText: {
          zh: '倍速',
        },
      },
      0.75,
      0.5,
    ],
    index: 7,
  },
  plugins: [],
}; // 西瓜、火山公共部分

const config = ref({
  ...commonConfig,
  id: 'xgplayer',
  hls: {
    preloadTime: 90,
    retryCount: 3,
    retryDelay: 1000,
    loadTimeout: 10000,
    fetchOptions: {
      mode: 'cors',
    },
  },
  mp4plugin: {
    maxBufferLength: 30,
    minBufferLength: 10,
    reqOptions: {
      mode: 'cors',
    },
  },
  flv: {},
  width: 'auto',
  height: 'calc(100vh - 50px)',
}); // 西瓜播放器参数

const dplayerRef = ref(null); // 呆呆播放器dom节点
const dpConfig = ref({
  container: dplayerRef,
  autoplay: true,
  screenshot: true,
  video: {
    
  },
}); // 呆呆播放器参数

const active = reactive({
  iptvNav: 'epg',
  driveNav: 'season',
  flimSource: '',
  filmIndex: '',
  filmCurrent: '',
  profile: false
});
const recommend = ref([]); // 推荐
const season = ref(); // 选集
const selectPlaySource = ref(); // 选择的播放源
const selectPlayIndex = ref();
const xg = ref(null); // 西瓜播放器
const tc = ref(null); // 腾讯播放器
const dp = ref(null); // dp播放器
const tcplayerRef = ref(null); // 腾讯云播放器dom节点
const xgpayerRef = ref(null); // 西瓜播放器dom节点
const isSettingVisible = ref(false);

const dataHistory = ref({}); // 历史

const onlineUrl = ref(); // 解析接口+需解析的地址
const currentUrl = ref(); // 当前未解析前的url
const reverseOrder = ref(true); // true 正序 false 倒序

const driveDataList = ref({});
const spider = ref(null);

const skipConfig = ref({
  skipTimeInStart: 30,
  skipTimeInEnd: 30,
});

const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

const shareData = ref({
  name: '',
  url: '',
  provider: 'zyplayer',
});

const VIP_LIST = [
  'iqiyi.com',
  'iq.com',
  'mgtv.com',
  'qq.com',
  'youku.com',
  'le.com',
  'sohu.com',
  'pptv.com',
  'bilibili.com',
  'tudou.com',
];

const VIDEO_PROCESS_DOC = {
  date: moment().unix(),
  playEnd: false,
  watchTime: 0,
  duration: 0,
};

const analyzeConfig = ref({
  default: {
    url: ''
  }, // 
  flag: [] //标识
})

const isVisible = reactive({
  share: false,
  pin: false,
  macMaximize: false,
  download: false,
  binge: false,
  aside: false
})

const iptvConfig = ref({
  epg: '',
  skipIpv6: false,
  channelData: [],
  epgData: []
})

const renderError = () => {
  return (
    <div class="renderIcon">
      <Tv1Icon size="1.5em" stroke-width="2" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon">
      <LoadingIcon size="1.5em" stroke-width="2" />
    </div>
  );
};

// 更新跳过数据
watch(
  () => skipConfig.value,
  () => {
    skipHistoryConfig();
  },
  { deep: true },
);

onMounted(() => {
  initPlayer();
  minMaxEvent();
  // document.documentElement.setAttribute('theme-mode', 'dark');
});

// 选集排序
const seasonReverseOrder = () => {
  if (reverseOrder.value) {
    console.log('正序');
    season.value = JSON.parse(JSON.stringify(info.value.fullList));
  } else {
    console.log('倒序');
    season.value = _.mapValues(season.value, list => _.reverse([...list]));
  }
};

// 根据不同类型加载不同播放器
const createPlayer = async (url, videoType='') => {
  const { broadcasterType } = set.value;
  if (!videoType) {
    const meadiaType = await checkMediaType(url);
    if (meadiaType !== 'unknown' && meadiaType !== 'error' ) {
      videoType = meadiaType;
    }
  }
  if (broadcasterType === 'xgplayer') {
    switch (videoType) {
      case 'mp4':
        config.value.plugins = [Mp4Plugin];
        break;
      case 'mkv':
        config.value.plugins = [Mp4Plugin];
        break;
      case 'flv':
        config.value.plugins = [FlvPlugin];
        break;
      case 'm3u8':
        config.value.plugins = [HlsPlugin];
        break;
      default:
        config.value.plugins = [HlsPlugin];
        break;
    }
    config.value.url = url;
    xg.value = new Player({ ...config.value });
    console.log(`[player] 加载西瓜${videoType}播放器`);
  } else if (broadcasterType === 'dplayer') {
    switch (videoType) {
      case 'mp4':
        dpConfig.value.video.url = url;
        break;
      case 'flv':
        dpConfig.value.video = {
          url: url,
          type: 'customFlv',
          customType: {
            customFlv: function (video, player) {
              const flvPlayer = flvjs.createPlayer({
                type: 'flv',
                url: video.src,
              });
              flvPlayer.attachMediaElement(video);
              flvPlayer.load();
            },
          },
        };
        break;
      case 'm3u8':
        dpConfig.value.video = {
          url: url,
          type: 'customHls',
          customType: {
            customHls: function (video, player) {
              const hls = new Hls();
              hls.loadSource(video.src);
              hls.attachMedia(video);
            },
          },
        }
        break;
      default:
        dpConfig.value.video = {
          url: url,
          type: 'customHls',
          customType: {
            customHls: function (video, player) {
              const hls = new Hls();
              hls.loadSource(video.src);
              hls.attachMedia(video);
            },
          },
        }
        break;
    }
    console.log(`[player] 加载呆呆播放器`);
    dp.value = new DPlayer(dpConfig.value);
    if (config.value.startTime) dp.value.seek(config.value.startTime);
  }

  if (type.value === 'film') await timerUpdatePlayProcess();

  setSystemMediaInfo();
};

// 设置系统媒体信息
const setSystemMediaInfo = () => {
  if ("mediaSession" in navigator) {
    let title, artist, artwork;

    if (type.value === 'iptv') {
      title = info.value.name;
      artist = '直播';
    } else if (type.value === 'drive') {
      title = info.value.name;
      artist = 'alist';
    } else {
      title = info.value.vod_name;
      artist = selectPlayIndex.value;
      artwork = [
        {
          src: info.value.vod_pic,
          type: "image/png",
        }
      ];
    }

    const doc = {
      title,
      artist,
      artwork,
    };

    if (type.value === 'iptv' || type.value === 'drive') {
      delete doc.artwork;
    }

    navigator.mediaSession.metadata = new MediaMetadata(doc);
  }
};

// 获取解析地址
const getAnalysisData = async () => {
  try {
    const res = await fetchAnalyzeDefault();
    if (_.has(res, 'default')) analyzeConfig.value.default = res.default;
    if (_.has(res, 'flag')) analyzeConfig.value.flag = res.flag;

    // console.log(`[analyze] jx:${res.default.url}; flag:${[...res.flag]}`);
  } catch (error) {
    console.error(error);
  }
};

const getHistoryData = async (type = false) => {
  try {
    const { id } = ext.value.site;
    const res = await detailHistory({ relateId: id, videoId: info.value.vod_id });
    const doc = {
      date: moment().unix(),
      type: 'film',
      relateId: id,
      siteSource: selectPlaySource.value,
      playEnd: false,
      videoId: info.value.vod_id,
      videoImage: info.value.vod_pic,
      videoName: info.value.vod_name,
      videoIndex: selectPlayIndex.value,
      watchTime: 0,
      duration: null,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
    };
    if (res) {
      if (!type) {
        selectPlaySource.value = res.siteSource;
        selectPlayIndex.value = res.videoIndex;
      }
      if (res.siteSource !== selectPlaySource.value || res.videoIndex !== selectPlayIndex.value) {
        await updateHistory(res.id, doc);
        dataHistory.value = { ...doc, id: res.id };
      } else {
        dataHistory.value = { ...res };
      }
      const { skipTimeInStart, skipTimeInEnd } = res;
      skipConfig.value = { skipTimeInStart, skipTimeInEnd };
    } else {
      const add_res = await addHistory(doc);
      const { skipTimeInStart, skipTimeInEnd } = doc;

      skipConfig.value = { skipTimeInStart, skipTimeInEnd };
      dataHistory.value = add_res;
    }
  } catch (error) {
    console.error(error);
  }
};

// 摧毁播放器
const destroyPlayer = () => {
  if (xg.value) {
    xg.value.destroy();
    xg.value = null;
  }

  if (dp.value) {
    dp.value.destroy();
    dp.value = null;
  }

  if (onlineUrl.value) onlineUrl.value = '';
};

// 初始化iptv
const initIptvPlayer = async () => {
  if (data.value.ext.epg) getEpgList(ext.value.epg, info.value.name, moment().format('YYYY-MM-DD'));
  config.value.url = info.value.url;

  if (set.value.broadcasterType !== 'tcplayer') {
    try {
      const isLive = await checkLiveM3U8(info.value.url);
      config.value.isLive = isLive;
      config.value.presets = isLive ? [LivePreset] : [];
      dpConfig.value.live = true;
    } catch (err) {
      console.error(err);
    }
  }

  createPlayer(config.value.url);
};

// Helper functions
const fetchHipyPlayUrlHelper = async (site: { [key: string]: any }, flag: string, url: string): Promise<string> => {
  console.log('[detail][hipy][start]获取服务端播放链接开启');
  let data: string = '';
  try {
    const res = await fetchHipyPlayUrl(site, flag, url);
    data = res;
    console.log(`[detail][hipy][return]${data}`);
  } catch (err) {
    console.log(`[detail][hipy][error]${err}`);
  } finally {
    console.log(`[detail][hipy][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchT3PlayUrlHelper = async (flag: string, id: string, flags: string[] = []): Promise<string> => {
  console.log('[detail][t3][start]获取服务端播放链接开启');
  let data: string = '';
  try {
    const res = await fetchT3PlayUrl(flag, id, flags);
    data = res.url;
    console.log(`[detail][t3][return]${data}`);
  } catch (err) {
    console.log(`[detail][t3][error]${err}`);
  } finally {
    console.log(`[detail][t3][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchCatvodPlayUrlHelper = async (site: { [key: string]: any }, flag: string, id: string): Promise<string> => {
  console.log('[detail][catvod][start]获取服务端播放链接开启');
  let data: string = '';
  try {
    const res = await fetchCatvodPlayUrl(site, flag, id);
    data = res.url;
    console.log(`[detail][catvod][return]${data}`);
  } catch (err) {
    console.log(`[detail][catvod][error]${err}`);
  } finally {
    console.log(`[detail][catvod][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchDrpyPlayUrlHelper = async (site: { [key: string]: any }, url: string): Promise<string> => {
  console.log('[detail][drpy][start]免嗅流程开启');
  let data: string = '';
  try {
    const res = await fetchDrpyPlayUrl(site, url);
    if (res.redirect) {
      data = res.url;
      console.log(`[detail][drpy][return]${data}`);
    }
  } catch (err) {
    console.log(`[detail][drpy][error]:${err}`);
  } finally {
    console.log(`[detail][drpy][end]免嗅流程结束`);
    return data;
  }
};

const fetchJsonPlayUrlHelper = async (playUrl: string, url: string): Promise<string> => {
  console.log('[detail][json][start]json解析流程开启');
  let data: string = '';
  try {
    const res = await getConfig(`${playUrl}${url}`);
    if (res.url) {
      data = res.url;
      console.log(`[detail][json][return]${data}`);
    }
  } catch (err) {
    console.log(`[detail][json][error]${err}`);
  } finally {
    console.log(`[detail][json][end]json解析流程结束`);
    return data;
  }
};

const fetchJxPlayUrlHelper = async (type: 'iframe' | 'pie' | 'custom', url: string): Promise<string> => {
  console.log('[detail][jx][start]官解流程开启');
  MessagePlugin.info('官解流程开启,请稍等');
  let data: string = '';
  try {
    const res = await sniffer(type, url);
    data = res;
    console.log(`[detail][jx][return]${data}`);
  } catch (err) {
    console.log(`[detail][jx][error]${err}`);
  } finally {
    console.log(`[detail][jx][end]官解流程结束`);
    MessagePlugin.info('官解流程结束,如未加载播放器则嗅探失败,请换源');
    return data;
  }
};

// 初始化film
const initFilmPlayer = async (isFirst) => {
  const { site } = ext.value;
  await getDetailInfo();

  if (!isFirst) {
    await getHistoryData();
    await getAnalysisData();

    if (site.type !== 7) {
      if (site.search !== 0) getDoubanRecommend();
    }
    getBinge();

    const item = season.value[selectPlaySource.value].find(
      (item) => item.split('$')[0] === dataHistory.value.videoIndex,
    );
    currentUrl.value = item;
    config.value.url = item ? item.split('$')[1] : season.value[selectPlaySource.value][0].split('$')[1];

    // 跳过时间
    // if (set.value.skipStartEnd && dataHistory.value.watchTime < set.value.skipTimeInStart) {
    if (set.value.skipStartEnd && dataHistory.value.watchTime < skipConfig.value.skipTimeInStart) {
      config.value.startTime = skipConfig.value.skipTimeInStart;
    } else {
      config.value.startTime = dataHistory.value.watchTime || 0;
    }
  } else {
    config.value.startTime = dataHistory.value.watchTime || 0;
    // if (set.value.skipStartEnd && dataHistory.value.watchTime < set.value.skipTimeInStart) {
    if (set.value.skipStartEnd && dataHistory.value.watchTime < skipConfig.value.skipTimeInStart) {
      config.value.startTime = skipConfig.value.skipTimeInStart;
    }
  }

  // 解析直链
  let playerUrl = config.value.url;
  const { snifferType } = set.value;
  if (site.playUrl) {
    playerUrl = await fetchJsonPlayUrlHelper(site.playUrl, config.value.url);
  } else {
    if (config.value.url.startsWith('http')) {
      const { hostname } = new URL(config.value.url);
      let snifferUrl;
      if (config.value.url.includes('uri=')) snifferUrl = config.value.url; // 判断有播放器的
      if (
        VIP_LIST.some((item) => hostname.includes(item)) ||
        analyzeConfig.value.flag.some((item) => selectPlaySource.value.includes(item))
      ) {
        // 官解iframe
        snifferUrl = analyzeConfig.value.default.url + config.value.url;
      }
      if (snifferUrl) {
        playerUrl = await fetchJxPlayUrlHelper(snifferType.type, snifferType.type === 'custom' ? `${snifferType.url}${snifferUrl}` : snifferUrl);
        if (playerUrl) createPlayer(playerUrl);
        return;
      }
    }
    switch (site.type) {
      case 2:
        // drpy免嗅
        playerUrl = await fetchDrpyPlayUrlHelper(site, config.value.url);
        break;
      case 6:
        // hipy获取服务端播放链接
        playerUrl = await fetchHipyPlayUrlHelper(site, selectPlaySource.value, config.value.url);
        break;
      case 7:
        // t3获取服务端播放链接
        await t3RuleInit(site);
        playerUrl = await fetchT3PlayUrlHelper(selectPlaySource.value, config.value.url, []);
        break;
      case 8:
        // catvox获取服务端播放链接
        await catvodRuleInit(site);
        playerUrl = await fetchCatvodPlayUrlHelper(site, selectPlaySource.value, config.value.url);
        break;
    }
  }

  if (!playerUrl) playerUrl = config.value.url;

  if (playerUrl) {
    const mediaType = await checkMediaType(playerUrl);
    console.log(`[detail][mediaType]${mediaType}`)
    if (mediaType !== 'unknown' && mediaType !== 'error') {
      createPlayer(playerUrl, mediaType);
      return;
    }
  }

  // 兜底办法:嗅探
  console.log(`[detail][sniffer][reveal]尝试提取播放链接,type:${site.type}`);
  try {
    MessagePlugin.info('嗅探资源中, 如10s没有结果请换源,咻咻咻!');
    playerUrl = await sniffer(snifferType.type, snifferType.type === 'custom' ? `${snifferType.url}${config.value.url}` : config.value.url);
    createPlayer(playerUrl);
  } catch (err) {
    console.error(err);
  };
};

// 初始化网盘
const initCloudPlayer = async () => {
  driveDataList.value = ext.value.files;
  config.value.url = info.value.url;
  createPlayer(config.value.url);
};

const spiderInit = async() => {
  if (!spider.value) spider.value = __jsEvalReturn();
  await spider.value.init({
    skey: 'siteKey',
    ext: [
      { ...ext.value.site }
    ],
  });
};

// 初始化播放器
const initPlayer = async (isFirst = false) => {
  destroyPlayer();

  switch(type.value) {
    case 'iptv':
      await initIptvPlayer();
      break;
    case 'film':
      await initFilmPlayer(isFirst);
      break;
    case 'drive':
      await initCloudPlayer();
      break;
    default:
      break;
  };

  let title = info.value.name;
  if (type.value === 'film') title = `${info.value.vod_name} ${selectPlayIndex.value}`
  document.title = title;
};

// 在追
const bingeEvent = async () => {
  try {
    const { id } = ext.value.site;
    const db = await detailStar({ relateId: id, videoId: info.value.vod_id });

    if (isVisible.binge) {
      const doc = {
        relateId: id,
        videoId: info.value.vod_id,
        videoImage: info.value.vod_pic,
        videoName: info.value.vod_name,
        videoType: info.value.type_name,
        videoRemarks: info.value.vod_remarks,
      };
      if (!db) {
        await addStar(doc);
      }
    } else {
      await delStar(db.id);
    }

    isVisible.binge = !isVisible.binge;
  } catch (error) {
    console.error(error);
    MessagePlugin.error(`操作失败:${error}`);
  }
};

// 格式化剧集名称
const formatName = (e) => {
  const [first] = e.split('$');
  return first.includes('http') ? '正片' : first;
};

// 获取播放源及剧集
const getDetailInfo = async () => {
  const videoList = info.value;

  // 播放源
  const playFrom = videoList.vod_play_from;
  const playSource = playFrom.split('$').filter(Boolean);
  const [source] = playSource;
  if (!selectPlaySource.value) selectPlaySource.value = source;

  // 剧集
  const playUrl = videoList.vod_play_url;
  const playUrlDiffPlaySource = playUrl.split('$$$'); // 分离不同播放源
  const playEpisodes = playUrlDiffPlaySource.map((item) =>
    item
      .replace(/\$+/g, '$')
      .split('#')
      .map((e) => {
        if (!e.includes('$')) e = `正片$${e}`;
        return e;
      }),
  );
  if (!selectPlayIndex.value) selectPlayIndex.value = playEpisodes[0][0].split('$')[0];

  // 合并播放源和剧集
  const fullList = Object.fromEntries(playSource.map((key, index) => [key, playEpisodes[index]]));

  videoList.fullList = fullList;
  info.value = videoList;
  season.value = fullList;
};

// 切换选集
const changeEvent = async (e) => {
  currentUrl.value = e;
  const [index, url] = e.split('$');
  console.log(index, url);
  selectPlayIndex.value = index;
  config.value.url = url;
  const doc = {
    watchTime: xg.value ? xg.value.currentTime : 0,
    duration: null,
    playEnd: false,
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

  updateHistory(dataHistory.value.id, doc);
  // history.update(dataHistory.value.id, doc);

  console.log(doc);
  for (const key in doc) {
    dataHistory.value[key] = doc[key];
  }
  await initPlayer(true);

  await getHistoryData(true);
};

// 切换iptv
const changeIptvEvent = async (item) => {
  store.updateConfig({
    type: 'iptv',
    data: {
      info: item,
      ext: { epg: data.value.ext.epg },
    },
  });
  info.value = item;
  await initPlayer();
};

// 切换cloud
const changeDriveEvent = async (item) => {
  await spiderInit();
  const res = JSON.parse(await spider.value.file(item.path));
  store.updateConfig({
    type: 'drive',
    data: {
      info: {
        name: res.name,
        url: res.url,
        vod_pic: res.thumb
      }
    },
  });
  info.value = res;

  await initPlayer();
};

// 获取豆瓣影片推荐
const getDoubanRecommend = async () => {
  const { site } = ext.value;
  const { vod_name: name, vod_year: year, vod_douban_id: id } = info.value;
  const ids = [];
  let flag = true;
  let vodIds = '';

  try {
    const doubanRecommendName = await fetchDoubanRecommend(id, name, year);

    const searchPromises = doubanRecommendName.map(async (element) => {
      try {
        const item = await fetchSearch(site, element);
        if (item && ids.length < 10) {
          ids.push(item[0]);
        }
      } catch (err) {}
    });

    await Promise.all(searchPromises);
    if (ids.length > 0) {
      const idsFirst = ids[0]
      if (!('vod_pic' in idsFirst)) { 
        flag = false;
        vodIds = ids.map((movie) => movie.vod_id).join(',');
      }
    }

    if (flag) recommend.value = ids;
    else recommend.value = await fetchDetail(site, vodIds);
  } catch (err) {
    console.log(err);
  }
};

// 替换style
const filterContent = (item) => {
  return _.replace(item, /style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};

// 定时更新播放进度
const timerUpdatePlayProcess = () => {
  const onTimeUpdate = (currentTime, duration) => {
    VIDEO_PROCESS_DOC.watchTime = currentTime;
    VIDEO_PROCESS_DOC.duration = duration;
    updateHistory(dataHistory.value.id, VIDEO_PROCESS_DOC);
    // history.update(dataHistory.value.id, VIDEO_PROCESS_DOC);

    const watchTime = set.value.skipStartEnd ? currentTime + skipConfig.value.skipTimeInEnd : currentTime;

    if (watchTime >= duration) {
      if (set.value.broadcasterType === 'xgplayer') {
        const pipInstance = xg.value.plugins.pip;
        if (pipInstance.isPip) {
          xg.value.pause();
          return;
        }
      }

      if (duration !== 0) autoPlayNext();
    }

    // console.log(
    //   `[player] timeUpdate - currentTime:${currentTime}; watchTime:${watchTime}; duration:${duration}; percentage:${Math.trunc(
    //     (currentTime / duration) * 100,
    //   )}%`,
    // );
  };

  const onEnded = () => {
    console.log('[player] ProgressBar ended');
    autoPlayNext();
  };

  if (set.value.broadcasterType === 'xgplayer') {
    xg.value.on(Events.TIME_UPDATE, ({ currentTime, duration }) => {
      onTimeUpdate(currentTime, duration);
    });

    xg.value.on(Events.ENDED, () => {
      onEnded();
    });
  } else if (set.value.broadcasterType === 'dplayer') {
    dp.value.on('timeupdate', () => {
      const duration = dp.value.video.duration;
      const currentTime = dp.value.video.currentTime;
      onTimeUpdate(currentTime, duration);
    });

    dp.value.on('ended', () => {
      onEnded();
    });
  }
};

// 是否自动进入下集
const autoPlayNext = () => {
  const { siteSource } = dataHistory.value;
  const index = season.value[siteSource].indexOf(currentUrl.value);

  const doc = {
    playEnd: true,
  };
  updateHistory(dataHistory.value.id, doc);
  // history.update(dataHistory.value.id, doc);

  if (season.value[siteSource].length === index + 1) {
    xg.value.pause();
    return;
  }
  changeEvent(season.value[siteSource][index + 1]);
  MessagePlugin.info('请稍候,正在切换下集');
};

// 获取是否追剧
const getBinge = async () => {
  const { id } = ext.value.site;
  const { vod_id } = info.value;
  const res = await detailStar({ relateId: id, videoId: vod_id });
  isVisible.binge = !res;
};

// 电子节目单播放状态
const filterEpgStatus = (start: any, end: any) => {
  const nowTimestamp = moment();
  const startTimestamp = moment(`${nowTimestamp.format('YYYY-MM-DD')} ${start}`);
  const endTimestamp = moment(`${nowTimestamp.format('YYYY-MM-DD')} ${end}`);

  if (nowTimestamp.isBetween(startTimestamp, endTimestamp)) return 'playing';
  if (nowTimestamp.isBefore(startTimestamp)) return 'unplay';
  if (nowTimestamp.isAfter(endTimestamp)) return 'played';
};

const load = async ($state) => {
  console.log('loading...');
  try {
    const resLength = await getChannelList();
    console.log(`[channel] 返回数据长度${resLength}`);
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

// 检查ipv6
const checkChannelListIpv6 = async (data) => {
  const newdata = await Promise.all(
    data.map(async (item) => {
      try {
        const checkStatus = await checkUrlIpv6(item.url);
        return checkStatus !== 'IPv6' ? item : null;
      } catch (err) {
        console.log(err);
        return null;
      }
    })
  );

  return newdata.filter(item => item !== null);
};

// 获取直播列表
const getChannelList = async () => {
  const { pageIndex, pageSize } = pagination.value;
  const { skipIpv6 } = data.value.ext;
  const { channelData } = iptvConfig.value;

  const res = await fetchChannelList(pageIndex, pageSize);
  pagination.value.count = res.total;

  const sourceLength = res.data.length;

  if (skipIpv6) res.data = await checkChannelListIpv6(res.data);
  const restultLength = res.data.length;
  iptvConfig.value.channelData = _.unionWith(channelData, res.data, _.isEqual);
  const length = sourceLength;

  if (skipIpv6 && sourceLength && sourceLength !== restultLength) {
    if (res.data.length === 0) {
      pagination.value.pageIndex++;
      await getChannelList();
    }
  }

  pagination.value.pageIndex++;
  return length;
};

// 获取电子节目单
const getEpgList = async (url, name, date) => {
  try {
    const res = await fetchChannelEpg(url, name, date);
    iptvConfig.value.epgData = res;
  } catch (err) {
    console.log(err);
  }
};

// 选择倒序
const reverseOrderEvent = () => {
  reverseOrder.value = !reverseOrder.value;
  seasonReverseOrder();
};

// 推荐刷新数据
const recommendEvent = async(item) => {
  const { id } = ext.value.site;

  if ( !('vod_play_from' in item && 'vod_play_url' in item) ) {
    const [detailItem] = await fetchFilmDetail(id, item.vod_id);
    item = detailItem;
  }

  info.value = item;
  recommend.value = [];
  dataHistory.value = {};
  selectPlaySource.value = '';
  selectPlayIndex.value = '';
  season.value = '';
  isVisible.binge = false;
  store.updateConfig({
    type: 'film',
    data: {
      info: item,
      ext: ext.value,
    },
  });
  initPlayer();
};

// 更新历史跳过参数
const skipHistoryConfig = async () => {
  const { skipTimeInStart, skipTimeInEnd } = skipConfig.value;
  await updateHistory(dataHistory.value.id, { skipTimeInStart, skipTimeInEnd });
};

// 更新跳过开关全局存储
const updateLocalPlayer = async (item) => {
  await store.updateConfig({
    setting: {
      skipStartEnd: item,
    },
  });

  await setDefault("skipStartEnd", item);
};

// 分享
const shareEvent = () => {
  isVisible.share = true;

  let name;
  if (type.value === 'film') name = `${info.value.vod_name} ${selectPlayIndex.value}`;
  else name = info.value.name;

  const sourceUrl = 'https://web.zyplayer.fun/?url=';
  let params;
  if (type.value === 'film') params = `${config.value.url}&name=${info.value.vod_name} ${selectPlayIndex.value}`;
  else params = `${config.value.url}&name=${info.value.name}`;
  const url = onlineUrl.value || sourceUrl + params;

  shareData.value = {
    ...shareData.value,
    name,
    url,
  };
};

const downloadEvent = () => {
  downloadDialogData.value = {
    season: season.value,
    current: config.value.url
  };
  isVisible.download = true;
}

// electron窗口置顶
const toggleAlwaysOnTop = () => {
  const isAlwaysOnTop = win.isAlwaysOnTop();
  const newValue = !isAlwaysOnTop;

  win.setAlwaysOnTop(newValue);
  BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', newValue ? 'no' : 'yes');
  isVisible.pin = newValue;
};

// 全屏事件 mac修复状态栏 css 用
const minMaxEvent = () => {
  const handleFullScreen = (isFullScreen) => {
    console.log(isFullScreen ? '进入全屏模式' : '退出全屏模式');
    isVisible.macMaximize = isFullScreen;
  };

  win.on('enter-full-screen', () => handleFullScreen(true));
  win.on('leave-full-screen', () => handleFullScreen(false));
};

// 打开主窗口
const openMainWinEvent = () => {
  window.electron.ipcRenderer.send('showMainWin');
};
</script>

<style lang="less" scoped>
.container {
  height: calc(100vh);
  width: calc(100vw);
  overflow-y: hidden;
  background: var(--td-bg-aside);

  .nowrap {
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    height: auto;
    width: auto;
    font-weight: normal;
  }

  .scroll-y {
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .drag {
    -webkit-app-region: drag;
  }

  .no-drag {
    -webkit-app-region: no-drag;
  }

  .container-header {
    height: var(--td-comp-size-xxxl);
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    white-space: nowrap;
    padding: 10px 15px;
    .left {
      transition: 0.15s linear;

      .open-main-win {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 32px;
        width: 120px;
        border-radius: var(--td-radius-medium);
        background-color: var(--td-bg-content-input);
        padding: 2px 10px;
        cursor: pointer;

        .tip-gotomain {
          display: inline-block;
          margin-left: 5px;
        }
      }

      :hover {
        background-color: var(--td-bg-content-active);
      }
    }

    .spacer {
      flex: 1 1 auto;
      overflow: hidden;
      text-align: center;

      span {
        font-weight: 700;
        text-align: center;
        display: inline-block;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .right {
      display: flex;

      .popup {
        margin-left: var(--td-comp-margin-xs);
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .item {
        cursor: pointer;
        text-align: center;
        :hover {
          // fill: var(--td-primary-color);
        }
      }

      .system-functions {
        display: flex;
        align-items: center;
        justify-content: space-around;
      }
    }
  }

  .container-main {
    height: calc(100% - var(--td-comp-size-xxxl));
    width: 100%;
    display: flex;
    justify-content: space-between;
    .player {
      flex: 1 1;
      position: relative;
      .container-player {
        width: 100%;
        height: 100%;
        .player-panel {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--td-bg-color-page) url(@/assets/bg-player.jpg) center center;
          .player {
            width: 100%;
            height: calc(100vh - 50px);
          }
        }
      }
      .subject {
        width: 100%;
      }
      .subject:hover ~ .dock-show {
        display: flex;
      }
      .subject-ext {
        width: 100vw !important;
      }
      .dock-show {
        display: none;
        transition: 0.15s ease-out;
        background: rgba(0, 0, 0, .4);
        border-radius: 8px 0 0 8px;
        width: 32px;
        height: 84px;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 95;
        cursor: pointer;
        &:hover {
          display: flex;
          background: rgba(0, 0, 0, .5);
        }
        .btn-icon {
          width: 24px;
          height: 24px;
          color: #fbfbfb;
        }
      }
    }

    .aside {
      transition: 0.15s ease-out;
      width: 300px;
      height: 100%;
      position: relative;
      background: var(--td-bg-color-container);
      border-radius: var(--td-radius-medium);
      padding: 10px 10px 0;
      box-sizing: border-box;
      .content {
        height: 100%;
        .title-warp {
          height: 26px;
          line-height: 26px;

          .title {
            max-width: 100%;
            font-size: 20px;
            min-height: 32px;
            line-height: 32px;
            font-weight: 500;
            color: var(--td-text-color-primary);
          }
        }
        .content-main {
          height: calc(100% - 26px);
          .tabs {
            height: 100%;
          }
          .contents-wrap {
            height: 100%;
            width: 100%;
            padding-top: 10px;
            display: flex;
            flex-direction: column;
            .content {
              .content-item-start {
                justify-content: flex-start;
              }
              .content-item-between {
                justify-content: space-between;
              }
              .content-item {
                display: flex;
                align-items: center;
                font-weight: 500;
                cursor: pointer;
                .time-warp {
                  width: 40px;
                  color: #f09736;
                  margin-right: 10px;
                }
                .status-wrap {
                  text-align: right;
                  .played {
                    color: #2774f6;
                  }
                  .playing {
                    color: #f09736;
                  }
                  .unplay {
                    color: var(--td-text-color-primary);
                  }
                }
                .logo-wrap {
                  max-width: 60px;
                  margin-right: 10px;
                }
                .title-wrap {
                  font-weight: bold;
                }
                .title-warp-channel {
                  width: calc(100% - 120px);
                }
                .title-warp-epg {
                  width: calc(100% - 110px);
                }
                &:hover {
                  background-color: var(--td-bg-content-active);
                  border-radius: var(--td-radius-medium);
                }
              }
            }
          }
          .channel-wrap,
          .epg-wrap,
          .drive-wrap {
            height: calc(100vh - 150px);
          }
        }
        .tvg-block {
          width: 100%;
          word-break: break-all;
          display: flex;
          flex-direction: column;
          align-items: baseline;
          .title-album {
            font-size: 100%;
            .title-text {
              font-weight: 500;
              display: inline;
              line-height: 16px;
              font-size: 16px;
              color: var(--td-text-color-primary);
            }
            .title-desc {
              display: inline;
              margin-left: 9px;
              font-size: 12px;
              cursor: pointer;
            }
          }
          .hot-block {
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 12px;
            height: 12px;
            line-height: 12px;
            overflow: visible;
            position: relative;
            margin-top: 8px;
            .rate {
              color: var(--td-brand-color);
            }
          }
          .function {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            align-items: center;
            margin-top: 15px;
            margin-bottom: 12px;
            font-size: 14px;
            height: 40px;
            position: relative;
            background: hsla(0, 0%, 100%, .06);
            box-shadow: 0 2px 16px 0 rgba(0,0,0,.16);
            border-radius: 8px;
            .func-item {
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              font-size: 12px;
              line-height: 12px;
              text-align: center;
              &:hover {
                color: var(--td-text-color-primary);
              }
              .tip {
                vertical-align: top;
                line-height: 25px;
                text-align: center;
                margin-left: 4px;
              }
            }
            .dot {
              height: 24px;
              width: 1px;
              border-right: 1px solid;
              border-image-source: linear-gradient(180deg, hsla(0, 0%, 100%, 0), hsla(0, 0%, 100%, .1) 53%, hsla(0, 0%, 100%, 0));
              border-image-slice: 1;
            }
          }
        }
        .anthology-contents-scroll {
          position: relative;
          height: calc(100vh - 56px - 10px - 111px);
          overflow-y: auto;
          overflow-x: hidden;
          .box-anthology-header {
            font-size: 16px;
            line-height: 18px;
            display: flex;
            justify-content: space-between;
            color: var(--td-text-color-primary);
            .box-anthology-reverse-order {
              cursor: pointer;
            }
          }

          .listbox {
            overflow: hidden;
            .tag-container {
              display: flex;
              flex-wrap: wrap;
              padding-top: 10px;
              .mainVideo-num {
                position: relative;
                width: 44px;
                font-size: 18px;
                height: 44px;
                line-height: 44px;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                margin-bottom: 4px;
                margin-right: 4px;
                background-image: linear-gradient(hsla(0, 0%, 100%, .06), hsla(0, 0%, 100%, 0));
                box-shadow: 0 2px 8px 0 rgba(0,0,0,.08);
                &:before {
                  content: "";
                  display: block;
                  position: absolute;
                  top: 1px;
                  left: 1px;
                  right: 1px;
                  bottom: 1px;
                  border-radius: 8px;
                  background-color: var(--td-bg-color-container);
                  z-index: 2;
                }
                .mainVideo_inner {
                  position: absolute;
                  top: 1px;
                  left: 1px;
                  right: 1px;
                  bottom: 1px;
                  border-radius: 8px;
                  z-index: 3;
                  overflow: hidden;
                  background-image: linear-gradient(hsla(0, 0%, 100%, .04), hsla(0, 0%, 100%, .06));
                  .playing {
                    display: none;
                    min-width: 10px;
                    height: 8px;
                    background: url(@/assets/player/playon-green.gif) no-repeat;
                  }
                }
              }
              .mainVideo-selected {
                color: var(--td-brand-color);
                background-image: linear-gradient(hsla(0, 0%, 100%, .1), hsla(0, 0%, 100%, .06));
                // box-shadow: 0 2px 8px 0 rgba(0,0,0,.08), inset 0 4px 10px 0 rgba(0,0,0,.14);
                .playing {
                  display: inline-block !important;
                  position: absolute;
                  left: 6px;
                  bottom: 6px;
                }
              }
            }
          }

          .recommend {
            .component-title {
              font-size: 16px;
              line-height: 16px;
              margin-top: 24px;
              margin-bottom: 12px;
              font-weight: 500;
              color: var(--td-text-color-primary);
            }

            .component-list {
              .videoItem-card {
                width: 100%;
                position: relative;
                z-index: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                column-gap: 4px;
                cursor: pointer;
                padding: 6px 0;

                .videoItem-left {
                  position: relative;
                  float: left;
                  margin-right: 10px;
                  font-size: 12px;
                  height: 100%;
                  overflow: hidden;
                }

                .videoItem-right {
                  flex: 1 1;
                  position: relative;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  justify-content: flex-start;

                  .title {
                    font-size: 14px;
                    line-height: 20px;
                    max-height: 40px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    word-break: break-all;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    color: var(--td-text-color-primary);
                  }

                  .subtitle {
                    margin-top: 6px;
                    line-height: 14px;
                    font-size: 12px;
                    max-height: 40px;
                    white-space: wrap;
                  }
                }
              }
            }
          }
        }
        
        .profile {
          display: flex;
          flex-direction: column;
          height: 100%;
          .side-head {
            flex-shrink: 0;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            .title {
              font-size: 16px;
              line-height: 24px;
            }
            .icon {
              cursor: pointer;
            }
          }
          .side-body {
            flex: 1;
            position: relative;
            padding: 8px 0;
            .card {
              display: flex;
              flex-direction: row;
              .cover {
                width: 84px;
                height: 112px;
                margin-right: 12px;
              }
              .content {
                flex: 1;
                padding-top: 10px;
                .name {
                  font-size: 16px;
                  line-height: 24px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }
                .type {
                  font-size: 14px;
                  line-height: 20px;
                  margin-top: 5px;
                }
                .num {
                  font-size: 14px;
                  line-height: 20px;
                  margin-top: 5px;
                }
              }
            }
            .text {
              margin-top: 8px;
              line-height: 20px;
              font-size: 14px;
            }
            .case {
              margin-top: 12px;
              .title {
                line-height: 16px;
                font-size: 14px;
                font-weight: 500;
                color: var(--td-text-color-primary);
              }
            }
          }
        }
      }
    }
  }
}

.setting-warp {
  display: inline-flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding-bottom: 2px;
  .setting-item-warp {
    display: flex;
    justify-content: space-between;
  }
  .tip-warp {
    bottom: 4px;
  }
}

.setting-warp,
.download-warp {
  .tip-warp {
    color: var(--td-gray-color-6);
    font-size: var(--td-font-size-link-small);
    position: absolute;
    left: calc(var(--td-comp-paddingLR-xxl) + var(--td-size-1));
  }
}
</style>
