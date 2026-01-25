<template>
  <div class="lab-crypto-encrypt view-component-container">
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
          <t-form-item :label="t('common.content')" name="input">
            <t-textarea
              v-model="formData.input"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('common.placeholder.input')"
            />
          </t-form-item>
          <t-form-item :label="$t('pages.lab.crypto.field.key')" name="key">
            <t-textarea
              v-if="active.action === 'rsa'"
              v-model="formData.key"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('common.placeholder.input')"
            />
            <t-input-adornment v-else style="flex: 1">
              <template #prepend>
                <t-select v-model="formData.keyEncode" auto-width>
                  <t-option v-for="item in ENCODE_OPTIONS" :key="item.value" :value="item.value" :label="item.label" />
                </t-select>
              </template>
              <t-input v-model="formData.key" />
            </t-input-adornment>
          </t-form-item>
          <t-form-item
            v-if="active.action === 'rsa'"
            :label="$t('pages.lab.crypto.encrypt.field.passphrase')"
            name="passphrase"
          >
            <t-input-adornment style="flex: 1">
              <template #prepend>
                <t-select v-model="formData.passphraseEncode" auto-width>
                  <t-option v-for="item in ENCODE_OPTIONS" :key="item.value" :value="item.value" :label="item.label" />
                </t-select>
              </template>
              <t-input v-model="formData.passphrase" />
            </t-input-adornment>
          </t-form-item>
          <t-form-item
            v-if="!['rsa', 'rc4', 'rc4Drop'].includes(active.action)"
            :label="$t('pages.lab.crypto.encrypt.field.iv')"
            name="iv"
          >
            <t-input-adornment style="flex: 1">
              <template #prepend>
                <t-select v-model="formData.ivEncode" auto-width>
                  <t-option v-for="item in ENCODE_OPTIONS" :key="item.value" :value="item.value" :label="item.label" />
                </t-select>
              </template>
              <t-input v-model="formData.iv" />
            </t-input-adornment>
          </t-form-item>
          <t-form-item
            v-if="!['rsa', 'rc4', 'rc4Drop', 'rabbit', 'rabbitLegacy'].includes(active.action)"
            :label="$t('pages.lab.crypto.encrypt.field.mode')"
            name="mode"
          >
            <t-radio-group v-model="formData.mode" variant="default-filled">
              <t-radio-button v-for="item in MODE_OPTIONS" :key="item.value" :value="item.value" :label="item.label" />
            </t-radio-group>
          </t-form-item>
          <t-form-item
            v-if="
              !['rc4', 'rc4Drop', 'rabbit', 'rabbitLegacy'].includes(active.action) &&
              ['cbc', 'ecb'].includes(formData.mode)
            "
            :label="$t('pages.lab.crypto.encrypt.field.pad')"
            name="pad"
          >
            <t-radio-group v-model="formData.pad" variant="default-filled">
              <t-radio-button v-for="item in PAD_OPTIONS" :key="item.value" :value="item.value" :label="item.label" />
            </t-radio-group>
          </t-form-item>
          <t-form-item
            v-if="active.action === 'rc4Drop'"
            :label="$t('pages.lab.crypto.encrypt.field.drop')"
            name="drop"
          >
            <t-input-number v-model="formData.drop" auto-width theme="column" :min="0" />
          </t-form-item>
          <t-form-item
            v-if="['aes', 'sm4'].includes(active.action) && formData.mode === 'gcm'"
            :label="$t('pages.lab.crypto.encrypt.field.tag')"
            name="tag"
          >
            <t-input-adornment style="flex: 1">
              <template #prepend>
                <t-select v-model="formData.tagEncode" auto-width>
                  <t-option v-for="item in ENCODE_OPTIONS" :key="item.value" :value="item.value" :label="item.label" />
                </t-select>
              </template>
              <t-input v-model="formData.tag" />
            </t-input-adornment>
          </t-form-item>
          <t-form-item
            v-if="['aes', 'sm4'].includes(active.action) && formData.mode === 'gcm'"
            :label="$t('pages.lab.crypto.encrypt.field.aad')"
            name="aad"
          >
            <t-input-adornment style="flex: 1">
              <template #prepend>
                <t-select v-model="formData.aadEncode" auto-width>
                  <t-option v-for="item in ENCODE_OPTIONS" :key="item.value" :value="item.value" :label="item.label" />
                </t-select>
              </template>
              <t-input v-model="formData.aad" />
            </t-input-adornment>
          </t-form-item>
          <t-form-item :label="$t('pages.lab.crypto.field.inputEncode')" name="inputEncode">
            <t-radio-group v-model="formData.inputEncode" variant="default-filled">
              <t-radio-button
                v-for="item in ENCODE_OPTIONS"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </t-radio-group>
          </t-form-item>
          <t-form-item :label="$t('pages.lab.crypto.field.outputEncode')" name="outputEncode">
            <t-radio-group v-model="formData.outputEncode" variant="default-filled">
              <t-radio-button
                v-for="item in ENCODE_OPTIONS"
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
import { aes, des, rabbit, rabbitLegacy, rc4, rc4Drop, rsa, sm4, tripleDes } from '@shared/modules/crypto';
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
  mode: [{ required: true }],
  pad: [{ required: true }],
  drop: [{ required: true }, { number: true }, { validator: (val: number) => val >= 0 }],
  ivEncode: [{ required: true }],
  keyEncode: [{ required: true }],
  inputEncode: [{ required: true }],
  outputEncode: [{ required: true }],
};

