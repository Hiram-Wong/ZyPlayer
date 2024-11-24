<template>
  <div class="common-setting">
    <div class="operation-container">
      <div class="left-operation-container">
        <div class="component-op">
          <t-radio-group variant="default-filled" v-model="opMethod" @change="handleOpChange">
            <t-radio-button v-for="(item, index) in op" :key="index" :value="item.value">{{ item.label }}</t-radio-button>
          </t-radio-group>
        </div>
      </div>
      <div class="right-operation-container">
        <div class="search">
          <t-input v-model="searchText" :placeholder="$t('pages.setting.header.search')" clearable @enter="handleOpSearch" @clear="handleOpSearch">
            <template #prefix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
        </div>
        <div class="operation-btn"></div>
      </div>
    </div>
    <div class="table-container">
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
      <template v-for="itemSlot in Object.keys(slots)" :key="itemSlot" v-slot:[itemSlot]="temp">
        <slot :name="itemSlot" v-bind="temp"></slot>
      </template>
    </t-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useSlots } from 'vue';
import { SearchIcon } from 'tdesign-icons-vue-next';


defineProps({
  op: {
    type: Array,
    default: () => [],
  },
  data: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: 'key',
  },
  pagination: {
    type: Object,
  }
});
const slots = useSlots();
const dataLoading = ref(false);
const searchText = ref('');
const opMethod = ref('');
const tableSelect = ref<any[]>([]);

const emits = defineEmits(['opChange', 'pageChange', 'opSearch']);

const handleOpChange = (type: string) => {
  emits('opChange', type, tableSelect.value);
  opMethod.value = '';
};

const handleOpSearch = () => {
  emits('opSearch', searchText.value);
};

const handlePageChange = (curr: {current: number, pageSize: number}) => {
  emits('pageChange', curr.current, curr.pageSize);
};

const handleSelectChange = (val: any[]) => {
  tableSelect.value = val;
};
</script>


<style lang="less" scoped>
.common-setting {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: var(--td-size-4);

  .operation-container {
    display: flex;
    justify-content: space-between;

    .left-operation-container {
      :deep(.t-radio-group.t-size-m) {
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;
        .t-radio-button {
          padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
          background-color: var(--td-bg-content-input-2);
          border-color: transparent;
        }
      }
    }

    .right-operation-container {
      .search {
        :deep(.t-input) {
          background-color: var(--td-bg-content-input-2);
          border-color: transparent;
        }
      }
    }
  };

  .table-container {
    height: 100%;
    flex: 1;
    overflow: hidden;

    .table-custom {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }



    :deep(.t-table) {
      background-color: var(--td-bg-color-container);

      .t-badge {
        padding-left: var(--td-comp-paddingLR-xxs);

        .t-badge--dot {
          left: -3px;
          top: 5px;
        }
      }

      tr {
        background-color: var(--td-bg-color-container);

        &:hover {
          background-color: var(--td-bg-color-container-hover);
        }
      }

      .t-table__header--fixed:not(.t-table__header--multiple) > tr > th {
        background-color: var(--td-bg-color-container);
      }

      .t-table__pagination-wrap {
        .t-table__pagination {
          padding: var(--td-comp-paddingTB-s) 0;

          .t-pagination__total {
            color: var(--td-text-color-primary);
          }

          .t-input--suffix {
            border-color: transparent;
            background-color: var(--td-bg-content-input-2);
          }

          .t-pagination__number {
            border-color: transparent;
            background-color: var(--td-bg-content-input-2);
            color: var(--td-text-color-secondary);
          }

          .t-pagination__number.t-is-current {
            border-color: var(--td-brand-color);
            color: var(--td-text-color-primary);
          }

          .t-pagination__btn {
            &:hover {
              background-color: var(--td-bg-content-input-2);
            }
          }
        }
      }
    }
  }
}
</style>
