<template>
  <t-drawer v-model:visible="formVisible" header="历史" size="small" class="history-items">
    <div v-for="item in historyList" :key="item.id" class="" @click="historyPlayEvent(item)">
      <div class="history-item">
        <div class="date">{{ item.date }}</div>
        <t-popup
          :content="item.videoName"
          destroy-on-close
          :overlay-style="{ maxWidth: '300px' }"
          :overlay-inner-style="{
            boxShadow: 'none',
            background: 'var(--td-bg-color-page)',
          }"
        >
          <div class="title">{{ item.videoName }}</div>
        </t-popup>
        <div class="clear" @click.stop="histroyDeleteEvent(item)"><clear-icon size="1rem" /></div>
      </div>
      <t-divider dashed style="margin: 5px 0" />
    </div>
    <template #footer>
      <t-button @click="histroyClearEvent">清空</t-button>
      <t-button variant="outline" @click="formVisible = false"> 取消 </t-button>
    </template>

    <infinite-loading :identifier="infiniteId" style="text-align: center" :distance="200" @infinite="load">
      <template #complete>人家是有底线的</template>
      <template #error>哎呀，出了点差错</template>
    </infinite-loading>
  </t-drawer>
</template>

<script setup lang="ts">
import 'v3-infinite-loading/lib/style.css';

import _ from 'lodash';
import { ClearIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { ref, watch } from 'vue';

import { analyzeHistory } from '@/lib/dexie';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const formVisible = ref(false); // 控制dialog

const emit = defineEmits(['update:visible', 'historyPlay']);

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
    if (val) {
      historyList.value = [];
      pagination.value.pageIndex = 0;
      infiniteId.value++;
    }
  },
);

const infiniteId = ref(+new Date());
const historyList = ref([]);
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

// 历史解析
const historyPlayEvent = async (item) => {
  console.log(item);
  emit('historyPlay', { ...item });
};

// 历史删除
const histroyDeleteEvent = async (item) => {
  const index = historyList.value.findIndex((historyItem) => historyItem.id === item.id);
  if (index !== -1) {
    historyList.value.splice(index, 1);
    await analyzeHistory.remove(item.id);
  }
};

// 历史清空
const histroyClearEvent = async () => {
  try {
    await analyzeHistory.clear();
    historyList.value = [];
    MessagePlugin.success('sucess');
  } catch (err) {
    console.error(err);
    MessagePlugin.error('failed');
  }
};

// 获取解析历史
const getHistoryList = async () => {
  const { pageIndex, pageSize } = pagination.value;
  const res = await analyzeHistory.pagination(pageIndex, pageSize);
  const { list } = res;
  historyList.value = _.unionWith(historyList.value, list, _.isEqual);

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
    console.error(err);
    $state.error();
  }
};
</script>

<style lang="less" scoped>
.history-items {
  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    white-space: nowrap;
    font-weight: 500;
    cursor: pointer;
    &:hover {
      background-color: var(--td-bg-color-component-hover);
    }
  }
  .date {
    width: 85px;
  }
  .title {
    padding: 0 10px;
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
