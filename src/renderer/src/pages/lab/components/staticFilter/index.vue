<template>
  <div class="static-filter view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.staticFilter') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="demo">{{ $t('pages.lab.staticFilter.demo') }}</t-radio-button>
        </t-radio-group>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <div class="edit">
          <div class="code-op">
            <div class="code-op-item">
              <reqHtml class="item source" v-model:data="reqFormData" @source="htmlSourceEvent"/>
            </div>
            <div class="code-op-item card">
              <t-input v-model="form.class_name" :label="$t('pages.lab.staticFilter.rule.className')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.classNameTip')" class="input w-100%" />
              <t-input v-model="form.class_url" :label="$t('pages.lab.staticFilter.rule.classUrl')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.classUrlTip')" class="input w-100%" />
              <t-input v-model="form.class_parse" :label="$t('pages.lab.staticFilter.rule.class')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.classParseTip')" class="input w-100%" />
              <t-input v-model="form.cate_exclude" :label="$t('pages.lab.staticFilter.rule.cateExclude')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.cateExcludeTip')" class="input w-100%" />
              <t-input v-model="form.reurl" :label="$t('pages.lab.staticFilter.rule.link')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.linkTip')" class="input w-100%" />
              <t-button block @click="actionClass">{{ $t('pages.lab.staticFilter.rule.ctry') }}</t-button>
            </div>
            <div class="code-op-item card">
              <t-button block :loading="active.batchFetchLoading" @click="batchResults">{{
                $t('pages.lab.staticFilter.rule.br') }}</t-button>
            </div>
            <div class="code-op-item card">
              <t-textarea v-model="form.filter" :label="$t('pages.lab.staticFilter.rule.filter')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.filterTip')" class="input w-100%"
                :autosize="{ minRows: 1 }" />
              <t-textarea t v-model="form.filterInfo" :label="$t('pages.lab.staticFilter.rule.filterInfo')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.filterInfoTip')" class="input w-100%"
                :autosize="{ minRows: 1 }" />
              <t-button block @click="getMatchs">{{ $t('pages.lab.staticFilter.rule.ms') }}</t-button>

              <t-input v-model="form.exclude_keys" :label="$t('pages.lab.staticFilter.rule.excludeKeys')"
                :placeholder="$t('pages.setting.placeholder.splitForVerticalLine')" class="input w-100%" />

              <!-- 动态创建的输入框列表 -->
              <t-input v-for="(_, key, index) in form.matchs" v-model="form.matchs[key]" :label="key" :key="index"
                :placeholder="$t('pages.lab.staticFilter.rule.reg')" class="input w-100%" />
              <t-button block @click="actionFilter">{{ $t('pages.lab.staticFilter.rule.tf') }}</t-button>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="log-container">
          <div class="log-nav">
            <div class="nav-left">
              <t-radio-group variant="default-filled" size="small" v-model="form.nav" @change="changeNav()">
                <t-radio-button value="debug">{{ $t('pages.lab.staticFilter.select.debug') }}</t-radio-button>
                <t-radio-button value="source">{{ $t('pages.lab.staticFilter.select.source') }}</t-radio-button>
              </t-radio-group>
            </div>
            <div class="nav-right">
              <t-radio-group variant="default-filled" size="small" v-model="form.clickType.debug" @change="debugEvent()"
                v-if="form.nav === 'debug'">
                <t-radio-button value="copy">{{ $t('pages.lab.staticFilter.select.copy') }}</t-radio-button>
                <t-radio-button value="encode">{{ $t('pages.lab.staticFilter.select.encode') }}</t-radio-button>
              </t-radio-group>
              <t-radio-group variant="default-filled" size="small" v-model="form.clickType.source"
                @change="sourceEvent()" v-if="form.nav === 'source'">
                <t-radio-button value="format">{{ $t('pages.lab.staticFilter.select.format') }}</t-radio-button>
                <t-radio-button value="reset">{{ $t('pages.lab.staticFilter.select.reset') }}</t-radio-button>
              </t-radio-group>
            </div>
          </div>
          <div class="log-text">
            <code-editor
              v-model="form.content.text"
              :options="codeEditConf"
              class="log-box"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import jsBeautify from 'js-beautify';
import JSON5 from "json5";
import { CodeEditor } from '@/components/code-editor';
import { t } from '@/locales';
import { useSettingStore } from '@/store';
import { copyToClipboardApi } from '@/utils/tool';
import { gzip } from '@/utils/crypto';
import { fetchStaticFilterFilter, fetchStaticFilterCategory } from '@/api/lab';
import { fetchHtml } from '@/api/setting';
import reqHtml from '../reqHtml/index.vue';


