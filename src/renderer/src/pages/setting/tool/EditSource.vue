<template>
  <div class="lab view-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <h3 class="title">{{ $t('pages.setting.editSource.title') }}</h3>
        </div>
        <div class="right-operation-container">
          <div class="component-op">
            <div class="item" @click="importFileEvent">
              <file-import-icon />
              <span>{{ $t('pages.setting.editSource.import') }}</span>
            </div>
            <div class="item" @click="exportFileEvent">
              <file-export-icon />
              <span>{{ $t('pages.setting.editSource.export') }}</span>
            </div>
            <div class="item" @click="cacheEvent">
              <file-download-icon />
              <span>{{ $t('pages.setting.editSource.cache') }}</span>
            </div>
            <div class="item" @click="debugEvent">
              <bug-icon />
              <span>{{ $t('pages.setting.editSource.bug') }}</span>
            </div>
            <div class="item" @click="deleteEvent">
              <delete-icon />
              <span>{{ $t('pages.setting.editSource.delete') }}</span>
            </div>
          </div>
        </div>
      </t-row>
    </div>
    <div class="content">
      <div class="left">
        <div class="edit">
          <div class="code-op">
            <div class="item">
              <t-button class="button" theme="default" @click="showTemplateDialog">{{ $t('pages.setting.editSource.template') }}</t-button>
              <t-dialog
                v-model:visible="isVisible.template"
                :header="$t('pages.setting.editSource.template')"
                width="40%"
                @confirm="confirmTemplate()"
              >
                <p>{{ $t('pages.setting.editSource.templateTip') }}</p>
                <t-select v-model="form.template" @change="changeTheme()">
                  <t-option v-for="item in templates" :key="item.label" :value="item.value" :label="item.label" />
                </t-select>
              </t-dialog>
            </div>
            <div class="item source">
              <t-input v-model="form.url" label="url" :placeholder="$t('pages.setting.placeholder.general')" class="input"/>
              <t-button class="button" theme="default" @click="getSource">{{ $t('pages.setting.editSource.action.source') }}</t-button>
            </div>
          </div>
          <t-collapse>
            <t-collapse-panel :header="t('pages.setting.editSource.bar.title')">
              <div class="code-bar">
                <div class="item theme">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.bar.theme') }}</span>
                  <t-select v-model="config.theme" auto-width @change="changeTheme()">
                    <t-option v-for="item in themes" :key="item.label" :value="item.value" :label="item.label" />
                  </t-select>
                </div>
                
                <div class="item theme">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.bar.language') }}</span>
                  <t-select v-model="config.language" auto-width @change="changeLanguage()">
                    <t-option v-for="item in languages" :key="item.label" :value="item.label" :label="item.label" />
                  </t-select>
                </div>

                <div class="item theme">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.bar.eol') }}</span>
                  <t-select v-model="config.eol" auto-width @change="changeEOL()">
                    <t-option v-for="item in eols" :key="item.label" :value="item.value" :label="item.label" />
                  </t-select>
                </div>

                <div class="item theme">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.bar.wordWrap') }}</span>
                  <t-select v-model="config.wordWrap" auto-width @change="changeWarp()">
                    <t-option :label="$t('pages.setting.editSource.bar.enable')" value="on" />
                    <t-option :label="$t('pages.setting.editSource.bar.disable')" value="off" />
                  </t-select>
                </div>
              </div>
            </t-collapse-panel>
          </t-collapse>
          <div class="code-box" id="codeBox"></div>
        </div>
      </div>
      <div class="right">
        <div class="action">
          <div class="item">
            <t-button class="button" theme="default"@click="actionInit">{{ $t('pages.setting.editSource.action.init') }}</t-button>
            <t-button class="button" theme="default" @click="actionHome">{{ $t('pages.setting.editSource.action.classify') }}</t-button>
            <t-button class="button" theme="default" @click="actionHomeVod">{{ $t('pages.setting.editSource.action.home') }}</t-button>
          </div>
            <div class="item">
              <t-input v-model="form.category.t" label="t" :placeholder="$t('pages.setting.placeholder.general')" class="input w-33%"/>
              <t-input v-model="form.category.f" label="f" :placeholder="$t('pages.setting.placeholder.general')" class="input w-33%"/>
              <t-input v-model="form.category.pg" label="pg" :placeholder="$t('pages.setting.placeholder.general')" class="input w-33%"/>
              <t-button class="button w-btn" theme="default" @click="actionList">{{ $t('pages.setting.editSource.action.first') }}</t-button>
            </div>
            <div class="item">
              <t-input v-model="form.detail.ids" label="ids" :placeholder="$t('pages.setting.placeholder.general')" class="input w-100%"/>
              <t-button class="button w-btn" theme="default" @click="actionDetail">{{ $t('pages.setting.editSource.action.detail') }}</t-button>
            </div>
            <div class="item">
              <t-input v-model="form.search.wd" label="wd" :placeholder="$t('pages.setting.placeholder.general')" class="input w-50%"/>
              <t-input v-model="form.search.pg" label="pg" :placeholder="$t('pages.setting.placeholder.general')" class="input w-50%"/>
              <t-button class="button w-btn" theme="default" @click="actionSearch">{{ $t('pages.setting.editSource.action.search') }}</t-button>
            </div>
          <div class="item mg-top">
            <t-input v-model="form.play.flag" label="flag" :placeholder="$t('pages.setting.placeholder.general')" class="input w-50%"/>
            <t-input v-model="form.play.play" label="play" :placeholder="$t('pages.setting.placeholder.general')" class="input w-50%"/>
            <t-button class="button w-btn" theme="default" @click="actionPlay">{{ $t('pages.setting.editSource.action.play') }}</t-button>
          </div>
        </div>
        <div class="log">
          <div class="text">
            <div class="select">
              <t-radio-group variant="default-filled" size="small" v-model="form.nav" @change="changeNav()">
                <t-radio-button value="debug">{{ $t('pages.setting.editSource.select.debug') }}</t-radio-button>
                <t-radio-button value="source">{{ $t('pages.setting.editSource.select.source') }}</t-radio-button>
                <t-radio-button value="log">{{ $t('pages.setting.editSource.select.log') }}</t-radio-button>
              </t-radio-group>
            </div>
            <json-viewer
              v-if="form.nav === 'debug'"
              :value="formatJson"
              copyable
              sort
              :theme="systemTheme"
              style="height: 100%;"
            />
            <t-textarea v-else class="t-textarea" readonly v-model="form.content.text" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "vue3-json-viewer/dist/index.css";

