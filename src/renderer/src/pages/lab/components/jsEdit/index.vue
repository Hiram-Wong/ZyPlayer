<template>
  <div class="js-edit view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.jsEdit.title') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-button class="mode-toogle" theme="default" @click="handleModeToggle">
          <div class="status">
            <span class="title">{{ $t('pages.lab.jsEdit.action.mode') }}</span>
            <span class="desc">
              {{ $t('pages.lab.jsEdit.action.status') }}:
              {{ form.init.mode }}
            </span>
          </div>
        </t-button>

        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="template">{{ $t('pages.lab.jsEdit.template') }}</t-radio-button>
          <t-select v-model="tmp.file" auto-width @change="handleOpFileChange">
            <t-option :label="$t('pages.lab.jsEdit.file')" value="file" />
            <t-option :label="$t('pages.lab.jsEdit.import')" value="import" />
            <t-option :label="$t('pages.lab.jsEdit.export')" value="export" />
            <t-option :label="$t('pages.lab.jsEdit.decode')" value="decode" />
          </t-select>
          <t-radio-button value="debug">{{ $t('pages.lab.jsEdit.bug') }}</t-radio-button>
        </t-radio-group>

        <t-dialog
          v-model:visible="active.template"
          :header="$t('pages.lab.jsEdit.template')"
          show-in-attached-element
          attach="#main-component"
          @confirm="confirmTemplate()"
        >
          <t-form ref="formRef" :data="form" :rules="TEMPLATE_RULES" :label-width="60">
            <t-form-item name="template" label-width="0px">
              <t-select v-model="form.template">
                <t-option v-for="(item, index) in Object.keys(mubanData)" :key="index" :value="item" :label="item" />
              </t-select>
            </t-form-item>
          </t-form>
        </t-dialog>
      </div>
    </div>
    <div class="content">
      <splitpanes class="default-theme split-pane" horizontal>
        <pane size="70">
          <splitpanes class="default-theme split-pane">
            <pane>
              <div class="editor-pane">
                <t-tabs v-model="active.editor" theme="card" lazy class="editor-pane-tabs">
                  <t-tab-panel :label="$t('pages.lab.jsEdit.editor.js')" value="js">
                    <code-editor
                      v-model="form.content.js"
                      :options="jsEditConf"
                      @drop.prevent="handleMonacoDrop('js', $event)"
                      @monaco-object="handleMonacoObject"
                      class="code-box"
                    />
                  </t-tab-panel>
                  <t-tab-panel :label="$t('pages.lab.jsEdit.editor.html')" value="html">
                    <code-editor
                      v-model="form.content.html"
                      :options="htmlEditConf"
                      @drop.prevent="handleMonacoDrop('html', $event)"
                      @monaco-object="handleMonacoObject"
                      class="code-box"
                    />
                  </t-tab-panel>
                </t-tabs>
              </div>
            </pane>
            <pane>
              <t-tabs v-model="active.action" theme="card" lazy>
                <t-tab-panel :label="$t('pages.lab.jsEdit.debug.dom')" value="dom">
                  <div class="dom_debug">
                    <div class="item">
                      <reqHtml class="item source" v-model:data="form.req" @source="handleSourceFetch"/>
                    </div>
                    <div class="item">
                      <t-input
                        v-model="form.rule.pdfa"
                        :label="$t('pages.lab.jsEdit.rule.pdfa')"
                        :placeholder="$t('pages.setting.placeholder.pdfaTip')"
                        class="input w-100%"
                      />
                      <t-button class="button w-btn" theme="default" @click="handleDomDebugPdfa">
                        {{ $t('pages.lab.jsEdit.rule.try') }}
                      </t-button>
                    </div>
                    <div class="item">
                      <t-input
                        v-model="form.rule.pdfh"
                        :label="$t('pages.lab.jsEdit.rule.pdfh')"
                        :placeholder="$t('pages.setting.placeholder.pdfaTip')"
                        class="input w-100%"
                      />
                      <t-button class="button w-btn" theme="default" @click="handleDomDebugPdfh">
                        {{ $t('pages.lab.jsEdit.rule.try') }}
                      </t-button>
                    </div>
                  </div>
                </t-tab-panel>
                <t-tab-panel :label="$t('pages.lab.jsEdit.debug.data')" value="data">
                  <div class="data_debug">
                    <div class="item">
                      <t-button class="button init w-btn" theme="default" @click="handleDataDebugInit">
                        <div class="status">
                          <span class="title">{{ $t('pages.lab.jsEdit.action.init') }}</span>
                          <span class="desc">
                            {{ $t('pages.lab.jsEdit.action.status') }}:
                            {{
                              form.init.auto
                                ? $t('pages.lab.jsEdit.action.auto')
                                : $t('pages.lab.jsEdit.action.manual')
                            }}
                          </span>
                        </div>
                        <div class="click" @click.stop="form.init.auto = !form.init.auto">
                          <gesture-click-icon />
                        </div>
                      </t-button>
                      <t-button class="button init w-btn" theme="default" @click="handleDataDebugLog">
                        {{ $t('pages.lab.jsEdit.action.log') }}
                      </t-button>
                    </div>
                    <div class="item">
                      <t-button class="button w-btn" theme="default" @click="handleDataDebugHome">
                        {{ $t('pages.lab.jsEdit.action.classify') }}
                      </t-button>
                      <t-button class="button w-btn" theme="default" @click="handleDataDebugHomeVod">
                        {{ $t('pages.lab.jsEdit.action.home') }}
                      </t-button>
                    </div>
                    <div class="item">
                      <t-input
                        v-model="form.category.t"
                        :label="$t('pages.lab.jsEdit.rule.t')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-33-30%"
                      />
                      <t-input
                        v-model="form.category.f"
                        :label="$t('pages.lab.jsEdit.rule.f')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-33-40%"
                      />
                      <t-input-number
                        theme="column"
                        :min="0"
                        v-model="form.category.pg"
                        :label="$t('pages.lab.jsEdit.rule.pg')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-33-30%"
                      />
                      <t-button class="button w-btn" theme="default" @click="handleDataDebugCategory()">
                        {{ $t('pages.lab.jsEdit.action.list') }}
                      </t-button>
                    </div>
                    <div class="item">
                      <t-input
                        v-model="form.detail.ids"
                        :label="$t('pages.lab.jsEdit.rule.ids')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-100%"
                      />
                      <t-button class="button w-btn" theme="default" @click="handleDataDebugDetail()">
                        {{ $t('pages.lab.jsEdit.action.detail') }}
                      </t-button>
                    </div>
                    <div class="item">
                      <t-input
                        v-model="form.search.wd"
                        :label="$t('pages.lab.jsEdit.rule.wd')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-50-70%"
                      />
                      <t-input-number
                        theme="column"
                        :min="0"
                        v-model="form.search.pg"
                        :label="$t('pages.lab.jsEdit.rule.pg')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-50-30%"
                      />
                      <t-button class="button w-btn" theme="default" @click="handleDataDebugSearch()">
                        {{ $t('pages.lab.jsEdit.action.search') }}
                      </t-button>
                    </div>
                    <div class="item">
                      <t-input
                        v-model="form.play.flag"
                        :label="$t('pages.lab.jsEdit.rule.flag')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-50-30%"
                      />
                      <t-input
                        v-model="form.play.play"
                        :label="$t('pages.lab.jsEdit.rule.play')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-50-70%"
                      />
                      <t-button class="button w-btn" theme="default" @click="handleDataDebugPlay()">
                        {{ $t('pages.lab.jsEdit.action.play') }}
                      </t-button>
                    </div>
                    <div class="item">
                      <t-input
                        v-model="form.proxy.url"
                        :label="$t('pages.lab.jsEdit.rule.url')"
                        :placeholder="$t('pages.setting.placeholder.general')"
                        class="input w-100%"
                      />
                      <t-button class="button w-btn" theme="default" @click="handleDataDebugProxy()">
                        {{ $t('pages.lab.jsEdit.action.proxy') }}
                      </t-button>
                    </div>
                    <div class="item">
                      <t-textarea
                        v-model="form.proxy.upload"
                        :placeholder="$t('pages.lab.jsEdit.placeholder.proxyUpload')"
                        :autosize="{ minRows: 3, maxRows: 5 }"
                        class="input proxy-upload-textarea"
                      />
                      <t-button class="button proxy-upload-btn" theme="default" @click="handleDataDebugProxyUpload()">
                        {{ $t('pages.lab.jsEdit.action.proxyUpload') }}
                      </t-button>
                    </div>
                  </div>
                </t-tab-panel>
                <t-tab-panel :label="$t('pages.lab.jsEdit.debug.preview')" value="preview">
                  <div class="html_preview">
                    <div class="urlbar-root">
                      <div class="urlbar-control">
                        <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('back')">
                          <arrow-left-icon />
                        </t-button>
                        <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('forward')">
                          <arrow-right-icon />
                        </t-button>
                        <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('refresh')">
                          <rotate-icon />
                        </t-button>
                      </div>
                      <t-input class="urlbar-url" v-model="controlText" @enter="handleWebviewLoad"></t-input>
                      <t-button variant="text" class="urlbar-devtool" @click="handleWebviewControl('devtools')">F12</t-button>
                    </div>
                    <webview v-if="isWebviewVisible" ref="webviewRef" class="webview-box" src="about:blank" partition="persist:js-edit" allowpopups />
                  </div>
                </t-tab-panel>
              </t-tabs>
            </pane>
          </splitpanes>
        </pane>
        <pane>
          <div class="console-pane">
            <div class="console-root">
              <div class="header-name">{{ $t('pages.lab.jsEdit.console.title') }}</div>
              <div class="header-clear" @click="handleConsoleClear"><clear-icon /></div>
            </div>
            <div class="log-pane-content">
              <terminal-view :options="termConf" ref="logRef" class="log-box" />
            </div>
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css';

