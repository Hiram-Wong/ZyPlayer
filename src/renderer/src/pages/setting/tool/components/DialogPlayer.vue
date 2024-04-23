<template>
  <t-dialog
    v-model:visible="formVisible"
    :width="650"
    :header="$t('pages.setting.editSource.dialog.player.title')"
    placement="center"
    :footer="false"
  >
    <template #body>
      <div id="previewMse" ref="dpRef"></div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import '@/style/player/veplayer.css';

import { ref, reactive, watch } from 'vue';
import DPlayer from 'dplayer';
import flvjs from 'flv.js';
import Hls from 'hls.js';

import { checkMediaType } from '@/utils/tool';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    default: ''
  }
});
const formVisible = ref(false);
const dpRef = ref();
const formData = reactive({
  url: '',
  isActive: true,
});

const playerConfig = reactive({
  dp: {
    container: dpRef,
    autoplay: true,
    video: {}
  }
});

const dpPlayer = ref();

const emit = defineEmits(['update:visible']);
watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);

    if (val) {
      setupPlayer(formData.url);
    } else {
      if (dpPlayer.value) {
        dpPlayer.value.destroy();
        dpPlayer.value = null;
      };
    };
  }
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
  },
);
watch(
  () => props.url,
  (val) => {
    formData.url = val;
  },
);

const setupPlayer = async(url) => {
  const videoType = await checkMediaType(url);

  switch (videoType) {
    case 'mp4':
      playerConfig.dp.video = { url };
      break;
    case 'flv':
      playerConfig.dp.video = {
        url,
        type: 'customFlv',
        customType: {
          customFlv: (video, player) => {
            const flvPlayer = flvjs.createPlayer({
              type: 'flv',
              url: video.src,
            });
            flvPlayer.attachMediaElement(video);
            flvPlayer.load();
          }
        }
      };
      break;
    case 'm3u8':
      playerConfig.dp.video = {
        url,
        type: 'customHls',
        customType: {
          customHls: (video, player) => {
            const hls = new Hls();
            hls.loadSource(video.src);
            hls.attachMedia(video);
          }
        }
      };
      break;
    default:
      playerConfig.dp.video = {
        url,
        type: 'customHls',
        customType: {
          customHls: (video, player) => {
            const hls = new Hls();
            hls.loadSource(video.src);
            hls.attachMedia(video);
          }
        }
      };
      break;
  }

  dpPlayer.value = new DPlayer({ ...playerConfig.dp });
};
</script>

<style lang="less" scoped>
</style>
