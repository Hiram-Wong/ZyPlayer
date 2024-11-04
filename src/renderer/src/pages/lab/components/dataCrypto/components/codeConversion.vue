<template>
  <div class="code-conversion view-container">
    <div class="header">
      <title-menu :list="codeConversionList" :active="active.action" class="nav" @change-key="changeNavEvent" />
    </div>
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.input') }}</p>
        <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" />
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
import { base64, unicode, html, url, hex, gzip } from '@/utils/crypto';
import { copyToClipboardApi } from '@/utils/tool';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import TitleMenu from '@/components/title-menu/index.vue';

const formData = ref({
  input: '',
  output: ''
});
const active = ref({
  action: 'html'
});
const codeConversionList = computed(() => {
  return [
    {
      type_name: t('pages.lab.dataCrypto.codeConversion.html'),
      type_id: 'html'
    },
    {
      type_name: t('pages.lab.dataCrypto.codeConversion.unicode'),
      type_id: 'unicode'
    },
    {
      type_name: t('pages.lab.dataCrypto.codeConversion.base64'),
      type_id: 'base64'
    },
    {
      type_name: t('pages.lab.dataCrypto.codeConversion.url'),
      type_id: 'url'
    },
    {
      type_name: t('pages.lab.dataCrypto.codeConversion.hex'),
      type_id: 'hex'
    },
    {
      type_name: t('pages.lab.dataCrypto.codeConversion.gzip'),
      type_id: 'gzip'
    }
  ]
});

const changeNavEvent = (val: string) => {
  active.value.action = val;
  formData.value.input = '';
  formData.value.output = '';
};

const codeConversionEvent = (type: 'encode' | 'decode') => {
  try {
    if (!formData.value.input) {
      MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`)
      return;
    }
    const methodMap = {
      url: url,
      base64: base64,
      unicode: unicode,
      html: html,
      hex: hex,
      gzip: gzip
    };
    if (type === 'encode') {
      formData.value.output = methodMap[active.value.action].encode(formData.value.input);
    } else {
      formData.value.output = methodMap[active.value.action].decode(formData.value.input);
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
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 var(--td-comp-paddingLR-xxs);
  }
  .input, .output, .action {
    display: flex;
    flex-direction: column;
    grid-gap: 16px;

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
