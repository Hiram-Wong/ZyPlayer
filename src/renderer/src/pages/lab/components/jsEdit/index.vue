<template>
  <div class="js-edit view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.jsEdit.title') }}</h3>
      </div>
      <div class="right-operation-container">
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
          width="40%"
          @confirm="confirmTemplate()"
        >
          <p>{{ $t('pages.lab.jsEdit.templateTip') }}</p>
          <t-select v-model="form.template">
            <t-option v-for="(item, index) in Object.keys(mubanData)" :key="index" :value="item" :label="item" />
          </t-select>
        </t-dialog>
      </div>
    </div>
    <div class="content">
      <t-split
        direction="vertical"
        default-size="0.7"
        class="split-pane"
      >
        <template #first>
          <t-split class="split-pane">
            <template #first>
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
            </template>
            <template #second>
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
                            {{ $t('pages.lab.jsEdit.action.currentStatus') }}:
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

                      <t-button class="button init w-btn" theme="default" @click="handleModeToggle">
                        <div class="status">
                          <span class="title">{{ $t('pages.lab.jsEdit.action.mode') }}</span>
                          <span class="desc">
                            {{ $t('pages.lab.jsEdit.action.currentStatus') }}:
                            {{
                              form.init.mode === 't3'
                                ? $t('pages.lab.jsEdit.action.t3')
                                : $t('pages.lab.jsEdit.action.t4')
                            }}
                          </span>
                        </div>
                      </t-button>

                      <t-button class="button init w-btn" theme="default" @click="handleDataDebugLog" v-show="form.init.mode === 't3'">日志</t-button>
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
                        <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('reload')">
                          <rotate-icon />
                        </t-button>
                      </div>
                      <t-input class="urlbar-url" v-model="webview.url" @enter="handleWebviewLoad"></t-input>
                      <t-button variant="text" class="urlbar-devtool" @click="handleWebviewControl('devtools')">F12</t-button>
                    </div>
                    <webview ref="webviewRef" class="webview-box" :src="webview.route" disablewebsecurity allowpopups nodeIntegration style="height: 100%; width: 100%;"/>
                  </div>
                </t-tab-panel>
              </t-tabs>
            </template>
          </t-split>
        </template>
        <template #second>
          <div class="console-pane">
            <div class="console-root">
              <div class="header-name">{{ $t('pages.lab.jsEdit.console.title') }}</div>
              <div class="header-clear" @click="handleConsoleClear">{{ $t('pages.lab.jsEdit.console.clear') }}</div>
            </div>
            <div class="log-pane-content">
              <div class="log-box" ref="logRef"></div>
            </div>
          </div>
        </template>
      </t-split>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'luna-object-viewer/luna-object-viewer.css';
import 'luna-data-grid/luna-data-grid.css';
import 'luna-dom-viewer/luna-dom-viewer.css';
import 'luna-console/luna-console.css';

import moment from 'moment';
import JSON5 from 'json5';
import LunaConsole from 'luna-console';
import { computed, ref, onMounted, watch, useTemplateRef, nextTick, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { GestureClickIcon, ArrowLeftIcon, ArrowRightIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { t } from '@/locales';
import { useSettingStore } from '@/store';
import emitter from '@/utils/emitter';
import { CodeEditor } from '@/components/code-editor';
import { setT3Proxy } from '@/api/proxy';
import { addSite, putSite } from '@/api/site';
import { fetchJsEditPdfa, fetchJsEditPdfh, fetchJsEditMuban, fetchJsEditDebug } from '@/api/lab';
import { fetchCmsHome, fetchCmsHomeVod, fetchCmsDetail, fetchCmsCategory, fetchCmsPlay, fetchCmsSearch, fetchCmsInit, fetchCmsRunMain, putSiteDefault, fetchCmsProxy } from '@/api/site';
// import { aes } from '@/utils/crypto';
// import { fetchConfig } from '@/api/setting';
import { getOriginalJs } from './utils/crypto';
import reqHtml from '../reqHtml/index.vue';
import drpySuggestions from './utils/drpy_suggestions';
import drpyObjectInner from './utils/drpy_object_inner.ts?raw';
import TSplit from '@/components/split/index.vue';

const remote = window.require('@electron/remote');
const router = useRouter();
const storeSetting = useSettingStore();
const logRef = useTemplateRef('logRef');
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
    f: '',
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
    mode: 't3',
    log: false,
  },
});
const EDIT_CONF = {
  readOnly: false,
  theme: storeSetting.displayMode === 'light' ? 'vs' : 'vs-dark',
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
const webviewRef = ref<any>(null);
const webview = ref({
  url: 'about:blank',
  route: 'about:blank',
});
const log = shallowRef<any>(null);
const tmp = computed(() => {
  return {
    file: t('pages.lab.jsEdit.fileManage'),
  };
});
const active = ref({
  nav: '',
  template: false,
  action: 'dom',
  editor: 'js'
});
const mubanData = ref({});
const debugId = ref('');

watch(
  () => storeSetting.displayMode,
  (val) => {
    jsEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';
    htmlEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';
  }
);
watch(
  () => form.value.content.js,
  () => {
    const currentTime = moment().unix();
    form.value.lastEditTime.edit = currentTime;
  }
);

onMounted(() => {
  setupConsole();
  getTemplate();
  setupData();
});

// common
const utilsReadFile = async(filePath: string) =>{
  const fs = remote.require('fs').promises;
  return await fs.readFile(filePath, 'utf-8');
};

const utilsWriteFile = async (filePath: string, val: string) => {
  const fs = remote.require('fs').promises;
  await fs.writeFile(filePath, val, 'utf-8');
};

const utilsT3BasePath = async () => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `file/drpy_dzlive/drpy_js/`);
  return defaultPath;
};

