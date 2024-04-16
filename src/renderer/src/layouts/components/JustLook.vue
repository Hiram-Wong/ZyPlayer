<template>
  <div class="just-look view-container">
    <t-button theme="default" shape="square" variant="text" @click="play">
      <dvd-icon />
    </t-button>
    <t-drawer
      v-model:visible="isVisible.drawer"
      size-draggable
      show-in-attached-element
      :footer=null
      :attach="`.${prefix}-content`"
      @confirm="change"
      @close="close"
      size="320px"
    >
      <div class="content">
        <div id="mse"></div>
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
import { ref, reactive } from 'vue';
import Player from 'xgplayer';

import { fetchSettingDetail } from '@/api/setting';
import { prefix } from '@/config/global';

const isVisible = reactive({
  drawer: false
});
const api = ref();
const player = ref();
const config = ref({
  id: 'mse',
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

const change = () => {
  player.value.src = api.value;
}

const close = () => {
  if (player.value) {
    player.value.destroy();
    player.value = null;
  }
  isVisible.drawer = false;
}

const play = async() => {
  if (!isVisible.drawer) {
    await getData();
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