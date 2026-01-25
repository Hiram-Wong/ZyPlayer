<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachMainContent}`"
    placement="center"
    destroy-on-close
    lazy
  >
    <template #header>
      {{ $t('pages.player.setting.title') }}
    </template>
    <template #body>
      <t-form
        ref="formRef"
        :data="formData"
        :rules="RULES"
        :label-width="120"
        required-mark-position="right"
        label-align="left"
        reset-type="initial"
        @submit="onSubmit"
      >
        <t-form-item :label="$t('pages.player.setting.skipHeadAndEnd')" name="skipHeadAndEnd">
          <t-radio-group v-model="formData.skipHeadAndEnd" variant="default-filled">
            <t-radio-button :value="true">{{ $t('common.on') }}</t-radio-button>
            <t-radio-button :value="false">{{ $t('common.off') }}</t-radio-button>
          </t-radio-group>
        </t-form-item>
        <t-form-item
          v-if="formData.skipHeadAndEnd"
          :label="$t('pages.player.setting.skipStart')"
          name="skipTimeInStart"
        >
          <div class="input-horizontal-item">
            <t-input-number v-model="formData.skipTimeInStart" theme="normal" :min="0" auto-width>
              <template #suffix>{{ $t('common.unit.s') }}</template>
            </t-input-number>
            <t-button theme="default" @click="handleGetTime('start')">{{ $t('common.gain') }}</t-button>
          </div>
        </t-form-item>
        <t-form-item v-if="formData.skipHeadAndEnd" :label="$t('pages.player.setting.skipEnd')" name="skipTimeInEnd">
          <div class="input-horizontal-item">
            <t-input-number v-model="formData.skipTimeInEnd" theme="normal" :min="0" auto-width>
              <template #suffix>{{ $t('common.unit.s') }}</template>
            </t-input-number>
            <t-button theme="default" @click="handleGetTime('end')">{{ $t('common.gain') }}</t-button>
          </div>
        </t-form-item>
        <t-form-item
          v-if="['film'].includes(formType)"
          :label="$t('pages.player.setting.playNextEnabled')"
          name="playNextEnabled"
        >
          <t-radio-group v-model="formData.playNextEnabled" variant="default-filled">
            <t-radio-button :value="true">{{ $t('common.on') }}</t-radio-button>
            <t-radio-button :value="false">{{ $t('common.off') }}</t-radio-button>
          </t-radio-group>
        </t-form-item>
        <t-form-item
          v-if="['film'].includes(formType)"
          :label="$t('pages.player.setting.playNextPreload')"
          name="playNextPreload"
        >
          <t-radio-group v-model="formData.playNextPreload" variant="default-filled">
            <t-radio-button :value="true">{{ $t('common.on') }}</t-radio-button>
            <t-radio-button :value="false">{{ $t('common.off') }}</t-radio-button>
          </t-radio-group>
        </t-form-item>
        <t-form-item :label="$t('pages.player.setting.skipAd')" name="skipAd">
          <t-radio-group v-model="formData.skipAd" variant="default-filled">
            <t-radio-button :value="true">{{ $t('common.on') }}</t-radio-button>
            <t-radio-button :value="false">{{ $t('common.off') }}</t-radio-button>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </template>
    <template #footer>
      <t-button theme="default" variant="base" @click="handleReset">{{ $t('common.reset') }}</t-button>
      <t-button theme="primary" variant="base" @click="handleSubmit">{{ $t('common.confirm') }}</t-button>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { attachMainContent } from '@/config/global';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: '',
  },
  data: {
    type: Object,
    default: () => {},
  },
  time: {
    type: Object,
    default: () => {},
  },
});

const emits = defineEmits(['update:visible', 'change']);

const RULES = {
  skipHeadAndEnd: [{ required: true }],
  skipTimeInStart: [{ required: true }],
  skipTimeInEnd: [{ required: true }],
  playNextEnabled: [{ required: true }],
  playNextPreload: [{ required: true }],
  skipAd: [{ required: true }],
};

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref(false);
const formData = ref(props.data);
const formTime = ref(props.time);
const formType = ref(props.type);

watch(
  () => formVisible.value,
  (val) => emits('update:visible', val),
);
watch(
  () => props.visible,
  (val) => (formVisible.value = val),
);
watch(
  () => props.type,
  (val) => (formType.value = val),
);
watch(
  () => props.data,
  (val) => (formData.value = val),
);
watch(
  () => props.time,
  (val) => (formTime.value = val),
);

const handleGetTime = (type: 'start' | 'end') => {
  if (type === 'start') {
    formData.value.skipTimeInStart = Math.floor(formTime.value.currentTime ?? 0);
  } else if (type === 'end') {
    formData.value.skipTimeInEnd = Math.floor((formTime.value.duration ?? 0) - (formTime.value.currentTime ?? 0));
  }
};

const handleExecute = () => {
  emits('change', { ...formData.value });
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
.input-horizontal-item {
  display: flex;
  // justify-content: space-between;
  align-items: center;
  gap: var(--td-size-4);
  width: 100%;
}
</style>
