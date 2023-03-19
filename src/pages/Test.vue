<template>
  <div class="test">
    <div id="xgplayer" class="xgplayer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Player from 'xgplayer';
import HlsPlugin from 'xgplayer-hls';
import 'xgplayer/dist/xgplayer.min.css';
import 'xgplayer-livevideo';

const xg = ref();
const config = ref({
  id: 'xgplayer',
  url: 'https://hnzy.bfvvs.com/play/yb8OOYma/index.m3u8',
  plugins: [HlsPlugin],
}); // 西瓜播放器参数
onMounted(() => {
  xg.value = new Player(config.value);
});
</script>

<style lang="less" scoped></style>
