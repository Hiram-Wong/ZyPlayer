<template>
  <div class="lab-js-edit view-component-container">
    <div class="header">
      <div class="left-operation-container">
        <t-select
          v-model="active.type"
          :label="$t('common.adapter')"
          auto-width
          class="adapter"
          @change="handleOpTypeChange"
        >
          <t-option v-for="item in TYPE_OPTIONS" :key="item.value" :value="item.value" :label="item.label" />
        </t-select>
        <t-button class="init" theme="default" auto-width @click="handleOpInitMode">
          {{ $t('pages.lab.edit.action.init') }}: {{ active.init ? $t('common.auto') : $t('common.manual') }}
        </t-button>
      </div>
      <div class="right-operation-container">
        <group-btn :data="op" @change="handleOpChange" />

        <dialog-template-view
          v-model:visible="active.templateDialog"
          :data="templateFormData"
          :template="templateNameList"
          @submit="handleOpConfirmTemplate"
        />
        <dialog-document
          v-model:visible="active.helpDialog"
          :title="$t('pages.md.labEditHelp.title')"
          :content="$t('pages.md.labEditHelp.content')"
          :attach="`.${attachContent}`"
        />
      </div>
    </div>
    <div class="content">
      <splitpanes horizontal>
        <pane size="70">
          <splitpanes>
            <pane>
              <div class="editor-pane">
                <t-tabs v-model="active.editor" theme="card" lazy class="editor-pane-tabs">
                  <t-tab-panel :label="$t('component.codeEditor.editor.code')" value="code">
                    <div class="editor-pane-code">
                      <code-editor
                        v-model="editText.code"
                        :options="codeEditConf"
                        class="code-box"
                        @drop.prevent="handleEditorDrop('code', $event)"
                        @monaco-object="handleEditorObject"
                      />
                    </div>
                  </t-tab-panel>
                  <t-tab-panel :label="$t('component.codeEditor.editor.html')" value="html">
                    <div class="editor-pane-html">
                      <code-editor
                        v-model="editText.html"
                        :options="htmlEditConf"
                        class="code-box"
                        @drop.prevent="handleEditorDrop('html', $event)"
                      />
                    </div>
                  </t-tab-panel>
                </t-tabs>
              </div>
            </pane>
            <pane>
              <div class="action-pane">
                <t-tabs v-model="active.action" theme="card" lazy class="pane-right">
                  <t-tab-panel :label="$t('pages.lab.edit.debug.dom')" value="dom">
                    <div class="action-pane-dom">
                      <div class="action-item req-item">
                        <input-req
                          v-model="reqFormData"
                          :attach="`.${attachContent}`"
                          class="source"
                          @response="onReqResponse"
                        />
                      </div>
                      <div class="action-item">
                        <t-input
                          v-model="domFormData.pdfa"
                          :label="$t('pages.lab.edit.rule.pdfa')"
                          :placeholder="$t('pages.lab.edit.placeholder.pdfa')"
                        />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="domLoading.pdfa"
                          @click="handleDomDebugPdfa"
                        >
                          {{ $t('common.execute') }}
                        </t-button>
                      </div>
                      <div class="action-item">
                        <t-input
                          v-model="domFormData.pdfh"
                          :label="$t('pages.lab.edit.rule.pdfh')"
                          :placeholder="$t('pages.lab.edit.placeholder.pdfh')"
                        />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="domLoading.pdfh"
                          @click="handleDomDebugPdfh"
                        >
                          {{ $t('common.execute') }}
                        </t-button>
                      </div>
                    </div>
                  </t-tab-panel>
                  <t-tab-panel :label="$t('pages.lab.edit.debug.data')" value="data">
                    <div class="action-pane-data">
                      <div class="action-item action-base">
                        <t-button
                          theme="primary"
                          variant="base"
                          :loading="dataLoading.init"
                          @click="handleDataDebugInit"
                        >
                          {{ $t('pages.lab.edit.action.init') }}
                        </t-button>
                        <t-button
                          theme="primary"
                          variant="base"
                          :loading="dataLoading.home"
                          @click="handleDataDebugHome"
                        >
                          {{ $t('pages.lab.edit.action.home') }}
                        </t-button>
                        <t-button
                          theme="primary"
                          variant="base"
                          :loading="dataLoading.homeVod"
                          @click="handleDataDebugHomeVod"
                        >
                          {{ $t('pages.lab.edit.action.homeVod') }}
                        </t-button>
                      </div>
                      <div class="action-item">
                        <t-input v-model="dataFormData.category.tid" :label="$t('pages.lab.edit.rule.tid')" />
                        <t-input v-model="dataFormData.category.filter" :label="$t('pages.lab.edit.rule.filter')" />
                        <t-input-number
                          v-model="dataFormData.category.page"
                          theme="column"
                          :min="0"
                          :label="$t('pages.lab.edit.rule.page')"
                          class="input-number-item"
                        />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="dataLoading.category"
                          @click="handleDataDebugCategory"
                        >
                          {{ $t('pages.lab.edit.action.category') }}
                        </t-button>
                      </div>
                      <div class="action-item">
                        <t-input v-model="dataFormData.detail.ids" :label="$t('pages.lab.edit.rule.ids')" />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="dataLoading.detail"
                          @click="handleDataDebugDetail"
                        >
                          {{ $t('pages.lab.edit.action.detail') }}
                        </t-button>
                      </div>
                      <div class="action-item">
                        <t-input v-model="dataFormData.search.wd" :label="$t('pages.lab.edit.rule.wd')" />
                        <t-input-number
                          v-model="dataFormData.search.page"
                          theme="column"
                          :min="0"
                          :label="$t('pages.lab.edit.rule.page')"
                          class="input-number-item"
                        />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="dataLoading.search"
                          @click="handleDataDebugSearch"
                        >
                          {{ $t('pages.lab.edit.action.search') }}
                        </t-button>
                      </div>
                      <div class="action-item">
                        <t-input v-model="dataFormData.play.flag" :label="$t('pages.lab.edit.rule.flag')" />
                        <t-input v-model="dataFormData.play.play" :label="$t('pages.lab.edit.rule.play')" />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="dataLoading.play"
                          @click="handleDataDebugPlay"
                        >
                          {{ $t('pages.lab.edit.action.play') }}
                        </t-button>
                      </div>
                      <div class="action-item">
                        <t-input v-model="dataFormData.proxy.url" :label="$t('pages.lab.edit.rule.url')" />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="dataLoading.proxy"
                          @click="handleDataDebugProxy"
                        >
                          {{ $t('pages.lab.edit.action.proxy') }}
                        </t-button>
                      </div>
                      <div class="action-item">
                        <t-textarea
                          v-model="dataFormData.proxy.upload"
                          :placeholder="$t('pages.lab.edit.placeholder.proxyUpload')"
                          :autosize="{ minRows: 3, maxRows: 5 }"
                        />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="dataLoading.proxyUpload"
                          @click="handleDataDebugProxyUpload"
                        >
                          {{ $t('pages.lab.edit.action.proxyUpload') }}
                        </t-button>
                      </div>
                    </div>
                  </t-tab-panel>
                </t-tabs>
              </div>
            </pane>
          </splitpanes>
        </pane>
        <pane>
          <div class="output-pane">
            <div class="output-header">
              <tag-nav
                :list="OUTPUT_OPTIONS"
                :active="active.output"
                class="header-nav output-header-left"
                @change="handleOutputChange"
              />
              <div class="output-header-right">
                <div v-show="active.output === 'logger'" class="output-reconnect" @click="connectLogger">
                  {{ $t('common.reconnect') }}
                </div>
                <div class="output-clear" @click="handleOutputClear"><clear-formatting1-icon /></div>
              </div>
            </div>
            <div class="output-content">
              <terminal
                v-show="active.output === 'testResult'"
                ref="testResultRef"
                :options="termConf"
                :console="true"
                class="output-terminal"
              />
              <terminal
                v-show="active.output === 'logger' && active.supportLogger"
                ref="loggerRef"
                :options="termConf"
                :console="true"
                class="output-terminal"
              />
            </div>
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>
<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css';