import { useEventBus } from '@vueuse/core';
import * as monaco from 'monaco-editor';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { JsonViewer } from "vue3-json-viewer";
import { MessagePlugin } from 'tdesign-vue-next';
import { BugIcon, DeleteIcon, FileDownloadIcon, FileExportIcon, FileImportIcon } from 'tdesign-icons-vue-next';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import { t } from '@/locales';
import { useSettingStore } from '@/store';
import { fetchDebugSource, setDebugSource, delDebugSource } from '@/api/lab';
import { getConfig } from '@/utils/tool';
import { getMubans } from '@/utils/drpy/template';
import { doWork as t3Work } from '@/utils/drpy/index';

const remote = window.require('@electron/remote');
const router = useRouter();
const emitReload = useEventBus<string>('film-reload');

const storeSetting = useSettingStore();

const systemTheme = computed(() => {
  return storeSetting.displayMode;
});

const formatJson = computed(() => {
  try {
    if (form.value.content.text) return JSON.parse(form.value.content.text);
    return {};
  } catch(err) {
    console.error(err);
    return {};
  };
});


watch(
  () => systemTheme.value,
  (val) => {
    config.theme = val === 'light' ? 'vs' : 'vs-dark';
    changeTheme();
  }
);

let editor: monaco.editor.IStandaloneCodeEditor | undefined;

