<template>
  <t-input v-bind="attrsCustom" v-model="displayValue">
    <template v-for="slot in slotsCustom" #[slot.name]="slotProps">
      <slot :name="slot.name" v-bind="slotProps"></slot>
    </template>
  </t-input>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'InputShortcut',
});

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

import type { Input, InputProps } from 'tdesign-vue-next';
import { computed, onMounted, ref, useAttrs, useSlots, watch } from 'vue';

import { isMacOS } from '@/utils/systeminfo';

const attrs: Partial<InputProps> = useAttrs();
const slots = useSlots();

const inputRef = ref<InstanceType<typeof Input>>();
const readonly = ref<InputProps['readonly']>(false);

const formatData = ref({ data: props.modelValue, raw: props.modelValue });
const tmpVal = ref<Array<string>>([]);

const attrsCustom = computed(
  () =>
    ({
      ref: inputRef,
      clearable: true,
      readonly: readonly.value,
      onClear: handleClear,
      onKeydown: handleKeyDown,
      onKeyup: handleKeyUp,
      ...attrs,
    }) as Partial<InputProps>,
);
const slotsCustom = computed(() => {
  const slotsExclude: Array<string> = [];
  return Object.keys(slots)
    .filter((key) => !slotsExclude.includes(key))
    .map((name) => ({ name }));
});
const displayValue = computed({
  get: () => formatShortcut(formatData.value.data),
  set: (val: string) => (formatData.value.data = val),
});

watch(
  () => props.modelValue,
  (newVal) => setupValue(newVal),
);

onMounted(() => {
  setupValue(props.modelValue);
});

/**
 * 设置快捷键值
 * @param {string} val - 快捷键字符串
 * @description
 * - 将快捷键字符串分割为数组，去重后检查是否有效
 * - 如果有效，更新格式化数据并触发更新事件
 * - 如果无效，清空格式化数据
 */
const setupValue = (val: string): void => {
  const splitVal = [...new Set((val || '').split(' + '))];
  if (splitVal.length === 0) return;

  const isValid = isValidShortcut(splitVal);
  if (isValid) {
    const res = splitVal.join(' + ');
    formatData.value = { data: res, raw: res };
    (inputRef.value as unknown as HTMLInputElement)?.blur();
    if (res !== val) emit('update:modelValue', res);
  } else {
    formatData.value = { data: '', raw: '' };
  }
  tmpVal.value = [];
};

/**
 * 格式化快捷键字符串
 * @param {string} val - 快捷键字符串
 * @returns {string} 格式化后的快捷键字符串
 * @description
 * - 替换箭头键为对应符号
 * - 根据平台替换特殊按键（Mac使用⌘、⌥、⌃、⇧）
 */
const formatShortcut = (val: string): string => {
  if (!val) return '';

  let shortcut = val
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓')
    .replace('ArrowRight', '→')
    .replace('ArrowLeft', '←');

  if (isMacOS) {
    shortcut = shortcut
      .replace(/Meta/g, '⌘')
      .replace(/Alt/g, '⌥')
      .replace(/Control/g, '⌃')
      .replace(/Shift/g, '⇧');
  }

  return shortcut;
};

/**
 * 检查快捷键是否有效
 * @param {Array<string>} val - 快捷键数组
 * @returns {boolean} 是否有效
 * @description
 * - 必须包含至少一个特殊按键（Control、Alt、Shift、Meta）
 * - 必须包含至少一个公共按键（字母、数字、功能键、箭头键等）
 */
const isValidShortcut = (val: Array<string>): boolean => {
  const specialKeys = ['Control', 'Alt', 'Shift', 'Meta'];
  const publicKeys = [
    ...['`', '-', '=', '[', ']', '\\', ';', "'", ',', '.', '/', '*'], // punctuation
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), // letter
    ...'0123456789'.split(''), // number
    ...Array.from({ length: 12 }, (_, i) => `F${i + 1}`), // f1-f12
    ...['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'], // arrow
    ...['Space', 'Escape', 'Tab', 'Backspace', 'Enter'], // control
  ];

  const hasSpecialKey = val.some((key) => specialKeys.includes(key));
  const hasPublicKey = val.some((key) => publicKeys.includes(key));

  return hasSpecialKey && hasPublicKey;
};

