<template>
  <div class="player-show">
    <div v-if="playerStutus.status" class="box-flex">
      <div class="mini-box" @click="focusPlayerWindowEvent">
        <div class="mini-box-title-warp">
          <span class="mini-box-title">{{ playerStutus.title }}</span>
        </div>
        <div class="mini-box-close" @click.stop="destroyPlayerWindowEvent">
          <close-icon size="smll" class="close" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloseIcon } from 'tdesign-icons-vue-next';
import { computed } from 'vue';

import { t } from '@/locales';
import { usePlayStore } from '@/store';

const playerStore = usePlayStore();

const playerStutus = computed(() => {
  return {
    status: playerStore.status,
    // @ts-ignore
    title: playerStore.data.info.vod_name || t('pages.playShow.noPlayTitle')
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
  .box-flex {
    .mini-box {
      border-radius: var(--td-radius-round);
      height: 31px;
      width: 140px;
      background-color: var(--td-bg-color-component);
      display: flex;
      align-items: center;
      cursor: pointer;

      &-close {
        margin-right: var(--td-comp-margin-s);
        width: 15px;
        display: flex;
        justify-content: center;
        color: var(--td-brand-color);

        svg {
          margin: 0 auto;
        }
      }

      &-title-warp {
        margin: 0 var(--td-comp-margin-xs) 0 var(--td-comp-margin-l);
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
</style>
