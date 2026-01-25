<template>
  <div class="layout-browser">
    <t-layout :class="[`${prefix}-layout`]">
      <t-header class="drag-region" :class="[`${prefix}-header`]">
        <div :class="[`${prefix}-header-container`]">
          <div class="left system-functions">
            <div class="router-control system-function no-drag-region">
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

            <div class="tabs system-function no-drag-region">
              <template v-for="item in tabs" :key="item.id">
                <t-tooltip
                  :attach="`.${attachContent}`"
                  :z-index="3610"
                  :show-arrow="false"
                  destroy-on-close
                  :content="item.title"
                  placement="bottom"
                >
                  <div class="tab-item" :class="{ 'is-active': active === item.id }" @click="handleTabClick(item)">
                    <div class="icon">
                      <t-image
                        :src="item.favicon"
                        fit="cover"
                        :error="renderFavicon"
                        :loading="renderFavicon"
                        class="favicon"
                      />
                    </div>
                    <div class="title txthide">{{ item.title }}</div>
                    <t-button
                      theme="default"
                      shape="square"
                      variant="text"
                      class="close"
                      @click.stop="handleTabClose(item.id)"
                    >
                      <template #icon><close-icon /></template>
                    </t-button>
                  </div>
                </t-tooltip>
              </template>
            </div>
          </div>

          <div class="right system-functions">
            <div class="browser system-function no-drag-region">
              <t-button theme="default" shape="square" class="btn" @click="handleMoreOpenSystemBrowser">
                <template #icon><internet-icon /></template>
              </t-button>
            </div>

            <div class="more system-function no-drag-region">
              <t-button theme="default" shape="square" class="btn" @click="handleMoreDrawer">
                <template #icon><ellipsis-icon /></template>
              </t-button>
            </div>

            <system-control class="system-function no-drag-region" />
          </div>

          <t-drawer
            v-model:visible="isVisible.more"
            :header="null"
            :footer="null"
            :attach="`.${attachContent}`"
            show-in-attached-element
            :z-index="3600"
            class="drawer-more-content"
          >
            <div class="drawer-more-content-container">
              <div class="action">
                <t-button theme="default" variant="text" block class="action-btn" @click="handleMoreOpenSystemBrowser">
                  {{ $t('pages.browser.button.openInBrowser') }}
                  <template #icon><internet-icon /></template>
                </t-button>
                <t-button theme="default" variant="text" block class="action-btn" @click="handleMoreDevtools">
                  {{ $t('system.view.toggleDevTools') }}
                  <template #icon><code-1-icon /></template>
                </t-button>
              </div>
              <t-divider dashed class="divider" />
              <div class="history">
                <div class="history-header">
                  <div class="title">{{ $t('pages.browser.history.recent') }}</div>
                  <div v-show="history.length" class="clear" @click="handleMoreClearHistory">
                    {{ $t('common.clear') }}
                  </div>
                </div>
                <div class="history-content">
                  <div v-if="history.length" class="history-items">
                    <template v-for="item in history" :key="item.id">
                      <t-tooltip
                        attach=".drawer-more-content"
                        :z-index="3610"
                        :show-arrow="false"
                        destroy-on-close
                        :content="item.url"
                        placement="bottom"
                      >
                        <div class="history-item" @click="handleTabNew(item)">
                          <div class="icon">
                            <t-image
                              :src="item.favicon"
                              fit="cover"
                              :error="renderFavicon"
                              :loading="renderFavicon"
                              class="favicon"
                            />
                          </div>
                          <div class="title txthide">{{ item.title }}</div>
                        </div>
                      </t-tooltip>
                    </template>
                  </div>
                  <div v-else class="history-empty">
                    <t-empty />
                  </div>
                </div>
                <div class="history-tip">{{ $t('pages.browser.history.tip', [30]) }}</div>
              </div>
            </div>
          </t-drawer>
        </div>
      </t-header>
      <t-content :class="[`${prefix}-content`]">
        <div :class="[`${prefix}-content-container`]">
          <webview-view
            ref="webviewRef"
            :appid="appid"
            class="content-wrapper"
            :on-navigate-callback="onNavigateCallback"
            :on-title-updated-callback="onTitleUpdatedCallback"
            :on-favicon-updated-callback="onFaviconUpdatedCallback"
          />
        </div>
      </t-content>
    </t-layout>
  </div>
</template>
<script setup lang="tsx">
import { APP_NAME } from '@shared/config/appinfo';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { WINDOW_NAME } from '@shared/config/windowName';
import { generateStrUUID } from '@shared/modules/crypto';
import { isExternal } from '@shared/modules/validate';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  Code1Icon,
  EllipsisIcon,
  InternetIcon,
  RotateIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

import SystemControl from '@/components/system-control/index.vue';
import WebviewView from '@/components/webview/index.vue';
import type { IBrowserItem } from '@/config/browser';
import { attachContent, prefix } from '@/config/global';
import { t } from '@/locales';
import { useBrowserStore } from '@/store';

