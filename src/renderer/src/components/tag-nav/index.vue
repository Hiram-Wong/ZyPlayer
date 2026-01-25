<template>
  <div class="tag-nav">
    <t-tabs v-model="activeTabId" @change="handleTabChange">
      <t-tab-panel
        v-for="tab in uniqueTabs"
        :key="tab.value"
        :value="tab.value"
        :label="tab.label"
        destroy-on-hide
        lazy
      />
    </t-tabs>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'TagNav',
});

const props = defineProps({
  list: {
    type: Array<ITabItem>,
    default: () => [],
  },
  active: {
    type: [String, Number],
    default: '',
  },
});

const emits = defineEmits(['change']);

interface ITabItem {
  label: string | number;
  value: string;
}

import { computed, ref, watch } from 'vue';

watch(
  () => props.active,
  (val) => {
    activeTabId.value = val || '';
  },
);

const activeTabId = ref(props.active);
const uniqueTabs = computed(() => [...new Map(props.list.map((tab) => [tab.value, tab])).values()]);

const handleTabChange = (tabId: string | number) => {
  emits('change', tabId);
};
</script>
<style lang="less" scoped>
.tag-nav {
  width: 100%;

  :deep(.t-tabs) {
    background-color: transparent;

    .t-tabs__nav-item {
      &.t-size-m {
        height: var(--td-comp-size-m);
        line-height: var(--td-comp-size-m);
      }

      &:not(.t-is-disabled, .t-is-active):hover .t-tabs__nav-item-wrapper {
        background-color: transparent;
        color: var(--td-text-color-primary);
      }
    }

    .t-tabs__bar {
      background-color: transparent;

      &::after {
        background-color: var(--td-brand-color);
        border-radius: 2px;
        bottom: 0;
        box-shadow: 0 -4px 14px 1px var(--td-brand-color);
        content: '';
        height: 4px;
        left: 50%;
        position: absolute;
        right: 0;
        transform: translateX(-50%);
        width: 20px;
      }
    }

    .t-tabs__nav-container {
      &.t-is-top {
        &::after {
          background-color: transparent;
        }
      }
    }

    .t-tabs__nav-item-wrapper {
      padding: 0;
    }
  }
}
</style>
