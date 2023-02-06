<template>
  <div class="container mx-auto">
    <div class="container-header">
      <div class="player-top">
        <div
          class="player-top-left"
          :style="{ 'padding-left': platform === 'darwin' ? '50px' : '10px' }"
          @click="openMainWinEvent"
        >
          <div class="open-main-win">
            <home-icon size="1.5em" />
            <span style="vertical-align: middle">打开主界面</span>
          </div>
        </div>
        <div class="player-top-spacer">
          <span v-if="type === 'film'">{{ `${data.title}  ${data.index}` }}</span>
          <span v-else>{{ data.title }}</span>
        </div>
        <div class="player-top-right">
          <div v-if="type === 'film'" class="player-top-popup player-top-item" @click="bingeEvnet">
            <heart-icon v-if="isBinge" size="1.5em" />
            <heart-filled-icon v-else size="1.5em" />
          </div>
          <div class="player-top-popup player-top-item player-top-share">
            <t-popup
              placement="bottom-right"
              :overlay-inner-style="{ background: '#2a2a31', boxShadow: 'none' }"
              attach=".player-top-share"
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
                        <div v-if="type === 'film'" class="bottom-title">{{ `${data.title}  ${data.index}` }}</div>
                        <div v-else class="bottom-title">{{ data.title }}</div>
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
                    <span class="bottom-copy-btn" @click="copyEvent">复制地址</span>
                  </div>
                </div>
              </template>
            </t-popup>
          </div>
          <!-- <div class="player-top-popup player-top-item" @click="downloadEvent" v-if="type === 'film'">
            <DownloadIcon size="1.5em"/>
          </div> -->
          <div v-if="!isMax" class="player-top-popup player-top-item" @click="showEpisode = !showEpisode">
            <relativity-icon size="1.5em" />
          </div>
          <div class="player-top-popup player-top-item" @click="winStickyEvnet">
            <pin-icon v-if="isPin" size="1.5em" />
            <pin-filled-icon v-else size="1.5em" />
          </div>
          <div class="player-top-popup player-top-item player-top-tip">
            <t-popup
              placement="bottom-right"
              content="请勿相信视频中的广告,资源均来自互联网，谨防上当受骗!"
              :overlay-inner-style="{ background: '#2a2a31', color: '#fdfdfd', boxShadow: 'none' }"
              attach=".player-top-tip"
            >
              <tips-icon size="1.5em" />
            </t-popup>
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
                <p class="title">{{ data.title }}</p>
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
              <div class="film-wrap-title">
                <p class="title">{{ data.title }}</p>
              </div>
              <div class="film-wrap-info">
                <p class="info">选集</p>
              </div>
              <div class="film-scroll">
                <t-tabs v-model="selectPlayableSource" class="film-tabs">
                  <t-tab-panel v-for="(value, key, index) in data.seasons" :key="index" :value="key" :label="key">
                    <div style="padding-top: 25px">
                      <t-space break-line size="small" align="center">
                        <t-tag
                          v-for="item in value"
                          :key="item"
                          class="tag"
                          :class="{ select: formatName(item) === data.index && data.source === key }"
                          @click="gotoPlay(item)"
                        >
                          {{ formatName(item) }}
                        </t-tag>
                      </t-space>
                    </div>
                  </t-tab-panel>
                </t-tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, onDeactivated } from 'vue';