import moment from 'moment';
import JSON5 from 'json5';
import { Splitpanes, Pane } from 'splitpanes';
import { computed, nextTick, onActivated, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { GestureClickIcon, ArrowLeftIcon, ArrowRightIcon, ClearIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { t } from '@/locales';
import { useSettingStore } from '@/store';
import emitter from '@/utils/emitter';
import { CodeEditor } from '@/components/code-editor';
import { setT3Proxy } from '@/api/proxy';
import { addSite, putSite } from '@/api/site';
import { fetchJsEditPdfa, fetchJsEditPdfh, fetchJsEditMuban, fetchJsEditDebug } from '@/api/lab';
import { fetchLog, clearLog } from '@/api/plugin';
import { fetchCmsHome, fetchCmsHomeVod, fetchCmsDetail, fetchCmsCategory, fetchCmsPlay, fetchCmsSearch, fetchCmsInit, fetchCmsRunMain, putSiteDefault, fetchCmsProxy } from '@/api/site';
// import { aes } from '@/utils/crypto';
// import { fetchConfig } from '@/api/setting';
import { getOriginalJs } from './utils/crypto';
import reqHtml from '../reqHtml/index.vue';
import drpySuggestions from './utils/drpy_suggestions';
import drpyObjectInner from './utils/drpy_object_inner.ts?raw';

import TerminalView from '@/components/terminal/index.vue';

const TEMPLATE_RULES = {};

const router = useRouter();
const storeSetting = useSettingStore();

const theme = computed(() => storeSetting.displayTheme);
const tmp = computed(() => {
  return {
    file: t('pages.lab.jsEdit.fileManage'),
  };
});
const termConf = ref({
  fontSize: 14,
  fontFamily: "JetBrainsMono",
  theme: {
    foreground: theme.value === 'light' ? '#000000' : '#ffffff',
  },
  convertEol: true, //启用时，光标将设置为下一行的开头
  disableStdin: true, //是否应禁用输入
  cursorBlink: true,
  cursorStyle: 'underline',
});
const logRef = useTemplateRef<InstanceType<typeof TerminalView> | null>('logRef');
const form = ref({
  content: {
    js: '',
    html: '',
  },
  rule: {
    pdfa: '',
    pdfh: '',
  },
  template: 'mxpro',
  req: {
    method: 'GET',
    encode: 'UTF-8',
    header: '',
    body: '',
    url: '',
    contentType: 'application/json',
  },
  detail: {
    ids: '',
  },
  category: {
    t: '',
    f: '{}',
    pg: 1,
  },
  search: {
    wd: '',
    pg: 1,
  },
  play: {
    flag: '',
    play: '',
  },
  proxy: {
    url: '',
    upload: '',
  },
  log: {
    nav: '',
  },
  action: '',
  lastEditTime: {
    edit: 0,
    init: 0,
  },
  init: {
    auto: false,
    mode: 't3js',
    log: false,
  },
});
const EDIT_CONF = {
  readOnly: false,
  theme: theme.value === 'light' ? 'vs' : 'vs-dark',
  wordWrap: 'on',
  automaticLayout: true,
  folding: true,
  roundedSelection: false,
  overviewRulerBorder: false,
  tabSize: 2,
  insertSpaces: true,
  minimap: {
    enabled: false,
  },
  fixedOverflowWidgets: true
}
const jsEditConf = ref({
  ...EDIT_CONF,
  language: 'javascript',
});
const htmlEditConf = ref({
  ...EDIT_CONF,
  language: 'html',
});
const controlText = ref<string>('');
const webviewRef = useTemplateRef<Electron.WebviewTag | null>('webviewRef');
const isWebviewVisible = ref<boolean>(true);
const active = ref({
  nav: '',
  template: false,
  action: 'dom',
  editor: 'js'
});
const mubanData = ref({});
const debugId = ref('');

watch(
  () => theme.value,
  (val) => {
    jsEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';
    htmlEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';

    if (logRef.value) {
      termConf.value = {
        ...termConf.value,
        theme: {
          foreground: val === 'light'? '#000000' : '#ffffff'
        },
      }
    }
  }
);
watch(
  () => form.value.init.mode,
  (mode) => {
    if (mode === 't3js') {
      jsEditConf.value.language = 'javascript';
    } else if (mode === 't3py') {
      jsEditConf.value.language = 'python';
    } else {
      jsEditConf.value.language = 'javascript';
    }
  }
);
watch(
  () => form.value.content.js,
  () => {
    const currentTime = moment().unix();
    form.value.lastEditTime.edit = currentTime;
  }
);
watch(
  () => active.value.action,
  (val) => {
    if (val === 'preview' && !!controlText.value) {
      nextTick(() => {
        validateAndRecoverWebview();
      });
    }
  }
);

onMounted(() => {
  setupConsole();
  getTemplate();
  setupData();
});

onActivated(() => {
  if (active.value.action === 'preview') validateAndRecoverWebview();
});

// common
const utilsReadFile = async(filePath: string) =>{
  return await window.electron.ipcRenderer.invoke('manage-file', { action: 'read', config: { path: filePath }});
};

const utilsWriteFile = async (filePath: string, content: string) => {
  return await window.electron.ipcRenderer.invoke('manage-file', { action: 'write', config: { path: filePath, content: content }});
};

const utilsT3JsBasePath = async () => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `file/drpy_dzlive/drpy_js/`);
  return defaultPath;
};

