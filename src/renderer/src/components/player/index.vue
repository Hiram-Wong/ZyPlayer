<template>
  <div class="container-player">
    <div class="player-panel">
      <iframe class="player" ref="iframeRef" v-show="formData.type === 'iframe'" :src="formData.url"
        allowtransparency="true" frameborder="0" scrolling="no" allowfullscreen="true" webkit-playsinline playsinline
        sandbox="allow-forms allow-scripts allow-same-origin allow-popups"></iframe>
      <div id="comm-mse" class="player" v-show="formData.type === 'player'"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/style/player/index.less';

import { computed, ref } from 'vue';
import _ from 'lodash';

import { playerCreate, playerDestroy } from '@/utils/common/player';
import { checkMediaType } from '@/utils/tool';

import { usePlayStore } from '@/store';

const store = usePlayStore();
const playerMode = computed(() => {
  return store.getSetting.playerMode;
});
const formData = ref({
  type: 'iframe',
  url: ''
});
const iframeRef = ref();

const createPlayer = async (type: string, url: string) => {
  if (!url && !type) return;

  let data = {
    type,
    player: ''
  }
  formData.value.type = type;
  switch (type) {
    case 'iframe':
      formData.value.url = url;
      data.player = iframeRef.value;
      break;
    case 'player':
      const mediaType = await checkMediaType(url);
      if (mediaType === 'unknown' && !mediaType) return;
      const containers = {
        xgplayer: 'comm-mse',
        artplayer: '#comm-mse',
        dplayer: document.getElementById('comm-mse'),
        nplayer: '#comm-mse',
        ckplayer: '#comm-mse',
      };
      data.player = await playerCreate(url, 'analyze', containers[playerMode.value.type], playerMode.value.type, mediaType) as any;
      break
  }
  return data;
};

const destroyPlayer = async (type: string, player: any) => {
  if (!player && !type) return;

  formData.value.url = '';
  switch (type) {
    case 'iframe':
      iframeRef.value = null;
      break;
    case 'player':
      await playerDestroy(player, playerMode.value.type);
      break
  }
};

defineExpose({
  createPlayer,
  destroyPlayer
});
</script>

<style lang="less" scoped>
.container-player {
  height: 100%;

  .player-panel {
    position: relative;
    width: 100%;
    height: 100%;
    background: url(@/assets/bg-player.jpg) center center;

    .player {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
