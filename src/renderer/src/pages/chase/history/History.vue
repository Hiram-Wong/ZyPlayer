<template>
  <div class="history-container">
    <div v-for="(item, name, index) in options" :key="index" class="history-container-item">
      <div v-if="item.length !== 0" class="history-container-item-header">
        <span v-if="name === 'today'" class="title">今天</span>
        <span v-if="name === 'week'" class="title">七天内</span>
        <span v-if="name === 'ago'" class="title">更早</span>
      </div>
      <div class="history-container-item-main">
        <div v-for="detail in item" :key="detail.id" class="history-container-item-main-content">
          <div class="card" @click="playEvent(detail)">
            <div class="card-header"></div>
            <div class="card-main">
              <div class="card-close" @click.stop="removeEvent(detail)"></div>
              <t-image
                class="card-main-item"
                :src="detail.videoImage"
                :style="{ width: '190px', height: '105px', borderRadius: '4px', background: 'none' }"
                :lazy="true"
                fit="cover"
                :loading="renderLoading"
                :error="renderError"
              >
                <template #overlayContent>
                  <div class="op">
                    <span v-if="detail.siteName"> {{ detail.siteName }}</span>
                  </div>
                </template>
              </t-image>
            </div>
            <div class="card-footer">
              <span class="history-item-title card-footer-item nowrap">
                {{ detail.videoName }} {{ detail.videoIndex }}
              </span>
              <p class="history-item-time card-footer-item nowrap">
                <laptop-icon />
                <span v-if="detail.playEnd">已看完</span>
                <span v-else>观看到{{ formatProgress(detail.watchTime, detail.duration) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <infinite-loading
      :identifier="infiniteId"
      style="text-align: center; margin-bottom: 2em"
      :duration="200"
      @infinite="load"
    >
      <template #complete>人家是有底线的</template>
      <template #error>哎呀，出了点差错</template>
    </infinite-loading>
    <detail-view v-model:visible="isVisible.detail" :site="siteData" :data="formDetailData"/>
  </div>
</template>
<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import { useEventBus } from '@vueuse/core';

import _ from 'lodash';
import moment from 'moment';
import { LaptopIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { ref, reactive } from 'vue';

import { delHistory, fetchHistoryList } from '@/api/history';
import { fetchSiteList } from '@/api/site';
import { fetchDetail } from '@/utils/cms';
import { usePlayStore } from '@/store';
import DetailView from '../../film/Detail.vue';

const store = usePlayStore();
const renderError = () => {
  return (
    <div class="renderIcon" style="width: 100%; height: 100px; overflow: hidden;">
      <img src={ lazyImg } style="width: 100%; height: 100%; object-fit: cover;"/>
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="width: 100%; height: 100px; overflow: hidden;">
      <img src={ lazyImg } style="width: 100%; height: 100%; object-fit: cover;"/>
    </div>
  );
};

const options = ref({
  today: [],
  week: [],
  ago: [],
});
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
const infiniteId = ref(+new Date());
const siteConfig = ref({
  data: []
})

const getHistoryList = async () => {
  let length = 0;
  try {
    const { pageIndex, pageSize } = pagination.value;

    const [history_res, site_res] = await Promise.all([
      fetchHistoryList(pageIndex, pageSize, "film"),
      fetchSiteList()
    ]);

    if (_.has(site_res, "data") && !_.isEmpty(site_res["data"])) {
      siteConfig.value.data = site_res["data"]
    }

    for (const item of history_res.data) {
      const findItem = siteConfig.value.data.find(({ id }) => id === item.relateId);
      if (findItem) item.site = { ...findItem };
      item.siteName = findItem ? findItem.name : '该源应该被删除了哦';
      const timeDiff = filterDate(item.date);
      let timeKey;
      if (timeDiff === 0) timeKey = 'today';
      else if (timeDiff < 7) timeKey = 'week';
      else timeKey = 'ago';
      options.value[timeKey].push(item);
    }

    pagination.value.count = history_res.total;
    pagination.value.pageIndex++;

    length = _.size(history_res.data);
    return length;
  } catch (err) {
    console.error(err);
    length = 0;
  } finally {
    console.log(`[history] load data length: ${length}`);
    return length;
  } 
};

const load = async ($state) => {
  console.log('[history] loading...');

  try {
    const resLength = await getHistoryList();
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.log(err);
    $state.error();
  }
};

// 播放
const playEvent = async (item) => {
  try {
    const { videoName, relateId, videoId } = item;
    const site = siteConfig.value.data.find(({ id }) => id === item.relateId);
    siteData.value = site;
    if ( !('vod_play_from' in item && 'vod_play_url' in item) ) {
      const [detailItem] = await fetchDetail(site, videoId);
      item = detailItem;
    }
    console.log(item);

    const playerType = store.getSetting.broadcasterType;

    if (playerType === 'custom' ) {
      formDetailData.value = item;
      isVisible.detail = true;
    } else {
      const config = {
        type: 'film',
        data: {
          info: item,
          ext: { site: { key: relateId, type: site.type } },
        },
      };

      store.updateConfig(config);
      window.electron.ipcRenderer.send('openPlayWindow', videoName);
    }
  } catch (err) {
    console.error(err);
    MessagePlugin.warning('请求资源站失败，请检查网络!');
  }
};

// 删除
const removeEvent = async (item) => {
  const { id } = item;
  const timeDiff = filterDate(item.date);
  let timeKey;
  console.log(item,id)
  delHistory(id);
  if (timeDiff === 0) timeKey = 'today';
  else if (timeDiff < 7) timeKey = 'week';
  else timeKey = 'ago';
  options.value[timeKey] = _.reject(options.value[timeKey], { id });
  pagination.value.count--;
};

// 日期计算
const filterDate = (date) => {
  const timeToday = moment().format('YYYY-MM-DD');
  const timeSource = moment.unix(date).format('YYYY-MM-DD'); // Parse Unix timestamp
  const timeDiff = moment(timeToday).diff(timeSource, 'days');
  return timeDiff;
};

// 播放进度
const formatProgress = (start, all) => {
  const progress = Math.trunc((start / all) * 100);
  return progress ? `${progress}%` : '0%';
};

// 监听播放器变更
const eventBus = useEventBus('history-reload');
eventBus.on(() => {
  options.value = {
    today: [],
    week: [],
    ago: [],
  };
  if (!_.size(options.value)) infiniteId.value++;
  pagination.value.pageIndex = 0;
});
</script>

<style lang="less" scoped>
.history-container {
  height: 100%;
  .history-container-item {
    &-header {
      position: relative;
      height: 40px;
      line-height: 40px;
      font-size: 20px;
      font-weight: 700;
      text-align: left;
      .title {
        position: relative;
        display: inline-block;
        padding-right: 18px;
        vertical-align: middle;
        z-index: 10;
      }
    }
    &-main {
      display: grid;
      grid-template-columns: repeat(auto-fill, 190px);
      grid-column-gap: 20px;
      grid-row-gap: 10px;
      justify-content: center;
      width: inherit;
      &-content {
        flex-direction: column;
        display: inline-block;
        width: 190px;
        margin: 10px 15px 10px 0;
        position: relative;
        &:hover {
          .card-main-item {
            :deep(img) {
              transition: all 0.25s ease-in-out;
              transform: scale(1.05);
            }
          }
        }
        .card {
          box-sizing: border-box;
          width: 190px;
          height: 160px;
          position: relative;
          display: inline-block;
          vertical-align: top;
          &-header {
            position: absolute;
            color: #fff;
            font-size: 12px;
            z-index: 15;
            height: 18px;
            line-height: 18px;
            right: 0;
            top: 0;
            &-tag {
              height: 18px;
              line-height: 18px;
              padding: 1px 6px;
              border-radius: 0 7px 0 7px;
              background: #03c8d4;
              display: block;
              &-tagtext {
                display: inline-block;
                font-size: 12px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                max-width: 100px;
              }
            }
            &-tag-orange {
              background: #ffdd9a;
              color: #4e2d03;
            }
          }
          &-close {
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
          &-main {
            margin-bottom: 13px;
            overflow: hidden;
            border-radius: 5px;
            &:hover .card-close {
              display: block !important;
            }
            &-item {
              .op {
                background-color: rgba(22, 22, 23, 0.8);
                border-radius: 0 0 4px 4px;
                width: 100%;
                color: rgba(255, 255, 255, 0.8);
                position: absolute;
                bottom: 0px;
                display: flex;
                justify-content: center;
                span {
                  font-size: 12px;
                  font-weight: bolder;
                }
              }
            }
          }
          &-footer {
            max-width: 190px;
            .history-item-title {
              font-weight: 700;
              line-height: 20px;
              width: 100%;
              height: 21px;
              margin-bottom: 4px;
            }
            .history-item-time {
              height: 16px;
              position: relative;
              color: var(--td-gray-color-7);
              font-size: 12px;
              display: block;
              line-height: 16px;
              span {
                padding-left: 5px;
              }
            }
            .nowrap {
              display: -webkit-box;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
              overflow: hidden;
              height: auto;
              width: 100%;
            }
          }
        }
      }
    }
  }
}
:deep(.t-affix) {
  background-color: #fbfbfb;
  padding-bottom: 10px;
}
:root[theme-mode='dark'] {
  :deep(.t-affix) {
    background-color: #000 !important;
  }
}
</style>