const utilsT3PyBasePath = async () => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `file/py/`);
  return defaultPath;
};

const utilsT4BasePath = async () => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `plugin/drpy-node/js/`);
  return defaultPath;
};

const utilsBasePath = async () => {
  const type = form.value.init.mode;
  if (type === 't3js') {
    return await utilsT3JsBasePath();
  } else if (type === 't3py') {
    return await utilsT3PyBasePath();
  } else if (type === 't4') {
    return await utilsT4BasePath();
  }
};

// const utilsT3decode = async (content: string) => {
//   const res = await fetchCmsRunMain({
//     func: `function main(str) { return getOriginalJs(str) }`,
//     arg: content,
//     sourceId: debugId.value
//   });
//   return res || content;
// };

// const utilsT4decode = async (content: string) => {
//   const src = 'DM8U8pJ0qw0O5YK/a9FfWRh7mj3m+j9WtKTfOMvdDFUrbU1kT+yeBvoxwGdrZ1KXVfDJ/Smh4LSq3+A07ebBNwfxy7V3aRJuEAJQ9gLETBJ1oYahMY2WOwmxl8yeqUcBzcbaI45HpFKzqYnsZrV34ddBzRIac11sammtk4UbppFzfoSSOY0HdcLahBWc7UOBV+t/CSl1y5ut5qXdbKorYOK+t789Ifb7fTrhzpmG21l4y+AqwGLKyDiHAWQA76nMVBWyJSdNRu9EQ8CtRPBnpTi03h8eQNWopr8KUs8ghbTLEndyn/q/mBkrQ5i05DilDexDN3DRq4p3UpNli00piWSwTm+P8OnYiENoOVMAMc3F87CQkdTwTxmnPCZsrIM5VM7Dgaea4KCsIwsLxnZ9o5lZ02AWPB/3a9GPEBwOEQeuOW2sz7LD7nuSWxOA4fujjSTQogdfrMzyUtJbSNr/iTBm6XhFAlokvJpNX7HzjDXanq9CVhp1bOw3qQ7WsOloke95ITC6Ou89n+qg6A/2oMzvms94E9CZ1JzoR7EG2WM6djeAugx79Sd3+jH6uSkfYP1qiSUK48mtrQUooxJ7SzEVGHkD33Q3bxX2K2rnX5SdtgYlS99JsoMmjOPaSHsnaK6Y7OTi1hZl1jPcwYT54UutJwAc2XgWhgmOXRpI7RU9qFvPbYnLvplCIjAtsSnRdrJTOIjkDwm3IoNaevIdHZ2y9/lR/u2WH2gFJEzOLuqLS8rSY7uBSq3tzpay8hPqo6KB1eOos7hp3/zdOlABVUaJHkZ+WSCWPmzXUW0WTKKQiOOrIFXeFmccnmljR33iKPecMVugHxr3+2xgDY487Qt9F1EUHZwcVJ6CeVYhpsZUSnsyyJ6iNfNiG33+KA9q5/+pMKQgf2iaB0uJmeI+/pwmfd8hZrDxskRYy23wPVv5fz/GOoTk7ply/keZpF4iJHW/hI5wbhgjhq4kgvkcA8vY7nKhhTvlPStZ8o+jDqB3lOxyzpCzrfd2mwdOCDRDUF7Jy6ljB2ABizIYDMlyPMaiV2QjIAUGv+va0k1E2EKsPgefezQ9q7io+RNY6vUHcILCFw2duBixZnBGZPIJ70srGS6UsLN+AmMkeTCMH1j4k6q/JnQFE1qQGL+m2kM5BYun+pFvwHwrBw3SmQVq2ProW2LLFw/5nuNTePHXpJSc3kQNZ0RDCn202HRG6495DHS3q9cFF74RP+PpJmlYnxuGgjGUqkyg3Fro37fgW2m1Etqprs9ZIuDxvOGhz5DkqIf9swzMpW8VUU+qQD2TB/nRncHLA/qhmReh87YyyMHzxLsMt3A5Q+LdFnBxlGAFjpL2+2FnsSalgf2jwVGKecO1iyzePzvJWM+pQQTrt6RW6Y7PWEZQlLwTZd5US8RI4EprbhS7sVFwyH6MnbaiIM0BJekVk0PGbcIqSbFjdLQNNcdAt6Zvh2s0mSQwIcAjZ2f3/ZA31RrNS76lGUEI0A==';
//   const iv = '686A64686E780A0A0A0A0A0A0A0A0A0A';
//   const key = '686A64686E780A0A0A0A0A0A0A0A0A0A';
//   const authCodes = aes.decode(src, key, 'cbc', 'pkcs7padding','base64', iv, 'hex', 'hex', 'utf8');
//   const authCodes2array = authCodes.split('\n');
//   const randomAuthIndex = Math.floor(Math.random() * authCodes2array.length);
//   const randomAuthCode = authCodes2array[randomAuthIndex].trim();

