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
      {{ $t('pages.setting.barrage.title') }}
    </template>
    <template #body>
      <div class="barrage view-container">
        <t-form
          ref="formRef"
          :data="formData.data"
          :rules="RULES"
          :label-width="80"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
        >
          <div class="data-item">
            <p class="title-label data-title">{{ $t('pages.setting.barrage.param.base') }}</p>
            <div class="data-main data-base">
              <t-form-item name="url">
                <template #label>
                  {{ $t('common.api') }}
                  <t-popup destroy-on-close attach=".t-form-item__url" :content="$t('pages.setting.barrage.popup.url')">
                    <info-circle-icon />
                  </t-popup>
                </template>
                <t-input v-model="formData.data.url" />
              </t-form-item>
              <t-form-item name="id">
                <template #label>
                  {{ $t('common.id') }}
                  <t-popup
                    destroy-on-close
                    attach=".t-form-item__id"
                    :content="$t('pages.setting.barrage.popup.nested')"
                  >
                    <info-circle-icon />
                  </t-popup>
                </template>
                <t-input v-model="formData.data.id" />
              </t-form-item>
              <t-form-item name="key">
                <template #label>
                  {{ $t('pages.setting.barrage.field.key') }}
                  <t-popup
                    destroy-on-close
                    attach=".t-form-item__key"
                    :content="$t('pages.setting.barrage.popup.nested')"
                  >
                    <info-circle-icon />
                  </t-popup>
                </template>
                <t-input v-model="formData.data.key" />
              </t-form-item>
              <!-- <t-form-item :label="$t('pages.setting.barrage.field.support')" name="support">
              <t-tag-input v-model="formData.data.support" clearable @change="handleFlagFilter" />
            </t-form-item> -->
            </div>
          </div>
          <div class="data-item">
            <p class="title-label data-title">{{ $t('pages.setting.barrage.param.map') }}</p>
            <div class="data-tips">
              <p class="data-tip">{{ $t('pages.setting.barrage.tip.map') }}</p>
            </div>
            <div class="data-main data-map">
              <t-form-item :label="$t('pages.setting.barrage.field.type')" name="type">
                <t-input-number v-model="formData.data.type" theme="column" :min="0" />
              </t-form-item>
              <t-form-item :label="$t('pages.setting.barrage.field.text')" name="text">
                <t-input-number v-model="formData.data.text" theme="column" :min="0" />
              </t-form-item>
              <t-form-item :label="$t('pages.setting.barrage.field.time')" name="time">
                <t-input-number v-model="formData.data.time" theme="column" :min="0" />
              </t-form-item>
              <t-form-item :label="$t('pages.setting.barrage.field.color')" name="color">
                <t-input-number v-model="formData.data.color" theme="column" :min="0" />
              </t-form-item>
            </div>
          </div>
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
defineOptions({
  name: 'SettingBaseDialogBarrage',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({
      data: { url: '', id: '', key: '', support: [], type: '', text: '', time: '', color: '' },
    }),
  },
});
const emits = defineEmits(['update:visible', 'submit']);

import { InfoCircleIcon } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { attachContent } from '@/config/global';

const RULES = {
  url: [{ required: true }, { url: { protocols: ['http', 'https'], require_protocol: true } }],
  id: [{ required: true }],
  key: [{ required: true }],
  support: [{ required: true }],
  type: [{ required: true }],
  text: [{ required: true }],
  time: [{ required: true }],
  color: [{ required: true }],
};
const TYPE = 'barrage';

const formVisible = ref(false);
const formData = ref(props.data);
const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

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

// const handleFlagFilter = (value: string[]) => {
//   formData.value.data.support = [...new Set(value)];
// };

const handleExecute = () => {
  emits('submit', TYPE, formData.value.data);
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

  .data-item {
    & + .data-item {
      margin-top: var(--td-comp-margin-xxl);
    }

    .data-title {
      margin-bottom: var(--td-comp-margin-xxs);

      &:not(:first-child) {
        margin-top: var(--td-comp-margin-xxs);
      }
    }

    .data-tips {
      margin: var(--td-comp-margin-xxs) 0;
      color: var(--td-text-color-secondary);
      font: var(--td-font-link-small);
    }

    .data-main {
      &.data-map {
        display: flex;
        flex-wrap: wrap;
        gap: var(--td-size-8);

        .t-form__item {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
