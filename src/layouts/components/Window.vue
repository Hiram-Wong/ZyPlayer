<template>
  <div v-if="platform !== 'darwin'" class="window">
    <div class="window-popup window-item" @click="win.minimize()">
      <remove-icon size="1.5em" />
    </div>
    <div class="window-popup window-item" @click="minMaxEvent">
      <rectangle-icon v-if="!isMaxed" size="1.2em" />
      <relativity-icon v-else size="1.2em" />
    </div>
    <div class="window-popup window-item" @click="win.destroy()">
      <close-icon size="1.5em" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { RectangleIcon, RelativityIcon, RemoveIcon, CloseIcon } from 'tdesign-icons-vue-next';

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();
const { platform } = process;
const isMaxed = ref(false);

const minMaxEvent = () => {
  if (isMaxed.value) {
    remote.getCurrentWindow().unmaximize();
  } else {
    remote.getCurrentWindow().maximize();
  }
  isMaxed.value = !isMaxed.value;
};
</script>

<style lang="less" scoped>
.window {
  float: right;
  display: flex;
  justify-content: flex-end;
  -webkit-app-region: no-drag;
  &-popup {
    line-height: 20px;
    position: relative;
    width: 100%;
    height: 100%;
    user-select: none;
    font-size: 13px;
    // color: #fff;
    letter-spacing: 0;
    font-weight: 400;
    margin-left: 5px;
  }
  &-item {
    cursor: pointer;
    width: 30px;
    height: 30px;
    border-radius: 5px;
    text-align: center;
    line-height: 25px;
    &:hover {
      background-color: #2f3134;
    }
  }
}
</style>
