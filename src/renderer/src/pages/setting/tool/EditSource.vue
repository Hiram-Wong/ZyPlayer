<template>
  <div class="lab view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.setting.editSource.title') }}</h3>
      </div>
      <div class="right-operation-container">
        <div class="component-op">
          <div class="item" @click="showTemplateDialog()">
            <extension-icon />
            <span>{{ $t('pages.setting.editSource.template') }}</span>
          </div>
          <div class="item item-pad-select">
            <file-icon />
            <t-select v-model="tmp.file" @change="fileEvent()">
              <t-option key="import" :label="$t('pages.setting.editSource.import')" value="import"
                @click="importFileEvent" />
              <t-option key="export" :label="$t('pages.setting.editSource.export')" value="export"
                @click="exportFileEvent" />
              <t-option key="cache" :label="$t('pages.setting.editSource.cache')" value="cache" @click="cacheEvent" />
            </t-select>
          </div>
          <div class="item item-pad-select">
            <bug-icon />
            <t-select v-model="tmp.run" @change="fileEvent()">
              <t-option key="bug" :label="$t('pages.setting.editSource.bug')" value="bug" @click="debugEvent" />
              <t-option key="delete" :label="$t('pages.setting.editSource.delete')" value="expdeleteodeletert"
                @click="deleteEvent" />
              <t-option key="file" :label="$t('pages.setting.editSource.file')" value="file" @click="serverEvent" />
            </t-select>
          </div>
          <div class="item" @click="helpEvent">
            <help-rectangle-icon />
            <span>{{ $t('pages.setting.editSource.help') }}</span>
          </div>

          <t-dialog v-model:visible="isVisible.template" :header="$t('pages.setting.editSource.template')"
            show-in-attached-element width="40%" @confirm="confirmTemplate()">
            <p>{{ $t('pages.setting.editSource.templateTip') }}</p>
            <t-select v-model="form.template" @change="changeTheme()">
              <t-option v-for="item in templates" :key="item.label" :value="item.value" :label="item.label" />
            </t-select>
          </t-dialog>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <div class="edit">
          <div class="code-op">
            <div class="code-op-item">
              <div class="item source">
                <t-input-adornment>
                  <template #prepend>
                    <t-select v-model="form.req.method" auto-width>
                      <t-option v-for="item in reqMethods" :key="item.value" :value="item.value" :label="item.label" />
                    </t-select>
                  </template>
                  <template #append>
                    <t-button class="button" theme="default" @click="getSource()">{{
                      $t('pages.setting.editSource.action.source') }}</t-button>
                  </template>
                  <div class="input-container">
                    <t-input v-model="form.req.url" :placeholder="$t('pages.setting.placeholder.general')"
                      class="input" />
                    <div class="method" @click="showReqParamDialog()">
                      <transform-icon />
                    </div>
                  </div>
                </t-input-adornment>
                <t-dialog v-model:visible="isVisible.reqParam"
                  :header="$t('pages.setting.editSource.dialog.request.title')"
                  :cancel-btn="$t('pages.setting.editSource.dialog.request.cancel')" show-in-attached-element
                  @confirm="isVisible.reqParam = false" @cancel="reqCancel()">
                  <div>
                    <p>{{ $t('pages.setting.editSource.reqHeaderTitle') }}</p>
                    <t-textarea v-model="form.req.header" placeholder='{ "User-Agent": "Mozilla/5.0 zyplayer" }' />
                  </div>
                  <div v-if="form.req.method !== 'GET'">
                    <p>{{ $t('pages.setting.editSource.reqBodyTitle') }}</p>
                    <t-select v-model="form.req.contentType" class="contentType" style="margin-bottom: 5px;">
                      <t-option v-for="item in reqContentTypes" :key="item.label" :value="item.value"
                        :label="item.label" />
                    </t-select>
                    <t-textarea v-model="form.req.body" placeholder='{ "key": "01b9b7" }' />
                  </div>
                </t-dialog>
              </div>
            </div>
            <div class="code-op-item">
              <t-input-adornment :prepend="$t('pages.setting.editSource.rule.pdfa')">
                <template #append>
                  <t-button theme="default" @click="actionRule('pdfa')">
                    {{ $t('pages.setting.editSource.rule.try') }}
                  </t-button>
                </template>
                <t-input v-model="form.rule.pdfa" :placeholder="$t('pages.setting.placeholder.pdfaTip')" />
              </t-input-adornment>
            </div>
            <div class="code-op-item">
              <t-input-adornment :prepend="$t('pages.setting.editSource.rule.pdfh')">
                <template #append>
                  <t-button theme="default" @click="actionRule('pdfh')">
                    {{ $t('pages.setting.editSource.rule.try') }}
                  </t-button>
                </template>
                <t-input v-model="form.rule.pdfh" :placeholder="$t('pages.setting.placeholder.pdfhTip')" />
              </t-input-adornment>
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

                <div class="item language">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.bar.language') }}</span>
                  <t-select v-model="config.language" auto-width @change="changeLanguage()">
                    <t-option v-for="item in languages" :key="item.label" :value="item.label" :label="item.label" />
                  </t-select>
                </div>

                <div class="item eol">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.bar.eol') }}</span>
                  <t-select v-model="config.eol" auto-width @change="changeEOL()">
                    <t-option v-for="item in eols" :key="item.label" :value="item.value" :label="item.label" />
                  </t-select>
                </div>

                <div class="item wordWrap">
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
            <t-button class="button init" theme="default" @click="actionInit">
              <div class="status">
                <span class="title">{{ $t('pages.setting.editSource.action.init') }}</span>
                <span class="desc">{{ $t('pages.setting.editSource.action.initStatus') }}: {{ form.init.auto ?
                  $t('pages.setting.editSource.action.initAuto') :
                  $t('pages.setting.editSource.action.initManual') }}</span>
              </div>
              <div class="click" @click.stop="form.init.auto = !form.init.auto">
                <gesture-click-icon />
              </div>
            </t-button>
            <t-button class="button" theme="default" @click="actionHome">{{
              $t('pages.setting.editSource.action.classify') }}</t-button>
            <t-button class="button" theme="default" @click="actionHomeVod">{{
              $t('pages.setting.editSource.action.home') }}</t-button>
          </div>
          <div class="item">
            <t-input v-model="form.category.t" label="t" :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-33-30%" />
            <t-input v-model="form.category.f" label="f" :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-33-40%" />
            <t-input-number theme="column" :min="0" v-model="form.category.pg" label="pg"
              :placeholder="$t('pages.setting.placeholder.general')" class="input w-33-30%" />
            <t-button class="button w-btn" theme="default" @click="actionList()">{{
              $t('pages.setting.editSource.action.list') }}</t-button>
          </div>
          <div class="item">
            <t-input v-model="form.detail.ids" label="ids" :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-100%" />
            <t-button class="button w-btn" theme="default" @click="actionDetail()">{{
              $t('pages.setting.editSource.action.detail') }}</t-button>
          </div>
          <div class="item">
            <t-input v-model="form.search.wd" label="wd" :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-50-70%" />
            <t-input-number theme="column" :min="0" v-model="form.search.pg" label="pg"
              :placeholder="$t('pages.setting.placeholder.general')" class="input w-50-30%" />
            <t-button class="button w-btn" theme="default" @click="actionSearch()">{{
              $t('pages.setting.editSource.action.search') }}</t-button>
          </div>
          <div class="item">
            <t-input v-model="form.play.flag" label="flag" :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-50-30%" />
            <t-input v-model="form.play.play" label="play" :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-50-70%" />
            <t-button class="button w-btn" theme="default" @click="actionPlay()">{{
              $t('pages.setting.editSource.action.play') }}</t-button>
          </div>
          <div class="item">
            <t-input v-model="form.proxy.url" label="url" :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-100%" />
            <t-button class="button w-btn" theme="default" @click="actionProxy()">{{
              $t('pages.setting.editSource.action.proxy') }}</t-button>
          </div>
          <div class="item">
            <t-input v-model="form.player.url" label="url" :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-100%" />
            <t-button class="button w-btn" theme="default" @click="actionPlayer()">{{
              $t('pages.setting.editSource.action.player') }}</t-button>
          </div>
        </div>
        <div class="log-box">
          <div class="nav">
            <div class="nav-left">
              <t-radio-group variant="default-filled" size="small" v-model="form.nav" @change="changeNav()">
                <t-radio-button value="debug">{{ $t('pages.setting.editSource.select.debug') }}</t-radio-button>
                <t-radio-button value="source">{{ $t('pages.setting.editSource.select.source') }}</t-radio-button>
                <t-radio-button value="rule">{{ $t('pages.setting.editSource.select.rule') }}</t-radio-button>
                <t-radio-button value="log">{{ $t('pages.setting.editSource.select.log') }}</t-radio-button>
              </t-radio-group>
            </div>
            <div class="nav-right">
              <t-radio-group variant="default-filled" size="small" v-model="form.clickType.log" @change="logEvent()"
                v-if="form.nav === 'log'">
                <t-radio-button value="f12">{{ $t('pages.setting.editSource.select.f12') }}</t-radio-button>
                <t-radio-button value="clear">{{ $t('pages.setting.editSource.select.clear') }}</t-radio-button>
              </t-radio-group>
              <t-radio-group variant="default-filled" size="small" v-model="form.clickType.proxy" @change="proxyEvent()"
                v-if='form.nav === "debug" && form.action === "proxy"'>
                <t-radio-button value="upload">{{ $t('pages.setting.editSource.select.upload') }}</t-radio-button>
                <t-radio-button value="play">{{ $t('pages.setting.editSource.select.play') }}</t-radio-button>
                <t-radio-button value="copy">{{ $t('pages.setting.editSource.select.copy') }}</t-radio-button>
              </t-radio-group>
            </div>
          </div>
          <div class="text">
            <div class="log-box" id="logBox"></div>
          </div>
        </div>
      </div>
    </div>

    <dialog-player-view v-model:visible="isVisible.player" :url="formDialog.player.url" />
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import moment from 'moment';
import * as monaco from 'monaco-editor';
import JSON5 from "json5";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { BugIcon, ExtensionIcon, HelpRectangleIcon, FileIcon, GestureClickIcon, TransformIcon } from 'tdesign-icons-vue-next';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import dialogPlayerView from './components/DialogPlayer.vue';

