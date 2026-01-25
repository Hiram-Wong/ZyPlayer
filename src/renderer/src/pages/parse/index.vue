<template>
  <div class="analyze view-container">
    <common-nav :list="config.list" :active="active.nav" search class="sidebar" @change="onNavChange" />

    <div class="content">
      <div class="header">
        <div class="router-control">
          <t-button theme="default" shape="square" class="btn" @click="handleWebviewRouter('back')">
            <template #icon><chevron-left-icon /></template>
          </t-button>

          <t-button theme="default" shape="square" class="btn" @click="handleWebviewRouter('forward')">
            <template #icon><chevron-right-icon /></template>
          </t-button>

          <t-button theme="default" shape="square" class="btn" @click="handleWebviewRouter('refresh')">
            <template #icon><rotate-icon /></template>
          </t-button>
        </div>

        <div class="platform-selector">
          <t-dropdown>
            <t-button theme="default" shape="square" class="btn"><app-icon /></t-button>
            <t-dropdown-menu>
              <t-dropdown-item
                v-for="item in platform"
                :key="item.id"
                :value="item.id"
                :active="active.class === item.id"
                @click="handlePlatformChange(item.id)"
              >
                {{ $t(`pages.parse.platform.${item.id}`) }}
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </div>

        <t-input v-model="currentUrl" class="url-input" @enter="handleWebviewNavigator(currentUrl)" />

        <t-button variant="outline" class="parse-button" @click="handleParse">
          {{ $t('pages.parse.play') }}
        </t-button>
      </div>

      <div class="container">
        <div class="content-wrapper">
          <webview-view ref="webviewRef" appid="analyze" :on-navigate-callback="onNavigateCallback" />
        </div>
      </div>
    </div>

    <t-loading :attach="`.${attachContent}`" size="medium" :loading="active.loading" />
  </div>