//   const res = await fetchConfig({
//     url: 'http://127.0.0.1:5757/decoder',
//     method: 'POST',
//     data: { code: content, auth_code: randomAuthCode },
//   })
//   return res?.data?.result || content;
// };

const utilsLocal = async (content: string) => {
  return await getOriginalJs(content);
};

const utilsDecode = async (content: string) => {
  // const type = form.value.init.mode;
  // if (type === 't3') {
  //   return await utilsT3decode(content);
  // } else if (type === 't4') {
  //   return await utilsT4decode(content);
  // }
  return await utilsLocal(content);
};

const utilsReadT3JsFile = async () =>{
  try {
    const basePath = await utilsT3JsBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.js`);
    const content = await utilsReadFile(defaultPath);
    return content;
  } catch (err) {
    console.error(`[utilsReadT3JsFile][Error]:`, err);
    return '';
  }
};

const utilsReadT3PyFile = async () =>{
  try {
    const basePath = await utilsT3PyBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.py`);
    const content = await utilsReadFile(defaultPath);
    return content;
  } catch (err) {
    console.error(`[utilsReadT3PyFile][Error]:`, err);
    return '';
  }
};

const utilsReadT4File = async () =>{
  try {
    const basePath = await utilsT4BasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.js`);
    const content = await utilsReadFile(defaultPath);
    return content;
  } catch (err) {
    console.error(`[utilsReadT4File][Error]:`, err);
    return '';
  }
};

const utilsRead = async () => {
  const type = form.value.init.mode;
  if (type === 't3js') {
    return await utilsReadT3JsFile();
  } else if (type === 't3py') {
    return await utilsReadT3PyFile();
  } else if (type === 't4') {
    return await utilsReadT4File();
  }
};

const utilsWriteT3JsFile = async (val: string) =>{
  try {
    const basePath = await utilsT3JsBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.js`);
    await utilsWriteFile(defaultPath, val);
    return true;
  } catch (err) {
    console.error(`[utilsWriteT3JsFile][Error]:`, err);
    return false;
  }
};

const utilsWriteT3PyFile = async (val: string) =>{
  try {
    const basePath = await utilsT3PyBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.py`);
    await utilsWriteFile(defaultPath, val);
    return true;
  } catch (err) {
    console.error(`[utilsWriteT3PyFile][Error]:`, err);
    return false;
  }
};

const utilsWriteT4File = async (val: string) =>{
  try {
    const basePath = await utilsT4BasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.js`);
    await utilsWriteFile(defaultPath, val);
    return true;
  } catch (err) {
    console.error(`[utilsWriteT4File][Error]:`, err);
    return false;
  }
};

const utilsWrite = async (val: string) => {
  const type = form.value.init.mode;
  if (type === 't3js') {
    return await utilsWriteT3JsFile(val);
  } else if (type === 't3py') {
    return await utilsWriteT3PyFile(val);
  } else if (type === 't4') {
    return await utilsWriteT4File(val);
  }
};

const utilsGetLogT3Js = async () =>{
  try {
    const res = await fetchCmsRunMain({
      func: "function main() { return getLogRecord() }",
      arg: "",
      sourceId: debugId.value
    });
    return res;
  } catch (err) {
    console.error(`[utilsGetLogT3Js][Error]:`, err);
    return [];
  }
};

const utilsGetLogT3Py = async () =>{
  try {
    const res = await fetchCmsRunMain({
      func: "function main() { return getLogRecord() }",
      arg: "",
      sourceId: debugId.value
    });
    return res;
  } catch (err) {
    console.error(`[utilsGetLogT3Py][Error]:`, err);
    return [];
  }
};

const utilsGetLogT4 = async () =>{
  try {
    const res = await fetchLog('drpy-node');
    return res;
  } catch (err) {
    console.error(`[utilsGetLogT4][Error]:`, err);
    return [];
  }
};

const utilsGetLog = async () => {
  const type = form.value.init.mode;
  if (type === 't3js') {
    return await utilsGetLogT3Js();
  } else if (type === 't3py') {
    return await utilsGetLogT3Py();
  } else if (type === 't4') {
    return await utilsGetLogT4();
  }
};

const utilsClearLogT3Js = async () =>{
  try {
    const res = await fetchCmsRunMain({
      func: "function main() { return clearLogRecord() }",
      arg: "",
      sourceId: debugId.value
    });
    return res;
  } catch (err) {
    console.error(`[utilsClearLogT3Js][Error]:`, err);
    return [];
  }
};

const utilsClearLogT3Py = async () =>{
  try {
    const res = await fetchCmsRunMain({
      func: "function main() { return clearLogRecord() }",
      arg: "",
      sourceId: debugId.value
    });
    return res;
  } catch (err) {
    console.error(`[utilsClearLogT3Py][Error]:`, err);
    return [];
  }
};

const utilsClearLogT4 = async () =>{
  try {
    const res = await clearLog('drpy-node');
    return res;
  } catch (err) {
    console.error(`[utilsClearLogT4][Error]:`, err);
    return [];
  }
};