import type { ISiteType } from '@shared/config/film';
import { SITE_TYPE } from '@shared/config/film';
import { THEME } from '@shared/config/theme';
import { toHMS } from '@shared/modules/date';
import {
  isArray,
  isArrayEmpty,
  isHttp,
  isJson,
  isJsonStr,
  isNil,
  isNumber,
  isStrEmpty,
  isString,
} from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import { throttle } from 'es-toolkit';
import JSON5 from 'json5';
import { Pane, Splitpanes } from 'splitpanes';
import { ClearFormatting1Icon } from 'tdesign-icons-vue-next';
import type { MessageInstance } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { WatchStopHandle } from 'vue';
import { computed, nextTick, onActivated, onDeactivated, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  addSite,
  fetchCmsCategory,
  fetchCmsDetail,
  fetchCmsHome,
  fetchCmsHomeVod,
  fetchCmsInit,
  fetchCmsPlay,
  fetchCmsProxy,
  fetchCmsSearch,
  fetchEditDecrypt,
  fetchEditDomPdfa,
  fetchEditDomPdfh,
  fetchEditTemplateDetail,
  fetchEditTemplates,
  fetchSiteDetailByKey,
  putSite,
  putSiteDefault,
} from '@/api/film';
import { setProxy } from '@/api/proxy';
import type { IEditor, IEditorOptions, ILang as IEditorLang } from '@/components/code-editor';
import CodeEditor, { applyExtraLib, applymSuggestions } from '@/components/code-editor';
import DialogDocument from '@/components/dialog-docment/index.vue';
import GroupBtn from '@/components/group-btn/index.vue';
import type { IReqConfig, IReqResponse } from '@/components/input-req/index.vue';
import InputReq from '@/components/input-req/index.vue';
import TagNav from '@/components/tag-nav/index.vue';
import type { ITerminalLog, ITerminalOptions } from '@/components/terminal/index.vue';
import Terminal from '@/components/terminal/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { attachContent } from '@/config/global';
import { t } from '@/locales';
import { useSettingStore } from '@/store';
import emitter from '@/utils/emitter';

