<template>
  <div class="file-diff view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.fileDiff') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="origin">{{ $t('pages.lab.fileDiff.origin') }}</t-radio-button>
          <t-radio-button value="target">{{ $t('pages.lab.fileDiff.target') }}</t-radio-button>
        </t-radio-group>
      </div>
    </div>
    <div class="content">
      <code-editor
        v-model="form.target"
        v-model:original-text="form.origin"
        mode="diff"
        :options="diffEditConf"
        class="diff-box"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { useSettingStore } from '@/store';
import { CodeEditor } from '@/components/code-editor';

const remote = window.require('@electron/remote');
const storeSetting = useSettingStore();

const form = ref({
  target: '',
  origin: '',
});
const active = ref({
  nav: '',
});


const diffEditConf = ref({
  theme: storeSetting.displayMode === 'light' ? 'vs' : 'vs-dark',
  enableSplitViewResizing: true, // 是否允许拖动分割线
  originalEditable: true, // 是否允许编辑原始文本
  renderSideBySide: true, // 是否渲染为并排模式(不生效)
  wordWrap: 'on',
  readOnly: false,
  automaticLayout: true,
  folding: true,
  roundedSelection: false,
  overviewRulerBorder: false,
  scrollBeyondLastLine: false,
  fixedOverflowWidgets: true
});

const importFileEvent = async (type: string) => {
  try {
    const readFile = async(filePath: string) =>{
      const fs = remote.require('fs').promises;
      return await fs.readFile(filePath, 'utf-8');
    }

    const { canceled, filePaths } = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      title: 'Select a file to read',
      filters: [
        { name: 'JavaScript Files', extensions: ['js'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (!canceled && filePaths) {
      const filePath = filePaths[0];
      const content = await readFile(filePath);
      form.value[type] = content;
      MessagePlugin.success(t('pages.setting.data.success'));
    };
  } catch (err: any) {
    console.error(`[exportFileEvent][Error]:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

const handleOpChange = (type: string) => {
  active.value.nav = '';

  switch (type) {
    case 'origin':
      importFileEvent('origin');
      break;
    case 'target':
      importFileEvent('target');
      break;
  };
};

</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 36px;

    .left-operation-container {
      display: flex;
      flex-direction: row;
      align-items: center;

      .title {
        margin-right: 5px
      }
    }

    .right-operation-container {
      :deep(.t-radio-group.t-size-m) {
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;
        .t-radio-button {
          padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
          background-color: var(--td-bg-content-input-2);
          border-color: transparent;
        }
      }
    }
  }

  .content {
    flex: 1;
    width: 100%;
    height: 100%;

    .diff-box {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
