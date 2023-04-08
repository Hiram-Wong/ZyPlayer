<template>
  <t-dialog v-model:visible="formVisible" header="热榜" :footer="false" placement="center">
    <template #body>
      <div class="hot-container">
        <div class="hot-heading">
          <span class="hot-heading-tip">根据当前热度整理 不定时更新</span>
        </div>
        <t-skeleton theme="paragraph" :loading="loading">
          <div class="hot-main">
            <div v-for="(item, index) in hotList" :key="index" class="hot-paper-item-main" @click="detailEvent(item)">
              <div class="hot-paper-item-num" :class="`hot-paper-item-num-${index + 1}`">{{ index + 1 }}</div>
              <div class="hot-paper-item-info">
                <span class="hot-paper-item-infotitle">{{ item.vod_name }}</span>
                <p>{{ item.vod_remarks }}</p>
              </div>
              <div class="hot-paper-item-icon">
                <chevron-right-icon size="1.5em" />
              </div>
            </div>
          </div>
        </t-skeleton>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { ChevronRightIcon } from 'tdesign-icons-vue-next';
import { useIpcRenderer } from '@vueuse/electron';
import { setting } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

import { usePlayStore } from '@/store';

const ipcRenderer = useIpcRenderer();

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

const store = usePlayStore();

const loading = ref(true); // 骨架屏是否显示热播

const formVisible = ref(false); // dialog是否显示热播
const formData = ref(props.site); // 接受父组件参数
const hotList = ref([]); // 热播列表

const formDetailData = ref({}); // 详情组件传参
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
    getHotList();
  },
);
watch(
  () => props.site,
  (val) => {
    formData.value = val;
  },
);

const getHotList = async () => {
  const defaultHot = await setting.get('defaultHot');
  const { key } = formData.value;
  if (defaultHot === 'site') {
    hotList.value = await zy.hot(key, 24);
  } else if (defaultHot === 'douban') {
    hotList.value = await zy.doubanHot('tv', '热门', 20, 0);
  }
  if (hotList.value.length) loading.value = false;
};

const detailEvent = async (item) => {
  const defaultHot = await setting.get('defaultHot');
  const { key } = formData.value;
  try {
    if (defaultHot === 'site') {
      formDetailData.value = await zy.detail(key, item.vod_id);
    } else if (defaultHot === 'douban') {
      const res = await zy.searchFirstDetail(key, item.vod_name);
      formDetailData.value = res;
      if (!res) {
        MessagePlugin.warning('暂无在本源搜索到相关资源');
        return;
      }
    }

    store.updateConfig({
      type: 'film',
      data: {
        info: formDetailData.value,
        ext: { site: formData.value },
      },
    });

    if (formDetailData.value) ipcRenderer.send('openPlayWindow', item.vod_name);
  } catch (err) {
    console.error(err);
    MessagePlugin.error('网络出错啦,请稍后再试!');
  }
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

:deep(.t-dialog) {
  background-image: url(../../../assets/bg-left-circle.svg), url(../../../assets/bg-right-circle.svg);
  background-position: 0 0, 100% 280px;
  background-repeat: no-repeat;
}

.hot-container {
  .hot-heading {
    .hot-heading-tip {
      margin-bottom: 10px;
      display: inline-block;
    }
  }
  .hot-main {
    height: 400px;
    overflow-x: hidden;
    overflow-y: scroll;
    .hot-paper-item-main {
      padding: 10px 0;
      margin: 0 10px;
      min-height: 45px;
      display: flex;
      flex-direction: row;
      align-items: center;
      position: relative;
      .hot-paper-item-num {
        font-weight: 700;
        position: relative;
        color: #bcbcbc;
        font-size: 24px;
        line-height: 1;
        width: 50px;
        text-align: center;
      }
      .hot-paper-item-num-1 {
        color: #ff3d5e;
      }
      .hot-paper-item-num-2 {
        color: #f73;
      }
      .hot-paper-item-num-3 {
        color: #ffa82e;
      }
      .hot-paper-item-info {
        max-width: 70%;
        display: block;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        p {
          color: #9e9e9e;
          font-size: 12px;
        }
      }
      .hot-paper-item-icon {
        position: absolute;
        right: 10px;
        color: #c2c6d0;
      }
    }
  }
}
</style>
