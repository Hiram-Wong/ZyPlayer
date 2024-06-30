<template>
  <div class="lab-sift view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.setting.editSource.sift.title') }}</h3>
      </div>
      <div class="right-operation-container">
        <div class="component-op">
          <div class="item" @click="demoEvent()">
            <filter2-icon />
            <span>{{ $t('pages.setting.editSource.sift.demo') }}</span>
          </div>
          <div class="item" @click="siftEvent('Source')">
            <extension-icon />
            <span>{{ $t('pages.setting.editSource.sift.source') }}</span>
          </div>
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
                      $t('pages.setting.editSource.sift.action.source') }}</t-button>
                  </template>

                  <div class="input-container">
                    <t-input v-model="form.req.url" :placeholder="$t('pages.setting.placeholder.general')"
                      class="input" />
                    <div class="method" @click="showDialog('reqParam')">
                      <transform-icon />
                    </div>
                  </div>
                </t-input-adornment>
                <t-dialog v-model:visible="isVisible.reqParam" placement="center"
                  :header="$t('pages.setting.editSource.sift.dialog.request.title')"
                  :cancel-btn="$t('pages.setting.editSource.sift.dialog.request.cancel')" show-in-attached-element
                  @confirm="isVisible.reqParam = false" @cancel="reqCancel()">
                  <div class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.sift.dialog.request.reqEncode') }}</p>
                    <t-select v-model="form.req.encode">
                      <t-option v-for="item in reqEncode" :key="item.value" :value="item.value" :label="item.label" />
                    </t-select>
                  </div>
                  <div class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.sift.dialog.request.reqHeader') }}</p>
                    <t-textarea v-model="form.req.header" placeholder='{ "User-Agent": "Mozilla/5.0 zyplayer" }' />
                  </div>
                  <div v-if="form.req.method !== 'GET'" class="dialog-item">
                    <p>{{ $t('pages.setting.editSource.sift.dialog.request.reqBody') }}</p>
                    <t-select v-model="form.req.contentType" class="contentType" style="margin-bottom: 5px;">
                      <t-option v-for="item in reqContentTypes" :key="item.label" :value="item.value"
                        :label="item.label" />
                    </t-select>
                    <t-textarea v-model="form.req.body" placeholder='{ "key": "01b9b7" }' />
                  </div>
                </t-dialog>
              </div>
            </div>
            <div class="code-op-item card">
              <t-input v-model="form.class_name" :label="$t('pages.setting.editSource.sift.rule.className')"
                :placeholder="$t('pages.setting.editSource.sift.placeholder.classNameTip')" class="input w-100%" />
              <t-input v-model="form.class_url" :label="$t('pages.setting.editSource.sift.rule.classUrl')"
                :placeholder="$t('pages.setting.editSource.sift.placeholder.classUrlTip')" class="input w-100%" />
              <t-input v-model="form.class_parse" :label="$t('pages.setting.editSource.sift.rule.class')"
                :placeholder="$t('pages.setting.editSource.sift.placeholder.classParseTip')" class="input w-100%" />
              <t-input v-model="form.cate_exclude" :label="$t('pages.setting.editSource.sift.rule.cateExclude')"
                :placeholder="$t('pages.setting.editSource.sift.placeholder.cateExcludeTip')" class="input w-100%" />
              <t-input v-model="form.reurl" :label="$t('pages.setting.editSource.sift.rule.link')"
                :placeholder="$t('pages.setting.editSource.sift.placeholder.linkTip')" class="input w-100%" />
              <t-button block @click="actionClass">{{ $t('pages.setting.editSource.sift.rule.ctry') }}</t-button>
            </div>
            <div class="code-op-item card">
              <t-button block :loading="isVisible.batchFetchLoading" @click="batchResults">{{
                $t('pages.setting.editSource.sift.rule.br') }}</t-button>
            </div>
            <div class="code-op-item card">
              <t-textarea v-model="form.filter" :label="$t('pages.setting.editSource.sift.rule.filter')"
                :placeholder="$t('pages.setting.editSource.sift.placeholder.filterTip')" class="input w-100%"
                :autosize="{ minRows: 1 }" />
              <t-textarea t v-model="form.filterInfo" :label="$t('pages.setting.editSource.sift.rule.filterInfo')"
                :placeholder="$t('pages.setting.editSource.sift.placeholder.filterInfoTip')" class="input w-100%"
                :autosize="{ minRows: 1 }" />
              <t-button block @click="getMatchs">{{ $t('pages.setting.editSource.sift.rule.ms') }}</t-button>

              <t-input v-model="form.exclude_keys" :label="$t('pages.setting.editSource.sift.rule.excludeKeys')"
                :placeholder="$t('pages.setting.placeholder.splitForVerticalLine')" class="input w-100%" />

              <!-- 动态创建的输入框列表 -->
              <t-input v-for="(_, key, index) in form.matchs" v-model="form.matchs[key]" :label="key" :key="index"
                :placeholder="$t('pages.setting.editSource.sift.rule.reg')" class="input w-100%" />

              <!-- <t-input v-model="form.matchs.plot" :label="$t('pages.setting.editSource.sift.rule.plot')"
                :placeholder="$t('pages.setting.editSource.sift.rule.reg')" class="input w-100%" />
              <t-input v-model="form.matchs.area" :label="$t('pages.setting.editSource.sift.rule.area')"
                :placeholder="$t('pages.setting.editSource.sift.rule.reg')" class="input w-100%" />
              <t-input v-model="form.matchs.lang" :label="$t('pages.setting.editSource.sift.rule.lang')"
                :placeholder="$t('pages.setting.editSource.sift.rule.reg')" class="input w-100%" />
              <t-input v-model="form.matchs.year" :label="$t('pages.setting.editSource.sift.rule.year')"
                :placeholder="$t('pages.setting.editSource.sift.rule.reg')" class="input w-100%" />
              <t-input v-model="form.matchs.letter" :label="$t('pages.setting.editSource.sift.rule.letter')"
                :placeholder="$t('pages.setting.editSource.sift.rule.reg')" class="input w-100%" />
              <t-input v-model="form.matchs.sort" :label="$t('pages.setting.editSource.sift.rule.sort')"
                :placeholder="$t('pages.setting.editSource.sift.rule.reg')" class="input w-100%" /> -->

              <t-button block @click="actionFilter">{{ $t('pages.setting.editSource.sift.rule.tf') }}</t-button>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="log-box">
          <div class="nav">
            <div class="nav-left">
              <t-radio-group variant="default-filled" size="small" v-model="form.nav" @change="changeNav()">
                <t-radio-button value="debug">{{ $t('pages.setting.editSource.sift.select.debug') }}</t-radio-button>
                <t-radio-button value="source">{{ $t('pages.setting.editSource.sift.select.source') }}</t-radio-button>
              </t-radio-group>
            </div>
            <div class="nav-right">
              <t-radio-group variant="default-filled" size="small" v-model="form.clickType.debug" @change="debugEvent()"
                v-if="form.nav === 'debug'">
                <t-radio-button value="copy">{{ $t('pages.setting.editSource.sift.select.copy') }}</t-radio-button>
                <t-radio-button value="encode">{{ $t('pages.setting.editSource.sift.select.encode') }}</t-radio-button>
              </t-radio-group>
              <t-radio-group variant="default-filled" size="small" v-model="form.clickType.source"
                @change="sourceEvent()" v-if="form.nav === 'source'">
                <t-radio-button value="format">{{ $t('pages.setting.editSource.sift.select.format') }}</t-radio-button>
                <t-radio-button value="reset">{{ $t('pages.setting.editSource.sift.select.reset') }}</t-radio-button>
              </t-radio-group>
            </div>
          </div>
          <div class="text">
            <div class="log-box" id="siftLogBox"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor';
