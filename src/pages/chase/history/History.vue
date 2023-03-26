<template>
  <div ref="affixContainerRef" class="history-container mx-auto">
    <div v-for="(itemList, index) in options" :key="index" class="history-container-item">
      <div class="history-container-item-header">
        <location-icon size="small" class="icon" />
        <span class="title">{{ itemList.time }}</span>
      </div>
      <div class="history-container-item-main">
        <div v-for="item in itemList.data" :key="item.id" class="history-container-item-main-content">
          <div class="card" @click="playEvent(item)">
            <div class="card-header"></div>
            <div class="card-main">
              <t-image
                class="card-main-item"
                :src="item.videoImage"
                :style="{ width: '190px', height: '105px', borderRadius: '4px' }"
                :lazy="true"
                fit="cover"
                overlay-trigger="hover"
              >
                <template #overlayContent>
                  <div class="op" @click.stop="removeEvent(item)">
                    <delete-icon size="small" style="color: #fdfdfd" />
                  </div>
                </template>
              </t-image>
            </div>
            <div class="card-footer">
              <span class="history-item-title card-footer-item nowrap">{{ item.videoName }} {{ item.videoIndex }}</span>
              <p class="history-item-time card-footer-item nowrap">
                <laptop-icon />
                <span>观看到{{ filterPlayProgress(item.watchTime, item.duration) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <infinite-loading ref="infiniteLoading" :distance="200" style="text-align: center" @infinite="load">
      <template #complete>人家是有底线的</template>
      <template #error>哎呀，出了点差错</template>
    </infinite-loading>
  </div>
</template>
<script setup lang="jsx">
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { LaptopIcon, LocationIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';
import moment from 'moment';
import InfiniteLoading from 'v3-infinite-loading';
import { usePlayStore } from '@/store';
import { history } from '@/lib/dexie';
import zy from '@/lib/site/tools';

import 'v3-infinite-loading/lib/style.css';

const ipcRenderer = useIpcRenderer();

const store = usePlayStore();
const options = ref([]);
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

const getHistoryList = async () => {
  let length;
  await history.pagination(pagination.value.pageIndex, pagination.value.pageSize).then((res) => {
    console.log(res);
    const arry = [];
    let timeShow;
    res.list.forEach((ele) => {
      const { date } = ele;
      const timeDiff = filterDate(date);
      if (timeDiff === 0) timeShow = '今天';
      else if (timeDiff < 7) timeShow = '七天内';
      else timeShow = '更早';
      const isFind = _.findLastIndex(arry, (o) => {
        return o.time === timeShow;
      });
      if (isFind >= 0) arry[isFind].data.push(ele);
      else {
        arry.push({ time: timeShow, data: [ele] });
      }
    });
    if (options.value.length === 0) options.value = arry;
    else {
      // arry 数据每次循环都要添加到options
      for (const key1 in arry) {
        let flag = false;
        for (const key2 in options.value) {
          if (arry[key1].time === options.value[key2].time) {
            flag = true;
            options.value[key2].data = options.value[key2].data.concat(arry[key1].data);
            break;
          }
        }
        if (!flag) options.value.push(arry[key1]);
      }
    }
    pagination.value.count = res.total;
    pagination.value.pageIndex++;
    length = _.size(res.list);
  });
  return length;
};

const load = async ($state) => {
  console.log('loading...');
  try {
    const resLength = await getHistoryList();
    if (resLength === 0) $state.complete();
    else {
      $state.loaded();
    }
  } catch (error) {
    console.log(error);
    $state.error();
  }
};

// 播放
const playEvent = async (item) => {
  await zy
    .detail(item.siteKey, item.videoId)
    .then((res) => {
      store.updateConfig({
        type: 'film',
        data: {
          info: res,
          ext: { site: { key: item.siteKey } },
        },
      });

      ipcRenderer.send('openPlayWindow', item.videoName);
    })
    .catch((err) => {
      console.log(err);
      MessagePlugin.warning('请求资源站失败，请检查网络!');
    });
};

// 删除
const removeEvent = async (item) => {
  const { id } = item;
  let index;
  await history.remove(id);
  const timeDiff = filterDate(item.date);
  if (timeDiff === 0) index = 0;
  else if (timeDiff < 7) index = 1;
  else index = 2;
  _.pull(options.value[index].data, _.find(options.value[index].data, { ...item }));
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
  if (progress) return `${progress}%`;
  return `0%`;
};

// 清空
const clearEvent = () => {
  options.value = [];
  getHistoryList();
};

// 对父组件暴露
defineExpose({
  clearEvent,
});
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';

.history-container {
  overflow-y: auto;
  height: 100%;
  .history-container-item {
    &-header {
      .title {
        margin-left: 5px;
        color: #868a8f;
        font-size: 12px;
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
        position: relative;
        .card {
          box-sizing: border-box;
          width: 190px;
          height: 150px;
          position: relative;
          display: inline-block;
          vertical-align: top;
          &-main {
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
              font-weight: 500;
            }
            .history-item-time {
              line-height: 10px;
              font-size: 10px;
              color: var(--td-gray-color-7);
              font-weight: normal;
              span {
                padding-left: 5px;
              }
            }
            .nowrap {
              display: inline-block;
              text-overflow: ellipsis;
              white-space: nowrap;
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
