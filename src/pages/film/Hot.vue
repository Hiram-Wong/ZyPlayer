<template>
  <t-dialog v-model:visible="formVisible" header="热搜 · TOP" placement="center" :footer="false">
    <template #body>
      <div class="hot-container dialog-container-padding">
        <div class="rax-view-v2 tab-container">
          <div class="rax-view-v2 tab-wrap">
            <div class="tab-item" v-if="hotConfig.hotType === 'kuyun'">
              <span class="title">分类</span>
              <t-radio-group v-model="hotConfig.hotClass" variant="default-filled" size="small" @change="changeHotClass">
                <t-radio-button v-for="(item, key, index) in hotConfig.hotOption" :key="index" :value="key">
                  {{ item.name }}
                </t-radio-button>
              </t-radio-group>
            </div>
            <div class="tab-item">
              <span class="title">来源</span>
              <t-radio-group v-model="hotConfig.hotSource" variant="default-filled" size="small" @change="changeHotSource">
                <t-radio-button v-for="item in hotConfig.hotOption[hotConfig.hotClass].source" :key="item.key" :value="item.key"  v-if="hotConfig.hotType === 'kuyun'">
                  {{ item.name }}
                </t-radio-button>
                <t-radio-button v-for="item in hotConfig.hotOption" :key="item.key" :value="item.key" v-else>
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
            <div v-if="!loading" class="swiper-wrapper-container">
              <div v-if="hotConfig.hotData.length !== 0" class="data">
                <div
                  v-for="(item, index) in hotConfig.hotData"
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
              <div v-else class="empty">
                <div class="image" style="width: 200px" v-html="emptyImage"></div>
                <div class="desc">
                  <p>暂无近三天数据, 请查看其他分类!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tip-warp">
          <span>数据来源:</span>
          <t-link theme="primary" :href="hotConfig.hotUrl" target="_blank">
            {{ hotConfig.hotName }}
          </t-link>
          <span class="tip-title">更新于:{{ hotConfig.hotUpdateTime }}</span>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import moment from 'moment';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref, watch, onMounted } from 'vue';

import zy from '@/lib/utils/tools';
import { setting } from '@/lib/dexie';
import CONFIG from '@/config/hotClass';
import emptyImage from '@/assets/empty.svg?raw';

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

const hotConfig = reactive({
  hotType: 'kylive',
  hotName: '',
  hotUrl: '',
  hotClass: 'episode',  // 仅酷云[旧]生效
  hotSource: 1,
  hotUpdateTime: moment().format('YYYY-MM-DD'),
  hotData: [],
  hotOption: [] || {},
})

const loading = ref(true); // 骨架屏是否显示热播
const formVisible = ref(false); // dialog
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

onMounted(()=>{
  getSetConfig()
})

const hotTypeMappings = {
  enlightent: {
    hotUpdateTime: () => moment().format('YYYY/MM/DD'),
    hotSource: 'tv',
  },
  kuyun: {
    hotUpdateTime: () => moment().format('YYYY-MM-DD'),
    hotSource: 1,
  },
  kylive: {
    hotUpdateTime: () => moment().format('YYYY-MM-DD'),
    hotSource: 0,
  },
};

const getSetConfig = async()=>{
  const hotType = await setting.get('defaultHot');
  
  hotConfig.hotType = hotType;
  if (hotType in hotTypeMappings) {
    const { hotUpdateTime, hotSource } = hotTypeMappings[hotType];
    hotConfig.hotUpdateTime = hotUpdateTime();
    hotConfig.hotSource = hotSource;
    hotConfig.hotName = CONFIG[hotType].name;
    hotConfig.hotUrl = CONFIG[hotType].url;
    hotConfig.hotOption = CONFIG[hotType].data;
  }
}

// 切换分类
const changeHotClass = () => {
  loading.value = true;
  hotConfig.hotData = [];
  hotConfig.hotSource = 1;
  getHotList();
};

// 切换数据源
const changeHotSource = () => {
  loading.value = true;
  hotConfig.hotData = [];
  getHotList();
};

// 获取数据
const getHotList = async (retryCount = 0) => {
  try {
    const retryLimit = 3; // 重试次数
    const date = moment().subtract(retryCount, 'days');
    const dateFormat = hotConfig.hotType === 'enlightent' ? date.format('YYYY/MM/DD') : date.format('YYYY-MM-DD');

    let queryHotList;
    if (hotConfig.hotType === 'kuyun') {
      queryHotList = await zy.kuyunHot(dateFormat, hotConfig.hotOption[hotConfig.hotClass].key, hotConfig.hotSource);
    } else if(hotConfig.hotType === 'kylive') {
      queryHotList = await zy.kyLiveHot(dateFormat, 2, hotConfig.hotSource);
    } else if(hotConfig.hotType === 'enlightent') {
      queryHotList = await zy.enlightentHot(dateFormat, 'allHot', hotConfig.hotSource, 1);
    } 

    if (queryHotList.length) {
      loading.value = false;
      hotConfig.hotData = queryHotList;
      hotConfig.hotUpdateTime = dateFormat;
    } else {
      if (retryCount < retryLimit) {
        await getHotList(retryCount + 1);  // 递归请求
      } else {
        loading.value = false;
      }
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

// 监听设置变更
const eventBus = useEventBus('hot-reload');
eventBus.on(() => {
  hotConfig.hotData = [];
  getSetConfig()
});
</script>

<style lang="less" scoped>
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

  .empty {
    height: 360px;
    --el-empty-fill-color-0: #fff;
    --el-empty-fill-color-1: #fcfcfd;
    --el-empty-fill-color-2: #f8f9fb;
    --el-empty-fill-color-3: #f7f8fc;
    --el-empty-fill-color-4: #eeeff3;
    --el-empty-fill-color-5: #edeef2;
    --el-empty-fill-color-6: #e9ebef;
    --el-empty-fill-color-7: #e5e7e9;
    --el-empty-fill-color-8: #e0e3e9;
    --el-empty-fill-color-9: #d5d7de;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    box-sizing: border-box;
    padding: var(--td-comp-paddingTB-xxl) 0;
    .desc {
      margin-top: var(--td-comp-margin-xl);
      p {
        margin: 0;
        font-size: var(--td-font-size-title-small);
        font-weight: 500;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
:root[theme-mode='dark'] {
  .empty {
    --el-empty-fill-color-0: #000;
    --el-empty-fill-color-1: #4b4b52;
    --el-empty-fill-color-2: #36383d;
    --el-empty-fill-color-3: #1e1e20;
    --el-empty-fill-color-4: #262629;
    --el-empty-fill-color-5: #202124;
    --el-empty-fill-color-6: #212224;
    --el-empty-fill-color-7: #1b1c1f;
    --el-empty-fill-color-8: #1c1d1f;
    --el-empty-fill-color-9: #18181a;
  }
}
</style>