import jsBeautify from 'js-beautify';
import JSON5 from "json5";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { ExtensionIcon, Filter2Icon, TransformIcon } from 'tdesign-icons-vue-next';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import { t } from '@/locales';
import { useSettingStore } from '@/store';
import { getHtml, copyToClipboardApi, encodeGzip, encodeBtoa } from '@/utils/tool';
import { getFilters, processCategories } from '@/utils/drpy/lab/hipyFilter';

const storeSetting = useSettingStore();

const systemTheme = computed(() => {
  return storeSetting.displayMode;
});

let form = ref({
  codeType: 'html',
  content: {
    log: '',
    text: '',
    debug: '',
    source: '',
    rule: ''
  },
  nav: 'debug',
  action: '',
  req: {
    method: 'GET',
    encode: 'UTF-8',
    header: '',
    body: '',
    url: '',
    contentType: 'application/json'
  },
  clickType: {
    log: '',
    debug: '',
    source: ''
  },
  class_parse: '',
  class_name: '',
  class_url: '',
  cate_exclude: '首页|留言|APP|下载|资讯|新闻|动态',
  reurl: '',
  filter: '',
  filterInfo: '',
  exclude_keys: '',
  classResult: {},
  matchs: {
    // plot: 'show(.*?)/id',
    // area: 'show(.*?)/id',
    // lang: '(/lang.*?)\.html@@',
    // year: '(/year.*?)\.html@@',
    // letter: '(/letter.*?)\.html@@',
    // sort: '(/by.*?)/id'
  },
});

