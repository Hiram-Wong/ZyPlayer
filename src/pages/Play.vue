<template>
  <div class="container">
    <div class="container-header">
      <div class="player-top">
        <div class="player-top-left" :style="{ 'padding-left': platform === 'darwin' && !isMacFull ? '60px' : '0' }">
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
          <div v-if="type === 'film'" class="player-top-right-share">
            <div class="player-top-right-popup player-top-right-item" @click="isShareVisible = !isShareVisible">
              <t-popup
                trigger="click"
                :visible="isShareVisible"
                :on-visible-change="onShareVisibleChange"
                placement="bottom-right"
                :overlay-inner-style="{ boxShadow: 'none', padding: '0' }"
                attach=".player-top-right-share"
              >
                <share-icon size="1.5em" />
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
                            {{ `${info.vod_name} ${selectPlayIndex}` }}
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
                        attach=".bottom-copy"
                      >
                        <span class="bottom-copy-btn" @click="copyShareUrl">复制地址</span>
                      </t-popup>
                    </div>
                  </div>
                </template>
              </t-popup>
            </div>
          </div>
          <div v-if="type === 'film'" class="player-top-right-download">
            <div class="player-top-right-item player-top-right-popup" @click="isDownloadVisible = true">
              <download-icon size="1.5em" />
            </div>
            <t-dialog
              v-model:visible="isDownloadVisible"
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
                  >
                    <t-option v-for="(value, key, index) in season" :key="index" :value="key" :label="key"></t-option>
                  </t-select>
                  <div>仅支持m3u8播放源</div>
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
          <div class="player-top-right-staple">
            <div class="player-top-right-popup player-top-right-item" @click="toggleAlwaysOnTop">
              <pin-icon v-if="isPinned" size="1.5em" />
              <pin-filled-icon v-else size="1.5em" />
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
            <div v-show="!onlineUrl" id="xgplayer" class="xgplayer"></div>
            <iframe
              v-show="onlineUrl"
              ref="iframeRef"
              :key="onlinekey"
              class="analysis-play-box"
              :src="onlineUrl"
              allowtransparency="true"
              frameborder="0"
              scrolling="no"
              allowfullscreen="true"
            ></iframe>
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
                        <div v-for="(item, index) in epgData" :key="index" class="content">
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
                        <div v-for="(item, index) in channelListData" :key="index" class="content">
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
                        <div>
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
<script setup lang="tsx">
import { ref, onMounted, computed, watch, onDeactivated } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useIpcRenderer } from '@vueuse/electron';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  HomeIcon,
  HeartIcon,
  PhotoIcon,
  ShareIcon,
  DownloadIcon,
  PinIcon,
  PinFilledIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DesktopIcon,
  LoadingIcon,
} from 'tdesign-icons-vue-next';
import _ from 'lodash';
import moment from 'moment';
import QRCode from 'qrcode';
import Player, { Events } from 'xgplayer';
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
import zy from '@/lib/utils/tools';
import { setting, sites, analyze, history, star, channelList } from '@/lib/dexie';
import { usePlayStore } from '@/store';

// 用于窗口管理
const ipcRenderer = useIpcRenderer();

const remote = window.require('@electron/remote');
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
const isDownloadVisible = ref(false);
const downloadSource = ref();
const downloadEpisodes = ref([]);
const downloadTarget = ref([]);

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

const selectIptvTab = ref('epg');
const channelListData = ref();

const recommend = ref([]); // 推荐
const season = ref(); // 选集
const selectPlaySource = ref(); // 选择的播放源
const selectPlayIndex = ref();
const xg = ref(null); // 西瓜播放器
const showEpisode = ref(false); // 是否显示右侧栏
const epgData = ref(); // epg数据
const timer = ref(); // 定时器 用于刷新历史进度
const isBinge = ref(true); // true未收藏 false收藏
const isPinned = ref(true); // true未置顶 false置顶
const qrCodeUrl = ref(); // 二维码图片流
const dataHistory = ref({}); // 历史
const isMacFull = ref(false); // mac最大化
// const iswideBtn = ref(false); // 视频划过显示按钮
const isProfile = ref(false); // 简介

const analyzeUrl = ref(); // 解析接口
const onlineUrl = ref(); // 解析接口+需解析的地址
const iframeRef = ref(); // iframe dom节点
const onlinekey = new Date().getTime(); // 解决iframe不刷新问题

