<template>
  <div class="binge-container mx-auto">
    <div class="main" infinite-wrapper>
      <div class="wrap-item">
        <div class="tv-wrap">
          <div class="tv-content">
            <waterfall
              ref="bingeWaterfall"
              :list="bingeList.list"
              :breakpoints="BREAK_POINTS"
              :gutter="20"
              :width="190"
              animation-effect="fadeIn"
              background-color="rgba(0, 0, 0, 0)"
            >
              <template #item="{ item }">
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
                    <span class="card-footer-title card-footer-item">{{ item.videoName }}</span>
                    <p class="card-footer-desc card-footer-item"></p>
                  </div>
                </div>
              </template>
            </waterfall>
            <infinite-loading ref="infiniteLoading" :distance="200" style="text-align: center" @infinite="load">
              <template #complete>没有更多内容了</template>
              <template #error>哎呀，出了点差错</template>
            </infinite-loading>
          </div>
        </div>
      </div>
    </div>
    <detail v-model:visible="formDialogDetail" :info="formDetailData" :site="site" />
  </div>
</template>

<script setup lang="jsx">
import { ref } from 'vue';
import { LinkUnlinkIcon, LoadingIcon } from 'tdesign-icons-vue-next';
// import _ from 'lodash';
import { unionWith, isEqual, size } from 'lodash';
import { Waterfall } from 'vue-waterfall-plugin-next';
import InfiniteLoading from 'v3-infinite-loading';
import { star } from '@/lib/dexie';
import zy from '@/lib/site/tools';
import Detail from '../../film/detail/Detail.vue';
import 'vue-waterfall-plugin-next/style.css';
import 'v3-infinite-loading/lib/style.css';

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

const BREAK_POINTS = {
  1200: {
    rowPerView: 4, // 当屏幕宽度小于等于1200
  },
  800: {
    rowPerView: 3, // 当屏幕宽度小于等于800
  },
  500: {
    rowPerView: 2, // 当屏幕宽度小于等于500
  },
};

const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

const bingeList = ref([]);
const formDialogDetail = ref(false); // dialog是否显示详情
const formDetailData = ref(); // 详情组件传参
const site = ref(); // 详情组件传参

const getBingeList = async () => {
  let length;
  await star.pagination(pagination.value.pageIndex, pagination.value.pageSize).then((res) => {
    console.log(res);
    // bingeList.value.list = _.unionWith(bingeList.value.list, res.list, _.isEqual);
    bingeList.value.list = unionWith(bingeList.value.list, res.list, isEqual);
    pagination.value.pageIndex++;
    // length = _.size(res.list);
    length = size(res.list);
  });
  return length;
};

const load = async ($state) => {
  console.log('loading...');
  try {
    const resLength = await getBingeList();
    if (resLength < pagination.value.pageSize) $state.complete();
    else {
      // $state.loaded();
    }
  } catch (error) {
    $state.error();
    console.log(error);
  }
};

// 详情
const detailEvent = async (item) => {
  formDetailData.value = await zy.detail(item.siteKey, item.videoId);
  console.log(formDetailData.value);
  site.value = { key: item.siteKey };
  formDialogDetail.value = true;
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';
.binge-container {
  .main {
    overflow-y: auto;
    height: calc(100vh - 75px);
    .card {
      position: relative;
      display: inline-block;
      vertical-align: top;
      width: 170px;
      height: 150px;
      .card-header {
        color: #fbfbfb;
        position: absolute;
        z-index: 2222;
        .t-tag {
          position: absolute;
          top: 5px;
          left: 5px;
          font-size: 10px;
        }
      }
      .card-main {
        width: 100%;
        // height: 100%;
        .card-main-item {
          .op {
            background-color: rgba(0, 0, 0, 0.5);
            width: 100%;
            color: #f2f2f2;
            position: absolute;
            bottom: 0px;
            display: flex;
            justify-content: center;
          }
        }
      }
      .card-footer {
        height: 52px;
        padding-top: 10px;
        overflow: hidden;
        height: auto;
        line-height: 26px;
        .card-footer-title {
          height: auto;
          line-height: 26px;
          font-size: 14px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        .card-footer-desc {
          height: auto;
          line-height: 26px;
          font-size: 13px;
          color: #999;
          font-weight: normal;
          display: flex;
          justify-content: center;
        }
      }
    }
  }
}
</style>
