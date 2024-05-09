<template>
  <div class="just-look view-container">
    <t-button theme="default" shape="square" variant="text" @click="toggleDrawerAndHandlePlayer">
      <dvd-icon />
    </t-button>
    <t-drawer v-model:visible="isVisible.drawer" size-draggable show-in-attached-element :footer=null
      :attach="`.${prefix}-content`" @confirm="change" @close="close" size="320px">
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

import { MessagePlugin } from 'tdesign-vue-next';
import { DvdIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { ref, reactive } from 'vue';
import Player from 'xgplayer';

import { fetchSettingDetail } from '@/api/setting';
import { prefix } from '@/config/global';
import { t } from '@/locales';

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

const fetchDataAndSetPlayerConfig = async () => {
  const res = await fetchSettingDetail('defaultViewCasual');

  if (!res.value) {
    MessagePlugin.info(t('pages.justlook.message.noData'));
    return;
  }

  api.value = res.value;
  config.value.url = res.value;
}

const initializePlayer = () => {
  player.value = new Player(config.value);
}

const toggleDrawerAndHandlePlayer = async () => {
  if (!isVisible.drawer) {
    await fetchDataAndSetPlayerConfig();
    isVisible.drawer = true;

    if (api.value) {
      initializePlayer();
    }
  } else {
    close();
    isVisible.drawer = false;
  }
}

const close = () => {
  if (player.value) {
    player.value.destroy();
    player.value = null;
  }
}

const change = () => {
  if (player.value) {
    player.value.src = api.value;
  }
}
</script>

<style lang="less" scoped>
.content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  #player {
    height: 100%;
    border-radius: var(--td-radius-large);
  }

  .btn {
    margin-top: var(--td-comp-margin-xs);
    width: 100%;
  }
}
</style>
