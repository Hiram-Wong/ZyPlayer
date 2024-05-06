<template>
  <div class="container">
    <div class="container-header" :class="!isVisible.macMaximize ? 'drag' : 'no-drag'">
      <div class="left no-drag"
        :style="{ 'padding-left': platform === 'darwin' && !isVisible.macMaximize ? '60px' : '0' }">
        <div class="open-main-win" @click="openMainWinEvent">
          <home-icon size="1.5em" />
          <span class="tip-gotomain">{{ $t('pages.player.header.backMain') }}</span>
        </div>
      </div>
      <div class="spacer">
        <span v-if="type === 'film'">{{ `${info["vod_name"]} ${formatIndex(active.filmIndex).index}` }}</span>
        <span v-else>{{ info["name"] }}</span>
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
                    <t-input-number v-model="skipConfig.skipTimeInStart" theme="normal" align="right" @click="skipTimeInEndChange">
                      <template #label>开头: </template>
                      <template #suffix> 秒</template>
                    </t-input-number>
                  </div>
                  <div class="skip-time-in-end">
                    <t-input-number v-model="skipConfig.skipTimeInEnd" theme="normal" align="right" @click="skipTimeInEndChange">
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
        <system-control v-if="platform !== 'darwin'" />
      </div>
    </div>
    <div class="container-main">
      <div class="player">
        <div class="container-player" :class='["subject", isVisible.aside ? "subject-ext" : ""]'>
          <div class="player-panel">
            <div class="player-media">
              <div v-show="player.xgplayer" id="xgplayer" ref="xgpayerRef" class="xgplayer player"></div>
              <div v-show="player.dplayer" id="dplayer" ref="dplayerRef" class="dplayer player"></div>
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
            <p class="title nowrap">{{ info["name"] }}</p>
          </div>
          <div class="iptv-main content-main">
            <t-tabs v-model="active.iptvNav" class="iptv-tabs tabs">
              <t-tab-panel value="epg" :label="$t('pages.player.iptv.epg')">
                <div class="contents-wrap scroll-y epg-wrap">
                  <div v-for="(item, index) in iptvConfig.epgData" :key="index" class="content">
                    <div class="content-item content-item-between">
                      <div class="time-warp">{{ item["start"] }}</div>
                      <div class="title-wrap nowrap">{{ item["title"] }}</div>
                      <div class="status-wrap">
                        <span v-if='filterEpgStatus(item["start"], item["end"]) === "played"' class="played">
                          {{ $t(`pages.player.status.${filterEpgStatus(item["start"], item["end"])}`) }}
                        </span>
                        <span v-if='filterEpgStatus(item["start"], item["end"]) === "playing"' class="playing">
                          {{ $t(`pages.player.status.${filterEpgStatus(item["start"], item["end"])}`) }}
                        </span>
                        <span v-if='filterEpgStatus(item["start"], item["end"]) === "unplay"' class="unplay">
                          {{ $t(`pages.player.status.${filterEpgStatus(item["start"], item["end"])}`) }}
                        </span>
                      </div>
                    </div>
                    <t-divider dashed style="margin: 5px 0" />
                  </div>
                </div>
              </t-tab-panel>
              <t-tab-panel value="channel" :label="$t('pages.player.iptv.channel')">
                <div class="contents-wrap scroll-y channel-wrap">
                  <div v-for="item in iptvConfig.channelData" :key='item["id"]' class="content">
                    <div class="content-item content-item-start" @click="changeChannelEvent(item)">
                      <div class="logo-wrap">
                        <t-image class="logo" fit="contain" :src='generateLogo(item)'
                          :style="{ width: '64px', height: '32px', maxHeight: '32px', background: 'none' }" :lazy="true"
                          :loading="renderLoading" :error="renderError">
                        </t-image>
                      </div>
                      <div class="title-wrap nowrap title-warp-channel">{{ item["name"] }}</div>
                      <div class="status-wrap">
                        <span :class='item["id"] === info["id"] ? "playing" : "unplay"'>
                          {{ item["id"] === info["id"] ? $t('pages.player.status.playing') :
                            $t('pages.player.status.unplay') }}
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
                <div class="title-text nowrap">{{ info["vod_name"] }}</div>
                <div class="title-desc" @click="active.profile = true">
                  <span class="title-unfold">{{ $t('pages.player.film.desc') }}</span>
                  <chevron-right-s-icon />
                </div>
              </div>
              <div class="hot-block">
                <span class="rate">
                  <star-icon />
                  {{ info["vod_score"] ? info["vod_score"] : '0.0' }}
                </span>
                <t-divider layout="vertical" v-show='info["type_name"]' />
                <span v-show='info["type_name"]'>{{ info["type_name"] }}</span>
                <t-divider layout="vertical" v-show='info["vod_area"]' />
                <span v-show='info["vod_area"]'>{{ info["vod_area"] }}</span>
                <t-divider layout="vertical" v-show='info["vod_year"]' />
                <span v-show='info["vod_year"]'>{{ info["vod_year"] }}</span>
              </div>
              <div class="function">
                <div class="func-item like" @click="bingeEvent">
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
                <t-tabs v-model="active.flimSource" class="film-tabs">
                  <t-tab-panel v-for="(value, key, index) in season" :key="index" :value="key" :label="key">
                    <div class="tag-container">
                      <div v-for="(item, index) in value" :key="item"
                        :class='["mainVideo-num", item === active.filmIndex ? "mainVideo-selected" : ""]'
                        @click="changeEvent(item)">
                        <t-tooltip :content="formatName(item)">
                          <div class="mainVideo_inner">
                            {{ index + 1 }}
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
                  <div v-for="content in recommend" :key='content["id"]' class="videoItem-card">
                    <div class="videoItem-left" @click="recommendEvent(content)">
                      <t-image class="card-main-item" :src='content["vod_pic"]'
                        :style="{ width: '126px', height: '70px', 'border-radius': '5px' }" :lazy="true" fit="cover">
                        <template #overlayContent>
                          <span class="nowrap" :style="{
                            position: 'absolute',
                            right: '6px',
                            bottom: '2px',
                            maxWidth: '90%',
                            color: '#fff'
                          }">
                            {{ content["vod_remarks"] }}
                          </span>
                        </template>
                      </t-image>
                    </div>
                    <div class="videoItem-right">
                      <div class="title nowrap">{{ content["vod_name"] }}</div>
                      <div class="subtitle nowrap">
                        {{ content["vod_blurb"] ? content["vod_blurb"] : '' }}
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
              <close-icon size="1.3em" class="icon" @click="active.profile = false" />
            </div>
            <t-divider dashed style="margin: 5px 0" />
            <div class="side-body scroll-y ">
              <div class="card">
                <div class="cover">
                  <t-image class="card-main-item" :src='info["vod_pic"]'
                    :style="{ width: '100%', height: '100%', 'border-radius': '5px' }" :lazy="true" fit="cover" />
                </div>
                <div class="content">
                  <div class="name">{{ info["vod_name"] }}</div>
                  <div class="type">{{ info["type_name"] }}</div>
                  <div class="num">{{ info["vod_remarks"] }}</div>
                </div>
              </div>
              <div class="text">
                <span v-html='filterContent(info["vod_content"])'></span>
              </div>
              <div class="case">
                <div class="title">{{ $t('pages.player.film.actors') }}</div>
                <div class="content">
                  <div v-show='info["vod_director"]'>
                    <span class="name">{{ $t('pages.player.film.director') }}: </span>
                    <span class="role">{{ info["vod_director"] }}</span>
                  </div>
                  <div v-show='info["vod_actor"]'>
                    <span class="name">{{ $t('pages.player.film.actor') }}: </span>
                    <span class="role">{{ info["vod_actor"] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="type == 'drive'" class="drive content">
          <div class="title-warp">
            <p class="title nowrap">{{ info["name"] }}</p>
          </div>
          <div class="drive-main content-main">
            <t-tabs v-model="active.driveNav" class="drive-tabs tabs">
              <t-tab-panel value="season" :label="$t('pages.player.drive.anthology')">
                <div class="contents-wrap scroll-y drive-wrap">
                  <div v-for="item in driveDataList" :key='item["id"]' class="content">
                    <template v-if='item["type"] === 10'>
                      <div class="content-item content-item-start" @click="changeDriveEvent(item)">
                        <div class="logo-wrap">
                          <t-image class="logo" fit="cover" :src='item["thumb"]'
                            :style="{ width: '64px', height: '28px', background: 'none', borderRadius: '6px' }"
                            :lazy="true" :loading="renderLoading" :error="renderError" />
                        </div>
                        <div class="title-wrap nowrap">{{ item["name"] }}</div>
                        <div class="status-wrap">
                          <span :class='info["name"] === item["name"] ? "playing" : "unplay"'>
                            {{ item["name"] === info["name"] ? $t('pages.player.status.playing') :
                              $t('pages.player.status.unplay') }}
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
import 'xgplayer/es/plugins/danmu/index.css';

import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';

import DPlayer from 'dplayer';
import flvjs from 'flv.js';
import Hls from 'hls.js';
import _ from 'lodash';
import moment from 'moment';
import jsonpath from 'jsonpath';
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
import { computed, onMounted, ref, reactive } from 'vue';
import Player, { Events, SimplePlayer } from 'xgplayer';
import Danmu from 'xgplayer/es/plugins/danmu';
import LivePreset from 'xgplayer/es/presets/live';
import FlvPlugin from 'xgplayer-flv';
import HlsPlugin from 'xgplayer-hls';
import Mp4Plugin from 'xgplayer-mp4';

import SystemControl from '@/layouts/components/SystemControl.vue';
import DialogDownloadView from './play/componets/DialogDownload.vue';
import { setDefault } from '@/api/setting';
import { fetchAnalyzeDefault } from '@/api/analyze';
import { fetchFilmDetail } from '@/api/site';
import { updateHistory, detailHistory, addHistory } from '@/api/history';
import { detailStar, addStar, delStar } from '@/api/star';
import { fetchChannelList } from '@/api/iptv';
import { setT3Proxy } from '@/api/proxy';

import { getConfig, checkMediaType, checkUrlIpv6, checkLiveM3U8 } from '@/utils/tool';
import { __jsEvalReturn } from '@/utils/alist_open';
import { fetchDrpyPlayUrl, fetchHipyPlayUrl, fetchT3PlayUrl, t3RuleProxy, fetchDetail, fetchSearch, t3RuleInit, catvodRuleInit, fetchCatvodPlayUrl, fetchDoubanRecommend } from '@/utils/cms';
import { fetchChannelEpg } from '@/utils/channel';
import sniffer from '@/utils/sniffer';
import { usePlayStore } from '@/store';

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
const info = ref(data.value.info) as any;
const ext = ref(data.value.ext) as any;

const downloadDialogData = ref({ season: '', current: '' });
const dplayerRef = ref(null); // 呆呆播放器dom节点

const commonConfig = {
  url: '',
  autoplay: true,
  pip: true,
  cssFullscreen: false,
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
  time: {
    index: 0
  },
  icons: {
    play: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-icon-play"><path d="M14.121 8.299a2 2 0 010 3.402l-7.94 4.91c-1.332.825-3.051-.133-3.051-1.7V5.09c0-1.567 1.72-2.525 3.052-1.701l7.939 4.911z" fill="#fff"></path></svg>`,
    pause: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-icon-pause"><rect x="5.313" y="3.75" width="3.125" height="12.5" rx=".625" fill="#fff"></rect><rect x="11.563" y="3.75" width="3.125" height="12.5" rx=".625" fill="#fff"></rect></svg>`,
    playNext: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-play-next"><path d="M11.626 6.457L3.452 1.334C1.937.384.042 1.571.042 3.471v11.057c0 1.9 1.894 3.087 3.41 2.137l8.174-5.123c1.875-1.174 1.875-3.91 0-5.085zM16.5 1c-.825 0-1.5.675-1.5 1.5v13c0 .825.675 1.5 1.5 1.5s1.5-.675 1.5-1.5v-13c0-.825-.675-1.5-1.5-1.5z"></path></svg>`,
    fullscreen: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-get-fullscreen"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.778 2h4.444v1.778H3.778v4.444H2V3.778C2 2.796 2.796 2 3.778 2zM2 11.778v4.444C2 17.204 2.796 18 3.778 18h4.444v-1.778H4.823l2.313-2.313a.9.9 0 00-1.272-1.273l-2.086 2.086v-2.944H2zm14.222 0v4.444h-4.444V18h4.444c.982 0 1.778-.796 1.778-1.778v-4.444h-1.778zM18 8.222V3.778C18 2.796 17.204 2 16.222 2h-4.444v1.778h2.945l-2.587 2.586a.9.9 0 101.273 1.273l2.813-2.813v3.398H18z" fill="#fff"></path></svg>`,
    exitFullscreen: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-exit-fullscreen"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.892 2h4.445v1.778H3.892v4.444H2.114V3.778C2.114 2.796 2.91 2 3.892 2zm4.445 16v-4.444c0-.982-.796-1.778-1.778-1.778H2.114v1.778h2.944L2.264 16.35a.9.9 0 001.272 1.273l2.988-2.987a.918.918 0 00.035-.037V18h1.778zm8-6.222v4.444h-4.445V18h4.445c.981 0 1.777-.796 1.777-1.778v-4.444h-1.777zM11.892 2v4.445c0 .981.796 1.777 1.778 1.777h4.444V6.445H15.17l2.568-2.568a.9.9 0 10-1.273-1.273L13.67 5.4V2h-1.778z" fill="#fff"></path></svg>`,
    volumeSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-volume-small"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.867 2.5h.55c.44 0 .799.34.83.771l.003.062v13.334c0 .44-.34.799-.771.83l-.062.003h-.55a.833.833 0 01-.444-.128l-.064-.045-4.867-3.744a.831.831 0 01-.322-.59l-.003-.07V7.077c0-.235.099-.458.271-.615l.054-.045L9.36 2.673a.832.832 0 01.43-.17l.078-.003h.55-.55zM2.5 6.667c.23 0 .417.186.417.416v5.834c0 .23-.187.416-.417.416h-.833a.417.417 0 01-.417-.416V7.083c0-.23.187-.416.417-.416H2.5zm11.768.46A4.153 4.153 0 0115.417 10c0 1.12-.442 2.137-1.162 2.886a.388.388 0 01-.555-.007l-.577-.578c-.176-.176-.156-.467.009-.655A2.49 2.49 0 0013.75 10a2.49 2.49 0 00-.61-1.636c-.163-.188-.182-.477-.006-.653l.578-.578a.388.388 0 01.556-.006z" fill="#fff"></path></svg>`,
    volumeLarge: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-volume"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.867 2.5h.55c.44 0 .799.34.83.771l.003.062v13.334c0 .44-.34.799-.771.83l-.062.003h-.55a.833.833 0 01-.444-.128l-.064-.045-4.867-3.744a.831.831 0 01-.322-.59l-.003-.07V7.077c0-.235.099-.458.271-.615l.054-.045L9.36 2.673a.832.832 0 01.43-.17l.078-.003h.55-.55zm6.767 2.278A7.474 7.474 0 0118.75 10a7.477 7.477 0 01-2.128 5.234.4.4 0 01-.57-.004l-.587-.586a.442.442 0 01.005-.617A5.812 5.812 0 0017.083 10c0-1.557-.61-2.97-1.603-4.017a.442.442 0 01-.003-.615l.586-.586a.4.4 0 01.57-.004zM2.5 6.667c.23 0 .417.186.417.416v5.834c0 .23-.187.416-.417.416h-.833a.417.417 0 01-.417-.416V7.083c0-.23.187-.416.417-.416H2.5zm11.768.46A4.153 4.153 0 0115.417 10c0 1.12-.442 2.137-1.162 2.886a.388.388 0 01-.555-.007l-.577-.578c-.176-.176-.156-.467.009-.655A2.49 2.49 0 0013.75 10a2.49 2.49 0 00-.61-1.636c-.163-.188-.182-.477-.006-.653l.578-.578a.388.388 0 01.556-.006z" fill="#fff"></path></svg>`,
    volumeMuted: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-volume-mute"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.045 2.5h.55c.44 0 .8.34.831.771l.003.062v13.334c0 .44-.34.799-.771.83l-.063.003h-.55a.833.833 0 01-.443-.128l-.065-.045-4.866-3.744a.831.831 0 01-.323-.59l-.003-.07V7.077c0-.235.1-.458.272-.615l.054-.045 4.866-3.744a.832.832 0 01.43-.17l.078-.003h.55-.55zM2.68 6.667c.23 0 .416.186.416.416v5.834c0 .23-.186.416-.416.416h-.834a.417.417 0 01-.416-.416V7.083c0-.23.186-.416.416-.416h.834zm10.467.294a.417.417 0 01.59 0l1.767 1.768L17.27 6.96a.417.417 0 01.589 0l.59.59a.417.417 0 010 .589L16.68 9.908l1.768 1.767c.15.15.162.387.035.55l-.035.04-.589.589a.417.417 0 01-.59 0l-1.767-1.768-1.768 1.768a.417.417 0 01-.59 0l-.588-.59a.417.417 0 010-.589l1.767-1.768-1.767-1.767a.417.417 0 01-.035-.55l.035-.04.589-.589z" fill="#fff"></path></svg>`,
    pipIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-get-pip">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 4.3H3.5C3.38954 4.3 3.3 4.38954 3.3 4.5V15.5C3.3 15.6105 3.38954 15.7 3.5 15.7H8.50005L8.50006 17.5H3.5C2.39543 17.5 1.5 16.6046 1.5 15.5V4.5C1.5 3.39543 2.39543 2.5 3.5 2.5H16.5C17.6046 2.5 18.5 3.39543 18.5 4.5V8.5H16.7V4.5C16.7 4.38954 16.6105 4.3 16.5 4.3ZM12 11.5C11.4477 11.5 11 11.9477 11 12.5L11 16.5C11 17.0523 11.4478 17.5 12 17.5H17.5C18.0523 17.5 18.5 17.0523 18.5 16.5L18.5 12.5C18.5 11.9477 18.0523 11.5 17.5 11.5H12Z" fill="white"></path>
    </svg>`,
    pipIconExit: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-exit-pip">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 4.3H3.5C3.38954 4.3 3.3 4.38954 3.3 4.5V15.5C3.3 15.6105 3.38954 15.7 3.5 15.7H8.50005L8.50006 17.5H3.5C2.39543 17.5 1.5 16.6046 1.5 15.5V4.5C1.5 3.39543 2.39543 2.5 3.5 2.5H16.5C17.6046 2.5 18.5 3.39543 18.5 4.5V8.5H16.7V4.5C16.7 4.38954 16.6105 4.3 16.5 4.3ZM12 11.5C11.4477 11.5 11 11.9477 11 12.5L11 16.5C11 17.0523 11.4478 17.5 12 17.5H17.5C18.0523 17.5 18.5 17.0523 18.5 16.5L18.5 12.5C18.5 11.9477 18.0523 11.5 17.5 11.5H12Z" fill="white"></path>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.4998 7.7C9.77595 7.7 9.9998 7.47614 9.9998 7.2V6.5C9.9998 6.22386 9.77595 6 9.4998 6H5.5402L5.52754 6.00016H5.5C5.22386 6.00016 5 6.22401 5 6.50016V10.4598C5 10.7359 5.22386 10.9598 5.5 10.9598H6.2C6.47614 10.9598 6.7 10.7359 6.7 10.4598V8.83005L8.76983 10.9386C8.96327 11.1357 9.27984 11.1386 9.47691 10.9451L9.97645 10.4548C10.1735 10.2613 10.1764 9.94476 9.983 9.7477L7.97289 7.7H9.4998Z" fill="white"></path>
    </svg>`,
    openDanmu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-2,-2,28,28" fill="none" class="xg-open-danmu"><path d="M15.3468 7C15.6522 7 15.905 7.22505 15.9484 7.51835L15.955 7.60823L15.9549 8.01653L16.2911 8.01726C16.5965 8.01726 16.8493 8.24231 16.8928 8.5356L16.8994 8.62548V12.463C16.8994 12.7989 16.6271 13.0713 16.2911 13.0713L14.4101 13.0707V13.7582L16.2047 13.7588C16.5406 13.7588 16.8129 14.0311 16.8129 14.367C16.8129 14.6724 16.5878 14.9252 16.2946 14.9687L16.2047 14.9753L14.4101 14.9748L14.4104 15.9871C14.4104 16.323 14.1381 16.5953 13.8022 16.5953C13.4968 16.5953 13.244 16.3703 13.2006 16.077L13.194 15.9871L13.1935 14.9748L11.3133 14.9753C10.9773 14.9753 10.705 14.703 10.705 14.367C10.705 14.0617 10.9301 13.8089 11.2234 13.7654L11.3133 13.7588L13.1935 13.7582V13.0707L11.3133 13.0713C11.0079 13.0713 10.7551 12.8462 10.7116 12.5529L10.705 12.463V8.62548C10.705 8.28957 10.9773 8.01726 11.3133 8.01726L11.9315 8.01653L11.932 7.60823C11.932 7.27231 12.2043 7 12.5402 7C12.8456 7 13.0984 7.22505 13.1419 7.51835L13.1485 7.60823L13.1481 8.01653H14.7383L14.7386 7.60823C14.7386 7.27231 15.0109 7 15.3468 7ZM9.40777 7.41055C9.71315 7.41055 9.96596 7.6356 10.0094 7.9289L10.016 8.01878V10.5173C10.016 10.8227 9.79095 11.0755 9.49765 11.119L9.40777 11.1256L7.68831 11.1255V12.2097L9.40777 12.21C9.71315 12.21 9.96596 12.4351 10.0094 12.7284L10.016 12.8183V15.2084C10.016 15.3812 9.94252 15.5458 9.81391 15.6612C9.32173 16.1027 8.42975 16.2805 7.08088 16.2805C6.74497 16.2805 6.47266 16.0082 6.47266 15.6723C6.47266 15.3364 6.74497 15.064 7.08088 15.064C7.86129 15.064 8.42395 14.9934 8.74634 14.8859L8.79911 14.8661V13.4263L7.08088 13.4265C6.77551 13.4265 6.52269 13.2014 6.47925 12.9081L6.47266 12.8183V10.5173C6.47266 10.212 6.69771 9.95916 6.991 9.91571L7.08088 9.90912L8.79911 9.90891V8.62646L7.08088 8.627C6.77551 8.627 6.52269 8.40195 6.47925 8.10866L6.47266 8.01878C6.47266 7.7134 6.69771 7.46059 6.991 7.41715L7.08088 7.41055H9.40777ZM13.1935 11.1524H11.9199L11.9207 11.8539L13.1935 11.8532V11.1524ZM15.6819 11.1524H14.4101V11.8532L15.6827 11.8539L15.6819 11.1524ZM13.1935 9.23227L11.9207 9.233L11.9199 9.93574H13.1935V9.23227ZM15.6827 9.233L14.4101 9.23227V9.93574H15.6819L15.6827 9.233Z" fill="#fff"></path><path d="M17.8763 16.4209H22.7763C24.5804 16.4209 26.043 17.8834 26.043 19.6876C26.043 21.4917 24.5804 22.9542 22.7763 22.9542H17.8763C16.0722 22.9542 14.6096 21.4917 14.6096 19.6876C14.6096 17.8834 16.0722 16.4209 17.8763 16.4209Z" fill="#14A3FF"></path><path d="M19.9201 19.6874C19.9201 21.2661 21.1997 22.5458 22.7784 22.5458C24.3571 22.5458 25.6367 21.2661 25.6367 19.6874C25.6367 18.1088 24.3571 16.8291 22.7784 16.8291C21.1997 16.8291 19.9201 18.1088 19.9201 19.6874Z" fill="#fff"></path><path d="M11.375 21H4.375C2.92525 21 1.75 19.8247 1.75 18.375V5.25C1.75 3.80025 2.92525 2.625 4.375 2.625H19.125C20.5747 2.625 21.75 3.80025 21.75 5.25V13.125" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"></path></svg>`,
    closeDanmu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-2,-2,28,28" fill="none" class="xg-colose-danmu"><path d="M15.3468 7C15.6522 7 15.905 7.22505 15.9484 7.51835L15.955 7.60823L15.9549 8.01653L16.2911 8.01726C16.5965 8.01726 16.8493 8.24231 16.8928 8.5356L16.8994 8.62548V12.463C16.8994 12.7989 16.6271 13.0713 16.2911 13.0713L14.4101 13.0707V13.7582L16.2047 13.7588C16.5406 13.7588 16.8129 14.0311 16.8129 14.367C16.8129 14.6724 16.5878 14.9252 16.2946 14.9687L16.2047 14.9753L14.4101 14.9748L14.4104 15.9871C14.4104 16.323 14.1381 16.5953 13.8022 16.5953C13.4968 16.5953 13.244 16.3703 13.2006 16.077L13.194 15.9871L13.1935 14.9748L11.3133 14.9753C10.9773 14.9753 10.705 14.703 10.705 14.367C10.705 14.0617 10.9301 13.8089 11.2234 13.7654L11.3133 13.7588L13.1935 13.7582V13.0707L11.3133 13.0713C11.0079 13.0713 10.7551 12.8462 10.7116 12.5529L10.705 12.463V8.62548C10.705 8.28957 10.9773 8.01726 11.3133 8.01726L11.9315 8.01653L11.932 7.60823C11.932 7.27231 12.2043 7 12.5402 7C12.8456 7 13.0984 7.22505 13.1419 7.51835L13.1485 7.60823L13.1481 8.01653H14.7383L14.7386 7.60823C14.7386 7.27231 15.0109 7 15.3468 7ZM9.40777 7.41055C9.71315 7.41055 9.96596 7.6356 10.0094 7.9289L10.016 8.01878V10.5173C10.016 10.8227 9.79095 11.0755 9.49765 11.119L9.40777 11.1256L7.68831 11.1255V12.2097L9.40777 12.21C9.71315 12.21 9.96596 12.4351 10.0094 12.7284L10.016 12.8183V15.2084C10.016 15.3812 9.94252 15.5458 9.81391 15.6612C9.32173 16.1027 8.42975 16.2805 7.08088 16.2805C6.74497 16.2805 6.47266 16.0082 6.47266 15.6723C6.47266 15.3364 6.74497 15.064 7.08088 15.064C7.86129 15.064 8.42395 14.9934 8.74634 14.8859L8.79911 14.8661V13.4263L7.08088 13.4265C6.77551 13.4265 6.52269 13.2014 6.47925 12.9081L6.47266 12.8183V10.5173C6.47266 10.212 6.69771 9.95916 6.991 9.91571L7.08088 9.90912L8.79911 9.90891V8.62646L7.08088 8.627C6.77551 8.627 6.52269 8.40195 6.47925 8.10866L6.47266 8.01878C6.47266 7.7134 6.69771 7.46059 6.991 7.41715L7.08088 7.41055H9.40777ZM13.1935 11.1524H11.9199L11.9207 11.8539L13.1935 11.8532V11.1524ZM15.6819 11.1524H14.4101V11.8532L15.6827 11.8539L15.6819 11.1524ZM13.1935 9.23227L11.9207 9.233L11.9199 9.93574H13.1935V9.23227ZM15.6827 9.233L14.4101 9.23227V9.93574H15.6819L15.6827 9.233Z" fill="#fff"></path><path d="M17.8763 16.4209H22.7763C24.5804 16.4209 26.043 17.8834 26.043 19.6876C26.043 21.4917 24.5804 22.9542 22.7763 22.9542H17.8763C16.0722 22.9542 14.6096 21.4917 14.6096 19.6876C14.6096 17.8834 16.0722 16.4209 17.8763 16.4209Z" fill="#707070"></path><path d="M15.0236 19.6874C15.0236 21.2661 16.3032 22.5458 17.8819 22.5458C19.4606 22.5458 20.7402 21.2661 20.7402 19.6874C20.7402 18.1088 19.4606 16.8291 17.8819 16.8291C16.3032 16.8291 15.0236 18.1088 15.0236 19.6874Z" fill="#fff"></path><path d="M11.375 21H4.375C2.92525 21 1.75 19.8247 1.75 18.375V5.25C1.75 3.80025 2.92525 2.625 4.375 2.625H19.125C20.5747 2.625 21.75 3.80025 21.75 5.25V13.125" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"></path></svg>`
  },
  width: 'auto',
  height: 'calc(100vh - 56px)'
}; // 西瓜、火山公共部分

const playerConfig = ref({
  veplayer: {
    ...commonConfig,
    id: 'xgplayer',
    streamType: 'hls',
    enableMenu: true,
  },
  xgplayer: {
    ...commonConfig,
    id: 'xgplayer',
    enableContextmenu: true,
    danmu: {
      panel: false,
      comments: [],
      area: { start: 0, end: 0.3 },
      defaultOff: true //开启此项后弹幕不会初始化，默认初始化弹幕
    },
    plugins: []
  },
  dplayer: {
    container: dplayerRef,
    autoplay: true,
    screenshot: false,
    video: {}
  }
}) as any;

const player = ref({
  veplayer: null,
  xgplayer: null,
  dplayer: null
}) as any;

const tmp = reactive({
  skipTime: 0,
  url: "",
  sourceUrl: ""
});

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
const xgpayerRef = ref(null); // 西瓜播放器dom节点
const isSettingVisible = ref(false);

const dataHistory = ref({
  id: null,
  date: moment().unix(),
  type: 'film',
  // relateId: ext.value["site"]["id"] || null,
  siteSource: active.flimSource,
  playEnd: false,
  videoId: info.value["vod_id"],
  videoImage: info.value["vod_pic"],
  videoName: info.value["vod_name"],
  videoIndex: active.filmIndex,
  watchTime: 0,
  duration: null,
  skipTimeInStart: 30,
  skipTimeInEnd: 30,
}) as any; // 历史

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

const VIDEO_PROCESS_DOC = reactive({
  playEnd: false,
  watchTime: 0,
  duration: 0,
});

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

onMounted(() => {
  initPlayer();
  minMaxEvent();
});

const loadDanmu = async (resUrl: string) => {
  try {
    const startTime = new Date().getTime();
    const { url, key, support, start, mode, color, content } = set.value.barrage;

    if (!(url && key && support && start && mode && color)) return [];
    if (!_.some(support, source => source === active.flimSource)) return [];

    const sourceUrl = formatIndex(active.filmIndex).url;
    if (sourceUrl.startsWith('http')) {
      const { hostname } = new URL(sourceUrl);
      if (VIP_LIST.some((item) => hostname.includes(item))) resUrl = sourceUrl;
    };

    const configRes = await getConfig(`${url}${resUrl}`);

    if (!configRes[key] || configRes[key].length === 0) return [];

    const danmuku = configRes.danmuku;
    const comments = Array.from(danmuku, (item: any, index: number) => ({
      duration: 5000,
      id: String(index + 1),
      start: item[start] * 1000,
      txt: item[content],
      mode: ['left', 'right'].includes(item[mode]) ? 'scroll' : item[mode],
      color: true,
      style: {
        color: item[color]
      }
    }));

    const endTime = new Date().getTime();
    console.log(`[play][danmu]Time-consuming:${endTime - startTime}`)

    return comments || [];
  } catch (err) {
    console.log(`[play][danmu][error]${err}`);
    return [];
  }
};

// 加载播放器
const createPlayer = async (url: string, videoType: string = '') => {
  tmp.url = url;
  const { playerMode } = set.value;

  if (!videoType) {
    const meadiaType = await checkMediaType(url);
    if (meadiaType !== 'unknown' && meadiaType !== 'error') {
      videoType = meadiaType!;
    };
  };

  let isLive = false;
  if (type.value === 'iptv') {
    isLive = await checkLiveM3U8(info.value["url"]);
  };

  if (playerMode.type === 'xgplayer') {
    if (tmp.skipTime) playerConfig.value.xgplayer.startTime = tmp.skipTime;
    playerConfig.value.xgplayer.danmu.comments = await loadDanmu(url);
    if (isLive) {
      SimplePlayer.defaultPreset = LivePreset;
      playerConfig.value.xgplayer.isLive = true;
    };
    switch (videoType) {
      case 'mp4':
        playerConfig.value.xgplayer.plugins = [Mp4Plugin, Danmu];
        break;
      case 'mkv':
        playerConfig.value.xgplayer.plugins = [Mp4Plugin, Danmu];
        break;
      case 'flv':
        playerConfig.value.xgplayer.plugins = [FlvPlugin, Danmu];
        break;
      case 'm3u8':
        playerConfig.value.xgplayer.plugins = [HlsPlugin, Danmu];
        break;
      default:
        playerConfig.value.xgplayer.plugins = [HlsPlugin, Danmu];
        break;
    };
    playerConfig.value.xgplayer.url = url;
    if (isLive) player.value.xgplayer = new SimplePlayer({ ...playerConfig.value.xgplayer });
    else player.value.xgplayer = new Player({ ...playerConfig.value.xgplayer });
    console.log(`[player][xgplayer]load:${videoType}`);
  } else if (playerMode.type === 'dplayer') {
    let config;
    if (isLive) playerConfig.value.dplayer.live = true;
    switch (videoType) {
      case 'mp4':
        config = { url };
        break;
      case 'flv':
        config = {
          url,
          type: 'customFlv',
          customType: {
            customFlv: (video, _) => {
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
        config = {
          url,
          type: 'customHls',
          customType: {
            customHls: (video, _) => {
              const hls = new Hls();
              hls.loadSource(video.src);
              hls.attachMedia(video);
            },
          },
        }
        break;
      default:
        config = {
          url,
          type: 'customHls',
          customType: {
            customHls: (video, _) => {
              const hls = new Hls();
              hls.loadSource(video.src);
              hls.attachMedia(video);
            },
          },
        }
        break;
    };
    playerConfig.value.dplayer.video = { ...config };
    player.value.dplayer = new DPlayer({ ...playerConfig.value.dplayer });
    if (tmp.skipTime) player.value.dplayer.seek(tmp.skipTime);
    console.log(`[player][dplayer]load:${videoType}`);
  }

  if (type.value === 'film') await timerUpdatePlayProcess();

  setSystemMediaInfo();
};

// 设置系统媒体信息
const setSystemMediaInfo = () => {
  if ("mediaSession" in navigator) {
    let doc = {
      title: '' as string,
      artist: '' as string,
      artwork: [] as any[],
    };

    if (type.value === 'iptv') {
      doc = {
        title: info.value["name"],
        artist: '直播',
        artwork: [
          { src: logoIcon, sizes: "128x128", type: "image/png" },
        ]
      };
    } else if (type.value === 'drive') {
      doc = {
        title: info.value["name"],
        artist: '网盘',
        artwork: [
          { src: logoIcon, sizes: "128x128", type: "image/png" },
        ]
      };
    } else {
      doc = {
        title: info.value["vod_name"],
        artist: formatIndex(active.filmIndex).index,
        artwork: [
          { src: info.value["vod_pic"], sizes: "128x128", type: "image/png" },
        ]
      }
    }

    navigator.mediaSession.metadata = new MediaMetadata(doc);
  };

  let title;
  if (type.value === 'film') title = `${info.value["vod_name"]} ${formatIndex(active.filmIndex).index}`;
  else title = info.value["name"];
  document.title = title;
};

// 获取解析地址
const getAnalyzeFlag = async () => {
  try {
    const res = await fetchAnalyzeDefault();
    if (_.has(res, 'default')) analyzeConfig.value.default = res.default;
    if (_.has(res, 'flag')) analyzeConfig.value.flag = res.flag;

    console.log(`[play][analyze][jx]:${res.default.url}; flag:${[...res.flag]}`);
  } catch (error) {
    console.error(`[play][analyze][jx][error]${error}`);
  }
};

// 获取历史
const getHistoryData = async (): Promise<void> => {
  try {
    const { id } = ext.value["site"];
    const res = await detailHistory({ relateId: id, videoId: info.value["vod_id"] });

    if (res) {
      dataHistory.value = { ...res };
      active.flimSource = res.siteSource;
      active.filmIndex = res.videoIndex;

      const { skipTimeInStart, skipTimeInEnd } = res;
      skipConfig.value = { skipTimeInStart, skipTimeInEnd };
    };
  } catch (err) {
    console.error(`[detail][history][error]${err}`);
  };
};

// 更新历史
const putHistoryData = async () => {
  try {
    const { id: relateId } = ext.value["site"];
    let { id: historyId } = dataHistory.value;

    const doc = {
      date: moment().unix(),
      type: 'film',
      relateId: relateId,
      siteSource: active.flimSource,
      playEnd: VIDEO_PROCESS_DOC.playEnd,
      videoId: info.value["vod_id"],
      videoImage: info.value["vod_pic"],
      videoName: info.value["vod_name"],
      videoIndex: active.filmIndex,
      watchTime: VIDEO_PROCESS_DOC.watchTime,
      duration: VIDEO_PROCESS_DOC.duration,
      skipTimeInStart: skipConfig.value.skipTimeInStart,
      skipTimeInEnd: skipConfig.value.skipTimeInEnd
    };

    if (!historyId) {
      const res = await addHistory(doc);
      historyId = res.id;
    } else {
      await updateHistory(historyId, doc);
    };

    dataHistory.value = { ...doc, id: historyId };
  } catch (error) {
    console.error(error);
  };
};

// 摧毁播放器
const destroyPlayer = () => {
  if (player.value.xgplayer) {
    player.value.xgplayer.destroy();
    player.value.xgplayer = null;
  };

  if (player.value.dplayer) {
    player.value.dplayer.destroy();
    player.value.dplayer = null;
  };
};

// Helper functions
const fetchHipyPlayUrlHelper = async (site: { [key: string]: any }, flag: string, url: string): Promise<object> => {
  console.log('[detail][hipy][start]获取服务端播放链接开启');
  let playUrl: string = '';
  let script: string = '';
  let extra: string = '';
  try {
    const playRes = await fetchHipyPlayUrl(site, flag, url);
    playUrl = playRes.url;
    script = playRes.js ? Base64.stringify(Utf8.parse(playRes.js)) : '';
    extra = playRes.parse_extra || extra;
    console.log(`[detail][hipy][return]${playUrl}`);
  } catch (err) {
    console.log(`[detail][hipy][error]${err}`);
  } finally {
    console.log(`[detail][hipy][end]获取服务端播放链接结束`);
    return {playUrl,script,extra};
  };
};

const fetchT3PlayUrlHelper = async (flag: string, id: string, flags: string[] = []): Promise<object> => {
  console.log('[detail][t3][start]获取服务端播放链接开启');
  let playUrl: string = '';
  let script: string = '';
  let extra: string = '';
  try {
    const playRes = await fetchT3PlayUrl(flag, id, flags);
    if (playRes?.parse === 0 && playRes?.url.indexOf('http://127.0.0.1:9978/proxy') > -1) {
      const proxyRes: any = await t3RuleProxy(playRes.url);
      await setT3Proxy(proxyRes);
    };

    playUrl = playRes.url;
    script = playRes.js ? Base64.stringify(Utf8.parse(playRes.js)) : '';
    extra = playRes.parse_extra || extra;
    console.log(`[detail][t3][return]${playUrl}`);
  } catch (err) {
    console.log(`[detail][t3][error]${err}`);
  } finally {
    console.log(`[detail][t3][end]获取服务端播放链接结束`);
    return {playUrl,script,extra};
  };
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
  };
};

const fetchDrpyPlayUrlHelper = async (site: { [key: string]: any }, url: string): Promise<string> => {
  console.log('[detail][drpy][start]免嗅流程开启');
  let data: string = '';
  try {
    const res = await fetchDrpyPlayUrl(site, url);
    if (res.redirect) {
      data = res.url;
      console.log(`[detail][drpy][return]${data}`);
    };
  } catch (err) {
    console.log(`[detail][drpy][error]:${err}`);
  } finally {
    console.log(`[detail][drpy][end]免嗅流程结束`);
    return data;
  };
};

const fetchJsonPlayUrlHelper = async (playUrl: string, url: string): Promise<string> => {
  console.log('[detail][json][start]json解析流程开启');
  let data: string = '';
  try {
    const res = await getConfig(`${playUrl}${url}`);
    // 存在 url data.url 两种结构
    if (jsonpath.value(res, '$.url')) {
      data = jsonpath.value(res, '$.url');
      console.log(`[detail][json][return]${data}`);
    };
  } catch (err) {
    console.log(`[detail][json][error]${err}`);
  } finally {
    console.log(`[detail][json][end]json解析流程结束`);
    return data;
  }
};

const fetchJxPlayUrlHelper = async (type: string, url: string): Promise<string> => {
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
  };
};

// 初始化film
const initFilmPlayer = async (isFirst) => {
  const { site } = ext.value;
  tmp.skipTime = 0;
  await getDetailInfo();

  if (!isFirst) {
    await getHistoryData();
    if (!_.has(dataHistory.value, "id")) await putHistoryData();
    await getAnalyzeFlag();

    if (site.type !== 7 && site.search !== 0) getDoubanRecommend();

    getBinge();

    // 跳过时间
    if (set.value.skipStartEnd && dataHistory.value.watchTime < skipConfig.value.skipTimeInStart) {
      tmp.skipTime = skipConfig.value.skipTimeInStart;
    } else {
      tmp.skipTime = dataHistory.value["watchTime"] || 0;
    };
  } else {
    tmp.skipTime = dataHistory.value.watchTime || 0;
    if (set.value.skipStartEnd && dataHistory.value.watchTime < skipConfig.value.skipTimeInStart) {
      tmp.skipTime = skipConfig.value.skipTimeInStart;
    };
  };

  // 解析直链
  const { snifferMode } = set.value;

  let { url } = formatIndex(active.filmIndex);
  url = decodeURIComponent(url);

  tmp.url = url;
  tmp.sourceUrl = url;
  let playerUrl = url;
  let script: string = '';
  let extra: string = '';
  let playData: object = { playUrl: url, script: '',extra: ''};

  if (site.playUrl) {
    playerUrl = await fetchJsonPlayUrlHelper(site.playUrl, url);
  } else {
    if (url.startsWith('http')) {
      const { hostname } = new URL(url);
      let snifferUrl = '';
      if (url.includes('uri=')) snifferUrl = url; // 判断有播放器的
      if (
        VIP_LIST.some((item) => hostname.includes(item)) ||
        analyzeConfig.value.flag.some((item) => active.flimSource.includes(item))
      ) {
        // 官解iframe
        snifferUrl = analyzeConfig.value.default.url + url;
      }
      if (snifferUrl) {
        playerUrl = await fetchJxPlayUrlHelper(snifferMode.type, snifferMode.type === 'custom' ? `${snifferMode.url}${snifferUrl}` : snifferUrl);
        if (playerUrl) createPlayer(playerUrl);
        return;
      }
    }
    switch (site.type) {
      case 2:
        // drpy免嗅
        playerUrl = await fetchDrpyPlayUrlHelper(site, url);
        break;
      case 6:
        // hipy获取服务端播放链接
        playData = await fetchHipyPlayUrlHelper(site, active.flimSource, url);
        playerUrl = playData.playUrl;
        script = playData.script;
        extra = playData.extra;
        break;
      case 7:
        // t3获取服务端播放链接
        await t3RuleInit(site);
        playData = await fetchT3PlayUrlHelper(active.flimSource, url, []);
        playerUrl = playData.playUrl;
        script = playData.script;
        extra = playData.extra;
        break;
      case 8:
        // catvox获取服务端播放链接
        await catvodRuleInit(site);
        playerUrl = await fetchCatvodPlayUrlHelper(site, active.flimSource, url);
        break;
    }
  }

  if (!playerUrl) playerUrl = url;

  if (playerUrl) {
    const mediaType = await checkMediaType(playerUrl);
    console.log(`[detail][mediaType]${mediaType}`)
    if (mediaType !== 'unknown' && mediaType !== 'error') {
      createPlayer(playerUrl, mediaType!);
      return;
    }
  }

  // 兜底办法:嗅探
  console.log(`[detail][sniffer][reveal]尝试提取播放链接,type:${site.type}`);
  try {
    MessagePlugin.info('嗅探资源中, 如10s没有结果请换源,咻咻咻!');
    let snifferPlayUrl: string = url;
    let snifferApi: string = '';
    // 自定义嗅探器并且链接正确才有嗅探器api接口前缀
    if(snifferMode.type=='custom' && /^http/.test(snifferMode.url)){
      let snifferTool = new URL(snifferMode.url);
      snifferApi = snifferTool.origin + snifferTool.pathname;
    }
    snifferPlayUrl = `${snifferApi}?url=${url}&script=${script}${extra}`;
    playerUrl = await sniffer(snifferMode.type, snifferPlayUrl);
    createPlayer(playerUrl);
  } catch (err) {
    console.error(err);
  };
};

// 初始化播放器
const initPlayer = async (isFirst = false) => {
  destroyPlayer();

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
  };
};

// 格式化剧集名称
const formatName = (item: string): string => {
  const [first] = item.split('$');
  return first.includes('http') ? '正片' : first;
};

// 格式化剧集集数
const formatIndex = (item: string): { index: string, url: string } => {
  const [index, url] = item.split('$');
  return { index, url };
};

// 获取播放源及剧集
const getDetailInfo = async (): Promise<void> => {
  const videoList = info.value;

  // 播放源
  const playFrom = videoList["vod_play_from"];
  const playSource = playFrom.split('$').filter(Boolean);
  const [source] = playSource;

  if (!active.flimSource) active.flimSource = source;

  // 剧集
  const playUrl = videoList["vod_play_url"];
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

  if (!active.filmIndex) active.filmIndex = playEpisodes[0][0];

  // 合并播放源和剧集
  const fullList: Record<string, string[][]> = Object.fromEntries(
    playSource.map((key, index) => [key, playEpisodes[index]])
  );

  videoList.fullList = fullList;
  info.value = videoList;
  season.value = fullList;
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
  if (dataHistory.value["siteSource"] === active.flimSource) {  // 同源
    if (formatIndex(dataHistory.value["videoIndex"]).index !== formatIndex(active.filmIndex).index) {
      VIDEO_PROCESS_DOC.watchTime = 0;
      VIDEO_PROCESS_DOC.playEnd = false;
    };
  } else if (formatIndex(dataHistory.value["videoIndex"]).index !== formatIndex(active.filmIndex).index) { // 不同源
    VIDEO_PROCESS_DOC.watchTime = 0;
    VIDEO_PROCESS_DOC.playEnd = false;
  };

  await putHistoryData();
  await initPlayer(true);
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
      } catch (err) { }
    });

    await Promise.all(searchPromises);
    if (ids.length > 0) {
      const idsFirst = ids[0]
      if (!('vod_pic' in idsFirst)) {
        flag = false;
        vodIds = ids.map((movie) => movie["vod_id"]).join(',');
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
  const autoPlayNext = () => {
    const { playerMode } = set.value;
    const { siteSource } = dataHistory.value;
    const index = season.value[siteSource].indexOf(active.filmIndex);

    VIDEO_PROCESS_DOC.playEnd = true;
    VIDEO_PROCESS_DOC.duration = 0;

    if (season.value[siteSource].length === index + 1) {  // 最后一集
      putHistoryData();
      if (playerMode.type === 'xgplayer') {
        player.value.xgplayer.pause();
      } else if (playerMode.type === 'dplayer') {
        player.value.dplayer.pause();
      };
      return;
    };

    console.log('[player][progress] autoPlayNext');
    changeEvent(season.value[siteSource][index + 1]);
    MessagePlugin.info('请稍候,正在切换下集');
  };

  const onTimeUpdate = (currentTime: number, duration: number) => {
    VIDEO_PROCESS_DOC.watchTime = currentTime;
    VIDEO_PROCESS_DOC.duration = duration;

    const watchTime = set.value.skipStartEnd ? currentTime + skipConfig.value.skipTimeInEnd : currentTime;
    if (watchTime >= duration && duration !== 0) autoPlayNext();
    else putHistoryData();

    // console.log(
    //   `[player] timeUpdate - currentTime:${currentTime}; watchTime:${watchTime}; duration:${duration}; percentage:${Math.trunc(
    //     (currentTime / duration) * 100,
    //   )}%`,
    // );
  };

  if (set.value.playerMode.type === 'xgplayer') {
    player.value.xgplayer.on(Events.TIME_UPDATE, ({ currentTime, duration }) => {
      onTimeUpdate(currentTime, duration);
    });
  } else if (set.value.playerMode.type === 'dplayer') {
    player.value.dplayer.on('timeupdate', () => {
      if (player.value.dplayer?.video) {
        const duration = player.value.dplayer.video.duration || 0; // 会获取到NaN
        const currentTime = player.value.dplayer.video.currentTime;
        onTimeUpdate(currentTime, duration);
      };
    });
  }
};

// 获取是否追剧
const getBinge = async () => {
  const { id } = ext.value.site;
  const { vod_id } = info.value;
  const res = await detailStar({ relateId: id, videoId: vod_id });
  isVisible.binge = !res;
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
        videoRemarks: info.value.vod_remarks
      };
      if (!db) {
        await addStar(doc);
      }
    } else {
      await delStar(db.id);
    }

    isVisible.binge = !isVisible.binge;
  } catch (error) {
    console.info(error);
    MessagePlugin.error(t('pages.player.message.error'));
  }
};

