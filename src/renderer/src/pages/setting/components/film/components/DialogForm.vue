<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachContent}`"
    placement="center"
    destroy-on-close
    lazy
  >
    <template #header>
      {{ formType === 'add' ? $t('common.add') : $t('common.edit') }}
    </template>
    <template #body>
      <div class="form view-container">
        <t-form
          ref="formRef"
          :data="formData"
          :rules="RULES"
          :label-width="80"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
        >
          <t-form-item :label="$t('common.name')" name="name">
            <t-input v-model="formData.name" />
          </t-form-item>
          <t-form-item :label="$t('common.id')" name="key">
            <div class="input-horizontal-item">
              <t-input v-model="formData.key" style="flex: 1" />
              <t-button theme="default" @click="randomKeyEvent">{{ $t('common.random') }}</t-button>
            </div>
          </t-form-item>
          <t-form-item :label="$t('common.type')" name="type">
            <t-select v-model="formData.type" :options="TYPE_OPTIONS" @change="changeTypeEvent" />
          </t-form-item>
          <t-form-item :label="$t('common.api')" name="api">
            <t-input v-model="formData.api" />
          </t-form-item>
          <t-form-item :label="$t('common.search')" name="search">
            <t-radio-group v-model="formData.search" variant="default-filled">
              <t-radio-button :value="true">{{ $t('common.on') }}</t-radio-button>
              <t-radio-button :value="false">{{ $t('common.off') }}</t-radio-button>
            </t-radio-group>
          </t-form-item>
          <t-form-item :label="$t('pages.film.field.playUrl')" name="playUrl">
            <t-input v-model="formData.playUrl" />
          </t-form-item>
          <t-form-item :label="$t('common.group')" name="group">
            <t-select v-model="formData.group" creatable filterable @create="createOptions">
              <t-option
                v-for="item in formGroup"
                :key="item.value"
                :value="item.value"
                :label="item.label"
                class="select-options"
              />
            </t-select>
          </t-form-item>
          <t-form-item :label="$t('pages.film.field.category')" name="category">
            <t-textarea
              v-model="formData.categories"
              :placeholder="$t('common.placeholder.inputSplit', [','])"
              :autosize="{ minRows: 1, maxRows: 3 }"
            />
          </t-form-item>
          <t-form-item :label="$t('pages.film.field.ext')" name="ext">
            <t-textarea
              v-model="formData.ext"
              :autosize="{ minRows: 1, maxRows: 3 }"
              :placeholder="$t('common.placeholder.input')"
            />
          </t-form-item>
        </t-form>
      </div>
    </template>
    <template #footer>
      <t-button theme="default" variant="base" @click="handleReset">{{ $t('common.reset') }}</t-button>
      <t-button theme="primary" variant="base" @click="handleSubmit">{{ $t('common.confirm') }}</t-button>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import type { ISiteType } from '@shared/config/film';
import { SITE_API_MAP, SITE_TYPE } from '@shared/config/film';
import { randomUUID } from '@shared/modules/crypto';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';
import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {},
  },
  type: {
    type: String,
    default: 'add',
  },
  group: {
    type: Array<{ label: string; value: string }>,
    default: () => [],
  },
});
const emits = defineEmits(['update:visible', 'submit']);

const RULES = {
  name: [{ required: true }],
  key: [{ required: true }],
  api: [{ required: true }],
  type: [{ required: true }],
  search: [{ required: true }],
  filter: [{ required: true }],
};

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

const formVisible = ref(false);
const formData = ref(props.data);
const formType = ref(props.type);
const formGroup = ref(props.group);

const TYPE_OPTIONS = computed(() => [
  { value: SITE_TYPE.T0_XML, label: t('pages.film.field.typeMap.t0-xml') },
  { value: SITE_TYPE.T1_JSON, label: t('pages.film.field.typeMap.t1-json') },

  { value: SITE_TYPE.T3_DRPY, label: t('pages.film.field.typeMap.t3-js_drpy') },
  { value: SITE_TYPE.T3_XBPQ, label: t('pages.film.field.typeMap.t3-csp_xbpq') },
  { value: SITE_TYPE.T3_XYQ, label: t('pages.film.field.typeMap.t3-csp_xyq') },
  { value: SITE_TYPE.T3_CATOPEN, label: t('pages.film.field.typeMap.t3-js_catopen') },
  { value: SITE_TYPE.T3_APPYSV2, label: t('pages.film.field.typeMap.t3-csp_appysv2') },
  { value: SITE_TYPE.T3_PY, label: t('pages.film.field.typeMap.t3-py') },
  { value: SITE_TYPE.T3_ALIST, label: t('pages.film.field.typeMap.t3-alist') },

  // { value: SITE_TYPE.T4_DRPYJS0, label: t('pages.film.field.typeMap.t4-drpy_js0') },
  { value: SITE_TYPE.T4_DRPYS, label: t('pages.film.field.typeMap.t4-drpys') },
  { value: SITE_TYPE.T4_CATVOD, label: t('pages.film.field.typeMap.t4-catvod') },
]);

watch(
  () => formVisible.value,
  (val) => emits('update:visible', val),
);
watch(
  () => props.visible,
  (val) => (formVisible.value = val),
);
watch(
  () => props.data,
  (val) => (formData.value = val),
);
watch(
  () => props.type,
  (val) => (formType.value = val),
);
watch(
  () => props.group,
  (val) => (formGroup.value = val),
);

const createOptions = (val: string) => {
  const targetIndex = formGroup.value.findIndex((obj) => obj.value === val);
  if (targetIndex === -1) formGroup.value.push({ label: val, value: val });
};

const changeTypeEvent = (type: ISiteType) => {
  formData.value.api = SITE_API_MAP?.[type] ?? '';
};

const randomKeyEvent = () => {
  formData.value.key = randomUUID();
};

const handleExecute = () => {
  emits('submit', 'table', formData.value);
  formVisible.value = false;
};

const onSubmit = (context: SubmitContext<FormData>) => {
  const { validateResult, firstError } = context;
  if (validateResult && typeof validateResult === 'boolean') {
    handleExecute();
  } else {
    MessagePlugin.warning(firstError!);
  }
};

const handleSubmit = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  formRef.value?.reset();
};
</script>
<style lang="less" scoped>
.view-container {
  padding: 0 var(--td-comp-paddingLR-xxs) var(--td-comp-paddingTB-xxs);
  max-height: 340px;
  overflow-y: auto;

  .input-horizontal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--td-size-4);
    width: 100%;
  }

  .input-vertical-item {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
}
</style>