const isVisible = reactive({
  reqParam: false,
  batchFetchLoading: false
});

watch(
  () => systemTheme.value,
  (val) => {
    config.theme = val === 'light' ? 'vs' : 'vs-dark';
    changeTheme();
  }
);

const changeTheme = () => {
  monaco.editor.setTheme(config.theme);
  localStorage.setItem(codeThemeKey, config.theme);
};

const emit = defineEmits(['changeComponent']);

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

const initEditor = () => {
  if (log) log.dispose();

  nextTick(() => {
    const logBox = document.getElementById('siftLogBox');
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

    log.getModel()!.pushEOL(config.eol);
  });
};

onMounted(() => {
  initEditor();
})

onBeforeUnmount(() => {
  if (log) log.dispose();
});

const siftEvent = (key) => {
  emit('changeComponent', key);
};

const demoEvent = () => {
  form.value.req.url = "https://hapihd.com/index.php/vod/show/id/dianying.html";
  form.value.class_parse = String.raw`.navbar-items li;a&&Text;a&&href;/(\w+).html`;
  form.value.reurl = "https://hapihd.com/index.php/vod/show/id/fyclass.html";
  form.value.cate_exclude = "更新|热搜榜";
  form.value.filter = "body&&.scroll-box";
  form.value.filterInfo = ";.module-item-title&&Text;body&&a;a&&Text;a&&href";
  form.value.matchs = {
    剧情: 'show(.*?)/id',
    地区: 'show(.*?)/id',
    语言: '(/lang.*?)\.html@@',
    年份: '(/year.*?)\.html@@',
    字母: '(/letter.*?)\.html@@',
    排序: '(/by.*?)/id'
  };
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
      language = 'json';
      readOnly = true;
      break;
    default:
      break;
  };

  if (log) {
    monaco.editor.setModelLanguage(log.getModel()!, language);
    log.updateOptions({ readOnly });

    const contentText = typeof form.value.content[nav] === 'object'
      ? JSON5.stringify(form.value.content[nav], null, 2)
      : form.value.content[nav];

    form.value.content.text = contentText;
    log.setValue(contentText);
  }
};

const getMatchs = () => {
  const { filterInfo = '', filter = '', exclude_keys = '', matchs = {} } = form.value;
  const contentHtml = form.value.content.source;

  if (!filterInfo || !filter) {
    MessagePlugin.warning(t('pages.setting.editSource.sift.message.inputNoFilterAndFilterInfo'));
    return;
  };

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.setting.editSource.sift.message.sourceFirst'));
    return;
  };

  try {
    const response = getFilters(contentHtml, '', filter, filterInfo, {}, exclude_keys);
    const updatedMatchs = response?.fl.reduce((acc, item) => {
      if (!matchs.hasOwnProperty(item)) {
        acc[item] = "";
      } else acc[item] = matchs[item];
      return acc;
    }, {});

    form.value.matchs = { ...updatedMatchs };
  } catch (err) {
    console.error('Error in getMatchs:', err);
  }
};

