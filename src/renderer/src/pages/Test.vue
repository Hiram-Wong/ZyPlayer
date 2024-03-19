<template>
  <div class="test">
    <!-- <img src="tmp/thumbnail/output.png" alt="" style="width: 100%;"> -->
    <div id="video"></div>
  </div>
</template>

<script setup type="module">
import { computed, nextTick, onMounted, ref } from 'vue';
import axios from 'axios';
import Worker from '@/utils/drpy/worker?worker';   

const worker = new Worker();

const doWork = (data) => {
  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      const response = event.data;
      resolve(response);
    };

    worker.onerror = (error) => {
      reject(error);
    };

    worker.postMessage(data);
  });
}

onMounted(async() => {
  // const test_rule_url = 'https://zy.catni.cn/996%E5%BD%B1%E8%A7%86.js';
  // const test_rule_url = 'https://ghproxy.liuzhicong.com/https://github.com/hjdhnx/dr_py/raw/main/js/ikanbot3.js';
  // const test_rule_url = 'https://raw.githubusercontent.com/hjdhnx/dr_py/main/js/360%E5%BD%B1%E8%A7%86.js';
  // const test_rule_url = 'http://hipy.nokia.press/files/drpy_js/%E8%8D%90%E7%89%87.js';


  // const test_data = await axios.get(test_rule_url);
  // const rule = test_data.data;

  // const init_res = await doWork({type:'init', data: rule});
  // console.log(init_res)
  // const home_res = await doWork({type:'home'});
  // console.log(home_res)
  // const homeVod_res = await doWork({type:'homeVod'});
  // console.log(homeVod_res)
  // const category_res = await doWork({type:'category', data: { tid:3, pg: 1, filter:false, extend:{} }});
  // console.log(category_res)
  // const detail_res = await doWork({type:'detail', data: '3$/detail/790.html'});
  // console.log(detail_res)
  // const play_res = await doWork({type:'play', data: { flag:'索尼', id:'https://www.cs1369.com/play/790-1-1.html', flags:[] }});
  // console.log(play_res)
});

</script>

<style lang="less" scoped></style>
