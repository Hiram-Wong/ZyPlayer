<template>
  <div class="hash-calculation view-container">
    <div class="input">
      <p class="title-label">{{ $t('pages.lab.dataCrypto.input') }}</p>
      <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" @change="inputChangeEvent" />
    </div>
    <div class="output">
      <p class="title-label">{{ $t('pages.lab.dataCrypto.output') }}</p>
      <t-input v-model="formData.output.md516" label="MD5-16" readonly placeholder="" @click="copyStrEvent(formData.output.md516)"/>
      <t-input v-model="formData.output.md532" label="MD5-32" readonly placeholder="" @click="copyStrEvent(formData.output.md532)"/>
      <t-input v-model="formData.output.sha1" label="SHA1" readonly placeholder="" @click="copyStrEvent(formData.output.sha1)"/>
      <t-input v-model="formData.output.sha224" label="SHA224" readonly placeholder="" @click="copyStrEvent(formData.output.sha224)"/>
      <t-input v-model="formData.output.sha3" label="SHA3" readonly placeholder @click="copyStrEvent(formData.output.sha3)"/>
      <t-input v-model="formData.output.sha384" label="SHA384" readonly placeholder="" @click="copyStrEvent(formData.output.sha384)"/>
      <t-input v-model="formData.output.sha512" label="SHA512" readonly placeholder="" @click="copyStrEvent(formData.output.sha512)"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { hash } from '@/utils/crypto';
import { copyToClipboardApi } from '@/utils/tool';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';

const formData = ref({
  input: '',
  output: {
    md516: '',
    md532: '',
    sha1: '',
    sha224: '',
    sha3: '',
    sha384: '',
    sha512: ''
  }
});

const inputChangeEvent = (val: string) => {
  formData.value.output.md516 = hash['md5-16'](val);
  formData.value.output.md532 = hash['md5-32'](val);
  formData.value.output.sha1 = hash.sha1(val);
  formData.value.output.sha224 = hash.sha224(val);
  formData.value.output.sha3 = hash.sha3(val);
  formData.value.output.sha384 = hash.sha384(val);
  formData.value.output.sha512 = hash.sha512(val);
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
  padding: 0 var(--td-comp-paddingLR-xxs);
  .input {
    margin-bottom: var(--td-comp-margin-m);
  }
  .input, .output {
    display: flex;
    flex-direction: column;
    grid-gap: 16px;

    :deep(textarea), :deep(.t-input) {
      border-color: transparent;
      background-color: var(--td-bg-content-input-2);
      border-radius: var(--td-radius-medium);
    }
  }
}
</style>
