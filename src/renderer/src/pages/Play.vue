<template>
  <div class="container">
    <div class="container-header" :class="!isVisible.macMaximize ? 'drag' : 'no-drag'">
      <div
        class="left no-drag"
        :style="{ 'padding-left': platform === 'darwin' && !isVisible.macMaximize ? '68px' : '0' }"
      >
        <div class="open-main-win" @click="openMainWinEvent">
          <home-icon />
          <span class="tip-gotomain">{{ $t('pages.player.header.backMain') }}</span>
        </div>
      </div>
      <div class="spacer">
        <span v-if="type === 'film'">{{ `${info['vod_name']} ${formatIndex(active.filmIndex).index}` }}</span>
        <span v-else>{{ info['name'] }}</span>
      </div>
      <div class="right no-drag">
        <div class="system-functions">
          <div v-if="type === 'film'" class="setting system-function">
            <t-button theme="default" shape="square" variant="text" @click="isSettingVisible = true">
              <setting-icon />
            </t-button>
            <t-dialog
              v-model:visible="isSettingVisible"
              :header="$t('pages.player.setting.title')"
              placement="center"
              width="508"
              :footer="false"
            >
              <div class="setting-warp">
                <div class="setting-item-warp">
                  <span>{{ $t('pages.player.setting.autoSkip') }}</span>
                  <t-switch v-model="set.skipStartEnd" />
                </div>
                <div v-if="set.skipStartEnd" class="setting-item-warp">
                  <div class="skip-time-in-start">
                    <t-input-number
                      v-model="skipConfig.skipTimeInStart"
                      theme="normal"
                      align="right"
                      @change="skipTimeInEndChange"
                    >
                      <template #label>{{ $t('pages.player.setting.skipStart') }}</template>
                      <template #suffix>{{ $t('pages.player.setting.skipSeconds') }}</template>
                    </t-input-number>
                  </div>
                  <div class="skip-time-in-end">
                    <t-input-number
                      v-model="skipConfig.skipTimeInEnd"
                      theme="normal"
                      align="right"
                      @change="skipTimeInEndChange"
                    >
                      <template #label>{{ $t('pages.player.setting.skipEnd') }}</template>
                      <template #suffix>{{ $t('pages.player.setting.skipSeconds') }}</template>
                    </t-input-number>
                  </div>
                </div>
                <div class="setting-item-warp">
                  <span>{{ $t('pages.player.setting.autoNext') }}</span>
                  <t-switch v-model="set.preloadNext" />
                </div>
                <div class="setting-item-warp">
                  <span>{{ $t('pages.player.setting.skipAd') }}</span>
                  <t-switch v-model="set.skipAd" />
                </div>
                <div class="tip-warp">
                  <span>{{ $t('pages.player.setting.tip') }}</span>
                </div>
              </div>
            </t-dialog>
          </div>
          <div class="staple system-function">
            <t-button theme="default" shape="square" variant="text" @click="toggleAlwaysOnTop">
              <pin-filled-icon v-if="isVisible.pin" />
              <pin-icon v-else />
            </t-button>
          </div>
        </div>
        <system-control class="mg-left window" />
      </div>
    </div>
    <div class="container-main">
      <div class="player">
        <div class="container-player" :class="['subject', isVisible.aside ? 'subject-ext' : '']">
          <div class="player-panel">
            <div class="player-media">
              <div id="mse" class="player"></div>
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
            <p class="title nowrap">{{ info['name'] }}</p>
          </div>
          <div class="iptv-main content-main">
            <t-tabs v-model="active.iptvNav" class="iptv-tabs tabs">
              <t-tab-panel value="epg" :label="$t('pages.player.iptv.epg')">
                <div class="contents-wrap scroll-y epg-wrap">
                  <div v-for="(item, index) in iptvConfig.epgData" :key="index" class="content">
                    <div class="content-item content-item-between">
                      <div class="time-warp">{{ item['start'] }}</div>
                      <div class="title-wrap nowrap">{{ item['title'] }}</div>
                      <div class="status-wrap">
                        <span v-if="filterEpgStatus(item['start'], item['end']) === 'played'" class="played">
                          {{ $t(`pages.player.status.${filterEpgStatus(item['start'], item['end'])}`) }}
                        </span>
                        <span v-if="filterEpgStatus(item['start'], item['end']) === 'playing'" class="playing">
                          {{ $t(`pages.player.status.${filterEpgStatus(item['start'], item['end'])}`) }}
                        </span>
                        <span v-if="filterEpgStatus(item['start'], item['end']) === 'unplay'" class="unplay">
                          {{ $t(`pages.player.status.${filterEpgStatus(item['start'], item['end'])}`) }}
                        </span>
                      </div>
                    </div>
                    <t-divider dashed style="margin: 5px 0" />
                  </div>
                </div>
              </t-tab-panel>
              <t-tab-panel value="channel" :label="$t('pages.player.iptv.channel')">
                <div class="contents-wrap scroll-y channel-wrap">
                  <div v-for="item in iptvConfig.channelData" :key="item['id']" class="content">
                    <div class="content-item content-item-start" @click="changeChannelEvent(item)">
                      <div class="logo-wrap">
                        <t-image
                          class="logo"
                          fit="contain"
                          :src="generateLogo(item)"
                          :style="{ width: '64px', height: '32px', maxHeight: '32px', background: 'none' }"
                          :lazy="true"
                          :loading="renderLoading"
                          :error="renderError"
                        >
                        </t-image>
                      </div>
                      <div class="title-wrap nowrap title-warp-channel">{{ item['name'] }}</div>
                      <div class="status-wrap">
                        <span :class="item['id'] === info['id'] ? 'playing' : 'unplay'">
                          {{
                            item['id'] === info['id']
                              ? $t('pages.player.status.playing')
                              : $t('pages.player.status.unplay')
                          }}
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
                <div class="title-text nowrap">{{ info['vod_name'] }}</div>
                <div class="title-desc" @click="active.profile = true">
                  <span class="title-unfold">{{ $t('pages.player.film.desc') }}</span>
                  <chevron-right-s-icon />
                </div>
              </div>
              <div class="hot-block nowrap">
                <span class="rate">
                  <star-icon />
                  {{ info['vod_score'] ? info['vod_score'] : '0.0' }}
                </span>
                <t-divider layout="vertical" v-show="info['type_name']" />
                <span v-show="info['type_name']" class="nowrap">{{ info['type_name'] }}</span>
                <t-divider layout="vertical" v-show="info['vod_area']" />
                <span v-show="info['vod_area']" class="nowrap">{{ info['vod_area'] }}</span>
                <t-divider layout="vertical" v-show="info['vod_year']" />
                <span v-show="info['vod_year']" class="nowrap">{{ info['vod_year'] }}</span>
              </div>
              <div class="function">
                <div class="func-item like" @click="putBinge(false)">
                  <span>
                    <heart-icon class="icon" v-if="isVisible.binge" />
                    <heart-filled-icon class="icon" v-else />
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
                      <div style="display: flex; flex-direction: row; align-items: center">
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
                <div class="left">
                  <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
                  <div class="box-anthology-line">
                    <t-dropdown placement="bottom" :max-height="250">
                      <t-button size="small" theme="default" variant="text" auto-width>
                        <span class="title">{{ $t('pages.player.film.line') }}</span>
                        <template #suffix>
                          <chevron-down-icon size="16" />
                        </template>
                      </t-button>
                      <t-dropdown-menu>
                        <t-dropdown-item
                          v-for="(_, key, index) in season"
                          :key="index"
                          :value="key"
                          @click="(options) => switchLineEvent(options.value as string)"
                        >
                          <span :class="[key as any === active.flimSource ? 'active' : '']">{{ key }}</span>
                        </t-dropdown-item>
                      </t-dropdown-menu>
                    </t-dropdown>
                  </div>
                  <div class="box-anthology-analyze" v-show="isVisible.official">
                    <t-dropdown placement="bottom" :max-height="250">
                      <t-button size="small" theme="default" variant="text" auto-width>
                        <span class="title">{{ $t('pages.player.film.analyze') }}</span>
                        <template #suffix>
                          <chevron-down-icon size="16" />
                        </template>
                      </t-button>
                      <t-dropdown-menu>
                        <t-dropdown-item
                          v-for="item in dataAnalyze.active"
                          :key="item.id"
                          :value="item.id"
                          @click="(options) => switchAnalyzeEvent(options.value as string)"
                        >
                          <span :class="[item.id === active.analyzeId ? 'active' : '']">{{ item.name }}</span>
                        </t-dropdown-item>
                      </t-dropdown-menu>
                    </t-dropdown>
                  </div>
                </div>
                <div class="right">
                  <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
                    <order-descending-icon v-if="isVisible.reverseOrder" size="1.2em" />
                    <order-ascending-icon v-else size="1.2em" />
                  </div>
                </div>
              </div>
              <div class="listbox">
                <div class="tag-container">
                  <div
                    v-for="(item, index) in season?.[active.flimSource]"
                    :key="item"
                    :class="['mainVideo-num', item === active.filmIndex ? 'mainVideo-selected' : '']"
                    @click="changeEvent(item)"
                  >
                    <t-tooltip :content="formatName(item)">
                      <div class="mainVideo_inner">
                        {{
                          formatReverseOrder(
                            isVisible.reverseOrder ? 'positive' : 'negative',
                            index,
                            season?.[active.flimSource]?.length,
                          )
                        }}
                        <div class="playing"></div>
                      </div>
                    </t-tooltip>
                  </div>
                </div>
                <!-- <t-tabs v-model="active.flimSource" class="film-tabs">
                  <t-tab-panel v-for="(value, key, index) in season" :key="index" :value="key" :label="key">
                    <div class="tag-container">
                      <div v-for="(item, index) in season?.[active.flimSource]" :key="item"
                        :class='["mainVideo-num", item === active.filmIndex ? "mainVideo-selected" : ""]'
                        @click="changeEvent(item)">
                        {{ index }} {{ item }}
                        <t-tooltip :content="formatName(item)">
                          <div class="mainVideo_inner">
                            {{ formatReverseOrder(isVisible.reverseOrder ? 'positive' : 'negative', index, value.length)
                            }}
                            <div class="playing"></div>
                          </div>
                        </t-tooltip>
                      </div>
                    </div>
                  </t-tab-panel>
                </t-tabs> -->
              </div>
              <div class="recommend" v-show="recommend.length != 0">
                <div class="component-title">{{ $t('pages.player.film.recommend') }}</div>
                <div class="component-list">
                  <div v-for="content in recommend" :key="content['id']" class="videoItem-card">
                    <div class="videoItem-left" @click="recommendEvent(content)">
                      <t-image
                        class="card-main-item"
                        :src="content['vod_pic']"
                        :style="{ width: '126px', height: '70px', 'border-radius': '5px' }"
                        :lazy="true"
                        fit="cover"
                      >
                      </t-image>
                    </div>
                    <div class="videoItem-right">
                      <div class="title nowrap">{{ content['vod_name'] }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="profile">
            <div class="side-head">
              <div class="title">{{ $t('pages.player.film.desc') }}</div>
              <close-icon size="1.3em" class="icon" @click="active.profile = false" />
            </div>
            <t-divider dashed style="margin: 5px 0" />
            <div class="side-body scroll-y">
              <div class="card">
                <div class="cover">
                  <t-image
                    class="card-main-item"
                    :src="info['vod_pic']"
                    :style="{ width: '100%', height: '100%', 'border-radius': '5px' }"
                    :lazy="true"
                    fit="cover"
                  />
                </div>
                <div class="content">
                  <div class="name">{{ info['vod_name'] }}</div>
                  <div class="type">{{ info['type_name'] }}</div>
                  <div class="num">{{ info['vod_remarks'] }}</div>
                </div>
              </div>
              <div class="text">
                <span v-html="formatContent(info['vod_content'])"></span>
              </div>
              <div class="case">
                <div class="title">{{ $t('pages.player.film.actors') }}</div>
                <div class="content">
                  <div v-show="info['vod_director']">
                    <span class="name">{{ $t('pages.player.film.director') }}: </span>
                    <span class="role">{{ info['vod_director'] }}</span>
                  </div>
                  <div v-show="info['vod_actor']">
                    <span class="name">{{ $t('pages.player.film.actor') }}: </span>
                    <span class="role">{{ info['vod_actor'] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="type == 'drive'" class="drive content">
          <div class="title-warp">
            <p class="title nowrap">{{ info['name'] }}</p>
          </div>
          <div class="drive-main content-main">
            <t-tabs v-model="active.driveNav" class="drive-tabs tabs">
              <t-tab-panel value="season" :label="$t('pages.player.drive.anthology')">
                <div class="contents-wrap scroll-y drive-wrap">
                  <div v-for="item in driveDataList" :key="item['id']" class="content">
                    <template v-if="item['type'] === 10">
                      <div class="content-item content-item-start" @click="changeDriveEvent(item)">
                        <div class="logo-wrap">
                          <t-image
                            class="logo"
                            fit="cover"
                            :src="item['thumb']"
                            :style="{ width: '64px', height: '28px', background: 'none', borderRadius: '6px' }"
                            :lazy="true"
                            :loading="renderLoading"
                            :error="renderError"
                          />
                        </div>
                        <div class="title-wrap nowrap">{{ item['name'] }}</div>
                        <div class="status-wrap">
                          <span :class="info['name'] === item['name'] ? 'playing' : 'unplay'">
                            {{
                              item['name'] === info['name']
                                ? $t('pages.player.status.playing')
                                : $t('pages.player.status.unplay')
                            }}
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
import 'v3-infinite-loading/lib/style.css';
import '@/style/player/index.less';

import _ from 'lodash';
import moment from 'moment';
import {
  ChevronDownIcon,
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
  Share1Icon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { computed, onMounted, ref, reactive, shallowRef } from 'vue';

import { fetchChannelList } from '@/api/iptv';
import { checkUrlIpv6, getLocalStorage } from '@/utils/tool';
import {
  playerBarrage,
  playerCreate,
  playerDestroy,
  playerNext,
  playerSeek,
  playerPause,
  playerToggle,
  playerTimeUpdate,
  offPlayerTimeUpdate,
  offPlayerBarrage,
} from '@/utils/common/player';
import {
  fetchBingeData,
  putBingeData,
  fetchHistoryData,
  putHistoryData,
  fetchAnalyzeData,
  fetchBarrageData,
  playHelper,
  reverseOrderHelper,
  fetchDoubanRecommendHelper,
  fetchRecommendSearchHelper,
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder,
} from '@/utils/common/film';
import { __jsEvalReturn } from '@/utils/alist_open';
import { fetchChannelEpg } from '@/utils/channel';
import { usePlayStore } from '@/store';

import SystemControl from '@/layouts/components/SystemControl.vue';
import DialogDownloadView from './play/componets/DialogDownload.vue';
import SharePopup from '../components/share-popup/index.vue';
import { t } from '@/locales';
import logoIcon from '@/assets/icon.png';

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
const snifferAnalyze = computed(() => {
  const analyzeSource = active.analyzeId
    ? _.find(dataAnalyze.value.active, { id: active.analyzeId })
    : dataAnalyze.value.default;

  const data = {
    flag: dataAnalyze.value.flag,
    name: analyzeSource.name,
    url: analyzeSource.url,
    type: analyzeSource.type,
  };
  return data;
});
const info = ref(data.value.info) as any;
const ext = ref(data.value.ext) as any;

const downloadDialogData = ref({ season: '', current: '' });

const player = shallowRef(null); // 重要, proxy对象art播放器报错

const tmp = reactive({
  skipTime: 0,
  url: '',
  sourceUrl: '',
  preloadNext: '',
  preloadLoading: false,
  preloadBarrage: [],
  preloadSourceUrl: '',
  playerHeaders: {},
}) as any;

const active = reactive({
  iptvNav: 'epg',
  driveNav: 'season',
  flimSource: '',
  filmIndex: '',
  filmCurrent: '',
  profile: false,
  analyzeId: '',
});
const recommend = ref([]) as any; // 推荐
const season = ref(); // 选集
const isSettingVisible = ref(false);

const dataHistory = ref({}) as any; // 历史
const dataBinge = ref({}) as any;

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

const VIDEO_PROCESS_DOC = reactive({
  playEnd: false,
  watchTime: 0,
  duration: 0,
});

const dataAnalyze = ref({
  default: { url: '' },
  flag: [],
  active: [],
}) as any;

const isVisible = reactive({
  share: false,
  pin: false,
  macMaximize: false,
  download: false,
  binge: false,
  aside: false,
  reverseOrder: true,
  official: false,
});

const iptvConfig = ref({
  epg: '',
  skipIpv6: false,
  channelData: [],
  epgData: [],
});

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

onMounted(() => {
  initPlayer();
  minMaxEvent();
});

// 加载播放器
const createPlayer = async (url: string, videoType: string = '') => {
  tmp.url = url;
  const { playerMode } = set.value;

  const containers = {
    xgplayer: 'mse',
    artplayer: '#mse',
    dplayer: document.getElementById('mse'),
    nplayer: '#mse',
  };
  player.value = (await playerCreate(url, type.value, containers[playerMode.type], playerMode.type, videoType)) as any;
  if (tmp.skipTime) playerSeek(player.value, playerMode.type, tmp.skipTime);

  if (type.value === 'film') {
    await timerUpdatePlayProcess(); // 更新播放进度

    // 弹幕
    const options = set.value.barrage;
    const { flimSource, filmIndex } = active;
    const danmuList = await fetchBarrage(tmp.sourceUrl, options, { flimSource, filmIndex });
    if (danmuList.length > 0) {
      if (playerMode.type === 'dplayer') {
        playerBarrage(player.value, playerMode.type, tmp.sourceUrl, options, tmp.sourceUrl);
      } else {
        playerBarrage(player.value, playerMode.type, danmuList, options, tmp.sourceUrl);
      }
    }
  }

  setSystemMediaInfo(); // 设置系统媒体信息

  // setTimeout(() => {
  // console.log('setTimeout')
  // playerPause(player.value, playerMode.type);
  // offPlayerTimeUpdate(player.value, playerMode.type);
  // offPlayerBarrage(player.value, playerMode.type);
  // playerNext(player.value, playerMode.type, {url: 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8',type:'m3u8'});
  // }, 6000);  // 测试用例
};

// 摧毁播放器
const destroyPlayer = () => {
  if (player.value) {
    const { playerMode } = set.value;

    playerDestroy(player.value, playerMode.type);
    player.value = null;
  }
};

// 设置系统媒体信息
const setSystemMediaInfo = () => {
  if ('mediaSession' in navigator) {
    let doc = {
      title: '' as string,
      artist: '' as string,
      artwork: [] as any[],
    };

    if (type.value === 'iptv') {
      doc = {
        title: info.value['name'],
        artist: '直播',
        artwork: [{ src: logoIcon, sizes: '128x128', type: 'image/png' }],
      };
    } else if (type.value === 'drive') {
      doc = {
        title: info.value['name'],
        artist: '网盘',
        artwork: [{ src: logoIcon, sizes: '128x128', type: 'image/png' }],
      };
    } else {
      doc = {
        title: info.value['vod_name'],
        artist: formatIndex(active.filmIndex).index,
        artwork: [{ src: info.value['vod_pic'], sizes: '128x128', type: 'image/png' }],
      };
    }

    navigator.mediaSession.metadata = new MediaMetadata(doc);
  }

  let title;
  if (type.value === 'film') title = `${info.value['vod_name']} ${formatIndex(active.filmIndex).index}`;
  else title = info.value['name'];
  document.title = title;
};

// 获取解析
const fetchAnalyze = async (): Promise<void> => {
  const response = await fetchAnalyzeData();
  dataAnalyze.value = response;

  if (response.default?.id) active.analyzeId = response.default?.id;
};

const switchLineEvent = async (id: string) => {
  active.flimSource = id;
};

// 切换解析接口
const switchAnalyzeEvent = async (id: string) => {
  active.analyzeId = id;
  if (active.filmIndex) {
    const { site } = ext.value;
    const { snifferMode, skipAd } = set.value;

    let { url } = formatIndex(active.filmIndex);
    url = decodeURIComponent(url);
    tmp.url = tmp.sourceUrl = url;

    const analyze = snifferAnalyze.value;
    const response = await filmPlayAndHandleResponse(snifferMode, url, site, analyze, active.flimSource, skipAd);
    if (response?.url) {
      if (player.value) {
        const { playerMode } = set.value;
        playerNext(player.value, playerMode.type, { url: response!.url, mediaType: response!.mediaType! || '' });
      } else {
        createPlayer(response!.url, response!.mediaType!);
      }
    }
  }
};

// 获取历史
const fetchHistory = async (): Promise<void> => {
  const response = await fetchHistoryData(ext.value.site.id, info.value.vod_id);
  if (response.siteSource) active.flimSource = response.siteSource;
  if (response.videoIndex) active.filmIndex = response.videoIndex;
  if (!response.siteSource) response.siteSource = active.flimSource;
  if (!response.videoIndex) response.videoIndex = active.filmIndex;
  dataHistory.value = response;
  const { skipTimeInStart, skipTimeInEnd } = response;
  skipConfig.value = { skipTimeInStart, skipTimeInEnd };
};

// 更新历史
const putHistory = async (): Promise<void> => {
  const doc = {
    date: moment().unix(),
    type: 'film',
    relateId: ext.value.site.id,
    siteSource: active.flimSource,
    playEnd: VIDEO_PROCESS_DOC.playEnd,
    videoId: info.value['vod_id'],
    videoImage: info.value['vod_pic'],
    videoName: info.value['vod_name'],
    videoIndex: active.filmIndex,
    watchTime: VIDEO_PROCESS_DOC.watchTime,
    duration: VIDEO_PROCESS_DOC.duration,
    skipTimeInStart: skipConfig.value.skipTimeInStart,
    skipTimeInEnd: skipConfig.value.skipTimeInEnd,
  };

  const response = await putHistoryData(dataHistory.value?.id, doc);
  dataHistory.value = response;
};

const filmPlayAndHandleResponse = async (snifferMode, url, site, analyze, flimSource, skipAd) => {
  MessagePlugin.info(t('pages.player.message.play'));
  const response = await playHelper(snifferMode, url, site, analyze, flimSource, skipAd);
  isVisible.official = response!.isOfficial;

  if (response?.url) {
    if (isVisible.official) {
      if (analyze?.name) MessagePlugin.info(t('pages.player.message.official', [analyze.name]));
      else MessagePlugin.warning(t('pages.player.message.noDefaultAnalyze'));
    }
  } else MessagePlugin.error(t('pages.player.message.sniiferError'));

  return response;
};

// 初始化film
const initFilmPlayer = async (isFirst) => {
  const { site } = ext.value;
  tmp.skipTime = 0;
  await getDetailInfo();

  if (!isFirst) {
    await fetchHistory();
    if (!_.has(dataHistory.value, 'id')) await putHistory();
    await fetchAnalyze();

    fetchRecommend();
    fetchBinge();

    // 跳过时间
    if (set.value.skipStartEnd && dataHistory.value.watchTime < skipConfig.value.skipTimeInStart) {
      tmp.skipTime = skipConfig.value.skipTimeInStart;
    } else {
      tmp.skipTime = dataHistory.value['watchTime'] || 0;
    }
  } else {
    tmp.skipTime = dataHistory.value.watchTime || 0;
    if (set.value.skipStartEnd && dataHistory.value.watchTime < skipConfig.value.skipTimeInStart) {
      tmp.skipTime = skipConfig.value.skipTimeInStart;
    }
  }

  // 解析直链
  const { snifferMode, skipAd } = set.value;

  let { url } = formatIndex(active.filmIndex);
  url = decodeURIComponent(url);

  tmp.url = tmp.sourceUrl = url;

  const analyze = snifferAnalyze.value;
  const response = await filmPlayAndHandleResponse(snifferMode, url, site, analyze, active.flimSource, skipAd);
  if (response?.url) {
    createPlayer(response!.url, response!.mediaType! || '');
  }
};

// 初始化播放器
const initPlayer = async (isFirst = false) => {
  switch (type.value) {
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
  }
};

// 获取播放源及剧集
const getDetailInfo = async (): Promise<void> => {
  const formattedSeason = await formatSeason(info.value);

  active.flimSource = active.flimSource || Object.keys(formattedSeason)[0];
  active.filmIndex = active.filmIndex || formattedSeason[active.flimSource][0];

  info.value.fullList = formattedSeason;
  season.value = formattedSeason;
  if (isVisible.reverseOrder) season.value = formattedSeason;
  else season.value = reverseOrderHelper('negative', formattedSeason);
};

// 切换选集
const changeEvent = async (item) => {
  active.filmIndex = item;

  // 当前源dataHistory.value.siteSource 选择源active.flimSource；当前集dataHistory.value.videoIndex 选择源index
  // 1. 同源 不同集 变   return true
  // 2. 同源 同集 不变   return true
  // 3. 不同源 不同集 变 return true
  // 4. 不同源 同集 不变 return true
  // 待优化 不同源的index不同，要重新索引  但是 综艺不对应
  if (dataHistory.value['siteSource'] === active.flimSource) {
    // 同源
    if (formatIndex(dataHistory.value['videoIndex']).index !== formatIndex(active.filmIndex).index) {
      VIDEO_PROCESS_DOC.watchTime = 0;
      VIDEO_PROCESS_DOC.playEnd = false;
    }
  } else if (formatIndex(dataHistory.value['videoIndex']).index !== formatIndex(active.filmIndex).index) {
    // 不同源
    VIDEO_PROCESS_DOC.watchTime = 0;
    VIDEO_PROCESS_DOC.playEnd = false;
  }

  await putHistory();

  if (tmp.preloadNext?.url && set.value.preloadNext) {
    const { playerMode } = set.value;

    await offPlayerTimeUpdate(player.value, playerMode.type);
    await playerNext(player.value, playerMode.type, tmp.preloadNext);
    if (tmp.preloadBarrage.length > 0) {
      await offPlayerBarrage(player.value, playerMode.type);
      const options = set.value.barrage;
      if (playerMode.type === 'dplayer') {
        playerBarrage(player.value, playerMode.type, tmp.preloadSourceUrl, options, tmp.preloadSourceUrl);
      } else {
        playerBarrage(player.value, playerMode.type, tmp.preloadBarrage, options, tmp.preloadSourceUrl);
      }
      tmp.preloadBarrage = [];
    }
    if (set.value.skipStartEnd) {
      await playerSeek(player.value, playerMode.type, skipConfig.value.skipTimeInStart);
    }
    setSystemMediaInfo(); // 更新系统媒体信息
    setTimeout(async () => {
      await timerUpdatePlayProcess();
    }, 1500);
  } else {
    await destroyPlayer();
    await initFilmPlayer(true);
  }

  tmp.preloadLoading = false;
  tmp.preloadNext = {};
  tmp.sourceUrl = tmp.preloadSourceUrl;
  tmp.preloadSourceUrl = '';
};

// 提前获取下一集链接
const preloadNext = async (item: string) => {
  const url = formatIndex(item).url;

  tmp.preloadSourceUrl = url;

  const { snifferMode, skipAd } = set.value;
  const { site } = ext.value;
  const { flimSource } = active;
  const analyze = snifferAnalyze.value;
  const response = await playHelper(snifferMode, url, site, analyze, flimSource, skipAd);
  tmp.preloadNext = { ...response };

  if (response?.url) {
    // 预加载弹幕
    const options = set.value.barrage;
    tmp.preloadBarrage = await fetchBarrage(tmp.sourceUrl, options, { flimSource, filmIndex: item });
  }
};

// 获取豆瓣影片推荐
const fetchRecommend = async () => {
  const response = await fetchDoubanRecommendHelper(info.value);
  recommend.value = response;
};

// 定时更新播放进度
const timerUpdatePlayProcess = () => {
  const { playerMode } = set.value;
  const { siteSource } = dataHistory.value;
  let index = 0;

  const isLast = () => {
    if (isVisible.reverseOrder) {
      return season.value[siteSource].length === index + 1;
    } else {
      return index === 0;
    }
  };

  const autoPlayNext = async () => {
    VIDEO_PROCESS_DOC.playEnd = true;
    VIDEO_PROCESS_DOC.duration = 0;

    if (isLast()) {
      // 最后一集
      putHistory();
      return;
    }

    console.log('[player][progress] autoPlayNext');
    await changeEvent(
      isVisible.reverseOrder ? season.value[siteSource][index + 1] : season.value[siteSource][index - 1],
    );
    MessagePlugin.info(t('pages.player.message.next'));
  };

  const onTimeUpdate = async (currentTime: number, duration: number) => {
    VIDEO_PROCESS_DOC.watchTime = currentTime;
    VIDEO_PROCESS_DOC.duration = duration;

    const watchTime = set.value.skipStartEnd ? currentTime + skipConfig.value.skipTimeInEnd : currentTime;
    if (watchTime >= duration && duration !== 0) autoPlayNext();
    else putHistory();

    // 预加载下一步链接 提前30秒预加载
    if (watchTime + 30 >= duration && duration !== 0) {
      if (!isLast() && !tmp.preloadLoading && set.value.preloadNext) {
        try {
          tmp.preloadLoading = true;
          await preloadNext(
            isVisible.reverseOrder ? season.value[siteSource][index + 1] : season.value[siteSource][index - 1],
          );
        } catch (err) {}
      }
    }

    if (getLocalStorage('player:process'))
      console.log(
        `[player][timeUpdate] - current:${currentTime}; watch:${watchTime}; duration:${duration}; percentage:${Math.trunc((currentTime / duration) * 100)}%`,
      );
  };

  playerTimeUpdate(player.value, playerMode.type, ({ currentTime, duration }) => {
    index = season.value[siteSource].indexOf(active.filmIndex);
    onTimeUpdate(currentTime, duration);
  });
};

// 获取弹幕
const fetchBarrage = async (url: string, options: any, active: any) => {
  const response = await fetchBarrageData(url, options, active);
  return response || [];
};

// 获取收藏
const fetchBinge = async () => {
  const { id } = ext.value.site;
  const { vod_id } = info.value;
  const response = await fetchBingeData(id, vod_id);
  dataBinge.value = response.data;
  isVisible.binge = !response.status;
};

// 更新收藏
const putBinge = async (update: boolean = false) => {
  const constructDoc = () => ({
    relateId: ext.value.site.id,
    videoId: info.value.vod_id,
    videoImage: info.value.vod_pic,
    videoName: info.value.vod_name,
    videoType: info.value.type_name,
    videoRemarks: info.value.vod_remarks,
  });

  let response: any;

  if (dataBinge.value?.id) {
    if (update) {
      response = await putBingeData('update', dataBinge.value.id, constructDoc());
      if (response?.data) dataBinge.value = response.data;
    } else {
      response = await putBingeData('del', dataBinge.value.id, {});
      dataBinge.value = {
        relateId: null,
        videoId: 0,
        videoImage: '',
        videoName: '',
        videoType: '',
        videoRemarks: '',
        id: null,
      };
    }
  } else if (!update) {
    response = await putBingeData('add', '', constructDoc());
    if (response?.data) dataBinge.value = response.data;
  }

  if (response && !response.status) {
    MessagePlugin.error(t('pages.player.message.error'));
    return;
  }

  if (!update) isVisible.binge = !isVisible.binge;
};

// 选集排序
const reverseOrderEvent = () => {
  isVisible.reverseOrder = !isVisible.reverseOrder;
  if (isVisible.reverseOrder) {
    season.value = reverseOrderHelper('positive', info.value.fullList);
  } else {
    season.value = reverseOrderHelper('negative', season.value);
  }
};

// 推荐刷新数据
const recommendEvent = async (item) => {
  const { site } = ext.value;

  const response = await fetchRecommendSearchHelper(site, item.vod_name);

  if (!_.isEmpty(response)) {
    info.value = response;
    recommend.value = [];
    dataHistory.value = {};
    skipConfig.value = { skipTimeInStart: 30, skipTimeInEnd: 30 };
    VIDEO_PROCESS_DOC.duration = 0;
    VIDEO_PROCESS_DOC.watchTime = 0;
    VIDEO_PROCESS_DOC.playEnd = false;

    tmp.skipTime = 0;
    active.flimSource = '';
    active.filmIndex = '';
    season.value = '';
    isVisible.binge = false;
    store.updateConfig({
      type: 'film',
      data: { info: item, ext: ext.value },
    });

    initPlayer();
  } else {
    MessagePlugin.warning(t('pages.player.message.noRecommendSearch'));
  }
};

// 更新历史跳过参数
const skipTimeInEndChange = () => {
  putHistory();
};

// 分享
const shareEvent = () => {
  const sourceUrl = 'https://web.zyplayer.fun/?url=';
  let name;

  if (type.value === 'film') name = `${info.value['vod_name']} ${formatIndex(active.filmIndex).index}`;
  else name = info.value['name'];

  const params = `${tmp.url}&name=${name}`;
  const url = `${sourceUrl}${params}`;

  shareData.value = {
    ...shareData.value,
    name,
    url,
  };

  isVisible.share = true;
};

//下载 dialog 数据
const downloadEvent = () => {
  downloadDialogData.value = {
    season: season.value,
    current: tmp.url,
  };
  isVisible.download = true;
};

// 初始化iptv
const initIptvPlayer = async () => {
  if (data.value.ext['epg']) getEpgList(ext.value['epg'], info.value['name'], moment().format('YYYY-MM-DD'));
  const url = info.value['url'];

  createPlayer(url);
};

// 电子节目单播放状态
const filterEpgStatus = (start: string, end: string): 'playing' | 'unplay' | 'played' => {
  const nowTimestamp = moment();
  const startTimestamp = moment().set({
    hours: parseInt(start.split(':')[0], 10),
    minutes: parseInt(start.split(':')[1], 10),
  });
  const endTimestamp = moment().set({
    hours: parseInt(end.split(':')[0], 10),
    minutes: parseInt(end.split(':')[1], 10),
  });

  if (nowTimestamp.isBetween(startTimestamp, endTimestamp)) return 'playing';
  if (nowTimestamp.isBefore(startTimestamp)) return 'unplay';
  if (nowTimestamp.isAfter(endTimestamp)) return 'played';

  throw new Error('Invalid state: unable to determine EPG status');
};

// 加载channel
const load = async ($state) => {
  console.log('[play][channel]loading...');
  try {
    const resLength = await getChannelList();
    console.log(`[play][channel]return length: ${resLength}`);
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

// 检查ipv6
const checkChannelListIpv6 = async (data: any[]) => {
  const newdata = await Promise.all(
    data.map(async (item) => {
      try {
        const checkStatus = await checkUrlIpv6(item.url);
        return checkStatus !== 'IPv6' ? item : null;
      } catch (err) {
        console.log(`[play][channel][checkIpv6][error]${err}`);
        return null;
      }
    }),
  );

  return newdata.filter((item) => item !== null);
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
const getEpgList = async (url: string, name: string, date: string): Promise<void> => {
  try {
    const res = await fetchChannelEpg(url, name, date);
    iptvConfig.value.epgData = res;
  } catch (err) {
    console.log(`[play][epg][error]${err}`);
  }
};

// 切换channel
const changeChannelEvent = async (item) => {
  store.updateConfig({
    type: 'iptv',
    data: { info: item, ext: ext.value },
  });
  info.value = item;
  const url = info.value['url'];
  if (player.value) {
    const { playerMode } = set.value;
    playerNext(player.value, playerMode.type, { url, mediaType: '' });
  } else {
    createPlayer(url);
  }
};

// 生成台标
const generateLogo = (item) => {
  let url = item.logo;
  if (ext.value.logo) {
    url = `${ext.value.logo}${item.name}.png`;
  }
  return url;
};

// 初始化网盘
const initCloudPlayer = async () => {
  driveDataList.value = ext.value['files'];
  const url = info.value['url'];
  createPlayer(url);
};

const spiderInit = async () => {
  if (!spider.value) spider.value = __jsEvalReturn();
  await spider.value.init({
    skey: 'siteKey',
    ext: [{ ...ext.value.site }],
  });
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
        vod_pic: res.thumb,
      },
    },
  });
  info.value = res;
  const url = info.value['url'];
  if (player.value) {
    const { playerMode } = set.value;
    playerNext(player.value, playerMode.type, { url, mediaType: '' });
  } else {
    createPlayer(url);
  }
};

// electron窗口置顶
const toggleAlwaysOnTop = (): void => {
  const isAlwaysOnTop = win.isAlwaysOnTop();
  const newValue = !isAlwaysOnTop;

  win.setAlwaysOnTop(newValue);
  BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', newValue ? 'no' : 'yes');
  isVisible.pin = newValue;
};

// 全屏事件 mac修复状态栏 css 用
const minMaxEvent = (): void => {
  const handleFullScreen = (isFullScreen) => {
    isVisible.macMaximize = isFullScreen;
  };

  win.on('enter-full-screen', () => handleFullScreen(true));
  win.on('leave-full-screen', () => handleFullScreen(false));
};

// 打开主窗口
const openMainWinEvent = (): void => {
  window.electron.ipcRenderer.send('showMainWin');
};

// 更新playShow状态
window.electron.ipcRenderer.on('destroy-playerWindow', () => {
  store.updateConfig({
    status: false,
  });
});

window.electron.ipcRenderer.on('media-control', (_, playStatus) => {
  const { playerMode } = set.value;
  if (player.value) playerToggle(player.value, playerMode.type, playStatus);
});
</script>

<style lang="less" scoped>
.container {
  height: calc(100vh);
  width: calc(100vw);
  overflow-y: hidden;
  background: var(--td-bg-color-page);

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
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    margin: var(--td-comp-margin-m) var(--td-comp-margin-xs);

    .mg-left {
      margin-left: 20px;
    }

    .left {
      .open-main-win {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        height: 32px;
        width: 120px;
        border-radius: var(--td-radius-default);
        background-color: var(--td-bg-color-container);
        padding: 2px 10px;
        transition: 0.15s linear;
        cursor: pointer;

        .tip-gotomain {
          display: inline-block;
          margin-left: 5px;
        }

        &:hover {
          background-color: var(--td-bg-content-hover-2);
        }
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
      height: 100%;

      .system-functions {
        display: flex;
        align-items: center;
        justify-content: space-around;
        background: var(--td-bg-color-container);
        border-radius: var(--td-radius-default);

        & > .system-function:first-of-type {
          margin-left: 0;
        }

        .system-function {
          margin-left: var(--td-comp-margin-xs);
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;

          :deep(.t-button) {
            &:not(.t-is-disabled):not(.t-button--ghost) {
              --ripple-color: transparent;
            }
          }

          :deep(.t-button__text) {
            svg {
              color: rgba(132, 133, 141, 0.8);
            }
          }

          :deep(.t-button--variant-text) {
            &:hover {
              border-color: transparent;
              background-color: transparent;

              .t-button__text {
                svg {
                  color: var(--td-primary-color);
                }
              }
            }
          }
        }
      }

      .window {
        height: 100%;
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
          background: url(@/assets/bg-player.jpg) center center;

          .player-media {
            width: 100%;
            height: 100%;

            .player {
              width: 100%;
              height: 100%;
              position: relative;
            }
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
        background: rgba(0, 0, 0, 0.4);
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
          background: rgba(0, 0, 0, 0.5);
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
      background: var(--td-bg-container);
      border-radius: var(--td-radius-medium);
      padding: 10px 10px 0;
      box-sizing: border-box;

      .content {
        height: -webkit-fill-available;

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
            background-color: var(--td-bg-container);
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
                grid-column-gap: var(--td-size-2);
                height: 38px;
                align-items: center;
                font-weight: 500;
                cursor: pointer;
                padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);

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
                  flex: 1;
                }

                &:hover {
                  background-color: var(--td-bg-content-hover-2);
                  border-radius: var(--td-radius-medium);
                }
              }
            }
          }

          :deep(.t-tab-panel) {
            background-color: var(--td-bg-container);
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
            width: 100%;

            .title-text {
              max-width: 80%;
              font-weight: 500;
              line-height: 16px;
              font-size: 16px;
              color: var(--td-text-color-primary);
            }

            .title-desc {
              display: inline;
              align-items: center;
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
            width: inherit;

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
            background: hsla(0, 0%, 100%, 0.06);
            box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.16);
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
              border-image-source: linear-gradient(
                180deg,
                hsla(0, 0%, 100%, 0),
                hsla(0, 0%, 100%, 0.1) 53%,
                hsla(0, 0%, 100%, 0)
              );
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
            align-items: center;
            color: var(--td-text-color-primary);

            .left {
              display: flex;
              flex-direction: row;
              flex-wrap: nowrap;
              justify-content: flex-start;
              align-items: flex-end;

              .mg-left {
                margin-left: var(--td-comp-margin-xs);
              }

              .box-anthology-title {
                white-space: nowrap;
                position: relative;
                font-size: 18px;
                line-height: 25px;
                font-weight: 600;
              }

              .box-anthology-analyze,
              .box-anthology-line {
                :deep(.t-button) {
                  padding: 0;
                }

                :deep(.t-button:not(.t-is-disabled):not(.t-button--ghost)) {
                  --ripple-color: transparent;
                }

                :deep(.t-button--variant-text) {
                  color: var(--td-text-color-secondary);

                  .t-button__suffix {
                    margin-left: var(--td-comp-margin-xxs);
                  }

                  .t-button__text {
                    &:before {
                      content: '';
                      width: 1px;
                      margin: 0 var(--td-comp-margin-xs);
                      background: linear-gradient(180deg, transparent, var(--td-border-level-1-color), transparent);
                    }
                  }

                  &:hover,
                  &:focus-visible {
                    background-color: transparent !important;
                    border-color: transparent !important;
                    color: var(--td-brand-color);
                  }
                }
              }
            }

            .right {
              .box-anthology-reverse-order {
                cursor: pointer;
              }
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
                width: 41px;
                font-size: 18px;
                height: 41px;
                line-height: 41px;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                margin-bottom: 4px;
                margin-right: 4px;
                box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);

                &:hover {
                  background-image: linear-gradient(var(--td-brand-color-2), var(--td-brand-color-3));
                }

                &:before {
                  content: '';
                  display: block;
                  position: absolute;
                  top: 1px;
                  left: 1px;
                  right: 1px;
                  bottom: 1px;
                  border-radius: 8px;
                  background-color: var(--td-bg-container);
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
                  background-image: linear-gradient(hsla(0, 0%, 100%, 0.04), hsla(0, 0%, 100%, 0.06));

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
                background-image: linear-gradient(hsla(0, 0%, 100%, 0.1), hsla(0, 0%, 100%, 0.06));

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
              margin-top: 10px;
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

.active {
  color: var(--td-brand-color);
}

:deep(.t-input) {
  background-color: var(--td-bg-content-input) !important;
  border-color: transparent !important;
}

@media only screen and (max-width: 640px) {
  .container {
    width: 100%;
    overflow: auto;

    &:hover > .container-header {
      opacity: 1;
      pointer-events: auto;
      transition:
        opacity 0.15s linear 0s,
        visibility 0s linear 0s;
    }

    .container-header {
      background: linear-gradient(360deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 999;
      opacity: 0;
      pointer-events: none;
      transition:
        opacity 0.15s linear 3s,
        visibility 0s linear 3s;
      height: 56px;
      margin: 0;
      padding: var(--td-comp-paddingTB-xxxs) var(--td-comp-paddingLR-xs) 0;

      .left {
        .open-main-win {
          background-color: transparent !important;
          color: #f3f3f3;
          width: auto !important;

          .tip-gotomain {
            display: none !important;
          }

          &:hover {
            background-color: transparent !important;
            color: #fbfbfb;
          }
        }
      }

      .spacer {
        color: #fbfbfb;
      }

      .right {
        color: #fbfbfb;

        .system-functions {
          background-color: transparent !important;

          .staple {
            margin-left: 0;

            svg {
              color: #fbfbfb !important;
            }

            &:hover {
              background-color: transparent !important;
              color: #fbfbfb !important;
            }
          }

          .setting {
            display: none !important;
          }
        }

        .window {
          margin: 12px 0 0 0 !important;
          border-radius: 0 !important;
          background-color: transparent !important;
          cursor: pointer;
          --tb-control-hover-color: transparent !important;
          --tb-control-symbol-color: #fbfbfb !important;
          --tb-control-close-symbol-color: #fbfbfb !important;

          :deep(.titlebar__window-controls) {
            .window__control {
              cursor: pointer !important;
            }

            .window__control-close:hover {
              background-color: transparent !important;
            }
          }
        }
      }
    }

    .container-main {
      height: 100vh;

      .player {
        .dock-show {
          display: none !important;
        }
      }

      .aside {
        display: none !important;
      }
    }
  }
}
</style>