const utilsClearLog = async () => {
  const type = form.value.init.mode;
  if (type === 't3js') {
    return await utilsClearLogT3Js();
  } else if (type === 't3py') {
    return await utilsClearLogT3Py();
  } else if (type === 't4') {
    return await utilsClearLogT4();
  }
};

const utilsPutSiteT3Js = async (id: string, content: string) => {
  await utilsWriteT3JsFile(content);
  await putSite({ ids: [id], doc: { type: 7, api: './drpy.min.js', ext: 'http://127.0.0.1:9978/api/v1/file/drpy_dzlive/drpy_js/debug.js' } });
};

const utilsPutSiteT3Py = async (id: string, content: string) => {
  await utilsWriteT3PyFile(content);
  await putSite({ ids: [id], doc: { type: 12, api: 'http://127.0.0.1:9978/api/v1/file/py/debug.py', ext: '' } });
};

const utilsPutSiteT4 = async (id: string, content: string) => {
  await utilsWriteT4File(content);
  await putSite({ ids: [id], doc: { type: 6, api: 'http://127.0.0.1:5757/api/debug', ext: '' } });
};

const utilsPutSite = async () => {
  const type = form.value.init.mode;
  const content = form.value.content.js;
  const id = debugId.value;
  if (type === 't3js') {
    return await utilsPutSiteT3Js(id, content);
  } else if (type === 't3py') {
    return await utilsPutSiteT3Py(id, content);
  } else if (type === 't4') {
    return await utilsPutSiteT4(id, content);
  }
};

const setupData = async () => {
  const debugRes = await fetchJsEditDebug();
  const typeMap = {
    7: 't3js',
    12: 't3py',
    6: 't4',
  };

  if (debugRes?.id) {
    debugId.value = debugRes.id;
    const type = debugRes.type;
    const mode = typeMap[type];
    form.value.init.mode = mode;
    form.value.content.js = await utilsRead();
  } else {
    const mode = form.value.init.mode;
    const siteRes = await addSite({
      name: 'debug',
      key: 'debug',
      // @ts-ignore
      type: ((mode) => {
        if (mode === 't3js') return 7;
        else if (mode === 't3py') return 12;
        else if (mode === 't4') return 6;
      })(mode),
      // @ts-ignore
      api: ((mode) => {
        if (mode === 't3js') return './drpy.min.js';
        else if (mode === 't3py') return 'http://127.0.0.1:9978/api/v1/file/py/debug.py';
        else if (mode === 't4') return 'http://127.0.0.1:5757/api/debug';
      })(mode),
      search: 1,
      playUrl: '',
      group: 'debug',
      category: '',
      ext: '',
    });
    if (Array.isArray(siteRes) && siteRes.length > 0 && siteRes[0].hasOwnProperty('id')) {
      debugId.value = siteRes[0].id;
    } else return;
  };
};

// op
const getTemplate = async () => {
  const res = await fetchJsEditMuban();
  if (typeof res === 'object' && Object.keys(res).length > 0) {
    mubanData.value = res;
  }
};

const confirmTemplate = () => {
  try {
    const text = mubanData.value[form.value.template];
    form.value.content.js = `var rule = ${JSON5.stringify(text, null, 2)}`;
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.error(`[confirmTemplate][Error]:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
  active.value.template = false;
};

const handleImportFile = async () => {
  try {
    const res = await window.electron.ipcRenderer.invoke('manage-dialog', {
      action: 'showOpenDialog',
      config: {
        properties: ['openFile', 'showHiddenFiles'],
        filters: [
          { name: 'JavaScript Files', extensions: ['js'] },
          { name: 'Py Files', extensions: ['py'] },
          { name: 'All Files', extensions: ['*'] }
        ],
      }
    });
    if (!res || res.canceled || !res.filePaths.length) return;

    const fileContent = await window.electron.ipcRenderer.invoke('manage-file', {
      action: 'read',
      config: {
        path: res.filePaths[0],
      }
    });

    form.value.content.js = fileContent || '';
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err: any) {
    console.error(`[handleImportFile] err:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

const handleExportFile = async () => {
  try {
    const content = (form.value.content.js || '').trim();

    if (!content) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    };

    const basePath = await utilsBasePath();
    let defaultPath = '';
    if (form.value.init.mode === 't3py') {
      defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `source.py`);
    } else {
      const title = content.match(/title:(.*?),/)?.[1]?.replace(/['"]/g, '')?.trim() || 'source';
      defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `${title}.js`);
    }

    const res = await window.electron.ipcRenderer.invoke('manage-dialog', {
      action: 'showSaveDialog',
      config: {
        defaultPath: defaultPath,
        properties: ['showHiddenFiles'],
      }
    });
    if (!res || res.canceled || !res.filePath) return;

    const writeStatus = await window.electron.ipcRenderer.invoke('manage-file', {
      action: 'write',
      config: {
        path: res.filePath,
        content: content,
      }
    });

    if (writeStatus) MessagePlugin.success(t('pages.setting.data.success'));
    else MessagePlugin.error(t('pages.setting.data.fail'));
  } catch (err: any) {
    console.error(`[handleExportFile] err:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  };
};

const handleDebug = async () => {
  try {
    const content = form.value.content.js;
    if (!content || content.trim().length === 0) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    };
    await utilsPutSite();
    await putSiteDefault(debugId.value);
    emitter.emit('refreshFilmConfig');
    router.push({ name: 'FilmIndex' });
  } catch (err) {
    console.log(`[setting][editSource][debugEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const handleDecode = async () => {
  active.value.editor = 'js';

  try {
    const content = (form.value.content.js || '').trim();
    if (!content) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    };

    form.value.content.js = await utilsDecode(content);
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][decodeEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const handleOpChange = (type: string) => {
  active.value.nav = '';

  switch (type) {
    case 'template':
      active.value.template = true;
      break;
    case 'doc':
      window.electron.ipcRenderer.send('open-url', 'https://github.com/Hiram-Wong/ZyPlayer/wiki/%E5%86%99%E6%BA%90%E5%B7%A5%E5%85%B7');
      break;
    case 'debug':
      handleDebug();
      break;
  };
};

const handleOpFileChange = (type: string) => {
  tmp.value.file = t('pages.lab.jsEdit.fileManage');

  switch (type) {
    case 'file':
      window.electron.ipcRenderer.send('open-path', 'file');
      break;
    case 'import':
      handleImportFile();
      break;
    case 'export':
      handleExportFile();
      break;
    case 'decode':
      handleDecode();
      break;
  };
};

// monaco
const handleMonacoDrop = (type: string, e: DragEvent) => {
  e.preventDefault();

  const file = e.dataTransfer?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      form.value.content[type] = content;
    };
    reader.readAsText(file);
  }
};

const handleMonacoObject = (monaco) => {
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position, _context, _token) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const monacoRange = new monaco.Range(
        range.startLineNumber,
        range.startColumn,
        range.endLineNumber,
        range.endColumn,
      );
      return {
        suggestions: drpySuggestions(monacoRange, monaco).map((proposal: any) => ({
          label: proposal.label,
          detail: proposal.detail,
          kind: proposal.kind || monaco.languages.CompletionItemKind.Function, // 确保指定了一个有效的kind
          insertText: proposal.insertText,
          insertTextRules: proposal.insertTextRules || monaco.languages.CompletionItemInsertTextRule.None,
          documentation: proposal.documentation,
          range: monacoRange, // 使用正确的范围类型
        })),
      };
    },
  });
  monaco.languages.typescript.javascriptDefaults.addExtraLib(drpyObjectInner);
};

// source
const handleSourceFetch = (data: string) => {
  active.value.editor = 'html';
  form.value.content.html = data;
};

// dom
const handleDomDebugPdfa = async () => {
  const rule = form.value.rule.pdfa;
  if (!rule) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.ruleNoRule'));
    return;
  }

  await handleDomDebug('pdfa', rule);
};

