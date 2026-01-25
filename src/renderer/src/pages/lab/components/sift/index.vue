<template>
  <div class="lab-static-filter view-component-container">
    <div class="header">
      <div class="left-op-container">
        <div class="component-op">
          <group-btn :data="op" @change="handleOpChange" />
        </div>
      </div>
      <div class="right-op-container"></div>
    </div>
    <div class="content">
      <splitpanes horizontal>
        <pane size="70">
          <splitpanes>
            <pane>
              <div class="editor-pane">
                <t-tabs v-model="active.editor" theme="card" lazy class="editor-pane-tabs">
                  <t-tab-panel :label="$t('component.codeEditor.editor.html')" value="html">
                    <div class="editor-pane-code">
                      <code-editor v-model="sourceCode" :options="editConf" class="code-box" />
                    </div>
                  </t-tab-panel>
                </t-tabs>
              </div>
            </pane>
            <pane>
              <div class="action-pane">
                <t-tabs v-model="active.action" theme="card" lazy class="pane-right">
                  <t-tab-panel :label="$t('pages.lab.edit.debug.dom')" value="data">
                    <div class="action-pane-data">
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
                          v-model="siftFormData.class_name"
                          :label="$t('pages.lab.sift.rule.className')"
                          :placeholder="$t('pages.lab.sift.placeholder.classNameTip')"
                        />
                        <t-input
                          v-model="siftFormData.class_url"
                          :label="$t('pages.lab.sift.rule.classUrl')"
                          :placeholder="$t('pages.lab.sift.placeholder.classUrlTip')"
                        />
                        <t-input
                          v-model="siftFormData.class_parse"
                          :label="$t('pages.lab.sift.rule.class')"
                          :placeholder="$t('pages.lab.sift.placeholder.classParseTip')"
                        />
                        <t-input
                          v-model="siftFormData.cate_exclude"
                          :label="$t('pages.lab.sift.rule.cateExclude')"
                          :placeholder="$t('pages.lab.sift.placeholder.cateExcludeTip')"
                        />
                        <t-input
                          v-model="siftFormData.reurl"
                          :label="$t('pages.lab.sift.rule.link')"
                          :placeholder="$t('pages.lab.sift.placeholder.linkTip')"
                        />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="loading.category"
                          @click="actionGenerateCategory"
                        >
                          {{ $t('pages.lab.sift.action.category') }}
                        </t-button>
                      </div>
                      <div class="action-item">
                        <t-textarea
                          v-model="siftFormData.filter"
                          :label="$t('pages.lab.sift.rule.filter')"
                          :placeholder="$t('pages.lab.sift.placeholder.filterTip')"
                          :autosize="{ minRows: 1 }"
                        />
                        <t-textarea
                          v-model="siftFormData.filterInfo"
                          :label="$t('pages.lab.sift.rule.filterInfo')"
                          :placeholder="$t('pages.lab.sift.placeholder.filterInfoTip')"
                          :autosize="{ minRows: 1 }"
                        />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="loading.matchs"
                          @click="actionGenerateMatch"
                        >
                          {{ $t('pages.lab.sift.action.match') }}
                        </t-button>

                        <t-input
                          v-model="siftFormData.exclude_keys"
                          :label="$t('pages.lab.sift.rule.excludeKeys')"
                          :placeholder="$t('pages.lab.sift.placeholder.keyExcludeTip')"
                        />

                        <t-input
                          v-for="(_, key, index) in siftFormData.matchs"
                          :key="index"
                          v-model="siftFormData.matchs[key]"
                          :label="key"
                          :placeholder="$t('pages.lab.sift.placeholder.reg')"
                        />
                        <t-button
                          theme="primary"
                          variant="base"
                          block
                          :loading="loading.sift"
                          @click="actionGenerateCurrentSift"
                        >
                          {{ $t('pages.lab.sift.action.currentSift') }}
                        </t-button>
                      </div>
                      <div class="action-item final-item">
                        <t-button
                          theme="primary"
                          variant="dashed"
                          ghost
                          block
                          :loading="loading.allSift"
                          @click="actionGenerateAllSift"
                        >
                          {{ $t('pages.lab.sift.action.finalSift') }}
                        </t-button>
                        <t-button theme="primary" variant="dashed" ghost block @click="actionCopyAllSift">
                          {{ $t('pages.lab.sift.action.copyFinalSift') }}
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
                <div class="output-clear" @click="handleOutputClear"><clear-formatting1-icon /></div>
              </div>
            </div>
            <div class="output-content">
              <terminal ref="testResultRef" :options="termConf" class="output-terminal" />
            </div>
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>
<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css';