import { t } from '@/locales';
import { useSettingStore } from '@/store';

import { setT3Proxy } from '@/api/proxy';
import { fetchDebugSource, setDebugSource, delDebugSource } from '@/api/lab';
import { getConfig, copyToClipboardApi } from '@/utils/tool';
import { getMubans } from '@/utils/drpy/template';
import { doWork as t3Work } from '@/utils/drpy/index';
import { pdfh, pdfa } from '@/utils/drpy/drpyInject';
import { createDependencyProposals } from '@/utils/drpy/drpy_suggestions/drpy_suggestions';

const remote = window.require('@electron/remote');
const router = useRouter();
const emitReload = useEventBus<string>('film-reload');
const storeSetting = useSettingStore();

const systemTheme = computed(() => {
  return storeSetting.displayMode;
});

let form = ref({
  codeType: 'html',
  content: {
    edit: '',
    log: '',
    text: '',
    debug: '',
    source: '',
    rule: ''
  },
  rule: {
    type: '',
    pdfa: '',
    pdfh: ''
  },
  template: 'mxpro',
  url: '',
  nav: 'debug',
  req: {
    method: 'GET',
    header: '',
    body: '',
    url: '',
    contentType: 'application/json'
  },
  detail: {
    ids: ''
  },
  category: {
    t: '',
    f: '',
    pg: 1
  },
  search: {
    wd: '',
    pg: 1
  },
  play: {
    flag: '',
    play: ''
  },
  proxy: {
    url: ''
  },
  player: {
    url: ''
  },
  log: {
    nav: ''
  },
  action: '',
  clickType: {
    log: '',
    proxy: ''
  },
  lastEditTime: {
    edit: 0,
    init: 0
  },
  init: {
    auto: false
  }
});

