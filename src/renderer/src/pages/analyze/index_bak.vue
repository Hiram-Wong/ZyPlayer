<template>
  <div class="analyze view-container">
    <common-nav
      :title="$t('pages.analyze.name')"
      :list="analyzeConfig.data"
      :active="active.nav"
      search
      @change-key="changeConf"
    />

    <div class="content">
      <div class="container">
        <div class="analyze-player">
          <div class="head-info-section">
            <div class="left">
              <div class="info">
                <div class="title mg-right">{{ urlTitle ? urlTitle : $t('pages.analyze.noPlay') }}</div>
                <t-button shape="round" size="small" class="open mg-right" v-if="playFormData.url" @click="openCurrentUrl">
                  {{ $t('pages.analyze.source') }}</t-button>
                <div class="share mg-right" v-if="playFormData.url" @click="shareEvent">
                  <share-popup v-model:visible="active.share" :data="shareFromData">
                    <template #customize>
                      <share1-icon class="icon" />
                    </template>
                  </share-popup>
                </div>
              </div>
            </div>
            <div class="right">
              <div class="action">
                <div class="history mg-left" @click="active.history = true">
                  <history-icon />
                </div>
                <div class="close mg-left" v-if="playFormData.url" @click="clearContent">
                  <close-icon />
                </div>
              </div>
            </div>
          </div>
          <div class="player-content">
            <multi-player ref="playerRef" />
          </div>
        </div>
        <div class="analyze-setting">
          <div class="analyze-setting-group">
            <t-input v-model="analyzeUrl" class="input-url" :placeholder="$t('pages.analyze.inputUrl')" size="large"
              @change="formatUrlEvent" @enter="analyzeEvent" />
            <t-button class="analyze-play" size="large" @click="analyzeEvent">
              <p class="analyze-tip">{{ $t('pages.analyze.play') }}</p>
            </t-button>
          </div>
        </div>
      </div>
    </div>
    <dialog-iframem-view v-model:visible="active.platform" :data="platFormData" @platform-play="platformPlay" />
    <dialog-search-view v-model:visible="active.search"  :kw="searchText" class="dialog-search-view" @open-platform="openPlatform" />
    <dialog-history-view v-model:visible="active.history" @history-play="historyPlayEvent" />
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { Share1Icon, CloseIcon, HistoryIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onActivated, onMounted, ref, watch, useTemplateRef } from 'vue';

import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { fetchAnalyzeActive, fetchAnalyzeTitle } from '@/api/analyze';
import { putHistory, addHistory, findHistory } from '@/api/history';
import { fetchAnalyzeHelper } from '@/utils/common/film';
import emitter from '@/utils/emitter';

import { MultiPlayer } from '@/components/player';
import DialogHistoryView from './components/DialogHistory.vue';
import DialogIframemView from './components/DialogIframe.vue';
import DialogSearchView from './components/DialogSearch.vue';
import SharePopup from '@/components/share-popup/index.vue';
import CommonNav from '@/components/common-nav/index.vue';

const storePlayer = usePlayStore();
const searchText = ref('');
const urlTitle = ref(''); // 播放地址的标题
const analyzeUrl = ref<string>(''); // 输入需要解析地址
const playerRef = useTemplateRef('playerRef');
const shareFromData = ref({
  name: '',
  url: '',
  provider: '',
});
const platFormData = ref({
  name: '',
  url: ''
});
const playFormData = ref({
  url: '',
  isLive: false,
  headers: {},
  type: '',
  container: 'analyze-mse'
});
const analyzeConfig = ref<{ [key: string]: any } >({
  default: {
    id: '',
    name: '',
    type: 0
  },
  data: []
});
const active = ref({
  nav: '',
  platform: false,
  history: false,
  search: false,
  share: false
});

onMounted(() => {
  getSetting();
});

onActivated(() => {
  const isListenedRefreshAnalyzeConfig = emitter.all.get('refreshAnalyzeConfig');
  if (!isListenedRefreshAnalyzeConfig) emitter.on('refreshAnalyzeConfig', refreshConf);
});

watch(
  () => active.value.search,
  (val) => {
    if (!val) emitter.emit('refreshSearchConfig');
  }
);

