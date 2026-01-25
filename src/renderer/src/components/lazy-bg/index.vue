<template>
  <logo-icon class="lazy-icon" />
</template>
<script setup lang="ts">
defineOptions({
  name: 'LazyBackground',
});

import LogoIcon from '@/assets/icon.svg';
</script>
<style scoped>
.lazy-icon {
  height: 100%;
  width: 100%;
  color: var(--td-gray-color-10);
}
</style>
