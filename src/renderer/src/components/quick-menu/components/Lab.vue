<template>
  <div class="quick-menu__lab">
    <t-button theme="default" shape="square" class="btn" @click="goNav">
      <template #icon><fill-color-1-icon /></template>
    </t-button>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'QuickMenuLab',
});

import { FillColor1Icon } from 'tdesign-icons-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const goNav = () => {
  router.push({ name: 'Lab' });
};
</script>
<style lang="less" scoped></style>
