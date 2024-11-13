<template>
  <div class="js-edit view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.jsEdit.title') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="template">{{ $t('pages.lab.jsEdit.template') }}</t-radio-button>
          <t-select v-model="tmp.file" @change="fileEvent()" auto-width>
            <t-option :label="$t('pages.lab.jsEdit.import')" value="import" @click="importFileEvent" />
            <t-option :label="$t('pages.lab.jsEdit.export')" value="export" @click="exportFileEvent" />
            <t-option :label="$t('pages.lab.jsEdit.decode')" value="decode" @click="decodeEvent" />
          </t-select>
          <t-radio-button value="debug">{{ $t('pages.lab.jsEdit.bug') }}</t-radio-button>
          <t-radio-button value="file">{{ $t('pages.lab.jsEdit.file') }}</t-radio-button>
          <t-radio-button value="doc">{{ $t('pages.lab.jsEdit.doc') }}</t-radio-button>
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
            <t-option v-for="item in templates" :key="item.label" :value="item.value" :label="item.label" />
          </t-select>
        </t-dialog>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <div class="edit">
          <div class="code-op">
            <div class="code-op-item">
              <div class="item source">
                <reqHtml class="item source" v-model:data="form.req" @source="htmlSourceEvent"/>
              </div>
            </div>
            <div class="code-op-item">
              <t-input-adornment :prepend="$t('pages.lab.jsEdit.rule.pdfa')">
                <template #append>
                  <t-button theme="default" @click="actionRule('pdfa')">
                    {{ $t('pages.lab.jsEdit.rule.try') }}
                  </t-button>
                </template>
                <t-input v-model="form.rule.pdfa" :placeholder="$t('pages.setting.placeholder.pdfaTip')" />
              </t-input-adornment>
            </div>
            <div class="code-op-item">
              <t-input-adornment :prepend="$t('pages.lab.jsEdit.rule.pdfh')">
                <template #append>
                  <t-button theme="default" @click="actionRule('pdfh')">
                    {{ $t('pages.lab.jsEdit.rule.try') }}
                  </t-button>
                </template>
                <t-input v-model="form.rule.pdfh" :placeholder="$t('pages.setting.placeholder.pdfhTip')" />
              </t-input-adornment>
            </div>
          </div>
          <code-editor
            v-model="form.content.edit"
            :options="codeEditConf"
            @drop.prevent="handleDrop"
            @monaco-object="handleMonacoObject"
            class="code-box"
          />
        </div>
      </div>
      <div class="right">
        <div class="action">
          <div class="item">
            <t-button class="button init" theme="default" @click="actionInit">
              <div class="status">
                <span class="title">{{ $t('pages.lab.jsEdit.action.init') }}</span>
                <span class="desc"
                  >{{ $t('pages.lab.jsEdit.action.initStatus') }}:
                  {{
                    form.init.auto
                      ? $t('pages.lab.jsEdit.action.initAuto')
                      : $t('pages.lab.jsEdit.action.initManual')
                  }}</span
                >
              </div>
              <div class="click" @click.stop="form.init.auto = !form.init.auto">
                <gesture-click-icon />
              </div>
            </t-button>
            <t-button class="button" theme="default" @click="actionHome">{{
              $t('pages.lab.jsEdit.action.classify')
            }}</t-button>
            <t-button class="button" theme="default" @click="actionHomeVod">{{
              $t('pages.lab.jsEdit.action.home')
            }}</t-button>
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
            <t-button class="button w-btn" theme="default" @click="actionCategory()">{{
              $t('pages.lab.jsEdit.action.list')
            }}</t-button>
          </div>
          <div class="item">
            <t-input
              v-model="form.detail.ids"
              :label="$t('pages.lab.jsEdit.rule.ids')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-100%"
            />
            <t-button class="button w-btn" theme="default" @click="actionDetail()">{{
              $t('pages.lab.jsEdit.action.detail')
            }}</t-button>
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
            <t-button class="button w-btn" theme="default" @click="actionSearch()">{{
              $t('pages.lab.jsEdit.action.search')
            }}</t-button>
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
            <t-button class="button w-btn" theme="default" @click="actionPlay()">{{
              $t('pages.lab.jsEdit.action.play')
            }}</t-button>
          </div>
          <div class="item">
            <t-input
              v-model="form.proxy.url"
              :label="$t('pages.lab.jsEdit.rule.url')"
              :placeholder="$t('pages.setting.placeholder.general')"
              class="input w-100%"
            />
            <t-button class="button w-btn" theme="default" @click="actionProxy()">{{
              $t('pages.lab.jsEdit.action.proxy')
            }}</t-button>
          </div>
        </div>
        <div class="log-container">
          <div class="log-nav">
            <div class="nav-left">
              <t-radio-group variant="default-filled" size="small" v-model="form.nav" @change="changeNav()">
                <t-radio-button value="debug">{{ $t('pages.lab.jsEdit.select.debug') }}</t-radio-button>
                <t-radio-button value="source">{{
                  $t('pages.lab.jsEdit.select.source')
                }}</t-radio-button>
                <t-radio-button value="rule">{{ $t('pages.lab.jsEdit.select.rule') }}</t-radio-button>
                <t-radio-button value="log">{{ $t('pages.lab.jsEdit.select.log') }}</t-radio-button>
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
                <t-radio-button value="f12">{{ $t('pages.lab.jsEdit.select.f12') }}</t-radio-button>
                <t-radio-button value="clear">{{ $t('pages.lab.jsEdit.select.clear') }}</t-radio-button>
              </t-radio-group>
              <t-radio-group
                variant="default-filled"
                size="small"
                v-model="form.clickType.proxy"
                @change="proxyEvent()"
                v-if="form.nav === 'debug' && form.action === 'proxy'"
              >
                <t-radio-button value="upload">{{ $t('pages.lab.jsEdit.select.upload') }}</t-radio-button>
                <t-radio-button value="copy">{{ $t('pages.lab.jsEdit.select.copy') }}</t-radio-button>
              </t-radio-group>
              <t-radio-group
                variant="default-filled"
                size="small"
                v-model="form.clickType.source"
                @change="sourceEvent()"
                v-if="form.nav === 'source'"
              >
                <t-radio-button value="format">{{
                  $t('pages.lab.jsEdit.select.format')
                }}</t-radio-button>
                <t-radio-button value="reset">{{ $t('pages.lab.jsEdit.select.reset') }}</t-radio-button>
              </t-radio-group>
            </div>
          </div>
          <div class="log-text">
            <code-editor
              v-model="form.content.text"
              :options="logEditConf"
              class="log-box"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import jsBeautify from 'js-beautify';
