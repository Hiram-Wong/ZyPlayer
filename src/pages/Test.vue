<template>
  <div class="test">
    <div id="xgplayer" class="xgplayer"></div>
  </div>
</template>

<script setup type="module">
import 'xgplayer/dist/index.min.css';
import 'xgplayer-livevideo';

import { onMounted, ref } from 'vue';
import Player from 'xgplayer';
import HlsPlugin from 'xgplayer-hls';

// import drpy from '@/lib/utils/drpy/drpy2';

const xg = ref();
// https://pps.sd-play.com/20220427/pyqCdBbv/index.m3u8
const config = ref({
  id: 'xgplayer',
  url: 'https://m3u8.qwertwe.top/cache/efad6de3773567f659ff4ed73c35d259.m3u8?auth_key=1684385344-0-0-72553574f80fc83a2aed64e87f965fcd',
  plugins: [HlsPlugin],
}); // 西瓜播放器参数
onMounted(() => {
  xg.value = new Player(config.value);
  // drpy.init('http://dy.catni.cn/js/%E6%9D%A5%E7%9C%8B%E7%82%B9%E6%92%AD.js');
});
</script>

<style lang="less" scoped></style>
