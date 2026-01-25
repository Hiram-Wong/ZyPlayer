<template>
  <div class="setting-table">
    <div class="header">
      <div class="left-op-container">
        <div class="component-op">
          <group-btn :data="op" @change="handleOpChange" />
        </div>
      </div>
      <div class="right-op-container">
        <div class="search">
          <t-input v-model="searchText" clearable @enter="handleOpSearch" @clear="handleOpSearch">
            <template #prefix-icon><search-icon /></template>
          </t-input>
        </div>
      </div>
    </div>

    <div class="content">
      <t-table
        class="table-custom"
        :row-key="rowKey"
        :data="data"
        :columns="columns"
        :hover="true"
        lazy-load
        :pagination="pagination"
        :loading="dataLoading"
        header-affixed-top
        @select-change="handleSelectChange"
        @page-change="handlePageChange"
      >
        <template v-for="itemSlot in Object.keys(slots)" :key="itemSlot" #[itemSlot]="temp">
          <slot :name="itemSlot" v-bind="temp"></slot>
        </template>
      </t-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'SettingTable',
});

defineProps({
  op: {
    type: Array<IOpProps>,
    default: () => [],
  },
  data: {
    type: Array<any>,
    default: () => [] as TableProps['data'],
  },
  columns: {
    type: Array<any>,
    default: () => [] as TableProps['columns'],
  },
  rowKey: {
    type: String,
    default: 'key',
  },
  pagination: {
    type: Object,
    default: {} as TableProps['pagination'],
  },
});

const emits = defineEmits(['op-change', 'page-change', 'op-search']);

import { SearchIcon } from 'tdesign-icons-vue-next';
import type { TableProps } from 'tdesign-vue-next';
import { ref, useSlots } from 'vue';

import GroupBtn from '@/components/group-btn/index.vue';

import type { IOpProps } from './types';

const slots = useSlots();
const dataLoading = ref<boolean>(false);
const searchText = ref<string>('');
const opMethod = ref<string>('');
const tableSelect = ref<Array<string>>([]);

const handleOpChange = (type: string) => {
  emits('op-change', type, tableSelect.value);
  opMethod.value = '';
};

const handleOpSearch = () => {
  emits('op-search', searchText.value);
};

const handlePageChange = (curr: { current: number; pageSize: number }) => {
  emits('page-change', curr.current, curr.pageSize);
};

const handleSelectChange = (val: any[]) => {
  tableSelect.value = val;
};
</script>
<style lang="less" scoped>
.setting-table {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    display: flex;
    justify-content: space-between;
    flex-grow: 0;
    flex-shrink: 0;
    padding: 0 var(--td-comp-paddingLR-s) 0 0;
  }

  .content {
    height: 100%;
    width: 100%;
    flex: 1;
    overflow: hidden;

    .table-custom {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 0;
    }

    :deep(.t-table__affixed-header-elm) {
      padding: 0 var(--td-comp-paddingLR-s) 0 0;
    }

    :deep(.t-table__content) {
      padding: 0 var(--td-comp-paddingLR-s) 0 0;
    }

    :deep(.t-table__pagination) {
      padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s) 0;
    }

    :deep(.t-badge) {
      padding-left: var(--td-comp-paddingLR-xs);

      .t-badge--dot {
        left: 0;
        top: var(--td-size-2);
      }
    }
  }
}
</style>
