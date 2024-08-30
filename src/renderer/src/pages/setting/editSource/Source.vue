<template>
  <div class="lab-source view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.setting.editSource.source.title') }}</h3>
      </div>
      <div class="right-operation-container">
        <div class="component-op">
          <div class="item" @click="showTemplateDialog()">
            <extension-icon />
            <span>{{ $t('pages.setting.editSource.source.template') }}</span>
          </div>
          <div class="item item-pad-select">
            <file-icon />
            <t-select v-model="tmp.file" @change="fileEvent()">
              <t-option :label="$t('pages.setting.editSource.source.import')" value="import" @click="importFileEvent" />
              <t-option :label="$t('pages.setting.editSource.source.export')" value="export" @click="exportFileEvent" />
              <t-option :label="$t('pages.setting.editSource.source.cache')" value="cache" @click="cacheEvent" />
              <t-option :label="$t('pages.setting.editSource.source.encode')" value="encode" @click="encodeEvent" />
              <t-option :label="$t('pages.setting.editSource.source.decode')" value="decode" @click="decodeEvent" />
            </t-select>
          </div>
          <div class="item item-pad-select">
            <bug-icon />
            <t-select v-model="tmp.run" @change="fileEvent()">
              <t-option :label="$t('pages.setting.editSource.source.bug')" value="bug" @click="debugEvent" />
              <t-option
                :label="$t('pages.setting.editSource.source.delete')"
                value="expdeleteodeletert"
                @click="deleteEvent"
              />
              <t-option :label="$t('pages.setting.editSource.source.file')" value="file" @click="serverEvent" />
            </t-select>
          </div>
          <div class="item item-pad-select">
            <help-rectangle-icon />
            <t-select v-model="tmp.other" @change="fileEvent()">
              <t-option key="ai" :label="$t('pages.setting.editSource.source.ai')" value="ai" @click="aiEvent" />
              <!-- <t-option key="tool" :label="$t('pages.setting.editSource.source.tool')" value="tool" @click.stop="toolEvent" /> -->
              <t-option key="doc" :label="$t('pages.setting.editSource.source.doc')" value="doc" @click="helpEvent" />
              <t-option
                key="sift"
                :label="$t('pages.setting.editSource.source.sift')"
                value="sift"
                @click="siftEvent('Sift')"
              />
            </t-select>
          </div>

          <t-dialog
            v-model:visible="isVisible.template"
            :header="$t('pages.setting.editSource.source.template')"
            show-in-attached-element
            width="40%"
            @confirm="confirmTemplate()"
          >
            <p>{{ $t('pages.setting.editSource.source.templateTip') }}</p>
            <t-select v-model="form.template">
              <t-option v-for="item in templates" :key="item.label" :value="item.value" :label="item.label" />
            </t-select>
          </t-dialog>
          <t-dialog
            v-model:visible="isVisible.encode"
            :header="$t('pages.setting.editSource.source.encode')"
            show-in-attached-element
            width="40%"
            @confirm="confirmEncode()"
          >
            <p>{{ $t('pages.setting.editSource.source.encodeTip') }}</p>
            <t-select v-model="form.encodeMethod">
              <t-option value="gzip" label="gzip" />
              <t-option value="base64" label="base64" />
              <t-option value="aes" label="aes" />
              <t-option value="rsa" label="rsa" />
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
                      $t('pages.setting.editSource.source.action.source')
                    }}</t-button>
                  </template>
                  <div class="input-container">
                    <t-input
                      v-model="form.req.url"
                      :placeholder="$t('pages.setting.placeholder.general')"
                      class="input"
                    />
                    <div class="method" @click="showDialog('reqParam')">
                      <transform-icon />
                    </div>
                  </div>
                </t-input-adornment>
                <t-dialog
                  v-model:visible="isVisible.reqParam"
                  placement="center"
                  :header="$t('pages.setting.editSource.source.dialog.request.title')"
                  :cancel-btn="$t('pages.setting.editSource.source.dialog.request.cancel')"
                  show-in-attached-element
                  @confirm="isVisible.reqParam = false"
                  @cancel="reqCancel()"
                >
                  <div class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.source.dialog.request.reqEncode') }}</p>
                    <t-select v-model="form.req.encode">
                      <t-option v-for="item in reqEncode" :key="item.value" :value="item.value" :label="item.label" />
                    </t-select>
                  </div>
                  <div class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.source.dialog.request.reqHeader') }}</p>
                    <t-textarea v-model="form.req.header" placeholder='{ "User-Agent": "Mozilla/5.0 zyplayer" }' />
                  </div>
                  <div v-if="form.req.method !== 'GET'" class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.source.dialog.request.reqBody') }}</p>
                    <t-select v-model="form.req.contentType" class="contentType" style="margin-bottom: 5px">
                      <t-option
                        v-for="item in reqContentTypes"
                        :key="item.label"
                        :value="item.value"
                        :label="item.label"
                      />
                    </t-select>
                    <t-textarea v-model="form.req.body" placeholder='{ "key": "01b9b7" }' />
                  </div>
                </t-dialog>
              </div>
            </div>
            <div class="code-op-item">
              <t-input-adornment :prepend="$t('pages.setting.editSource.source.rule.pdfa')">
                <template #append>
                  <t-button theme="default" @click="actionRule('pdfa')">
                    {{ $t('pages.setting.editSource.source.rule.try') }}
                  </t-button>
                </template>
                <t-input v-model="form.rule.pdfa" :placeholder="$t('pages.setting.placeholder.pdfaTip')" />
              </t-input-adornment>
            </div>
            <div class="code-op-item">
              <t-input-adornment :prepend="$t('pages.setting.editSource.source.rule.pdfh')">
                <template #append>
                  <t-button theme="default" @click="actionRule('pdfh')">
                    {{ $t('pages.setting.editSource.source.rule.try') }}
                  </t-button>
                </template>
                <t-input v-model="form.rule.pdfh" :placeholder="$t('pages.setting.placeholder.pdfhTip')" />
              </t-input-adornment>
            </div>
            <div class="code-op-item">
              <div class="item sniffer">
                <t-input-adornment :prepend="$t('pages.setting.editSource.source.rule.url')">
                  <template #append>
                    <t-button class="button w-btn" theme="default" @click="actionSniffer()">{{
                      $t('pages.setting.editSource.source.action.sniffer')
                    }}</t-button>
                  </template>
                  <div class="input-container">
                    <t-input
                      v-model="form.sniffer.url"
                      :placeholder="$t('pages.setting.placeholder.general')"
                      class="input"
                    />
                    <div class="method" @click="showDialog('snifferParam')">
                      <transform-icon />
                    </div>
                  </div>
                </t-input-adornment>
                <t-dialog
                  v-model:visible="isVisible.snifferParam"
                  placement="center"
                  :header="$t('pages.setting.editSource.source.dialog.sniffer.title')"
                  :cancel-btn="$t('pages.setting.editSource.source.dialog.sniffer.cancel')"
                  show-in-attached-element
                  @confirm="isVisible.snifferParam = false"
                  @cancel="snifferCancel()"
                >
                  <!-- <div class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.source.dialog.sniffer.ua') }}</p>
                    <t-input v-model="form.sniffer.ua" :placeholder="$t('pages.setting.placeholder.general')" />
                  </div> -->
                  <div class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.source.dialog.sniffer.auxiliaryRegex') }}</p>
                    <t-input
                      v-model="form.sniffer.auxiliaryRegex"
                      :placeholder="$t('pages.setting.placeholder.general')"
                    />
                  </div>
                  <div class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.source.dialog.sniffer.initScript') }}</p>
                    <t-textarea
                      v-model="form.sniffer.initScript"
                      :placeholder="$t('pages.setting.placeholder.general')"
                    />
                  </div>
                  <data class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.source.dialog.sniffer.runScript') }}</p>
                    <t-textarea
                      v-model="form.sniffer.runScript"
                      :placeholder="$t('pages.setting.placeholder.general')"
                    />
                  </data>
                </t-dialog>
              </div>
            </div>
          </div>
          <t-collapse>
            <t-collapse-panel :header="$t('pages.setting.editSource.source.bar.title')">
              <div class="code-bar">
                <div class="item theme">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.source.bar.theme') }}</span>
                  <t-select v-model="config.theme" auto-width @change="changeTheme()">
                    <t-option v-for="item in themes" :key="item.label" :value="item.value" :label="item.label" />
                  </t-select>
                </div>

                <div class="item language">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.source.bar.language') }}</span>
                  <t-select v-model="config.language" auto-width @change="changeLanguage()">
                    <t-option v-for="item in languages" :key="item.label" :value="item.label" :label="item.label" />
                  </t-select>
                </div>

                <div class="item eol">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.source.bar.eol') }}</span>
                  <t-select v-model="config.eol" auto-width @change="changeEOL()">
                    <t-option v-for="item in eols" :key="item.label" :value="item.value" :label="item.label" />
                  </t-select>
                </div>

                <div class="item wordWrap">
                  <span class="codebox-label">{{ $t('pages.setting.editSource.source.bar.wordWrap') }}</span>
                  <t-select v-model="config.wordWrap" auto-width @change="changeWarp()">
                    <t-option :label="$t('pages.setting.editSource.source.bar.enable')" value="on" />
                    <t-option :label="$t('pages.setting.editSource.source.bar.disable')" value="off" />
                  </t-select>
                </div>
              </div>
            </t-collapse-panel>
          </t-collapse>
          <div class="code-box" id="codeBox" ref="sourceCodeBoxRef" @drop.prevent="handleDrop" @dragover.prevent></div>
        </div>
      </div>
      <div class="right">
        <div class="action">
          <div class="item">
            <t-button class="button init" theme="default" @click="actionInit">
              <div class="status">
                <span class="title">{{ $t('pages.setting.editSource.source.action.init') }}</span>
                <span class="desc"
                  >{{ $t('pages.setting.editSource.source.action.initStatus') }}:
                  {{
                    form.init.auto
                      ? $t('pages.setting.editSource.source.action.initAuto')
                      : $t('pages.setting.editSource.source.action.initManual')
                  }}</span
                >
              </div>
              <div class="click" @click.stop="form.init.auto = !form.init.auto">
                <gesture-click-icon />
              </div>
            </t-button>
            <t-button class="button" theme="default" @click="actionHome">{{
              $t('pages.setting.editSource.source.action.classify')
            }}</t-button>
            <t-button class="button" theme="default" @click="actionHomeVod">{{
              $t('pages.setting.editSource.source.action.home')
            }}</t-button>
          </div>
          <div class="item">
            <t-input
              v-model="form.category.t"
              :label="$t('pages.setting.editSource.source.rule.t')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-33-30%"
            />
            <t-input
              v-model="form.category.f"
              :label="$t('pages.setting.editSource.source.rule.f')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-33-40%"
            />
            <t-input-number
              theme="column"
              :min="0"
              v-model="form.category.pg"
              :label="$t('pages.setting.editSource.source.rule.pg')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-33-30%"
            />
            <t-button class="button w-btn" theme="default" @click="actionList()">{{
              $t('pages.setting.editSource.source.action.list')
            }}</t-button>
          </div>
          <div class="item">
            <t-input
              v-model="form.detail.ids"
              :label="$t('pages.setting.editSource.source.rule.ids')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-100%"
            />
            <t-button class="button w-btn" theme="default" @click="actionDetail()">{{
              $t('pages.setting.editSource.source.action.detail')
            }}</t-button>
          </div>
          <div class="item">
            <t-input
              v-model="form.search.wd"
              :label="$t('pages.setting.editSource.source.rule.wd')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-50-70%"
            />
            <t-input-number
              theme="column"
              :min="0"
              v-model="form.search.pg"
              :label="$t('pages.setting.editSource.source.rule.pg')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-50-30%"
            />
            <t-button class="button w-btn" theme="default" @click="actionSearch()">{{
              $t('pages.setting.editSource.source.action.search')
            }}</t-button>
          </div>
          <div class="item">
            <t-input
              v-model="form.play.flag"
              :label="$t('pages.setting.editSource.source.rule.flag')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-50-30%"
            />
            <t-input
              v-model="form.play.play"
              :label="$t('pages.setting.editSource.source.rule.play')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-50-70%"
            />
            <t-button class="button w-btn" theme="default" @click="actionPlay()">{{
              $t('pages.setting.editSource.source.action.play')
            }}</t-button>
          </div>
          <div class="item">
            <t-input
              v-model="form.proxy.url"
              :label="$t('pages.setting.editSource.source.rule.url')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-100%"
            />
            <t-button class="button w-btn" theme="default" @click="actionProxy()">{{
              $t('pages.setting.editSource.source.action.proxy')
            }}</t-button>
          </div>
          <div class="item">
            <t-input
              v-model="form.player.url"
              :label="$t('pages.setting.editSource.source.rule.url')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-100%"
            />
            <t-button class="button w-btn" theme="default" @click="actionPlayer()">{{
              $t('pages.setting.editSource.source.action.player')
            }}</t-button>
          </div>
        </div>
        <div class="log-container">
          <div class="log-nav">
            <div class="nav-left">
              <t-radio-group variant="default-filled" size="small" v-model="form.nav" @change="changeNav()">
                <t-radio-button value="debug">{{ $t('pages.setting.editSource.source.select.debug') }}</t-radio-button>
                <t-radio-button value="source">{{
                  $t('pages.setting.editSource.source.select.source')
                }}</t-radio-button>
                <t-radio-button value="rule">{{ $t('pages.setting.editSource.source.select.rule') }}</t-radio-button>
                <t-radio-button value="log">{{ $t('pages.setting.editSource.source.select.log') }}</t-radio-button>
              </t-radio-group>
            </div>
            <div class="nav-right">
              <t-radio-group
                variant="default-filled"
                size="small"
                v-model="form.clickType.log"
                @change="logEvent()"
                v-if="form.nav === 'log'"
              >
                <t-radio-button value="f12">{{ $t('pages.setting.editSource.source.select.f12') }}</t-radio-button>
                <t-radio-button value="clear">{{ $t('pages.setting.editSource.source.select.clear') }}</t-radio-button>
              </t-radio-group>
              <t-radio-group
                variant="default-filled"
                size="small"
                v-model="form.clickType.proxy"
                @change="proxyEvent()"
                v-if="form.nav === 'debug' && form.action === 'proxy'"
              >
                <t-radio-button value="upload">{{
                  $t('pages.setting.editSource.source.select.upload')
                }}</t-radio-button>
                <t-radio-button value="play">{{ $t('pages.setting.editSource.source.select.play') }}</t-radio-button>
                <t-radio-button value="copy">{{ $t('pages.setting.editSource.source.select.copy') }}</t-radio-button>
              </t-radio-group>
              <t-radio-group
                variant="default-filled"
                size="small"
                v-model="form.clickType.source"
                @change="sourceEvent()"
                v-if="form.nav === 'source'"
              >
                <t-radio-button value="format">{{
                  $t('pages.setting.editSource.source.select.format')
                }}</t-radio-button>
                <t-radio-button value="reset">{{ $t('pages.setting.editSource.source.select.reset') }}</t-radio-button>
              </t-radio-group>
            </div>
          </div>
          <div class="log-text">
            <div class="log-box" id="logBox" ref="sourceLogBoxRef"></div>
          </div>
        </div>
      </div>
    </div>

    <dialog-player-view v-model:visible="isVisible.player" :url="formDialog.player.url" />
    <dialog-ai-view v-model:visible="isVisible.ai" />
    <!-- <dialog-tool-view v-model:visible="isVisible.tool" /> -->
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import * as monaco from 'monaco-editor';
import jsBeautify from 'js-beautify';
import JSON5 from 'json5';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  BugIcon,
  ExtensionIcon,
  HelpRectangleIcon,
  FileIcon,
  GestureClickIcon,
  TransformIcon,
} from 'tdesign-icons-vue-next';

