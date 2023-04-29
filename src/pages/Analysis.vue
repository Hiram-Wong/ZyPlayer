<template>
  <div class="analysis-container">
    <div class="analysis-main">
      <div class="analysis-main-header">
        <span class="play_title" @dblclick="showSupportEvent">{{ urlTitle ? urlTitle : '暂无播放内容' }}</span>
        <history-icon size="1.3rem" @click="visible = true" />
        <t-drawer v-model:visible="visible" header="历史" size="small" class="history-items">
          <div v-for="item in historyList" :key="item.id" class="" @click="historyPlayEvent(item)">
            <div class="history-item">
              <div class="date">{{ item.date }}</div>
              <t-popup :content="item.videoName" destroy-on-close>
                <div class="title">{{ item.videoName }}</div>
              </t-popup>
              <div class="clear" @click.stop="histroyDeleteEvent(item)"><clear-icon size="1rem" /></div>
            </div>
            <t-divider dashed style="margin: 5px 0" />
          </div>
          <template #footer>
            <t-button @click="histroyClearEvent">清空</t-button>
            <t-button variant="outline" @click="visible = false"> 取消 </t-button>
          </template>
          <infinite-loading style="text-align: center" :distance="200" @infinite="load">
            <template #complete>人家是有底线的</template>
            <template #error>哎呀，出了点差错</template>
          </infinite-loading>
        </t-drawer>
      </div>
      <div class="analysis-main-play">
        <iframe
          ref="iframeRef"
          :key="key"
          class="analysis-play-box"
          :class="isSupport ? 'analysis-play-box-hidden' : 'analysis-play-box-show'"
          :src="iframeUrl"
          allowtransparency="true"
          frameborder="0"
          framespacing="0"
          scrolling="no"
          allowfullscreen="true"
        ></iframe>
        <div class="analysis-setting">
          <div class="analysis-setting-group">
            <t-input-adornment>
              <template #prepend>
                <t-select v-model="selectAnalysisApi" placeholder="请选择接口" size="large" style="width: 10em">
                  <t-option v-for="item in analysisApi" :key="item.id" :label="item.name" :value="item.id" />
                </t-select>
              </template>
              <input v-model="analysisUrl" class="analysis-url" placeholder="请在此处粘贴视频网址" />
              <template #append>
                <span class="analysis-play" @click="analysisEvent">
                  <p class="analysis-tip">解析</p>
                </span>
              </template>
            </t-input-adornment>
          </div>
        </div>
      </div>
      <div v-if="isSupport" class="analysis-main-bottom">
        <div class="support-title">
          <span class="support-separator"></span>
          <p class="support-tip">
            <t-link theme="default" hover="color" @click="openCurrentUrl">
              <template #suffixIcon>
                <jump-icon style="align-items: center; display: inherit" />
              </template>
              支持平台
            </t-link>
          </p>
        </div>
        <div class="support-platform">
          <div v-for="(item, index) in VIDEOSITES" :key="index" class="logo-item" @click="openPlatform(item)">
            <div class="logo" v-html="item.img"></div>
          </div>
        </div>
      </div>
      <div v-if="miniOptions.isMini" class="analysis-main-flex">
        <div class="mini-box" @click="platformPlayMax">
          <div class="mini-box-close" @click.stop="platformPlayClose">
            <close-icon size="smll" class="close" />
          </div>
          <div class="mini-box-title-warp">
            <span class="mini-box-title">{{ miniOptions.miniTitle }}</span>
          </div>
        </div>
      </div>
    </div>
    <dialog-platform-analysis-view
      v-model:visible="formDialogVisiblePlatformAnalysis"
      :data="platformAnalysisData"
      @platform-play="platformPlay"
      @platform-play-status="platformPlayStatus"
    />
  </div>
</template>
<script setup lang="ts">
// TODO：JXU1NzI4JXU2NzJDJXU0RTFBJXU2NDFDJXU3RDIyc2hvd1N1cHBvcnRFdmVudCV1RkYwQyV1NjdFNSV1NzcwQiV1NjcyQyV1NjVCOSV1NkNENSV1NzY4NCV1ODlFNiV1NTNEMSV1N0M3QiV1NTc4Qg==
import 'v3-infinite-loading/lib/style.css';

import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import moment from 'moment';
import { ClearIcon, CloseIcon, HistoryIcon, JumpIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { onMounted, reactive, ref } from 'vue';

import PLATFORM_CONFIG from '@/config/platform';
import { analyze, analyzeHistory, setting } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

import DialogPlatformAnalysisView from './analysis/PlatformAnalysis.vue';

const formDialogVisiblePlatformAnalysis = ref(false);
const platformAnalysisData = ref();
const isSupport = ref(false);
const urlTitle = ref(''); // 播放地址的标题
const analysisApi = ref([]); // 解析接口api列表
const selectAnalysisApi = ref(null); // 选择的解析接口
const analysisUrl = ref(null); // 输入需要解析地址
const iframeUrl = ref(null); // 解析接口+需解析的地址
const iframeRef = ref(null); // iframe dom节点
const key = new Date().getTime(); // 解决iframe不刷新问题
const VIDEOSITES = reactive({
  ...PLATFORM_CONFIG.site,
}); // 视频网站列表
const visible = ref(false);
const historyList = ref([]);
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});
const miniOptions = ref({
  isMini: false,
  miniUrl: '',
  miniTitle: '',
});

onMounted(async () => {
  await getAnalysisApi();
  await getHistoryList();
});

