<template>
  <div class="quick-menu__setting">
    <t-button theme="default" shape="square" class="btn" @click="goNav">
      <template #icon><setting1-icon /></template>
    </t-button>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'QuickMenuSetting',
});

import { Setting1Icon } from 'tdesign-icons-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const goNav = () => {
  router.push({ name: 'Setting' });
};
</script>
<style lang="less" scoped></style>
