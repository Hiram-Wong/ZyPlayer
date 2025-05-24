<template>
  <div ref="terminalRef" class="terminal"></div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'Terminal' });

import '@xterm/xterm/css/xterm.css';

import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { Terminal, ITerminalOptions } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

export type TerminalOptions = ITerminalOptions;
export type TerminalIns = Terminal;

const props = defineProps<{
  options: ITerminalOptions;
}>();

const terminalRef = ref<HTMLElement | null>(null);
const term = ref<Terminal | null>(null);
const fitAddon = ref<FitAddon | null>(null);
const webLinksAddon = ref<WebLinksAddon | null>(null);
const termResizeObserver = ref<ResizeObserver | null>(null);

const LOG_LEVELS = {
  info: '\x1b[34m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  trace: '\x1b[32m',
  debug: '\x1b[35m',
  log: '\x1b[0m',
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

watch(
  () => props.options,
  (newOptions) => {
    term.value && (term.value.options = JSON.parse(JSON.stringify(newOptions)));
  },
  { deep: true }
);

const init = async (onKeyCallback: (key: string) => void = () => {}) => {
  await nextTick(); // 等待 DOM 渲染完成，确保 terminalRef.value 存在
  if (!terminalRef.value) return;
  if (term.value) {
    clear();
    return term.value;
  };

  term.value = new Terminal({
    cursorBlink: true,
    fontFamily: '"JetBrainsMono", monospace',
    ...props.options,
  });

  webLinksAddon.value = new WebLinksAddon();
  term.value.loadAddon(webLinksAddon.value);

  fitAddon.value = new FitAddon();
  term.value.loadAddon(fitAddon.value);

  term.value.open(terminalRef.value!);
  fitAddon.value.fit();
  term.value.focus();

  term.value.onKey(e => {
    const key = e.domEvent.keyCode === 13 ? '\n' : e.key;
    onKeyCallback(key);
  });

  // 自动适应容器大小
  termResizeObserver.value = new ResizeObserver(() => {
    if (term.value && fitAddon.value) fitAddon.value.fit();
  });
  termResizeObserver.value.observe(terminalRef.value);

  return term.value;
};

const write = (
  data: string | number | object,
  level: LogLevel | 'default' = 'default',
  ln = true,
) => {
  if (!term.value) return;

  let text = typeof data === 'object' ? JSON.stringify(data, null, 2) : data.toString();
  if (level !== 'default') text = `${LOG_LEVELS[level]}${text}${LOG_LEVELS.log}`;
  ln ? term.value.writeln(text) : term.value.write(text);
};

const clear = () => {
  if (term.value) {
    term.value.clear(); // 清屏
    term.value.reset(); // 重置终端状态（光标、样式等）
  }
};

const dispose = () => {
  if (termResizeObserver.value && terminalRef.value) {
    termResizeObserver.value.unobserve(terminalRef.value);
    termResizeObserver.value.disconnect();
  }

  term.value?.dispose();
  term.value = null;
  fitAddon.value = null;
  webLinksAddon.value = null;
  termResizeObserver.value = null;
};

onBeforeUnmount(dispose);

defineExpose({
  init,
  write,
  clear,
  dispose,
});
</script>

<style lang="less" scoped>
.terminal {
  width: 100%;
  height: 100%;
}
</style>