import { THEME } from '@shared/config/theme';
import { toHMS } from '@shared/modules/date';
import { isObject, isObjectEmpty, isStrEmpty, isString } from '@shared/modules/validate';
import type { ISiftCategoryResult } from '@shared/types/sift';
import { Pane, Splitpanes } from 'splitpanes';
import { ClearFormatting1Icon } from 'tdesign-icons-vue-next';
import type { MessageInstance } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { WatchStopHandle } from 'vue';
import { computed, onActivated, onDeactivated, ref, useTemplateRef, watch } from 'vue';

import { fetchEditSiftCategory, fetchEditSiftFilter } from '@/api/film';
import type { IEditorOptions } from '@/components/code-editor';
import CodeEditor from '@/components/code-editor';
import GroupBtn from '@/components/group-btn/index.vue';
import type { IReqConfig, IReqResponse } from '@/components/input-req/index.vue';
import InputReq from '@/components/input-req/index.vue';
import { handleReq } from '@/components/input-req/utils';
import TagNav from '@/components/tag-nav/index.vue';
import type { ITerminalLog, ITerminalOptions } from '@/components/terminal/index.vue';
import Terminal from '@/components/terminal/index.vue';
import { attachContent } from '@/config/global';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

const storeSetting = useSettingStore();

const op = computed(() => [{ label: t('common.demo'), value: 'demo' }]);
const OUTPUT_OPTIONS = computed(() => [{ label: t('component.codeEditor.output.testResult'), value: 'testResult' }]);

const testResultRef = useTemplateRef<InstanceType<typeof Terminal>>('testResultRef');

const editConf = ref<IEditorOptions['normal']>({
  automaticLayout: true, // 自动布局
  fixedOverflowWidgets: true, // 溢出小部件固定
  folding: true, // 代码折叠
  fontFamily: 'JetBrainsMono, monospace',
  fontLigatures: false, // 连字符
  insertSpaces: false, // 使用空格代替制表符
  language: 'html',
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
});
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

