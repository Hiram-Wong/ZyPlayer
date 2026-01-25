<template>
  <div class="lab-crypto-encode view-component-container">
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('common.input') }}</p>
        <t-form
          ref="formRef"
          :data="formData"
          :rules="RULES"
          :label-width="0"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
        >
          <t-form-item :label="t('common.content')" name="input">
            <t-textarea
              v-model="formData.input"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('common.placeholder.input')"
            />
          </t-form-item>
        </t-form>
      </div>
      <div class="action">
        <p class="title-label">{{ $t('common.action') }}</p>
        <div class="content-action">
          <t-button theme="default" variant="base" block @click="handleSubmit('encode')">
            {{ $t('common.encode') }}
          </t-button>
          <t-button theme="primary" variant="base" block @click="handleSubmit('decode')">
            {{ $t('common.decode') }}
          </t-button>
        </div>
      </div>
      <div class="output">
        <p class="title-label">{{ $t('common.output') }}</p>
        <div class="content-output">
          <t-textarea
            v-model="output"
            :autosize="{ minRows: 3, maxRows: 5 }"
            readonly
            class="output-textarea"
            @click="handleCopy"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { base64, gzip, hex, html, unicode, url } from '@shared/modules/crypto';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef, watch } from 'vue';

import { t } from '@/locales';

const props = defineProps({
  active: {
    type: String,
    default: 'rsa',
  },
});

const RULES = {
  input: [{ required: true }],
};

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

const formData = ref({
  input: '',
});
const output = ref('');
const active = ref({
  action: 'html',
  execute: '',
});

watch(
  () => props.active,
  (val) => {
    active.value.action = val;
    defaultConf();
  },
);

const defaultConf = () => {
  output.value = '';
};

const handleExecute = () => {
  try {
    const execute = active.value.execute;
    const { input } = formData.value;
    if (!input) return;

    const action = active.value.action;
    const METHOD_MAP = { html, unicode, base64, url, hex, gzip };

    output.value = METHOD_MAP[action][execute]({ src: input });

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    console.error(error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleCopy = async (e: Event) => {
  const val = (e.target as HTMLTextAreaElement).value;
  if (!val) return;

  try {
    await navigator.clipboard.writeText(val);
    MessagePlugin.info(t('common.copySuccess'));
  } catch (error) {
    output.value = '';
    MessagePlugin.error(`${t('common.error')}:  ${(error as Error).message}`);
  }
};

const onSubmit = (context: SubmitContext<FormData>) => {
  const { validateResult, firstError } = context;
  if (validateResult && typeof validateResult === 'boolean') {
    handleExecute();
  } else {
    MessagePlugin.warning(firstError!);
  }
};

const handleSubmit = (type: 'encode' | 'decode') => {
  active.value.execute = type;

  formRef.value?.submit();
};
</script>
<style lang="less" scoped>
.view-component-container {
  padding: 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingTB-s) 0;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);
  overflow-y: auto;

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);

    .input {
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      .t-form {
        > :last-child.t-form__item-with-extra {
          margin-bottom: var(--td-line-height-body-small);
        }
      }
    }

    .action {
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      .content-action {
        display: flex;
        gap: var(--td-size-4);
      }
    }

    .output {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      .content-output {
        flex: 1;

        .output-textarea {
          height: 100%;

          :deep(textarea) {
            height: 100% !important;
            min-height: 200px !important;
          }
        }
      }
    }
  }
}
</style>
