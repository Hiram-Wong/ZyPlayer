<template>
  <div class="hash-calculation view-container">
    <div class="header">
      <title-menu :list="navList" :active="active.action" class="nav" @change-key="changeNavEvent" />
    </div>
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.input') }}</p>
        <div class="input-method" v-if="active.action === 'hmac'">
          <t-badge :count="$t('pages.lab.dataCrypto.hashCalculation.key')" color="var(--td-success-color)" shape="round">
            <t-input v-model="formData.key" :placeholder="$t('pages.setting.placeholder.general')" @change="inputChangeEvent(formData.input)" />
          </t-badge>
        </div>
        <div class="input-method">
          <t-badge :count="$t('pages.lab.dataCrypto.hashCalculation.content')" color="var(--td-success-color)" shape="round">
            <t-textarea v-model="formData.input" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')" @change="inputChangeEvent" />
          </t-badge>
        </div>
      </div>
      <div class="output">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.output') }}</p>
        <t-input v-model="formData.output.md516" label="MD5-16" readonly placeholder="" @click="copyStrEvent(formData.output.md516)"/>
        <t-input v-model="formData.output.md532" label="MD5-32" readonly placeholder="" @click="copyStrEvent(formData.output.md532)"/>
        <t-input v-model="formData.output.sha1" label="SHA1" readonly placeholder="" @click="copyStrEvent(formData.output.sha1)"/>
        <t-input v-model="formData.output.sha224" label="SHA224" readonly placeholder="" @click="copyStrEvent(formData.output.sha224)"/>
        <t-input v-model="formData.output.sha256" label="SHA256" readonly placeholder="" @click="copyStrEvent(formData.output.sha256)"/>
        <t-input v-model="formData.output.sha3" label="SHA3" readonly placeholder @click="copyStrEvent(formData.output.sha3)"/>
        <t-input v-model="formData.output.sha384" label="SHA384" readonly placeholder="" @click="copyStrEvent(formData.output.sha384)"/>
        <t-input v-model="formData.output.sha512" label="SHA512" readonly placeholder="" @click="copyStrEvent(formData.output.sha512)"/>
        <t-input v-model="formData.output.ripemd160" label="RIPEMD160" readonly placeholder="" @click="copyStrEvent(formData.output.ripemd160)"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { hash, hmac } from '@/utils/crypto';
import { copyToClipboardApi } from '@/utils/tool';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import TitleMenu from '@/components/title-menu/index.vue';

const formData = ref({
  input: '',
  key: '',
  output: {
    md516: '',
    md532: '',
    sha1: '',
    sha224: '',
    sha256: '',
    sha3: '',
    sha384: '',
    sha512: '',
    ripemd160: ''
  }
});

const active = ref({
  action: 'hash'
});
const navList = computed(() => {
  return [
    {
      type_name: t('pages.lab.dataCrypto.hashCalculation.nav.hash'),
      type_id: 'hash'
    },
    {
      type_name: t('pages.lab.dataCrypto.hashCalculation.nav.hmac'),
      type_id: 'hmac'
    },
  ]
});

const defaultConf = () => {
  formData.value.output = {
    md516: '',
    md532: '',
    sha1: '',
    sha224: '',
    sha256: '',
    sha3: '',
    sha384: '',
    sha512: '',
    ripemd160: ''
  }
};

const changeNavEvent = (val: string) => {
  active.value.action = val;

  formData.value.input = '';
  formData.value.key = '';
  defaultConf();
};

const inputChangeEvent = (val: string) => {
  const type = active.value.action;

  if (!val) {
    defaultConf();
    return;
  };

  if (type === 'hash') {
    formData.value.output.md516 = hash['md5-16'](val);
    formData.value.output.md532 = hash['md5-32'](val);
    formData.value.output.sha1 = hash.sha1(val);
    formData.value.output.sha224 = hash.sha224(val);
    formData.value.output.sha256 = hash.sha256(val);
    formData.value.output.sha3 = hash.sha3(val);
    formData.value.output.sha384 = hash.sha384(val);
    formData.value.output.sha512 = hash.sha512(val);
    formData.value.output.ripemd160 = hash.ripemd160(val);
  } else if (type === 'hmac') {
    const key = formData.value.key;
    if (!key) {
      defaultConf();
      return;
    };

    formData.value.output.md516 = hmac['md5-16'](val, key);
    formData.value.output.md532 = hmac['md5-32'](val, key);
    formData.value.output.sha1 = hmac.sha1(val, key);
    formData.value.output.sha224 = hmac.sha224(val, key);
    formData.value.output.sha256 = hmac.sha256(val, key);
    formData.value.output.sha3 = hmac.sha3(val, key);
    formData.value.output.sha384 = hmac.sha384(val, key);
    formData.value.output.sha512 = hmac.sha512(val, key);
    formData.value.output.ripemd160 = hmac.ripemd160(val, key);
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
    flex: 1;

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
}
</style>