import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import dialogPlayerView from './components/DialogPlayer.vue';
import dialogAiView from './components/DialogAi.vue';
// import dialogToolView from './components/DialogTool.vue';

import { t } from '@/locales';
import { useSettingStore, usePlayStore } from '@/store';

import { setT3Proxy } from '@/api/proxy';
import { fetchDebugSource, setDebugSource, delDebugSource } from '@/api/lab';
import emitter from '@/utils/emitter';
import { getHtml, copyToClipboardApi, encodeBase64 } from '@/utils/tool';
import { getMubans } from '@/utils/drpy/template';
import { doWork as t3Work } from '@/utils/drpy/index';
import { encryptJs, getOriginalJs } from '@/utils/drpy/drpy3';
import sniffer from '@/utils/sniffer';
import { pdfh, pdfa } from '@/utils/drpy/drpyInject';
import { createDependencyProposals } from '@/utils/drpy/drpy_suggestions/drpy_suggestions';
import drpyObjectInner from '@/utils/drpy/drpy_suggestions/drpy_object_inner.ts?raw';

const remote = window.require('@electron/remote');
const router = useRouter();
const storeSetting = useSettingStore();
const storePlayer = usePlayStore();

const systemTheme = computed(() => {
  return storeSetting.displayMode;
});

const sourceCodeBoxRef = ref<HTMLElement | null>(null);
const sourceLogBoxRef = ref<HTMLElement | null>(null);
let form = ref({
  codeType: 'html',
  encodeMethod: 'base64',
  content: {
    edit: '',
    log: '',
    text: '',
    debug: '',
    source: '',
    rule: '',
  },
  rule: {
    type: '',
    pdfa: '',
    pdfh: '',
  },
  template: 'mxpro',
  url: '',
  nav: 'debug',
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
  },
  player: {
    url: '',
  },
  log: {
    nav: '',
  },
  action: '',
  clickType: {
    log: '',
    proxy: '',
    source: '',
  },
  lastEditTime: {
    edit: 0,
    init: 0,
  },
  init: {
    auto: false,
  },
  sniffer: {
    url: '',
    initScript: '',
    runScript: '',
    ua: '',
    auxiliaryRegex: '',
  },
});

