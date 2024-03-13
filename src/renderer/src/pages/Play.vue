<template>
  <div class="container">
    <div class="container-header" :class="!isVisible.macMaximize ? 'drag' : 'no-drag'">
      <div class="player-top">
        <div class="player-top-left" :style="{ 'padding-left': platform === 'darwin' && !isVisible.macMaximize ? '60px' : '0' }">
          <div class="open-main-win player-center" @click="openMainWinEvent">
            <home-icon size="1.5em" />
            <span class="tip-gotomain">回到主界面</span>
          </div>
        </div>
        <div class="player-top-spacer">
          <span v-if="type === 'film'">{{ `${info.vod_name} ${selectPlayIndex}` }}</span>
          <span v-else>{{ info.name }}</span>
        </div>
        <div class="player-top-right">
          <div class="player-top-right-share">
            <div class="player-top-right-popup player-top-right-item" @click="shareEvent">
              <share-popup v-model:visible="isVisible.share" :data="shareData" />
            </div>
          </div>
          <div v-if="type === 'film'" class="player-top-right-download">
            <div class="player-top-right-item player-top-right-popup" @click="isVisible.download = true">
              <download-icon size="1.5em" />
            </div>
            <t-dialog
              v-model:visible="isVisible.download"
              header="离线缓存"
              width="508"
              placement="center"
              confirm-btn="复制下载链接"
              :on-confirm="copyDownloadUrl"
              :cancel-btn="null"
            >
              <div class="download-warp">
                <div class="source-warp">
                  <t-select
                    v-model="downloadSource"
                    placeholder="请选下载源"
                    size="small"
                    style="width: 200px; display: inline-block"
                    @change="downloadSourceChange"
                  >
                    <t-option v-for="(item, key) in season" :key="key" :value="key">{{ key }}</t-option>
                  </t-select>
                  <t-button size="small" theme="default" @click="copyCurrentUrl">复制当前地址</t-button>
                  <!-- <div>仅支持后缀为m3u8、flv、mp4</div> -->
                </div>
                <div class="content-warp">
                  <t-transfer v-model="downloadTarget" :data="downloadEpisodes">
                    <template #title="props">
                      <div>{{ props.type === 'target' ? '需下载' : '待下载' }}</div>
                    </template>
                  </t-transfer>
                </div>
                <div class="tip-warp">
                  <span>推荐使用开源下载器：</span>
                  <t-link
                    theme="primary"
                    underline
                    href="https://github.com/HeiSir2014/M3U8-Downloader/releases/"
                    target="_blank"
                  >
                    M3U8-Downloader
                  </t-link>
                </div>
              </div>
            </t-dialog>
          </div>
          <div v-if="type === 'film'" class="player-top-right-setting">
            <div class="player-top-right-item player-top-right-popup" @click="isSettingVisible = true">
              <setting-icon size="1.5em" />
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
          <div class="player-top-right-staple">
            <div class="player-top-right-popup player-top-right-item" @click="toggleAlwaysOnTop">
              <pin-filled-icon v-if="isVisible.pin" size="1.5em" />
              <pin-icon v-else size="1.5em" />
            </div>
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
            <div v-show="onlineUrl && isSniff" class="player-webview">
              <iframe
                ref="iframeRef"
                :key="onlinekey"
                class="player"
                :src="onlineUrl"
                allowtransparency="true"
                frameborder="0"
                scrolling="no"
                allowfullscreen="true"
                webkit-playsinline
                playsinline
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
              ></iframe>
            </div>
          </div>
        </div>

        <div class="player-wide-btn" @click="showEpisode = !showEpisode">
          <div class="player-wide-btn-box">
            <chevron-left-icon v-if="showEpisode" class="player-wide-btn-icon" />
            <chevron-right-icon v-else class="player-wide-btn-icon" />
          </div>
        </div>
      </div>

      <div class="container-episode">
        <div v-if="!showEpisode" class="episode-warp">
          <div class="episode-panel-wrapper">
            <div v-if="type == 'iptv'" class="iptv contents">
              <div class="play-title-warp">
                <p class="play-title nowrap">{{ info.name }}</p>
              </div>
              <div class="iptv-items">
                <t-tabs v-model="selectIptvTab" class="iptv-tabs">
                  <t-tab-panel value="epg" label="节目">
                    <div class="epg-items">
                      <div class="contents-wrap scroll">
                        <div v-for="(item, index) in iptvConfig.epgData" :key="index" class="content">
                          <div class="content-item content-item-between">
                            <div class="time-warp">{{ item.start }}</div>
                            <div class="title-wrap nowrap title-warp-epg">{{ item.title }}</div>
                            <div class="status-wrap">
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
                  </t-tab-panel>
                  <t-tab-panel value="channel" label="频道">
                    <div class="channel-items">
                      <div class="contents-wrap scroll">
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
                              <span :class="item.url === config.url ? 'playing' : 'unplay'">
                                {{ item.url === config.url ? '正在播放' : '未播放' }}
                              </span>
                            </div>
                          </div>
                          <t-divider dashed style="margin: 5px 0" />
                        </div>
                        <infinite-loading style="text-align: center; color: #fdfdfd" :distance="200" @infinite="load">
                          <template #complete>人家是有底线的</template>
                          <template #error>哎呀，出了点差错</template>
                        </infinite-loading>
                      </div>
                    </div>
                  </t-tab-panel>
                </t-tabs>
              </div>
            </div>
            <div v-if="type == 'film'" class="film contents">
              <div v-if="!isProfile" class="contents-wrap">
                <div class="title-wrap">
                  <h3 class="title-name nowrap">{{ info.vod_name }}</h3>
                  <div class="title-binge">
                    <div v-if="isVisible.binge" class="video-subscribe-text" @click="bingeEvnet">
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
                  <div class="box-anthology-header">
                    <h4 class="box-anthology-title">选集</h4>
                    <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
                      <order-descending-icon v-if="reverseOrder" size="1.3em" />
                      <order-ascending-icon v-else size="1.3em" />
                    </div>
                  </div>
                  <div class="box-anthology-items">
                    <t-tabs v-model="selectPlaySource" class="film-tabs">
                      <t-tab-panel v-for="(value, key, index) in season" :key="index" :value="key">
                        <template #label> {{ key }} </template>
                        <div class="tag-container">
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
            <div v-if="type == 'drive'" class="drive contents">
              <div class="play-title-warp">
                <p class="play-title nowrap">{{ info.name }}</p>
              </div>
              <div class="drive-items">
                <div class="contents-wrap scroll drive-warp">
                  <div v-for="item in driveDataList" :key="item.id" class="content">
                    <div class="content-item content-item-start" @click="changeDriveEvent(item)">
                      <div class="logo-wrap">
                        <t-image
                          class="logo"
                          fit="contain"
                          :src="item.thumb"
                          :style="{ width: '64px', height: '32px', maxHeight: '32px', background: 'none' }"
                          :lazy="true"
                          :loading="renderLoading"
                          :error="renderError"
                        >
                        </t-image>
                      </div>
                      <div class="title-wrap nowrap title-warp-channel">{{ item.name }}</div>
                      <div class="status-wrap">
                        <span :class="info.name === item.name ? 'playing' : 'unplay'">
                          {{ info.name === item.name ? '正在播放' : '未播放' }}
                        </span>
                      </div>
                    </div>
                    <t-divider dashed style="margin: 5px 0" />
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
<script setup lang="tsx">
import '@/style/player/veplayer.css';