import JSON5 from 'json5';
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { GestureClickIcon } from 'tdesign-icons-vue-next';
import { t } from '@/locales';
import { useSettingStore } from '@/store';
import emitter from '@/utils/emitter';
import { copyToClipboardApi } from '@/utils/tool';
import { CodeEditor } from '@/components/code-editor';
import { setT3Proxy } from '@/api/proxy';
import { addSite, putSite } from '@/api/site'
import { fetchJsEditPdfa, fetchJsEditPdfh, fetchJsEditMuban, fetchJsEditDebug } from '@/api/lab';
import { fetchCmsHome, fetchCmsHomeVod, fetchCmsDetail, fetchCmsCategory, fetchCmsPlay, fetchCmsSearch, fetchCmsInit, fetchCmsRunMain, putSiteDefault, fetchCmsProxy } from '@/api/site';
import reqHtml from '../reqHtml/index.vue';
import drpySuggestions from './utils/drpy_suggestions';
import drpyObjectInner from './utils/drpy_object_inner.ts?raw';

const remote = window.require('@electron/remote');
const router = useRouter();
const store = useSettingStore();
const form = ref({
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
});
const codeEditConf = ref({
  language: 'javascript',
  readOnly: false,
  theme: store.displayMode === 'light' ? 'vs' : 'vs-dark',
  automaticLayout: true,
  folding: true,
  roundedSelection: false,
  overviewRulerBorder: false,
  scrollBeyondLastLine: false,
  fixedOverflowWidgets: true
});
const logEditConf = ref({
  language: 'javascript',
  readOnly: true,
  theme: store.displayMode === 'light' ? 'vs' : 'vs-dark',
  automaticLayout: true,
  folding: true,
  roundedSelection: false,
  overviewRulerBorder: false,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
  fixedOverflowWidgets: true
});
const tmp = computed(() => {
  return {
    file: t('pages.lab.jsEdit.fileManage'),
  };
});
const active = ref({
  nav: '',
  template: false,
  encode: false,
  player: false,
  help: false,
  reqParam: false,
  snifferParam: false,
  ai: false,
  tool: false,
});
const mubanData = ref({});
const templates = computed(() => {
  const keysAsObjects = Object.keys(mubanData.value).map((key) => ({ label: key, value: key }));
  return keysAsObjects;
});
const debugId = ref('');

watch(
  () => store.displayMode,
  (val) => {
    codeEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';
    logEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';
  }
);
watch(
  () => form.value.content.edit,
  () => {
    const currentTime = moment().unix();
    form.value.lastEditTime.edit = currentTime;
  }
);

onMounted(() => {
  getMuban();
  getDebugData();
});

