<template>
  <div class="webview-container">
    <webview
      :key="appid"
      ref="webviewRef"
      src="about:blank"
      allowpopups
      autosize
      disablewebsecurity
      partition="persist:webview"
      class="webview"
    />
    <t-loading attach=".webview-container" size="medium" :loading="isWebviewLoading" />
  </div>
</template>
<script setup lang="ts">
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import type {
  DidNavigateEvent,
  DidNavigateInPageEvent,
  DidRedirectNavigationEvent,
  PageFaviconUpdatedEvent,
  PageTitleUpdatedEvent,
  WebviewTag,
} from 'electron';
import type { PropType } from 'vue';
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

const props = defineProps({
  appid: {
    type: String,
    default: '',
  },
  onNavigateCallback: {
    type: Function as PropType<(appid: string, url: string) => void>,
    default: (_appid: string, _url: string) => {},
  },
  onTitleUpdatedCallback: {
    type: Function as PropType<(appid: string, title: string) => void>,
    default: (_appid: string, _title: string) => {},
  },
  onFaviconUpdatedCallback: {
    type: Function as PropType<(appid: string, favicon: string) => void>,
    default: (_appid: string, _favicon: string) => {},
  },
});

const emits = defineEmits(['change-favicon', 'change-navigate', 'change-title']);

const webviewRef = useTemplateRef<WebviewTag | null>('webviewRef');
const appid = ref<string>(props.appid);
const isWebviewLoading = ref<boolean>(false);
const isWebviewReady = ref<boolean>(false);
const token = ref<string>();
const pendingUrl = ref<string>('');

watch(
  () => props.appid,
  (val) => {
    removeEventListeners();
    appid.value = val;
  },
);
watch(
  () => appid.value,
  () => {
    isWebviewLoading.value = false;
    isWebviewReady.value = false;
    nextTick(() => attachEventListeners());
  },
);

onMounted(() => setup());
onUnmounted(() => dispose());

const setup = () => {
  nextTick(() => attachEventListeners());

  window.electron.ipcRenderer.on(IPC_CHANNEL.WEBVIEW_LINK_BLOCK_RELAY, onUriBlocked);
};

const dispose = () => {
  removeEventListeners();

  window.electron.ipcRenderer.removeListener(IPC_CHANNEL.WEBVIEW_LINK_BLOCK_RELAY, onUriBlocked);
  webviewRef.value?.remove();
};

const onUriBlocked = (_event: any, url: string) => {
  emits('change-navigate', url);
  webviewRef.value?.loadURL(url).catch(() => {});
};

const onDidStartLoading = () => {
  // console.debug('did-start-loading');
  isWebviewLoading.value = true;
};

const onDidStopLoading = () => {
  // console.debug('did-stop-loading');
  isWebviewLoading.value = false;
};

const onDidFinishLoading = () => {
  // console.debug('did-finish-loading');
  isWebviewLoading.value = false;
};

const onDidNavigate = (event: DidNavigateEvent) => {
  // console.debug('did-navigate', event.url);
  emits('change-navigate', event.url);
  props.onNavigateCallback?.(appid.value, event.url);
};

const onDidRedirectNavigate = (event: DidRedirectNavigationEvent) => {
  // console.debug('did-redirect-navigate', event.url);
  emits('change-navigate', event.url);
  props.onNavigateCallback?.(appid.value, event.url);
};

const onDidNavigateInPage = (event: DidNavigateInPageEvent) => {
  // console.debug('did-navigate-in-page', event.url);
  emits('change-navigate', event.url);
  props.onNavigateCallback?.(appid.value, event.url);
};

const onCrashed = () => {
  console.error('Webview crashed! Reload <webview> to recover.');
};

const onPageTitleUpdated = (event: PageTitleUpdatedEvent) => {
  emits('change-title', event.title);
  props.onTitleUpdatedCallback?.(appid.value, event.title);
};

const onPageFaviconUpdated = (event: PageFaviconUpdatedEvent) => {
  emits('change-favicon', event.favicons[0] || '');
  props.onFaviconUpdatedCallback?.(appid.value, event.favicons[0] || '');
};

const onDomReady = () => {
  // console.debug('dom-ready');
  const webviewId = webviewRef.value?.getWebContentsId();
  if (!webviewId) return;

  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WEBVIEW_SPELL_CHECK, webviewId, 2);
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WEBVIEW_LINK_BLOCK, webviewId, 1);

  isWebviewReady.value = true;

  if (pendingUrl.value) {
    loadUrl(pendingUrl.value);
    pendingUrl.value = '';
  }
};

