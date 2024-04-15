<template>
  <div class="binge view-container">
    <div class="content">
      <div class="container">
        <div class="content-wrapper">
          <t-row :gutter="[16, 16]">
            <t-col
              :md="3" :lg="3" :xl="2" :xxl="1"
              v-for="item in bingeConfig.data"
              :key="item.id"
              class="card"
              @click="playEvent(item)"
            >
              <div class="card-main">
                <div class="card-tag card-tag-orange" v-if="item.videoUpdate">
                  <span class="card-tag-text text-hide">有更新哟</span>
                </div>
                <div class="card-close" @click.stop="removeEvent(item)"></div>
                <t-image
                  class="card-main-item"
                  :src="item.videoImage"
                  :style="{ width: '100%', background: 'none', overflow: 'hidden' }"
                  :lazy="true"
                  fit="cover"
                  :loading="renderLoading"
                  :error="renderError"
                >
                  <template #overlayContent>
                    <div class="op">
                      <span>{{ item.siteName ? item.siteName : $t('pages.chase.sourceDeleted') }}</span>
                    </div>
                  </template>
                </t-image>
              </div>
              <div class="card-footer">
                <p class="card-footer-title text-hide">{{ item.videoName }}</p>
                <p class="card-footer-desc text-hide">{{ item.videoRemarks ? item.videoRemarks.trim() : '' }}</p>
              </div>
            </t-col>
          </t-row>
          <infinite-loading
            :identifier="infiniteId"
            style="text-align: center"
            :duration="200"
            @infinite="load"
          >
            <template #complete>{{ $t('pages.chase.infiniteLoading.complete') }}</template>
            <template #error>{{ $t('pages.chase.infiniteLoading.error') }}</template>
          </infinite-loading>
        </div>
      </div>
    </div>

    <detail-view v-model:visible="isVisible.detail" :site="siteData" :data="formDetailData"/>
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import { useEventBus } from '@vueuse/core';
import PQueue from 'p-queue';
import _ from 'lodash';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { ref, reactive } from 'vue';

import { usePlayStore } from '@/store';

import { fetchStarList, delStar } from '@/api/star';
import { fetchFilmDetail, fetchSiteList } from '@/api/site';
import { catvodRuleInit, fetchDetail, t3RuleInit } from '@/utils/cms';
import DetailView from '../../film/Detail.vue';

const store = usePlayStore();

const renderError = () => {
  return (
    <div class="renderIcon" style="width: 100%">
      <img src={ lazyImg } style="width: 100%; object-fit: cover;"/>
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="width: 100%">
      <img src={ lazyImg } style="width: 100%; object-fit: cover;"/>
    </div>
  );
};

const queue = new PQueue({ concurrency: 5 }); // 设置并发限制为5

const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});
const formDetailData = ref({
  neme: '',
  key: '',
  type: 1,
}); //  详情组件源传参
const siteData = ref();
const isVisible = reactive({
  detail: false
});
const bingeConfig = ref({
  data: []
});
const siteConfig = ref({
  data: []
})

const infiniteId = ref(+new Date());

const getBingeList = async () => {
  let length = 0;
  try {
    const { pageIndex, pageSize } = pagination.value;

    const [star_res, site_res] = await Promise.all([
      fetchStarList(pageIndex, pageSize),
      fetchSiteList()
    ]);

    if (_.has(site_res, "data") && !_.isEmpty(site_res["data"])) {
      siteConfig.value.data = site_res["data"]
    }

    for (const item of star_res.data) {
      const findItem = siteConfig.value.data.find(({ id }) => id === item.relateId);
      if (findItem) item.site = { ...findItem };
      item.siteName = findItem ? findItem.name : "";
    }

    bingeConfig.value.data = _.unionWith(bingeConfig.value.data, star_res.data, _.isEqual);

    pagination.value.count = star_res.total;
    pagination.value.pageIndex++;
    
    length = _.size(star_res.data);
    return length;
  } catch (err) {
    console.error(err);
    length = 0;
  } finally {
    console.log(`[binge] load data length: ${length}`);
    return length;
  } 
};