const tmp = reactive({
  file: t('pages.setting.editSource.fileManage'),
  run: t('pages.setting.editSource.run')
});

const isVisible = reactive({
  template: false,
  player: false,
  help: false,
  reqParam: false
});

const formDialog = reactive({
  player: {
    url: ''
  }
});

watch(
  () => systemTheme.value,
  (val) => {
    config.theme = val === 'light' ? 'vs' : 'vs-dark';
    changeTheme();
  }
);

let editor: monaco.editor.IStandaloneCodeEditor | undefined;
let log: monaco.editor.IStandaloneCodeEditor | undefined;

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (['typescript', 'javascript'].includes(label)) {
      return new tsWorker();
    }
    return new EditorWorker();
  },
};

const codeThemeKey = 'code-theme';  // localStorage key
const warpKey = 'code-warp';  // localStorage key

type WordWrapOptions = 'off' | 'on' | 'wordWrapColumn' | 'bounded';
interface EditorConfig {
  theme: string;
  language: string;
  eol: number;
  wordWrap: WordWrapOptions;
}

const reqMethods = [
  {
    label: 'GET',
    value: 'GET',
  },
  {
    label: 'POST',
    value: 'POST',
  },
  {
    label: 'DELETE',
    value: 'DELETE',
  },
  {
    label: 'PUT',
    value: 'PUT',
  },
  {
    label: 'OPTIONS',
    value: 'OPTIONS',
  },
  {
    label: 'HEAD',
    value: 'HEAD',
  }
];