// 选集排序
const reverseOrderEvent = () => {
  reverseOrder.value = !reverseOrder.value;
  if (reverseOrder.value) {
    console.log('[play][season]positive order');
    season.value = JSON.parse(JSON.stringify(info.value.fullList));
  } else {
    console.log('[play][season]reverse order');
    season.value = _.mapValues(season.value, list => _.reverse([...list]));
  }
};

// 推荐刷新数据
const recommendEvent = async (item) => {
  const { id } = ext.value.site;

  if (!('vod_play_from' in item && 'vod_play_url' in item)) {
    const [detailItem] = await fetchFilmDetail(id, item.vod_id);
    item = detailItem;
  };

  info.value = item;
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
    data: { info: item, ext: ext.value }
  });

  initPlayer();
};

// 更新历史跳过参数
const skipTimeInEndChange = () => {
  putHistoryData();
};

// 更新跳过开关全局存储
const updateLocalPlayer = async (item) => {
  await store.updateConfig({
    // @ts-ignore
    setting: { skipStartEnd: item },
  });

  await setDefault("skipStartEnd", item);
};

// 分享
const shareEvent = () => {
  const sourceUrl = 'https://web.zyplayer.fun/?url=';
  let name;

  if (type.value === 'film') name = `${info.value["vod_name"]} ${formatIndex(active.filmIndex).index}`;
  else name = info.value["name"];

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
    current: tmp.url
  };
  isVisible.download = true;
};

