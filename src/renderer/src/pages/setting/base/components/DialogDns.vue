<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.dns.title')" placement="center" :footer="false">
    <template #body>
      <div class="doh-dialog-container dialog-container-padding">
        <div class="header">
          <p class="tip">{{ $t('pages.setting.dns.topTip') }}</p>
        </div>

        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-textarea v-model="formData.data" class="text-input" :placeholder="$t('pages.setting.placeholder.general')"
            autofocus :autosize="{ minRows: 2, maxRows: 4 }" @change="changeDnstextarea" />
          <t-radio-group v-model="dnsSelect" variant="default-filled" size="small" @change="changeDnsSelect">
            <t-radio-button v-for="item in DNS_LIST" :key="item.name" :value="item.dns">{{ item.name }}</t-radio-button>
          </t-radio-group>
          <p class="tip bottom-tip">{{ $t('pages.setting.dns.bottomTip') }}</p>
          <div class="optios">
            <t-form-item style="float: right">
              <t-button variant="outline" @click="onClickCloseBtn">{{ $t('pages.setting.dialog.cancel') }}</t-button>
              <t-button theme="primary" type="submit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
            </t-form-item>
          </div>
        </t-form>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { reactive, ref, watch } from 'vue';

import DNS_CONFIG from '@/config/doh';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {
        data: '',
        type: '',
      };
    },
  },
});
const formVisible = ref(false);
const formData = ref(props.data);

const DNS_LIST = reactive([...DNS_CONFIG.doh]);

const dnsSelect = ref('');

const emit = defineEmits(['update:visible', 'receiveData']);

watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
  },
);
watch(
  () => props.data,
  (val) => {
    formData.value = val;

    const index = _.findIndex(DNS_LIST, ['dns', val.data]);
    if (index > -1) dnsSelect.value = val.data;
  },
);

const changeDnstextarea = (item) => {
  const index = _.findIndex(DNS_LIST, ['dns', item]);
  if (index === -1) dnsSelect.value = '';
};

const changeDnsSelect = (item) => {
  formData.value.data = item;
};

const onSubmit = async () => {
  const { data, type } = formData.value;
  emit('receiveData', {
    data,
    type,
  });

  window.electron.ipcRenderer.send('updateDns', data);

  formVisible.value = false;
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>

<style lang="less" scoped></style>
