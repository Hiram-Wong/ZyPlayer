<template>
  <t-drawer v-model:visible="formVisible" header="历史" size="small" class="history-items">
    <div v-for="item in historyList" :key="item.id" class="" @click.self="historyPlayEvent(item)">
      <div class="history-item">
        <div class="date">{{ item.date }}</div>
        <t-popup
          placement="bottom"
          :content="item.videoName"
          :overlay-style="{ maxWidth: '290px' }"
          :overlay-inner-style="{
            background: 'var(--td-bg-color-page)',
            boxShadow: '0 15px 30px rgba(0,0,0,.2)',
          }"
        >
          <div class="title">{{ item.videoName }}</div>
        </t-popup>
        <div class="clear">
          <t-popconfirm content="确认删除吗" @confirm="histroyDeleteEvent(item)">
            <delete-icon />
          </t-popconfirm>
        </div>
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
import { DeleteIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
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
const histroyClearEvent = () => {
  const handleClear = async () => {
    await analyzeHistory.clear();
    historyList.value = [];
    MessagePlugin.success('删除成功');
    confirmDia.hide();
  };

  const confirmDia = DialogPlugin({
    body: '确定删除所有记录吗？删除后不支持找回。',
    header: '删除记录',
    width: '340px',
    attach: '.history-items',
    confirmBtn: '确认删除',
    placement: 'center',
    closeBtn: null,
    onConfirm: handleClear,
    onClose: () => confirmDia.hide(),
  });
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
    padding: 0 var(--td-comp-paddingLR-xs);
    &:hover {
      border-radius: var(--td-radius-medium);
      background-color: rgba(132, 133, 141, 0.16);
    }
  }
  .date {
    width: 6em;
  }
  .title {
    padding: 0 var(--td-comp-paddingLR-xs);
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