import DialogTemplateView from './components/DialogTemplate.vue';
import { openFolder, readFile, writeFile } from './utils/comm';
import { DEBUG_PREFIX, SITE_DIFF_DEBUG_MAP, SITE_MONACO_MAP } from './utils/config';
import { SITE_LOG_MAP } from './utils/log';

const router = useRouter();
const storeSetting = useSettingStore();

const op = computed(() => [
  { label: t('pages.lab.edit.nav.template'), value: 'template' },
  {
    label: t('pages.lab.edit.nav.file.title'),
    value: [
      { label: t('pages.lab.edit.nav.file.folder'), value: 'file:openFolder' },
      { label: t('pages.lab.edit.nav.file.import'), value: 'file:import' },
      { label: t('pages.lab.edit.nav.file.export'), value: 'file:export' },
    ],
  },
  { label: t('pages.lab.edit.nav.decode'), value: 'decode' },
  { label: t('pages.lab.edit.nav.debug'), value: 'debug' },
  { label: t('common.help'), value: 'help' },
]);
const TYPE_OPTIONS = computed(() => [
  // { value: SITE_TYPE.T0_XML, label: t('pages.film.field.typeMap.t0-xml') },
  // { value: SITE_TYPE.T1_JSON, label: t('pages.film.field.typeMap.t1-json') },

  { value: SITE_TYPE.T3_DRPY, label: t('pages.film.field.typeMap.t3-js_drpy') },
  { value: SITE_TYPE.T3_XBPQ, label: t('pages.film.field.typeMap.t3-csp_xbpq') },
  { value: SITE_TYPE.T3_XYQ, label: t('pages.film.field.typeMap.t3-csp_xyq') },
  // { value: SITE_TYPE.T3_QUICK, label: t('pages.film.field.typeMap.t3-js_quick') },
  // { value: SITE_TYPE.T3_APPYSV2, label: t('pages.film.field.typeMap.t3-csp_appysv2') },
  { value: SITE_TYPE.T3_PY, label: t('pages.film.field.typeMap.t3-py') },
  // { value: SITE_TYPE.T3_ALIST, label: t('pages.film.field.typeMap.t3-alist') },

  // { value: SITE_TYPE.T4_DRPYJS0, label: t('pages.film.field.typeMap.t4-drpy_js0') },
  { value: SITE_TYPE.T4_DRPYS, label: t('pages.film.field.typeMap.t4-drpys') },
  { value: SITE_TYPE.T4_CATVOD, label: t('pages.film.field.typeMap.t4-catvod') },
]);
const OUTPUT_OPTIONS = computed(() => [
  { label: t('component.codeEditor.output.testResult'), value: 'testResult' },
  ...(active.value.supportLogger ? [{ label: t('component.codeEditor.output.logger'), value: 'logger' }] : []),
]);

const EDIT_CONF: IEditorOptions['normal'] = {
  automaticLayout: true, // 自动布局
  fixedOverflowWidgets: true, // 溢出小部件固定
  folding: true, // 代码折叠
  fontFamily: 'JetBrainsMono, monospace',
  fontLigatures: false, // 连字符
  insertSpaces: false, // 使用空格代替制表符
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
  theme: storeSetting.displayTheme === THEME.LIGHT ? 'vs' : 'vs-dark',
  wordWrap: 'off',
};

