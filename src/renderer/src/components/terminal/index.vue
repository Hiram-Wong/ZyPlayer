<template>
  <div ref="terminalRef" class="terminal"></div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'Terminal',
});

const props = defineProps({
  options: {
    type: Object as PropType<ITerminalOptions>,
    default: () => ({}),
  },
  console: {
    type: Boolean,
    default: false,
  },
  onKeyCallback: {
    type: Function as PropType<(key: string) => void>,
    default: (_key: string) => {},
  },
  onLinkClickCallback: {
    type: Function as PropType<(uri: string) => void>,
    default: (_uri: string) => {},
  },
});

import '@xterm/xterm/css/xterm.css';

import type { LogLevel } from '@shared/config/logger';
import { ANSICOLORS, LEVEL, LEVEL_COLOR_MAP } from '@shared/config/logger';
import { toString } from '@shared/modules/toString';
import { isJsonStr } from '@shared/modules/validate';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import type { ITerminalOptions } from '@xterm/xterm';
import { Terminal } from '@xterm/xterm';
import JSON5 from 'json5';
import type { PropType } from 'vue';
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import { SearchBarAddon } from 'xterm-addon-search-bar';

import { isMacOS } from '@/utils/systeminfo';

export type { ITerminalOptions } from '@xterm/xterm';

export type ITerminal = Terminal;
export type ITerminalLog = LogLevel;
type ITerminalConsoleLog = Exclude<LogLevel, 'verbose' | 'silly' | 'none'> | 'log';

const terminalRef = useTemplateRef<HTMLElement>('terminalRef');

const options = ref<ITerminalOptions>(props.options);

const term = ref<Terminal>();
const fitAddon = ref<FitAddon>();
const searchAddon = ref<SearchAddon>();
const searchBarAddon = ref<SearchBarAddon>();
const webLinksAddon = ref<WebLinksAddon>();
const webglAddon = ref<WebglAddon>();

const resizeObserver = ref<ResizeObserver>();
const visibleObserver = ref<IntersectionObserver>();

watch(
  () => props.options,
  (val) => (options.value = val),
  { deep: true },
);

watch(
  () => options.value,
  (val) => {
    if (term.value) Object.assign(term.value.options, val);
  },
  { deep: true },
);

onMounted(() => setup());
onUnmounted(() => dispose());

const setup = () => {
  nextTick(() => {
    const terminal = new Terminal(options.value);

    const fit = new FitAddon();
    const search = new SearchAddon();
    const searchBar = new SearchBarAddon({ searchAddon: search as any });
    const weblinks = new WebLinksAddon((event, uri) => {
      event.preventDefault();

      const modifierPressed = isMacOS ? event.metaKey : event.ctrlKey;
      if (modifierPressed) props.onLinkClickCallback?.(uri);
    });
    const webgl = new WebglAddon();

    terminal.loadAddon(fit);
    terminal.loadAddon(weblinks);
    terminal.loadAddon(webgl);
    terminal.loadAddon(search);
    terminal.loadAddon(searchBar as any);

    terminal.open(terminalRef.value!);
    terminal.focus();
    fit.fit();

    terminalRef.value?.addEventListener('keydown', handleKeyDown, true);

    terminal.onKey((e: { key: string; domEvent: KeyboardEvent }) => {
      const ev = e.domEvent;
      const key = ev.key === 'Enter' ? '\n' : e.key;

      props.onKeyCallback?.(key);
    });

    resizeObserver.value = new ResizeObserver(() => {
      if (term.value && fitAddon.value) fitAddon.value.fit();
    });
    resizeObserver.value.observe(terminalRef.value!);

    visibleObserver.value = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          fitAddon.value?.fit();
        }
      }
    });
    visibleObserver.value.observe(terminalRef.value!);

    term.value = terminal;
    fitAddon.value = fit;
    searchAddon.value = search;
    searchBarAddon.value = searchBar;
    webLinksAddon.value = weblinks;
    webglAddon.value = webgl;
  });
};