const QR_CODE_OPTIONS = {
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  quality: 0.3,
  margin: 4,
};

const VIP_LIST = ['iqiyi.com', 'mgtv.com', 'qq.com', 'youku.com', 'le.com', 'sohu.com', 'pptv.com', 'bilibili.com'];

const shareUrl = computed(() => {
  const sourceUrl = 'https://hunlongyu.gitee.io/zy-player-web/?url=';
  let params = `${config.value.url}&name=${info.value.name}`;
  if (type.value === 'film') params = `${config.value.url}&name=${info.value.vod_name}  ${selectPlayIndex.value}`;
  return onlineUrl.value || sourceUrl + params;
}); // 分享地址

const renderError = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <DesktopIcon size="1.5em" stroke="#fdfdfd" />
    </div>
  );
};

const renderLoading = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <LoadingIcon size="1.5em" stroke="#fdfdfd" />
    </div>
  );
};

watch(
  () => downloadSource.value,
  (val) => {
    if (val) {
      const list = [];
      for (const item of season.value[downloadSource.value]) {
        const [index, url] = item.split('$');
        if (!url.endsWith('m3u8')) {
          MessagePlugin.info('注意: 当前选择非m3u8播放源');
          break;
        }
        list.push({
          value: url,
          label: index,
          disabled: false,
        });
      }
      downloadEpisodes.value = list;
    }
  },
);

// 更新二维码
watch(
  () => selectPlayIndex.value,
  () => {
    generateQRCode();
  },
);

// 添加画中画事件
watch(
  () => xg.value,
  (val) => {
    if (val?.hasStart) {
      val.on(Events.PIP_CHANGE, (isPip) => {
        console.log('isPip', isPip);
        ipcRenderer.send('toggle-playerPip', isPip);
      });
    }
  },
);

onMounted(() => {
  initPlayer();
  if (type.value === 'film') getAnalysisData();
  minMaxEvent();
});

onDeactivated(() => {
  clearInterval(timer.value);
});

// 获取解析地址
const getAnalysisData = async () => {
  try {
    const currentSite = await sites.find({ key: ext.value.site.key });
    if (currentSite.jiexiUrl) {
      analyzeUrl.value = currentSite.jiexiUrl;
    } else {
      const id = await setting.get('defaultAnalyze');
      const item = await analyze.get(id);
      analyzeUrl.value = item.url;
      console.log(item.url);
    }
  } catch (error) {
    console.error(error);
  }
};

