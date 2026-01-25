<template>
  <div class="layout-player">
    <t-layout :class="[`${prefix}-layout`]">
      <t-header class="drag-region" :class="[`${prefix}-header`, active.headerPin ? 'pin' : '']">
        <l-header :title="title" />
      </t-header>
      <t-layout :class="[`${prefix}-main`]">
        <t-content :class="[`${prefix}-content`]">
          <div :class="[`${prefix}-content-container`]">
            <multi-player ref="playerRef" class="media-player" @update-time="onTimeUpdate" />
            <div class="dock-show" @click="toggleAside">
              <chevron-left-icon v-if="active.aside" class="dock-icon" />
              <chevron-right-icon v-else class="dock-icon" />
            </div>
          </div>
        </t-content>
        <t-aside v-show="!active.aside" :class="[`${prefix}-aside`]">
          <div :class="[`${prefix}-aside-container`]">
            <component
              :is="currentAsideComponent"
              class="container-aside"
              :store="playerStoreFormData"
              :process="processFormData"
              @barrage="updateBarrage"
              @create="handlePlayerCreate"
              @pause="handlePlayerPause"
              @seek="handlePlayerSeek"
              @update="updateConf"
            />
          </div>
        </t-aside>
      </t-layout>
    </t-layout>
  </div>
</template>
<script setup lang="ts">
import { APP_NAME } from '@shared/config/appinfo';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import type { IBarrageResult } from '@shared/types/barrage';
import { merge } from 'es-toolkit';
import { ChevronLeftIcon, ChevronRightIcon } from 'tdesign-icons-vue-next';
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch } from 'vue';

import type { IMultiPlayerOptions, MultiPlayerInstance } from '@/components/multi-player';
import { MultiPlayer } from '@/components/multi-player';
import { prefix } from '@/config/global';
import type { IStorePlayer } from '@/config/player';
import { t } from '@/locales';
import { usePlayerStore } from '@/store';
import type { IVideoProcess } from '@/types/player';
import { systemM3u8AdRemoveApi } from '@/utils/env';

import LHeader from './components/Header.vue';

const storePlayer = usePlayerStore();

const componentMap = {
  film: defineAsyncComponent(() => import('./components/AsideFilm.vue')),
  live: defineAsyncComponent(() => import('./components/AsideLive.vue')),
  parse: defineAsyncComponent(() => import('./components/AsideParse.vue')),
};

const playerRef = useTemplateRef<MultiPlayerInstance | null>('playerRef');
const currentAsideComponent = shallowRef(componentMap[storePlayer.type]);

const playerFormData = ref<IMultiPlayerOptions>({
  url: '',
  autoplay: true,
  next: false,
  quality: [],
  isLive: false,
  headers: {},
  type: 'auto',
  startTime: 0,
  container: 'play-mse',
});
const processFormData = ref<IVideoProcess>({
  currentTime: 0,
  duration: 0,
});
const playerStoreFormData = computed<IStorePlayer>(() => storePlayer.$state);

const active = ref({
  aside: false,
  headerPin: false,
});

const title = computed(() => {
  const type = storePlayer.type;
  const info = storePlayer.data.info;

  return (type === 'film' ? info.vod_name : info.name) || APP_NAME;
});

watch(
  () => storePlayer.setting.skipAd,
  (val) => {
    const watchTime = processFormData.value.currentTime;
    handlePlayerCreate({ ...playerFormData.value, skipAd: val, startTime: watchTime }, 'new');
  },
);

onMounted(() => setup());
onUnmounted(() => dispose());

const setup = () => {
  window.electron.ipcRenderer.on(IPC_CHANNEL.WINDOW_DESTROY, () => {
    storePlayer.updateConfig({ status: false });
    window.electron.ipcRenderer.send(IPC_CHANNEL.WINDOW_DESTROY_RELAY);
  });

  document.title = `${APP_NAME}(${t('pages.player.title')})`;
};

const dispose = () => {
  storePlayer.updateConfig({ status: false });
};

const toggleAside = () => {
  active.value.aside = !active.value.aside;
};

const handleUrlAdRemove = (url: string, remove: boolean = false): string => {
  if (remove && url.startsWith('http') && !url.startsWith(systemM3u8AdRemoveApi)) {
    return `${systemM3u8AdRemoveApi}?url=${encodeURIComponent(url)}`;
  }
  if (!remove && url.startsWith('http') && url.startsWith(systemM3u8AdRemoveApi)) {
    return decodeURIComponent(url.replace(`${systemM3u8AdRemoveApi}?url=`, ''));
  }
  return url;
};

const onTimeUpdate = (time: IVideoProcess) => (processFormData.value = time);

const updateConf = (item: IStorePlayer) => storePlayer.updateConfig(item);

const updateBarrage = (item: IBarrageResult) => {
  setTimeout(() => {
    playerRef.value?.barrage(item.list, item.id);
  }, 0);
};

const handlePlayerCreate = async (
  item: IMultiPlayerOptions & { skipAd?: boolean },
  mode: 'switch' | 'new' = 'switch',
) => {
  const player = storePlayer.player;

  if (player.type === 'custom') {
    window.electron.ipcRenderer.invoke(IPC_CHANNEL.CALL_PLAYER, player.external, item.url);
  } else {
    const finalItem: IMultiPlayerOptions = {
      ...item,
      url: handleUrlAdRemove(item.url, item.skipAd),
      quality: (item.quality || []).map((q) => ({ ...q, url: handleUrlAdRemove(q.url, item.skipAd) })),
    };
    playerFormData.value = merge(playerFormData.value, finalItem);
    await playerRef.value?.create(playerFormData.value, player.type, mode);
  }
};

const handlePlayerPause = () => playerRef.value?.pause();

const handlePlayerSeek = (time: number) => playerRef.value?.seek(time);
</script>
<style lang="less" scoped>
@import '@/style/player.less';
</style>