self.MonacoEnvironment = {
  getWorker(workerId, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (['typescript', 'javascript'].includes(label)) {
      return new tsWorker();
    }
    return new EditorWorker();
  },
};

const codeThemeKey = 'code-theme';
const warpKey = 'code-warp';

type WordWrapOptions = 'off' | 'on' | 'wordWrapColumn' | 'bounded';
interface EditorConfig {
  theme: string;
  language: string;
  eol: number;
  wordWrap: WordWrapOptions;
}

const config = reactive<EditorConfig>({
  theme: systemTheme.value === 'light' ? 'vs' : 'vs-dark',
  language: 'javascript',
  eol: monaco.editor.EndOfLineSequence.LF,
  wordWrap: 'on',
});

const eols = [
  {
    label: 'LF',
    value: monaco.editor.EndOfLineSequence.LF,
  },
  {
    label: 'CRLF',
    value: monaco.editor.EndOfLineSequence.CRLF,
  },
];

const themes = [
  {
    label: 'Light',
    value: 'vs',
  },
  {
    label: 'Dark',
    value: 'vs-dark',
  }
];

const languages = [
  {
    label: 'json',
    value: ['json'],
  },
  {
    label: 'yaml',
    value: ['yml', 'yaml'],
  },
  {
    label: 'xml',
    value: ['xml'],
  },
  {
    label: 'javascript',
    value: ['js'],
  },
  {
    label: 'java',
    value: ['java'],
  },
  {
    label: 'python',
    value: ['py'],
  },
];

const templates = computed(() => {
  const dictionary = getMubans();
  const keysAsObjects = Object.keys(dictionary).map(key => ({ label: key, value: key }));
  return keysAsObjects;
});

let form = ref({
  content: {
    edit: '',
    log: '',
    text: '',
    debug: '',
    source: ''
  },
  template: 'mxpro',
  url: '',
  nav: 'debug',
  detail: {
    ids: ''
  },
  category: {
    t: '',
    f: '',
    pg: ''
  },
  search: {
    wd: '',
    pg: ''
  },
  play: {
    flag: '',
    play: ''
  }
});

const isVisible = reactive({
  template: false
});

const changeLanguage = () => {
  if (editor) monaco.editor.setModelLanguage(editor.getModel()!, config.language);
};

const changeTheme = () => {
  monaco.editor.setTheme(config.theme);
  localStorage.setItem(codeThemeKey, config.theme);
};

const changeEOL = () => {
  if (editor) editor.getModel()!.pushEOL(config.eol);
};

const changeWarp = () => {
  localStorage.setItem(warpKey, config.wordWrap);
  if (editor) editor.updateOptions({
    wordWrap: config.wordWrap,
  });
};