const tmp = computed(() => {
  return {
    file: t('pages.setting.editSource.source.fileManage'),
    run: t('pages.setting.editSource.source.run'),
    other: t('pages.setting.editSource.source.other'),
  };
});

const isVisible = reactive({
  template: false,
  encode: false,
  player: false,
  help: false,
  reqParam: false,
  snifferParam: false,
  ai: false,
  tool: false,
});

const formDialog = reactive({
  player: {
    url: '',
  },
});

watch(
  () => systemTheme.value,
  (val) => {
    config.theme = val === 'light' ? 'vs' : 'vs-dark';
    changeTheme();
  },
);

const emit = defineEmits(['changeComponent']);

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

const codeThemeKey = 'code-theme'; // localStorage key
const warpKey = 'code-warp'; // localStorage key

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
  },
];

const reqEncode = [
  {
    label: 'UTF-8',
    value: 'UTF-8',
  },
  {
    label: 'GB2312',
    value: 'GB2312',
  },
  {
    label: 'GBK',
    value: 'GBK',
  },
  {
    label: 'GB18030',
    value: 'GB18030',
  },
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
  },
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
  const keysAsObjects = Object.keys(dictionary).map((key) => ({ label: key, value: key }));
  return keysAsObjects;
});

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (editor) editor.setValue(content);
    };
    reader.readAsText(file);
  }
};

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