const reqContentTypes = [
  {
    label: 'application/json',
    value: 'application/json',
  },
  {
    label: 'application/x-www-form-urlencoded',
    value: 'application/x-www-form-urlencoded',
  },
];

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

const changeLanguage = () => {
  if (editor) monaco.editor.setModelLanguage(editor.getModel()!, config.language);
};

const changeTheme = () => {
  monaco.editor.setTheme(config.theme);
  localStorage.setItem(codeThemeKey, config.theme);
};

const changeEOL = () => {
  if (editor) editor.getModel()!.pushEOL(config.eol);
  if (log) log.getModel()!.pushEOL(config.eol);
};

const changeWarp = () => {
  localStorage.setItem(warpKey, config.wordWrap);
  if (editor) editor.updateOptions({ wordWrap: config.wordWrap });
  if (log) log.updateOptions({ wordWrap: config.wordWrap });
};

const confirmTemplate = () => {
  try {
    const text = getMubans()[form.value.template];
    if (editor) editor.setValue(`var rule = ${JSON5.stringify(text, null, 2)}`);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
  isVisible.template = false;
};

const initEditor = () => {
  if (editor) editor.dispose();
  if (log) log.dispose();

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
      scrollBeyondLastLine: false,
      minimap: {
        enabled: true,
      },
      fixedOverflowWidgets: true
    });
    editor.onDidChangeModelContent(() => {
      if (editor) {
        form.value.content.edit = editor.getValue();
        form.value.lastEditTime.edit = moment().unix();
      };
    });

    // After onDidChangeModelContent
    editor.getModel()!.pushEOL(config.eol);

    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position, context, token) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const monacoRange = new monaco.Range(
          range.startLineNumber,
          range.startColumn,
          range.endLineNumber,
          range.endColumn
        );
        return {
          suggestions: createDependencyProposals(monacoRange, monaco).map(proposal => ({
            label: proposal.label,
            detail: proposal.detail,
            kind: proposal.kind || monaco.languages.CompletionItemKind.Function, // 确保指定了一个有效的kind
            insertText: proposal.insertText,
            insertTextRules: proposal.insertTextRules || monaco.languages.CompletionItemInsertTextRule.None,
            documentation: proposal.documentation,
            range: monacoRange // 使用正确的范围类型
          }))
        };
      }
    });
    const logBox = document.getElementById('logBox');
    log = monaco.editor.create(logBox as HTMLElement, {
      theme: config.theme,
      value: form.value.content.text,
      readOnly: true,
      automaticLayout: true,
      language: 'json',
      folding: true,
      roundedSelection: false,
      overviewRulerBorder: false,
      wordWrap: config.wordWrap,
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false,
      },
      fixedOverflowWidgets: true
    });
    log.onDidChangeModelContent(() => {
      if (log) form.value.content.text = log.getValue();
    });
    // After onDidChangeModelContent
    log.getModel()!.pushEOL(config.eol);
  });
};

