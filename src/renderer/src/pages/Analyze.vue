<template>
  <div class="analyze view-container">
    <common-nav :title="$t('pages.analyze.name')" :list="analyzeConfig.data" :active="active.nav" @change-key="changeDefaultEvent" />
    <div class="content">
      <div class="container">
        <div class="analyze-player">
          <div class="player-bg"></div>
          <div class="head-info-section" :style="[ iframeUrl ? 'background-color: rgba(37, 37, 37, 0.78)' : '']">
            <div class="left">
              <div class="info">
                <!-- <div class="avatar mg-right"></div> -->
                <div class="title mg-right">{{ urlTitle ? urlTitle : $t('pages.analyze.noPlay') }}</div>
                <t-button shape="round" size="small" class="open mg-right" v-if="iframeUrl" @click="openCurrentUrl">{{ $t('pages.analyze.source') }}</t-button>
                <div class="share mg-right" v-if="iframeUrl" @click="shareEvent">
                  <share-popup v-model:visible="isVisible.share" :data="shareData">
                    <template #customize>
                      <share-1-icon class="icon" />
                    </template>
                  </share-popup>
                </div>
              </div>
            </div>
            <div class="right">
              <div class="action">
                <div class="history mg-left" @click="isVisible.history = true">
                  <history-icon />
                </div>
                <div class="close mg-left" v-if="iframeUrl" @click="clearWebview">
                  <close-icon />
                </div>
              </div>
            </div>
          </div>
          <iframe
            v-if="iframeUrl"
            class="webview"
            :src="iframeUrl"
            allowtransparency="true"
            frameborder="0"
            scrolling="no"
            allowfullscreen="true"
            webkit-playsinline
            playsinline
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          ></iframe>
          <!-- <webview class="webview" v-if="iframeUrl" :src="iframeUrl" disablewebsecurity allowfullscreen/> -->
        </div>
        <div class="analyze-setting">
          <div class="analyze-setting-group">
            <t-input
              v-model="analysisUrl"
              class="input-url"
              :placeholder="$t('pages.analyze.inputUrl')"
              size="large"
              @change="formatUrlEvent"
            />
            <div class="analyze-bottom-group">
              <div class="popover" @click="isVisible.search = true">
                <app-icon size="1.3rem" class="popover-icon"/>
              </div>
            </div>
            <t-button class="analyze-play" size="large" @click="analysisEvent">
              <p class="analyze-tip">{{ $t('pages.analyze.play') }}</p>
            </t-button>
          </div>
        </div>
      </div>
    </div>
    <dialog-iframem-view
      v-model:visible="isVisible.platform"
      :data="platformData"
      @platform-play="platformPlay"
    />
    <dialog-search-view v-model:visible="isVisible.search" class="dialog-search-view" @open-platform="openPlatform" />
    <dialog-history-view v-model:visible="isVisible.history" @history-play="historyPlayEvent" />
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import moment from 'moment';
import { Share1Icon, CloseIcon, HistoryIcon, AppIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive } from 'vue';

import { t } from '@/locales';

import { getUrlTitle } from '@/utils/analyze';
import { fetchAnalyzeActive } from '@/api/analyze';
import { updateHistory, addHistory, detailHistory } from '@/api/history';

import DialogHistoryView from './analyze/DialogHistory.vue';
import DialogIframemView from './analyze/DialogIframe.vue';
import DialogSearchView from './analyze/DialogSearch.vue';
import SharePopup from '../components/share-popup/index.vue';
import CommonNav from '../components/common-nav/index.vue';

const urlTitle = ref(''); // 播放地址的标题
const analysisUrl = ref(null); // 输入需要解析地址
const iframeUrl = ref(''); // 解析接口+需解析的地址

const shareData = ref({
  name: '',
  url: '',
  provider: '',
});

const platformData = ref({
  name: '',
  url:''
});

const analyzeConfig = ref({
  default: {
    id: '',
    name: ''
  },
  data: []
})

const active = ref({
  nav: '',
})

const isVisible = reactive({
  platform: false,
  history: false,
  search: false,
  share: false
});

onMounted(() => {
  getSetting();
});