const loadUrl = (url: string) => {
  if (!url) return;
  if (isWebviewReady.value) {
    const wv = webviewRef.value;
    if (!wv) return;
    if (isWebviewLoading.value) wv.stop();
    wv.loadURL(url).catch(() => {});
  } else {
    pendingUrl.value = url;
  }
};

const sendIpc = (channel: string, ...args: any[]) => {
  if (!webviewRef.value) return;
  webviewRef.value.send(channel, ...args);
};

const insertCSS = (css: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!webviewRef.value) return reject(new Error('Webview not initialized'));

    webviewRef.value
      .insertCSS(css)
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

const executeJavaScript = (code: string): Promise<any> => {
  return new Promise<void>((resolve, reject) => {
    if (!webviewRef.value) return reject(new Error('Webview not initialized'));

    webviewRef.value
      .executeJavaScript(code, false)
      .then((res) => resolve(res))
      .catch((error) => reject(error));
  });
};

const toggleDevTools = () => {
  const wv = webviewRef.value;
  if (!wv) return;

  if (wv?.isDevToolsOpened()) {
    wv.closeDevTools();
  } else {
    wv.openDevTools();
  }
};

/**
 * Attach all event listeners to webview
 * start-loading -> navigate -> dom-ready -> finish-load -> stop-loading
 * start-loading -> navigate -> title-updated -> dom-ready -> finish-load -> stop-loading -> favicon-updated
 */
const attachEventListeners = () => {
  const wv = webviewRef.value;
  if (!wv) return;

  wv.addEventListener('crashed', onCrashed);
  wv.addEventListener('page-title-updated', onPageTitleUpdated);
  wv.addEventListener('page-favicon-updated', onPageFaviconUpdated);
  wv.addEventListener('did-start-loading', onDidStartLoading);
  wv.addEventListener('dom-ready', onDomReady);
  wv.addEventListener('did-finish-load', onDidFinishLoading);
  wv.addEventListener('did-stop-loading', onDidStopLoading);
  wv.addEventListener('did-navigate', onDidNavigate);
  wv.addEventListener('did-navigate-in-page', onDidNavigateInPage);
  wv.addEventListener('did-redirect-navigation', onDidRedirectNavigate);
};

/**
 * Remove all event listeners
 */
const removeEventListeners = () => {
  const wv = webviewRef.value;
  if (!wv) return;

  wv.removeEventListener('crashed', onCrashed);
  wv.removeEventListener('page-title-updated', onPageTitleUpdated);
  wv.removeEventListener('page-favicon-updated', onPageFaviconUpdated);
  wv.removeEventListener('did-start-loading', onDidStartLoading);
  wv.removeEventListener('dom-ready', onDomReady);
  wv.removeEventListener('did-finish-load', onDidFinishLoading);
  wv.removeEventListener('did-stop-loading', onDidStopLoading);
  wv.removeEventListener('did-navigate', onDidNavigate);
  wv.removeEventListener('did-navigate-in-page', onDidNavigateInPage);
  wv.removeEventListener('did-redirect-navigation', onDidRedirectNavigate);
};

/**
 * Expose methods for parent components
 */
defineExpose({
  instance: webviewRef.value,
  remove: () => webviewRef.value?.remove(),
  getWebContentsId: () => webviewRef.value?.getWebContentsId() || -1,
  getTitle: () => webviewRef.value?.getTitle?.() || '',
  getURL: () => webviewRef.value?.getURL?.() || '',
  getToken: () => token.value || '',
  clearHistory: () => webviewRef.value?.clearHistory?.(),
  stop: () => webviewRef.value?.stop?.(),
  reload: () => webviewRef.value?.reload?.(),
  goBack: () => webviewRef.value?.goBack?.(),
  goForward: () => webviewRef.value?.goForward?.(),
  canGoBack: () => webviewRef.value?.canGoBack?.() || false,
  canGoForward: () => webviewRef.value?.canGoForward?.() || false,
  focus: () => webviewRef.value?.focus?.(),
  openDevTools: () => webviewRef.value?.openDevTools?.(),
  closeDevTools: () => webviewRef.value?.closeDevTools?.(),
  toggleDevTools,
  sendIpc,
  insertCSS,
  executeJavaScript,
  loadUrl,
  dispose,
});
</script>
<style lang="less" scoped>
.webview-container {
  width: 100%;
  height: 100%;
  position: relative;

  .webview {
    display: inline-flex;
    width: 100%;
    height: 100%;
    color: var(--td-text-color-primary);
    background: var(--td-border-level-1-color);
  }
}
</style>