const utilsT4BasePath = async () => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `plugin/drpy-node/js/`);
  return defaultPath;
};

const utilsBasePath = async () => {
  const type = form.value.init.mode;
  if (type === 't3') {
    return await utilsT3BasePath();
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

const sitePutJs = async () => {
  const type = form.value.init.mode;
  const content = form.value.content.js;

  if (type === 't3') {
    await putSite({ ids: [debugId.value], doc: { ext: content, type: 7, api: 'csp_DRPY' } });
  } else if (type === 't4') {
    await utilsWriteT4File(content);
    await putSite({ ids: [debugId.value], doc: { type: 6, api: 'http://127.0.0.1:5757/api/debug' } });
  }
};

const setupData = async () => {
  const debugRes = await fetchJsEditDebug();
  if (debugRes?.id) {
    debugId.value = debugRes.id;
    const type = debugRes.type;
    form.value.init.mode = type === 7 ? 't3' : 't4';
    if (type === 7) {
      form.value.content.js = debugRes.ext;
    } else {
      form.value.content.js = await utilsReadT4File();
    }
  } else {
    const siteRes = await addSite({
      name: 'debug',
      key: 'debug',
      type: form.value.init.mode === 't3' ? 7 : 6,
      api: form.value.init.mode === 't3' ? 'csp_DRPY' : 'http://127.0.0.1:5757/api/debug',
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
    const basePath = await utilsBasePath();
    const { canceled, filePaths } = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      defaultPath: basePath,
      filters: [
        { name: 'JavaScript Files', extensions: ['js'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (!canceled && filePaths) {
      const filePath = filePaths[0];
      const content = await utilsReadFile(filePath);
      form.value.content.js = content;
      MessagePlugin.success(t('pages.setting.data.success'));
    };
  } catch (err: any) {
    console.error(`[exportFileEvent][Error]:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

const handleexportFile = async () => {
  const content = (form.value.content.js || '').trim();

  if (!content) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
    return;
  };

  const title = (() => {
    try {
      return (
        content.match(/title:(.*?),/)?.[1].replace(/['"]/g, '').trim() || 'source'
      );
    } catch {
      return 'source';
    }
  })();

  try {
    const basePath = await utilsBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `${title}.js`);
    const { canceled, filePath } = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      defaultPath,
      filters: [
        { name: 'JavaScript Files', extensions: ['js'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!canceled && filePath) {
      await utilsWriteFile(filePath, content);
      MessagePlugin.success(t('pages.setting.data.success'));
    };
  } catch (err: any) {
    console.error(`[exportFileEvent][Error]:`, err);
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
    await sitePutJs();
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
      handleexportFile();
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

  const _console = log.value;
  try {
    const res = await methodMap[type]({ html: content, rule });
    _console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    _console.log(res);
    console.log(res);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err: any) {
    _console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    _console.error(err);
    console.error(err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

// btn
const handleModeToggle = async () => {
  const status = form.value.init.mode === 't3' ? 't4' : 't3';
  form.value.init.mode = status;
  if (status === 't4') {
    MessagePlugin.info(t('pages.lab.jsEdit.message.modeT4'));
  };
  await sitePutJs();
};

const handleDataDebugLog = async () => {
  const res = await fetchCmsRunMain({
    func: "function main() {return getLogRecord()}",
    arg: "",
    sourceId: debugId.value
  });

  const _console = log.value;

  _console.warn(`server log: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  res.forEach(([type, time, content]) => {
    try {
      content = JSON5.parse(content);
    } catch {

    } finally {
      console.log(content);
      _console[type](`server log: ${time}`, content);
    }
  });
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
  const { t: tid, f, pg: page } = form.value.category;

  if (!tid) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.listNoT'));
    return;
  }

  const data = {
    tid,
    page: page || 1,
    filter: !!f,
    extend: f ? JSON5.parse(f) : {},
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
        const jsonStr = JSON5.parse(upload);
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
    await sitePutJs();
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

  const _console = log.value;
  try {
    const res = await methodMap[type]({ ...data, sourceId: debugId.value });
    if (type === 'proxy') form.value.proxy.upload = JSON5.stringify(res);
    _console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    _console.log(res);
    console.log(res);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err: any) {
    _console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    _console.error(err);
    console.error(err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

// console
const setupConsole = () => {
  if (!logRef.value) return;

  const _console = new LunaConsole(logRef.value, {
    theme: storeSetting.displayMode === 'light' ? 'light' : 'dark',
  });
  log.value = _console;
  _console.log('%c console setup success, welcome use zyfun js edit series tools ', 'background: var(--td-bg-content-input-1); color: var(--td-success-color)');
};

const handleConsoleClear = () => {
  console.clear();

  if (!log.value) return;
  log.value.clear();
};

// webview
const handleWebviewControl = (type: string) => {
  if (!webviewRef.value) return;

  switch (type) {
    case 'back':
    if (webviewRef.value.canGoBack()) webviewRef.value.goBack();
      break;
    case 'forward':
    if (webviewRef.value.canGoForward()) webviewRef.value.goForward();
      break;
    case 'reload':
      webviewRef.value.reload();
      break;
    case 'devtools':
      webviewRef.value.openDevTools();
      break;
  }
}

const handleWebviewLoad = (url: string) => {
  if (!url) return;

  if (!/^(https?:\/\/)/.test(url)) {
    url = `http://${url}`;
    webview.value.url = url;
  }
  webview.value.route = url;

  const webviewLoadError = (err: any) => {
    MessagePlugin.warning(`${t('pages.lab.pluginCenter.control.loadUiEntryError')}: ${err.errorDescription}`);
    webviewRef.value.src = 'about:blank';
  };

  const webviewRoute = (event: any) => {
    console.log('webviewRoute', event);
    webview.value.url = event.url;
  };

  nextTick(() => {
    webviewRef.value.removeEventListener('did-fail-load', webviewLoadError);
    webviewRef.value.addEventListener('did-fail-load', webviewLoadError);
    webviewRef.value.addEventListener('did-navigate-in-page', webviewRoute);
    webviewRef.value.addEventListener('did-navigate', webviewRoute);
  });
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
    // display: flex;
    // flex-direction: row;
    // justify-content: space-between;
    // grid-gap: var(--td-comp-margin-s);
    width: 100%;
    // height: 100%;
    height: calc(100% - 36px - var(--td-size-4));
    // overflow: hidden;

    border-radius: var(--td-radius-default);
    overflow: hidden;

    .left {
      height: 100%;
      width: calc((100% - var(--td-comp-margin-s)) / 2);

      .edit {
        display: flex;
        flex-direction: column;
        grid-gap: var(--td-comp-margin-s);
        height: 100%;

        .code-op {
          display: flex;
          flex-direction: column;
          grid-gap: var(--td-comp-margin-s);

          .code-op-item {
            display: flex;
            grid-gap: var(--td-comp-margin-s);
          }

          .item {
            display: flex;
            grid-gap: var(--td-comp-margin-s);
          }

          .source,
          .sniffer {
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

      .log-container {
        position: relative;
        flex: 1;
        width: 100%;
        height: 100%;
        margin-top: var(--td-comp-paddingTB-m);
        border-radius: var(--td-radius-default);
        background-color: var(--td-bg-content-input-2);

        .log-nav {
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

        .log-text {
          height: 100%;
          width: 100%;
          position: absolute;
          top: 0;
          bottom: 0;
          border-radius: var(--td-radius-default);
          padding: var(--td-comp-paddingTB-xs) 0 var(--td-comp-paddingTB-m);

          .log-box {
            position: relative;
            width: 100% !important;
            height: 100% !important;
            margin-top: var(--td-comp-paddingTB-m);
            border-radius: 0 0 var(--td-radius-default) var(--td-radius-default);
            overflow: hidden;
            :deep(.monaco-edito) {
              width: 100% !important;
              height: 100% !important;
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

.split-pane {
  height: 100%;
  width: 100%;

  .editor-pane {
    height: 100%;
    width: 100%;
  }

  .console-pane {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;

    .console-root {
      display: flex;
      justify-content: space-between;
      background-color: var(--td-bg-content-input-1);
      padding: 0 var(--td-comp-paddingLR-xs);

      .header-name {
        color: var(--td-text-color-secondary);
        font-size: var(--td-font-size-link-small);
      }

      .header-clear {
        color: var(--td-text-color-secondary);
        cursor: pointer;

        &:hover {
          color: var(--td-text-color-primary);
        }
      }
    }

    .log-pane-content {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      min-height: 0;

      .log-box {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background-color: var(--td-bg-content-input-2);
        color: var(--td-text-color-primary);
      }
    }
  }
}
</style>