onMounted(() => {
  initEditor();
})

onBeforeUnmount(() => {
  if (editor) editor.dispose();
  if (log) log.dispose();
});

const importFileEvent = async () => {
  try {
    // @ts-ignore
    const [fileHandle] = await window.showOpenFilePicker();
    if (!fileHandle) return;

    const file = await fileHandle.getFile();
    const content = await file.text();
    if (editor) editor.setValue(content);
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][importFileEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const exportFileEvent = async () => {
  const str = editor ? editor.getValue() : '';
  if (!str.trim()) return;

  try {
    let title = 'source.js'
    const regex = /title:\s*'([^']+)'/i; // 匹配"title": 后紧跟着双引号内的任何非双引号字符
    const matchResult = regex.exec(str);
    if (matchResult) {
      title = `${matchResult[1]}.js`; // 匹配到的title值
    };

    const saveDialogResult = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      defaultPath: title,
      filters: [{ name: 'JavaScript Files', extensions: ['js'] }],
    });

    if (!saveDialogResult.canceled) {
      const { filePath } = saveDialogResult;
      const fs = remote.require('fs').promises;
      await fs.writeFile(filePath, str, 'utf-8');
      MessagePlugin.success(t('pages.setting.data.success'));
    }
  } catch (err) {
    console.log(`[setting][editSource][exportFileEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const debugEvent = async () => {
  try {
    const { url, rule, category, detail, search, play, proxy, player, content, init } = form.value;
    const doc = {
      url, rule, category, detail, search, play, proxy, player, init,
      content: content.edit
    };

    if (content.edit) {
      const res = await setDebugSource(doc);
      if (res) MessagePlugin.success(t('pages.setting.data.success'));
      emitReload.emit('film-reload');
      router.push({ name: 'FilmIndex' });
    };
  } catch (err) {
    console.log(`[setting][editSource][debugEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const cacheEvent = async () => {
  try {
    const res = await fetchDebugSource('all');
    const { url, rule, category, detail, search, play, proxy, player, content, init } = res;
    if (editor) editor.setValue(content);
    Object.assign(form.value, {
      url,
      rule,
      category,
      detail,
      search,
      play,
      proxy,
      player,
      init
    });
    if (res) MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][cacheEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const deleteEvent = async () => {
  try {
    const res = await delDebugSource();
    if (res) MessagePlugin.success(t('pages.setting.data.success'));
    emitReload.emit('film-reload');
  } catch (err) {
    console.log(`[setting][editSource][deleteEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  };
};

const fileEvent = async () => {
  tmp.file = t('pages.setting.editSource.fileManage');
  tmp.run = t('pages.setting.editSource.run');
};

const serverEvent = async () => {
  window.electron.ipcRenderer.send('open-path', 'file', true)
};

const helpEvent = async () => {
  window.electron.ipcRenderer.send('open-url', 'https://zy.catni.cn/edit-source.html')
};

const changeNav = async (nav = '', action = '') => {
  nav = nav || form.value.nav;
  action = action || form.value.action;
  form.value.nav = nav;

  let language = '';
  let readOnly = true;
  switch (nav) {
    case 'source':
      language = 'html';
      readOnly = true;
      break;
    case 'rule':
      language = form.value.rule.type === 'pdfa' ? 'json' : 'html';
      readOnly = true;
      break;
    case 'debug':
      language = 'json';
      readOnly = action === 'proxy' ? false : true;
      break;
    case 'log':
      language = 'json';
      readOnly = true;
      break;
    default:
      break;
  };

  if (log) {
    monaco.editor.setModelLanguage(log.getModel()!, language);
    log.updateOptions({ readOnly });
    if (nav === 'log') {
      const res: any = await t3Work({ type: 'console', data: { type: 'get' } })
      form.value.content[nav] = res.data;
    }

    const contentText = typeof form.value.content[nav] === 'object'
      ? JSON5.stringify(form.value.content[nav], null, 2)
      : form.value.content[nav];

    form.value.content.text = contentText;
    log.setValue(contentText);
  }
};

const performAction = async (type, requestData = {}) => {
  try {
    if (type === 'init' || (form.value.lastEditTime.edit > form.value.lastEditTime.init && form.value.init.auto)) {
      const currentTime = moment().unix();
      form.value.lastEditTime.init = currentTime;
      if (type !== 'init') {
        await t3Work({ type: 'init', data: form.value.content.edit });
      };
    };
    const res: any = await t3Work({ type, data: requestData });
    form.value.content.debug = res.data as string;
    switch (type) {
      case 'play':
        if (res.data?.url) form.value.player.url = res.data.url;
        break;
      case 'detail':
        break;
    }
    form.value.action = type;
    changeNav('debug', type);
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][performAction][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
};

const actionRule = async (type) => {
  form.value.rule.type = type;
  const rule = form.value.rule[type];
  const html = form.value.content.source;

  if (!rule) {
    MessagePlugin.warning(t('pages.setting.editSource.message.ruleNoRule'));
    return;
  }
  if (!html) {
    MessagePlugin.warning(t('pages.setting.editSource.message.ruleNoHtml'));
    return;
  }

  try {
    let res;
    if (type === 'pdfa') {
      res = await pdfa(html, rule);
    }
    else if (type === 'pdfh') {
      res = await pdfh(html, rule);
    }
    form.value.content.rule = res;
    changeNav('rule', type);

    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const actionInit = async () => {
  const { edit } = form.value.content;
  const data = edit.trim();

  if (!data) {
    MessagePlugin.warning(t('pages.setting.editSource.message.initNoData'));
    return;
  }

  await performAction('init', data);
};

const actionHome = async () => {
  await performAction('home');
};

const actionHomeVod = async () => {
  await performAction('homeVod');
};

const actionList = async () => {
  const { t: tid, f, pg } = form.value.category;

  if (!tid) {
    MessagePlugin.warning(t('pages.setting.editSource.message.listNoT'));
    return;
  }

  const data = {
    tid,
    pg: pg || 1,
    filter: f ? true : false,
    extend: f ? JSON5.parse(f) : {}
  };
  await performAction('category', data);
};

const actionDetail = async () => {
  const { ids } = form.value.detail;

  if (!ids) {
    MessagePlugin.warning(t('pages.setting.editSource.message.detailNoIds'));
    return;
  }

  await performAction('detail', ids);
};

const actionSearch = async () => {
  const { wd, pg } = form.value.search;

  if (!wd) {
    MessagePlugin.warning(t('pages.setting.editSource.message.searchNoWd'));
    return;
  }

  const data = {
    wd,
    quick: false,
    pg: pg || 1
  };
  await performAction('search', data);
};

const actionPlay = async () => {
  const { flag, play } = form.value.play;

  if (!flag) {
    MessagePlugin.warning(t('pages.setting.editSource.message.playNoFlag'));
    return;
  }

  if (!play) {
    MessagePlugin.warning(t('pages.setting.editSource.message.playNoPlay'));
    return;
  }

  const data = {
    flag: flag,
    id: play,
    flags: []
  };
  await performAction('play', data);
};

const actionProxy = async () => {
  let { url } = form.value.proxy;

  if (!url) {
    MessagePlugin.warning(t('pages.setting.editSource.message.proxyNoUrl'));
    return;
  }

  if (url && url.startsWith("http")) {
    if (!url.startsWith("http://127.0.0.1:9978/")) {
      const formatUrl = `http://127.0.0.1:9978/proxy?do=js&url=${url}`;
      form.value.proxy.url = formatUrl;
      url = formatUrl;
    };
    const formatUrl = new URL(url);
    const params = Object.fromEntries(formatUrl.searchParams.entries());
    await performAction('proxy', params);
  }
};

const actionPlayer = async (url = "") => {
  url = url ? url : form.value.player.url;

  if (!url) {
    MessagePlugin.warning(t('pages.setting.editSource.message.playerNoUrl'));
    return;
  }

  formDialog.player.url = url;
  isVisible.player = true;
};

const getSource = async () => {
  let { url, method, header, body, contentType } = form.value.req;
  header = header ? header : '{}';
  body = body ? body : '{}';

  if (!url) {
    MessagePlugin.warning(t('pages.setting.editSource.message.htmlNoUrl'));
    return;
  };

  try {
    const parsedHeader = JSON5.parse(header);
    let parsedBody = JSON5.parse(body);

    if (method !== 'GET' && parsedBody) {
      parsedHeader['Content-Type'] = contentType;
      if (contentType === 'application/x-www-form-urlencoded') {
        parsedBody instanceof URLSearchParams
          ? parsedBody
          : (parsedBody = new URLSearchParams(parsedBody));
      }
    }

    const response = await getConfig(url, method, parsedHeader, parsedBody);

    form.value.content.source = response;
    changeNav('source', 'html');
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.error('Error parsing header or body:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const showReqParamDialog = () => {
  isVisible.reqParam = true;
};

const reqCancel = () => {
  nextTick(() => (isVisible.reqParam = true));
  form.value.req.header = '';
  form.value.req.body = '';
  form.value.req.contentType = 'application/json';
};

const showTemplateDialog = () => {
  isVisible.template = true;
};

const logEvent = async () => {
  const type = form.value.clickType.log;
  if (type === 'f12') {
    const webContents = remote.getCurrentWebContents();
    if (!webContents.isDevToolsOpened()) {
      webContents.openDevTools();
    };
  } else if (type === 'clear') {
    await t3Work({ type: 'console', data: { type: 'clear' } })
    form.value.content.log = "";
    form.value.content.text = "";
    console.clear();
    if (log) log.setValue("");
  };

  form.value.clickType.log = "";
};

const proxyEvent = async () => {
  try {
    const type = form.value.clickType.proxy;
    const str: any = log ? log.getValue() : "";
    const formatStr = str.split('\n').filter(s => !!s.trim()).join('');
    const jsonStr = JSON5.parse(formatStr);

    if (type === 'copy') {
      await copyToClipboardApi(form.value.proxy.url);
    } else if (type === 'play') {
      actionPlayer(form.value.proxy.url);
    } else if (type === 'upload') {
      await setT3Proxy(jsonStr);
    };

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][proxy][err]${err}`)
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    form.value.clickType.proxy = "";
  };
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
    display: flex;
    justify-content: space-between;
    align-content: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;

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

        .item-pad-select {
          padding: 0 4px !important;
        }

        .item {
          color: var(--td-text-color-placeholder);
          border-radius: var(--td-radius-default);
          display: flex;
          align-items: center;
          padding: 2px 4px;
          height: 22px;
          cursor: pointer;
          text-decoration: none;

          :deep(.t-input) {
            padding: 0;
            border: none;
            width: 46px;
            height: var(--td-comp-size-s);
            font: var(--td-font-body-medium);
            background-color: transparent !important;

            .t-input__suffix:not(:empty) {
              margin-left: var(--td-comp-margin-xxs);
            }

            &:hover:not(.t-input--focused) {
              border-color: transparent;
              height: 24px;
            }
          }

          :deep(.t-input__inner) {
            color: var(--td-text-color-placeholder);
          }

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
      width: calc((100% - var(--td-comp-margin-s)) / 2);

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

          .t-collapse-panel__header,
          .t-collapse-panel__body {
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
          flex-direction: column;
          grid-gap: var(--td-comp-margin-s);

          .code-op-item {
            display: flex;
            grid-gap: var(--td-comp-margin-s);

            :deep(.t-input-adornment) {
              width: 100%;

              .input-container {
                width: inherit;
                background-color: var(--td-bg-content-input) !important;
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                align-items: center;
                justify-content: space-between;

                .method {
                  margin-right: 5px;
                  width: 24px;
                  height: 24px;
                  border-radius: var(--td-radius-default);
                  background-color: var(--td-bg-color-component);
                  display: flex;
                  flex-direction: row;
                  align-content: center;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                }

                .contentType {
                  margin-bottom: 5px;
                }
              }
            }
          }

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

    .right {
      height: 100%;
      width: calc((100% - var(--td-comp-margin-s)) / 2);
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

          .init {
            :deep(.t-button__text) {
              display: flex;
              flex-direction: row;
              align-items: center;
            }

            .click {
              margin-left: var(--td-comp-margin-s);
              border: 2px solid rgba(132, 133, 141, 0.7);
              border-radius: var(--td-radius-circle);
              width: 24px;
              height: 24px;
            }

            .status {
              display: flex;
              flex-direction: column;
              font-size: 12px;
              line-height: 14px;
              align-content: flex-start;

              .title {
                font-weight: 500;
                text-align: left;
              }

              .desc {
                font-size: 10px;
                text-align: left;
              }
            }
          }

          .input {
            width: 100%;
            margin-right: var(--td-comp-margin-s);
          }

          .button {}

          .w-btn {
            width: 50px;
          }

          .w-100\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s))));
          }

          .w-50\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 2);
          }

          .w-50-30\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 10 * 3);
          }

          .w-50-70\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 10 * 7);
          }

          .w-33-30\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 10 * 3);
          }

          .w-33-40\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 10 * 4);
          }

          .w-33\% {
            width: calc((100% - 50px - (var(--td-comp-margin-s) * 3)) / 3);
          }
        }
      }

      .log-box {
        flex: 1;
        width: 100%;
        height: 100%;
        margin-top: var(--td-comp-paddingTB-m);
        position: relative;

        .nav {
          position: absolute;
          width: calc(100% - 30px);
          z-index: 100;
          top: -15px;
          left: 15px;
          display: flex;
          justify-content: space-between;

          :deep(.t-radio-group) {
            box-shadow: var(--td-shadow-3);
          }
        }
      }

      .text {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: var(--td-radius-default);

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

        &::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: content-box;
          background-color: var(--td-scrollbar-color);
        }
      }

      .code {
        height: calc(100% - var(--td-comp-margin-xs));
        padding-top: var(--td-comp-paddingTB-l);
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

:deep(.t-input),
:deep(.t-input-number__increase),
:deep(.t-input-number__decrease),
:deep(.t-input-adornment__text),
:deep(.t-textarea__inner) {
  background-color: var(--td-bg-content-input) !important;
  border-color: transparent;
  box-shadow: none;
}

:deep(.code-toolbar) {
  height: 100%;
  border-radius: var(--td-radius-default);

  pre[class*="language-"] {
    margin: 0;
    height: 100%;
    box-shadow: none;
    padding: 1em 0.5em 0 3.8em;
    background-color: var(--td-bg-content-input);
  }

  .toolbar {
    padding-right: var(--td-comp-paddingTB-xxs);

    .toolbar-item {
      margin-right: var(--td-comp-margin-xs);
    }
  }
}

.help-box {
  height: 100%;
  width: 100%;
}

.help-dialog {
  :deep(.t-dialog__ctx .t-dialog__position.t-dialog--top) {
    padding: 0 !important;
  }
}
</style>