import { MessagePlugin } from 'tdesign-vue-next';
import {
  HomeIcon,
  HeartIcon,
  PhotoIcon,
  HeartFilledIcon,
  ShareIcon,
  // DownloadIcon,
  RelativityIcon,
  PinIcon,
  PinFilledIcon,
  TipsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'tdesign-icons-vue-next';
import QRCode from 'qrcode';
import useClipboard from 'vue-clipboard3';

// import Player from 'xgplayer';
import HlsJsPlayer from 'xgplayer-hls.js';
// import FlvJsPlayer from 'xgplayer-flv.js';
import zy from '@/lib/site/tools';
import { setting, history, iptv, star } from '@/lib/dexie';
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

const config = ref({
  id: 'xgplayer',
  url: 'https://live.v1.mk/aishang/cctv1hd',
  autoplay: true,
  // lastPlayTime: 10, //视频起播时间（单位：秒）
  // lastPlayTimeHideDelay: 5, //提示文字展示时长（单位：秒）
  lang: 'zh-cn',
  pip: true,
  videoInit: true, // 初始化显示视频首帧
  controlPlugins: [],
  playbackRate: [0.5, 0.75, 1, 1.5, 2],
  ignores: ['error'],
  keyShortcut: 'on',
  keyShortcutStep: {
    // 设置调整步长
    currentTime: 15, // 播放进度调整步长，默认10秒
    volume: 0.2, // 音量调整步长，默认0.1
  },
  volume: 0.5,
  width: '100%',
  height: 'calc(100vh - 45px)',
  screenShot: {
    saveImg: true,
    quality: 0.92,
    type: 'image/png',
    format: '.png',
  },
}); // 西瓜播放器参数

const PlaySetting = ref({
  pauseWhenMinimize: false,
}); // 是否启用最小化暂停
const selectPlayableSource = ref(data.value.source); // 选择的播放源
const xg = ref(null); // 西瓜播放器
const showEpisode = ref(false); // 是否显示右侧栏
const epgData = ref(); // epg数据
const timer = ref(); // 定时器 用于刷新历史进度
const isBinge = ref(true); // true未收藏 false收藏
const isPin = ref(true); // true未置顶 false置顶
const qrCodeUrl = ref(); // 二维码图片流
const iswideBtn = ref(false); // 视频划过显示按钮
const isMax = ref(false); // 视频划过显示按钮
const shareUrl = computed(() => {
  const soureUrl = 'https://hunlongyu.gitee.io/zy-player-web/?url=';
  let params = `${data.value.url}&name=${data.value.title}`;
  if (type.value === 'film') params = `${data.value.url}&name=${data.value.title}  ${data.value.index}`;
  return soureUrl + params;
}); // 分享地址

onMounted(() => {
  initSetting();
  initPlayer();
  minMaxEvent();
  wideEvent();
  getbinge();
  qrCodeImg();
});

onDeactivated(() => {
  clearInterval(timer.value);
});

const initSetting = () => {
  setting.get('shortcut').then((res) => {
    config.value.keyShortcut = res ? 'on' : 'off';
  });
  setting.get('pauseWhenMinimize').then((res) => {
    PlaySetting.value.pauseWhenMinimize = res;
  });
};

// 初始化播放器
const initPlayer = async () => {
  console.log(type.value, data.value);

  if (xg.value) xg.value.destroy(); // 存在播放器则摧毁
  if (type.value === 'iptv') {
    config.value.url = data.value.url;
    let epg;
    epg = await iptv.get(data.value.id).epg;
    if (!epg) epg = await setting.get('defaultIptvEpg');
    if (epg) {
      const date = `${new Date().getFullYear()}-${
        new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1
      }-${new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate()}`;
      epgData.value = await zy.iptvEpg(epg, data.value.title, date);
    }
    xg.value = new HlsJsPlayer(config.value);
  } else if (type.value === 'film') {
    if (!data.value.url.endsWith('m3u8')) {
      data.value.url = await zy.parserFilmUrl(data.value.url);
    }
    config.value.url = data.value.url;
    xg.value = new HlsJsPlayer(config.value);
    await timerUpdatePlayProcess();
  }
};

// 最小化暂停播放
const minMaxEvent = () => {
  win.on('minimize', () => {
    if (xg.value && xg.value.hasStart && PlaySetting.value.pauseWhenMinimize) {
      xg.value.pause();
    }
  });
  win.on('restore', () => {
    if (xg.value && xg.value.hasStart) {
      xg.value.play();
    }
  });
};

const openMainWinEvent = () => {
  ipcRenderer.send('showMainWin');
};

// 最小化暂停播放
const wideEvent = () => {
  win.on('maximize', () => {
    console.log(1);
    isMax.value = true;
  });
  win.on('restore', () => {
    console.log(2);
    isMax.value = false;
  });
};

// 定时更新播放进度
const timerUpdatePlayProcess = () => {
  timer.value = setInterval(async () => {
    const id = parseInt(data.value.historyId, 10);
    const db = await history.get(id);
    if (db) {
      const doc = { ...db };
      doc.watchTime = xg.value.currentTime;
      doc.duration = xg.value.duration;
      delete doc.id;
      await history.update(db.id, doc);
    }
    console.log(timer.value);
  }, 10000);
};

// 在追
const bingeEvnet = async () => {
  isBinge.value = !isBinge.value;
  const { key, id, img, name } = data.value;
  const db = await star.find({ siteKey: key, videoId: id });
  console.log(db);
  if (!isBinge.value) {
    const doc = {
      siteKey: key,
      videoId: id,
      videoImage: img,
      videoName: name,
    };
    console.log(doc);
    if (!db) {
      star
        .add(doc)
        .then((res) => {
          console.log(res);
          MessagePlugin.success('加入追剧列表');
        })
        .catch((error) => {
          MessagePlugin.error(`加入追剧列表失败:${error}`);
        });
    }
  } else {
    star.remove(db.id);
    MessagePlugin.warning('移除追剧列表');
  }
};

// 获取是否追剧
const getbinge = async () => {
  const { key, id } = data.value;
  await star.find({ siteKey: key, videoId: id }).then((res) => {
    if (res) {
      isBinge.value = false;
    }
  });
};

// 过滤epg播放状态
const filterEpgStatus = (start, end) => {
  const date = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1
  }-${new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate()}`;
  const startTimestamp = new Date(`${date} ${start}`).getTime();
  const endTimestamp = new Date(`${date} ${end}`).getTime();
  const nowTimestamp = new Date().getTime();
  if (nowTimestamp > startTimestamp && nowTimestamp < endTimestamp) {
    return '正在直播';
  }
  if (nowTimestamp < endTimestamp) {
    return '未播放';
  }
  return '已播放';
};

// 格式化剧集名称
const formatName = (e, n) => {
  // console.log(e, n);
  const num = e.split('$');
  if (num.length > 1) {
    return e.split('$')[0];
  }
  return `第${n + 1}集`;
};

// 刷新播放页面
const gotoPlay = async (item) => {
  const num = item.split('$');
  const [index, url] = num;

  // 刷新历史 source index
  const doc = {
    date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
    siiteSource: selectPlayableSource.value,
    videoIndex: index,
  };
  await history.update(data.value.id, doc);

  // 刷新pinia数据
  const newStore = data.value;
  newStore.source = selectPlayableSource.value;
  newStore.url = url;
  newStore.index = index;
  store.updateConfig({
    type: 'film',
    data: newStore,
  });
  initPlayer();
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

// 复制
const copyEvent = async () => {
  const { toClipboard } = useClipboard();
  await toClipboard(shareUrl.value).then((res) => {
    if (res.text) MessagePlugin.success('复制成功');
  });
};

// 下载
// const downloadEvent = () => {};

// electron窗口置顶
const winStickyEvnet = () => {
  if (win.isAlwaysOnTop()) {
    win.setAlwaysOnTop(false);
    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'no');
    isPin.value = true;
    MessagePlugin.warning('取消置顶');
  } else {
    win.setAlwaysOnTop(true);
    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'yes');
    isPin.value = false;
    MessagePlugin.success('置顶');
  }
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';
.container {
  height: calc(100vh);
  .container-header {
    -webkit-app-region: drag;
    height: 45px;
    flex-shrink: 0;
    background: #151625;
    .player-top {
      line-height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      white-space: nowrap;
      color: #fff;
      padding: 0 15px;
      .player-top-left {
        position: relative;
        flex: 1 1 auto;
        z-index: 1200;
        white-space: normal;
        .open-main-win {
          border-radius: 10px;
        }
      }
      .player-top-spacer {
        flex: 1 1 auto;
      }
      .player-top-right {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 100%;
        .player-top-popup {
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
        .player-top-item {
          margin: 0 4px 0 16px;
          cursor: pointer;
        }
        .player-top-share {
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
      }
    }
  }
  .container-main {
    height: calc(100vh - 45px);
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
          border-radius: 5px 0 0 5px;
          background: #202225;
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
        z-index: 1;
        box-sizing: border-box;
        // overflow: hidden;
        flex-shrink: 0;
        height: 100%;
        background: #26262b;
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
              .film-tabs {
                background-color: #26262b !important;
                :deep(.t-tabs__nav-item-text-wrapper) {
                  color: rgba(255, 255, 255, 0.9) !important;
                }
                :deep(.tag) {
                  color: rgba(255, 255, 255, 0.9) !important;
                  background-color: #393939 !important;
                }
                .select {
                  color: #f09736 !important;
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
          }
        }
      }
    }
  }
}
</style>