const confirmTemplate = () => {
  try {
    const text = getMubans()[form.value.template];
    if (editor) editor.setValue(`var rule = ${JSON.stringify(text, null, 2).split('\n').join('\n  ')}`);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
  isVisible.template = false;
};

const initEditor = () => {
  if (editor) editor.dispose();
  nextTick(() => {
    const codeBox = document.getElementById('codeBox');
    editor = monaco.editor.create(codeBox as HTMLElement, {
      theme: config.theme,
      value: form.value.content.edit,
      readOnly: false,
      automaticLayout: true,
      language: config.language,
      folding: true,
      roundedSelection: false,
      overviewRulerBorder: false,
      wordWrap: config.wordWrap,
    });
    editor.onDidChangeModelContent(() => {
      if (editor) {
        form.value.content.edit = editor.getValue();
      }
    });

    // After onDidChangeModelContent
    editor.getModel()!.pushEOL(config.eol);
  });
};

onMounted(()=>{
  initEditor();
})

onBeforeUnmount(() => {
  if (editor) editor.dispose();
});

const importFileEvent = async() => {
  try {
    // @ts-ignore
    const [fileHandle] = await window.showOpenFilePicker();
    if (!fileHandle) return;

    const file = await fileHandle.getFile();
    const content = await file.text();
    if (editor) editor.setValue(content);
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const exportFileEvent = async() => {
  const str = editor ? editor.getValue() : '';
  if (!str.trim()) return;

  try {
    const saveDialogResult = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      defaultPath: 'source.js',
      filters: [{ name: 'JavaScript Files', extensions: ['js'] }],
    });

    if (!saveDialogResult.canceled) {
      const { filePath } = saveDialogResult;
      const fs = remote.require('fs').promises;
      await fs.writeFile(filePath, str, 'utf-8');
      MessagePlugin.success(t('pages.setting.data.success'));
    }
  } catch (err) {
    console.error('Failed to save or open save dialog:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const debugEvent = async() => {
  try {
    const text = form.value.content.edit;
    const res = await setDebugSource(text);
    if (res) MessagePlugin.success(t('pages.setting.data.success'));
    emitReload.emit('film-reload');
    router.push({ name: 'FilmIndex' });
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const cacheEvent = async() => {
  try {
    const res = await fetchDebugSource();
    if (editor) editor.setValue(res);
    if (res) MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const deleteEvent = async() => {
  try {
    const res = await delDebugSource();
    if (res) MessagePlugin.success(t('pages.setting.data.success'));
    emitReload.emit('film-reload');
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const changeNav = (nav = '') => {
  if (!nav) nav = form.value.nav;
  else form.value.nav = nav;
  if (nav === 'log') {
    remote.getCurrentWebContents().openDevTools();
    MessagePlugin.success(t('pages.setting.editSource.message.openDevTools'));
    return;
  }
  if (typeof form.value.content[nav] === 'object') {
    form.value.content.text =  JSON.stringify(form.value.content[nav]);
  } else form.value.content.text = form.value.content[nav];
};

const performAction = async (type, requestData = {}) => {
  try {
    const res = await t3Work({ type, data: requestData });
    form.value.content.debug = res as string;
    changeNav('debug');
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
};

const actionInit = async () => {
  const { edit } = form.value.content;
  const data = edit.trim();
  if (data) {
    await performAction('init', data);
  }
};

const actionHome = async () => {
  await performAction('home');
};

const actionHomeVod = async () => {
  await performAction('homeVod');
};

const actionList = async () => {
  const { t, f, pg } = form.value.category;
  if (t) {
    const data = {
      tid: t,
      pg: pg ?? 1,
      filter: f ? true : false,
      extend: f ?? {}
    }
    await performAction('category', data);
  }
};

const actionDetail = async () => {
  const { ids } = form.value.detail;
  if (ids) {
    await performAction('detail', ids);
  }
};

const actionSearch = async () => {
  const { wd, pg } = form.value.search;
  if (wd) {
    const data = {
      wd,
      quick: false,
      pg: pg ?? 1
    };
    await performAction('search', data);
  }
};

const actionPlay = async () => {
  const { flag, play } = form.value.play;
  if (flag && play) {
    const data = {
      flag: flag,
      id: play,
      flags: []
    };
    await performAction('play', data);
  }
};

const getSource = async() => {
  const url = form.value.url;
  if (url) {
    const res = await getConfig(url);
    form.value.content.source = res;
    changeNav('source');
  };
};

const showTemplateDialog = () => {
  isVisible.template = true;
};
</script>

<style lang="less" scoped>
.lab {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
  .header {
    margin: var(--td-comp-margin-s) 0;
    .left-operation-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      .title {
        margin-right: 5px
      }
    }
    .right-operation-container {
      .component-op {
        display: flex;
        height: var(--td-comp-size-m);
        padding: 0 var(--td-comp-paddingLR-xs);
        background-color: var(--td-bg-content-input);
        border-radius: var(--td-radius-default);
        align-items: center;
        .item {
          color: var(--td-text-color-placeholder);
          border-radius: var(--td-radius-default);
          display: flex;
          align-items: center;
          padding: 2px 4px;
          height: 22px;
          cursor: pointer;
          text-decoration: none;
          &:hover {
            transition: all 0.2s ease 0s;
            color: var(--td-text-color-primary);
            background-color: var(--td-bg-color-container-hover);
          }
        }
      }
    }
  }
  
  .content {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    grid-gap: var(--td-comp-margin-s);
    width: 100%;
    height: 100%;
    overflow: hidden;
    .left {
      height: 100%;
      width: 50%;
      .edit {
        display: flex;
        flex-direction: column;
        grid-gap: var(--td-comp-margin-s);
        height: 100%;
        .code-bar {
          height: auto;
          flex: auto;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          grid-gap: var(--td-comp-margin-s);
          .item {
            display: flex;
            flex-direction: row;
            align-items: center;
            .codebox-label {
              display: inline-block;
              width: 100%;
              margin: 0 var(--td-comp-margin-l);
            }
            :deep(.t-input) {
              background-color: var(--td-bg-content-input) !important;
              border-color: transparent;
            }
          }
        }
        :deep(.t-collapse) {
          background-color: var(--td-bg-content-input);
          border-color: transparent;
          border-radius: var(--td-radius-default);
          .t-collapse-panel__header, .t-collapse-panel__body {
            border-color: transparent;
          }
          .t-collapse-panel__header {
            padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-l);
          }
          .t-collapse-panel__body {
            border-radius: var(--td-radius-default);
            margin-bottom: var(--td-comp-margin-xxs);
            .t-collapse-panel__content {
              padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-xxs);
            }
          }
        }
        .code-op {
          display: flex;
          grid-gap: var(--td-comp-margin-s);
          .item {
            display: flex;
            grid-gap: var(--td-comp-margin-s);
          }
          .source {
            display: flex;
            grid-gap: var(--td-comp-margin-s);
            flex: 1;
          }
        }
        .code-box {
          flex: 1;
          height: 100%;
          border-radius: var(--td-radius-default);
          overflow: hidden;
        }
      }
    }
    .right{
      height: 100%;
      width: 50%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      grid-gap: var(--td-comp-margin-s);
      .action {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        grid-gap: var(--td-comp-margin-s);
        .item {
          display: flex;
          flex-wrap: nowrap;
          width: 100%;
          overflow: hidden;
          .input {
            width: 100%;
            margin-right: var(--td-comp-margin-s);
          }
          .button {

          }
          .w-btn {
            width: 50px;
          }
          .w-100\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s))));
          }
          .w-50\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 2);
          }
          .w-33\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s) * 3)) / 3);
          }
        }
      }
      .log {
        flex: 1;
        padding-top: var(--td-comp-paddingTB-m);
        overflow: hidden;
        .select {
          position: absolute;
          z-index: 100;
          top: -15px;
          left: 10px;
          :deep(.t-radio-group) {
            box-shadow: var(--td-shadow-3);
          }
        }
        .text {
          position: relative;
          height: 100%;
          :deep(.jv-container) {
            background-color: var(--td-bg-content-input) !important;
            border-radius: var(--td-radius-default);
            .jv-button {
              color: var(--td-brand-color);
            }
            .jv-code {
              overflow-y: auto !important;
              height: 100%;
            }
            .jv-more {
              display: none;
            }
          }
        }
        .t-textarea {
          height: 100%;
          :deep(.t-textarea__inner) {
            height: 100%;
            padding-top: var(--td-comp-paddingTB-l);
            border-color: transparent;
            background-color: var(--td-bg-content-input);
            &:focus {
              box-shadow: none;
            }
          }
        }
      }

    }
  }
}
:deep(.t-input) {
  background-color: var(--td-bg-content-input) !important;
  border-color: transparent;
  box-shadow: none;
}
</style>