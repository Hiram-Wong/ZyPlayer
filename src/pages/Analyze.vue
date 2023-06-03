<template>
  <div class="analysis-container">
    <div class="analysis-header">
      <div class="analysis-header-left">
        <span class="play_title" @dblclick="showSupportEvent" @click="openCurrentUrl">
          {{ urlTitle ? urlTitle : '暂无播放内容' }}
        </span>
      </div>
      <div class="analysis-header-right">
        <div v-if="miniOptions.isMini" class="analysis-flex">
          <div class="mini-box" @click="platformPlayMax">
            <div class="mini-box-title-warp">
              <span class="mini-box-title">{{ miniOptions.miniTitle }}</span>
            </div>
            <div class="mini-box-close" @click.stop="platformPlayClose">
              <close-icon size="smll" class="close" />
            </div>
          </div>
        </div>
        <div
          v-if="isSupport && quickSearchType !== 'platform'"
          class="analysis-header-item analysis-header-popup"
          @click="isSearchDialog = true"
        >
          <search-icon size="1.3rem" />
        </div>
        <div class="analysis-header-item analysis-header-popup" @click="isHistoryVisible = true">
          <history-icon size="1.3rem" />
        </div>
      </div>
    </div>
    <div class="analysis-play">
      <iframe
        ref="iframeRef"
        :key="key"
        class="analysis-play-box"
        :class="isSupport && quickSearchType !== 'search' ? 'analysis-play-box-hidden' : 'analysis-play-box-show'"
        :src="iframeUrl"
        allowtransparency="true"
        frameborder="0"
        framespacing="0"
        scrolling="no"
        allowfullscreen="true"
      ></iframe>
      <div class="analysis-setting">
        <div class="analysis-setting-group">
          <t-select v-model="selectAnalysisApi" placeholder="请选择接口" size="large" class="select-api">
            <t-option v-for="item in analysisApi" :key="item.id" :label="item.name" :value="item.id" />
          </t-select>
          <t-input v-model="analysisUrl" class="input-url" placeholder="请输入url链接" size="large" />
          <t-button class="analysis-play" size="large" @click="analysisEvent">
            <p class="analysis-tip">解析</p>
          </t-button>
        </div>
      </div>
    </div>
    <div v-if="isSupport && quickSearchType !== 'search'">
      <dialog-platform-view class="dialog-search-view" @open-platform="openPlatform" />
    </div>
    <dialog-iframem-view
      v-model:visible="formDialogVisiblePlatformAnalysis"
      :data="platformAnalysisData"
      @platform-play="platformPlay"
      @platform-play-status="platformPlayStatus"
    />
    <dialog-search-view v-model:visible="isSearchDialog" class="dialog-search-view" @open-platform="openPlatform" />
    <dialog-history-view v-model:visible="isHistoryVisible" @history-play="historyPlayEvent" />
  </div>
</template>
<script setup lang="ts">
// TODO：JXU1NzI4JXU2NzJDJXU0RTFBJXU2NDFDJXU3RDIyc2hvd1N1cHBvcnRFdmVudCV1RkYwQyV1NjdFNSV1NzcwQiV1NjcyQyV1NjVCOSV1NkNENSV1NzY4NCV1ODlFNiV1NTNEMSV1N0M3QiV1NTc4Qg==