import 'v3-infinite-loading/lib/style.css';

import { useClipboard } from '@vueuse/core';
import DPlayer from 'dplayer';
import flvjs from 'flv.js';
import Hls from 'hls.js';
import _ from 'lodash';
import moment from 'moment';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Tv1Icon,
  DownloadIcon,
  HeartIcon,
  HomeIcon,
  LoadingIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
  PinFilledIcon,
  PinIcon,
  SettingIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { computed, onMounted, ref, reactive, watch } from 'vue';
import Player, { Events } from 'xgplayer';
import LivePreset from 'xgplayer/es/presets/live';
import FlvPlugin from 'xgplayer-flv';
import HlsPlugin from 'xgplayer-hls';
import Mp4Plugin from 'xgplayer-mp4';

import playerPauseIcon from '@/assets/player/pause.svg?raw';
import playerPipIcon from '@/assets/player/pip.svg?raw';
import playerPlayIcon from '@/assets/player/play.svg?raw';
import playerPlayNextIcon from '@/assets/player/play-next.svg?raw';
import playerVoiceIcon from '@/assets/player/voice.svg?raw';
import playerVoiceNoIcon from '@/assets/player/voice-no.svg?raw';
import playerZoomIcon from '@/assets/player/zoom.svg?raw';
import playerZoomExitIcon from '@/assets/player/zoom-s.svg?raw';
import windowView from '@/layouts/components/Window.vue';

