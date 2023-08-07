<template>
  <div class="binge-container">
    <div class="main" infinite-wrapper>
      <div class="main-flow-wrap">
        <div v-for="item in bingeList" :key="item.id" class="card-wrap">
          <div class="card" @click="playEvent(item)">
            <div v-if="item.videoUpdate" class="card-header">
              <span class="card-header-tag card-header-tag-orange">
                <span class="card-header-tag-tagtext">有更新哟</span>
              </span>
            </div>
            <div class="card-main">
              <div class="card-close" @click.stop="removeEvent(item)"></div>
              <t-image
                class="card-main-item"
                :src="item.videoImage"
                :style="{ width: '190px', height: '105px' }"
                :lazy="true"
                fit="cover"
              >
                <template #overlayContent>
                  <div class="op">
                    <span v-if="item.siteName"> {{ item.siteName }}</span>
                  </div>
                </template>
              </t-image>
            </div>
            <div class="card-footer">
              <div class="card-footer-title">
                <span class="card-footer-title-name">{{ item.videoName }}</span>
              </div>
              <p class="card-footer-desc">{{ item.videoRemarks }}</p>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import 'v3-infinite-loading/lib/style.css';

import { useEventBus } from '@vueuse/core';
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { ref } from 'vue';

import { sites, star } from '@/lib/dexie';
import zy from '@/lib/utils/tools';
import { usePlayStore } from '@/store';

const ipcRenderer = useIpcRenderer();

const store = usePlayStore();
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

const bingeList = ref([]);

const infiniteId = ref(+new Date());

const getBingeList = async () => {
  try {
    const res = await star.pagination(pagination.value.pageIndex, pagination.value.pageSize);
    res.list.map(async (item) => {
      const { siteKey } = item;
      const { name } = await sites.find({ key: siteKey });
      item.siteName = name;
    });
    bingeList.value = _.unionWith(bingeList.value, res.list, _.isEqual);
    pagination.value.count = res.total;
    pagination.value.pageIndex++;
    return _.size(res.list);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const load = async ($state) => {
  console.log('loading...');
  try {
    const resLength = await getBingeList();
    if (resLength === 0) $state.complete();
    else {
      $state.loaded();
    }
  } catch (error) {
    $state.error();
  }
};

// 播放
const playEvent = async (item) => {
  try {
    const site = await sites.get({ key: item.siteKey });
    const [detailItem] = await zy.detail(item.siteKey, item.videoId);
    const config = {
      type: 'film',
      data: {
        info: detailItem,
        ext: { site: { key: item.siteKey, type: site.type } },
      },
    };

    store.updateConfig(config);
    ipcRenderer.send('openPlayWindow', item.videoName);
  } catch (err) {
    console.error(err);
    MessagePlugin.warning('请求资源站失败，请检查网络!');
  }
};

// 删除
const removeEvent = async (item) => {
  const { id } = item;
  await star.remove(id);
  bingeList.value = _.reject(bingeList.value, { id });
  pagination.value.count--;
};

// 清空
const clearEvent = async () => {
  bingeList.value = [];
  await star.clear();
  getBingeList();
};

// 更新
const updateVideoRemarks = (item, res) => {
  const { id } = item;
  const index = _.findIndex(bingeList.value, { ...item });
  const isUpdate = res.vod_remarks !== bingeList.value[index].videoRemarks;
  bingeList.value[index].videoUpdate = isUpdate;
  bingeList.value[index].videoRemarks = res.vod_remarks;
  star.update(id, { videoRemarks: res.vod_remarks, videoUpdate: isUpdate });
};

const checkUpdaterEvent = async () => {
  await Promise.all(
    bingeList.value.map(async (item) => {
      const { siteKey, videoId } = item;
      try {
        const [res] = await zy.detail(siteKey, videoId);
        if (res.vod_remarks) {
          updateVideoRemarks(item, res);
        }
      } catch (err) {
        console.error(err);
      }
    }),
  );
};

// 监听播放器变更
const eventBus = useEventBus('binge-reload');
eventBus.on(async () => {
  bingeList.value = [];
  if (!_.size(bingeList.value)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getBingeList();
});

// 对父组件暴露
defineExpose({
  clearEvent,
  checkUpdaterEvent,
});
</script>

<style lang="less" scoped>
.binge-container {
  height: inherit;
  .main {
    &-flow-wrap {
      .card-wrap {
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
          .card-header {
            position: absolute;
            color: #fff;
            font-size: 12px;
            z-index: 15;
            height: 18px;
            line-height: 18px;
            left: 0;
            top: 0;
            &-tag {
              height: 18px;
              line-height: 18px;
              padding: 1px 6px;
              border-radius: 5px 0 5px 0;
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
          .card-main {
            width: 100%;
            overflow: hidden;
            border-radius: 5px;
            &:hover .card-close {
              display: block !important;
            }
            .card-main-item {
              .op {
                backdrop-filter: saturate(180%) blur(20px);
                background-color: rgba(22, 22, 23, 0.8);
                border-radius: 0 0 5px 5px;
                width: 100%;
                color: rgba(255, 255, 255, 0.8);
                position: absolute;
                bottom: 0px;
                display: flex;
                justify-content: center;
              }
            }
          }
          .card-footer {
            overflow: hidden;
            height: auto;
            line-height: 26px;
            .card-footer-title {
              display: flex;
              align-items: center;
              &-name {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                font-weight: 500;
              }
            }
            .card-footer-desc {
              line-height: 10px;
              font-size: 10px;
              color: var(--td-gray-color-7);
              font-weight: normal;
            }
          }
        }
      }
    }
  }
}
</style>