// 获取解析接口及默认接口
const getSetting = async () => {
  try {
    const data = await fetchAnalyzeActive();
    if (data.hasOwnProperty('default')) {
      analyzeConfig.value.default = data["default"];
      active.value.nav = data["default"]["id"];
    }
    if (data.hasOwnProperty('data')) {
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
const getVideoInfo = async (url: string, title: string) => {
  await defaultPlay();
  // 1.判断是否为空
  if (!(active.value.nav && analyzeUrl.value)) {
    MessagePlugin.error(t('pages.analyze.message.empty'));
    return;
  };

  // 2.获取解析接口信息
  const api = analyzeConfig.value.data.find(item => item.id === active.value.nav);
  if (!api) {
    MessagePlugin.error(t('pages.analyze.message.invalidApi'));
    return;
  };

  // 3.显示解析信息
  urlTitle.value = title;
  MessagePlugin.info(t('pages.analyze.message.info'));

  // 4.解析地址
  const analyzeRes = await fetchAnalyzeHelper(`${api.url}${url}`, api.type);
  if (!analyzeRes.url) {
    MessagePlugin.error(t('pages.analyze.message.error'));
    return;
  };
  playFormData.value.type = analyzeRes.mediaType;
  playFormData.value.url = analyzeRes.url;
  playFormData.value.headers = analyzeRes.headers;
  const playerMode = storePlayer.setting.playerMode;
  if (playerMode.type === 'custom') {
    window.electron.ipcRenderer.send('call-player', { path: playerMode.external, url: playFormData.value.url });
  } else {
    if (playerRef.value) {
      await playerRef.value.create(playFormData.value, playerMode.type);
    };
  }

  // 5.记录播放记录
  const res = await findHistory({ relateId: active.value.nav, videoId: url });

  if (res) putHistory({
    ids: [res.id],
    doc: { date: moment().unix() }
  });
  else {
    const doc = {
      date: moment().unix(),
      relateId: active.value.nav,
      videoId: url,
      videoName: urlTitle.value,
      type: "analyze"
    };
    addHistory(doc);
  }
};

// input 变化
const formatUrlEvent = (url: string) => {
  const formatUrl = formatUrlMethod(url);
  analyzeUrl.value = formatUrl;
};

// 直接解析
const analyzeEvent = async () => {
  if (!(active.value.nav && analyzeUrl.value)) {
    MessagePlugin.error(t('pages.analyze.message.empty'));
    return;
  };
  const url = analyzeUrl.value!;
  const res = (await fetchAnalyzeTitle(url))?.title;
  await getVideoInfo(url!, res);
};

// 平台回调解析
const platformPlay = async (url: string, title: string) => {
  const formatUrl = formatUrlMethod(url);
  analyzeUrl.value = formatUrl;
  await getVideoInfo(formatUrl, title);
};

// 历史解析
const historyPlayEvent = async (item) => {
  active.value.nav = item.relateId;
  const formatUrl = formatUrlMethod(item.videoId);
  analyzeUrl.value = formatUrl;
  await getVideoInfo(formatUrl, item.videoName);
  active.value.history = false;
};

// 打开平台iframe
const openPlatform = (item) => {
  console.log('[analyze] search keyword', item);
  const { name, url } = item;
  platFormData.value = { name, url };
  active.value.search = false;
  active.value.platform = true;
};

// 打开当前播放地址
const openCurrentUrl = () => {
  if (analyzeUrl.value) {
    openPlatform({
      url: analyzeUrl.value,
      name: urlTitle.value,
    });
  }
};

// 分享
const shareEvent = () => {
  const provider = analyzeConfig.value.data.find(item => item.id === active.value.nav);
  if (Object.keys(provider).length === 0) return;
  shareFromData.value = {
    name: urlTitle.value,
    url: playFormData.value.url,
    provider: provider["name"],
  };
  active.value.share = true;
};

const defaultPlay = async () => {
  urlTitle.value = '';
  playFormData.value = { ...playFormData.value, ...{ url: '', headers: {}, type: ''} }
};

const clearContent = async ()=> {
  defaultPlay();
  analyzeUrl.value = '';
  if (playerRef.value) await playerRef.value.destroy();
};

const defaultConf = ()=>{
  active.value.nav = '';
  searchText.value = '';
  emitter.emit('refreshSearchConfig');
};

const refreshConf = () => {
  console.log('[analyze][bus][refresh]');
  defaultConf();
  analyzeConfig.value = {
    default: {
      id: '',
      name: '',
      type: 0
    },
    data: []
  };
  getSetting();
};

const changeConf = async (id: string) => {
  console.log(`[analyze] change source: ${id}`);
  defaultConf();
  active.value.nav = id;
  if (analyzeUrl.value) await getVideoInfo(analyzeUrl.value, urlTitle.value);
};

emitter.on('searchAnalyze', (kw) => {
  console.log('[analyze][bus][receive]', kw);
  if (kw) {
    searchText.value = kw as string;
    active.value.search = true;
  };
});
</script>

<style lang="less" scoped>
.analyze {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;

  .content {
    // width: calc(100% - 170px);
    min-width: 750px;
    position: relative;
    padding: var(--td-pop-padding-l);
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    flex: 1;

    .container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--td-size-4);

      .analyze-player {
        flex: 1;
        border-radius: var(--td-radius-default);
        height: 100%;
        width: 100%;
        position: relative;
        overflow: hidden;

        .head-info-section {
          z-index: 4;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 12px;
          width: 100%;
          height: 60px;
          background: transparent;
          display: flex;
          justify-content: space-between;
          border-radius: var(--td-radius-large) var(--td-radius-large) 0 0;

          .mg-right {
            margin-right: 6px;
            color: rgba(255, 255, 255, .9);
          }

          .mg-left {
            margin-left: 6px;
            color: rgba(255, 255, 255, .9);
          }

          .left {
            display: flex;
            align-items: center;

            .info {
              height: 32px;
              cursor: pointer;
              background: rgba(0, 0, 0, .2);
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
                  border: 2px solid rgba(22, 24, 35, .06);
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

              .share,
              .close {
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
              background: rgba(0, 0, 0, .2);
              border-radius: 33px;
              align-items: center;
              padding: 2px 6px 2px 2px;
              display: flex;

              .history,
              .close {
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

        .player-content {
          height: 100%;
          width: 100%;
          position: relative;
          z-index: 3;
        }
      }

      .analyze-setting {
        &-group {
          position: relative;
          height: 40px;
          padding: 0;
          border-radius: var(--td-radius-default);
          background-color: var(--td-bg-content-input-2);
          display: flex;

          :deep(.t-input) {
            border-radius: 20px;
            background-color: var(--td-bg-content-input-2);
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

          .analyze-play {
            border-radius: 0 var(--td-radius-default) var(--td-radius-default) 20px;
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