import { setDefault } from '@/api/setting';
import { fetchAnalyzeDefault } from '@/api/analyze';
import { fetchFilmDetail } from '@/api/site';
import { updateHistory, detailHistory, addHistory } from '@/api/history';
import { detailStar, addStar, delStar } from '@/api/star';
import { fetchChannelList } from '@/api/iptv';

import { getConfig, getMeadiaType, checkUrlIpv6, checkLiveM3U8 } from '@/utils/tool';
import { __jsEvalReturn } from '@/utils/alist_open';
import { fetchDrpyPlayUrl, fetchHipyPlayUrl, fetchDetail, fetchSearch,fetchDoubanRecommend } from '@/utils/cms';
import { fetchChannelEpg } from '@/utils/channel';
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

const { isSupported, copy } = useClipboard();

const downloadSource = ref();
const downloadEpisodes = ref([]);
const downloadTarget = ref([]);

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

const selectIptvTab = ref('epg');
const recommend = ref([]); // 推荐
const season = ref(); // 选集
const selectPlaySource = ref(); // 选择的播放源
const selectPlayIndex = ref();
const xg = ref(null); // 西瓜播放器
const tc = ref(null); // 腾讯播放器
const dp = ref(null); // dp播放器
const tcplayerRef = ref(null); // 腾讯云播放器dom节点
const xgpayerRef = ref(null); // 西瓜播放器dom节点
const showEpisode = ref(false); // 是否显示右侧栏
const isSettingVisible = ref(false);

const dataHistory = ref({}); // 历史
// const iswideBtn = ref(false); // 视频划过显示按钮
const isProfile = ref(false); // 简介

const onlineUrl = ref(); // 解析接口+需解析的地址
const isSniff = ref(true); // 嗅探标识
const iframeRef = ref(); // iframe dom节点
const currentUrl = ref(); // 当前未解析前的url
const snifferTimer = ref();
const reverseOrder = ref(true); // true 正序 false 倒序

const onlinekey = new Date().getTime(); // 解决iframe不刷新问题

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
  binge: false
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