const keyCodeToKey = (code: string): string => {
  const punctuationMap: Record<string, string> = {
    Backquote: '`',
    Minus: '-',
    Equal: '=',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Semicolon: ';',
    Quote: "'",
    Comma: ',',
    Period: '.',
    Slash: '/',
  };
  const numpadMap: Record<string, string> = {
    Add: '+',
    Subtract: '-',
    Multiply: '*',
    Divide: '/',
    Decimal: '.',
  };

  if (/^(?:Digit|Numpad)\d+$/i.test(code)) return code.replace(/^(Digit|Numpad)/, '');
  if (/^Key[A-Z]$/i.test(code)) return code.replace('Key', '');
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(code)) return code;
  if (punctuationMap[code]) return punctuationMap[code];
  if (/^Numpad(?:Add|Subtract|Multiply|Divide|Decimal)$/.test(code)) return numpadMap[code.replace('Numpad', '')];
  if (/^F[1-9][0-2]?$/.test(code)) return code;
  if (/^(?:Shift|Control|Alt|Meta)(?:Left|Right)$/i.test(code)) return code.replace(/(Left|Right)/, '');
  if (['Space', 'Escape', 'Tab', 'Backspace', 'Enter'].includes(code)) return code;

  return '';
};

/**
 * 处理清除操作
 * @param {MouseEvent} context - 事件上下文
 * @description
 * - 阻止默认事件和冒泡
 * - 设置只读状态为true
 * - 清空格式化数据和临时值
 * - 触发输入框失焦
 * - 更新modelValue为''
 * - 恢复只读状态为false
 */
const handleClear = (context: { e: MouseEvent }) => {
  const e = context.e;
  e.preventDefault();
  e.stopPropagation();

  readonly.value = true;

  formatData.value = { data: '', raw: '' };
  tmpVal.value = [];
  (inputRef.value as unknown as HTMLInputElement)?.blur();
  emit('update:modelValue', '');

  readonly.value = false;
};

/**
 * 处理按键按下事件
 * @param {any} _value - 未使用的值
 * @param {object} context - 事件上下文
 * @param {KeyboardEvent} context.e - 键盘事件
 * @description
 * - 阻止默认事件
 * - 设置只读状态为true
 * - 获取按键代码并转换为对应的按键名称
 * - 将按键名称添加到临时值数组中，去重后更新格式化数据
 */
const handleKeyDown = (_value: any, context: { e: KeyboardEvent }) => {
  const { e } = context;
  e.preventDefault();

  readonly.value = true;

  const key = keyCodeToKey(e.code);

  if (key) {
    tmpVal.value.push(key);
    const uniqueKeys = [...new Set(tmpVal.value)];
    formatData.value.data = uniqueKeys.join(' + ');
  }
};

/**
 * 处理按键松开事件
 * @param {any} _value - 未使用的值
 * @param {object} context - 事件上下文
 * @param {KeyboardEvent} context.e - 键盘事件
 * @description
 * - 阻止默认事件
 * - 如果临时值数组为空，直接返回
 * - 检查快捷键是否有效，如果有效，格式化数据并触发更新事件
 * - 如果无效，恢复格式化数据为原始值
 * - 清空临时值数组
 * - 恢复只读状态为false
 */
const handleKeyUp = (_value: any, context: { e: KeyboardEvent }) => {
  const { e } = context;
  e.preventDefault();

  const val = [...new Set(tmpVal.value)];
  if (val.length === 0) return;

  if (isValidShortcut(val)) {
    const res = val.join(' + ');
    formatData.value = { data: res, raw: res };
    (inputRef.value as unknown as HTMLInputElement)?.blur();
    emit('update:modelValue', res);
  } else {
    formatData.value.data = formatData.value.raw;
  }
  tmpVal.value = [];

  readonly.value = false;
};

defineExpose({ inputRef, isValidShortcut });
</script>
<style lang="less" scoped></style>
