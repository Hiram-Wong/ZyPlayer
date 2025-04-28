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
      <header class="header" v-if="classList.length > 0">
        <div class="header-nav">
          <title-menu :list="classList" :active="active.class" @change-key="changeClassEvent" />
        </div>
      </header>
      <div class="container">
        <div class="urlbar-root">
          <div class="urlbar-control">
            <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('back')">
              <arrow-left-icon />
            </t-button>
            <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('forward')">
              <arrow-right-icon />
            </t-button>
            <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('refresh')">
              <rotate-icon />
            </t-button>
            <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('home')">
              <home-icon />
            </t-button>
          </div>
          <t-input class="urlbar-url" v-model="controlText" @enter="handleWebviewLoad"></t-input>
          <t-button variant="text" class="urlbar-play" @click="handleParse">
            {{ $t('pages.analyze.play') }}
          </t-button>
        </div>
        <div class="webview-container">
          <webview v-if="isWebviewVisible" ref="webviewRef" class="webview" src="about:blank" partition="persist:analyze" allowpopups />
        </div>
      </div>
    </div>

    <t-loading :attach="`.${prefix}-content`" size="medium" :loading="isVisible.loading" />
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, nextTick, onActivated, onMounted, ref, reactive, watch, useTemplateRef } from 'vue';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { fetchAnalyzeActive } from '@/api/analyze';
import { fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { fetchAnalyzeHelper } from '@/utils/common/film';
import emitter from '@/utils/emitter';
import { platform as ANALYZE_PLATFORM } from '@/config/analyze';

import CommonNav from '@/components/common-nav/index.vue';
import TitleMenu from '@/components/title-menu/index.vue';

const storePlayer = usePlayStore();
const searchText = ref('');
const controlText = ref<string>('');
const webviewRef = useTemplateRef<Electron.WebviewTag | null>('webviewRef');
const isWebviewVisible = ref<boolean>(true);

const classList = computed(() => {
  const platform = ANALYZE_PLATFORM.value;
  return platform.map(item => ({ type_id: item.id, type_name: item.name, }))
});
const analyzeConfig = ref<{ [key: string]: any } >({
  default: {
    id: '',
    name: '',
    type: 0
  },
  data: []
});
const isVisible = reactive({
  lazyload: false,
  loading: false
});
const active = ref({
  class: '',
  nav: '',
  platform: false,
  history: false,
  search: false,
  share: false
});

watch(
  () => active.value.search,
  (val) => {
    if (!val) emitter.emit('refreshSearchConfig');
  }
);

onMounted(() => {
  getSetting();
  initClass();
  initWebview();
});

onActivated(() => {
  ensureAnalyzeConfigListener();
  validateAndRecoverWebview();
});

const initClass = () => {
  const item = ANALYZE_PLATFORM.value[0];
  active.value.class = item.id;
  controlText.value = item.url;
};

const initWebview = () => {
  nextTick(() => {
    bindDomReady();
    handleWebviewLoad(controlText.value);
  });
};

// 全局 emit
const ensureAnalyzeConfigListener = () => {
  if (!emitter.all.get('refreshAnalyzeConfig')) {
    emitter.on('refreshAnalyzeConfig', refreshConf);
  }
};

// 验证 webview 是否挂掉
const validateAndRecoverWebview = async () => {
  if (!webviewRef.value || !controlText.value) return;

  try {
    webviewRef.value.getURL();
  } catch {
    console.warn('webview 失效，正在恢复...');
    await resetWebview();
    bindDomReady();
    nextTick(() => {
      handleWebviewLoad(controlText.value);
    });
  }
};

// 绑定 dom-ready 事件
const bindDomReady = () => {
  if (!webviewRef.value) return;

  const loadWebview = () => {
    console.log('webview dom-ready');
    webviewRef.value?.removeEventListener('dom-ready', loadWebview);
    
    // ✅ dom-ready 后直接重新加载 controlText 的内容
    if (controlText.value) {
      handleWebviewLoad(controlText.value);
    }
  };

  webviewRef.value.removeEventListener('dom-ready', loadWebview);
  webviewRef.value.addEventListener('dom-ready', loadWebview);
};

// 重置 webview
const resetWebview = async () => {
  isWebviewVisible.value = false;
  await nextTick();
  isWebviewVisible.value = true;
  await nextTick();
};

const handleWebviewLoad = async (url: string) => {
  if (!url || url === 'about:blank') return;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    try {
      parsedUrl = new URL(`http://${url}`);
      url = parsedUrl.href;
    } catch {
      console.error('Invalid URL:', url);
      return;
    }
  }

  // 限制只允许 http/https 协议
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) return;

  controlText.value = url;
  await webviewRef.value?.loadURL(url);

  const setupWebviewListeners = () => {
    const webview = webviewRef.value;
    if (!webview) return;

    const webviewRoute = (event: { url: string }) => {
      if (controlText.value === event.url) return;
      controlText.value = event.url;
      console.log('webviewRoute', event.url);
    };

    // 移除之前的监听器（避免重复注册）
    webview.removeEventListener('did-navigate-in-page', webviewRoute);
    // webview.removeEventListener('did-navigate', webviewRoute);
    webview.removeEventListener('did-redirect-navigation', webviewRoute);

    // 添加新的监听器
    webview.addEventListener('did-navigate-in-page', webviewRoute);
    // webview.addEventListener('did-navigate', webviewRoute);
    webview.addEventListener('did-redirect-navigation', webviewRoute);
  };

  const setupIpcListeners = () => {
    // 只清除 blockUrl 监听器，防止其他 ipc 消息被误删
    window.electron.ipcRenderer.removeAllListeners('blockUrl');

    window.electron.ipcRenderer.on('blockUrl', async (_, blockedUrl: string) => {
      handleWebviewLoad(blockedUrl);
    });
  };

  nextTick(() => {
    setupWebviewListeners();
    setupIpcListeners();
  });
};

