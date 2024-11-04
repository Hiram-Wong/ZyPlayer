<template>
  <div class="encode-decode view-container">
    <div class="header">
      <title-menu :list="codeConversionList" :active="active.action" class="nav" @change-key="changeNavEvent" />
    </div>
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.input') }}</p>
        <div class="rc4 input-groups" v-if="active.action === 'rc4'">
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.rc4.key')" color="var(--td-success-color)" shape="round">
            <t-input v-model="formData.rc4.key" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.content')" color="var(--td-success-color)" shape="round">
            <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
        </div>
        <div class="aes input-groups" v-if="active.action === 'aes'">
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.aes.key')" color="var(--td-success-color)" shape="round">
            <t-input v-model="formData.aes.key" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.aes.iv')" color="var(--td-success-color)" shape="round" v-if="formData.aes.mode !== 'ecb'">
            <t-input v-model="formData.aes.iv" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.aes.mode')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.aes.mode">
              <t-radio-button value="cbc">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.cbc') }}</t-radio-button>
              <t-radio-button value="cfb">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.cfb') }}</t-radio-button>
              <t-radio-button value="ofb">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.ofb') }}</t-radio-button>
              <t-radio-button value="ctr">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.ctr') }}</t-radio-button>
              <t-radio-button value="ecb">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.ecb') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.aes.padding')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.aes.padding">
              <t-radio-button value="ZeroPadding">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.zeroPadding') }}</t-radio-button>
              <t-radio-button value="Pkcs7Padding">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.pkcs7') }}</t-radio-button>
              <t-radio-button value="AnsiX923">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.ansiX923') }}</t-radio-button>
              <t-radio-button value="Iso10126">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.iso10126') }}</t-radio-button>
              <t-radio-button value="Iso97971">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.iso97971') }}</t-radio-button>
              <t-radio-button value="NoPadding">{{ $t('pages.lab.dataCrypto.encodeDecode.aes.noPadding') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.aes.encode')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.aes.encode">
              <t-radio-button value="base64">{{ $t('pages.lab.dataCrypto.encodeDecode.rsa.base64') }}</t-radio-button>
              <t-radio-button value="hex">{{ $t('pages.lab.dataCrypto.encodeDecode.rsa.hex') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.content')" color="var(--td-success-color)" shape="round">
            <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
        </div>
        <div class="rsa input-groups" v-if="active.action === 'rsa'">
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
        <div class="aes input-groups" v-if="active.action === 'des'">
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.des.key')" color="var(--td-success-color)" shape="round">
            <t-input v-model="formData.des.key" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.des.iv')" color="var(--td-success-color)" shape="round" v-if="formData.des.mode !== 'ecb'">
            <t-input v-model="formData.des.iv" :placeholder="$t('pages.setting.placeholder.general')" />
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.des.mode')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.des.mode">
              <t-radio-button value="cbc">{{ $t('pages.lab.dataCrypto.encodeDecode.des.cbc') }}</t-radio-button>
              <t-radio-button value="cfb">{{ $t('pages.lab.dataCrypto.encodeDecode.des.cfb') }}</t-radio-button>
              <t-radio-button value="ofb">{{ $t('pages.lab.dataCrypto.encodeDecode.des.ofb') }}</t-radio-button>
              <t-radio-button value="ctr">{{ $t('pages.lab.dataCrypto.encodeDecode.des.ctr') }}</t-radio-button>
              <t-radio-button value="ecb">{{ $t('pages.lab.dataCrypto.encodeDecode.des.ecb') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.des.padding')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.des.padding">
              <t-radio-button value="ZeroPadding">{{ $t('pages.lab.dataCrypto.encodeDecode.des.zeroPadding') }}</t-radio-button>
              <t-radio-button value="Pkcs7Padding">{{ $t('pages.lab.dataCrypto.encodeDecode.des.pkcs7') }}</t-radio-button>
              <t-radio-button value="AnsiX923">{{ $t('pages.lab.dataCrypto.encodeDecode.des.ansiX923') }}</t-radio-button>
              <t-radio-button value="Iso10126">{{ $t('pages.lab.dataCrypto.encodeDecode.des.iso10126') }}</t-radio-button>
              <t-radio-button value="Iso97971">{{ $t('pages.lab.dataCrypto.encodeDecode.des.iso97971') }}</t-radio-button>
              <t-radio-button value="NoPadding">{{ $t('pages.lab.dataCrypto.encodeDecode.des.noPadding') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge :count="$t('pages.lab.dataCrypto.encodeDecode.des.encode')" color="var(--td-success-color)" shape="round">
            <t-radio-group variant="default-filled" v-model="formData.des.encode">
              <t-radio-button value="base64">{{ $t('pages.lab.dataCrypto.encodeDecode.des.base64') }}</t-radio-button>
              <t-radio-button value="hex">{{ $t('pages.lab.dataCrypto.encodeDecode.des.hex') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
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
import { rsa, aes, rc4, des } from '@/utils/crypto';
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
  aes: {
    mode: 'cbc',
    padding: 'ZeroPadding',
    encode: 'base64',
    iv: '',
    key: ''
  },
  des: {
    mode: 'cbc',
    padding: 'ZeroPadding',
    encode: 'base64',
    iv: '',
    key: ''
  },
  rsa: {
    padding: 'PKCS1',
    encode: 'base64',
    key: ''
  }
});
const active = ref({
  action: 'aes'
});
const codeConversionList = computed(() => {
  return [
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.aes.name'),
      type_id: 'aes'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.des.name'),
      type_id: 'des'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.rsa.name'),
      type_id: 'rsa'
    },
    {
      type_name: t('pages.lab.dataCrypto.encodeDecode.rc4.name'),
      type_id: 'rc4'
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
    if (type === 'encode') {
      if (active.value.action === 'rc4') {
        if (!formData.value.input || !formData.value.rc4.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = rc4.encode(formData.value.input, formData.value.rc4.key);
      } else if (active.value.action === 'aes') {
        if (!formData.value.input || !formData.value.aes.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = aes.encode(formData.value.input, formData.value.aes.key, formData.value.aes.mode, formData.value.aes.padding, formData.value.aes.encode, formData.value.aes.iv);
      } else if (active.value.action === 'des') {
        if (!formData.value.input || !formData.value.des.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = des.encode(formData.value.input, formData.value.des.key, formData.value.des.mode, formData.value.des.padding, formData.value.des.encode, formData.value.des.iv);
      } else if (active.value.action === 'rsa') {
        if (!formData.value.input || !formData.value.rsa.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = rsa.encode(formData.value.input, formData.value.rsa.key, formData.value.rsa.padding, formData.value.rsa.encode, 1, 1, true);
      }
    } else {
      if (active.value.action === 'rc4') {
        if (!formData.value.input || !formData.value.rc4.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = rc4.decode(formData.value.input, formData.value.rc4.key);
      } else if (active.value.action === 'aes') {
        if (!formData.value.input || !formData.value.aes.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = aes.decode(formData.value.input, formData.value.aes.key, formData.value.aes.mode, formData.value.aes.padding, formData.value.aes.encode, formData.value.aes.iv);
      } else if (active.value.action === 'des') {
        if (!formData.value.input || !formData.value.des.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = des.decode(formData.value.input, formData.value.des.key, formData.value.des.mode, formData.value.des.padding, formData.value.des.encode, formData.value.des.iv);
      } else if (active.value.action === 'rsa') {
        if (!formData.value.input || !formData.value.rsa.key) {
          MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
          return;
        }
        formData.value.output = rsa.decode(formData.value.input, formData.value.rsa.key, formData.value.rsa.padding, formData.value.rsa.encode, 1, 1, true);
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
  .header {
    margin-bottom: 16px;
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

    .input-groups {
      display: flex;
      flex-direction: column;
      gap: 16px;

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
