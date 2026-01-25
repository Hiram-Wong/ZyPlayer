<template>
  <div class="quick-menu">
    <sponsor v-if="!isFilter('sponsor')" class="system-function" />
    <ai v-if="!isFilter('ai')" class="system-function" />
    <language v-if="!isFilter('language')" class="system-function" />
    <theme v-if="!isFilter('skin')" class="system-function" />
    <lab v-if="!isFilter('lab')" class="system-function" />
    <setting v-if="!isFilter('setting')" class="system-function" />
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'QuickMenu',
});

const props = defineProps({
  filter: {
    type: Array,
    default: () => [],
  },
});

import Ai from './components/Ai.vue';
import Lab from './components/Lab.vue';
import Language from './components/Language.vue';
import Setting from './components/Setting.vue';
import Sponsor from './components/Sponsor.vue';
import Theme from './components/Theme.vue';

const isFilter = (name: string) => {
  return props.filter.includes(name);
};
</script>
<style lang="less" scoped></style>
