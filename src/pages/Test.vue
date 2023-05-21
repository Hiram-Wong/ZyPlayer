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
  url: 'https://cdn.oss-cn-m3u8.tv-nanjing-chengdu.myqcloud.com.zh188.net/Play-QY.php?url=M3EvQmdSaEtGZ2c0NWU0MnFqWHA3SjYrQTcwL2FwaldmLytnMC9wTVNwbjUwaGdET3VvZFhxcndpa1FDU0ZaTllOTkk5Y0NhQUllSDdpK3YycmdkckZidGZGVW80ZHR5cHFsUnVUQmU2M1laT1RUOFJRNDhaR0gvSitCOEpSODI1NEhXTFNMK0l2blBNQ1M1RW02amxUSklCTDZVbllCWXNrNlFSWEZmNHdsSzdDdTYrNVVDMG82QVcya1ZrVVJUa0RqSVhaS2FLdE1mNUNjeitNN2tTV2MzWVVxUW1oVktqYkdxRWwyVnBVTDE2R1FKWVlCeStDTzEySnhaSmF6VFpDUXdEeWtSRkhLTjJKaXluRXJ1Rmc9PQ==.m3u8',
  plugins: [HlsPlugin],
}); // 西瓜播放器参数
onMounted(() => {
  xg.value = new Player(config.value);
  // drpy.init('http://dy.catni.cn/js/%E6%9D%A5%E7%9C%8B%E7%82%B9%E6%92%AD.js');
});
</script>

<style lang="less" scoped></style>
