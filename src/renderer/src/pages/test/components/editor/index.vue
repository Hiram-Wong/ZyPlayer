<template>
  <div class="test-editor view-component-container">
    <code-editor v-model="sourceCode" :options="editConf" class="code-box" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import type { IEditorOptions } from '@/components/code-editor';
import CodeEditor from '@/components/code-editor';

const sourceCode = ref('');
const editConf = ref<IEditorOptions['normal']>({
  automaticLayout: true, // 自动布局
  fixedOverflowWidgets: true, // 溢出小部件固定
  folding: true, // 代码折叠
  fontFamily: 'JetBrainsMono, monospace',
  fontLigatures: false, // 连字符
  insertSpaces: false, // 使用空格代替制表符
  language: 'html',
  minimap: { enabled: false },
  overviewRulerBorder: false, // 概览标尺边框
  readOnly: false,
  roundedSelection: false, // 选区边框圆角
  scrollBeyondLastLine: false, // 滚动到最后一行后禁止继续滚动
  scrollbar: {
    useShadows: false,
    verticalScrollbarSize: 5,
    horizontalScrollbarSize: 5,
  },
  smoothScrolling: true,
  stickyScroll: { enabled: false },
  tabSize: 2,
  theme: 'vs-dark',
  wordWrap: 'off',
});
</script>
<style lang="less" scoped>
.view-component-container {
  width: 100%;
  height: 100%;
  padding: 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingTB-s) 0;
  border-radius: var(--td-radius-medium);
  overflow: hidden;
}
</style>
