<template>
  <router-view :class="[mode]"></router-view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSettingStore } from '@/store';
import { setting } from '@/lib/dexie';

const store = useSettingStore();

const mode = computed(() => {
  return store.displayMode;
});

onMounted(() => {
  setting.get('theme').then((res) => {
    store.updateConfig({ mode: res });
  });
});
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

#nprogress .bar {
  background: var(--td-brand-color) !important;
}
</style>