const loggerRef = useTemplateRef<InstanceType<typeof Terminal>>('loggerRef');
const testResultRef = useTemplateRef<InstanceType<typeof Terminal>>('testResultRef');

const codeEditConf = ref<IEditorOptions['normal']>({
  ...EDIT_CONF,
  language: 'javascript',
  quickSuggestions: {
    strings: true,
    comments: true,
    other: true,
  },
});
const htmlEditConf = ref<IEditorOptions['normal']>({ ...EDIT_CONF, language: 'html' });
const termConf = ref<ITerminalOptions>({
  convertEol: true,
  cursorBlink: false,
  cursorStyle: 'block',
  cursorInactiveStyle: 'block',
  fontSize: 13,
  fontFamily: 'JetBrainsMono, monospace',
  scrollback: 10000,
  scrollSensitivity: 1,
  smoothScrollDuration: 0,
  theme: {
    background: storeSetting.displayTheme === THEME.LIGHT ? '#e8e8e8' : '#393939',
    cursor: storeSetting.displayTheme === THEME.LIGHT ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    foreground: storeSetting.displayTheme === THEME.LIGHT ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    selectionBackground: storeSetting.displayTheme === THEME.LIGHT ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
  },
});

const reqFormData = ref<IReqConfig>({
  method: 'GET',
  url: '',
  encode: 'UTF-8',
  headers: '',
  contentType: 'application/json',
  data: '',
});
const templateFormData = ref({
  template: '',
});
const domFormData = ref({
  pdfa: '',
  pdfh: '',
});
const dataFormData = ref({
  detail: {
    ids: '',
  },
  category: {
    tid: '',
    filter: '{}',
    page: 1,
  },
  search: {
    wd: '',
    page: 1,
  },
  play: {
    flag: '',
    play: '',
  },
  proxy: {
    do: 'js',
    url: '',
    upload: '',
  },
});

const editText = ref({
  code: '',
  html: '',
});

const active = ref({
  type: SITE_TYPE.T3_DRPY as ISiteType,
  init: false,
  editor: 'code' as 'code' | 'html',
  action: 'dom' as 'dom' | 'data',
  output: 'testResult' as 'testResult' | 'logger',
  templateDialog: false,
  helpDialog: false,
  supportLogger: true,
});
const domLoading = ref({
  pdfa: false,
  pdfh: false,
});
const dataLoading = ref({
  init: false,
  home: false,
  homeVod: false,
  category: false,
  detail: false,
  search: false,
  play: false,
  proxy: false,
  proxyUpload: false,
});

const templateNameList = ref<string[]>([]);
const siteData = ref<IModels['site']>({});

const alert = ref<Record<string, Promise<MessageInstance> | null>>({
  debug: null,
});
const debugWatchStop = ref<WatchStopHandle | null>(null);
const loggerAbortController = ref<any>(null);

watch(
  () => storeSetting.displayTheme,
  (val) => {
    codeEditConf.value.theme = val === THEME.LIGHT ? 'vs' : 'vs-dark';
    htmlEditConf.value.theme = val === THEME.LIGHT ? 'vs' : 'vs-dark';

    termConf.value.theme = {
      foreground: val === THEME.LIGHT ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      background: val === THEME.LIGHT ? '#e8e8e8' : '#393939',
      cursor: val === THEME.LIGHT ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    };
  },
);

watch(
  () => editText.value.code,
  () => active.value.init && throttleSaveSiteAndWriteFileData(),
);

onMounted(() => setup());
onActivated(() => activeSetup());
onDeactivated(() => deactivateDispose());

const setup = async () => {
  await getSiteData();
  active.value.type = siteData.value.type || active.value.type;
  editText.value.code = await readFile(active.value.type, 'silence');

  await connectLogger();
};

const activeSetup = async () => {
  debugWatchStop.value = watch(
    () => storeSetting.debug,
    (val) => {
      if (!val) {
        alert.value.debug && MessagePlugin.close(alert.value.debug);
        alert.value.debug = null;
        return;
      }

      if (!alert.value.debug) {
        alert.value.debug = MessagePlugin.warning({
          content: t('common.alert.debugModuleConflict'),
          duration: 0,
          closeBtn: true,
        });
      }
    },
    { immediate: true },
  );

  if (!isNil(siteData.value?.id)) await connectLogger();
};

