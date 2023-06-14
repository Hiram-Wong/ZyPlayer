<template>
  <div v-if="systemPlatform !== 'darwin'" class="window">
    <div class="window-popup window-item" @click="minimizeEvent">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11"><path d="M11,4.9v1.1H0V4.399h11z"></path></svg>
    </div>
    <div class="window-popup window-item" @click="minMaxEvent">
      <svg v-if="!isMaxed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
          <path
            d="M0,1.7v7.6C0,10.2,0.8,11,1.7,11h7.6c0.9,0,1.7-0.8,1.7-1.7V1.7C11,0.8,10.2,0,9.3,0H1.7C0.8,0,0,0.8,0,1.7z M8.8,9.9H2.2c-0.6,0-1.1-0.5-1.1-1.1V2.2c0-0.6,0.5-1.1,1.1-1.1h6.7c0.6,0,1.1,0.5,1.1,1.1v6.7C9.9,9.4,9.4,9.9,8.8,9.9z"
          ></path>
        </svg>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
        <path
          d="M7.9,2.2h-7C0.4,2.2,0,2.6,0,3.1v7C0,10.6,0.4,11,0.9,11h7c0.5,0,0.9-0.4,0.9-0.9v-7C8.8,2.6,8.4,2.2,7.9,2.2z M7.7,9.6 c0,0.2-0.1,0.3-0.3,0.3h-6c-0.2,0-0.3-0.1-0.3-0.3v-6c0-0.2,0.1-0.3,0.3-0.3h6c0.2,0,0.3,0.1,0.3,0.3V9.6z"
        ></path>
        <path d="M10,0H3.5v1.1h6.1c0.2,0,0.3,0.1,0.3,0.3v6.1H11V1C11,0.4,10.6,0,10,0z"></path>
      </svg>
    </div>
    <div class="window-popup window-item" @click="closeEvent">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
        <path
          d="M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z"
        ></path>
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window';
import { computed, ref } from 'vue';

import { useSettingStore } from '@/store';

const storeSetting = useSettingStore();

const isMaxed = ref(false);
const systemPlatform = computed(() => {
  // 'linux', 'darwin', 'ios', 'freebsd', 'dragonfly', 'netbsd', 'openbsd', 'solaris', 'android', 'win32'
  return storeSetting.systemPlatform;
});

const minimizeEvent = async () => {
  await appWindow.minimize();
};
const closeEvent = async () => {
  await appWindow.close();
};
const minMaxEvent = async () => {
  if (isMaxed.value) {
    await appWindow.unmaximize();
  } else {
    await appWindow.maximize();
  }
  isMaxed.value = !isMaxed.value;
};

appWindow.listen('maximize', () => {
  console.log('最大化');
  isMaxed.value = true;
});

appWindow.listen('unmaximize', () => {
  console.log('最大化恢复');
  isMaxed.value = false;
});
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
    svg {
      width: 10px;
      height: -webkit-fill-available;
      fill: #fff;
      display: initial;
      vertical-align: unset;
    }
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
