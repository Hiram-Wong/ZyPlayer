<template>
  <div class="binge-container mx-auto">
    <div class="main" infinite-wrapper>
      <div class="main-flow-wrap">
        <div v-for="item in bingeList" :key="item.id" class="card-wrap">
          <div class="card" @click="playEvent(item)">
            <div class="card-header"></div>
            <div class="card-main">
              <t-image
                class="card-main-item"
                :src="item.videoImage"
                :style="{ width: '170px', height: '105px', borderRadius: '4px' }"
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
              <div class="card-footer-title">
                <t-tag v-if="item.videoType" class="card-footer-title-type" variant="outline" size="small">
                  {{ item.videoType }}
                </t-tag>
                <span class="card-footer-title-name">{{ item.videoName }}</span>
              </div>
              <p class="card-footer-desc">{{ item.videoRemarks }}</p>
            </div>
          </div>
        </div>
      </div>
      <infinite-loading style="text-align: center" :distance="200" @infinite="load">
        <template #complete>人家是有底线的</template>
        <template #error>哎呀，出了点差错</template>
      </infinite-loading>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { ref } from 'vue';
import { DeleteIcon } from 'tdesign-icons-vue-next';
import _ from 'lodash';
import { useIpcRenderer } from '@vueuse/electron';
import InfiniteLoading from 'v3-infinite-loading';
import { usePlayStore } from '@/store';
import { star } from '@/lib/dexie';
import zy from '@/lib/site/tools';
import 'v3-infinite-loading/lib/style.css';

const ipcRenderer = useIpcRenderer();

const store = usePlayStore();
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

const bingeList = ref([]);

const getBingeList = async () => {
  let length;
  await star.pagination(pagination.value.pageIndex, pagination.value.pageSize).then((res) => {
    bingeList.value = _.unionWith(bingeList.value, res.list, _.isEqual);
    pagination.value.count = res.total;
    pagination.value.pageIndex++;
    length = _.size(res.list);
  });
  return length;
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
  const info = await zy.detail(item.siteKey, item.videoId);
  store.updateConfig({
    type: 'film',
    data: {
      info,
      ext: { site: { key: item.siteKey } },
    },
  });

  ipcRenderer.send('openPlayWindow', item.videoName);
};

// 删除
const removeEvent = async (item) => {
  const { id } = item;
  await star.remove(id);
  _.pull(bingeList.value, _.find(bingeList.value, { ...item }));
  pagination.value.count--;
};

// 清空
const clearEvent = () => {
  bingeList.value = [];
  getBingeList();
};

// 对父组件暴露
defineExpose({
  clearEvent,
});
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';
.binge-container {
  overflow: hidden;
  position: relative;
  height: inherit;
  .main {
    height: calc(100% - 10px);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow-y: auto;
    width: 100%;
    &-flow-wrap {
      display: grid;
      padding: 10px 0;
      grid-template-columns: repeat(auto-fill, 170px);
      grid-column-gap: 20px;
      grid-row-gap: 10px;
      justify-content: center;
      width: inherit;
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
          .card-main-item {
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
        .card-footer {
          overflow: hidden;
          height: auto;
          line-height: 26px;
          .card-footer-title {
            display: flex;
            align-items: center;
            &-type {
              margin-right: 5px;
            }
            &-name {
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            }
          }
          .card-footer-desc {
            line-height: 20px;
            font-size: 13px;
            color: #999;
            font-weight: normal;
          }
        }
      }
    }
  }
}
</style>
