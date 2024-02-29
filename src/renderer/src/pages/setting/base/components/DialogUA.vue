<template>
  <t-dialog v-model:visible="formVisible" header="User-Agent" placement="center" :footer="false">
    <template #body>
      <div class="ua-dialog-container dialog-container-padding">
        <div class="header">
          <p class="tip">模拟用户代理</p>
        </div>

        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-textarea
            v-model="formData.data"
            class="dns-input"
            placeholder="请输入User-Agent"
            autofocus
            :autosize="{ minRows: 2, maxRows: 4 }"
            @change="changeUatextarea"
          />
          <t-radio-group v-model="dnsSelect" variant="default-filled" size="small" @change="changeUaSelect">
            <t-radio-button v-for="item in UA_LIST" :key="item.name" :value="item.ua">{{ item.name }}</t-radio-button>
          </t-radio-group>
          <p class="tip bottom-tip">推荐使用Chrome,为空使用系统默认</p>
          <div class="optios">
            <t-form-item style="float: right">
              <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
              <t-button theme="primary" type="submit">确定</t-button>
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

import UA_CONFIG from '@/config/ua';

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

const UA_LIST = reactive([...UA_CONFIG.ua]);

const dnsSelect = ref('');

const emit = defineEmits(['update:visible', 'receiveDnsData']);

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

    const index = _.findIndex(UA_LIST, ['ua', val.data]);
    if (index > -1) dnsSelect.value = val.data;
  },
);

const changeUatextarea = (item) => {
  const index = _.findIndex(UA_LIST, ['ua', item]);
  if (index === -1) dnsSelect.value = null;
};

const changeUaSelect = (item) => {
  formData.value.data = item;
};

const onSubmit = async () => {
  const { data, type } = formData.value;
  emit('receiveDnsData', {
    data,
    type,
  });

  window.electron.ipcRenderer.send('update-ua', !!data, data);

  formVisible.value = false;
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>

<style lang="less" scoped>
</style>
