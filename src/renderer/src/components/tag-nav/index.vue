<template>
  <div class="tag-nav">
    <t-tabs v-model="tagFlag" @change="handleItemClick(tagFlag)">
      <t-tab-panel v-for="item in listData" :key="item.type_id" :value="item.type_id" :label="item.type_name" class="bar" />
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, watch } from 'vue';

const props = defineProps<{
  active: any;
  list: Array<{
    type_id: string | number;
    type_name: string;
  }>;
}>();

watch(
  () => props.active,
  (val) => {
    tagFlag.value = val;
  },
);

watch(
  () => props.list,
  (val) => {
    listData.value = val;
  },
);

const emit = defineEmits(['changeKey']);

const tagFlag = ref(props.active);
const listData = ref(props.list);

const handleItemClick = (key: string | number) => {
  emit('changeKey', key);
};
</script>

<style lang="less" scoped>
.tag-nav {
  width: 100%;
}

:deep(.t-tabs__nav-container.t-is-top:after) {
  background-color: rgba(0, 0, 0, 0) !important;
}
// :deep(.t-tabs__bar.t-is-top) {
//   width:15px !important;
//   left: 50% !important;
//   transform: translate(-50%, 0);
// }
:deep(.t-tabs__nav-item) {
  --ripple-color: transparent;
  &:not(.t-is-disabled):not(.t-is-active):hover {
    color: var(--td-brand-color);
    .t-tabs__nav-item-wrapper {
      background-color: transparent;
    }
  }
}
:deep(.t-tabs__nav-item-wrapper) {
  --ripple-color: transparent;
}
:deep(.t-tabs__nav-item-text-wrapper) {
  font-weight: 700;
}
:deep(.t-tabs__btn) {
  border: 0;
  background-color: var(--td-bg-color-container);
  &:hover > svg {
    color: var(--td-brand-color);
  }
}
:deep(.t-tabs__operations--left), :deep(.t-tabs__operations--right) {
  .t-tabs__btn:first-child {
    box-shadow: none;
  }
}
</style>