const store = useSettingStore();
const form = ref({
  codeType: 'html',
  content: {
    debug: '',
    source: '',
    text: ''
  },
  nav: 'debug',
  action: '',
  clickType: {
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
const reqFormData = ref({
  method: 'GET',
  url: '',
  encode: 'UTF-8',
  header: '',
  contentType: 'application/json',
  body: '',
});
const active = reactive({
  nav: '',
  reqParam: false,
  batchFetchLoading: false
});
const codeEditConf = ref({
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

watch(
  () => store.displayMode,
  (val) => {
    codeEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';
  }
);
const demoConfEvent = () => {
  reqFormData.value.url = "https://hapihd.com/index.php/vod/show/id/dianying.html";
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

  switch (nav) {
    case 'source':
      codeEditConf.value.language = 'html';
      codeEditConf.value.readOnly = true;
      break;
    case 'rule':
      codeEditConf.value.language = 'json';
      codeEditConf.value.readOnly = true;
      break;
    default:
      break;
  };

  const contentText = typeof form.value.content[nav] === 'object'
    ? JSON5.stringify(form.value.content[nav], null, 2)
    : form.value.content[nav];

  form.value.content.text = contentText;
};

const getMatchs = async () => {
  const { filterInfo = '', filter = '', exclude_keys = '', matchs = {} } = form.value;
  const contentHtml = form.value.content.source;

  if (!filterInfo || !filter) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.inputNoFilterAndFilterInfo'));
    return;
  };

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.sourceFirst'));
    return;
  };

  try {
    const response = await fetchStaticFilterFilter({
      html: contentHtml,
      ci: '',
      f: filter,
      f1: filterInfo,
      matchs: {},
      exclude_keys: exclude_keys
    });
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

const actionClass = async () => {
  const { class_parse = '', class_name = '', class_url = '', cate_exclude = '', reurl = '' } = form.value;
  const { url } = reqFormData.value;
  const contentHtml = form.value.content.source;

  if (!class_parse && !class_name && !class_url) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.inputNoClassParse'));
    return;
  };

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.sourceFirst'));
    return;
  };

  let response = await fetchStaticFilterCategory({
    contentHtml, class_parse, cate_exclude, reurl, url
  });
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
    MessagePlugin.warning(t('pages.lab.staticFilter.message.inputNoFilterAndFilterInfo'));
    return;
  };

  if (Object.keys(classResult).length == 0) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.classResultisEmpty'));
    return;
  };

  try {
    active.batchFetchLoading = true;

    const results = await batchFetch(classResult);
    const rs = results.reduce(async (accumulator, item) => {
      const response = await fetchStaticFilterFilter({
        html: item.body,
        ci: item.id,
        f: filter,
        f1: filterInfo,
        matchs: matchs,
        exclude_keys: exclude_keys
      });
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
    active.batchFetchLoading = false;
  };
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

  let parseHeaderKeys: string[];
  parseHeaderKeys = Object.keys(parsedHeader).map(it => it.toLowerCase());
  if (!parseHeaderKeys.includes('accept')) {
    parsedHeader['Accept'] = '*/*';
  }

  return { parsedHeader, parsedBody };
};

const batchFetch = async (obj) => {
  const { method, encode, header, body, contentType } = reqFormData.value;

  try {
    const { parsedHeader, parsedBody } = prepareRequestOptions(method, header, body, contentType);
    const promises = obj.map(x => fetchHtml({
      url: x.surl.trim(),
      method,
      encode,
      headers: parsedHeader,
      data: parsedBody
    }));
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

const actionFilter = async () => {
  const { filterInfo = '', filter = '', exclude_keys = '', matchs = {} } = form.value;
  const contentHtml = form.value.content.source;

  if (!filterInfo || !filter) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.inputNoFilterAndFilterInfo'));
    return;
  };

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.sourceFirst'));
    return;
  };

  const response = await fetchStaticFilterFilter({
    html: contentHtml,
    ci: '',
    f: filter,
    f1: filterInfo,
    matchs: matchs,
    exclude_keys: exclude_keys
  });

  form.value.content.debug = response.filters;
  changeNav('debug', 'filter');
};

const debugEvent = async () => {
  try {
    const type = form.value.clickType.debug;

    if (type === 'copy') {
      await copyToClipboardApi(form.value.content.text);
    } else if (type === 'encode') {
      const dataBase64 = gzip.encode(form.value.content.debug);
      form.value.content.text = dataBase64;
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
      form.value.content.text = html;
    } else if (type === 'format') {
      const formattedHtml: any = jsBeautify.html(html, {
        preserve_newlines: false
      });
      form.value.content.text = formattedHtml;
    };

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][sift][sourceEvent][err]${err}`);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    form.value.clickType.source = "";
  };
};

const handleOpChange = (type: string) => {
  active.nav = '';
  switch (type) {
    case 'demo':
      demoConfEvent();
      break;
  };
};

const htmlSourceEvent = (data: string) => {
  changeNav('source', 'html');
  form.value.content.source = data;
  form.value.content.text = data;
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

:deep(.monaco-editor) {
  --vscode-editorGutter-background: var(--td-bg-content-input-2);
  --vscode-editor-background: var(--td-bg-content-input-2);
  --vscode-editorStickyScroll-background: var(--td-bg-content-input-2);
  --vscode-editorStickyScroll-shadow: var(--td-bg-content-input-1);
  --vscode-scrollbar-shadow: var(--td-bg-content-input-1);
}
</style>
