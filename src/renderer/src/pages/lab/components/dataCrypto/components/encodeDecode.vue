<template>
  <div class="encode-decode view-container">
    <div class="header">
      <title-menu :list="navList" :active="active.action" class="nav" @change-key="changeNavEvent" />
    </div>
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.input') }}</p>
        <div class="rc4 input-method" v-if="active.action === 'rc4'">
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.rc4.key')" color="var(--td-success-color)" shape="round">
            <div class="input-groups">
              <t-select auto-width v-model="formData.crypto.keyEncode" style="width: auto;">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.rc4.key" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.content')" color="var(--td-success-color)" shape="round">
            <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
          <div class="input-groups">
            <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.inputEncode')" color="var(--td-success-color)" shape="round">
              <t-radio-group variant="default-filled" v-model="formData.crypto.encode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
            <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.outputEncode')" color="var(--td-success-color)" shape="round">
              <t-radio-group variant="default-filled" v-model="formData.crypto.outputEncode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
          </div>
        </div>
        <div class="rsa input-method" v-else-if="active.action === 'rsa'">
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.rsa.padding')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.rsa.padding">
              <t-radio-button value="PKCS1">{{ $t('pages.lab.dataCrypto.encodeDecode.rsa.pkcs1') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.rsa.encode')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.rsa.encode">
              <t-radio-button value="base64">{{ $t('pages.lab.dataCrypto.encodeDecode.rsa.base64') }}</t-radio-button>
              <t-radio-button value="hex">{{ $t('pages.lab.dataCrypto.encodeDecode.rsa.hex') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.rsa.key')" color="var(--td-success-color)" shape="round">
            <t-textarea v-model="formData.rsa.key" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.content')" color="var(--td-success-color)" shape="round">
            <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
        </div>
        <div class="aes input-method" v-else-if="['aes', 'des', 'tripleDES', 'rabbit', 'rabbitLegacy'].includes(active.action)">
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.key')" color="var(--td-success-color)" shape="round">
            <div class="input-groups">
              <t-select auto-width v-model="formData.crypto.keyEncode" style="width: auto;">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.crypto.key" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.iv')" color="var(--td-success-color)" shape="round">
            <div class="input-groups">
              <t-select auto-width v-model="formData.crypto.ivEncode" style="width: auto;">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.crypto.iv" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.mode')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.crypto.mode">
              <t-radio-button v-for="item in modeList" :key="item.value" :value="item.value" :label="item.label" />
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.padding')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.crypto.padding">
              <t-radio-button v-for="item in padList" :key="item.value" :value="item.value" :label="item.label" />
            </t-radio-group>
          </t-badge>
          <div class="input-groups">
            <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.inputEncode')" color="var(--td-success-color)" shape="round">
              <t-radio-group variant="default-filled" v-model="formData.crypto.encode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
            <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.outputEncode')" color="var(--td-success-color)" shape="round">
              <t-radio-group variant="default-filled" v-model="formData.crypto.outputEncode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
          </div>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.content')" color="var(--td-success-color)" shape="round">
            <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
        </div>
        <div class="sm4 input-method" v-else-if="active.action === 'sm4'">
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.key')" color="var(--td-success-color)" shape="round">
            <div class="input-groups">
              <t-select auto-width v-model="formData.sm4.keyEncode" style="width: auto;">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.sm4.key" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.iv')" color="var(--td-success-color)" shape="round">
            <div class="input-groups">
              <t-select auto-width v-model="formData.sm4.ivEncode" style="width: auto;">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.sm4.iv" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.mode')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.sm4.mode">
              <t-radio-button value="cbc" label="CBC" />
              <t-radio-button value="ecb" label="ECB" />
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.padding')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.sm4.padding">
              <t-radio-button value="Pkcs7Padding" label="PKCS7" />
              <t-radio-button value="NoPadding" label="NoPadding" />
            </t-radio-group>
          </t-badge>
          <div class="input-groups">
            <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.inputEncode')" color="var(--td-success-color)" shape="round">
              <t-radio-group variant="default-filled" v-model="formData.sm4.encode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
            <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.outputEncode')" color="var(--td-success-color)" shape="round">
              <t-radio-group variant="default-filled" v-model="formData.sm4.outputEncode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
          </div>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.content')" color="var(--td-success-color)" shape="round">
            <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
        </div>
      </div>
      <div class="action">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.action') }}</p>
        <div class="btn">
          <t-button theme="primary" block @click="codeConversionEvent('encode')">{{ $t('pages.lab.dataCrypto.encode') }}</t-button>
          <t-button variant="outline" block @click="codeConversionEvent('decode')">{{ $t('pages.lab.dataCrypto.decode') }}</t-button>
        </div>
      </div>
      <div class="output">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.output') }}</p>
        <t-textarea v-model="formData.output" :autosize="{ minRows: 3, maxRows: 5 }" readonly @click="copyStrEvent(formData.output)"></t-textarea>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { rsa, aes, rc4, des, tripleDES, rabbit, rabbitLegacy, sm4 } from '@/utils/crypto';
import { copyToClipboardApi } from '@/utils/tool';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import TitleMenu from '@/components/title-menu/index.vue';

const formData = ref({
  input: '',
  output: '',
  rc4: {
    key: '',
  },
  rsa: {
    padding: 'PKCS1',
    encode: 'base64',
    key: ''
  },
  crypto: {
    mode: 'cbc',
    padding: 'Pkcs7Padding',
    encode: 'base64',
    iv: '',
    key: '',
    ivEncode: 'utf8',
    keyEncode: 'utf8',
    outputEncode: 'base64'
  },
  sm4: {
    mode: 'cbc',
    padding: 'Pkcs7Padding',
    encode: 'base64',
    iv: '',
    key: '',
    ivEncode: 'utf8',
    keyEncode: 'utf8',
    outputEncode: 'base64'
  }
});
const active = ref({
  action: 'rsa'
});
const navList = computed(() => {
  return [
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.rsa.name'),
      type_id: 'rsa'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.rc4.name'),
      type_id: 'rc4'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.aes.name'),
      type_id: 'aes'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.des.name'),
      type_id: 'des'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.tripleDES.name'),
      type_id: 'tripleDES'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.rabbit.name'),
      type_id: 'rabbit'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.rabbitLegacy.name'),
      type_id: 'rabbitLegacy'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.sm4.name'),
      type_id: 'sm4'
    },
  ]
});
const padList = computed(() => {
  return [
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.pkcs7'),
      value: 'Pkcs7Padding'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.ansiX923'),
      value: 'AnsiX923'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.iso10126'),
      value: 'Iso10126'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.iso97971'),
      value: 'Iso97971'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.zeroPadding'),
      value: 'ZeroPadding'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.noPadding'),
      value: 'NoPadding'
    },
  ]
});
const modeList = computed(() => {
  return [
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.cbc'),
      value: 'cbc'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.cfb'),
      value: 'cfb'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.ofb'),
      value: 'ofb'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.ctr'),
      value: 'ctr'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.ecb'),
      value: 'ecb'
    },
  ]
});
const keyEncodeList = computed(() => {
  return [
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.utf8'),
      value: 'utf8'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.base64'),
      value: 'base64'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.hex'),
      value: 'hex'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.latin1'),
      value: 'latin1'
    },
  ]
});
const encodeList = computed(() => {
  return [
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.utf8'),
      value: 'utf8'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.base64'),
      value: 'base64'
    },
    {
      label: t('pages.lab.dataCrypto.encodeDecode.crypto.hex'),
      value: 'hex'
    },
  ]
});