import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import moment from 'moment';
import { CloseIcon, HistoryIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

import { analyze, analyzeHistory, setting } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

import DialogHistoryView from './analysis/DialogHistory.vue';
import DialogIframemView from './analysis/DialogIframe.vue';
import DialogPlatformView from './analysis/DialogPlatform.vue';
import DialogSearchView from './analysis/DialogSearch.vue';

const formDialogVisiblePlatformAnalysis = ref(false);
const platformAnalysisData = ref();
const isSupport = ref(false);
const quickSearchType = ref('platform');
const urlTitle = ref(''); // 播放地址的标题
const analysisApi = ref([]); // 解析接口api列表
const selectAnalysisApi = ref(null); // 选择的解析接口
const analysisUrl = ref(null); // 输入需要解析地址
const iframeUrl = ref(null); // 解析接口+需解析的地址
const iframeRef = ref(null); // iframe dom节点
const key = new Date().getTime(); // 解决iframe不刷新问题

const isHistoryVisible = ref(false);
const isSearchDialog = ref(false);

const miniOptions = ref({
  isMini: false,
  miniUrl: '',
  miniTitle: '',
});

const baseSettingEmitReload = useEventBus('base-setting-reload');

onMounted(async () => {
  await getAnalysisApi();
});

// 获取解析接口及默认接口
const getAnalysisApi = async () => {
  const [allRes, defaultAnalyzeRes, analyzeSupportRes, analyzeQuickSearchTypeRes] = await Promise.all([
    analyze.all(),
    setting.get('defaultAnalyze'),
    setting.get('analyzeSupport'),
    setting.get('analyzeQuickSearchType'),
  ]);

  analysisApi.value = allRes.filter((item) => item.isActive);
  selectAnalysisApi.value = defaultAnalyzeRes;
  isSupport.value = analyzeSupportRes;
  quickSearchType.value = analyzeQuickSearchTypeRes;
};

// 解析函数抽离
const getVideoInfo = async () => {
  if (!selectAnalysisApi.value || !analysisUrl.value) {
    MessagePlugin.error('请选择解析接口或输入需要解析的地址');
    return;
  }

  const api = _.find(analysisApi.value, { id: selectAnalysisApi.value });
  if (!api) {
    MessagePlugin.error('无效的解析接口');
    return;
  }

  const url = `${api?.url}${analysisUrl.value}`;
  urlTitle.value = await zy.getAnalysizeTitle(analysisUrl.value);
  MessagePlugin.info('正在加载当前视频，如遇解析失败请切换线路!');

  const res = await analyzeHistory.find({ analyzeId: selectAnalysisApi.value, videoUrl: analysisUrl.value });
  if (res) await analyzeHistory.update(res.id, { date: moment().format('YYYY-MM-DD') });
  else {
    const doc = {
      date: moment().format('YYYY-MM-DD'),
      analyzeId: selectAnalysisApi.value,
      videoUrl: analysisUrl.value,
      videoName: urlTitle.value,
    };
    await analyzeHistory.add(doc);
  }

  return url;
};

// 直接解析
const analysisEvent = async () => {
  const url = await getVideoInfo();
  if (url) {
    iframeUrl.value = url;
  }
};

// 平台回掉解析
const platformPlay = async (item) => {
  analysisUrl.value = item;
  const url = await getVideoInfo();
  if (url) {
    iframeUrl.value = url;
  }
};

// 历史解析
const historyPlayEvent = async (item) => {
  const api = _.find(analysisApi.value, { id: item.analyzeId });
  if (!api) {
    MessagePlugin.error('该历史记录解析接口已删除');
    return;
  }

  urlTitle.value = item.videoName;
  analysisUrl.value = item.videoUrl;
  iframeUrl.value = `${api?.url}${item.videoUrl}`;
  await analyzeHistory.update(item.id, { date: moment().format('YYYY-MM-DD') });
  MessagePlugin.info('正在加载当前视频，如遇解析失败请切换线路!');
};

// 显示支持平台
const showSupportEvent = async () => {
  isSupport.value = !isSupport.value;
  await setting.update({ analyzeSupport: isSupport.value });
  baseSettingEmitReload.emit('base-setting-reload');
};

// 打开平台iframe
const openPlatform = (item) => {
  const { name, url } = item;
  platformAnalysisData.value = { name, url };
  console.log(platformAnalysisData.value);
  formDialogVisiblePlatformAnalysis.value = true;
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

// 监听设置默认源变更
const eventBus = useEventBus('analyze-reload');
eventBus.on(async () => {
  getAnalysisApi();
});

const platformPlayStatus = (status, url, title) => {
  miniOptions.value.isMini = status;
  miniOptions.value.miniUrl = url;
  miniOptions.value.miniTitle = title;
};

const platformPlayMax = () => {
  const { miniUrl, miniTitle } = miniOptions.value;
  openPlatform({
    url: miniUrl,
    name: miniTitle,
  });
};

const platformPlayClose = () => {
  miniOptions.value.isMini = false;
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.analysis-container {
  width: 100%;
  height: calc(100vh - var(--td-comp-size-l));

  .analysis-header {
    line-height: 42px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    .analysis-header-left {
      .play_title {
        cursor: pointer;
      }
    }
    .analysis-header-right {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: 100%;
    }
    .analysis-header-item {
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 5px;
      text-align: center;
      line-height: 25px;
      &:hover {
        background-color: var(--td-bg-color-component-hover);
      }
    }
    .analysis-header-popup {
      position: relative;
      user-select: none;
      font-size: 13px;
      letter-spacing: 0;
      font-weight: 400;
      margin: 0 8px;
    }
  }
  .analysis-play {
    .analysis-play-box-show {
      height: calc(100vh - 8.5rem);
    }
    .analysis-play-box-hidden {
      height: calc(100vh - 12.5rem);
    }
    .analysis-play-box {
      width: 100%;
      background: var(--td-bg-color-page) url(../assets/bg-player.jpg) no-repeat center center;
      border-radius: var(--td-radius-extraLarge);
    }
    .analysis-setting {
      &-group {
        position: relative;
        height: 40px;
        padding: 0;
        border-radius: 20px;
        background-color: var(--td-bg-input);
        display: flex;
        :deep(.t-input) {
          background-color: var(--td-bg-input);
          border: none;
          outline: none;
        }
        :deep(.t-input--focused) {
          box-shadow: none;
          color: none;
        }
        :deep(.select-api) {
          width: 10em;
          display: inline-block;
          .t-input {
            border-radius: 20px 0 0 20px;
          }
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
          .t-input:hover {
            border-color: transparent;
          }
        }
        .analysis-play {
          border-radius: 20px;
          width: 5em;
          .analysis-tip {
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

  .analysis-flex {
    margin-right: 8px;
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

:deep(.t-dialog) {
  .t-dialog__body--fullscreen {
    height: calc(100% - var(--td-comp-size-xxxl));
  }
  .t-dialog__close {
    -webkit-app-region: no-drag;
  }
}

:deep(.t-dialog--default) {
  padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-s) !important;
}
</style>
