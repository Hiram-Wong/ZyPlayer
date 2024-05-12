<template>
  <div class="tag-nav">
    <t-tabs v-model="tagFlag" @change="handleItemClick(tagFlag)">
      <t-tab-panel v-for="item in listData" :key="item.type_id" :value="item.type_id" :label="item.type_name"
        class="bar" />
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
    tagFlag.value = val || '';
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
</style>
