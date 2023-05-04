<template>
  <t-dialog v-model:visible="formVisible" header="热榜" placement="center" :footer="false">
    <template #body>
      <div class="hot-container">
        <div class="rax-view-v2 tab-container">
          <div class="rax-view-v2 tab-wrap">
            <div v-for="item in MODE_OPTIONS" :key="item.key" class="rax-view-v2 tab-item">
              {{ item.name }}
            </div>
          </div>
          <t-radio-group v-model="hotSource" variant="default-filled" size="small">
            <t-radio-button v-for="(item, key) in MODE_OPTIONS[hotClass - 1].source" :key="key" :value="key">
              {{ item }}{{ hotClass }}
            </t-radio-button>
          </t-radio-group>
        </div>
        <div class="swiper swiper-initialized swiper-horizontal swiper-ios">
          <div class="swiper-wrapper">
            <div v-for="(item, index) in hotList" :key="item.vod_id" class="rax-view-v2 news-item">
              <div class="rax-view-v2 news-rank rank-1">{{ index + 1 }}</div>
              <div class="rax-view-v2 normal-view">
                <div class="rax-view-v2 normal-title">{{ item.vod_name }}</div>
                <div class="rax-view-v2 normal-tip-icon">{{ item.vod_hot }}</div>
              </div>
            </div>
          </div>
        </div>
        <p class="tip bottom-tip">数据来源: 酷云EVE</p>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

import zy from '@/lib/utils/tools';
import { usePlayStore } from '@/store';

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

const hotClass = ref(2);
const hotSource = ref(1);

const loading = ref(true); // 骨架屏是否显示热播

const formVisible = ref(false); // dialog是否显示热播
const hotList = ref([]); // 热播列表

const emit = defineEmits(['update:visible']);

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

const MODE_OPTIONS = reactive([
  {
    key: 1,
    name: '电影',
    source: { 1: '腾讯视频', 2: '爱奇艺', 3: '优酷', 4: '芒果' },
  },
  { key: 2, name: '剧集', source: { 1: '腾讯视频', 2: '爱奇艺', 3: '优酷', 4: '芒果' } },
  {
    key: 3,
    name: '综艺',
    source: { 1: '腾讯视频', 2: '爱奇艺', 3: '优酷' },
  },
]);

const getHotList = async () => {
  hotList.value = await zy.kuyunHot('2023-05-03', hotClass.value, hotSource.value);
  console.log(hotList.value);
  if (hotList.value.length) loading.value = false;
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
      .tab-item {
        width: 65px;
        position: relative;
        color: #777;
        text-align: center;
        z-index: 1;
        font-weight: 700;
        user-select: none;
      }
      .active {
        background-color: var(--td-bg-input);
        border-radius: 5px;
      }
    }
  }
  .swiper {
    margin-left: auto;
    margin-right: auto;
    position: relative;
    overflow: hidden;
    list-style: none;
    padding: 0;
    z-index: 1;
    height: 400px;
    overflow-x: hidden;
    overflow-y: scroll;
    .swiper-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      z-index: 1;
      display: flex;
      flex-direction: column;
      transition-property: transform;
      box-sizing: content-box;
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
          margin-right: 12px;
          background-repeat: no-repeat;
          margin-top: 2px;
        }
        .rank-1 {
          color: #f7534f;
          padding-right: 2px;
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
          .normal-tip-icon {
            border-radius: 2px;
            text-align: center;
            padding: 0.5px 3px;
            font-weight: 700;
          }
        }
      }
    }
  }
}
</style>