// 获取解析接口及默认接口
const getSetting = async () => {
  try {
    const data = await fetchAnalyzeActive();
    if (_.has(data, 'default') && !_.isEmpty(data["default"])) {
      analyzeConfig.value.default = data["default"];
      active.value.nav = data["default"]["id"];
    }
    if (_.has(data, 'data') && !_.isEmpty(data["data"])) {
      analyzeConfig.value.data = data["data"];
    }
  } catch (err) {
    console.log(err)
  }
};

// 格式化 url 公共方法
const formatUrlMethod = (url) => {
  return url.split('?')[0];
};

// 解析函数公共方法
const getVideoInfo = async (url, title) => {
  if (!active.value.nav || !analysisUrl.value) {
    MessagePlugin.error(t('pages.analyze.message.empty'));
    return;
  }

  const api = _.find(analyzeConfig.value.data, { id: active.value.nav });
  if (!api) {
    MessagePlugin.error(t('pages.analyze.message.invalidApi'));
    return;
  }

  urlTitle.value = title;
  MessagePlugin.info(t('pages.analyze.message.info'));

  const res = await detailHistory({ relateId: active.value.nav, videoUrl: url });

  if (res) updateHistory(res.id, { date: moment().unix() });
  else {
    const doc = {
      date: moment().unix(),
      relateId: active.value.nav,
      videoUrl: url,
      videoName: urlTitle.value,
      type: "analyze"
    };
    addHistory(doc);
  }

  const iframeurl = `${api?.url}${url}`;
  iframeUrl.value = iframeurl;
};

// input 变化
const formatUrlEvent = (url) => {
  const formatUrl = formatUrlMethod(url);
  analysisUrl.value = formatUrl;
};

// 直接解析
const analysisEvent = async () => {
  const url = analysisUrl.value;
  const res = await getUrlTitle(url);
  await getVideoInfo(url, res);
};

// 平台回调解析
const platformPlay = async (url, title) => {
  const formatUrl = formatUrlMethod(url);
  analysisUrl.value = formatUrl;
  await getVideoInfo(formatUrl, title);
};

// 历史解析
const historyPlayEvent = async (item) => {
  active.value.nav = item.relateId;
  const formatUrl = formatUrlMethod(item.videoUrl);
  analysisUrl.value = formatUrl;
  await getVideoInfo(formatUrl, item.videoName);
  isVisible.history = false;
};

// 打开平台iframe
const openPlatform = (item) => {
  const { name, url } = item;
  platformData.value = { name, url };
  console.log(platformData.value);
  isVisible.platform = true;
};

// 打开当前播放地址
const openCurrentUrl = () => {
  if (analysisUrl.value) {
    openPlatform({
      url: analysisUrl.value,
      name: urlTitle.value,
    });
  }
};

const clearWebview = () => {
  iframeUrl.value = '';
  urlTitle.value = '';
}

// 监听设置默认源变更
const eventBus = useEventBus('analyze-reload');
eventBus.on(async () => {
  getSetting();
});

// 分享
const shareEvent = () => {
  isVisible.share = true;

  const provider = _.find(analyzeConfig.value.data, { id: active.value.nav });

  shareData.value = {
    name: urlTitle.value,
    url: iframeUrl.value,
    provider: provider["name"],
  };
};

// 切换源
const changeDefaultEvent = async (id) => {
  active.value.nav = id;
  if(analysisUrl.value) await getVideoInfo(analysisUrl.value, urlTitle.value);
};
</script>

