<template>
  <div class="player-show">
    <div v-if="playerStutus.status" class="box-flex">
      <div class="mini-box" @click="focusPlayerWindowEvent">
        <div class="mini-box-video">
          <video-library-icon size="large" class="video" />
        </div>
        <div class="mini-box-title-warp" ref="marqueeContainerRef">
          <span class="mini-box-title" ref="marqueeTextRef">{{ playerStutus.title }}</span>
        </div>
        <div class="mini-box-close" @click.stop="destroyPlayerWindowEvent">
          <close-icon size="large" class="close" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloseIcon, VideoLibraryIcon } from 'tdesign-icons-vue-next';
import { computed, watch, useTemplateRef, nextTick, onMounted } from 'vue';

import { t } from '@/locales';
import { usePlayStore } from '@/store';

const playerStore = usePlayStore();
const marqueeContainerRef = useTemplateRef('marqueeContainerRef');
const marqueeTextRef = useTemplateRef('marqueeTextRef');

const playerStutus = computed(() => {
  return {
    status: playerStore.status,
    // @ts-ignore
    title: playerStore.type === 'film' ? playerStore.data.info.vod_name : playerStore.data.info.name || t('pages.playShow.noPlayTitle')
  }
});

watch(() => playerStutus.value.title,
  async () => {
    await nextTick(() => {
      setMarqueeAnimation();
    })
  }
);

onMounted(async () => {
  await nextTick(() => {
    setMarqueeAnimation();
  })
});

const setMarqueeAnimation = () => {
  const containerRef = marqueeContainerRef.value;
  const textRef = marqueeTextRef.value;
  if (containerRef && textRef) {
    const containerWidth = containerRef.getBoundingClientRect().width;
    const textWidth = textRef.getBoundingClientRect().width;

    // 计算动画持续时间，这里假设动画速度为文本宽度的2倍
    const duration = (textWidth / containerWidth) * 10;

    // 设置动画持续时间
    marqueeTextRef.value.style.animationDuration = `${duration}s`;
  }
}

const focusPlayerWindowEvent = () => {
  window.electron.ipcRenderer.send('manage-win', { win: 'play', action: 'focus' });
};

const destroyPlayerWindowEvent = () => {
  window.electron.ipcRenderer.send('manage-win', { win: 'play', action: 'destroy' });
  playerStore.updateConfig({
    status: false,
  });
};
</script>

<style lang="less" scoped>
.player-show {
  height: 100%;

  .box-flex {
    height: 100%;

    .mini-box {
      border-radius: var(--td-radius-default);
      background-color: var(--td-bg-color-container);
      height: 100%;
      width: 140px;
      display: flex;
      align-items: center;
      cursor: pointer;

      &-close,
      &-video {
        cursor: pointer;
        text-align: center;
        display: flex;
        align-items: center;
        color: var(--td-text-color-placeholder);
      }

      &-video {
        margin-left: var(--td-comp-margin-s);
      }

      &-close {
        margin-right: var(--td-comp-margin-s);

        &:hover {
          color: var(--td-primary-color);
        }
      }

      &-title-warp {
        margin: 0 var(--td-comp-margin-xs);
        overflow: hidden;
        width: 100%;

        .mini-box-title {
          display: inline-block;
          white-space: nowrap;
          animation: marquee linear infinite;
          color: var(--td-text-color-placeholder);
          font-weight: 500;
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
</style>
