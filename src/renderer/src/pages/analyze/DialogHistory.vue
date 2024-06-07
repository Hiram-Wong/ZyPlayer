<template>
  <t-drawer v-model:visible="formVisible" show-in-attached-element :header="$t('pages.analyze.history.title')"
    size="small" class="history-items">
    <div v-for="item in historyList" :key="item.id" @click="historyPlayEvent(item)">
      <div class="history-item">
        <div class="date">{{ formatDate(item.date) }}</div>
        <t-popup placement="bottom" :content="item.videoName" :overlay-style="{ maxWidth: '290px' }">
          <div class="title">{{ item.videoName }}</div>
        </t-popup>
        <div class="clear" @click.stop="histroyDeleteEvent(item.id)">
          <!-- <t-popconfirm content="确认删除吗" @confirm="histroyDeleteEvent(item.id)"> -->
          <delete-icon />
          <!-- </t-popconfirm> -->
        </div>
      </div>
      <t-divider dashed style="margin: 5px 0" />
    </div>
    <template #footer>
      <t-button @click="histroyClearEvent">{{ $t('pages.analyze.history.clear') }}</t-button>
      <t-button variant="outline" @click="formVisible = false">{{ $t('pages.analyze.history.cancel') }}</t-button>
    </template>

    <infinite-loading :identifier="infiniteId" style="text-align: center" :distance="200" @infinite="load">
      <template #complete>{{ $t('pages.analyze.infiniteLoading.complete') }}</template>
      <template #error>{{ $t('pages.analyze.infiniteLoading.error') }}</template>
    </infinite-loading>
  </t-drawer>
</template>

<script setup lang="ts">
import 'v3-infinite-loading/lib/style.css';

import _ from 'lodash';
import moment from 'moment';
import { DeleteIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { ref, watch } from 'vue';

import { t } from '@/locales';

import { fetchHistoryList, delHistory, clearHistoryAnalyzeList } from '@/api/history';

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
const historyList = ref<any>([]);
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

// 历史解析
const historyPlayEvent = async (item) => {
  emit('historyPlay', { ...item });
};

// 历史删除
const histroyDeleteEvent = async (id) => {
  const index = _.findIndex(historyList.value, { id });
  if (index !== -1) {
    historyList.value.splice(index, 1);
    delHistory(id);
  }
};

// 历史清空
const histroyClearEvent = () => {
  const handleClear = () => {
    clearHistoryAnalyzeList();
    historyList.value = [];
    confirmDia.hide();
  };

  const confirmDia = DialogPlugin({
    body: t('pages.analyze.dialog.body'),
    header: t('pages.analyze.dialog.header'),
    width: '340px',
    placement: 'center',
    closeBtn: '',
    confirmBtn: t('pages.analyze.dialog.confirm'),
    cancelBtn: t('pages.analyze.dialog.cancel'),
    onConfirm: handleClear,
    onClose: () => confirmDia.hide(),
  });
};

// 获取解析历史
const getHistoryList = async () => {
  const { pageIndex, pageSize } = pagination.value;
  const res = await fetchHistoryList(pageIndex, pageSize, 'analyze');
  const { data, total } = res;
  historyList.value = _.unionWith(historyList.value, data, _.isEqual) as any;

  pagination.value.count = total;
  pagination.value.pageIndex++;

  return _.size(res.list);
};

const load = async ($state) => {
  console.log('[history] loading...');
  try {
    const resLength = await getHistoryList();
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

const formatDate = (timestamp) => {
  return moment.unix(timestamp).format('YYYY-MM-DD');
}
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
      background-color: var(--td-bg-content-active-2);
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
