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
                :style="{ width: '190px', height: '105px', borderRadius: '4px' }"
                :lazy="true"
                fit="cover"
              >
                <template #overlayContent>
                  <div class="op" @click.stop="removeEvent(detail)">
                    <!-- <delete-icon style="color: #fdfdfd" /> -->
                    {{ detail.videoRemarks }}
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
                <span v-else>观看到{{ filterPlayProgress(detail.watchTime, detail.duration) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <infinite-loading :identifier="infiniteId" :distance="200" style="text-align: center" @infinite="load">
      <template #complete>人家是有底线的</template>
      <template #error>哎呀，出了点差错</template>
    </infinite-loading>
  </div>
</template>
<script setup lang="ts">
import 'v3-infinite-loading/lib/style.css';

import { useEventBus } from '@vueuse/core';
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';
import moment from 'moment';
import { LaptopIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { ref } from 'vue';

import { history } from '@/lib/dexie';
import zy from '@/lib/utils/tools';
import { usePlayStore } from '@/store';

const ipcRenderer = useIpcRenderer();

const store = usePlayStore();
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

const infiniteId = ref(+new Date());

const getHistoryList = async () => {
  const { pageIndex, pageSize } = pagination.value;
  const res = await history.pagination(pageIndex, pageSize);

  res.list.forEach((item) => {
    const { date } = item;
    const timeDiff = filterDate(date);
    let timeKey;
    if (timeDiff === 0) timeKey = 'today';
    else if (timeDiff < 7) timeKey = 'week';
    else timeKey = 'ago';
    options.value[timeKey].push(item);
  });

  pagination.value.count = res.total;
  pagination.value.pageIndex++;

  return _.size(res.list);
};

const load = async ($state) => {
  console.log('loading...');

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
    const res = await zy.detail(item.siteKey, item.videoId);
    const { videoName } = item;

    store.updateConfig({
      type: 'film',
      data: {
        info: res,
        ext: { site: { key: item.siteKey } },
      },
    });

    ipcRenderer.send('openPlayWindow', videoName);
  } catch (err) {
    console.log(err);
    MessagePlugin.warning('请求资源站失败，请检查网络!');
  }
};

// 删除
const removeEvent = async (item) => {
  const { id } = item;
  const timeDiff = filterDate(item.date);
  let timeKey;
  await history.remove(id);
  if (timeDiff === 0) timeKey = 'today';
  else if (timeDiff < 7) timeKey = 'week';
  else timeKey = 'ago';
  options.value[timeKey] = _.reject(options.value[timeKey], { id });
  pagination.value.count--;
};

// 日期计算
const filterDate = (date) => {
  const timeToday = moment();
  const timeSource = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  const timeDiff = moment(timeToday).diff(timeSource, 'days');
  return timeDiff;
};

// 播放进度
const filterPlayProgress = (start, all) => {
  const progress = Math.trunc((start / all) * 100);
  return progress ? `${progress}%` : '0%';
};

// 清空
const clearEvent = async () => {
  options.value = {
    today: [],
    week: [],
    ago: [],
  };
  await history.clear();
  getHistoryList();
};

// 监听播放器变更
const eventBus = useEventBus('history-reload');
eventBus.on(async () => {
  options.value = {
    today: [],
    week: [],
    ago: [],
  };
  if (!_.size(options.value)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getHistoryList();
});

// 对父组件暴露
defineExpose({
  clearEvent,
});
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.history-container {
  overflow-y: auto;
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
      &:after {
        content: '';
        display: block;
        clear: both;
      }
      display: grid;
      grid-template-columns: repeat(auto-fill, 190px);
      grid-column-gap: 20px;
      grid-row-gap: 10px;
      justify-content: center;
      width: inherit;
      &-content {
        flex-direction: column;
        float: left;
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

          // padding: 0 10px;
          // @media screen and (min-width: 1251px) {
          //   width: 20%;
          // }
          // @media screen and (min-width: 1499px) {
          //   width: 16.666666%;
          // }
          // @media screen and (min-width: 1799px) {
          //   width: 14.285714%;
          // }
          // @media screen and (min-width: 2048px) {
          //   width: 12.5%;
          // }
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
                background: rgba(0, 0, 0, 0.8);
                position: absolute;
                bottom: 5px;
                right: 5px;
                padding: 0 3px 3px;
                border-radius: 5px;
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
