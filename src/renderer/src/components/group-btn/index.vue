<template>
  <t-radio-group v-model="opMethod.radio" variant="default-filled" @change="handleOpRadioChange">
    <template v-for="(item, index) in formData" :key="index">
      <t-radio-button v-if="!isArray(item.value)" :value="item.value">
        {{ item.label }}
      </t-radio-button>
      <t-select
        v-else
        v-model="opMethod[toRaw(item.label)]"
        auto-width
        @change="handleOpSelectChange(item.label, $event)"
      >
        <t-option
          v-for="(subItem, subIndex) in item.value"
          :key="subIndex"
          :label="subItem.label"
          :value="subItem.value"
        />
      </t-select>
    </template>
  </t-radio-group>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'GroupBtn',
});

const props = defineProps({
  data: {
    type: Array as PropType<IOpProps>,
    default: () => [],
  },
});

const emits = defineEmits(['change']);

import { isArray } from '@shared/modules/validate';
import type { PropType } from 'vue';
import { ref, toRaw, watch } from 'vue';

interface IOpItem {
  label: string;
  value: string;
}
type IOpProps = Array<{
  label: string;
  value: string | IOpItem[];
}>;

const formData = ref<IOpProps>(props.data);
const opMethod = ref<Record<string, string>>({
  radio: '',
  ...props.data
    .filter((item) => isArray(item.value))
    .reduce(
      (prev, { label }) => {
        prev[label] = label;
        return prev;
      },
      {} as Record<string, string>,
    ),
});

watch(
  () => props.data,
  (val) => {
    formData.value = val;

    opMethod.value = {
      radio: '',
      ...val
        .filter((item) => isArray(item.value))
        .reduce(
          (prev, { label }) => {
            prev[label] = label;
            return prev;
          },
          {} as Record<string, string>,
        ),
    };
  },
  { deep: true },
);

const handleOpRadioChange = (val: string) => {
  emits('change', val);
  opMethod.value = { ...opMethod.value, radio: '' };
};

const handleOpSelectChange = (label: string, val: string) => {
  emits('change', val);
  // const core = props.data.find((item) => item.value === label) as IOpItem;
  opMethod.value = { ...opMethod.value, [label]: label, radio: '' };
};
</script>
<style scoped lang="less">
:deep(.t-select__wrap) {
  width: fit-content;

  .t-input--auto-width {
    min-width: 44px;
  }

  &:hover {
    .t-input__inner {
      color: var(--td-text-color-primary);
    }
  }

  .t-input__inner {
    color: var(--td-text-color-secondary);
    font: var(--td-font-body-medium);
  }

  .t-input {
    height: calc(var(--td-comp-size-m) - (var(--td-comp-paddingTB-xxs) * 2));
    border-width: 0 !important;

    .t-input__suffix:not(:empty) {
      display: none;
    }
  }
}
</style>
