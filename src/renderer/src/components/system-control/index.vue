<template>
  <div class="system-controls">
    <t-button
      v-if="!isFilter('pin')"
      theme="default"
      shape="square"
      class="control-button control-button__pin"
      @click="handlePinWindow"
    >
      <template #icon>
        <pin-filled-icon v-if="active.isPinned" />
        <pin-icon v-else />
      </template>
    </t-button>

    <template v-if="!isMacOS">
      <t-button
        v-if="!isFilter('min')"
        theme="default"
        shape="square"
        class="control-button control-button__minimize"
        @click="handleMinimizeWindow"
      >
        <template #icon><remove-icon /></template>
      </t-button>

      <t-button
        v-if="!isFilter('max')"
        theme="default"
        shape="square"
        class="control-button control-button__maximize"
        @click="handleMaximizeWindow"
      >
        <template #icon>
          <copy-icon v-if="active.isMaximized" style="transform: scaleX(-1)" />
          <rectangle-icon v-else :style="{ widh: '14px', height: '14px' }" />
        </template>
      </t-button>

      <t-button
        v-if="!isFilter('close')"
        theme="default"
        shape="square"
        class="control-button control-button__close"
        @click="handleCloseWindow"
      >
        <template #icon><close-icon /></template>
      </t-button>
    </template>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'SystemControl',
});

const props = defineProps({
  filter: {
    type: Array,
    default: () => [],
  },
});

import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { CloseIcon, CopyIcon, PinFilledIcon, PinIcon, RectangleIcon, RemoveIcon } from 'tdesign-icons-vue-next';
import { onMounted, ref } from 'vue';

import { isMacOS } from '@/utils/systeminfo';

const active = ref({
  isPinned: false,
  isMaximized: false,
});

onMounted(() => {
  setupWindowListeners();
  setupWindowStatus();
});

const isFilter = (name: string) => {
  return props.filter.includes(name);
};

const setupWindowListeners = () => {
  if (isMacOS) {
    attachFullscreenListener();
  } else {
    attachMaximizeListener();
  }
};

const setupWindowStatus = async () => {
  const statusPin = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_PIN);
  active.value.isPinned = statusPin;
  const statusMax = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_MAX);
  active.value.isMaximized = statusMax;
};

const handlePinWindow = async () => {
  active.value.isPinned = !active.value.isPinned;
  const status = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_PIN, 0);
  active.value.isPinned = status; // sync
};

const handleMinimizeWindow = () => {
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_MIN, 1);
};

const handleMaximizeWindow = async () => {
  active.value.isMaximized = !active.value.isMaximized;
  const status = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_MAX, 0);
  active.value.isMaximized = status; // sync
};

const handleCloseWindow = () => {
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_CLOSE, 1);
};

const attachFullscreenListener = () => {
  window.electron.ipcRenderer.removeAllListeners(IPC_CHANNEL.WINDOW_FULLSCREEN);
  window.electron.ipcRenderer.on(IPC_CHANNEL.WINDOW_FULLSCREEN, (_, fullscreen: boolean) => {
    if (fullscreen) {
      document.documentElement.setAttribute('fullscreen', String(fullscreen));
    } else {
      document.documentElement.removeAttribute('fullscreen');
    }
  });
};

const attachMaximizeListener = () => {
  window.electron.ipcRenderer.removeAllListeners(IPC_CHANNEL.WINDOW_MAX);
  window.electron.ipcRenderer.on(IPC_CHANNEL.WINDOW_MAX, (_, maximized: boolean) => {
    active.value.isMaximized = maximized;
  });
};
</script>
<style lang="less" scoped>
.system-controls {
  .control-button {
    &.control-button__close {
      &:not(.t-is-disabled, .t-button--ghost) {
        &:hover {
          color: var(--td-error-color) !important;
        }
      }
    }
  }
}
</style>
