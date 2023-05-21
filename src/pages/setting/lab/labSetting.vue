<template>
  <div class="lab-container">
    <div class="header">
      <t-input v-model="searchUrl" label="URL:" placeholder="请输入链接获取内容" @enter="loadSourceHtml">
        <template #suffixIcon>
          <search-icon :style="{ cursor: 'pointer' }" @click.self="loadSourceHtml" />
        </template>
      </t-input>
      <!-- <t-button class="request_header" @click="formDialogVisibleRequestHeader = true">请求头</t-button> -->
    </div>
    <div class="main">
      <div class="left bg">
        <p class="title">源代码</p>
        <div ref="htmlInputRef" class="codeEditBox"></div>
      </div>
      <div class="right">
        <div class="top bg">
          <div class="rule">
            <p class="title">Rule规则</p>
            <div class="rule-items">
              <div class="rule-item">
                <span class="label">分类</span>
                <t-input v-model="testData.classify" class="input"></t-input>
                <t-button @click="test('classify')">测试</t-button>
              </div>
              <div class="rule-item">
                <span class="label">推荐</span>
                <t-input v-model="testData.recommend" class="input"></t-input>
                <t-button @click="test('recommend')">测试</t-button>
              </div>
              <div class="rule-item">
                <span class="label">二级</span>
                <t-input v-model="testData.secondary" class="input"></t-input>
                <t-button @click="test('secondary')">测试</t-button>
              </div>
              <div class="rule-item">
                <span class="label">搜索</span>
                <t-input v-model="testData.search" class="input"></t-input>
                <t-button @click="test('search')">测试</t-button>
              </div>
              <div class="rule-item">
                <span class="label">详情</span>
                <t-input v-model="testData.detail" class="input"></t-input>
                <t-button @click="test('detail')">测试</t-button>
              </div>
              <!-- <div class="rule-item export">
                <t-button block shape="round" theme="default" @click="formDialogVisibleExport = true">
                  导出配置
                </t-button>
              </div> -->
            </div>
          </div>
        </div>
        <div class="bottom bg">
          <p class="title">匹配结果</p>
          <div ref="htmlOutputRef" class="codeEditBox"></div>
        </div>
      </div>
    </div>
    <!-- <dialog-export-view v-model:visible="formDialogVisibleExport" :data="testData" />
    <dialog-request-header-view
      v-model:visible="formDialogVisibleRequestHeader"
      :data="requestHeader"
      @receive-request-header="setRequestHeader"
    /> -->
  </div>
</template>

<script setup lang="ts">
import * as cheerio from 'cheerio';
// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import htmlParser from '@/lib/drpy/htmlParser';
import zy from '@/lib/utils/tools';
import { useSettingStore } from '@/store';

// import DialogExportView from './components/DialogExport.vue';
// import DialogRequestHeaderView from './components/DialogRequestHeader.vue';

const storeSetting = useSettingStore();

const theme = computed(() => {
  return storeSetting.displayMode;
});

const searchUrl = ref('');
const htmlInputRef = ref(null);
const htmlOutputRef = ref(null);
const sourceHtml = ref();
const restultHtml = ref();
const testData = ref({
  classify: '',
  recommend: '',
  secondary: '',
  search: '',
  detail: '',
});

// const requestHeader = ref();
// const formDialogVisibleExport = ref(false);
// const formDialogVisibleRequestHeader = ref(false);

const EDITOR_CONFIG = {
  language: 'html',
  automaticLayout: true, // 自适应布局
  theme: theme.value === 'light' ? 'vs' : 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
  renderLineHighlight: 'all', // 行亮
  selectOnLineNumbers: true, // 显示行号
  minimap: {
    enabled: false,
  },
  readOnly: false, // 只读
  scrollBeyondLastLine: false, // 取消代码后面一大段空白
  overviewRulerBorder: false, // 不要滚动条的边框
};

let editorInput;
let editorOutput;

onBeforeUnmount(() => {
  editorInput.dispose();
  editorOutput.dispose();
});

onMounted(() => {
  editorInit();
});

