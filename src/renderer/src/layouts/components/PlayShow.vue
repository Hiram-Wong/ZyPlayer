<template>
  <div class="player-show">
    <div v-if="playerStutus.status" class="box-flex">
      <div class="mini-box" @click="focusPlayerWindowEvent">
        <div class="mini-box-video">
          <video-library-icon size="large" class="video" />
        </div>
        <div class="mini-box-title-warp">
          <span class="mini-box-title">{{ playerStutus.title }}</span>
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
import { computed } from 'vue';

import { t } from '@/locales';
import { usePlayStore } from '@/store';

const playerStore = usePlayStore();

const playerStutus = computed(() => {
  return {
    status: playerStore.status,
    // @ts-ignore
    title: playerStore.type === 'film' ? playerStore.data.info.vod_name : playerStore.data.info.name || t('pages.playShow.noPlayTitle')
  }
});

const focusPlayerWindowEvent = () => {
  window.electron.ipcRenderer.send('manage-playerWindow', 'focus');
};

const destroyPlayerWindowEvent = () => {
  window.electron.ipcRenderer.send('manage-playerWindow', 'destroy');
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
          animation: marquee 10s linear infinite;
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