</template>
<script setup lang="ts">
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import {
  isHttp,
  isNil,
  isObject,
  isObjectEmpty,
  isPositiveFiniteNumber,
  isStrEmpty,
  isString,
} from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import { AppIcon, ChevronLeftIcon, ChevronRightIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { getDomain } from 'tldts';
import { computed, nextTick, onActivated, onMounted, ref } from 'vue';

import { addHistory, findHistory, putHistory } from '@/api/moment';
import { fetchAnalyzeActive, fetchParse } from '@/api/parse';
import CommonNav from '@/components/common-nav/index.vue';
import WebviewView from '@/components/webview/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { attachContent } from '@/config/global';
import { china as CN_PLATFORM, outher as OUTHER_PLATFORM } from '@/config/parse';
import { t } from '@/locales';
import { usePlayerStore, useSettingStore } from '@/store';
import emitter from '@/utils/emitter';

interface IParse {
  api: string;
  name: string;
  id: string;
}

const storePlayer = usePlayerStore();
const storeSetting = useSettingStore();

const searchValue = ref('');
const currentUrl = ref('about:blank');
const webviewRef = ref<typeof WebviewView | null>(null);

const platform = computed(() => (storeSetting.isChinaMainland ? CN_PLATFORM : OUTHER_PLATFORM));

const config = ref({
  default: {} as IModels['analyze'],
  list: [] as IModels['analyze'][],
  extra: {},
});

const active = ref({
  class: '',
  nav: '',
  loading: false,
});

onMounted(() => {
  getSetting();
  initClass();
});

onActivated(() => {
  emitter.off(emitterChannel.REFRESH_PARSE_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_PARSE_CONFIG, reloadConfig);

  emitter.off(emitterChannel.SEARCH_PARSE_RECOMMEND, onSearchRecommend);
  emitter.on(emitterChannel.SEARCH_PARSE_RECOMMEND, onSearchRecommend);
});

const initClass = () => {
  const item = platform.value[0];
  active.value.class = item.id;

  handleWebviewNavigator(item.url);
};

const handlePlatformChange = (id: string) => {
  const item = platform.value.find((item) => item.id === id);

  if (!item) return;

  active.value.class = item.id;
  handleWebviewNavigator(item.url);
};

const getSetting = async () => {
  try {
    const resp = await fetchAnalyzeActive();
    if (resp?.default) {
      config.value.default = resp.default;
      active.value.nav = resp.default.id;
    }
    if (resp?.list) {
      config.value.list = resp.list;
    }
    if (resp?.extra) config.value.extra = resp.extra;
  } catch (error) {
    console.error(`Failed to get analyze config:`, error);
  }
};

const handleWebviewNavigator = (url: string) => {
  nextTick(() => webviewRef.value?.loadUrl(url));
};

const handleParse = async () => {
  const url = webviewRef.value?.getURL() || '';
  await playEvent(url);
};

const createHistoryDoc = (item: IParse, siteKey: string) => ({
  type: 3,
  relateId: siteKey,
  siteSource: '',
  playEnd: false,
  videoId: item.id,
  videoImage: '',
  videoName: item.name,
  videoIndex: `${item.name}$${item.api}`,
  watchTime: 0,
  duration: 0,
  skipTimeInStart: 0,
  skipTimeInEnd: 0,
});

const saveHistoryData = async (doc: ReturnType<typeof createHistoryDoc>, relateId: string, videoId: string) => {
  const resp = await findHistory({ relateId, videoId, type: 3 });

  const id = resp?.id;
  if (!isNil(id) && isPositiveFiniteNumber(resp.watchTime)) doc.watchTime = resp.watchTime;
  if (!isNil(id) && isPositiveFiniteNumber(resp.duration)) doc.duration = resp.duration;
  if (!isNil(id) && isPositiveFiniteNumber(resp.skipTimeInStart)) doc.skipTimeInStart = resp.skipTimeInStart;
  if (!isNil(id) && isPositiveFiniteNumber(resp.skipTimeInEnd)) doc.skipTimeInEnd = resp.skipTimeInEnd;

  isNil(id) ? await addHistory(doc) : await putHistory({ id: [id], doc });
};

const playEvent = async (url: string) => {
  active.value.loading = true;

  try {
    let api = url;
    try {
      const u = new URL(url);
      u.search = '';
      const cleanedUrl = u.href;

      if (!isHttp(api)) {
        MessagePlugin.warning(t('pages.parse.message.invalidAddress'));
        return;
      }

      api = cleanedUrl;
    } catch {
      MessagePlugin.warning(t('pages.parse.message.invalidAddress'));
      return;
    }

    const site = config.value.default;
    if (!isObject(site) || isObjectEmpty(site)) {
      MessagePlugin.warning(t('pages.parse.message.noActiveSource'));
      return;
    } else if (!isHttp((site as IModels['analyze']).api)) {
      MessagePlugin.warning(t('pages.parse.message.invalidApi'));
      return;
    }

    let name = '';
    try {
      const titleSplit = platform.value.find((item) => api.includes(item.host))?.titleSplit || null;
      name = webviewRef.value?.getTitle();
      if (isString(titleSplit) && !isStrEmpty(titleSplit)) name = name.split(titleSplit)?.[0];
      name = name.trim();
    } catch {}

    const item = {
      name,
      api,
      id: api,
    };

    const player = storePlayer.player;
    if (player.type === 'custom') {
      playWithExternalPlayer(item, site);
    } else {
      playWithInternalPlayer(item, site);
    }
  } catch (error) {
    console.error('Failed to play:', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    active.value.loading = false;
  }
};

const playWithExternalPlayer = async (item: IParse, active: IModels['analyze']) => {
  const resp = await fetchParse({ id: active.id, url: item.api });

  if (!isHttp(resp?.url)) {
    MessagePlugin.error(t('pages.parse.message.error'));
    return;
  }

  const player = storePlayer.player;

  window.electron.ipcRenderer.invoke(IPC_CHANNEL.CALL_PLAYER, player.external, resp.url);

  const historyDoc = createHistoryDoc(item, active.key);
  await saveHistoryData(historyDoc, active.key, item.id);
};

const playWithInternalPlayer = (item: IParse, active: IModels['analyze']) => {
  storePlayer.updateConfig({
    type: 'parse',
    status: true,
    data: { info: item, extra: { active, site: config.value.list } },
  });

  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_PLAYER);
};

const defaultConfig = () => {
  searchValue.value = '';

  // active.value.class = '';
  active.value.nav = '';

  config.value.default = {};
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.PAGE_SHOW) return;

  defaultConfig();
  await getSetting();
};

