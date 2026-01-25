<template>
  <div class="lab-sniffer view-component-container">
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('common.input') }}</p>
        <t-form
          ref="formRef"
          :data="formData"
          :rules="RULES"
          :label-width="80"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
          @reset="onReset"
        >
          <t-form-item :label="$t('common.url')" name="url">
            <t-input v-model="formData.url" />
          </t-form-item>
          <t-collapse class="t-form__item">
            <t-collapse-panel value="complete-import" :header="$t('common.optionalParams')">
              <t-form-item :label="$t('common.request.headers')" name="headers">
                <t-textarea
                  v-model="formData.headers"
                  :autosize="{ minRows: 2, maxRows: 5 }"
                  :placeholder="$t('common.placeholder.request.headers')"
                />
              </t-form-item>
              <t-form-item :label="$t('pages.lab.sniffer.field.initScript')" name="initScript">
                <t-textarea
                  v-model="formData.initScript"
                  :autosize="{ minRows: 2, maxRows: 5 }"
                  :placeholder="
                    $t('common.placeholder.inputEg', [
                      `Object.defineProperty(navigator, 'webdriver', { get: () => false })`,
                    ])
                  "
                />
              </t-form-item>
              <t-form-item :label="$t('pages.lab.sniffer.field.runScript')" name="runScript">
                <t-textarea
                  v-model="formData.runScript"
                  :autosize="{ minRows: 2, maxRows: 5 }"
                  :placeholder="$t('common.placeholder.inputEg', [`document.querySelector('.btn').click()`])"
                />
              </t-form-item>
              <t-form-item :label="$t('pages.lab.sniffer.field.customRegex')" name="customRegex">
                <t-textarea
                  v-model="formData.customRegex"
                  :autosize="{ minRows: 2, maxRows: 5 }"
                  :placeholder="$t('common.placeholder.inputEg', [`\\.(m3u8|mp4|flv|mkv)`])"
                />
              </t-form-item>
              <t-form-item :label="$t('pages.lab.sniffer.field.snifferExclude')" name="snifferExclude">
                <t-textarea
                  v-model="formData.snifferExclude"
                  :autosize="{ minRows: 2, maxRows: 5 }"
                  :placeholder="$t('common.placeholder.inputEg', [`(?:\\?|&)url=https?://`])"
                />
              </t-form-item>
            </t-collapse-panel>
          </t-collapse>
        </t-form>
      </div>
      <div class="action">
        <p class="title-label">{{ $t('common.action') }}</p>
        <div class="content-action">
          <t-button theme="default" variant="base" block @click="handleReset">{{ $t('common.reset') }}</t-button>
          <t-button theme="primary" variant="base" block @click="handleSubmit">{{ $t('common.execute') }}</t-button>
        </div>
      </div>
      <div class="output">
        <p class="title-label">{{ $t('common.output') }}</p>
        <div class="content-output">
          <t-textarea
            v-model="output"
            :autosize="{ minRows: 2, maxRows: 5 }"
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
import { jsonStrToObj } from '@shared/modules/obj';
import { isJsonStr } from '@shared/modules/validate';
import JSON5 from 'json5';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, useTemplateRef } from 'vue';

import { cdpSnifferMedia } from '@/api/system';
import { t } from '@/locales';

const RULES = {
  url: [{ required: true }, { url: { protocols: ['http', 'https'], require_protocol: true } }],
  headers: [{ validator: (val: string) => isJsonStr(val) || val === '' }],
};

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

const formData = ref({
  url: '',
  headers: '',
  snifferExclude: '',
  customRegex: '',
  initScript: '',
  runScript: '',
});
const output = ref('');

const handleExecute = async () => {
  const { url, headers: headersRaw, runScript, initScript, customRegex, snifferExclude } = formData.value;
  const headers = jsonStrToObj(headersRaw);

  const resp = await cdpSnifferMedia({
    url,
    options: {
      runScript,
      initScript,
      customRegex,
      snifferExclude,
      headers,
    },
  });

  if (resp?.url) {
    output.value = JSON5.stringify(resp, null, 2);
    MessagePlugin.success(t('common.success'));
  } else {
    output.value = '';
    MessagePlugin.warning(t('common.fail'));
  }
};

const handleReplace = () => {
  output.value = '';
};

const handleCopy = async (e: Event) => {
  const val = (e.target as HTMLTextAreaElement).value;
  if (!val) return;

  try {
    await navigator.clipboard.writeText(val);
    MessagePlugin.info(t('common.copySuccess'));
  } catch (error) {
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
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

const onReset = () => {
  handleReplace();
};

const handleSubmit = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  formRef.value?.reset();
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
