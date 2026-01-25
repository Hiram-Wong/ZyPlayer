<template>
  <div class="webview-console view-component-container">
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

      <t-input v-model="currentUrl" class="url-input" @enter="handleLoadUrl" />

      <t-button theme="default" class="btn" @click="handleWebviewRouter('devTools')">
        <template #icon><bug-icon /></template>
      </t-button>
    </div>

    <div class="container">
      <div class="content-wrapper">
        <webview-container ref="webviewRef" appid="demo" :on-navigate-callback="onNavigateCallback" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { BugIcon, ChevronLeftIcon, ChevronRightIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { ref } from 'vue';

import WebviewContainer from '@/components/webview/index.vue';

const currentUrl = ref('about:blank');
const webviewRef = ref<typeof WebviewContainer | null>(null);

const handleWebviewRouter = (type: 'back' | 'forward' | 'refresh' | 'devTools') => {
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
    devTools: () => {
      webview.openDevTools();
    },
  };

  helpers?.[type]?.();
};

const handleLoadUrl = () => {
  const url = currentUrl.value;
  webviewRef.value?.loadUrl(url);
};

const onNavigateCallback = (_appid: string, url: string) => {
  currentUrl.value = url;
};
</script>
<style lang="less" scoped>
.view-component-container {
  width: 100%;
  height: 100%;
  padding: 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingTB-s) 0;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    width: 100%;
    display: flex;
    gap: var(--td-comp-margin-s);

    .router-control {
      display: flex;
      align-items: center;
      border-radius: var(--td-radius-medium);
      background-color: var(--td-border-level-1-color);

      .btn {
        background: transparent;
        border-width: 0;

        &.t-is-disabled {
          color: var(--td-text-color-placeholder);
        }

        &:not(.t-is-disabled, .t-button--ghost) {
          &:hover {
            background: var(--td-bg-color-component-hover);
          }
        }
      }
    }

    .navigation-controls {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background-color: var(--td-border-level-1-color);
      border-radius: var(--td-radius-medium);

      .btn {
        background: transparent;
        border-width: 0;

        &.t-is-disabled {
          color: var(--td-text-color-placeholder);
        }

        &:not(.t-is-disabled, .t-button--ghost) {
          &:hover {
            background: var(--td-bg-color-component-hover);
            border-color: var(--td-bg-color-component-hover);
          }
        }
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
</style>