const onNavChange = async (id: string) => {
  try {
    defaultConfig();
    active.value.nav = id;
    config.value.default = config.value.list.find((item) => item.id === id);
  } catch (error) {
    console.error(`Failed to change config:`, error);
  }
};

const onSearchRecommend = (eventData: { source: string; data: any }) => {
  const { source, data: kw } = eventData;
  if (source === emitterSource.PAGE_SHOW) return;

  searchValue.value = kw;

  const item = platform.value.find((item) => item.id === active.value.class);
  const url = kw ? item!.search.replace('{kw}', kw) : item!.url;

  webviewRef.value?.loadUrl(url);
};

const handleWebviewRouter = (type: 'back' | 'forward' | 'refresh') => {
  const webview = webviewRef.value;
  if (!webview) return;

  const helpers = {
    back: () => {
      if (webview.canGoBack()) webview.goBack();
    },
    forward: () => {
      if (webview.canGoForward()) webview.goForward();
    },
    refresh: () => {
      webview.reload();
    },
  };

  helpers?.[type]?.();
};

const onNavigateCallback = (_appid: string, url: string) => {
  currentUrl.value = url;
  if (!isHttp(url)) return;
  const index = platform.value.findIndex((item) => {
    try {
      return getDomain(item.url) === getDomain(url);
    } catch {
      return false;
    }
  });
  active.value.class = index >= 0 ? platform.value[index].id : '';
};
</script>
<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: var(--td-size-4);

  .sidebar {
    flex: 0 0 auto;
  }

  .content {
    height: 100%;
    width: 100%;
    padding: 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingTB-s) 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);
    overflow: hidden;
    position: relative;

    .header {
      width: 100%;
      display: flex;
      gap: var(--td-comp-margin-s);

      .router-control {
        display: flex;
        align-items: center;
        border-radius: var(--td-radius-medium);
        background-color: var(--td-bg-color-component);

        .btn {
          background: transparent;
          border-width: 0;
          color: var(--td-text-color-primary);

          &.t-is-disabled {
            color: var(--td-text-color-disabled);
          }

          &:not(.t-is-disabled, .t-button--ghost) {
            &:hover {
              color: var(--td-text-color-primary);
            }
          }
        }
      }

      .platform-selector {
        .btn {
          &.t-is-disabled {
            color: var(--td-text-color-disabled);
          }

          &:not(.t-is-disabled, .t-button--ghost) {
            &:hover {
              color: var(--td-text-color-primary);
              border-color: var(--td-brand-color);
            }
          }
        }
      }

      .parse-button {
        background-color: var(--td-border-level-1-color);
        border-color: var(--td-border-level-1-color);

        &:hover {
          color: var(--td-text-color-primary);
          border-color: var(--td-brand-color);
        }
      }
    }

    .container {
      flex: 1;
      height: 100%;
      width: 100%;
      -webkit-app-region: no-drag;

      .content-wrapper {
        height: 100%;
        width: 100%;
        border-radius: var(--td-radius-medium);
        background: var(--td-border-level-1-color);
        overflow: hidden;
        -webkit-app-region: no-drag;

        .webview {
          height: 100%;
          width: 100%;
          -webkit-app-region: no-drag;
        }
      }
    }
  }
}
</style>
