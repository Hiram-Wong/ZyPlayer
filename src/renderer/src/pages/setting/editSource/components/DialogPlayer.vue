<template>
  <t-dialog v-model:visible="formVisible" :closeOnOverlayClick="false" :width="650"
    :header="$t('pages.setting.editSource.source.dialog.player.title')" placement="center" :footer="false">
    <template #body>
      <player ref="playerRef" class="player"/>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef, watch } from 'vue';

import Player from '@/components/player/index.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    default: ''
  }
});
const formVisible = ref(false);
const formData = reactive({
  url: '',
  isActive: true,
});

const playerRef = ref(null) as any;
const player = shallowRef({
  type: 'player',
  player: ''
});

const emit = defineEmits(['update:visible']);
watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);

    if (val) {
      setupPlayer(formData.url);
    } else {
      if (player.value.player) {
        destroyPlayer();
      };
    };
  }
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
  },
);
watch(
  () => props.url,
  (val) => {
    formData.url = val;
  },
);

const setupPlayer = async (url: string) => {
  player.value = await playerRef.value!.createPlayer('player', url);
};

const destroyPlayer = async () => {
  playerRef.value!.destroyPlayer(player.value!.type, player.value!.player);
};
</script>

<style lang="less" scoped>
.player {
  border-radius: var(--td-radius-large);
  overflow: hidden;
  width: 100%;
  height: 320px;
}
</style>
