<template>
  <KeepAlive :max="100">
    <component :is="rowComponent" v-bind="$attrs" />
  </KeepAlive>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'RenderIcon',
});

const { name } = defineProps({
  name: {
    type: String,
  },
});

import { manifest } from 'tdesign-icons-vue-next';
import * as Icons from 'tdesign-icons-vue-next/lib/icons';
import { computed } from 'vue';

const componentNames = new Map();
manifest.forEach((value) => {
  componentNames.set(`${value.icon}Icon`, `${value.stem}-icon`);
});
const components = new Map();
Object.entries(Icons).forEach((value) => {
  const name = componentNames.get(value[0]);
  if (name) {
    components.set(name, value[1]);
  }
});

const rowComponent = computed(() => {
  if (!name) {
    return null;
  }
  return components.get(`${name}-icon`);
});
</script>
