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

const { BrowserWindow,getCurrentWindow } = require('@electron/remote');
const win = getCurrentWindow();

const active = ref({
  pin: false,
});

// 窗口置顶
const toggleAlwaysOnTop = () => {
  const isAlwaysOnTop = win.isAlwaysOnTop();
  const newValue = !isAlwaysOnTop;

  win.setAlwaysOnTop(newValue);
  BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', newValue ? 'no' : 'yes');
  active.value.pin = newValue;
};
</script>
