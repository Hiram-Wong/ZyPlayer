<template>
  <div class="comm-player">
    <div ref="mseRef" id="comm-mse" class="comm-player-mse"></div>
  </div>
</template>

<script setup lang="ts">
import '@/style/player/index.less';

import { computed, shallowRef, useTemplateRef } from 'vue';
import { ArtPlayerAdapter, DPlayerAdapter, NPlayerAdapter, XgPlayerAdapter } from '@/utils/common/player/playerModule'
import { checkMediaType, singleton, mapVideoTypeToPlayerType } from '@/utils/tool';
import { usePlayStore } from '@/store';

const emits = defineEmits(['updateTime']);
const store = usePlayStore();
const adapter = shallowRef();
const mseRef = useTemplateRef('mseRef');
const playerType = computed(() => store.setting.playerMode.type);
const adapterRelation = {
  artplayer: ArtPlayerAdapter,
  dplayer: DPlayerAdapter,
  nplayer: NPlayerAdapter,
  xgplayer: XgPlayerAdapter,
};

const init = async () => {
  await destroy();
  const singleAdapter = singleton(adapterRelation?.[playerType.value]);
  adapter.value = await new singleAdapter();
};

const create = async (doc: { [key: string]: any }) => {
  if (!adapter.value) return;
  if (!doc.url) return;
  if (mseRef.value) mseRef.value.id = doc.container;
  if (!doc.type) {
    const checkType = await checkMediaType(doc.url);
    if (checkType === 'unknown' && !checkType) return;
    doc.type = checkType;
  };
  doc.type = mapVideoTypeToPlayerType(doc.type);
  await adapter.value.create(doc);
};

const destroy = async () => {
  if (!adapter.value) return;
  await adapter.value.destroy();
  adapter.value = null;
};

const play = async () => {
  if (!adapter.value) return;
  await adapter.value.play();
};

const pause = async () => {
  if (!adapter.value) return;
  await adapter.value.pause();
};

const barrage = async (comments, url, id) => {
  if (!adapter.value) return;
  await adapter.value.barrage(comments, url, id);
};

const onTimeUpdate = async () => {
  if (!adapter.value) return;
  await adapter.value.onTimeUpdate(({ currentTime, duration }) => {
    emits('updateTime', { currentTime, duration });
  });
};

defineExpose({
  init,
  barrage,
  create,
  destroy,
  play,
  pause,
  onTimeUpdate
});
</script>

<style lang="less" scoped>
.comm-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: url(@/assets/bg-player.jpg) center center;
  // .comm-player-bg {
  //   height: 100%;
  //   width: 100%;
  //   background: url(@/assets/bg-player.jpg) center center;
  // };
  .comm-player-mse {
    width: 100%;
  height: 100%;
  };
}
</style>