const getDebugData = async () => {
  if (!debugId.value) {
    const debugRes = await fetchJsEditDebug();
    if (debugRes?.id) {
      debugId.value = debugRes.id;
      form.value.content.edit = debugRes.ext;
    } else {
      const siteRes = await addSite({
        name: 'debug',
        key: 'debug',
        type: 7,
        api: 'csp_DRPY',
        search: true,
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
};

const getMuban = async  () => {
  const res = await fetchJsEditMuban();
  if (typeof res === 'object' && Object.keys(res).length > 0) {
    mubanData.value = res;
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      form.value.content.edit = content;
    };
    reader.readAsText(file);
  }
};

const confirmTemplate = () => {
  try {
    const text = mubanData.value[form.value.template];
    form.value.content.edit = `var rule = ${JSON5.stringify(text, null, 2)}`;
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
  active.value.template = false;
};

const importFileEvent = async () => {
  try {
    // @ts-ignore
    const [fileHandle] = await window.showOpenFilePicker();
    if (!fileHandle) return;

    const file = await fileHandle.getFile();
    const content = await file.text();
    form.value.content.edit = content;
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][importFileEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const exportFileEvent = async () => {
  const content = form.value.content.edit || '';
  if (!content.trim()) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
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
    await window.electron.ipcRenderer.send('tmpdir-manage', 'make', 'file');

    const userDataPath = await window.electron.ipcRenderer.invoke('read-path', 'userData');
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `file/${title}.js`);
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
    const content = form.value.content.edit;
    if (!content || content.trim().length === 0) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    };
    await putSite({ ids: [debugId.value], doc: { ext: content } });
    await putSiteDefault(debugId.value);
    emitter.emit('refreshFilmConfig');
    router.push({ name: 'FilmIndex' });
  } catch (err) {
    console.log(`[setting][editSource][debugEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const decodeEvent = async () => {
  try {
    const content = form.value.content.edit || '';
    if (!content || content.trim().length === 0) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    };
    if (!debugId.value) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoDebugId'));
      return;
    };

    const res = await fetchCmsRunMain({
      func: `function main(str) {return getOriginalJs(str)}`,
      arg: content,
      sourceId: debugId.value
    });
    form.value.content.edit = res;
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][decodeEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const fileEvent = () => {
  tmp.value.file = t('pages.lab.jsEdit.fileManage');
};

const changeNav = async (nav = '', action = '') => {
  nav = nav || form.value.nav;
  action = action || form.value.action;
  form.value.nav = nav;

  switch (nav) {
    case 'source':
      logEditConf.value.language = 'html';
      logEditConf.value.readOnly = true;
      break;
    case 'rule':
      logEditConf.value.language = form.value.rule.type === 'pdfa' ? 'json' : 'html';
      logEditConf.value.readOnly = true;
      break;
    case 'debug':
      logEditConf.value.language = 'json';
      logEditConf.value.readOnly = action === 'proxy' ? false : true;
      break;
    case 'log':
      logEditConf.value.language = 'json';
      logEditConf.value.readOnly = true;
      break;
    default:
      break;
  }


  if (nav === 'log') {
    const content = form.value.content.edit;
    if (!content || content.trim().length === 0) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    };
    if (!debugId.value) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoDebugId'));
      return;
    };
    const res = await fetchCmsRunMain({
      func: "function main() {return getConsoleHistory()}",
      arg: "",
      sourceId: debugId.value
    });

    form.value.content[nav] = res;
  };

  const contentText =
      typeof form.value.content[nav] === 'object'
        ? JSON5.stringify(form.value.content[nav], null, 2)
        : form.value.content[nav];
  form.value.content.text = contentText;
};

const performAction = async (type, requestData = {}) => {
  try {
    const content = form.value.content.edit;
    // 1. 判断是否为空
    if (!content || content.trim().length === 0) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    };
    // 2. 判断是否存在debugid
    if (!debugId.value && type !== 'init') {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoDebugId'));
      return;
    };
    // 3. 不存在泽获取
    if (!debugId.value && type === 'init') {
      const debugRes = await fetchJsEditDebug();
      if (debugRes?.id) {
        debugId.value = debugRes.id;
      } else {
        const siteRes = await addSite({
          name: 'debug',
          key: 'debug',
          type: 7,
          api: 'csp_DRPY',
          search: true,
          playUrl: '',
          group: 'debug',
          category: '',
          ext: content,
        });
        if (Array.isArray(siteRes) && siteRes.length > 0 && siteRes[0].hasOwnProperty('id')) {
          debugId.value = siteRes[0].id;
          await fetchCmsInit({ sourceId: siteRes[0].id, debug: true });
        } else return;
      };
    };
    // 4.自动初始化则上传并初始化
    if (type === 'init' || (form.value.lastEditTime.edit > form.value.lastEditTime.init && form.value.init.auto)) {
      const currentTime = moment().unix();
      form.value.lastEditTime.init = currentTime;
      await putSite({ ids: [debugId.value], doc: { ext: content } });
      if (type !== 'init') {
        await fetchCmsInit({ sourceId: debugId.value, debug: true });
      };
    };
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
    const res = await methodMap[type](Object.assign({}, requestData, {sourceId: debugId.value}));
    form.value.content.debug = res;
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
    MessagePlugin.warning(t('pages.lab.jsEdit.message.ruleNoRule'));
    return;
  }
  if (!html) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.ruleNoHtml'));
    return;
  }

  try {
    let res;
    if (type === 'pdfa') {
      res = await fetchJsEditPdfa({ html, rule });
    } else if (type === 'pdfh') {
      res = await fetchJsEditPdfh({ html, rule });
    }
    form.value.content.rule = res;
    changeNav('rule', type);

    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const actionInit = async () => {
  await performAction('init', { debug:true });
};

const actionHome = async () => {
  await performAction('home');
};

const actionHomeVod = async () => {
  await performAction('homeVod');
};

const actionCategory = async () => {
  const { t: tid, f, pg: page } = form.value.category;

  if (!tid) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.listNoT'));
    return;
  }

  const data = {
    tid,
    page: page || 1,
    filter: f ? true : false,
    extend: f ? JSON5.parse(f) : {},
  };
  await performAction('category', data);
};

const actionDetail = async () => {
  const { ids } = form.value.detail;

  if (!ids) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.detailNoIds'));
    return;
  };

  await performAction('detail', { id: ids });
};

const actionSearch = async () => {
  const { wd, pg: page } = form.value.search;

  if (!wd) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.searchNoWd'));
    return;
  }

  const data = {
    wd,
    quick: false,
    page: page || 1,
  };
  await performAction('search', data);
};

const actionPlay = async () => {
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
  await performAction('play', data);
};

const actionProxy = async () => {
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
    await performAction('proxy', params);
  }
};

const logEvent = async () => {
  const type = form.value.clickType.log;
  if (type === 'f12') {
    const webContents = remote.getCurrentWebContents();
    if (!webContents.isDevToolsOpened()) {
      webContents.openDevTools();
    }
  } else if (type === 'clear') {
    const content = form.value.content.edit;
    if (!content || content.trim().length === 0) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    };
    if (!debugId.value) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoDebugId'));
      return;
    };
    await fetchCmsRunMain({
      func: "function main() { clearConsoleHistory(); return 'ok'}",
      arg: "",
      sourceId: debugId.value
    });
    form.value.content.log = '';
    form.value.content.text = '';
    console.clear();
  }

  form.value.clickType.log = '';
};

const proxyEvent = async () => {
  try {
    const type = form.value.clickType.proxy;
    const str: any = form.value.content.text || '';
    const formatStr = str
      .split('\n')
      .filter((s) => !!s.trim())
      .join('');
    const jsonStr = JSON5.parse(formatStr);

    if (type === 'copy') {
      await copyToClipboardApi(form.value.proxy.url);
    } else if (type === 'upload') {
      const url = form.value.proxy.url;
      const formatUrl = new URL(url);
      const params = Object.fromEntries(formatUrl.searchParams.entries());
      await setT3Proxy({ text: jsonStr, url: params.url });
    };

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
      form.value.content.text = html;
    } else if (type === 'format') {
      const formattedHtml: any = jsBeautify.html(html, {
        preserve_newlines: false,
      });
      form.value.content.text = formattedHtml;
    }

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][sourceEvent][err]${err}`);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    form.value.clickType.source = '';
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
    case 'file':
      window.electron.ipcRenderer.send('open-path', 'file', true);
      break;
    case 'debug':
      debugEvent();
      break;
  };
};

const htmlSourceEvent = (data: string) => {
  changeNav('source', 'html');
  form.value.content.source = data;
  form.value.content.text = data;
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

// :deep(.code-toolbar) {
//   height: 100%;
//   border-radius: var(--td-radius-default);

//   pre[class*='language-'] {
//     margin: 0;
//     height: 100%;
//     box-shadow: none;
//     padding: 1em 0.5em 0 3.8em;
//     background-color: var(--td-bg-content-input-2);
//   }

//   .toolbar {
//     padding-right: var(--td-comp-paddingTB-xxs);

//     .toolbar-item {
//       margin-right: var(--td-comp-margin-xs);
//     }
//   }
// }

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
</style>