const changeNavEvent = (val: string) => {
  active.value.action = val;
  formData.value.input = '';
  formData.value.output = '';
};

const codeConversionEvent = (type: 'encode' | 'decode') => {
  try {
    const input = formData.value.input;
    if (type === 'encode') {
      if (active.value.action === 'rc4') {
        if (!input || !formData.value.rc4.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = rc4.encode(input, formData.value.rc4.key);
      } else if (active.value.action === 'rsa') {
        if (!input || !formData.value.rsa.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = rsa.encode(input, formData.value.rsa.key, formData.value.rsa.padding, formData.value.rsa.encode, 1, 1, true);
      } else if (['aes', 'des', 'tripleDES', 'rabbit', 'rabbitLegacy', 'sm4'].includes(active.value.action)) {
        const data = active.value.action === 'sm4' ? formData.value.sm4 : formData.value.crypto;
        const { mode,  padding, encode, iv, key, ivEncode, keyEncode, outputEncode } =  data;
        if (!input || !key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        if (outputEncode === 'utf8') {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.encodeDecode.crypto.message.encodeNotUtf8')}`);
          return;
        }
        const methodMap = {
          des: des,
          aes: aes,
          tripleDES: tripleDES,
          rabbit: rabbit,
          rabbitLegacy: rabbitLegacy,
          sm4: sm4
        };
        formData.value.output = methodMap[active.value.action].encode(formData.value.input, key, mode, padding, encode, iv, keyEncode, ivEncode, outputEncode);
      }
    } else {
      if (active.value.action === 'rc4') {
        if (!input || !formData.value.rc4.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = rc4.decode(input, formData.value.rc4.key);
      } else if (active.value.action === 'rsa') {
        if (!input || !formData.value.rsa.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = rsa.decode(input, formData.value.rsa.key, formData.value.rsa.padding, formData.value.rsa.encode, 1, 1, true);
      } else if (['aes', 'des', 'tripleDES', 'rabbit', 'rabbitLegacy', 'sm4'].includes(active.value.action)) {
        const data = active.value.action === 'sm4' ? formData.value.sm4 : formData.value.crypto;
        const { mode,  padding, encode, iv, key, ivEncode, keyEncode, outputEncode } =  data;
        if (!input || !key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        if (encode === 'utf8') {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.encodeDecode.crypto.message.decodeNotUtf8')}`);
          return;
        }
        const methodMap = {
          des: des,
          aes: aes,
          tripleDES: tripleDES,
          rabbit: rabbit,
          rabbitLegacy: rabbitLegacy,
          sm4: sm4
        };
        formData.value.output = methodMap[active.value.action].decode(formData.value.input, key, mode, padding, encode, iv, keyEncode, ivEncode, outputEncode);
      }
    };
    MessagePlugin.success(`${t('pages.setting.form.success')}`);
  } catch (err: any) {
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
  }
};

const copyStrEvent = async (val: string) => {
  if (!val) {
    MessagePlugin.warning(t('pages.lab.dataCrypto.message.copyEmpty'));
    return;
  }
  await copyToClipboardApi(val);
  MessagePlugin.info(t('pages.lab.dataCrypto.message.copySuccess'));
};
</script>

<style lang="less" scoped>
.view-container {
  padding: 0;
  gap: var(--td-size-4);

  .header {
  };

  .content {
    padding: 0 var(--td-comp-paddingLR-xxs);
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }

  .input, .output, .action {
    display: flex;
    flex-direction: column;
    grid-gap: 16px;

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

      :deep(.t-badge) {
        width: 100%;

        .t-badge--round {
          right: auto;
          left: 10px !important;
          top: -10px !important;
          transform: none !important;
          z-index: 9;
        }
      }
    }

    :deep(textarea), :deep(.t-input) {
      border-color: transparent;
      background-color: var(--td-bg-content-input-2);
      border-radius: var(--td-radius-medium);
    }
  }

  .action {
    .btn {
      display: flex;
    }
  }
}
</style>