const confirmEncode = () => {
  try {
    const { edit } = form.value.content;
    const { encodeMethod } = form.value;

    const data = encryptJs(edit, encodeMethod);
    if (editor) editor.setValue(data);
    isVisible.encode = false;
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][confirmEncode][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const initEditor = () => {
  if (editor) editor.dispose();
  if (log) log.dispose();

  nextTick(() => {
    const codeBox = sourceCodeBoxRef.value;
    editor = monaco.editor.create(codeBox!, {
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
      fixedOverflowWidgets: true,
    });
    editor.onDidChangeModelContent(() => {
      if (editor) {
        form.value.content.edit = editor.getValue();
        form.value.lastEditTime.edit = moment().unix();
      }
    });

    // After onDidChangeModelContent
    editor.getModel()!.pushEOL(config.eol);

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
          suggestions: createDependencyProposals(monacoRange, monaco).map((proposal: any) => ({
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
    const logBox = sourceLogBoxRef.value;
    log = monaco.editor.create(logBox!, {
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
      fixedOverflowWidgets: true,
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
});

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
  const content = editor?.getValue() || '';
  if (!content.trim()) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.initNoData'));
    return;
  }

  let title = '';

  try {
    title =
      content
        .match(/title:(.*?),/)?.[1]
        .replace(/['"]/g, '')
        .trim() || 'source';
  } catch (error) {
    console.error('[EditSource][exportFileEvent][error] 文件名匹配错误', error);
    title = 'source';
  }

  try {
    await window.electron.ipcRenderer.send('tmpdir-manage', 'make', 'file/js');

    const userDataPath = await window.electron.ipcRenderer.invoke('read-path', 'userData');
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `file/js/${title}.js`);
    // const defaultPath = `${userDataPath}/file/js/${title}.js`;
    console.log(`[EditSource][exportFileEvent]path:${defaultPath}`);

    const { canceled, filePath } = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      defaultPath,
      filters: [
        { name: 'JavaScript Files', extensions: ['js'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!canceled) {
      const fs = remote.require('fs').promises;
      await fs.writeFile(filePath, content, 'utf-8');
      MessagePlugin.success(t('pages.setting.data.success'));
    }
  } catch (err) {
    console.log(`[setting][editSource][exportFileEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const debugEvent = async () => {
  try {
    const { rule, category, detail, search, play, proxy, player, content, init, sniffer, req } = form.value;
    const doc = {
      rule,
      category,
      detail,
      search,
      play,
      proxy,
      player,
      init,
      sniffer,
      req,
      content: content.edit,
    };

    if (!content.edit) {
      MessagePlugin.warning(t('pages.setting.editSource.source.message.initNoData'));
      return;
    } else {
      const res = await setDebugSource(doc);
      if (res) MessagePlugin.success(t('pages.setting.data.success'));
      emitter.emit('refreshFilmConfig');
      router.push({ name: 'FilmIndex' });
    }
  } catch (err) {
    console.log(`[setting][editSource][debugEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const siftEvent = (key) => {
  emit('changeComponent', key);
};

const cacheEvent = async () => {
  try {
    const res = await fetchDebugSource('all');
    const { rule, category, detail, search, play, proxy, player, content, init, sniffer, req } = res;
    if (editor) editor.setValue(content);
    Object.assign(form.value, {
      rule,
      category,
      detail,
      search,
      play,
      proxy,
      player,
      init,
      sniffer,
      req,
    });
    if (res) MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][cacheEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const decodeEvent = async () => {
  try {
    const { edit } = form.value.content;

    if (!edit) {
      MessagePlugin.warning(t('pages.setting.editSource.source.message.initNoData'));
      return;
    } else {
      const data = getOriginalJs(edit);
      if (editor) editor.setValue(data);
      MessagePlugin.success(t('pages.setting.data.success'));
    }
  } catch (err) {
    console.log(`[setting][editSource][decodeEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const encodeEvent = () => {
  const { edit } = form.value.content;

  if (!edit) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.initNoData'));
    return;
  } else {
    isVisible.encode = true;
  }
};

const deleteEvent = async () => {
  try {
    const res = await delDebugSource();
    if (res) MessagePlugin.success(t('pages.setting.data.success'));
    emitter.emit('refreshFilmConfig');
  } catch (err) {
    console.log(`[setting][editSource][deleteEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const fileEvent = async () => {
  tmp.value.file = t('pages.setting.editSource.source.fileManage');
  tmp.value.run = t('pages.setting.editSource.source.run');
  tmp.value.other = t('pages.setting.editSource.source.other');
};

const serverEvent = async () => {
  await window.electron.ipcRenderer.send('open-path', 'file', true);
};

const aiEvent = async () => {
  isVisible.ai = true;
};

const toolEvent = async () => {
  isVisible.tool = true;
};

const helpEvent = () => {
  window.electron.ipcRenderer.send(
    'open-url',
    'https://github.com/Hiram-Wong/ZyPlayer/wiki/%E5%86%99%E6%BA%90%E5%B7%A5%E5%85%B7',
  );
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
  }

  if (log) {
    monaco.editor.setModelLanguage(log.getModel()!, language);
    log.updateOptions({ readOnly });
    if (nav === 'log') {
      const res: any = await t3Work({ type: 'console', data: { type: 'get' } });
      form.value.content[nav] = res.data;
    }

    const contentText =
      typeof form.value.content[nav] === 'object'
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
      }
    }
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
    MessagePlugin.warning(t('pages.setting.editSource.source.message.ruleNoRule'));
    return;
  }
  if (!html) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.ruleNoHtml'));
    return;
  }

  try {
    let res;
    if (type === 'pdfa') {
      res = await pdfa(html, rule);
    } else if (type === 'pdfh') {
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
    MessagePlugin.warning(t('pages.setting.editSource.source.message.initNoData'));
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
    MessagePlugin.warning(t('pages.setting.editSource.source.message.listNoT'));
    return;
  }

  const data = {
    tid,
    pg: pg || 1,
    filter: f ? true : false,
    extend: f ? JSON5.parse(f) : {},
  };
  await performAction('category', data);
};

const actionDetail = async () => {
  const { ids } = form.value.detail;

  if (!ids) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.detailNoIds'));
    return;
  }

  await performAction('detail', ids);
};

const actionSearch = async () => {
  const { wd, pg } = form.value.search;

  if (!wd) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.searchNoWd'));
    return;
  }

  const data = {
    wd,
    quick: false,
    pg: pg || 1,
  };
  await performAction('search', data);
};

const actionPlay = async () => {
  const { flag, play } = form.value.play;

  if (!flag) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.playNoFlag'));
    return;
  }

  if (!play) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.playNoPlay'));
    return;
  }

  const data = {
    flag: flag,
    id: play,
    flags: [],
  };
  await performAction('play', data);
};

const actionProxy = async () => {
  let { url } = form.value.proxy;

  if (!url) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.proxyNoUrl'));
    return;
  }

  if (url && url.startsWith('http')) {
    if (!url.startsWith('http://127.0.0.1:9978/')) {
      const formatUrl = `http://127.0.0.1:9978/proxy?do=js&url=${url}`;
      form.value.proxy.url = formatUrl;
      url = formatUrl;
    }
    const formatUrl = new URL(url);
    const params = Object.fromEntries(formatUrl.searchParams.entries());
    await performAction('proxy', params);
  }
};

const actionPlayer = async (url = '') => {
  url = url ? url : form.value.player.url;

  if (!url) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.playerNoUrl'));
    return;
  }

  formDialog.player.url = url;
  isVisible.player = true;
};

const actionSniffer = async () => {
  try {
    const { snifferMode } = storePlayer.setting;
    let { url, runScript, initScript, auxiliaryRegex, ua } = form.value.sniffer;
    const snifferApi =
      snifferMode.type === 'custom' && /^http/.test(snifferMode.url)
        ? new URL(snifferMode.url).origin + new URL(snifferMode.url).pathname
        : '';

    if (runScript.trim()) runScript = encodeBase64(runScript);
    if (initScript.trim()) initScript = encodeBase64(initScript);
    const snifferPlayUrl = `${snifferApi}?url=${url}&script=${runScript}&init_script=${initScript}&custom_regex=${auxiliaryRegex}`;
    const response: any = await sniffer(snifferMode.type, snifferPlayUrl);
    form.value.content.debug = response;
    changeNav('debug', 'sniffer');
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.error('Error parsing header or body:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const getSource = async () => {
  let { url, method, encode, header, body, contentType } = form.value.req;
  header = header ? header : '{}';
  body = body ? body : '{}';

  if (!url) {
    MessagePlugin.warning(t('pages.setting.editSource.source.message.htmlNoUrl'));
    return;
  }

  try {
    const parsedHeader = JSON5.parse(header);
    let parsedBody = JSON5.parse(body);

    if (method !== 'GET' && parsedBody) {
      parsedHeader['Content-Type'] = contentType;
      if (contentType === 'application/x-www-form-urlencoded') {
        parsedBody instanceof URLSearchParams ? parsedBody : (parsedBody = new URLSearchParams(parsedBody));
      }
    }
    let parseHeaderKeys: string[];
    parseHeaderKeys = Object.keys(parsedHeader).map((it) => it.toLowerCase());
    if (!parseHeaderKeys.includes('accept')) {
      parsedHeader['accept'] = '*/*';
    }

    const response = await getHtml(url, method, encode, parsedHeader, parsedBody);

    form.value.content.source = response;
    changeNav('source', 'html');
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.error('Error parsing header or body:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const showDialog = (key: string) => {
  isVisible[key] = true;
};

const reqCancel = () => {
  nextTick(() => (isVisible.reqParam = true));
  form.value.req.header = '';
  form.value.req.body = '';
  form.value.req.encode = 'UTF-8';
  form.value.req.contentType = 'application/json';
};

const snifferCancel = () => {
  nextTick(() => (isVisible.snifferParam = true));
  form.value.sniffer.ua = '';
  form.value.sniffer.initScript = '';
  form.value.sniffer.runScript = '';
  form.value.sniffer.auxiliaryRegex = '';
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
    }
  } else if (type === 'clear') {
    await t3Work({ type: 'console', data: { type: 'clear' } });
    form.value.content.log = '';
    form.value.content.text = '';
    console.clear();
    if (log) log.setValue('');
  }

  form.value.clickType.log = '';
};

const proxyEvent = async () => {
  try {
    const type = form.value.clickType.proxy;
    const str: any = log ? log.getValue() : '';
    const formatStr = str
      .split('\n')
      .filter((s) => !!s.trim())
      .join('');
    const jsonStr = JSON5.parse(formatStr);

    if (type === 'copy') {
      await copyToClipboardApi(form.value.proxy.url);
    } else if (type === 'play') {
      actionPlayer(form.value.proxy.url);
    } else if (type === 'upload') {
      await setT3Proxy(jsonStr);
    }

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][proxyEvent][err]${err}`);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    form.value.clickType.proxy = '';
  }
};

const sourceEvent = () => {
  try {
    const type = form.value.clickType.source;
    const html = form.value.content.source;
    if (type === 'reset') {
      log?.setValue(html);
    } else if (type === 'format') {
      const formattedHtml: any = jsBeautify.html(html, {
        preserve_newlines: false,
      });
      log?.setValue(formattedHtml);
    }

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][sourceEvent][err]${err}`);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    form.value.clickType.source = '';
  }
};
</script>

<style lang="less" scoped>
.lab-source {
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
        margin-right: 5px;
      }
    }

    .right-operation-container {
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
              background-color: var(--td-bg-content-input-1) !important;
              border-color: transparent;
            }
          }
        }

        :deep(.t-collapse) {
          background-color: var(--td-bg-content-input-2);
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
            width: 100%;
            height: 100%;
            margin-top: var(--td-comp-paddingTB-m);
            border-radius: 0 0 var(--td-radius-default) var(--td-radius-default);
            overflow: hidden;
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

:deep(.code-toolbar) {
  height: 100%;
  border-radius: var(--td-radius-default);

  pre[class*='language-'] {
    margin: 0;
    height: 100%;
    box-shadow: none;
    padding: 1em 0.5em 0 3.8em;
    background-color: var(--td-bg-content-input-2);
  }

  .toolbar {
    padding-right: var(--td-comp-paddingTB-xxs);

    .toolbar-item {
      margin-right: var(--td-comp-margin-xs);
    }
  }
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

.help-box {
  height: 100%;
  width: 100%;
}

.help-dialog {
  :deep(.t-dialog__ctx .t-dialog__position.t-dialog--top) {
    padding: 0 !important;
  }
}

:deep(.monaco-editor) {
  --vscode-editorGutter-background: var(--td-bg-content-input-2);
  --vscode-editor-background: var(--td-bg-content-input-2);
  --vscode-editorStickyScroll-background: var(--td-bg-content-input-2);
  --vscode-editorStickyScroll-shadow: var(--td-bg-content-input-1);
  --vscode-scrollbar-shadow: var(--td-bg-content-input-1);
}
</style>
