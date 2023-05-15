<template>
  <div class="lab-container">
    <div class="header">
      <t-input v-model="searchUrl" label="URL:" placeholder="请输入链接获取内容" @enter="loadSourceHtml">
        <template #suffixIcon>
          <search-icon :style="{ cursor: 'pointer' }" @click.self="loadSourceHtml" />
        </template>
      </t-input>
      <t-button class="request_header" @click="formDialogVisibleRequestHeader = true">请求头</t-button>
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
              <div class="rule-item export">
                <t-button block shape="round" theme="default" @click="formDialogVisibleExport = true">
                  导出配置
                </t-button>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom bg">
          <p class="title">匹配结果</p>
          <div ref="htmlOutputRef" class="codeEditBox"></div>
        </div>
      </div>
    </div>
    <dialog-export-view v-model:visible="formDialogVisibleExport" :data="testData" />
    <dialog-request-header-view
      v-model:visible="formDialogVisibleRequestHeader"
      :data="requestHeader"
      @receive-request-header="setRequestHeader"
    />
  </div>
</template>

<script setup lang="ts">
import * as cheerio from 'cheerio';
import * as monaco from 'monaco-editor';
import { SearchIcon } from 'tdesign-icons-vue-next';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import zy from '@/lib/utils/tools';

import DialogExportView from './components/DialogExport.vue';
import DialogRequestHeaderView from './components/DialogRequestHeader.vue';

const searchUrl = ref('');
const htmlInputRef = ref();
const htmlOutputRef = ref();
const sourceHtml = ref();
const restultHtml = ref();
const testData = ref({
  classify: '',
  recommend: '',
  secondary: '',
  search: '',
  detail: '',
});
const requestHeader = ref();
const formDialogVisibleExport = ref(false);
const formDialogVisibleRequestHeader = ref(false);
const EDITOR_CONFIG = {
  automaticLayout: true, // 自适应布局
  theme: 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
  renderLineHighlight: 'all', // 行亮
  selectOnLineNumbers: true, // 显示行号
  minimap: {
    enabled: false,
  },
  readOnly: false, // 只读
  scrollBeyondLastLine: false, // 取消代码后面一大段空白
  overviewRulerBorder: false, // 不要滚动条的边框
};

let editorInput: monaco.editor.IStandaloneCodeEditor;
let editorOutput: monaco.editor.IStandaloneCodeEditor;

onBeforeUnmount(() => {
  editorInput.dispose();
  editorOutput.dispose();
});

onMounted(() => {
  editorInit();
});

const loadSourceHtml = async () => {
  sourceHtml.value = await zy.getConfig(searchUrl.value, requestHeader.value);
  editorInput.setValue(sourceHtml.value);
};

const editorInit = () => {
  nextTick(() => {
    editorInput = monaco.editor.create(htmlInputRef.value as HTMLElement, EDITOR_CONFIG);
    editorOutput = monaco.editor.create(htmlOutputRef.value as HTMLElement, EDITOR_CONFIG);

    // console.log(editor)
    // 监听值的变化
    // editor.onDidChangeModelContent((val) => {
    //   text.value = editor.getValue();
    // });
  });
};

const test = (type) => {
  console.log(type);
  const $ = cheerio.load(sourceHtml.value);
  console.log($('.lazyload').attr('data-original'));
  const patSource = testData.value[type];
  console.log(patSource);
  const patRestult = patSource.split(';');
  console.log(patRestult);
  const matchs = [];
  let firstNode = '';
  for (let i = 0; i < patRestult.length; i++) {
    console.log(patRestult[i]);
    if (i === 0) firstNode = patRestult[i];
    if (patRestult[i] && patRestult[i] !== '*') {
      let match;
      const patRestultSpilt = patRestult[i].split('&&');

      if (patRestultSpilt.length > 1) {
        console.log(`${firstNode} ${patRestultSpilt[0]} .attr(${patRestultSpilt[1]})`);
        const arry = [];
        $(`${firstNode} ${patRestultSpilt[0]}`).each((i, el) => {
          const key = $(el).attr(patRestultSpilt[1]);
          arry.push(key);
          console.log(key);
        });
        match = arry;
        console.log(match);
      } else match = $(patRestult[i]).text().trim().replace(/\s+/g, ',');

      matchs.push(match);
      console.log(matchs);
    }
  }

  restultHtml.value = matchs.join('\n');
  editorOutput.setValue(restultHtml.value);
};

const setRequestHeader = (item) => {
  requestHeader.value = item;
  console.log(requestHeader.value);
};
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
    padding: 0 10px;
  }
  .title {
    font-weight: 700;
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
        padding: 0 10px;
        height: calc(100% - 285px);
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