const loadSourceHtml = async () => {
  try {
    sourceHtml.value = await zy.formatHTML(searchUrl.value);
    editorInput.setValue(sourceHtml.value);
    MessagePlugin.success(`获取成功`);
  } catch (err) {
    MessagePlugin.error(`获取失败: ${err}`);
  }
};

const editorInit = () => {
  nextTick(() => {
    editorInput = monaco.editor.create(htmlInputRef.value as HTMLElement, EDITOR_CONFIG);
    editorOutput = monaco.editor.create(htmlOutputRef.value as HTMLElement, EDITOR_CONFIG);

    // 监听值的变化
    editorInput.onDidChangeModelContent(() => {
      sourceHtml.value = editorInput.getValue();
    });
    editorOutput.onDidChangeModelContent(() => {
      restultHtml.value = editorInput.getValue();
    });
  });
};

const test = (type) => {
  console.log(type);
  const patSource = testData.value[type];
  const res = htmlParser.parseDomForUrl(sourceHtml.value, patSource, '');
  console.log(res);
};
// const test = (type) => {
//   console.log(type);
//   const $ = cheerio.load(sourceHtml.value);
//   const patSource = testData.value[type];
//   console.log(patSource);
//   const patRestult = patSource.split(';');
//   console.log(patRestult);
//   const matchs = [];
//   let firstNode = '';
//   for (let i = 0; i < patRestult.length; i++) {
//     console.log(patRestult[i]);
//     if (i === 0) firstNode = patRestult[i];
//     if (patRestult[i] && patRestult[i] !== '*') {
//       let match;
//       const patRestultSpilt = patRestult[i].split('&&');
//       console.log(patRestultSpilt);

//       if (patRestultSpilt.length > 1) {
//         const selector = `${firstNode} ${patRestultSpilt.slice(0, -1).join(' ')}[${
//           patRestultSpilt[patRestultSpilt.length - 1]
//         }]`;

//         console.log(selector);

//         const arry = [];
//         $(selector).each((i, el) => {
//           const key = $(el).attr(patRestultSpilt[patRestultSpilt.length - 1]);
//           arry.push(key);
//           console.log(key);
//         });
//         match = arry;
//         console.log(match);
//       } else match = $(patRestult[i]).text().trim().replace(/\s+/g, ',');

//       matchs.push(match);
//       console.log(matchs);
//     }
//   }

//   restultHtml.value = matchs.join('\n');
//   editorOutput.setValue(restultHtml.value);
// };

// const setRequestHeader = (item) => {
//   requestHeader.value = item;
//   console.log(requestHeader.value);
// };
</script>

<style lang="less" scoped>
.lab-container {
  overflow-y: hidden;
  width: 100%;
  height: calc(100vh - var(--td-comp-size-l) - var(--td-comp-size-xxl) - 20px) !important;
  padding-bottom: 0 !important;
  .header {
    margin-bottom: 5px;
    padding: 0 2px;
    display: flex;
    .request_header {
      margin-left: 5px;
    }
  }
  .bg {
    background: var(--td-bg-color-page);
    border-radius: 5px;
    padding: 0 10px 10px 10px;
  }
  .title {
    color: var(--td-text-color-secondary);
    font-weight: 500;
  }
  .main {
    display: flex;
    justify-content: space-between;
    height: calc(100% - 37px);
    .left {
      width: calc((100% - 10px) / 2);
      .codeEditBox {
        height: calc(100% - 22px);
        width: 100%;
      }
    }
    .right {
      width: calc((100% - 10px) / 2);
      height: 100%;
      .top {
        margin-bottom: 10px;
        .rule-items {
          .rule-item {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            .label {
              display: inline-block;
              width: 40px;
            }
            .label,
            .input {
              margin-right: 5px;
            }
          }
          .export {
            padding-bottom: 10px;
          }
        }
      }
      .bottom {
        height: calc(100% - 252px);
        .codeEditBox {
          height: calc(100% - 22px);
          width: 100%;
        }
      }
    }
  }
}
:deep(.t-input) {
  background-color: var(--td-bg-input) !important;
  border-color: transparent;
}
</style>