const load = async ($state) => {
  console.log('[binge] loading...');
  try {
    const resLength = await getBingeList();
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (error) {
    $state.error();
  }
};

// 播放
const playEvent = async (item) => {
  try {
    const { videoName, videoId } = item;
    const site = siteConfig.value.data.find(({ id }) => id === item.relateId);
    siteData.value = site;
    if (site.type === 7) {
      await t3RuleInit(site);
    } else if(site.type === 8) await catvodRuleInit(site);
    if (!('vod_play_from' in item && 'vod_play_url' in item)) {
      const [detailItem] = await fetchDetail(site, videoId);
      item = detailItem;
    }
    console.log(item);

    const playerType = store.getSetting.broadcasterType;

    if (playerType === 'custom') {
      formDetailData.value = item;
      isVisible.detail = true;
    } else {
      const config = {
        type: 'film',
        data: {
          info: item,
          ext: { site: site }
        }
      };

      store.updateConfig(config);
      window.electron.ipcRenderer.send('openPlayWindow', videoName);
    }
  } catch (err) {
    console.error(err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  }
};

// 删除
const removeEvent = async (item) => {
  const { id } = item;
  await delStar(id);
  bingeConfig.value.data = _.reject(bingeConfig.value.data, { id });
  pagination.value.count--;
};

// 更新
const updateVideoRemarks = (item, res) => {
  const index = _.findIndex(bingeConfig.value.data, { ...item });
  const isUpdate = res.vod_remarks !== bingeConfig.value.data[index].videoRemarks;
  bingeConfig.value.data[index].videoUpdate = isUpdate;
  bingeConfig.value.data[index].videoRemarks = res.vod_remarks;
};

const checkUpdaterEvent = async () => {
  const fetchAndUpdateVideoRemarks = async (item) => {
    if (!item.siteName) return;
    const { site, videoId } = item;
    try {
      if (site.type === 7) await t3RuleInit(site);
      else if(site.type === 8) await catvodRuleInit(site);
      const [res] = await fetchDetail(site, videoId);
      if (res.vod_remarks) {
        updateVideoRemarks(item, res);
      }
    } catch (err) {
      console.error(err);
    }
  };
  await Promise.all(
    bingeConfig.value.data.map(async (item) => {
      await queue.add(() => fetchAndUpdateVideoRemarks(item));
    }),
  );
};

// 监听播放器变更
const eventBus = useEventBus('binge-reload');
eventBus.on(() => {
  bingeConfig.value.data = [];
  if (!_.size(bingeConfig.value.data)) infiniteId.value++;
  pagination.value.pageIndex = 0;
});

// 对父组件暴露
defineExpose({
  checkUpdaterEvent,
});
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  padding-top: var(--td-comp-paddingTB-m);
  .content {
    .container {
      .content-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
        .card {
          box-sizing: border-box;
          width: inherit;
          position: relative;
          cursor: pointer;
          border-radius: var(--td-radius-medium);
          .card-close {
            display: none;
            position: absolute;
            right: -9px;
            top: -9px;
            height: 22px;
            width: 22px;
            background: url(../../../assets/close.png) 0 0 no-repeat;
            z-index: 1000;
            cursor: pointer;
            background-size: 100%;
          }
          .text-hide {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
          }
          .card-main {
            position: relative;
            width: 100%;
            height: 0;
            border-radius: 7px;
            padding-top: 62%;
            &:hover {
              .card-main-item {
                overflow: hidden;
                :deep(img) {
                  transition: all 0.25s ease-in-out;
                  transform: scale(1.05);
                }
              }
            }
            &:hover .card-close {
              display: block !important;
            }
            .card-tag-orange {
              background: #ffdd9a;
              color: #4e2d03;
            }
            .card-tag {
              z-index: 15;
              position: absolute;
              left: 0;
              top: 0;
              border-radius: 6px 0 6px 0;
              padding: 1px 6px;
              max-width: 60%;
              .card-tag-text {
                font-size: 12px;
                height: 18px;
                line-height: 18px;
              }
            }
            .card-main-item {
              position: absolute;
              top: 0;
              left: 0;
              display: block;
              width: 100%;
              height: 100%;
              border-radius: 5px;
              .op {
                background-color: rgba(22, 22, 23, 0.8);
                width: 100%;
                color: rgba(255, 255, 255, 0.8);
                position: absolute;
                bottom: 0;
                display: flex;
                justify-content: center;
              }
            }
          }
          .card-footer {
            position: relative;
            padding-top: var(--td-comp-paddingTB-s);
            .card-footer-title {
              font-weight: 700;
              line-height: var(--td-line-height-title-medium);
              height: 22px;
            }
            .card-footer-desc {
              font-size: 13px;
              line-height: var(--td-line-height-body-large);
              color: var(--td-text-color-placeholder);
            }
          }
        }
      }
    }
  }
}
</style>