const PAD_OPTIONS = computed(() => {
  switch (active.value.action) {
    case 'rsa': {
      return [
        { value: 'rsa-oaep', label: t('pages.lab.crypto.encrypt.field.paddingMap.rsaOaep') },
        { value: 'rsa-oaep-sha256', label: t('pages.lab.crypto.encrypt.field.paddingMap.rsaOaepSha256') },
        { value: 'rsa-oaep-sha384', label: t('pages.lab.crypto.encrypt.field.paddingMap.rsaOaepSha384') },
        { value: 'rsa-oaep-sha512', label: t('pages.lab.crypto.encrypt.field.paddingMap.rsaOaepSha512') },
        { value: 'rsa-oaep-md5', label: t('pages.lab.crypto.encrypt.field.paddingMap.rsaOaepMd5') },
        { value: 'rsaes-pkcs1-v1_5', label: t('pages.lab.crypto.encrypt.field.paddingMap.rsaesPkcs1') },
      ];
    }
    case 'sm4': {
      return [
        { value: 'Pkcs7Padding', label: t('pages.lab.crypto.encrypt.field.paddingMap.pkcs7Padding') },
        { value: 'NoPadding', label: t('pages.lab.crypto.encrypt.field.paddingMap.noPadding') },
      ];
    }
    default: {
      return [
        { value: 'Pkcs7Padding', label: t('pages.lab.crypto.encrypt.field.paddingMap.pkcs7Padding') },
        { value: 'AnsiX923', label: t('pages.lab.crypto.encrypt.field.paddingMap.ansiX923') },
        { value: 'Iso10126', label: t('pages.lab.crypto.encrypt.field.paddingMap.iso10126') },
        { value: 'Iso97971', label: t('pages.lab.crypto.encrypt.field.paddingMap.iso97971') },
        { value: 'ZeroPadding', label: t('pages.lab.crypto.encrypt.field.paddingMap.zeroPadding') },
        { value: 'NoPadding', label: t('pages.lab.crypto.encrypt.field.paddingMap.noPadding') },
      ];
    }
  }
});
const MODE_OPTIONS = computed(() => {
  switch (active.value.action) {
    case 'sm4':
      return [
        { value: 'cbc', label: t('pages.lab.crypto.encrypt.field.modeMap.cbc') },
        { value: 'ecb', label: t('pages.lab.crypto.encrypt.field.modeMap.ecb') },
        { value: 'gcm', label: t('pages.lab.crypto.encrypt.field.modeMap.gcm') },
      ];
    case 'aes':
      return [
        { value: 'cbc', label: t('pages.lab.crypto.encrypt.field.modeMap.cbc') },
        { value: 'cfb', label: t('pages.lab.crypto.encrypt.field.modeMap.cfb') },
        { value: 'ofb', label: t('pages.lab.crypto.encrypt.field.modeMap.ofb') },
        { value: 'ctr', label: t('pages.lab.crypto.encrypt.field.modeMap.ctr') },
        { value: 'ecb', label: t('pages.lab.crypto.encrypt.field.modeMap.ecb') },
        { value: 'gcm', label: t('pages.lab.crypto.encrypt.field.modeMap.gcm') },
      ];
    default:
      return [
        { value: 'cbc', label: t('pages.lab.crypto.encrypt.field.modeMap.cbc') },
        { value: 'cfb', label: t('pages.lab.crypto.encrypt.field.modeMap.cfb') },
        { value: 'ofb', label: t('pages.lab.crypto.encrypt.field.modeMap.ofb') },
        { value: 'ctr', label: t('pages.lab.crypto.encrypt.field.modeMap.ctr') },
        { value: 'ecb', label: t('pages.lab.crypto.encrypt.field.modeMap.ecb') },
      ];
  }
});
const ENCODE_OPTIONS = computed(() => [
  { value: 'utf8', label: t('pages.lab.crypto.encrypt.field.encodeMap.utf8') },
  { value: 'base64', label: t('pages.lab.crypto.encrypt.field.encodeMap.base64') },
  { value: 'hex', label: t('pages.lab.crypto.encrypt.field.encodeMap.hex') },
]);

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

