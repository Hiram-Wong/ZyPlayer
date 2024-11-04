<template>
  <div class="layout">
    <t-layout>
      <t-header height=32 :class="`${prefix}-header`">
        <header-view class="header" :title="headerFormData.title"/>
      </t-header>
      <t-layout>
        <t-content :class="`${prefix}-content`">
          <player-view ref="playerRef" :class='["subject", active.aside ? "subject-ext": "" ]' @update-time="handleTimeUpdate"/>
          <div class="btn-box dock-show" @click="toggleAside">
            <chevron-left-icon v-if="active.aside" class="btn-icon" />
            <chevron-right-icon v-else class="btn-icon" />
          </div>
        </t-content>
        <t-aside key="side" :class="`${prefix}-aside`" v-show="!active.aside">
          <aside-film-view
            class="container-aside"
            v-if="storeConf.type === 'film'"
            :info="asideFormData.info"
            :ext="asideFormData.ext"
            :process="processFormData"
            @update="updateConf"
            @play="updatePlay"
          />
          <aside-iptv-view class="container-aside"
            v-if="storeConf.type === 'iptv'"
            :info="asideFormData.info"
            :ext="asideFormData.ext"
            @update="updateConf"
            @play="updatePlay"
          />
          <aside-drive-view class="container-aside"
            v-if="storeConf.type === 'drive'"
            :info="asideFormData.info"
            :ext="asideFormData.ext"
            @update="updateConf"
            @play="updatePlay"
          />
        </t-aside>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import './index.less';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'tdesign-icons-vue-next';
import { usePlayStore } from '@/store';
import { prefix } from '@/config/global';
import HeaderView from './componets/Header.vue';
import AsideFilmView from './componets/AsideFilm.vue';
import AsideIptvView from './componets/AsideIptv.vue';
import AsideDriveView from './componets/AsideDrive.vue';
import PlayerView from '@/components/player/index.vue';


const store: { [key: string]: any } = usePlayStore();
const active = ref({
  aside: false
});
const storeConf = computed(() => {
  return {
    type: store.type,
    info: store.data.info,
    ext: store.data.ext,
    setting: store.setting
  }
});
const headerFormData = ref({
  title: '',
});
const playerFormData = ref({
  url: '',
  isLive: false,
  headers: {},
  type: '',
  startTime: 0,
  container: 'play-mse'
});
const asideFormData = ref({
  info: storeConf.value.info,
  ext: storeConf.value.ext
});
const processFormData = ref({
  currentTime: 0,
  duration: 0
});
const playerRef = useTemplateRef('playerRef');

onMounted(() => {
  setupConf();
});

const toggleAside = () => {
  active.value.aside = !active.value.aside;
};

const setupConf = () => {
  if (storeConf.value.type === 'iptv') {
    headerFormData.value.title = storeConf.value.info.name;
    asideFormData.value = { info: storeConf.value.info, ext: storeConf.value.ext };
  } else if (storeConf.value.type === 'drive') {
    headerFormData.value.title = storeConf.value.info.name;
    asideFormData.value = { info: storeConf.value.info, ext: storeConf.value.ext };
  } else if (storeConf.value.type === 'film') {
    headerFormData.value.title = storeConf.value.info.vod_name;
    asideFormData.value = { info: storeConf.value.info, ext: storeConf.value.ext };
  }
};

const updateConf = (item) => {
  store.updateConfig({ ...item });
  setupConf();
};

const updatePlay = async (item) => {
  playerFormData.value = { ...playerFormData.value, ...item };
  await playerRef.value?.init();
  console.log(playerFormData.value)
  await playerRef.value?.create({ ...playerFormData.value });
  if (storeConf.value.type === 'film') await playerRef.value?.onTimeUpdate();
  // await playerRef.value?.create({
  //   url: 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/hls/xgplayer-demo.m3u8',
  //   type: 'customHls',
  //   container: adapterContainers[activePlayer]
  // });
  // await playerRef.value?.create({
  //   url: 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
  //   type: 'customMp4',
  //   container: adapterContainers[activePlayer]
  // });

};

const handleTimeUpdate = (time) => {
  processFormData.value = time;
};

window.electron.ipcRenderer.on('destroy-playerWindow', () => {
  store.updateConfig({
    status: false,
  });
});

window.electron.ipcRenderer.on('media-control', async (_, status) => {
  if (status) await playerRef.value?.play();
  else await playerRef.value?.pause();
});
</script>

<style lang="less" scoped>
</style>
