<template>
  <div class="quick-menu__ai">
    <t-button theme="default" shape="square" class="btn" @click="switchDrawer">
      <template #icon><wink-icon /></template>
    </t-button>

    <t-drawer
      v-model:visible="active.visible"
      :attach="`.${attachContent}`"
      show-in-attached-element
      size="420px"
      :size-draggable="{
        min: 420,
        max: 900,
      }"
      :header="$t('aigc.title')"
      :show-overlay="false"
      :close-btn="true"
      :footer="false"
      class="drawer-box"
    >
      <aigc />
    </t-drawer>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'QuickMenuAi',
});

import { WinkIcon } from 'tdesign-icons-vue-next';
import { ref } from 'vue';

import { attachContent } from '@/config/global';

import Aigc from '../../aigc/index.vue';

const active = ref({
  visible: false,
  draggable: false,
});

const switchDrawer = () => {
  active.value.visible = !active.value.visible;
};
</script>
<style lang="less" scoped></style>
