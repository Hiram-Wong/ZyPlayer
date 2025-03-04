<template>
  <div class="get-html">
    <div class="input-group">
      <t-input
        v-model="formData.url"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-100%"
      >
        <template #label>
          <t-select v-model="formData.method" auto-width>
            <t-option v-for="item in reqMethods" :key="item.value" :value="item.value" :label="item.label" />
          </t-select>
        </template>
        <template #suffix>
          <t-button theme="default" size="small" @click="active.reqDialog = true">
            <transform-icon />
          </t-button>
        </template>

      </t-input>
      <t-button class="button w-btn" theme="default" @click="onSubmit()">
        {{ $t('pages.lab.staticFilter.action.source') }}
      </t-button>
    </div>

    <t-dialog
      v-model:visible="active.reqDialog"
      show-in-attached-element
      attach="#main-component"
      placement="center"
      width="50%"
    >
      <template #header>
        {{ $t('pages.lab.req.title') }}
      </template>
      <template #body>
        <t-form ref="formRef" :data="formData" :rules="RULES" :label-width="80">
          <t-form-item :label="$t('pages.lab.req.reqEncode')" name="encode">
            <t-select v-model="formData.encode" :options="reqEncode" />
          </t-form-item>
          <t-form-item :label="$t('pages.lab.req.reqHeader')" name="header">
            <t-textarea v-model="formData.header" placeholder='{ "User-Agent": "Mozilla/5.0" }' />
          </t-form-item>
          <t-form-item :label="$t('pages.lab.req.contentType')" name="contentType" v-if="formData.method !== 'GET'">
            <t-select v-model="formData.contentType" :options="reqContentTypes"  />
          </t-form-item>
          <t-form-item :label="$t('pages.lab.req.reqBody')" name="body" v-if="formData.method !== 'GET'">
            <t-textarea v-model="formData.body" placeholder='{ "key": "01b9b7" }' />
          </t-form-item>
        </t-form>
      </template>
      <template #footer>
        <t-button variant="outline" @click="onReset">{{ $t('pages.setting.dialog.reset') }}</t-button>
        <t-button theme="primary" @click="onSubmit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { TransformIcon } from 'tdesign-icons-vue-next';
import { t } from '@/locales';
import { fetchHtml } from '@/api/setting';

const reqMethods = [
  {
    label: 'GET',
    value: 'GET',
  },
  {
    label: 'POST',
    value: 'POST',
  },
  {
    label: 'DELETE',
    value: 'DELETE',
  },
  {
    label: 'PUT',
    value: 'PUT',
  },
  {
    label: 'OPTIONS',
    value: 'OPTIONS',
  },
  {
    label: 'HEAD',
    value: 'HEAD',
  }
];

const reqEncode = [
  {
    label: 'UTF-8',
    value: 'UTF-8',
  },
  {
    label: 'GB2312',
    value: 'GB2312',
  },
  {
    label: 'GBK',
    value: 'GBK',
  },
  {
    label: 'GB18030',
    value: 'GB18030',
  },
];

const reqContentTypes = [
  {
    label: 'application/json',
    value: 'application/json',
  },
  {
    label: 'application/x-www-form-urlencoded',
    value: 'application/x-www-form-urlencoded',
  },
];

const props = defineProps({
  data: {
    type: Object,
    default:{
      method: 'GET',
      url: '',
      encode: 'UTF-8',
      header: '{}',
      contentType: 'application/json',
      body: '{}',
    }
  },
});

const emits = defineEmits(['update:data', 'source']);

const formData = ref(props.data);
watch(
  () => props.data,
  (val) => {
    formData.value = val;
  },
  { deep: true }
);

const active = ref({
  reqDialog: false,
});

const prepareRequestOptions = (method = 'GET', header = '{}', body = '{}', contentType = 'application/json') => {
  if (!header) header = '{}';
  if (!body) body = '{}';
  const parsedHeader = Function('return (' + header + ')')();
  let parsedBody = Function('return (' + body + ')')();

  if (method !== 'GET' && parsedBody) {
    parsedHeader['Content-Type'] = contentType;
    if (contentType === 'application/x-www-form-urlencoded') {
      parsedBody instanceof URLSearchParams
        ? parsedBody
        : (parsedBody = new URLSearchParams(parsedBody));
    }
  }

  let parseHeaderKeys: string[];
  parseHeaderKeys = Object.keys(parsedHeader).map(it => it.toLowerCase());
  if (!parseHeaderKeys.includes('accept')) {
    parsedHeader['Accept'] = '*/*';
  }

  return { parsedHeader, parsedBody };
};

const onSubmit = async () => {
  let { url, method, encode, header, body, contentType } = formData.value;

  if (!url) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.htmlNoUrl'));
    return;
  };

  if (!url.startsWith('http')) {
    url = 'http://' + url;
  };

  try {
    const { parsedHeader, parsedBody } = prepareRequestOptions(method, header, body, contentType);
    const response = await fetchHtml({
      url, method, encode, headers: parsedHeader, data: parsedBody
    });
    if (response) {
      emits('source', response);
      MessagePlugin.success(`${t('pages.setting.data.success')}`);
    }
  } catch (err) {
    console.error('Error parsing header or body:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

const onReset = () => {
  formData.value.header = '{}';
  formData.value.body = '{}';
  formData.value.encode = 'UTF-8';
  formData.value.contentType = 'application/json';
};

const RULES = {
  encode: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
};
</script>

<style lang="less" scoped>
.get-html {
  .input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    grid-gap: var(--td-comp-margin-s);
  }

  :deep(.t-input) {
    .t-input__prefix:not(:empty) {
      margin-right: 0;
    }

    .t-input__suffix:not(:empty) {
      margin-left: 0;
    }
  }
}
</style>
