<template>
  <div class="system-controls">
    <div class="system-separator"></div>
    <div class="system-items">
      <div class="control-minimize control-item control-icon" @click="handleWindow('min')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
          <path d="M11,4.9v1.1H0V4.399h11z"></path>
        </svg>
      </div>
      <div class="control-maximize control-item control-icon" @click="handleWindow('max')">
        <svg v-if="!isMaxed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
          <path
            d="M0,1.7v7.6C0,10.2,0.8,11,1.7,11h7.6c0.9,0,1.7-0.8,1.7-1.7V1.7C11,0.8,10.2,0,9.3,0H1.7C0.8,0,0,0.8,0,1.7z M8.8,9.9H2.2c-0.6,0-1.1-0.5-1.1-1.1V2.2c0-0.6,0.5-1.1,1.1-1.1h6.7c0.6,0,1.1,0.5,1.1,1.1v6.7C9.9,9.4,9.4,9.9,8.8,9.9z">
          </path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
          <path
            d="M7.9,2.2h-7C0.4,2.2,0,2.6,0,3.1v7C0,10.6,0.4,11,0.9,11h7c0.5,0,0.9-0.4,0.9-0.9v-7C8.8,2.6,8.4,2.2,7.9,2.2z M7.7,9.6 c0,0.2-0.1,0.3-0.3,0.3h-6c-0.2,0-0.3-0.1-0.3-0.3v-6c0-0.2,0.1-0.3,0.3-0.3h6c0.2,0,0.3,0.1,0.3,0.3V9.6z">
          </path>
          <path d="M10,0H3.5v1.1h6.1c0.2,0,0.3,0.1,0.3,0.3v6.1H11V1C11,0.4,10.6,0,10,0z"></path>
        </svg>
      </div>
      <div class="control-close control-item control-icon" @click="handleWindow('close')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
          <path
            d="M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z">
          </path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const isMaxed = ref(false);

const handleWindow = (action: string): void => {
  window.electron.ipcRenderer.send('win:invoke', action);
  if (action === 'max') isMaxed.value = !isMaxed.value;
}

win.on('maximize', () => {
  isMaxed.value = true;
});

win.on('unmaximize', () => {
  isMaxed.value = false;
});
</script>

<style lang="less" scoped>
.system-controls {
  display: flex;
  align-items: center;
  height: 30px;

  .system-separator {
    display: block;
    border: 1px solid #47494d;
    border-radius: 2px;
    height: 15px;
    margin: 0 5px;
  }

  .system-items {
    display: flex;
  }

  .control-icon {
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--td-radius-default);

    svg {
      width: 1em;
      fill: var(--theme-svg-fill-color);
      display: initial;
      vertical-align: unset;
    }

    &:not(.inactive):hover {
      background-color: var(--theme-background-color);
    }
  }

  .control-close:not(.inactive) {
    &:hover {
      background-color: rgb(232 17 35 / 90%);

      svg {
        fill: #fff;
      }
    }
  }
}
</style>
