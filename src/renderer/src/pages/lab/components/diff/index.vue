<template>
  <div class="lab-diff view-component-container">
    <div class="header">
      <div class="left-op-container">
        <t-input v-model="formData.origin.path" class="header-input" @enter="onImportFileByPath('origin')" />
        <t-button theme="default" shape="square" class="header-btn" @click="onImportFile('origin')">
          <template #icon><file-add-icon /></template>
        </t-button>
        <t-button theme="default" shape="square" class="header-btn" @click="onExportFile('origin')">
          <template #icon><save-icon /></template>
        </t-button>
      </div>

      <div class="right-op-container">
        <t-input v-model="formData.target.path" class="header-input" @enter="onImportFileByPath('target')" />
        <t-button theme="default" shape="square" class="header-btn" @click="onImportFile('target')">
          <template #icon><file-add-icon /></template>
        </t-button>
        <t-button theme="default" shape="square" class="header-btn" @click="onExportFile('target')">
          <template #icon><save-icon /></template>
        </t-button>
      </div>
    </div>

    <div class="content">
      <code-editor
        v-model="formData.target.content"
        v-model:original-value="formData.origin.content"
        mode="diff"
        :options="editorOptions"
        class="diff-box"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { THEME } from '@shared/config/theme';
import { isArrayEmpty, isNil } from '@shared/modules/validate';
import { FileAddIcon, SaveIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import type { IEditorOptions } from '@/components/code-editor';
import CodeEditor from '@/components/code-editor';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

const storeSetting = useSettingStore();

const formData = ref({
  origin: { path: '', content: '' },
  target: { path: '', content: '' },
});

const editorOptions = ref<IEditorOptions['diff']>({
  automaticLayout: true, // 自动布局
  fixedOverflowWidgets: true, // 溢出小部件固定
  folding: true, // 代码折叠
  fontFamily: 'JetBrainsMono, monospace',
  fontLigatures: false, // 连字符
  minimap: { enabled: false },
  originalEditable: true, // 允许编辑原始内容
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
  theme: storeSetting.displayTheme === THEME.LIGHT ? 'vs' : 'vs-dark',
  useInlineViewWhenSpaceIsLimited: false, // 空间有限时不使用内联视图
  wordWrap: 'off',
});

watch(
  () => storeSetting.displayTheme,
  (val) => (editorOptions.value.theme = val === THEME.LIGHT ? 'vs' : 'vs-dark'),
);

const onImportFileByPath = async (type: 'origin' | 'target') => {
  const { path } = formData.value[type];
  if (!path) return;

  try {
    const content = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FS_FILE_READ, path);
    if (isNil(content)) return;
    formData.value[type].content = content ?? '';

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error(`Fail to import file:`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const onImportFile = async (type: 'origin' | 'target') => {
  try {
    const paths = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FILE_SELECT_FILE_DIALOG, {});
    if (isNil(paths) || isArrayEmpty(paths)) return;

    const path = paths[0];
    formData.value[type].path = path;

    const content = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FS_FILE_READ, path);
    if (isNil(content)) return;
    formData.value[type].content = content ?? '';

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error(`Fail to import file:`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const onExportFile = async (type: 'origin' | 'target') => {
  const { path, content } = formData.value[type];
  if (!content) return;

  try {
    let writeStatus = false;
    if (path) {
      writeStatus = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FS_FILE_WRITE, path, content);
    } else {
      const resp = await window.electron.ipcRenderer.invoke(IPC_CHANNEL.FILE_SELECT_FILE_WRITE, content, {
        defaultPath: path,
      });
      writeStatus = resp.status ?? false;
      if (!path) formData.value[type].path = resp.path ?? '';
    }

    if (writeStatus) MessagePlugin.success(t('common.success'));
    else MessagePlugin.warning(t('common.fail'));
  } catch (error) {
    console.error(`Fail to export file:`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};
</script>
<style lang="less" scoped>
.view-component-container {
  padding: 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingTB-s) 0;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    display: flex;
    justify-content: space-between;
    gap: var(--td-size-4);

    .left-op-container,
    .right-op-container {
      display: flex;
      align-items: center;
      gap: var(--td-size-4);
      width: 50%;

      .header-input {
        flex: 1;
      }
    }
  }

  .content {
    height: 100%;
    width: 100%;
    flex: 1;

    .diff-box {
      height: 100%;
      width: 100%;
      border-radius: var(--td-radius-medium);
      overflow: hidden;
    }
  }
}
</style>