const siftFormData = ref({
  class_parse: '',
  class_name: '',
  class_url: '',
  cate_exclude: '首页|留言|APP|下载|资讯|新闻|动态',
  reurl: '',
  filter: '',
  filterInfo: '',
  exclude_keys: '',
  matchs: {
    // plot: 'show(.*?)/id',
    // area: 'show(.*?)/id',
    // lang: '(/lang.*?)\.html@@',
    // year: '(/year.*?)\.html@@',
    // letter: '(/letter.*?)\.html@@',
    // sort: '(/by.*?)/id'
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

const sourceCode = ref('');
const categoryResult = ref<ISiftCategoryResult['raw']>([]);
const siftResult = ref<any>({});

const active = ref({
  editor: 'html' as const,
  action: 'data' as const,
  output: 'testResult' as const,
});
const loading = ref({
  category: false,
  matchs: false,
  sift: false,
  allSift: false,
});

const alert = ref<Record<string, Promise<MessageInstance> | null>>({
  debug: null,
});
const debugWatchStop = ref<WatchStopHandle | null>(null);

watch(
  () => storeSetting.displayTheme,
  (val) => {
    editConf.value.theme = val === THEME.LIGHT ? 'vs' : 'vs-dark';

    termConf.value.theme = {
      foreground: val === THEME.LIGHT ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      background: val === THEME.LIGHT ? '#e8e8e8' : '#393939',
      cursor: val === THEME.LIGHT ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    };
  },
);

onActivated(() => activeSetup());
onDeactivated(() => deactivateDispose());

const activeSetup = () => {
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
};
const deactivateDispose = () => {
  debugWatchStop.value?.();
  debugWatchStop.value = null;

  alert.value.debug && MessagePlugin.close(alert.value.debug);
  alert.value.debug = null;
};

const actionGenerateCategory = async () => {
  const { class_parse = '', cate_exclude = '', reurl = '' } = siftFormData.value;
  const { url: baseUrl } = reqFormData.value;
  const html = sourceCode.value;

  if ([class_parse].some((x) => !isString(x) || isStrEmpty(x))) {
    MessagePlugin.warning(t('pages.lab.sift.message.inputNoClassParse'));
    return;
  }

  if (!isString(html) || isStrEmpty(html)) {
    MessagePlugin.warning(t('pages.lab.sift.message.sourceFirst'));
    return;
  }

  try {
    loading.value.category = true;

    const resp = await fetchEditSiftCategory({
      html,
      categoryRule: class_parse,
      categoryExclude: cate_exclude,
      categoryUrl: reurl,
      baseUrl,
    });

    siftFormData.value.class_name = resp.title;
    siftFormData.value.class_url = resp.uuid;
    categoryResult.value = resp.raw;

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error(`Fail to generate category`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  } finally {
    loading.value.category = false;
  }
};

const actionGenerateMatch = async () => {
  const { filterInfo = '', filter = '', exclude_keys = '', matchs = {} } = siftFormData.value;
  const html = sourceCode.value;

  if ([filterInfo, filter].some((x) => !isString(x) || isStrEmpty(x))) {
    MessagePlugin.warning(t('pages.lab.sift.message.inputNoFilterAndFilterInfo'));
    return;
  }

  if (!isString(html) || isStrEmpty(html)) {
    MessagePlugin.warning(t('pages.lab.sift.message.sourceFirst'));
    return;
  }

  try {
    loading.value.matchs = true;

    const resp = await fetchEditSiftFilter({
      html,
      baseRule: filter,
      detailRule: filterInfo,
      matchs: {},
      ci: '',
      excludeKeys: exclude_keys,
    });

    const res = Object.fromEntries(
      (resp?.fl ?? []).map((key: string) => [key, matchs[key] ?? '']).filter(([, value]) => value),
    );

    siftFormData.value.matchs = res;

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error(`Fail to generate matchs`, error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  } finally {
    loading.value.matchs = false;
  }
};

const actionGenerateCurrentSift = async () => {
  const { filterInfo = '', filter = '', exclude_keys = '', matchs = {} } = siftFormData.value;
  const html = sourceCode.value;

  if ([filterInfo, filter].some((x) => !isString(x) || isStrEmpty(x))) {
    MessagePlugin.warning(t('pages.lab.sift.message.inputNoFilterAndFilterInfo'));
    return;
  }

  if (!isString(html) || isStrEmpty(html)) {
    MessagePlugin.warning(t('pages.lab.sift.message.sourceFirst'));
    return;
  }

  try {
    loading.value.sift = true;

    const resp = await fetchEditSiftFilter({
      html,
      baseRule: filter,
      detailRule: filterInfo,
      matchs,
      ci: '',
      excludeKeys: exclude_keys,
    });

    logger('testResult', `<Data>CurrentSift: ${toHMS()} > `, 'verbose', resp);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>CurrentSift: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  } finally {
    loading.value.sift = false;
  }
};

const actionGenerateAllSift = async () => {
  const classResult = categoryResult.value;
  const { filterInfo = '', filter = '', exclude_keys = '', matchs = {} } = siftFormData.value;
  const { method, encode, headers, data, contentType } = reqFormData.value;

  if ([filterInfo, filter].some((x) => !isString(x) || isStrEmpty(x))) {
    MessagePlugin.warning(t('pages.lab.sift.message.inputNoFilterAndFilterInfo'));
    return;
  }

  if (!isObject(classResult) || isObjectEmpty(classResult)) {
    MessagePlugin.warning(t('pages.lab.sift.message.classResultisEmpty'));
    return;
  }

  try {
    loading.value.allSift = true;

    const codePromises = classResult.map(async (x) => {
      return await handleReq({ url: x.source_url, method, encode, headers, data, contentType });
    });
    const codePesp = await Promise.all(codePromises);
    const codeRes = codePesp.map((resp, index) => ({ id: classResult[index].uuid, code: resp?.data ?? '' }));

    const filterPromises = codeRes.map(async (item) => {
      const response = await fetchEditSiftFilter({
        html: item.code,
        baseRule: filter,
        detailRule: filterInfo,
        matchs,
        ci: item.id,
        excludeKeys: exclude_keys,
      });
      return { id: item.id, filters: response?.filters };
    });
    const filterResp = await Promise.all(filterPromises);
    const filterRes = filterResp.reduce((a, { id, filters }) => (filters ? ((a[id] = filters), a) : a), {});

    siftResult.value = filterRes;
    logger('testResult', `<Data>FinalSift: ${toHMS()} > `, 'verbose', filterRes);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    logger('testResult', `<Data>FinalSift: ${toHMS()} > `, 'error', error);
    MessagePlugin.error(`${t('common.error')}:${(error as Error).message}`);
  } finally {
    loading.value.allSift = false;
  }
};

const actionCopyAllSift = async () => {
  if (isObjectEmpty(siftResult.value)) {
    MessagePlugin.warning(t('pages.lab.sift.message.siftResultisEmpty'));
    return;
  }

  try {
    const siftStr = JSON.stringify(siftResult.value, null, 2);
    await navigator.clipboard.writeText(siftStr);
    MessagePlugin.success(t('common.copySuccess'));
  } catch {
    MessagePlugin.error(t('common.copyFail'));
  }
};

const onReqResponse = (resp: IReqResponse) => {
  sourceCode.value = resp.data ?? '';
};

const handleOpChange = (type: string) => {
  switch (type) {
    case 'demo': {
      handleOpDemo();
      break;
    }
  }
};

const handleOpDemo = () => {
  reqFormData.value.url = 'https://www.dianying103.xyz/index.php/vod/show/id/1.html';

  siftFormData.value.class_parse = String.raw`.myui-header__menu li.hidden-sm;a&&Text;a&&href;/type/id/(\d+).html`;
  siftFormData.value.reurl = 'https://www.dianying103.xyz/index.php/vod/show/id/fyclass.html';
  siftFormData.value.cate_exclude = '首页|更新|热搜榜';
  siftFormData.value.filter = 'body&&.myui-screen__list';
  siftFormData.value.filterInfo = ';.text-muted&&Text;body&&a;a&&Text;a&&href';
  siftFormData.value.matchs = {
    年份: '(/year.*?)\.html@@',
    语言: '(/lang.*?)\.html@@',
    字母: '(/letter.*?)\.html@@',
    剧情: 'show(.*?)/id',
    地区: 'show(.*?)/id',
    排序: '(/by.*?)/id',
  };
};

// output

const logger = (type: typeof active.value.output, prefix: string, level: ITerminalLog, text: unknown) => {
  const printRef = type === 'testResult' ? testResultRef.value : null;
  if (!printRef) return;

  if (text instanceof Error) {
    level = 'error';
    text = text.message;
  }

  printRef?.write(text, level, true, prefix);
};

const handleOutputChange = (val: typeof active.value.output) => {
  active.value.output = val;
};

const handleOutputClear = () => {
  try {
    console.clear();

    testResultRef.value?.clear();

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error('Fail to clear output', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
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
    }

    .right-operation-container {
      display: flex;
      align-items: center;
      flex-direction: row;
    }
  }

  .content {
    height: 100%;
    width: 100%;
    border-radius: var(--td-radius-medium);
    overflow: hidden;
    background-color: var(--td-bg-color-specialcomponent);

    .editor-pane {
      height: 100%;

      .editor-pane-code {
        height: 100%;
        border-top: 2px solid var(--td-bg-color-component);
      }
    }

    .action-pane {
      height: 100%;

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

      .final-item {
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