// 添加画中画事件
watch(
  () => xg.value,
  (val) => {
    if (val?.hasStart) {
      val.on(Events.PIP_CHANGE, (isPip) => {
        console.log('isPip', isPip);
        window.electron.ipcRenderer.send('toggle-playerPip', isPip);
      });
    }
  },
);

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
  document.documentElement.setAttribute('theme-mode', 'dark');
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
const createPlayer = async (videoType) => {
  if (!videoType) {
    const meadiaType = await getMeadiaType(config.value.url);
    if (meadiaType !== 'unknown' && meadiaType !== 'error' ) {
      videoType = meadiaType;
    }
  }
  if (set.value.broadcasterType === 'xgplayer') {
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
    xg.value = new Player({ ...config.value });
    console.log(`[player] 加载西瓜${videoType}播放器`);
  } else if (set.value.broadcasterType === 'dplayer') {
    switch (videoType) {
      case 'mp4':
        dpConfig.value.video.url = config.value.url;
        break;
      case 'flv':
        dpConfig.value.video = {
          url: config.value.url,
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
          url: config.value.url,
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
          url: config.value.url,
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

    console.log(`[analyze] jx:${res.default.url}; flag:${[...res.flag]}`);
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

// 判断媒体类型
const checkMediaType = async (url) => {
  const supportedFormats = ['mp4', 'mkv', 'flv', 'm3u8', 'avi'];

  if (url.startsWith('http')) {
    const fileType = supportedFormats.find(format => url.includes(format));
    if (fileType) {
      return fileType;
    } else {
      const getMediaType = await getMeadiaType(url);
      return getMediaType;
    }
  } else {
    return null; // 如果 URL 不以 http 开头，返回 null
  }
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

  if (config.value.url.includes('mp4') || config.value.url.includes('mkv')) {
    createPlayer('mp4');
  } else if (config.value.url.includes('flv')) {
    createPlayer('flv');
  } else {
    createPlayer('m3u8');
  }
};

// 初始化film
const initFilmPlayer = async (isFirst) => {
  await getDetailInfo();

  if (!isFirst) {
    await getHistoryData();
    await getAnalysisData();

    getDoubanRecommend();
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
  const { playUrl } = ext.value.site;
  if (playUrl) {
    const play = await getConfig(`${playUrl}${config.value.url}`);
    console.log(`解析地址:${play.url}`);
    if (play.url) {
      config.value.url = play.url;
      const fileExtension = play.url.match(/\.([^/?#]+)(?:[?#]|$)/i)[1];
      createPlayer(fileExtension);
      return;
    }
  }

  // 官解iframe
  try {
    const { hostname } = new URL(config.value.url);
    if (
        VIP_LIST.some((item) => hostname.includes(item)) ||
        analyzeConfig.value.flag.some((item) => selectPlaySource.value.includes(item))
      ) {
        onlineUrl.value = analyzeConfig.value.default.url + config.value.url;
        isSniff.value = true;
        console.log(`[player] return: 官解播放地址:${onlineUrl.value}`);
        return;
      }
  } catch (err) {
    console.info(`[player] input: 传入地址不是url:${config.value.url}`);
  }

  if (ext.value.site.type === 6) {
    // hipy获取服务端播放链接
    console.log('[player] start: hipy获取服务端播放链接开启');
    const { site } = ext.value;
    try {
      const hipyPlayUrl = await fetchHipyPlayUrl(site, selectPlaySource.value, config.value.url);
      config.value.url = hipyPlayUrl;
      console.log(`[player] return: hipy获取服务端返回链接:${config.value.url}`);
    } catch (err) {
      console.log(err);
    } finally {
      console.log(`[player] end: hipy获取服务端播放链接结束`);
    }
  } else if (ext.value.site.type === 2) {
    // drpy嗅探
    MessagePlugin.info('免嗅资源中, 请等待!');
    console.log('[player] start: drpy免嗅流程开始');
    const { site } = ext.value;
    try {
      const drpySniffFree = await fetchDrpyPlayUrl(site, config.value.url);
      if (drpySniffFree.redirect) {
        config.value.url = drpySniffFree.url;
      }
    } catch (err) {
      console.log(err);
    }

    console.log(`[player] end: drpy免嗅流程结束`);
  }

  const mediaType = await checkMediaType(config.value.url);
  console.log(`[player] mediaType: ${mediaType}`)
  if (mediaType !== 'unknown' && mediaType !== 'error') {
    createPlayer(mediaType);
    return;
  }

  // 兜底办法:嗅探
  console.log(`尝试提取播放链接,type:${ext.value.site.type}`);
  try {
    MessagePlugin.info('嗅探资源中, 如10s没有结果请换源,咻咻咻!');
    isSniff.value = false;
    sniffer();
  } catch (err) {
    console.error(err);
  };
};

// 初始化网盘
const initCloudPlayer = async () => {
  driveDataList.value = ext.value.files;
  config.value.url = info.value.url;
  if (info.value.name.includes('mp4') || info.value.name.includes('mkv') || info.value.name.includes('mkv') || info.value.name.includes('avi')) {
    createPlayer('mp4');
  } else if (config.value.url.includes('flv') || info.value.name.includes('flv')) {
    createPlayer('flv');
  } else {
    createPlayer('m3u8');
  }
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

// 嗅探
const videoFormats = ['.m3u8', '.mp4', '.flv', 'avi', 'mkv'];

const sniffer_iframe = () => {
  win.webContents.setAudioMuted(true);
  const iframeWindow = iframeRef.value.contentWindow;

  const totalTime = 15000;
  const speeder = 250;
  let counter = 1;
  const totalCounter = totalTime / speeder;
  clearInterval(snifferTimer.value);

  snifferTimer.value = setInterval(() => {
    console.log(`第${counter}次嗅探开始`);

    if (counter >= totalCounter) {
      clearInterval(snifferTimer.value);
      MessagePlugin.warning(`嗅探超时并结束, 共计嗅探:${counter}次, 请换源`);
      console.log(`嗅探超时并结束，共计嗅探:${counter}次`);
      return;
    }

    try {
      const resources = iframeWindow.performance.getEntriesByType('resource');

      for (const resource of resources) {
        const resourceName = resource.name;
        const sniffUrl = resourceName;
        const formatIndex = videoFormats.findIndex((format) => sniffUrl.toLowerCase().indexOf(format) > -1);
        if (formatIndex > -1) {
          const videoFormat = videoFormats[formatIndex];
          console.log(`嗅探到${videoFormat}文件:${resourceName},共计嗅探:${counter}次`);
          const regex = new RegExp(`https?:\\/\\/.*(https?:\\/\\/(?:[^\\s"]+\\/)+[^\\s"]+\\${videoFormat})`);
          const match = sniffUrl.match(regex);
          console.log(match);

          if (match && match.length > 1) {
            console.log(`最终嗅探地址：${match[1]}`);
            config.value.url = match[1];
          } else {
            console.log(`最终嗅探地址：${resourceName}`);
            config.value.url = resourceName;
          }

          onlineUrl.value = '';
          createPlayer(videoFormat.slice(1));
          win.webContents.setAudioMuted(false);

          clearInterval(snifferTimer.value);
          break;
        }
      }
    } catch (err) {
      MessagePlugin.error(`温馨提示：嗅探发生错误:${err}`);
      console.log(`第${counter}次嗅探发生错误:${err}`);
    }
    counter += 1;
  }, speeder);
};

const sniffer_pie = () => {
  window.electron.ipcRenderer.invoke('sniffer-media', config.value.url).then(res => {
    console.log(res)
    if (res.code == 200) {
      const formatIndex = videoFormats.findIndex((format) => res.data.url.toLowerCase().indexOf(format) > -1);
      if (formatIndex > -1) {
        config.value.url = res.data.url;
        const videoFormat = videoFormats[formatIndex];
        createPlayer(videoFormat.slice(1));
      }
    } else {
      MessagePlugin.warning(`嗅探超时并结束, 请换源`);
    };
  });
};

const sniffer = () => {
  if (set.value.snifferType === 'iframe') {
    onlineUrl.value = config.value.url;
    sniffer_iframe();
  } else sniffer_pie();
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
const bingeEvnet = async () => {
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
      } catch (err) {
        // Handle the error if necessary
      }
    });

    await Promise.all(searchPromises);

    if ( ids.length > 0 ) {
      const idsFirst = ids[0]
      if ( !('vod_pic' in idsFirst) ) { 
        flag = false;
        vodIds = ids.map((movie) => movie.vod_id).join(',');
      }
    }

    if ( flag ) recommend.value = ids;
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
  } else if (set.value.broadcasterType === 'tcplayer') {
    tc.value.on('timeupdate', () => {
      const duration = tc.value.duration();
      const currentTime = tc.value.currentTime();
      onTimeUpdate(currentTime, duration);
    });

    tc.value.on('ended', () => {
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
const filterEpgStatus = (start, end) => {
  const nowTimestamp = moment();
  const startTimestamp = moment(`${nowTimestamp.format('YYYY-MM-DD')} ${start}`);
  const endTimestamp = moment(`${nowTimestamp.format('YYYY-MM-DD')} ${end}`);

  if (nowTimestamp.isBetween(startTimestamp, endTimestamp)) return '正在直播';
  if (nowTimestamp.isBefore(startTimestamp)) return '未播放';
  if (nowTimestamp.isAfter(endTimestamp)) return '已播放';
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

// 复制到剪贴板
const copyToClipboard = (content, successMessage, errorMessage) => {
  copy(content);
  if (isSupported) MessagePlugin.info(successMessage);
  else MessagePlugin.warning(errorMessage);
};

// 检查复制的复制
const checkDownloadUrl = (url) => {
  const allowedExtensions = ['m3u8', 'flv', 'mp4'];
  const urlExtension = url.match(/\.([^.]+)$/)?.[1]; // 使用正则表达式提取文件扩展名
  const isValid = urlExtension && allowedExtensions.includes(urlExtension); // 检查是否在允许的扩展名列表中

  if (!isValid) MessagePlugin.warning('注意: 当前选择非m3u8/flv/mp4播放源');
};

// 复制下载地址列表
const downloadSourceChange = () => {
  const list = [];
  for (const item of season.value[downloadSource.value]) {
    const [index, url] = item.split('$');
    list.push({
      value: url,
      label: index,
      disabled: false,
    });
  }
  downloadEpisodes.value = list;
};

// 复制下载链接
const copyDownloadUrl = () => {
  const [firstUrl] = downloadTarget.value;

  if (firstUrl) {
    const downloadUrl = downloadTarget.value.join('\n');
    const successMessage = '复制成功，快到下载器里下载吧!';
    const errorMessage = '复制失败，当前环境不支持一键复制!';
    
    checkDownloadUrl(firstUrl);
    copyToClipboard(downloadUrl, successMessage, errorMessage);
    isVisible.download = false;
  } else {
    MessagePlugin.warning('请先选择需要下载的内容!');
  }
};

// 复制当前播放地址
const copyCurrentUrl = () => {
  const successMessage = '复制成功, 请使用第三方软件!';
  const errorMessage = '当前环境不支持一键复制,请手动复制链接!';
  copyToClipboard(config.value.url, successMessage, errorMessage);
  checkDownloadUrl(config.value.url);

  isVisible.download = false;
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

  .drag {
    -webkit-app-region: drag;
  }

  .no-drag {
    -webkit-app-region: no-drag;
  }

  .container-header {
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
        transition: 0.15s linear;

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
          margin-left: var(--td-comp-margin-xs);
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
            cursor: default;

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
                  position: absolute;
                  background-color: #16161a;
                  width: 20px;
                  height: 80px;
                  border-radius: var(--td-radius-medium);
                  top: 5px;
                  left: 10px;
                }

                .main {
                  position: absolute;
                  top: 0;
                  left: 30px;

                  .qrcode {
                    width: 90px;
                    height: 90px;
                    border-radius: var(--td-radius-large);
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
              cursor: pointer;

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
          background: var(--td-bg-color-page) url(../assets/bg-player.jpg) center center;
          .player {
            width: 100%;
            height: calc(100vh - 50px);
          }
        }
      }

      .player-wide-btn {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);

        .player-wide-btn-box {
          cursor: pointer;
          z-index: 120;
          border-radius: 5px 0 0 5px;
          background: rgba(0, 0, 0, 0.5);
          width: 20px;
          height: 120px;
          overflow: hidden;
          &:hover {
            background-color: #18191c;
          }
          .player-wide-btn-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            fill: #333;
            left: 3px;
          }
        }
      }
    }

    .container-episode {
      width: 300px;
      position: relative;

      .episode-warp {
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

          .contents {
            padding-top: 20px;
          }

          .drive {
            .play-title-warp {
              .play-title {
                max-width: 100%;
              }
            }
          }

          .play-title-warp {
            height: 26px;
            line-height: 26px;

            .play-title {
              max-width: 190px;
              font-size: 20px;
              min-height: 32px;
              line-height: 32px;
              font-weight: 500;
              color: #fff;
              position: relative;
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
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  overflow: hidden;

                  .rate {
                    color: var(--td-brand-color);
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
                .box-anthology-header {
                  display: flex;
                  justify-content: space-between;
                  .box-anthology-title {
                    position: relative;
                    font-size: 18px;
                    line-height: 25px;
                    color: hsla(0, 0%, 100%, 0.9);
                    font-weight: 600;
                  }
                  .box-anthology-reverse-order {
                    cursor: pointer;
                  }
                }

                .box-anthology-items {
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
                      color: var(--td-brand-color) !important;
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
                      justify-content: flex-start;

                      .title {
                        font-size: 14px;
                        line-height: 20px;
                        max-height: 40px;
                        overflow: hidden;
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
                        white-space: wrap;
                        max-height: 40px;
                        line-height: 14px;
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
                  font-size: 24px;
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
                  font-weight: 400;
                  color: hsla(0, 0%, 100%, .5);
                }

                .intro-desc {
                  margin-top: 7px;
                  line-height: 24px;
                  color: hsla(0, 0%, 100%, .9);
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

:deep(.t-tabs__nav-item-text-wrapper) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.tag) {
  color: rgba(255, 255, 255, 0.9) !important;
  background-color: #393939 !important;
  cursor: pointer;
}

.select {
  color: var(--td-brand-color) !important;
}

:deep(.t-tabs__content) {
  padding-top: 10px;
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

:deep(.t-input) {
  background-color: var(--td-gray-color-11);
  border-color: transparent;
}

:deep(.t-select-input) {
  border-width: 2px;
  border-style: solid;
  border-color: var(--td-gray-color-11);
  background-color: var(--td-gray-color-11);
  border-radius: 5px;
}

.t-tabs {
  background-color: rgba(0, 0, 0, 0);
}

.contents-wrap {
  height: calc(100% - 90px);
  width: 100%;
  overflow-y: scroll;
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
      .logo-wrap {
        max-width: 60px;
        margin-right: 10px;
      }
      .title-wrap {
        color: #f0f0f1;
        font-weight: bold;
      }
      .title-warp-channel {
        width: calc(100% - 120px);
      }
      .title-warp-epg {
        width: calc(100% - 110px);
      }
      &:hover {
        background-color: #2f3134;
        border-radius: var(--td-radius-small);
      }
    }
  }
}


.drive-warp {
  margin-top: 20px;
  height: calc(100% - 0px);
}

.scroll {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.channel-items,
.epg-items,
.drive-items {
  position: relative;
  height: calc(100vh - 70px);
}

.download-warp {
  .source-warp {
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;
    flex-direction: row;
    align-items: center;
    color: var(--td-gray-color-6);
    font-size: var(--td-font-size-link-small);
  }

  .content-warp {
    margin: var(--td-comp-margin-s) 0;
    :deep(.t-button + .t-button) {
      margin-left: 0 !important;
    }
  }

  .tip-warp {
    bottom: calc(var(--td-comp-paddingTB-xxl) + 8px);
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

.player-info-warp {
  .player-info-items {
    max-height: 300px;
    border-radius: 5px;
    background-color: var(--td-bg-color-page);
  }
  .tip-warp {
    bottom: 4px;
  }
}

.setting-warp,
.player-info-warp,
.download-warp {
  .tip-warp {
    color: var(--td-gray-color-6);
    font-size: var(--td-font-size-link-small);
    position: absolute;
    left: calc(var(--td-comp-paddingLR-xxl) + var(--td-size-1));
  }
}

:deep(.t-dialog) {
  color: var(--td-font-white-1) !important;
  background-color: var(--td-gray-color-13) !important;
  border: none !important;
  .t-dialog__header {
    color: var(--td-font-white-1);
    .t-dialog__close {
      color: var(--td-font-white-2);
      &:hover {
        background: var(--td-gray-color-12);
      }
    }
  }
}

:deep(.t-select-input) {
  color: var(--td-font-white-1) !important;
  border-color: var(--td-gray-color-11) !important;
  background-color: var(--td-gray-color-11) !important;
}

:deep(.t-input__inner),
:deep(.t-transfer) {
  color: var(--td-font-white-1) !important;
}

:deep(.t-input__inner) {
  &::placeholder {
    color: var(--td-gray-color-5);
  }
}

.t-select :deep(.t-fake-arrow) {
  color: var(--td-font-white-3);
}

.t-popup__content :deep(*) {
  background: var(--td-gray-color-11) !important;
}

.t-select-option:not(.t-is-disabled):not(.t-is-selected):hover :deep(*) {
  background-color: var(--td-gray-color-12);
}

.t-select-option :deep(*) {
  color: var(--td-font-white-1);
}

.t-select-option.t-select-option__hover:not(.t-is-disabled).t-select-option.t-select-option__hover:not(.t-is-selected)
  :deep(*) {
  background-color: var(--td-gray-color-12);
}

:deep(.t-transfer) {
  color: var(--td-font-white-1);
  background-color: var(--td-gray-color-11);
  border-radius: var(--td-radius-large);

  &__list-source,
  &__list-target {
    border: none;
  }

  &__list-header + :not(.t-transfer__list--with-search) {
    border-top: 1px solid var(--td-gray-color-10);
  }

  &__list-header > span,
  .t-checkbox {
    color: var(--td-font-white-1);
  }

  &__list-item:hover {
    background: var(--td-gray-color-12);
  }

  &__list-item.t-is-checked {
    background: var(--td-brand-color);
  }

  .t-checkbox__input {
    border: 1px solid var(--td-gray-color-9);
    background-color: var(--td-gray-color-13);
  }

  &__empty {
    color: var(--td-gray-color-6);
  }

  .t-button--variant-outline {
    background-color: var(--td-gray-color-13);
    border-color: transparent;

    &.t-is-disabled {
      border-color: transparent;
      background-color: var(--td-gray-color-12);
      color: var(--td-font-white-4);
    }
  }
}

:deep(.t-list.t-size-s .t-list-item) {
  background-color: var(--td-bg-color-page);
}
</style>