const deactivateDispose = () => {
  debugWatchStop.value?.();
  debugWatchStop.value = null;

  alert.value.debug && MessagePlugin.close(alert.value.debug);
  alert.value.debug = null;

  disconnectLogger();
};

const createSiteDoc = (type: ISiteType) => ({
  name: DEBUG_PREFIX,
  key: DEBUG_PREFIX,
  type,
  api: SITE_DIFF_DEBUG_MAP[type].api,
  search: true,
  playUrl: '',
  group: DEBUG_PREFIX,
  category: '',
  ext: SITE_DIFF_DEBUG_MAP[type].ext,
});

const saveSiteData = async () => {
  try {
    const type = active.value.type;
    const uuid = siteData.value.id;

    const doc = createSiteDoc(type);

    const resp = isNil(uuid) ? await addSite(doc) : await putSite({ id: [uuid], doc });
    if (isArray(resp) && !isArrayEmpty(resp) && !isNil(resp[0]?.id)) {
      siteData.value = resp[0];
    } else {
      siteData.value = {};
    }
  } catch (error) {
    console.error('Save site Data Error:', error);
    siteData.value = {};
  }
};

const getSiteData = async () => {
  try {
    const resp = await fetchSiteDetailByKey(DEBUG_PREFIX);

    const site = isNil(resp?.id) ? await saveSiteData() : resp;
    siteData.value = site;
  } catch (error) {
    console.error('Fail to get site data', error);
    siteData.value = {};
  }
};

const saveSiteAndWriteFileData = async () => {
  const code = editText.value.code;
  const type = active.value.type;
  const uuid = siteData.value.id;

  if (!isNil(uuid) && isString(code) && !isStrEmpty(code)) {
    await writeFile(type, code, 'silence');
    await saveSiteData();
  }
};
const throttleSaveSiteAndWriteFileData = throttle(saveSiteAndWriteFileData, 3000, { edges: ['leading', 'trailing'] });

// operations
const handleOpTypeChange = async () => {
  const type = active.value.type;
  nextTick(() => (codeEditConf.value.language = SITE_MONACO_MAP[type].language));

  await saveSiteData();
  await connectLogger();
};

const handleOpInitMode = () => {
  active.value.init = !active.value.init;
};

const handleOpMatchTemplate = async () => {
  try {
    const type = active.value.type;

    const resp = await fetchEditTemplates(type);

    templateNameList.value = resp;
    active.value.templateDialog = true;
  } catch (error) {
    console.error('Fail to get templates', error);

    templateNameList.value = [];
    active.value.templateDialog = true;
  }
};

