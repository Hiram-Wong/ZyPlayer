<template>
  <div class="titlebar" :class="platform === 'win32' ? 'windows' : 'linux'">
    <div class="drag-region"></div>

    <div v-if="platform !== 'darwin'" class="window-controls">
      <div class="control-minimize control-icon" @click="win.minimize()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11"><path d="M11,4.9v1.1H0V4.399h11z"></path></svg>
      </div>
      <div class="control-maximize control-icon" @click="minMaxEvent">
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
      <div id="close" class="control-close control-icon" @click="win.destroy()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
          <path
            d="M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z"
          ></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

win.on('maximize', () => {
  isMaxed.value = true;
});

win.on('unmaximize', () => {
  isMaxed.value = false;
});
</script>

<style lang="less" scoped>
.titlebar.windows,
.titlebar.linux {
  -webkit-app-region: drag;
  padding: 0;
  height: 30px;
  line-height: 30px;
  justify-content: left;
  overflow: visible;
}

.linux {
  .window-controls {
    padding: 12px 10px 0 0;
    .window-controls #close:not(.inactive):hover svg {
      fill: #fff !important;
    }
    #close:not(.inactive):hover {
      background-color: #d85e33 !important;
    }
    .control-icon {
      margin-left: 20px;
      width: 18px !important;
      height: 18px;
      border-radius: 50% !important;
      svg {
        width: 8px !important;
      }
    }
    .control-close {
      background-color: #d85e33;
      svg {
        fill: #fff !important;
      }
    }
  }
}

.titlebar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-wrap: wrap;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
  padding: 0 16px;
  overflow: hidden;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  zoom: 1;
  width: 100%;
  height: 31px;
  line-height: 31px;
  z-index: 99999;
  .drag-region {
    top: 0;
    left: 0;
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
    -webkit-app-region: drag;
  }
  .window-controls {
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    text-align: center;
    position: relative;
    z-index: 99;
    -webkit-app-region: no-drag;
    height: 30px;
    font-family: initial !important;
    margin-left: auto;

    .control-close:not(.inactive):hover {
      background-color: rgb(232 17 35 / 90%) !important;
    }
    .control-close:not(.inactive):hover svg {
      fill: #fff !important;
    }

    .control-icon {
      width: 46px;
      display: flex;
      justify-content: center;
      align-items: center;
      svg {
        width: 10px;
        height: -webkit-fill-available;
        fill: #222;
        display: initial !important;
        vertical-align: unset !important;
      }
      &:not(.inactive):hover {
        background-color: rgb(0 0 0 / 12%);
      }
    }
  }
}

:root[theme-mode='dark'] {
  .linux {
    .window-controls {
      #close:not(.inactive):hover svg {
        fill: #fff !important;
      }
    }
  }
  .titlebar {
    .window-controls {
      .control-icon:not(.inactive):hover {
        background-color: rgb(255 255 255 / 12%);
      }

      .control-icon {
        svg {
          fill: #fff;
        }
      }
    }
  }
}
</style>