const handleDomDebugPdfh = async () => {
  const rule = form.value.rule.pdfh;
  if (!rule) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.ruleNoRule'));
    return;
  }

  await handleDomDebug('pdfh', rule);
};

const handleDomDebug = async (type: string, rule: string) => {
  const content = (form.value.content.html || '').trim();
  if (!content) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.ruleNoHtml'));
    return;
  };

  const methodMap = {
    'pdfa': fetchJsEditPdfa,
    'pdfh': fetchJsEditPdfh,
  };

  try {
    const res = await methodMap[type]({ html: content, rule });
    console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, res);

    logRef.value?.write(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    logRef.value?.write(res);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err: any) {
    console.error(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, err);

    logRef.value?.write(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    logRef.value?.write(err, 'error');
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

// btn
const handleModeToggle = async () => {
  const defaultMode = ['t3js', 't3py', 't4'];
  const activeIndex = defaultMode.indexOf(form.value.init.mode);
  const status = activeIndex + 1 === defaultMode.length ? defaultMode[0] : defaultMode[activeIndex + 1];
  form.value.init.mode = status;
  if (status === 't4') {
    MessagePlugin.info(t('pages.lab.jsEdit.message.modeT4'));
  } else if (status === 't3py') {
    MessagePlugin.info(t('pages.lab.jsEdit.message.modeT3py'));
  }
  form.value.content.js = await utilsRead();
  await utilsPutSite();
};

const handleDataDebugLog = async () => {
  try {
    const res = await utilsGetLog();

    res.forEach(([_type, time, content]) => {
      console.info(`log: ${moment(time).format('YYYY-MM-DD HH:mm:ss')}`, content);

      logRef.value?.write(`log: ${moment(time).format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
      logRef.value?.write(content);
    });
  } catch (err: any) {
    console.warn(`log: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, err);

    logRef.value?.write(`log: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    logRef.value?.write(err, 'error');
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

// data
const handleDataDebugInit = async () => {
  await handleDataDebug('init', { debug:true });
};

const handleDataDebugHome = async () => {
  await handleDataDebug('home');
};

const handleDataDebugHomeVod = async () => {
  await handleDataDebug('homeVod');
};

const handleDataDebugCategory = async () => {
  let { t: tid, f = '{}', pg } = form.value.category;
  if (!f) f = '{}';
  f = Function('return (' + f + ')')();

  if (!tid) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.listNoT'));
    return;
  };
  const data = {
    tid,
    page: pg || 1,
    filter: !!f,
    f: JSON.stringify(f),
  };
  await handleDataDebug('category', data);
};

const handleDataDebugDetail = async () => {
  const { ids } = form.value.detail;

  if (!ids) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.detailNoIds'));
    return;
  };

  await handleDataDebug('detail', { id: ids });
};

const handleDataDebugSearch = async () => {
  const { wd, pg } = form.value.search;

  if (!wd) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.searchNoWd'));
    return;
  }

  const data = {
    wd,
    quick: false,
    pg: pg === 1 ? null : pg,
  };
  await handleDataDebug('search', data);
};

const handleDataDebugPlay = async () => {
  const { flag, play } = form.value.play;

  if (!flag) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.playNoFlag'));
    return;
  }

  if (!play) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.playNoPlay'));
    return;
  }

  const data = {
    flag: flag,
    input: play,
  };
  await handleDataDebug('play', data);
};

const handleDataDebugProxy = async () => {
  let { url } = form.value.proxy;

  if (!url) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyNoUrl'));
    return;
  }

  if (url && url.startsWith('http')) {
    if (!url.startsWith('http://127.0.0.1:9978/')) {
      const formatUrl = `http://127.0.0.1:9978/proxy?do=js&url=${url}`;
      form.value.proxy.url = formatUrl;
      url = formatUrl;
    };
    const formatUrl = new URL(url);
    const params = Object.fromEntries(formatUrl.searchParams.entries());
    await handleDataDebug('proxy', params);
  }
};

const handleDataDebugProxyUpload = async () => {
  try {
    const { upload, url } = form.value.proxy;
    let content: any[] = [];

    if (!url) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyNoUrl'));
      return;
    }

    if (!upload) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyUploadNoData'));
      return;
    } else {
      try {
        // const jsonStr = JSON5.parse(upload);
        const jsonStr = new Function(`return ${upload}`)();
        if (jsonStr && Array.isArray(jsonStr) && jsonStr.length === 3) {
          content = jsonStr;
        } else {
          MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyUploadNoJson'));
          return;
        }
      } catch {
        MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyUploadNoJson'));
        return;
      }
    }

    const formatUrl = new URL(url);
    const params = Object.fromEntries(formatUrl.searchParams.entries());
    await setT3Proxy({ text: content, url: params.url });

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err: any) {
    console.error('[editSource][proxyUpload][err]', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

const handleDataDebug = async (type: string, data: { [key: string]: any } = {}) => {
  // 1. 判断编辑器内容是否为空
  const content = (form.value.content.js || '').trim();
  if (!content) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
    return;
  };

  // 2.自动初始化则上传并初始化
  const { edit, init } = form.value.lastEditTime;
  const auto = form.value.init.auto;
  if (type === 'init' || (edit > init && auto)) {
    const currentTime = moment().unix();
    form.value.lastEditTime.init = currentTime;
    await utilsPutSite();
    if (type !== 'init') {
      await fetchCmsInit({ sourceId: debugId.value, debug: true });
    };
  };

  // 3.执行
  const methodMap = {
    'init': fetchCmsInit,
    'home': fetchCmsHome,
    'homeVod': fetchCmsHomeVod,
    'detail': fetchCmsDetail,
    'category': fetchCmsCategory,
    'search': fetchCmsSearch,
    'play': fetchCmsPlay,
    'proxy': fetchCmsProxy,
    'log': fetchCmsRunMain,
  };

  try {
    const res = await methodMap[type]({ ...data, sourceId: debugId.value });
    if (type === 'proxy') form.value.proxy.upload = JSON5.stringify(res);
    console.info(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, res);

    logRef.value?.write(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    logRef.value?.write(res);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err: any) {
    console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, err);

    logRef.value?.write(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    logRef.value?.write(err, 'error');
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

// console
const setupConsole = () => {
  logRef.value?.init();
};

const handleConsoleClear = () => {
  console.clear();
  logRef.value?.clear();
};

// webview

// 验证 webview 是否挂掉
const validateAndRecoverWebview = async () => {
  if (!webviewRef.value || !controlText.value) return;

  try {
    webviewRef.value.getURL();
  } catch {
    console.warn('webview 失效，正在恢复...');
    await resetWebview();
    bindDomReady();
    nextTick(() => {
      handleWebviewLoad(controlText.value);
    });
  }
};

// 绑定 dom-ready 事件
const bindDomReady = () => {
  if (!webviewRef.value) return;

  const loadWebview = () => {
    console.log('webview dom-ready');
    webviewRef.value?.removeEventListener('dom-ready', loadWebview);
    
    // ✅ dom-ready 后直接重新加载 controlText 的内容
    if (controlText.value) {
      handleWebviewLoad(controlText.value);
    }
  };

  webviewRef.value.removeEventListener('dom-ready', loadWebview);
  webviewRef.value.addEventListener('dom-ready', loadWebview);
};

// 重置 webview
const resetWebview = async () => {
  isWebviewVisible.value = false;
  await nextTick();
  isWebviewVisible.value = true;
  await nextTick();
};

// 处理 webview 加载
const handleWebviewLoad = (url: string) => {
  if (!url || url === 'about:blank') return;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    try {
      parsedUrl = new URL(`http://${url}`);
      url = parsedUrl.href;
    } catch {
      console.error('Invalid URL:', url);
      return;
    }
  }

  // 限制只允许 http/https 协议
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) return;
  controlText.value = url;
  webviewRef.value?.loadURL(url);

  const setupWebviewListeners = () => {
    const webview = webviewRef.value;
    if (!webview) return;

    const webviewRoute = (event: { url: string }) => {
      if (controlText.value === event.url) return;
      controlText.value = event.url;
      console.log('webviewRoute', event.url);
    };

    // 移除之前的监听器（避免重复注册）
    webview.removeEventListener('did-navigate-in-page', webviewRoute);
    // webview.removeEventListener('did-navigate', webviewRoute);
    webview.removeEventListener('did-redirect-navigation', webviewRoute);

    // 添加新的监听器
    webview.addEventListener('did-navigate-in-page', webviewRoute);
    // webview.addEventListener('did-navigate', webviewRoute);
    webview.addEventListener('did-redirect-navigation', webviewRoute);
  };

  const setupIpcListeners = () => {
    // 只清除 blockUrl 监听器，防止其他 ipc 消息被误删
    window.electron.ipcRenderer.removeAllListeners('blockUrl');

    window.electron.ipcRenderer.on('blockUrl', async (_, blockedUrl: string) => {
      handleWebviewLoad(blockedUrl);
    });
  };

  nextTick(() => {
    setupWebviewListeners();
    setupIpcListeners();
  });
};

// 处理 webview 控制
const handleWebviewControl = async (action: 'back'| 'forward'| 'devtools'| 'refresh'| 'clearHistory') => {
  const webview = webviewRef.value;
  if (!webview) return;

  // 后退
  const backEvent = () => {
    if (webview.canGoBack()) webview.goBack();
  };

  // 前进
  const forwardEvent = () => {
    if (webview.canGoForward()) webview.goForward();
  };

  // 刷新
  const refreshEvent = () => {
    webview.reload();
  };

  // 清除浏览器导航历史记录
  const clearHistoryEvent = () => {
    webview.clearHistory();
  };

  const openDevToolsEvent = () => {
    webview.openDevTools();
  };

  const method = {
    back: backEvent,
    devtools: openDevToolsEvent,
    forward: forwardEvent,
    refresh: refreshEvent,
    clearHistory: clearHistoryEvent,
  };

  method[action]();
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
        margin-right: 5px;
      }
    }

    .right-operation-container {
      display: flex;
      align-items: center;
      gap: var(--td-size-4);

      .mode-toogle {
        height: 36px;
        min-width: 80px;
        font: var(--td-font-body-medium);
        color: var(--td-text-color-secondary);
        --ripple-color: transparent;
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;

        &:hover {
          color: var(--td-text-color-primary);
        }

        .status {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          line-height: 16px;
          justify-content: center;

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

      :deep(.t-radio-group.t-size-m) {
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;

        .t-radio-button {
          padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
          background-color: var(--td-bg-content-input-2);
          border-color: transparent;
        }
        .t-select__wrap {
          width: fit-content;
          position: relative;
          height: calc(var(--td-comp-size-m) -(var(--td-comp-paddingTB-xxs)* 2));

          .t-input--auto-width {
            min-width: 44px;
          }
          &:hover {
            .t-input__inner {
              color: var(--td-text-color-primary);
            }
          }
          .t-input__inner {
            color: var(--td-text-color-secondary);
            font: var(--td-font-body-medium);
          }
          .t-input {
            .t-input__suffix:not(:empty) {
              display: none;
            }
          }
        }
        .t-select__wrap::before {
          content: "";
          position: absolute;
          left: 0px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: calc(100% - 24px);
          background-color: var(--td-component-border);
          transition: opacity 0.2s cubic-bezier(0, 0, 0.15, 1);
          z-index: 2;
        }
      }

      .component-op {
        display: flex;
        height: var(--td-comp-size-m);
        padding: 0 var(--td-comp-paddingLR-xs);
        background-color: var(--td-bg-content-input-2);
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
    width: 100%;
    height: calc(100% - 36px - var(--td-size-4));
    border-radius: var(--td-radius-default);
    overflow: hidden;

    :deep(.splitpanes) {
      &.default-theme {
        .splitpanes__splitter {
          background-color: var(--td-border-level-1-color);

          &::before {
            background-color: var(--td-border-level-2-color);
          }

          &::after {
            background-color: var(--td-border-level-2-color);
          }
        }

        &.splitpanes--horizontal>.splitpanes__splitter,
        .splitpanes--horizontal>.splitpanes__splitter {
          border-color: var(--td-border-level-1-color);
        }

        &.splitpanes--vertical>.splitpanes__splitter,
        .splitpanes--vertical>.splitpanes__splitter {
          border-color: var(--td-border-level-1-color);
        }
      }
    }

    .editor-pane {
      height: 100%;
    }

    .console-pane {
      height: 100%;
      background-color: var(--td-bg-content-input-1);
      // padding: var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-s);

      .console-root {
        display: flex;
        justify-content: space-between;
        padding: var(--td-comp-paddingLR-xxs) var(--td-comp-paddingLR-s);

        .header-clear {
          cursor: pointer;
        }
      }

      .log-pane-content {
        height: calc(100% - 26px);
        border-radius: var(--td-radius-default);
        overflow: hidden;

        .log-box {
          height: 100%;

          :deep(.xterm) {
            height: 100%;

            .xterm-viewport {
              background-color: var(--td-bg-content-input-1) !important;
            }

            .xterm-screen {
              padding: 0 var(--td-comp-paddingLR-s);
            }
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
  background-color: var(--td-bg-content-input-2) !important;
  border-color: transparent;
  box-shadow: none;
}

:deep(.t-input-adornment) {
  width: 100%;

  .input-container {
    width: inherit;
    background-color: var(--td-bg-content-input-2) !important;
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

:deep(.monaco-editor) {
  --vscode-editorGutter-background: var(--td-bg-content-input-2);
  --vscode-editor-background: var(--td-bg-content-input-2);
  --vscode-editorStickyScroll-background: var(--td-bg-content-input-2);
  --vscode-editorStickyScroll-shadow: var(--td-bg-content-input-1);
  --vscode-scrollbar-shadow: var(--td-bg-content-input-1);
}

:deep(.t-tabs) {
  height: 100%;

  .t-tabs__header {
    .t-tabs__nav-container.t-is-top {
      background-color: var(--td-bg-content-input-1);
    }
  }

  .t-tabs__nav--card.t-tabs__nav-item.t-is-active {
    background-color: var(--td-bg-content-input-2);
    border-bottom-color: transparent;
  }

  .t-tabs__content {
    padding: var(--td-pop-padding-s);
    background-color: var(--td-bg-content-input-2);
    height: calc(100% - var(--td-comp-size-l));
    width: 100%;
    overflow: auto;

    .t-tab-panel {
      height: 100%;
      width: 100%;
    }
  }

  .t-tabs__nav-item.t-size-m {
    height: var(--td-comp-size-l);
    line-height: var(--td-comp-size-l);
    background-color: var(--td-bg-content-input-1);
    border-color: transparent;
  }

  .t-tabs__nav-item-text-wrapper {
    color: var(--td-text-color-secondary);
    font-size: var(--td-font-size-link-small);
    font-weight: normal;
  }

}

.data_debug, .dom_debug {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  grid-gap: var(--td-comp-margin-s);
  overflow-y: auto;

  .item {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    overflow: hidden;
    position: relative;

    .init {
      width: auto !important;

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

    .source {
      :deep(.input-group) {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
        overflow: hidden;
        gap: 0;

        .input {
          flex: 1;
          width: 100%;
          margin-right: var(--td-comp-margin-s);

          .t-input {
            background-color: var(--td-bg-content-input-1) !important;
          }
        }

        .w-btn {
          width: 50px !important;
          background-color: var(--td-bg-content-input-1);
        }
      }
    }

    .input {
      width: 100%;
      margin-right: var(--td-comp-margin-s);

      :deep(.t-input), :deep(.t-textarea__inner) {
        background-color: var(--td-bg-content-input-1) !important;
      }
    }

    .proxy-upload-textarea {
      margin-right: 0;

      :deep(.t-textarea__inner) {
        padding-bottom: calc(var(--td-size-3) + var(--td-comp-size-m));
      }
    }

    .proxy-upload-btn {
      position: absolute;
      right: var(--td-size-4);
      bottom: var(--td-size-3);
    }

    .w-btn {
      width: 50px;
      background-color: var(--td-bg-content-input-1);
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

.html_preview {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-s);
  height: 100%;

  .urlbar-root {
    display: flex;
    gap: var(--td-comp-margin-s);

    .urlbar-control {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background-color: var(--td-bg-content-input-1);
      border-radius: var(--td-radius-default);
      height: 100%;
      width: 100px;

      :deep(.t-button) {
        &:not(.t-is-disabled):not(.t-button--ghost) {
          --ripple-color: transparent;
        }
      }

      :deep(.t-button__text) {
        svg {
          color: var(--td-text-color-placeholder);
        }
      }

      :deep(.t-button--variant-text) {
        &:hover {
          border-color: transparent;
          background-color: transparent;

          .t-button__text {
            svg {
              color: var(--td-primary-color);
            }
          }
        }
      }
    }

    .urlbar-url {
      :deep(.t-input) {
        background-color: var(--td-bg-content-input-1) !important;
      }
    }

    .urlbar-devtool {
      background-color: var(--td-bg-content-input-1);
      --ripple-color: transparent;
      color: var(--td-text-color-placeholder);

      &:hover {
        color: var(--td-primary-color);
      }
    }
  }

  .webview-box {
    flex: 1;
    height: 100%;
    width: 100%;
    background-color: var(--td-bg-content-input-1);
    border-radius: var(--td-radius-default);
    overflow: hidden;
  }
}
</style>