const colorText = (text: string, color: string) => {
  return ANSICOLORS[color] + text + ANSICOLORS.END;
};

const write = (val: unknown, level: ITerminalLog = LEVEL.VERBOSE, ln: boolean = true, prefix?: string) => {
  let content = toString(val);
  if (isJsonStr(content)) content = JSON.stringify(JSON5.parse(content), null, 2);
  const text = colorText(colorText(content, LEVEL_COLOR_MAP[level]), 'BOLD');

  if (term.value) {
    if (prefix) term.value.write(prefix);
    ln ? term.value.writeln(text) : term.value.write(text);
  }

  if (props.console) {
    const allowedLevels: ITerminalConsoleLog[] = [LEVEL.ERROR, LEVEL.WARN, LEVEL.INFO, LEVEL.DEBUG];
    const consoleLevel: ITerminalConsoleLog = allowedLevels.includes(level as ITerminalConsoleLog)
      ? (level as ITerminalConsoleLog)
      : 'log';

    const logArgs = prefix ? [prefix, val] : [val];
    console[consoleLevel](...logArgs);
  }
};

const clear = () => {
  term.value?.clear();
  term.value?.reset();
};

const dispose = () => {
  if (resizeObserver.value && terminalRef.value) {
    resizeObserver.value.unobserve(terminalRef.value);
    resizeObserver.value.disconnect();
  }
  if (visibleObserver.value && terminalRef.value) {
    visibleObserver.value.unobserve(terminalRef.value);
    visibleObserver.value.disconnect();
  }

  try {
    fitAddon.value?.dispose();
    searchAddon.value?.dispose();
    searchBarAddon.value?.dispose();
    webLinksAddon.value?.dispose();
    webglAddon.value?.dispose();
    term.value?.dispose();
  } catch {}

  terminalRef.value?.removeEventListener('keydown', handleKeyDown, true);

  fitAddon.value = undefined;
  searchAddon.value = undefined;
  searchBarAddon.value = undefined;
  webLinksAddon.value = undefined;
  webglAddon.value = undefined;

  term.value = undefined;

  resizeObserver.value = undefined;
  visibleObserver.value = undefined;
};

const focus = () => {
  term.value?.focus();
  fitAddon.value?.fit();
};

const handleKeyDown = (ev: KeyboardEvent) => {
  const key = ev.key.toLowerCase();

  if ((isMacOS && ev.metaKey && key === 'f') || (!isMacOS && ev.ctrlKey && key === 'f')) {
    ev.preventDefault();

    searchBarAddon.value?.show();
  }
};

defineExpose({
  clear,
  dispose,
  focus,
  write,
});
</script>
<style lang="less" scoped>
.terminal {
  width: 100%;
  height: 100%;
  overflow: hidden;

  :deep(.xterm) {
    height: 100%;
    padding-left: var(--td-comp-paddingLR-s);

    .xterm-scrollable-element {
      height: 100%;
      margin-left: calc(0px - var(--td-comp-paddingLR-s));
      padding-left: var(--td-comp-paddingLR-s);
    }

    .xterm-viewport {
      background-color: var(--td-bg-content-input-1) !important;
    }
  }

  :deep(.xterm-search-bar__addon) {
    box-shadow: var(--td-shadow-1);
    background-color: var(--td-bg-color-component-hover);
    transition: transform 200ms linear;
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-xs);

    .search-bar__input {
      background-color: var(--td-bg-color-component);
      color: var(--td-text-color-primary);
      border-radius: var(--td-radius-default);
      border-width: 1px;
      border-style: solid;
      border-color: transparent;

      &:focus {
        outline: none;
        border-color: var(--td-brand-color);
        box-shadow: 0 0 0 1px var(--td-brand-color-focus);
      }
    }

    .search-bar__btn {
      background-color: transparent;
      border-radius: var(--td-radius-default);
      margin-left: var(--td-comp-margin-xs);

      &.prev {
        margin-left: var(--td-comp-margin-xs);
      }
    }
  }
}
</style>
