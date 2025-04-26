<template>
  <div class="system-pin" @click="toggleAlwaysOnTop">
    <t-button theme="default" shape="square" variant="text">
      <pin-filled-icon v-if="active.pin" />
      <pin-icon v-else />
    </t-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PinFilledIcon, PinIcon } from 'tdesign-icons-vue-next';

const active = ref({
  pin: false,
});

// 窗口置顶
const toggleAlwaysOnTop = async () => {
  const currStatus = await window.electron.ipcRenderer.invoke('manage-pin', { action: 'status' });
  const newStatus = await window.electron.ipcRenderer.invoke('manage-pin', { action: 'set', config: { status: !currStatus } });
  active.value.pin = newStatus;
};
</script>
