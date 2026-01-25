<template>
  <div v-if="playerStutus.status" class="player-show" @click="focusPlayerWindowEvent">
    <t-button theme="default" shape="square" variant="text" class="btn">
      <template #icon><video-library-icon /></template>
    </t-button>

    <div ref="marqueeContainerRef" class="title-warp">
      <span ref="marqueeTextRef" class="title">{{ playerStutus.title }}</span>
    </div>

    <t-button theme="default" shape="square" variant="text" class="btn" @click.stop="destroyPlayerWindowEvent">
      <template #icon><close-icon /></template>
    </t-button>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'PlayerShow',
});

import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { WINDOW_NAME } from '@shared/config/windowName';
import { CloseIcon, VideoLibraryIcon } from 'tdesign-icons-vue-next';
import { computed, nextTick, onMounted, useTemplateRef, watch } from 'vue';

import { usePlayerStore } from '@/store';

const playerStore = usePlayerStore();
const marqueeContainerRef = useTemplateRef('marqueeContainerRef');
const marqueeTextRef = useTemplateRef('marqueeTextRef');

const playerStutus = computed(() => {
  return {
    status: playerStore.status,
    title:
      playerStore.type === 'film'
        ? (playerStore.data.info as { vod_name: string }).vod_name
        : (playerStore.data.info as { name: string }).name,
  };
});

watch(
  () => playerStutus.value.title,
  () => playerStutus.value.status && nextTick(() => setMarqueeAnimation()),
);

onMounted(() => setup());

const setup = async () => {
  nextTick(() => setMarqueeAnimation());

  if (!(await window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_STATUS, WINDOW_NAME.PLAYER))) {
    playerStore.updateConfig({ status: false });
  }
};

const setMarqueeAnimation = () => {
  const containerRef = marqueeContainerRef.value;
  const textRef = marqueeTextRef.value;

  if (containerRef && textRef) {
    const containerWidth = containerRef.getBoundingClientRect().width;
    const textWidth = textRef.getBoundingClientRect().width;

    if (textWidth > containerWidth) {
      const duration = textWidth / 20;
      textRef.style.animationDuration = `${duration}s`;
    } else {
      textRef.style.animationDuration = '0s';
    }
  }
};

const focusPlayerWindowEvent = async () => {
  if (!(await window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_STATUS, WINDOW_NAME.PLAYER))) {
    playerStore.updateConfig({ status: false });
  } else {
    window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_SHOW, WINDOW_NAME.PLAYER);
  }
};

const destroyPlayerWindowEvent = () => {
  playerStore.updateConfig({ status: false });

  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_DESTROY, WINDOW_NAME.PLAYER);
};
</script>
<style lang="less" scoped>
.player-show {
  background: var(--td-bg-color-container-hover);
  border-radius: var(--td-radius-medium);
  display: flex;
  cursor: pointer;

  .t-button {
    &:not(.t-is-disabled, .t-button--ghost) {
      &:hover {
        background-color: transparent !important;
      }
    }
  }

  .title-warp {
    display: flex;
    align-items: center;
    overflow: hidden;
    max-width: 100px;
    transition: max-width 0.3s ease;

    .title {
      display: inline-block;
      white-space: nowrap;
      color: var(--td-text-color-secondary);
      animation: marquee linear infinite;
      user-select: none;
    }

    @keyframes marquee {
      0% {
        transform: translateX(10%);
      }

      100% {
        transform: translateX(-100%);
      }
    }
  }
}
</style>
