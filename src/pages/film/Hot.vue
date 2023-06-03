<template>
  <t-dialog v-model:visible="formVisible" header="热搜榜" placement="center" :footer="false">
    <template #body>
      <div class="hot-container dialog-container-padding">
        <div class="rax-view-v2 tab-container">
          <div class="rax-view-v2 tab-wrap">
            <div class="tab-item">
              <span class="title">分类</span>
              <t-radio-group v-model="hotClass" variant="default-filled" size="small" @change="changeHotClass">
                <t-radio-button v-for="(item, key, index) in MODE_OPTIONS" :key="index" :value="key">
                  {{ item.name }}
                </t-radio-button>
              </t-radio-group>
            </div>
            <div class="tab-item">
              <span class="title">来源</span>
              <t-radio-group v-model="hotSource" variant="default-filled" size="small" @change="changeHotSource">
                <t-radio-button v-for="item in MODE_OPTIONS[hotClass].source" :key="item.key" :value="item.key">
                  {{ item.name }}
                </t-radio-button>
              </t-radio-group>
            </div>
          </div>
        </div>
        <div class="swiper">
          <div class="swiper-wrapper">
            <template v-for="i in 10" :key="i">
              <t-skeleton theme="text" :loading="loading" class="news-skeleton"> </t-skeleton>
            </template>
            <div
              v-for="(item, index) in hotList"
              :key="item.vod_id"
              class="rax-view-v2 news-item"
              @click="searchEvent(item.vod_name)"
            >
              <div class="rax-view-v2 news-rank" :class="[index in [0, 1, 2] ? `rank-${index + 1}` : '']">
                {{ index + 1 }}
              </div>
              <div class="rax-view-v2 normal-view">
                <div class="rax-view-v2 normal-title">{{ item.vod_name }}</div>
                <div class="rax-view-v2 normal-tip" :class="[index in [0, 1, 2] ? `color-${index + 1}` : '']">
                  {{ item.vod_hot }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tip-warp">
          <span>数据来源:</span>
          <t-link theme="primary" href="http://eye.kuyun.com/pages/whole-network/whole-network" target="_blank">
            酷云EVE
          </t-link>
          <span class="tip-title">更新于:{{ hotSourceUpdateTime }}</span>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import moment from 'moment';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref, watch } from 'vue';

import zy from '@/lib/utils/tools';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  site: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const hotClass = ref('movie');
const hotSource = ref(1);
const hotSourceUpdateTime = ref(moment().format('YYYY-MM-DD'));

const loading = ref(true); // 骨架屏是否显示热播

const formVisible = ref(false); // dialog是否显示热播
const hotList = ref([]); // 热播列表
const formData = ref(props.site); // 接受父组件参数
const emit = defineEmits(['update:visible', 'search']);

watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
    if (val) getHotList();
  },
);
watch(
  () => props.site,
  (val) => {
    formData.value = val;
  },
);

const MODE_OPTIONS = reactive({
  movie: {
    key: 1,
    name: '电影',
    source: [
      { key: 1, name: '腾讯视频' },
      { key: 2, name: '爱奇艺' },
      { key: 3, name: '优酷' },
    ],
  },
  episode: {
    key: 2,
    name: '剧集',
    source: [
      { key: 1, name: '腾讯视频' },
      { key: 2, name: '爱奇艺' },
      { key: 3, name: '优酷' },
      { key: 4, name: '芒果' },
    ],
  },
  variety: {
    key: 3,
    name: '综艺',
    source: [
      { key: 1, name: '腾讯视频' },
      { key: 2, name: '爱奇艺' },
      { key: 3, name: '优酷' },
      { key: 4, name: '芒果' },
    ],
  },
});

const changeHotClass = () => {
  loading.value = true;
  hotList.value = [];
  hotSource.value = 1;
  getHotList();
};

//
const changeHotSource = () => {
  loading.value = true;
  hotList.value = [];
  getHotList();
};

// 获取数据
const getHotList = async (retryCount = 0) => {
  try {
    const retryLimit = 3; // 重试次数
    const date = moment().subtract(retryCount, 'days').format('YYYY-MM-DD');
    const queryHotList = await zy.kuyunHot(date, MODE_OPTIONS[hotClass.value].key, hotSource.value);

    if (queryHotList) {
      loading.value = false;
      hotList.value = queryHotList;
      hotSourceUpdateTime.value = date;
    } else if (retryCount < retryLimit) {
      // 继续递归调用函数进行下一次请求
      await getHotList(retryCount + 1);
    } else {
      MessagePlugin.warning(`获取失败: 尝试获取最近:${retryLimit}天数据`);
    }
  } catch (err) {
    MessagePlugin.error(`error:${err}`);
    console.error(err);
  }
};

// 搜索资源
const searchEvent = async (item) => {
  emit('search', item);
  formVisible.value = false;
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.hot-container {
  .rax-view-v2 {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-content: flex-start;
    border: 0 solid #000;
    margin: 0;
    padding: 0;
    min-width: 0;
  }
  .tab-container {
    overflow-y: hidden;
    overflow-x: auto;
    width: 100%;
    scroll-behavior: smooth;
    .tab-wrap {
      position: relative;
      flex-direction: row;
      align-items: center;
      display: flex;
      justify-content: space-between;
      .tab-item {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        .title {
          margin-right: 5px;
        }
      }
    }
  }
  .swiper {
    margin: 0 auto;
    overflow: auto;
    list-style: none;
    max-height: 360px;
    .swiper-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      z-index: 1;
      display: flex;
      flex-direction: column;
      transition-property: transform;
      box-sizing: content-box;
      .news-skeleton {
        width: 100%;
        height: 24px;
        margin-bottom: 12px;
      }
      .news-item {
        flex-direction: row;
        width: 100%;
        margin-bottom: 12px;
        align-items: flex-start;
        padding-right: 22px;
        .news-rank {
          text-align: right;
          color: hsla(0, 0%, 40%, 0.6);
          font-weight: 700;
          margin: 2px 14px 0 10px;
        }
        .rank-1 {
          color: #f7534f;
        }
        .rank-2 {
          color: #fa7b32;
        }
        .rank-3 {
          color: #ffc63f;
        }
        .normal-view {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          .normal-title {
            flex: 1;
            font-weight: 700;
            margin-right: 10px;
            word-break: break-all;
            display: -webkit-box;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .normal-tip {
            font-weight: 700;
          }
          .color-1 {
            color: #f7534f;
          }
          .color-2 {
            color: #fa7b32;
          }
          .color-3 {
            color: #ffc63f;
          }
        }
        &:hover {
          border-radius: 5px;
          background-color: var(--td-bg-color-component-hover);
        }
      }
    }
  }
  .tip-warp {
    position: absolute;
    left: calc(var(--td-comp-paddingLR-xxl));
    bottom: calc(var(--td-comp-paddingTB-s));
    span,
    a {
      font-size: var(--td-font-size-link-small);
    }
    .tip-title {
      margin-left: 10px;
    }
  }
}
</style>
