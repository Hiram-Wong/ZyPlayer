<template>
  <div class="search-bar">
    <div class="group">
      <t-input
        v-model="searchValue"
        class="input-url"
        placeholder="输个链接,让世界充满爱～"
        size="large"
        @enter="searchEvent"
      />
      <t-button class="play" size="large" @click="searchEvent">
        <p class="tip">解析</p>
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive } from 'vue';

const analyzeSearchBus = useEventBus<string>('analyze-search');
const searchInputBus = useEventBus<string>('search-input');

const searchValue = ref('');

searchInputBus.on((url: string)=>{
  searchValue.value = url;
});

// 搜索资源
const searchEvent = async () => {
  const text = searchValue.value;
  if (text) {
    analyzeSearchBus.emit(text);
  } else {
    MessagePlugin.warning('请先输入链接后再进行解析');
  }
};
</script>

<style lang="less" scoped>
.search-bar {
  .group {
    width: 30em;
    position: relative;
    height: 32px;
    padding: 0;
    border-radius: 20px;
    background-color: var(--td-bg-content-input);
    display: flex;
    :deep(.t-input) {
      border-radius: 20px;
      background-color: var(--td-bg-content-input);
      border: none;
      outline: none;
    }
    :deep(.t-input--focused) {
      box-shadow: none;
      color: none;
    }
    :deep(.input-url) {
      overflow: visible;
      outline: none;
      background: none;
      border: 0;
      width: 100%;
      font-size: 15px;
      color: var(--td-text-color-primary);
      display: inline-block;
      .t-input {
        height: 100%;
      }
    }
    .play {
      height: 100%;
      border-radius: 0 20px 20px;
      width: 5em;
      .tip {
        color: hsl(0deg 0% 0% / 60%);
        font-size: 15px;
        font-weight: 500;
        line-height: 32px;
        text-align: center;
      }
    }
  }
}
</style>