const MAX_TABS = 10;

const browserStore = useBrowserStore();

const webviewRef = useTemplateRef<typeof WebviewView | null>('webviewRef');

const active = computed(() => browserStore.activeTab || '');
const tabs = computed(() => browserStore.tabs || []);
const history = computed(() => browserStore.history || []);

const isVisible = ref({
  more: false,
});
const appid = ref('browser_default');

onMounted(() => setup());
onUnmounted(() => dispose());

const setup = () => {
  document.title = `${APP_NAME}(${t('pages.browser.title')})`;

  window.electron.ipcRenderer.on(IPC_CHANNEL.WINDOW_DESTROY, onWindowDestroy);
  window.electron.ipcRenderer.on(IPC_CHANNEL.BROWSER_NAVIGATE, onBrowserNavigate);

  if (active.value) {
    nextTick(() => {
      const item = browserStore.getDetail(active.value);
      if (item?.url) handleWebviewNavigator(item.url);
    });
  }
};

const dispose = () => {
  window.electron.ipcRenderer.removeAllListeners(IPC_CHANNEL.WINDOW_DESTROY);
  window.electron.ipcRenderer.removeAllListeners(IPC_CHANNEL.BROWSER_NAVIGATE);
};

const onWindowDestroy = () => {
  browserStore.clear('tabs');
  browserStore.activeTab = '';

  window.electron.ipcRenderer.send(IPC_CHANNEL.WINDOW_DESTROY_RELAY);
};

const onBrowserNavigate = (_: Electron.IpcRendererEvent, url: string) => {
  const id = generateStrUUID(url);
  handleTabNew({
    id,
    favicon: '',
    title: `${t('pages.browser.tab.newTab')} ${id.slice(0, 4)}`,
    url,
  });
};

const renderFavicon = () => (
  <InternetIcon style={{ width: '100%', height: '100%', color: 'var(--td-text-color-primary)' }} />
);

const handleWebviewRouter = (type: 'back' | 'forward' | 'refresh') => {
  const wv = webviewRef.value;
  if (!wv) return;

  if (type === 'back' && wv.canGoBack()) wv.goBack();
  if (type === 'forward' && wv.canGoForward()) wv.goForward();
  if (type === 'refresh') wv.reload();
};

const handleWebviewNavigator = (url: string) => {
  appid.value = `browser_${generateStrUUID(url)}`;
  nextTick(() => webviewRef.value?.loadUrl(url));
};

const handleTabClick = (item: IBrowserItem) => {
  if (active.value === item.id) return;

  browserStore.activeTab = item.id;

  handleWebviewNavigator(item.url);
};

const handleTabClose = (id: string) => {
  const index = browserStore.getTabIndex(active.value);
  if (index < 0) return;

  browserStore.close(id);

  if (!browserStore.tabs.length) {
    window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_DESTROY, WINDOW_NAME.BROWSER);
    return;
  }

  const isActive = active.value === id;
  const next = browserStore.getDetail(index + 1, 'idx') || browserStore.getDetail(index - 1, 'idx');

  if (isActive) {
    browserStore.activeTab = next?.id ?? '';
    handleWebviewNavigator(next?.url ?? 'about:blank');
  }
};

const handleTabNew = (doc: IBrowserItem) => {
  if (browserStore.tabs.length >= MAX_TABS) {
    MessagePlugin.warning(t('pages.browser.message.tabOverflow'));
    return;
  }

  browserStore.open(doc);
  browserStore.activeTab = doc.id;

  handleWebviewNavigator(doc.url);
};

/** more */

const handleMoreDrawer = () => {
  isVisible.value.more = !isVisible.value.more;
};

const handleMoreOpenSystemBrowser = () => {
  const url = webviewRef.value?.getURL();
  if (isExternal(url)) {
    window.electron.ipcRenderer.invoke(IPC_CHANNEL.OPEN_WEBSITE, url);
  } else {
    MessagePlugin.warning(t('pages.browser.message.noSupportProtocol'));
  }
};

const handleMoreClearHistory = () => {
  browserStore.clear('history');
};

const handleMoreDevtools = () => {
  webviewRef.value?.toggleDevTools();
};

/** callback */

const updateIfCurrent = (patch: Partial<IBrowserItem>) => {
  const tabId = active.value;
  if (!tabId) return;

  const item = browserStore.getDetail(tabId);
  if (!item) return;

  browserStore.update({ ...item, ...patch });
};

const onTitleUpdatedCallback = (_appid: string, title: string) => {
  if (!title) title = t('pages.browser.tab.newTab');
  updateIfCurrent({ title });
};

const onNavigateCallback = (_appid: string, url: string) => {
  if (url === 'about:blank') return;
  updateIfCurrent({ url });
};

const onFaviconUpdatedCallback = (_appid: string, favicon: string) => {
  if (!favicon) return;
  updateIfCurrent({ favicon });
};
</script>
<style lang="less" scoped>
@import '@/style/browser.less';
</style>