const getHistoryData = async (type = false) => {
  try {
    const { key } = ext.value.site;
    const id = info.value.vod_id;
    const res = await history.find({ siteKey: key, videoId: id });
    const doc = {
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
      if (res.siteSource !== selectPlaySource.value || res.videoIndex !== selectPlayIndex.value) {
        await history.update(res.id, doc);
        dataHistory.value = { ...doc, id: res.id };
      } else {
        dataHistory.value = { ...res };
      }
    } else {
      const id = await history.add(doc);
      dataHistory.value = { ...doc, id };
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
  if (onlineUrl.value) onlineUrl.value = '';
};

// 初始化iptv
const initIptvPlayer = async () => {
  config.value.url = info.value.url;
  await getChannelList();
  if (data.value.ext.epg) await getEpgList(ext.value.epg, info.value.name, moment().format('YYYY-MM-DD'));
  const isLive = await zy.isLiveM3U8(info.value.url);
  config.value.isLive = isLive;
  config.value.presets = isLive ? [LivePreset] : [];
  xg.value = new Player(config.value);
};

// 初始化film
const initFilmPlayer = async (isFirst) => {
  await getDetailInfo();

  if (!isFirst) {
    await getHistoryData();
    getDoubanRecommend();
    getBinge();

    const item = season.value[selectPlaySource.value].find(
      (item) => item.split('$')[0] === dataHistory.value.videoIndex,
    );
    config.value.url = item ? item.split('$')[1] : season.value[selectPlaySource.value][0].split('$')[1];
    if (set.value.skipStartEnd && dataHistory.value.watchTime < set.value.skipTimeInStart) {
      config.value.startTime = set.value.skipTimeInStart;
    } else {
      config.value.startTime = dataHistory.value.watchTime || 0;
    }
  } else {
    config.value.startTime = dataHistory.value.watchTime || 0;
    if (set.value.skipStartEnd && dataHistory.value.watchTime < set.value.skipTimeInStart) {
      config.value.startTime = set.value.skipTimeInStart;
    }
  }

  if (!config.value.url.endsWith('m3u8')) {
    const { hostname } = new URL(config.value.url);
    if (VIP_LIST.some((item) => hostname.includes(item))) {
      onlineUrl.value = analyzeUrl.value + config.value.url;
    } else {
      // 尝试提取ck/dp播放器中的m3u8
      try {
        config.value.url = await zy.parserFilmUrl(config.value.url);
        console.info(config.value.url);
      } catch (err) {
        onlineUrl.value = analyzeUrl.value + config.value.url;
        console.error(err);
      }
    }
  }
  xg.value = new Player(config.value);
  await timerUpdatePlayProcess();
};

// 初始化播放器
const initPlayer = async (isFirst = false) => {
  if (set.value.softSolution) config.value.mediaType = 'live-video';

  destroyPlayer();

  if (type.value === 'iptv') {
    await initIptvPlayer();
  } else if (type.value === 'film') {
    await initFilmPlayer(isFirst);
  }

  document.documentElement.setAttribute('theme-mode', 'dark');
  document.title = type.value === 'iptv' ? info.value.name : `${info.value.vod_name} ${selectPlayIndex.value}`;
};

// 在追
const bingeEvnet = async () => {
  try {
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
        const res = await star.add(doc);
        console.log(res);
      }
    } else {
      await star.remove(db.id);
    }
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
  const playSource = playFrom.split('$').filter((e) => e);
  const [source] = playSource;
  if (!selectPlaySource.value) selectPlaySource.value = source;

  // 剧集
  const playUrl = videoList.vod_play_url;
  const playUrlDiffPlaySource = playUrl.split('$$$'); // 分离不同播放源
  const playEpisodes = playUrlDiffPlaySource.map((item) =>
    item
      .replace(/\$+/g, '$')
      .split('#')
      .filter((e) => {
        if (e && (e.startsWith('http') || (e.split('$')[1] && e.split('$')[1].startsWith('http')))) return true;
        if (!e.includes('$')) return true;
        return false;
      })
      .map((e) => {
        if (!e.includes('$')) e = `正片$${e}`;
        return e;
      }),
  );
  if (!selectPlayIndex.value) selectPlayIndex.value = playEpisodes[0][0].split('$')[0];

  // 合并播放源和剧集
  const fullList = Object.fromEntries(playSource.map((key, i) => [key, playEpisodes[i]]));

  videoList.fullList = fullList;
  info.value = videoList;
  season.value = fullList;
  // console.log(info.value, season.value);
};

// 切换选集
const changeEvent = async (e) => {
  if (timer.value) clearInterval(timer.value);
  const [index, url] = e.split('$');
  console.log(index, url);
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

  history.update(dataHistory.value.id, doc);

  console.log(doc);
  for (const key in doc) {
    dataHistory.value[key] = doc[key];
  }
  await initPlayer(true);

  await getHistoryData(true);
};

// 切换iptv
const changeIptvEvent = async (e) => {
  store.updateConfig({
    type: 'iptv',
    data: {
      info: e,
      ext: { epg: data.value.ext.epg },
    },
  });
  info.value = e;
  await initPlayer();
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

  try {
    const resName = await zy.doubanRecommendations(id, name, year);

    for (const element of resName) {
      const res = await zy.searchFirstDetail(key, element);

      if (res && recommend.value.length < 10) {
        recommend.value.push(res);
      }
    }
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
  if (onlineUrl.value) return;
  timer.value = setInterval(() => {
    const doc = {
      date: moment().format('YYYY-MM-DD'),
      watchTime: xg.value.currentTime,
      duration: xg.value.duration,
    };
    history.update(dataHistory.value.id, doc);

    console.log(timer.value);
  }, 10000);
};

// 获取是否追剧
const getBinge = async () => {
  const { key } = ext.value.site;
  const { vod_id } = info.value;
  const res = await star.find({ siteKey: key, videoId: vod_id });
  isBinge.value = !res;
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

// ipv6规则校验
const isIpv6 = (url: string) => {
  // 去除协议
  const urlWithoutProtocol = url.replace(/^(https?:)?\/\//i, '');
  // 去除路径
  const hostname = urlWithoutProtocol.split('/')[0];
  // 直接提取[]
  const reg = /^\[(.+)\](:\d+)?\/?/;
  const match = hostname.match(reg);
  if (!match) {
    return false;
  }
  const ipv6Address = match[1];

  // ipv6规则
  const ipv6Regex =
    /^(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|(?=(?:[0-9A-Fa-f]{0,4}:){2,6}(?:\d{1,3}\.){3}\d{1,3}$)(([0-9A-Fa-f]{0,4}:){1,5}|:)((:[0-9A-Fa-f]{0,4}){1,5}:|:)|::(?:[0-9A-Fa-f]{0,4}:){0,4}(?:(?<=::)|(?:(?<=:)0{0,4})))|::(?:[0-9A-Fa-f]{0,4}:){0,5}(?:(?<=::)|(?:(?<=:)0{0,4}[0-9A-Fa-f]{1,4}))|(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?=(?:[0-9A-Fa-f]{0,4}:){0,7}[0-9A-Fa-f]{0,4}$)([0-9A-Fa-f]{0,4}:){0,6}[0-9A-Fa-f]{0,4}))(?:%[0-9A-Za-z]{1,})?(?:::\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})?$/;
  return ipv6Regex.test(ipv6Address);
};

// 获取直播列表
const getChannelList = async () => {
  const res = await setting.get('iptvSkipIpv6');
  let channelSourceData = await channelList.all();
  if (res) {
    channelSourceData = channelSourceData.filter((item) => !isIpv6(item.url));
  }
  channelListData.value = channelSourceData;
};

// 获取电子节目单
const getEpgList = async (url, name, date) => {
  try {
    const res = await zy.iptvEpg(url, name, date);
    epgData.value = res;
  } catch (error) {
    console.log(error);
  }
};

// 生成二维码
const generateQRCode = async () => {
  try {
    const url = await new Promise((resolve, reject) => {
      QRCode.toDataURL(shareUrl.value, QR_CODE_OPTIONS, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
    qrCodeUrl.value = url;
  } catch (err) {
    console.log(err);
  }
};

// 点击非浮层元素触发关闭分享
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

const copyToClipboard = (content, successMessage, errorMessage) => {
  copy(content);
  if (isSupported) {
    MessagePlugin.info(successMessage);
  } else {
    MessagePlugin.warning(errorMessage);
  }
};

// 复制下载链接
const copyDownloadUrl = () => {
  if (downloadTarget.value.length !== 0) {
    const downloadUrl = _.join(downloadTarget.value, '\n');
    console.log(downloadUrl);
    const successMessage = '复制成功，快到下载器里下载吧!';
    const errorMessage = '复制失败，当前环境不支持一键复制!';
    copyToClipboard(downloadUrl, successMessage, errorMessage);
    isDownloadVisible.value = false;
  } else {
    MessagePlugin.warning('请先选择需要下载的内容!');
  }
};

// 复制分享地址
const copyShareUrl = () => {
  const successMessage = '复制成功，快分享给好友吧!';
  const errorMessage = '当前环境不支持一键复制，请手动复制链接!';
  copyToClipboard(shareUrl.value, successMessage, errorMessage);

  isShareVisible.value = false;
};

// electron窗口置顶
const toggleAlwaysOnTop = () => {
  if (win.isAlwaysOnTop()) {
    win.setAlwaysOnTop(false);
    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'no');
    isPinned.value = true;
  } else {
    win.setAlwaysOnTop(true);
    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'yes');
    isPinned.value = false;
  }
};

// 最小化暂停播放
const minMaxEvent = () => {
  win.on('minimize', () => {
    if (xg.value && xg.value.hasStart && set.value.pauseWhenMinimize) {
      xg.value.pause();
    }
  });
  win.on('restore', () => {
    if (xg.value && xg.value.hasStart) {
      xg.value.play();
    }
  });
};

// 打开主窗口
const openMainWinEvent = () => {
  ipcRenderer.send('showMainWin');
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
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
          .analysis-play-box {
            width: 100%;
            height: 100%;
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
  .contents-wrap,
  .epg-warp {
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
}

.scroll {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.channel-items,
.epg-items {
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
    color: var(--td-gray-color-6);
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
    background-color: var(--td-gray-color-11);
    border-color: transparent;

    &.t-is-disabled {
      border-color: transparent;
      background-color: var(--td-gray-color-12);
      color: var(--td-font-white-4);
    }
  }
}
</style>
