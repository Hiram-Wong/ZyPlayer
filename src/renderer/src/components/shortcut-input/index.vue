<template>
  <t-input
    ref="shortcutInputRef"
    v-model="shortcutVal"
    v-bind="attrsCustom"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
  >
    <template #suffix>
      <div @click.stop="cancelShortcut">
        <close-icon />
      </div>
    </template>
  </t-input>
</template>

<script lang="ts" setup>
import { ref, computed, useAttrs, watch } from 'vue';
import { CloseIcon } from 'tdesign-icons-vue-next';

import { t } from '@/locales';

const attrs = useAttrs();
const attrsCustom = computed(() => {
  return {
    placeholder: t('pages.setting.placeholder.shortcutInput'),
    tips: tip.value,
    status: status.value,
    ...attrs
  }
});
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['update:modelValue']);

const modelValue = ref(props.modelValue);
const tip = ref('');
const status = ref('default');
const tmp = ref({ origin: '' });

const shortcutVal = computed({
  get: () => handleShortcutFormat(modelValue.value),
  set: (val: string) => {
    modelValue.value = val;
  },
});

watch(
  () => props.modelValue,
  (val) => {
    modelValue.value = val;
  }
);

watch(
  () => modelValue.value,
  (val) => {
    if (!val) {
      tip.value = '';
      status.value = 'default';
      emits('update:modelValue', val);
    } else {
      const isValid = checkShortcut(val);
      tip.value = isValid ? '' : t('pages.setting.placeholder.shortcutErrCompliance');
      status.value = isValid ? 'default' : 'error';
      if (isValid) {
        emits('update:modelValue', val);
        tmp.value.origin = val;
      }
    }
  },
  { immediate: true }
);


const platform = (() => {
  const platform = (navigator as any).userAgentData.platform;
  if (platform === 'Windows') return 'win32';
  if (platform === 'macOS') return 'darwin';
  if (platform === 'Linux') return 'linux';
  return 'unknown';
})();

const handleShortcutFormat = (str: string): string => {
  let shortcut = str
    .replaceAll('+', ' + ')
    .replace('Up', '↑')
    .replace('Down', '↓')
    .replace('Right', '→')
    .replace('Left', '←')
    .replace('Space', '空格');

  if (platform === 'darwin') {
    shortcut = shortcut
      .replace(/CommandOrControl|Command|Meta/g, '⌘')
      .replace(/Alt/g, '⌥')
      .replace(/Control/g, '⌃')
      .replace(/Shift/g, '⇧');
  } else {
    shortcut = shortcut.replace('CommandOrControl', 'Ctrl');
  }

  return shortcut;
};

const checkShortcut = (val: string): boolean => {
  const specialKeys = ['Ctrl', 'Alt', 'Shift', 'Meta'];
  const publicKeys = [
    '=', '-', '~', '[', ']', ';', "'", ',', '.', '/', // 标点符号
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), // A-Z
    ...Array.from({ length: 10 }, (_, i) => i.toString()), // 0-9
    ...Array.from({ length: 11 }, (_, i) => `F${(i+1).toString()}`), // F1-F12
    'Space', // 空格
    'Right', 'Left', 'Up', 'Down', // 方向键
  ];

  const keys = val.split('+').map((key) => key.trim());
  const hasSpecialKey = keys.some((key) => specialKeys.includes(key));
  const hasPublicKey = keys.some((key) => publicKeys.includes(key));

  return hasSpecialKey && hasPublicKey;
};

const handleKeyDown = (_value: any, context: { e: KeyboardEvent }) => {
  const { e } = context;
  e.preventDefault();

  const auxiliaryKey = [
    e.ctrlKey && 'Ctrl',
    e.altKey && 'Alt',
    e.shiftKey && 'Shift',
    e.metaKey && 'Meta',
  ].filter(Boolean) as string[];

  let publicKey: string = '';
  if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) {
    publicKey = e.key.toUpperCase(); // 普通字母和数字
  } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    publicKey = e.key.replace('Arrow', '');
  } else if (['=', '-', '~', '[', ']', ';', "'", ',', '.', '/'].includes(e.key)) {
    publicKey = e.key;
  } else if (e.key.startsWith('F') && e.key.match(/^F[1-9][0-2]?$/)) {
    publicKey = e.key; // F1-F12
  } else if (e.key === ' ') {
    publicKey = 'Space'; // 空格
  }
  modelValue.value = [...auxiliaryKey, publicKey].filter(Boolean).join('+');
};

const handleKeyUp = (_value: any, context: { e: KeyboardEvent }) => {
  const { e } = context;
  e.preventDefault();

  modelValue.value = tmp.value.origin;
};

const cancelShortcut = () => {
  modelValue.value = '';
  tmp.value.origin = '';
};
</script>

<style lang="less" scoped></style>
