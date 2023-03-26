<template>
  <div class="binge-container mx-auto">
    <div class="main" infinite-wrapper>
      <div class="main-flow-wrap">
        <div v-for="item in bingeList" :key="item.id" class="card-wrap">
          <div class="card" @click="playEvent(item)">
            <div v-if="item.videoType" class="card-header">
              <span class="card-header-tag card-header-tag-orange">
                <span class="card-header-tag-tagtext">{{ item.videoType }}</span>
              </span>
            </div>
            <div class="card-main">
              <t-image
                class="card-main-item"
                :src="item.videoImage"
                :style="{ width: '190px', height: '105px', borderRadius: '7px' }"
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
import { MessagePlugin } from 'tdesign-vue-next';
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
  overflow-y: auto;
  height: inherit;
  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow-y: auto;
    width: 100%;
    &-flow-wrap {
      display: grid;
      grid-template-columns: repeat(auto-fill, 190px);
      grid-column-gap: 20px;
      grid-row-gap: 10px;
      justify-content: center;
      width: inherit;
      .card-wrap {
        flex-direction: column;
        position: relative;
        .card {
          box-sizing: border-box;
          width: 190px;
          position: relative;
          display: inline-block;
          vertical-align: top;
          .card-header {
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
