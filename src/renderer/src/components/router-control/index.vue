<template>
  <div class="router-control">
    <t-button
      v-if="!isFilter('back')"
      theme="default"
      shape="square"
      :disabled="!active.back"
      class="control-button control-button__back"
      @click="goBack"
    >
      <template #icon><chevron-left-icon /></template>
    </t-button>

    <t-button
      v-if="!isFilter('forward')"
      theme="default"
      shape="square"
      :disabled="!active.forward"
      class="control-button control-button__forward"
      @click="goForward"
    >
      <template #icon><chevron-right-icon /></template>
    </t-button>

    <t-button
      v-if="!isFilter('refresh')"
      theme="default"
      shape="square"
      class="control-button control-button__refresh"
      @click="goRefresh"
    >
      <template #icon><rotate-icon /></template>
    </t-button>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'RouterControl',
});

const props = defineProps({
  filter: {
    type: Array,
    default: () => [],
  },
});

import { ChevronLeftIcon, ChevronRightIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import emitter from '@/utils/emitter';

const router = useRouter();
const route = useRoute();

const active = ref({
  back: false,
  forward: false,
});

watch(route, () => {
  const routeState = window.history.state || {};
  active.value.back = !!routeState?.back;
  active.value.forward = !!routeState?.forward;
});

const isFilter = (name: string) => {
  return props.filter.includes(name);
};

const goBack = () => router.back();

const goForward = () => router.forward();

const goRefresh = () => {
  const reloadableModules = new Set(['Film', 'Live', 'Parse', 'Moment']);
  const name = route.name as string | undefined;

  if (name && reloadableModules.has(name)) {
    const channel = emitterChannel[`REFRESH_${name.toUpperCase()}_CONFIG`];
    emitter.emit(channel, { source: emitterSource.LAYOUT_HEADER_SEARCH });

    emitter.emit(emitterChannel.SEARCH_RECOMMEND, { source: emitterSource.LAYOUT_HEADER_ROUTER, data: '' });
  } else {
    // file protocol not supported reload
    window.location.href = window.location.href.replace(/\?.*|$/, `?_t=${Date.now()}`);
  }
};
</script>
<style lang="less" scoped></style>