<style lang="less" scoped>
.analyze {
  height: 100%;
  display: flex;
  position: relative;
  flex-direction: row;
  overflow: hidden;

  .membership-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 148px;
    border: 2px solid rgba(132, 133, 141, 0.16);
    transition: all .3s ease;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 20px;
    .member-name {
      font-size: 12px;
      margin-left: 4px;
    }
  }
  .nav-sub-tab-member-info {
    margin-top: 16px;
  }

  .no-warp {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .content {
    flex: 1;
    position: relative;
    overflow: hidden;
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
    .container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .analyze-player {
        flex: 1 1;
        border-radius: var(--td-radius-extraLarge);
        border: 5px solid var(--td-bg-color-secondarycontainer);
        height: 100%;
        width: 100%;
        position: relative;
        overflow: hidden;
        .player-bg {
          z-index: 1;
          height: 100%;
          width: 100%;
          border-radius: var(--td-radius-large);
          position: absolute;
          background: var(--td-bg-color-page) url(../assets/bg-player.jpg) center center;
        }
        .head-info-section {
          z-index: 3;
          position: relative;
          padding: 12px;
          width: 100%;
          height: 60px;
          background: transparent;
          display: flex;
          justify-content: space-between;
          border-radius: var(--td-radius-large) var(--td-radius-large) 0 0;
          .mg-right {
            margin-right: 6px;
            color: rgba(255,255,255,.9);
          }
          .mg-left {
            margin-left: 6px;
            color: rgba(255,255,255,.9);
          }
          .left {
            display: flex;
            align-items: center;
            .info {
              height: 32px;
              cursor: pointer;
              background: rgba(0,0,0,.2);
              border-radius: 33px;
              align-items: center;
              padding: 2px;
              display: flex;
              .avatar {
                width: 32px;
                height: 32px;
                img {
                  width: 100%;
                  height: 100%;
                  border: 2px solid rgba(22,24,35,.06);
                  border-radius: 50%;
                }
              }
              .title {
                padding-left: 6px;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 500;
                overflow: hidden;
                max-width: 150px;
                min-width: 64px;
              }
              .share, .close {
                height: 24px;
                width: 24px;
                display: flex;
                align-items: center;
                flex-direction: row;
                justify-content: center;
                background: rgba(255, 255, 255, 0.08);
                border-radius: var(--td-radius-circle);
                padding: 4px;
              }
            }
          }
          .right {
            display: flex;
            align-items: center;
            .action {
              height: 32px;
              cursor: pointer;
              background: rgba(0,0,0,.2);
              border-radius: 33px;
              align-items: center;
              padding: 2px 6px 2px 2px;
              display: flex;
              .history, .close {
                height: 24px;
                width: 24px;
                display: flex;
                align-items: center;
                flex-direction: row;
                justify-content: center;
                background: rgba(255, 255, 255, 0.08);
                border-radius: var(--td-radius-circle);
                padding: 4px;
              }
            }
          }
        }
        .webview {
          position: relative;
          z-index: 3;
          height: calc(100% - 60px);
          width: 100%;
        }
      }
      .analyze-setting {
        margin-top: 5px;
        &-group {
          position: relative;
          height: 40px;
          padding: 0;
          border-radius: 20px;
          background-color: var(--td-bg-content-input);
          display: flex;
          :deep(.t-input) {
            border-radius: 20px;
            background-color: var(--td-bg-content-input);
            border: none;
            outline: none;
          }
          :deep(.t-input--focused) {
            box-shadow: none;
            color: none;
          }
          :deep(.input-url) {
            overflow: visible;
            outline: none;
            background: none;
            border: 0;
            width: 100%;
            font-size: 15px;
            color: var(--td-text-color-primary);
            display: inline-block;
          }
          .analyze-bottom-group {
            display: flex;
            align-items: center;
            height: 40px;
            .popover {
              cursor: pointer;
              &:hover {
                .popover-icon {
                  opacity: 1;
                  color: var(--td-text-color-primary);
                }
              }
              &-icon {
                opacity: .6;
                margin-right: 20px;
              }
            }
          }
          .analyze-play {
            border-radius: 0 20px 20px;
            width: 5em;
            .analyze-tip {
              color: hsl(0deg 0% 0% / 60%);
              font-size: 15px;
              font-weight: 500;
              line-height: 40px;
              text-align: center;
            }
          }
        }
      }
    }
    .analyze-flex {
      .mini-box {
        border-radius: var(--td-radius-round);
        height: 31px;
        width: 140px;
        background-color: var(--td-bg-color-component);
        display: flex;
        align-items: center;
        cursor: pointer;
        &-close {
          margin-right: var(--td-comp-margin-s);
          width: 15px;
          display: flex;
          justify-content: center;
          color: var(--td-brand-color);
          svg {
            margin: 0 auto;
          }
        }
        &-title-warp {
          margin: 0 var(--td-comp-margin-xs) 0 var(--td-comp-margin-l);
          overflow: hidden;
          width: 100%;
          .mini-box-title {
            display: inline-block;
            white-space: nowrap;
            animation: marquee 10s linear infinite;
          }
          @keyframes marquee {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        }
      }
    }
  }
}


:deep(.t-dialog__ctx) {
  .t-dialog__wrap {
    overflow: hidden;
  }
  .t-dialog__position {
    padding: 0;
    flex-direction: column;
    .t-dialog--top {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      .t-dialog__body {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }
  }
}
</style>