// 切换分类
const changeClassEvent = (id: string) => {
  const item = ANALYZE_PLATFORM.value.find((item) => item.id === id);
  if (item) {
    active.value.class = item.id;
    controlText.value = item.url;
    handleWebviewLoad(item.url);
  }
};

// 处理 webview 控制
const handleWebviewControl = async (action: 'back'| 'forward'| 'home'| 'refresh'| 'clearHistory') => {
  const webview = webviewRef.value;
  if (!webview) return;

  // 后退
  const backEvent = async () => {
    if (webview.canGoBack()) webview.goBack();
  };

  // 前进
  const forwardEvent = () => {
    if (webview.canGoForward()) webview.goForward();
  };

  // 刷新
  const refreshEvent = () => {
    webview.reload();
  };

  // 清除浏览器导航历史记录
  const clearHistoryEvent = () => {
    webview.clearHistory();
  };

  const homeEvent = () => {
    const platform = ANALYZE_PLATFORM.value;
    const item = platform.find((item) => item.id === active.value.class);
    handleWebviewLoad(item!.url);
  };

  const method = {
    back: backEvent,
    home: homeEvent,
    forward: forwardEvent,
    refresh: refreshEvent,
    clearHistory: clearHistoryEvent,
  };

  method[action]();
};

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

const handleParse = async () => {
  const url = controlText.value;
  await playEvent(url);
};

// 格式化 url 公共方法
const handleUrlHref = (url: string) => {
  if (url.includes('youku.com')) return url;
  return url.split('?')[0];
};

const checkControlText = (url: string) => {
  if (!url) return false;
  if (/^(https?:\/\/)/.test(url) && url !== 'about:blank') return true;
  else false;
};

