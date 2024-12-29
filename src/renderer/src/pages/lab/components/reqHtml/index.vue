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
      <t-button class="button w-btn" theme="default" @click="getSource()">
        {{ $t('pages.lab.staticFilter.action.source') }}
      </t-button>
    </div>

    <t-dialog
      v-model:visible="active.reqDialog"
      placement="center"
      :header="$t('pages.lab.staticFilter.dialog.request.title')"
      :cancel-btn="$t('pages.lab.staticFilter.dialog.request.cancel')"
      show-in-attached-element
      attach=".view-container"
      @confirm="active.reqDialog = false"
      @cancel="reqCancel()"
    >
      <div class="dialog-item">
        <p>{{ $t('pages.lab.staticFilter.dialog.request.reqEncode') }}</p>
        <t-select v-model="formData.encode">
          <t-option v-for="item in reqEncode" :key="item.value" :value="item.value" :label="item.label" />
        </t-select>
      </div>
      <div class="dialog-item">
        <p>{{ $t('pages.lab.staticFilter.dialog.request.reqHeader') }}</p>
        <t-textarea v-model="formData.header" placeholder='{ "User-Agent": "Mozilla/5.0" }' />
      </div>
      <div v-if="formData.method !== 'GET'" class="dialog-item">
        <p>{{ $t('pages.lab.staticFilter.dialog.request.reqBody') }}</p>
        <t-select v-model="formData.contentType" class="contentType" style="margin-bottom: 5px;">
          <t-option v-for="item in reqContentTypes" :key="item.label" :value="item.value"
            :label="item.label" />
        </t-select>
        <t-textarea v-model="formData.body" placeholder='{ "key": "01b9b7" }' />
      </div>
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
      header: '',
      contentType: 'application/json',
      body: '',
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

const prepareRequestOptions = (method, header, body, contentType) => {
  const parsedHeader = JSON.parse(header || '{}');
  let parsedBody = JSON.parse(body || '{}');

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

const getSource = async () => {
  const { url, method, encode, header, body, contentType } = formData.value;

  if (!url) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.htmlNoUrl'));
    return;
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

const reqCancel = () => {
  formData.value.header = '';
  formData.value.body = '';
  formData.value.encode = 'UTF-8';
  formData.value.contentType = 'application/json';
  active.value.reqDialog = true;
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
}
</style>
