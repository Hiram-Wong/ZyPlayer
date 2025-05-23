<template>
  <div class="text-black">
    <div ref="textRef" class="leading-relaxed break-words">
      <div class="markdown-body" v-html="renderMarkdown"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import './style/index.less';

import { computed, watch, onMounted, onUpdated, PropType, useTemplateRef } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import MarkdownIt from 'markdown-it';
import markdownItMathjax3 from 'markdown-it-mathjax3';
import hljs from 'highlight.js';

import { Label } from './types';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  label: {
    type: Object as PropType<Label>,
    default: (): object => ({}),
  },
});

const textRef = useTemplateRef<HTMLElement>('textRef');
const textLabel = computed(() => {
  return {
    copy: props.label.copy || '复制',
    lang: props.label.lang || '语言',
    copySuccess: props.label.copySuccess || '复制成功',
    copyError: props.label.copyError || '复制失败，请检查您的浏览器设置',
  }
});

// 高亮代码块模板 必须一行
const highlightBlock = (str: string, lang: string) => {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${textLabel.value.copy}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
};

// MarkdownIt 实例化配置
const mdi = new MarkdownIt({
  linkify: true,
  highlight(code: string, language: string) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
});

mdi.use(markdownItMathjax3);

// 处理代码块复制事件
const bindCopyEvents = () => {
  const wrappers = (textRef.value?.querySelectorAll('.code-block-wrapper') || []) as HTMLElement[];
  wrappers.forEach((wrapper: HTMLElement) => {
    const copyButton = wrapper.querySelector('.code-block-header__copy');
    const codeBlock = wrapper.querySelector('.code-block-body');
    if (copyButton && codeBlock) {
      // 先移除已有的事件监听器，防止重复绑定
      const newButton = copyButton.cloneNode(true);
      copyButton.replaceWith(newButton);

      newButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeBlock.textContent || '');
          MessagePlugin.success(textLabel.value.copySuccess);
        } catch (err: any) {
          console.error(err);
          MessagePlugin.error(textLabel.value.copyError);
        }
      });
    }
  });
};

// 渲染后的 Markdown 内容
const renderMarkdown = computed(() => {
  return props.text ? mdi.render(props.text) : '';
});

// 在更新 DOM 后绑定事件
onMounted(bindCopyEvents);
onUpdated(bindCopyEvents);

watch(() => props.text,
  () => {
    bindCopyEvents();
  }
);
</script>

<style lang="css" scoped></style>
