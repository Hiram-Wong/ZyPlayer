<template>
  <div class="history-container mx-auto">
    <div class="main">
      <t-timeline mode="alternate" reverse>
        <t-timeline-item v-for="(itemList, index) in options" :key="index" :label="itemList.time" dot-color="primary">
          <template v-for="item in itemList.data" :key="item.id">
            <div class="card" @click="detailEvent(item)">
              <div class="card-header"></div>
              <div class="card-main">
                <t-image
                  class="card-main-item"
                  :src="item.videoImage"
                  :style="{ width: '170px', height: '105px', borderRadius: '4px' }"
                  :lazy="true"
                  :loading="renderLoading"
                  :error="renderError"
                >
                </t-image>
              </div>
              <div class="card-footer">
                <span class="history-item-title card-footer-item nowrap-two">{{ item.videoName }}</span>
                <p class="history-item-time card-footer-item nowrap">
                  <laptop-icon />
                  <span>观看到{{ filterPlayProgress(item.watchTime, item.duration) }}</span>
                </p>
              </div>
            </div>
          </template>
        </t-timeline-item>
      </t-timeline>
    </div>
    <detail v-model:visible="formDialogDetail" :info="formDetailData" :site="site" />
  </div>
</template>
<script setup lang="jsx">
import { ref } from 'vue';
import { LaptopIcon, LinkUnlinkIcon, LoadingIcon } from 'tdesign-icons-vue-next';
import { findLastIndex } from 'lodash';
import { history } from '@/lib/dexie';
import zy from '@/lib/site/tools';
import Detail from '../../film/detail/Detail.vue';

const renderError = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
    <LinkUnlinkIcon size="1.5em" stroke="#f2f2f2" stroke-width=".8" />
  </div>
);
const renderLoading = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
    <LoadingIcon size="1.5em" stroke="#f2f2f2" stroke-width=".8" />
  </div>
);

const options = ref([]);
const formDialogDetail = ref(false); // dialog是否显示详情
const formDetailData = ref(); // 详情组件传参
const site = ref(); // 详情组件传参

history.all().then((res) => {
  const arry = [];
  console.log(res);
  res.forEach((ele) => {
    const { date } = ele;
    const isFind = findLastIndex(arry, (o) => {
      return o.time === date;
    });
    console.log(isFind);
    if (isFind >= 0) arry[isFind].data.push(ele);
    else {
      arry.push({ time: date, data: [ele] });
    }
  });
  console.log(arry);
  options.value = arry;
});

// 详情
const detailEvent = async (item) => {
  formDetailData.value = await zy.detail(item.siteKey, item.videoId);
  console.log(formDetailData.value);
  site.value = { key: item.siteKey };
  formDialogDetail.value = true;
};

// 播放进度
const filterPlayProgress = (start, all) => {
  const progress = Math.trunc((start / all) * 100);
  if (progress) return `${progress}%`;
  return `0%`;
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';

.history-container {
  .main {
    overflow-y: auto;
    height: calc(100vh - 75px);
    .card {
      position: relative;
      display: inline-block;
      vertical-align: top;
      margin: 10px 15px 10px 0;
      width: 170px;
      height: 187px;
      .history-item-title {
        display: block;
        font-size: 15px;
        letter-spacing: 0.6px;
        line-height: 23px;
        margin: 13px 0 8px;
        font-weight: 400;
      }
      .history-item-time {
        position: relative;
        font-size: 12px;
        color: #999;
        letter-spacing: 0;
        line-height: 16px;
        height: 16px;
        span {
          padding-left: 5px;
        }
      }
      .nowrap-two {
        display: -webkit-box;
        overflow: hidden;
        white-space: normal;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        word-break: break-all;
        word-wrap: break-word;
      }
      .nowrap {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
