<template>
  <div :class="[`${prefix}-header-container`]">
    <div class="left system-functions">
      <div class="back-main system-function no-drag-region">
        <t-button theme="default" variant="text" class="btn" @click="handleBackMain">
          <template #icon><home-icon /></template>
          {{ $t('pages.player.header.backMain') }}
        </t-button>
      </div>
    </div>
    <div class="spacer system-functions">
      <span class="txthide txthide1">{{ formData }}</span>
    </div>
    <div class="right system-functions">
      <system-control class="system-function no-drag-region" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { APP_NAME } from '@shared/config/appinfo';
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { HomeIcon } from 'tdesign-icons-vue-next';
import { onMounted, ref, watch } from 'vue';

import logoIcon from '@/assets/icon.png';
import SystemControl from '@/components/system-control/index.vue';
import { prefix } from '@/config/global';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});

const formData = ref(props.title);

watch(
  () => props.title,
  (val) => (formData.value = val),
);
watch(
  () => formData.value,
  () => setSystemMediaMetadata(),
);

onMounted(() => setup());

const setup = () => {
  setSystemMediaMetadata();
};

const handleBackMain = () => {
  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_MAIN);
};

const setSystemMediaMetadata = () => {
  if ('mediaSession' in navigator) {
    const doc = {
      title: formData.value,
      artist: APP_NAME,
      artwork: [{ src: logoIcon, sizes: '128x128', type: 'image/png' }],
    };

    navigator.mediaSession.metadata = new MediaMetadata(doc);
  }
};
</script>
<style lang="less" scoped>
.back-main {
  width: auto;
}
</style>