// 获取解析接口及默认接口
const getAnalysisApi = async () => {
  const [allRes, defaultAnalyzeRes, analyzeSupportRes] = await Promise.all([
    analyze.all(),
    setting.get('defaultAnalyze'),
    setting.get('analyzeSupport'),
  ]);

  analysisApi.value = allRes.filter((item) => item.isActive);
  selectAnalysisApi.value = defaultAnalyzeRes;
  isSupport.value = analyzeSupportRes;
};

// 获取解析历史
const getHistoryList = async () => {
  const { pageIndex, pageSize } = pagination.value;
  const res = await analyzeHistory.pagination(pageIndex, pageSize);
  const { list } = res;
  historyList.value = _.unionWith(historyList.value, list, _.isEqual);

  pagination.value.count = res.total;
  pagination.value.pageIndex++;

  return _.size(res.list);
};

const load = async ($state) => {
  console.log('loading...');
  try {
    const resLength = await getHistoryList();
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.error(err);
    $state.error();
  }
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
  if (res) {
    const index = _.findIndex(historyList.value, res);
    if (index > -1) historyList.value[index].date = moment().format('YYYY-MM-DD');
    await analyzeHistory.update(res.id, { date: moment().format('YYYY-MM-DD') });
  } else {
    const doc = {
      date: moment().format('YYYY-MM-DD'),
      analyzeId: selectAnalysisApi.value,
      videoUrl: analysisUrl.value,
      videoName: urlTitle.value,
    };
    historyList.value.unshift(doc);
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
  const index = _.findIndex(historyList.value, item);
  if (index > -1) historyList.value[index].date = moment().format('YYYY-MM-DD');
  await analyzeHistory.update(item.id, { date: moment().format('YYYY-MM-DD') });
  MessagePlugin.info('正在加载当前视频，如遇解析失败请切换线路!');
};

// 历史删除
const histroyDeleteEvent = async (item) => {
  const index = historyList.value.findIndex((historyItem) => historyItem.id === item.id);
  if (index !== -1) {
    historyList.value.splice(index, 1);
    await analyzeHistory.remove(item.id);
  }
};

// 历史清空
const histroyClearEvent = async () => {
  try {
    await analyzeHistory.clear();
    historyList.value = [];
    MessagePlugin.success('sucess');
  } catch (err) {
    console.error(err);
    MessagePlugin.error('failed');
  }
};

// 显示支持平台
const showSupportEvent = async () => {
  isSupport.value = !isSupport.value;
  await setting.update({ analyzeSupport: isSupport.value });
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
  .analysis-main {
    .analysis-main-header {
      line-height: 42px;
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .play_title {
        cursor: pointer;
      }
      svg {
        cursor: pointer;
      }
      .history-items {
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          white-space: nowrap;
          font-weight: 500;
          cursor: pointer;
        }
        .date {
          width: 85px;
        }
        .title {
          padding: 0 10px;
          flex: 1 1 auto;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .analysis-main-play {
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
          background-color: var(--td-bg-color-page);
          :deep(.t-input-adornment__prepend) {
            border-radius: 20px 0 0 20px;
            background-color: rgba(0, 0, 0, 0);
            .t-input {
              border: none;
              outline: none;
            }
            .t-input--focused {
              box-shadow: none;
              color: none;
            }
          }
          .analysis-url {
            overflow: visible;
            outline: none;
            background: none;
            border: 0;
            width: 100%;
            font-size: 15px;
            line-height: 40px;
            color: var(--td-text-color-primary);
          }
          :deep(.t-input-adornment__append) {
            background: linear-gradient(90deg, var(--td-brand-color-4), var(--td-brand-color));
            border-radius: 20px;
            .analysis-play {
              cursor: pointer;
              display: inline-block;
              width: 82px;
              .analysis-tip {
                display: block;
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
    .analysis-main-bottom {
      .support-title {
        margin: 5px 0;
        .support-separator {
          border: 0.1rem solid var(--td-brand-color);
          height: 0.6rem;
          border-radius: var(--td-radius-default);
          display: inline-block;
        }
        .support-tip {
          margin-left: 5px;
          display: inline-block;
          text-align: left;
          a {
            font-weight: 500;
          }
        }
      }
      .support-platform {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
      }
      .logo-item {
        cursor: pointer;
        margin-right: 8px;
        padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s) var(--td-comp-paddingTB-m);
        border-radius: var(--td-radius-medium);
        background-color: var(--td-bg-color-page);

        .logo {
          width: 70px;
          height: 15px;
        }
      }
    }
    .analysis-main-flex {
      bottom: 10px;
      right: 5px;
      position: fixed;
      .mini-box {
        border-radius: var(--td-radius-round);
        height: 31px;
        width: 140px;
        background-color: var(--td-bg-color-component);
        display: flex;
        align-items: center;
        cursor: pointer;
        &-close {
          margin-left: var(--td-comp-margin-s);
          width: 15px;
          display: flex;
          justify-content: center;
          color: var(--td-brand-color);
          svg {
            margin: 0 auto;
          }
        }
        &-title-warp {
          margin: 0 var(--td-comp-margin-l) 0 var(--td-comp-margin-xs);
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

:deep(.t-dialog) {
  .t-dialog__body--fullscreen {
    height: calc(100% - var(--td-comp-size-xxxl));
  }
  .t-dialog__close {
    -webkit-app-region: no-drag;
  }
}
</style>
