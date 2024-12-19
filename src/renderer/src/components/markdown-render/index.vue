<template>
  <div class="text-black">
    <div ref="textRef" class="leading-relaxed break-words">
      <div class="markdown-body" v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, ref, watch, onMounted, onUpdated } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import MarkdownIt from 'markdown-it';
import markdownItMathjax3 from 'markdown-it-mathjax3';
import hljs from 'highlight.js';
import './style/index.less';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
});

const textRef = ref();

// 高亮代码块模板 必须一行
const highlightBlock = (str, lang) => {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">复制</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

// MarkdownIt 实例化配置
const mdi = new MarkdownIt({
  linkify: true,
  highlight(code, language) {
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
  const wrappers = textRef.value?.querySelectorAll('.code-block-wrapper') || [];
  wrappers.forEach((wrapper) => {
    const copyButton = wrapper.querySelector('.code-block-header__copy');
    const codeBlock = wrapper.querySelector('.code-block-body');
    if (copyButton && codeBlock) {
      // 先移除已有的事件监听器，防止重复绑定
      const newButton = copyButton.cloneNode(true);
      copyButton.replaceWith(newButton);

      newButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeBlock.textContent || '');
          MessagePlugin.success('复制成功');
        } catch (error) {
          console.error('复制失败:', error);
          MessagePlugin.error('复制失败，请检查您的浏览器设置');
        }
      });
    }
  });
};

// 渲染后的 Markdown 内容
const renderedMarkdown = computed(() => {
  return props.text ? mdi.render(props.text) : '';
});

// 在更新 DOM 后绑定事件
onMounted(bindCopyEvents);
onUpdated(bindCopyEvents);

watch(() => props.text, () => {
  bindCopyEvents();
});
</script>

<style lang="css" scoped></style>