const formData = ref({
  input: '',
  mode: 'cbc',
  pad: 'rsa-oaep',
  iv: '',
  key: '',
  tag: '',
  aad: '',
  drop: 192,
  passphrase: '',
  passphraseEncode: 'utf8',
  ivEncode: 'utf8',
  keyEncode: 'utf8',
  tagEncode: 'hex',
  aadEncode: 'utf8',
  inputEncode: 'utf8',
  outputEncode: 'base64',
});
const output = ref('');
const active = ref({
  action: 'rsa',
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

  if (!PAD_OPTIONS.value.find((item) => item.value === formData.value.pad)) {
    formData.value.pad = PAD_OPTIONS.value[0].value;
  }
};

const handleExecute = () => {
  try {
    const execute = active.value.execute;
    const { input } = formData.value;
    if (!input) return;

    const action = active.value.action;
    const METHOD_MAP = { rsa, rc4, rc4Drop, aes, des, tripleDes, rabbit, rabbitLegacy, sm4 };
    const {
      mode,
      pad,
      iv,
      key,
      tag,
      aad,
      drop,
      passphrase,
      passphraseEncode,
      ivEncode,
      keyEncode,
      tagEncode,
      aadEncode,
      inputEncode,
      outputEncode,
    } = formData.value;

    if (outputEncode === 'utf8' && execute === 'encode') {
      MessagePlugin.warning(`${t('pages.lab.crypto.encrypt.message.encodeNotUtf8')}`);
      return;
    }

    if (inputEncode === 'utf8' && execute === 'decode') {
      MessagePlugin.warning(`${t('pages.lab.crypto.encrypt.message.decodeNotUtf8')}`);
      return;
    }

    let doc: Record<string, any> = { src: input, inputEncode, outputEncode };
    if (action === 'rsa') {
      doc = { ...doc, key, pad, passphrase, passphraseEncode };
    } else if (action === 'rc4') {
      doc = { ...doc, key, keyEncode };
    } else if (action === 'rc4Drop') {
      doc = { ...doc, key, keyEncode, drop };
    } else if (action === 'aes' || action === 'sm4') {
      doc = { ...doc, key, keyEncode, iv, ivEncode, mode, pad, tag, tagEncode, aad, aadEncode };
    } else if (action === 'rabbit' || action === 'rabbitLegacy') {
      doc = { ...doc, key, keyEncode, iv, ivEncode };
    } else {
      doc = { ...doc, key, keyEncode, iv, ivEncode, mode, pad };
    }

    output.value = METHOD_MAP[action][execute](doc);

    MessagePlugin.success(t('common.success'));
  } catch (error) {
    output.value = '';
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

      .content-input {
        display: flex;
        flex-direction: column;
        gap: var(--td-size-5);

        .input-method {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .input-groups {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            gap: 16px;
          }
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
