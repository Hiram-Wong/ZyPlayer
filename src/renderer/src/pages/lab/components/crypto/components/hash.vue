<template>
  <div class="lab-crypto-hash view-component-container">
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
        >
          <t-form-item :label="$t('pages.lab.crypto.field.content')" name="input">
            <t-textarea
              v-model="formData.input"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('common.placeholder.input')"
            />
          </t-form-item>
          <t-form-item v-if="active.action === 'hmac'" :label="$t('pages.lab.crypto.field.key')" name="key">
            <t-input-adornment style="flex: 1">
              <template #prepend>
                <t-select v-model="formData.keyEncode" auto-width>
                  <t-option
                    v-for="item in INNPUT_ENCODE_OPTIONS"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                  />
                </t-select>
              </template>
              <t-input v-model="formData.key" />
            </t-input-adornment>
          </t-form-item>
          <t-form-item :label="$t('pages.lab.crypto.field.inputEncode')" name="inputEncode">
            <t-radio-group v-model="formData.inputEncode" variant="default-filled">
              <t-radio-button
                v-for="item in INNPUT_ENCODE_OPTIONS"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </t-radio-group>
          </t-form-item>
          <t-form-item :label="$t('pages.lab.crypto.field.outputEncode')" name="outputEncode">
            <t-radio-group v-model="formData.outputEncode" variant="default-filled">
              <t-radio-button
                v-for="item in OUTPUT_ENCODE_OPTIONS"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </t-radio-group>
          </t-form-item>
        </t-form>
      </div>
      <div class="action">
        <p class="title-label">{{ $t('common.action') }}</p>
        <div class="content-action">
          <t-button theme="primary" variant="base" block @click="handleSubmit">
            {{ $t('common.compute') }}
          </t-button>
        </div>
      </div>
      <div class="output">
        <p class="title-label">{{ $t('common.output') }}</p>
        <div class="content-output">
          <template v-for="item in ALGORITHM_OPTIONS" :key="item.value">
            <t-input
              v-model="output[item.value]"
              :label="item.label"
              readonly
              placeholder=""
              @click="handleCopy(output[item.value])"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { hash, hmac } from '@shared/modules/crypto';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, useTemplateRef, watch } from 'vue';

import { t } from '@/locales';

const props = defineProps({
  active: {
    type: String,
    default: 'rsa',
  },
});

const RULES = {
  input: [{ required: true }],
  key: [{ required: true }],
  inputEncode: [{ required: true }],
  keyEncode: [{ required: true }],
  outputEncode: [{ required: true }],
};

const ALGORITHM_OPTIONS = computed(() => [
  { value: 'md5-16', label: t('pages.lab.crypto.hash.field.algorithmMap.md5-16') },
  { value: 'md5-32', label: t('pages.lab.crypto.hash.field.algorithmMap.md5-32') },
  { value: 'sha1', label: t('pages.lab.crypto.hash.field.algorithmMap.sha1') },
  { value: 'sha224', label: t('pages.lab.crypto.hash.field.algorithmMap.sha224') },
  { value: 'sha256', label: t('pages.lab.crypto.hash.field.algorithmMap.sha256') },
  { value: 'sha3', label: t('pages.lab.crypto.hash.field.algorithmMap.sha3') },
  { value: 'sha384', label: t('pages.lab.crypto.hash.field.algorithmMap.sha384') },
  { value: 'sha512', label: t('pages.lab.crypto.hash.field.algorithmMap.sha512') },
  { value: 'sha512-224', label: t('pages.lab.crypto.hash.field.algorithmMap.sha512-224') },
  { value: 'sha512-256', label: t('pages.lab.crypto.hash.field.algorithmMap.sha512-256') },
  { value: 'ripemd160', label: t('pages.lab.crypto.hash.field.algorithmMap.ripemd160') },
  { value: 'sm3', label: t('pages.lab.crypto.hash.field.algorithmMap.sm3') },
]);
const INNPUT_ENCODE_OPTIONS = computed(() => [
  { value: 'utf8', label: t('pages.lab.crypto.encrypt.field.encodeMap.utf8') },
  { value: 'hex', label: t('pages.lab.crypto.encrypt.field.encodeMap.hex') },
  { value: 'base64', label: t('pages.lab.crypto.encrypt.field.encodeMap.base64') },
]);
const OUTPUT_ENCODE_OPTIONS = computed(() => [
  { value: 'hex', label: t('pages.lab.crypto.encrypt.field.encodeMap.hex') },
  { value: 'base64', label: t('pages.lab.crypto.encrypt.field.encodeMap.base64') },
]);

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

const formData = ref({
  input: '',
  key: '',
  inputEncode: 'utf8',
  keyEncode: 'utf8',
  outputEncode: 'hex',
});
const output = ref({ ...ALGORITHM_OPTIONS.value.map((item) => ({ [item.value]: '' })) });
const active = ref({
  action: 'hash',
});

watch(
  () => props.active,
  (val) => {
    active.value.action = val;
    defaultConf();
  },
);

const defaultConf = () => {
  output.value = { ...ALGORITHM_OPTIONS.value.map((item) => ({ [item.value]: '' })) };
};

const handleExecute = () => {
  try {
    const action = active.value.action;
    const { key, input, inputEncode, keyEncode, outputEncode } = formData.value;

    ALGORITHM_OPTIONS.value.forEach((item) => {
      const name = item.value;

      if (action === 'hash') {
        output.value[name] = hash[name]({ src: input, inputEncode, outputEncode });
      } else if (action === 'hmac') {
        output.value[name] = hmac[name]({ src: input, key, inputEncode, keyEncode, outputEncode });
      }
    });
  } catch (error) {
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  }
};

const handleCopy = async (val: string) => {
  if (!val) return;

  try {
    await navigator.clipboard.writeText(val);
    MessagePlugin.info(t('common.copySuccess'));
  } catch (error) {
    console.error(error);
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

const handleSubmit = () => {
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

      .content-input {
        display: flex;
        flex-direction: column;
        gap: var(--td-size-5);

        .input-groups {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          gap: 16px;
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
        display: flex;
        flex-direction: column;
        gap: var(--td-size-4);
      }
    }
  }
}
</style>
