<template>
  <div class="just-look view-container">
    <t-button theme="default" shape="square" variant="text" @click="play">
      <dvd-icon />
    </t-button>
    <t-drawer
      v-model:visible="isVisible.drawer"
      show-in-attached-element
      size-draggable
      :footer=null
      attach=".zy-component"
      @confirm="change"
      @close="close"
      size="320px"
    >
      <div class="content">
        <div id="player"></div>
        <t-button shape="round" theme="default" variant="dashed" class="btn" @click="change">
          <template #icon><refresh-icon /></template>
          <span>{{ $t('pages.justlook.confirm') }}</span>
        </t-button>
      </div>
    </t-drawer>
  </div>
</template>

<script lang="ts" setup>
import '@/style/player/veplayer.css';

import { DvdIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { ref, reactive, onMounted } from 'vue';
import Player from 'xgplayer';

import { fetchSettingDetail } from '@/api/setting';

const isVisible = reactive({
  drawer: false
});
const api = ref();
const player = ref();
const config = ref({
  id: 'player',
  url: '',
  autoplay: true,
  rotate: {
    clockwise: false,
    innerRotate: true,
    index: 1
  },
  ignores: ['cssFullscreen', 'playbackRate'],
  height: '100%',
  width: '100%'
})

const getData = async() => {
  const res = await fetchSettingDetail('defaultViewCasual');
  api.value = res.value;
}

onMounted(() => {
  getData();
})

const change = () => {
  player.value.src = api.value;
}

const close = () => {
  player.value.destroy();
  player.value = null;
}

const play = () => {
  if (!isVisible.drawer) {
    isVisible.drawer = true;
    config.value.url = api.value;
    player.value = new Player(config.value);
  } else {
    close();
    isVisible.drawer = false;
  }
}
</script>

<style lang="less" scoped>
.content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  #player{
    height: 100%;
    border-radius: var(--td-radius-large);
  }
  .btn {
    margin-top: var(--td-comp-margin-xs);
    width: 100%;
  }
}
</style>