// 初始化iptv
const initIptvPlayer = async () => {
  if (data.value.ext["epg"]) getEpgList(ext.value["epg"], info.value["name"], moment().format('YYYY-MM-DD'));
  tmp.url = info.value["url"];

  createPlayer(tmp.url);
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
    data: { info: item, ext: ext.value }
  });
  info.value = item;
  tmp.url = info.value["url"];
  createPlayer(tmp.url);
};

// 生成台标
const generateLogo = (item) => {
  let url = item.logo;
  if (ext.value.logo) {
    url = `${ext.value.logo}${item.name}.png`;
  };
  return url;
}

// 初始化网盘
const initCloudPlayer = async () => {
  driveDataList.value = ext.value["files"];
  tmp.url = info.value["url"];
  createPlayer(tmp.url);
};

const spiderInit = async () => {
  if (!spider.value) spider.value = __jsEvalReturn();
  await spider.value.init({
    skey: 'siteKey',
    ext: [
      { ...ext.value.site }
    ],
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
        vod_pic: res.thumb
      }
    },
  });
  info.value = res;
  tmp.url = info.value["url"];
  createPlayer(tmp.url);
  // await initPlayer();
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
            height: calc(100vh - 56px);
          }
        }
      }

      .subject {
        width: 100%;
      }

      .subject:hover~.dock-show {
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
            box-shadow: 0 2px 16px 0 rgba(0, 0, 0, .16);
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
                width: 41px;
                font-size: 18px;
                height: 41px;
                line-height: 41px;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                margin-bottom: 4px;
                margin-right: 4px;
                box-shadow: 0 2px 8px 0 rgba(0, 0, 0, .08);

                &:hover {
                  background-image: linear-gradient(var(--td-brand-color-2), var(--td-brand-color-3));
                }

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