const uniqueObjectsByProperty = (array, key) => {
  const map = new Map();
  array.forEach(item => {
    const keyValue = item[key];
    map.set(keyValue, item);
  });
  return Array.from(map.values());
};

const concatenateObjects = (array) => {
  return array.reduce((accumulator, current) => {
    accumulator.m = accumulator.m ? `${accumulator.m}&${current.m}` : current.m;
    accumulator.title = accumulator.title ? `${accumulator.title}&${current.title}` : current.title;
    return accumulator;
  }, { m: '', title: '' });
};

const actionClass = () => {
  const { class_parse = '', class_name = '', class_url = '', cate_exclude = '', reurl = '' } = form.value;
  const { url } = form.value.req;
  const contentHtml = form.value.content.source;

  if (!class_parse && !class_name && !class_url) {
    MessagePlugin.warning(t('pages.setting.editSource.sift.message.inputNoClassParse'));
    return;
  };

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.setting.editSource.sift.message.sourceFirst'));
    return;
  };

  let response = processCategories(contentHtml, class_parse, cate_exclude, reurl, url);
  let set = new Set();
  if (class_name && class_url) {
    if (response.hasOwnProperty("m")) {
      response.m += "&" + class_url;
      response.title += "&" + class_name;
    }
  }

  if (Object.keys(response).length > 0) {
    response.m.split("&").map((x, i) => {
      set.add({ m: x, title: response.title.split("&")[i] })
    });

    let rs = uniqueObjectsByProperty(Array.from(set), 'm');
    if (cate_exclude.length > 0) {
      let excludeCategories = cate_exclude.split(/\|/).filter(e => e);
      rs = rs.filter(x => !excludeCategories.some(s => s.includes(x.title)));
    };

    response = concatenateObjects(rs);
  }

  if (Object.keys(response).length == 0) {
    if (class_name && class_url) {
      response.m = class_url;
      response.title = class_name;
    }
  }

  const transformData = (data) => {
    const titles = data.title.split('&');
    const ms = data.m.split('&');

    return titles.map((title, index) => ({
      title: title.trim(),
      id: ms[index].trim(),
      surl: form.value.reurl.replace("fyclass", ms[index].trim())
    }));
  };

  if (response?.title && response?.m) form.value.content.debug = transformData(response);
  form.value.class_name = response?.title || '';
  form.value.class_url = response?.m || '';
  form.value.classResult = transformData(response);
  changeNav('debug', 'class');
};

const batchResults = async () => {
  const classResult = form.value.classResult;

  const { filterInfo = '', filter = '', exclude_keys = '', matchs = {} } = form.value;
  if (!filterInfo || !filter) {
    MessagePlugin.warning(t('pages.setting.editSource.sift.message.inputNoFilterAndFilterInfo'));
    return;
  };

  if (Object.keys(classResult).length == 0) {
    MessagePlugin.warning(t('pages.setting.editSource.sift.message.classResultisEmpty'));
    return;
  };

  try {
    isVisible.batchFetchLoading = true;

    const results = await batchFetch(classResult);
    const rs = results.reduce((accumulator, item) => {
      const response = getFilters(item.body, item.id, filter, filterInfo, matchs, exclude_keys);
      if (response && response.filters) {
        accumulator[item.id] = response.filters;
      }
      return accumulator;
    }, {});

    form.value.content.debug = JSON.stringify(rs, null, 2);

    changeNav('debug', 'class');
  } catch (err) {
    console.log(`[editSource][sift][batchResults][err]${err}`)
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    isVisible.batchFetchLoading = false;
  };
};