// 解析函数公共方法
const playEvent = async (url: string) => {
  isVisible.loading = true;

  try {
    // 1.判断是否为空
    if (!checkControlText(url)) {
      MessagePlugin.error(t('pages.analyze.message.empty'));
      return;
    };

    // 2.获取解析接口信息
    const site = analyzeConfig.value.default;
    if (!site?.url) {
      MessagePlugin.error(t('pages.analyze.message.invalidApi'));
      return;
    };

    // 3.显示解析信息
    const title = webviewRef.value?.getTitle() || '';

    // 4.解析地址
    url = handleUrlHref(url);

    const playerMode = storePlayer.getSetting.playerMode;
    if (playerMode.type === 'custom') {
      const res = await fetchAnalyzeHelper(`${site.url}${url}`, site.type);
      if (!res.url) {
        MessagePlugin.error(t('pages.analyze.message.error'));
        return;
      };
      window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: res.url });

      // 记录播放记录
      const historyRes = await fetchHistoryData(site.key, url, ['analyze']);
      const doc = {
        date: moment().unix(),
        type: 'analyze',
        relateId: site.key,
        siteSource: '',
        playEnd: false,
        videoId: url,
        videoImage: '',
        videoName: title,
        videoIndex: `${title}$${url}`,
        watchTime: 0,
        duration: 0,
        skipTimeInStart: 0,
        skipTimeInEnd: 0,
      };

      if (historyRes.code === 0 && historyRes.status) {
        putHistoryData('put', doc, historyRes.data.id);
      } else {
        putHistoryData('add', doc, null);
      }
    } else {
      storePlayer.updateConfig({
        type: 'analyze',
        status: true,
        data: {
          info: { url, name: title },
          ext: { site, setting: storePlayer.setting },
        },
      });
      window.electron.ipcRenderer.send('open-win', { action: 'play' });
    };
  } catch (err) {
    console.error(`[analyze][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  } finally {
    isVisible.loading = false;
  }
};

const defaultConf = () => {
  active.value.nav = '';
  searchText.value = '';
  analyzeConfig.value.value.default = {};
  emitter.emit('refreshSearchConfig');
};

const refreshConf = async () => {
  console.log('[analyze][bus][refresh]');
  defaultConf();
  await getSetting();
};

const changeConf = async (id: string) => {
  console.log(`[analyze] change source: ${id}`);
  try {
    // defaultConf();
    active.value.nav = id;
    analyzeConfig.value.default = analyzeConfig.value.data.find(item => item.id === id);
    // await playEvent(controlText.value);
  } catch (err) {
  } finally {};
};

emitter.on('searchAnalyze', (kw) => {
  console.log('[analyze][bus][receive]', kw);
  if (!kw) return;


  const platform = ANALYZE_PLATFORM.value;
  const item = platform.find((item) => item.id === active.value.class);
  if (!item) return;

  const url = `${item.search}${kw}`;
  console.log(`[analyze][bus][search]`, url);
  handleWebviewLoad(url);
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
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);

    .container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--td-size-4);

      .webview-container {
        height: 100%;
        width: 100%;
        border-radius: var(--td-radius-default);
        overflow: hidden;

        .webview {
          height: 100%;
          width: 100%;

          &::-webkit-scrollbar {
            width: 8px;
            background: transparent;
          }

          &::-webkit-scrollbar-thumb {
            border-radius: 6px;
            border: 2px solid transparent;
            background-clip: content-box;
            background-color: var(--td-scrollbar-color);
          }
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

.urlbar-root {
  display: flex;
  gap: var(--td-comp-margin-s);

  .urlbar-control {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: var(--td-bg-content-input-2);
    border-radius: var(--td-radius-default);
    height: 100%;
    width: 100px;
    padding: 0 var(--td-comp-paddingLR-s);

    :deep(.t-button) {
      &:not(.t-is-disabled):not(.t-button--ghost) {
        --ripple-color: transparent;
      }
    }

    :deep(.t-button__text) {
      svg {
        color: var(--td-text-color-placeholder);
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

  .urlbar-url {
    :deep(.t-input) {
      background-color: var(--td-bg-content-input-2) !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }
  }

  .urlbar-play {
    background-color: var(--td-bg-content-input-2);
    --ripple-color: transparent;
    color: var(--td-text-color-placeholder);

    &:hover {
      color: var(--td-primary-color);
    }
  }
}
</style>