const handleOpConfirmTemplate = async (doc: typeof templateFormData.value) => {
  try {
    const type = active.value.type;
    const templateName = doc.template;

    const resp = await fetchEditTemplateDetail(type, templateName);
    editText.value.code = isJson(resp) ? JSON.stringify(resp, null, 2) : resp;

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error('Fail to confirm template', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    active.value.templateDialog = false;
  }
};

const handleOpOpenFolder = async () => {
  try {
    const type = active.value.type;

    await openFolder(type);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error('Fail to open folder', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleOpImportFile = async () => {
  try {
    const type = active.value.type;

    const fileContent = await readFile(type, 'dialog');
    editText.value.code = fileContent;

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error('Fail to import file', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleOpExportFile = async () => {
  try {
    const type = active.value.type;
    const content = editText.value.code;

    if (!isString(content) || isStrEmpty(content)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    const writeStatus = await writeFile(type, content, 'dialog');

    writeStatus ? MessagePlugin.success(t('common.success')) : MessagePlugin.warning(t('common.fail'));
  } catch (error) {
    console.error('Fail to export file', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleOpDecode = async () => {
  try {
    const type = active.value.type;
    const content = editText.value.code;

    if (!isString(content) || isStrEmpty(content)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    const resp = await fetchEditDecrypt(type, content);

    if (isString(resp) && !isStrEmpty(resp)) {
      editText.value.code = resp;
      MessagePlugin.success(t('common.success'));
    } else {
      MessagePlugin.warning(t('common.fail'));
    }
  } catch (error) {
    console.error('Fail to decode', error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const handleOpDebug = async () => {
  try {
    const content = editText.value.code;
    const uuid = siteData.value.id;

    if (!isString(content) || isStrEmpty(content)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    await saveSiteData();
    await putSiteDefault(uuid);

    emitter.emit(emitterChannel.REFRESH_FILM_CONFIG, { source: emitterSource.PAGE_DEBUG });
    router.push({ name: 'Film' });

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error('Fail to debug', error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  }
};

const handleOpHelp = () => {
  active.value.helpDialog = true;
};

const handleOpChange = (val: string) => {
  const handlers = {
    template: handleOpMatchTemplate,
    'file:openFolder': handleOpOpenFolder,
    'file:import': handleOpImportFile,
    'file:export': handleOpExportFile,
    decode: handleOpDecode,
    debug: handleOpDebug,
    help: handleOpHelp,
  };

  handlers?.[val]?.();
};

// editor
const handleEditorDrop = (type: 'code' | 'html', e: DragEvent) => {
  e.preventDefault();

  const file = e.dataTransfer?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      editText.value[type] = content;
    };
    reader.readAsText(file);
  }
};

const handleEditorObject = (monaco: IEditor) => {
  const type = active.value.type;
  const { language, extraLib, suggestions } = SITE_MONACO_MAP[type] as {
    language: IEditorLang;
    extraLib?: string | null;
    suggestions?: any | null;
  };

  if (!isNil(suggestions)) applymSuggestions(monaco, language, suggestions);
  if (!isNil(extraLib)) applyExtraLib(monaco, language, extraLib);
};

// dom
const onReqResponse = (resp: IReqResponse) => {
  active.value.editor = 'html';
  editText.value.html = resp.data;
};

const handleDomDebugPdfa = async () => {
  domLoading.value.pdfa = true;
  try {
    const rule = domFormData.value.pdfa;
    const html = editText.value.html;

    if (!isString(rule) || isStrEmpty(rule)) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['pdfa']));
      return;
    }

    if (!isString(html) || isStrEmpty(html)) {
      MessagePlugin.warning(t('pages.lab.edit.message.htmlNoData'));
      return;
    }

    const resp = await fetchEditDomPdfa({ html, rule });
    logger('testResult', `<Dom>Pdfa: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Dom>Pdfa: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    domLoading.value.pdfa = false;
  }
};

const handleDomDebugPdfh = async () => {
  domLoading.value.pdfh = true;
  try {
    const rule = domFormData.value.pdfh;
    const html = editText.value.html;

    if (!isString(rule) || isStrEmpty(rule)) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['pdfh']));
      return;
    }

    if (!isString(html) || isStrEmpty(html)) {
      MessagePlugin.warning(t('pages.lab.edit.message.htmlNoData'));
      return;
    }

    const resp = await fetchEditDomPdfh({ html, rule });
    logger('testResult', `<Dom>Pdfh: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Dom>Pdfh: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    domLoading.value.pdfh = false;
  }
};

// data
const handleDataDebugInit = async () => {
  dataLoading.value.init = true;
  try {
    const uuid = siteData.value.id;
    const code = editText.value.code;

    if (!isString(code) || isStrEmpty(code)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    await saveSiteAndWriteFileData();

    const resp = await fetchCmsInit({ uuid, force: true });
    logger('testResult', `<Data>Init: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>Init: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.init = false;
  }
};

const handleDataDebugHome = async () => {
  dataLoading.value.home = true;
  try {
    const uuid = siteData.value.id;
    const code = editText.value.code;

    if (!isString(code) || isStrEmpty(code)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    const resp = await fetchCmsHome({ uuid });
    logger('testResult', `<Data>Home: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>Home: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.home = false;
  }
};

const handleDataDebugHomeVod = async () => {
  dataLoading.value.homeVod = true;
  try {
    const uuid = siteData.value.id;
    const code = editText.value.code;

    if (!isString(code) || isStrEmpty(code)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    const resp = await fetchCmsHomeVod({ uuid });
    logger('testResult', `<Data>HomeVod: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>HomeVod: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.homeVod = false;
  }
};

const handleDataDebugCategory = async () => {
  dataLoading.value.category = true;
  try {
    const { tid, filter = '{}', page = 1 } = dataFormData.value.category;
    const uuid = siteData.value.id;
    const code = editText.value.code;

    if (!isString(code) || isStrEmpty(code)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    if (!(isString(tid) && !isStrEmpty(tid)) && !isNumber(tid)) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['tid']));
      return;
    }

    if (!isString(filter) || isStrEmpty(filter)) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['filter']));
      return;
    } else if (!isJsonStr(filter)) {
      MessagePlugin.warning(t('common.message.errRequiredParam', ['filter']));
      return;
    }

    const resp = await fetchCmsCategory({ uuid, tid, page, extend: JSON.stringify(JSON5.parse(filter)) });
    logger('testResult', `<Data>Category: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>Category: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.category = false;
  }
};

const handleDataDebugDetail = async () => {
  dataLoading.value.detail = true;
  try {
    const { ids } = dataFormData.value.detail;
    const uuid = siteData.value.id;
    const code = editText.value.code;

    if (!isString(code) || isStrEmpty(code)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    if (!(isString(ids) && !isStrEmpty(ids))) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['ids']));
      return;
    }

    const resp = await fetchCmsDetail({ uuid, ids });
    logger('testResult', `<Data>Detail: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>Detail: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.detail = false;
  }
};

const handleDataDebugSearch = async () => {
  dataLoading.value.search = true;
  try {
    const { wd, page = 1 } = dataFormData.value.search;
    const uuid = siteData.value.id;
    const code = editText.value.code;

    if (!isString(code) || isStrEmpty(code)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    if (!(isString(wd) && !isStrEmpty(wd))) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['wd']));
      return;
    }

    const resp = await fetchCmsSearch({ uuid, wd, page });
    logger('testResult', `<Data>Search: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>Search: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.search = false;
  }
};

const handleDataDebugPlay = async () => {
  dataLoading.value.play = true;
  try {
    const { flag, play } = dataFormData.value.play;
    const uuid = siteData.value.id;
    const code = editText.value.code;

    if (!isString(code) || isStrEmpty(code)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    if (!(isString(flag) && !isStrEmpty(flag))) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['flag']));

      return;
    }

    if (!(isString(play) && !isStrEmpty(play))) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['play']));
      return;
    }

    const resp = await fetchCmsPlay({ uuid, flag, play });
    logger('testResult', `<Data>Play: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>Play: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.play = false;
  }
};

const handleDataDebugProxy = async () => {
  dataLoading.value.proxy = true;
  try {
    const { url } = dataFormData.value.proxy;
    const uuid = siteData.value.id;
    const code = editText.value.code;

    if (!isString(code) || isStrEmpty(code)) {
      MessagePlugin.warning(t('pages.lab.edit.message.codeNoData'));
      return;
    }

    if (!isString(url) || isStrEmpty(url)) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['url']));
      return;
    } else if (!isHttp(url) || !url.startsWith('http://127.0.0.1:9978/')) {
      MessagePlugin.warning(t('common.message.errRequiredParam', ['url']));
      return;
    }

    const params = Object.fromEntries(new URL(url).searchParams);

    const resp = await fetchCmsProxy({ uuid, ...params });
    logger('testResult', `<Data>Proxy: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>Proxy: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.proxy = false;
  }
};

const handleDataDebugProxyUpload = async () => {
  dataLoading.value.proxyUpload = true;
  try {
    const { upload = [], url } = dataFormData.value.proxy;

    if (!isString(url) || isStrEmpty(url)) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['url']));
      return;
    } else if (!isHttp(url) || !url.startsWith('http://127.0.0.1:9978/')) {
      MessagePlugin.warning(t('common.message.errRequiredParam', ['url']));
      return;
    }

    if (!isJsonStr(upload)) {
      MessagePlugin.warning(t('common.message.noRequiredParam', ['upload']));
      return;
    } else if (JSON5.parse(upload as string).length !== 3) {
      MessagePlugin.warning(t('common.message.errRequiredParam', ['upload']));
      return;
    }

    const params = Object.fromEntries(new URL(url).searchParams);
    await setProxy({ text: JSON5.parse(upload as string), url: params.url });

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error(`[data]proxyUpload: ${toHMS()} > ${error}`);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    dataLoading.value.proxyUpload = false;
  }
};

// output

const logger = (type: typeof active.value.output, prefix: string, level: ITerminalLog, text: unknown) => {
  const printRef = type === 'logger' ? loggerRef.value : type === 'testResult' ? testResultRef.value : null;
  if (!printRef) return;

  if (text instanceof Error) {
    level = 'error';
    text = text.message;
  }

  printRef?.write(text, level, true, prefix);
};

const handleOutputClear = () => {
  try {
    console.clear();

    loggerRef.value?.clear();
    testResultRef.value?.clear();

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error('Fail to clear output', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleOutputChange = (type: typeof active.value.output) => {
  active.value.output = type;
};

const connectLogger = async () => {
  try {
    disconnectLogger();

    const type = active.value.type;
    const resp = await SITE_LOG_MAP[type](logger)!;

    if (isNil(resp)) {
      active.value.supportLogger = false;
      MessagePlugin.warning(t('component.terminal.logger.message.noSupport'));
      return;
    }

    if (!isNil(resp.abort)) {
      loggerAbortController.value = resp.abort;
      MessagePlugin.success(t('component.terminal.logger.message.success'));
    } else {
      loggerAbortController.value = null;
      MessagePlugin.warning(t('component.terminal.logger.message.fail'));
    }
    active.value.supportLogger = true;
  } catch (error) {
    loggerAbortController.value = null;
    active.value.supportLogger = true;
    console.error('Connect logger module error:', error);
    logger('logger', `<Logger>${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('component.terminal.logger.message.error')}: ${(error as Error).message}`);
  }
};

const disconnectLogger = () => {
  try {
    if (loggerAbortController.value) {
      loggerAbortController.value();
    }
  } catch {}
  loggerAbortController.value = null;
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
    align-items: center;
    flex-direction: row;
    justify-content: space-between;

    .left-operation-container {
      display: flex;
      align-items: center;
      flex-direction: row;
      gap: var(--td-size-4);

      .adapter {
        width: fit-content;
      }

      .init {
        padding: 0 var(--td-comp-paddingLR-xs);
      }
    }

    .right-operation-container {
      display: flex;
      align-items: center;
      flex-direction: row;
    }
  }

  .content {
    flex: 1;
    border-radius: var(--td-radius-medium);
    overflow: hidden;

    .editor-pane {
      height: 100%;

      .editor-pane-code,
      .editor-pane-html {
        height: 100%;
        border-top: 2px solid var(--td-bg-color-component);
      }
    }

    .action-pane {
      height: 100%;

      .action-pane-dom,
      .action-pane-data {
        display: flex;
        flex-direction: column;
        gap: var(--td-size-4);
        padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-xs);
        overflow: auto hidden;
        height: 100%;
      }

      .action-item {
        display: flex;
        flex-direction: column;
        gap: var(--td-size-4);

        .input-number-item {
          width: 100%;
        }
      }

      .action-base {
        flex-direction: row;
      }
    }

    .output-pane {
      height: 100%;
      background-color: var(--td-bg-color-component);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .output-header {
        flex: 0;
        height: calc(var(--td-comp-size-m) + var(--td-comp-paddingLR-xxs));
        width: 100%;
        padding: 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-xxs);
        display: flex;
        justify-content: space-between;
        gap: var(--td-size-4);

        .output-header-left {
          flex: 1 1 auto;
          height: var(--td-comp-size-m);
        }

        .output-header-right {
          flex: 0 0 auto;
          height: var(--td-comp-size-m);
          display: flex;
          align-items: center;
          gap: var(--td-size-4);

          .output-reconnect,
          .output-clear {
            cursor: pointer;
            color: var(--td-text-color-secondary);

            &:hover {
              color: var(--td-text-color-primary);
            }
          }
        }
      }

      .output-content {
        flex: 1 1 auto;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
    }
  }
}

:deep(.t-tabs) {
  height: 100%;

  .t-tabs__nav-item.t-size-m {
    height: var(--td-comp-size-m);
    line-height: var(--td-comp-size-m);
  }

  .t-tabs__nav--card {
    background-color: var(--td-bg-color-secondarycontainer);

    &.t-tabs__nav-item {
      border-color: transparent;

      --ripple-color: transparent;

      &.t-is-active {
        border-color: var(--td-bg-color-secondarycontainer);
        border-bottom-color: transparent;
        border-radius: var(--td-radius-medium) var(--td-radius-medium) 0 0;
        color: var(--td-text-color-primary);
        background-color: var(--td-bg-color-component);

        &:first-of-type {
          border-right: 1px solid var(--td-bg-color-secondarycontainer);
          border-top-left-radius: 0;
        }

        &:last-of-type {
          border-right: 1px solid var(--td-bg-color-secondarycontainer);
        }

        &:not(:first-of-type) {
          border-left: 1px solid var(--td-bg-color-secondarycontainer);
        }
      }

      &:not(.t-is-disabled, .t-is-active):hover {
        background-color: transparent;
      }
    }
  }

  .t-tabs__content {
    background-color: transparent;
    height: calc(100% - var(--td-comp-size-m));
    width: 100%;
    overflow: hidden;

    .t-tab-panel {
      height: 100%;
      width: 100%;
    }
  }

  &.pane-right {
    .t-tabs__content {
      border-right: 2px solid var(--td-bg-color-component);
    }
  }
}
</style>