const batchFetch = async (obj) => {
  const { method, encode, header, body, contentType } = form.value.req;

  try {
    const { parsedHeader, parsedBody } = prepareRequestOptions(method, header, body, contentType);
    const promises = obj.map(x => getHtml(x.surl.trim(), method, encode, parsedHeader, parsedBody));
    const responses = await Promise.all(promises);
    const results = responses.map((response, index) => ({
      id: obj[index].id,
      body: response
    }));
    return results;
  } catch (error) {
    console.error('Error in batch fetch:', error);
    throw error;
  }
};

const actionFilter = () => {
  const { filterInfo = '', filter = '', exclude_keys = '', matchs = {} } = form.value;
  const contentHtml = form.value.content.source;

  if (!filterInfo || !filter) {
    MessagePlugin.warning(t('pages.setting.editSource.sift.message.inputNoFilterAndFilterInfo'));
    return;
  };

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.setting.editSource.sift.message.sourceFirst'));
    return;
  };

  const response = getFilters(contentHtml, '', filter, filterInfo, matchs, exclude_keys).filters;

  form.value.content.debug = response;
  changeNav('debug', 'filter');
};

const prepareRequestOptions = (method, header, body, contentType) => {
  const parsedHeader = JSON5.parse(header || '{}');
  let parsedBody = JSON5.parse(body || '{}');

  if (method !== 'GET' && parsedBody) {
    parsedHeader['Content-Type'] = contentType;
    if (contentType === 'application/x-www-form-urlencoded') {
      parsedBody instanceof URLSearchParams
        ? parsedBody
        : (parsedBody = new URLSearchParams(parsedBody));
    }
  }

  const parseHeaderKeys = Object.fromEntries(
    Object.entries(parsedHeader).map(([key, value]) => [key.toLowerCase(), value])
  );

  if (!parseHeaderKeys.accept) {
    parseHeaderKeys['accept'] = '*/*';
  }

  return { parsedHeader, parsedBody };
};

const getSource = async () => {
  const { url, method, encode, header, body, contentType } = form.value.req;

  if (!url) {
    MessagePlugin.warning(t('pages.setting.editSource.message.htmlNoUrl'));
    return;
  };

  try {
    const { parsedHeader, parsedBody } = prepareRequestOptions(method, header, body, contentType);
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

const debugEvent = async () => {
  try {
    const type = form.value.clickType.debug;
    const str: any = log ? log.getValue() : "";

    if (type === 'copy') {
      await copyToClipboardApi(str);
    } else if (type === 'encode') {
      const uint8Array = encodeGzip(JSON.stringify(form.value.content.debug));
      const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
      const dataBase64 = encodeBtoa(binaryString);
      log?.setValue(dataBase64);
    }

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][sift][debugEvent][err]${err}`)
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    form.value.clickType.debug = "";
  };
};

const sourceEvent = () => {
  try {
    const type = form.value.clickType.source;
    const html = form.value.content.source;
    if (type === 'reset') {
      log?.setValue(html);
    } else if (type === 'format') {
      const formattedHtml: any = jsBeautify.html(html, {
        preserve_newlines: false
      });
      log?.setValue(formattedHtml);
    };

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][sift][sourceEvent][err]${err}`);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);

  } finally {
    form.value.clickType.source = "";
  };
};
</script>

<style lang="less" scoped>
.lab-sift {
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
      overflow-y: auto;

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
              background-color: var(--td-bg-content-input-2) !important;
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
            grid-gap: var(--td-comp-margin-xs);
          }

          .card {
            padding: 6px 4px;
            border-radius: var(--td-radius-medium);
            border: 1px solid rgba(132, 133, 141, 0.2);
            display: flex;
            flex-direction: column;
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

          .button {}


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
        padding: var(--td-comp-paddingTB-xs) 0 var(--td-comp-paddingTB-m);

        :deep(.jv-container) {
          background-color: var(--td-bg-content-input-2) !important;
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
  background-color: var(--td-bg-content-input-2) !important;
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

.w-btn {
  width: 70px;
}
</style>
