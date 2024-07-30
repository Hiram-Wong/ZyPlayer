<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.ua.title')" placement="center" :footer="false">
    <template #body>
      <div class="ua-dialog-container dialog-container-padding">
        <div class="header">
          <p class="tip">{{ $t('pages.setting.ua.topTip') }}</p>
        </div>

        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-textarea v-model="formData.data" class="text-input" :placeholder="$t('pages.setting.placeholder.general')"
            autofocus :autosize="{ minRows: 2, maxRows: 4 }" @change="changeUatextarea" />
          <t-radio-group v-model="active.select" variant="default-filled" size="small" @change="changeUaSelect">
            <t-radio-button v-for="item in UA_LIST" :key="item.name" :value="item.ua">{{ item.name }}</t-radio-button>
          </t-radio-group>
          <p class="tip bottom-tip">{{ $t('pages.setting.ua.bottomTip') }}</p>
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

const UA_LIST = [...UA_CONFIG.ua];
const active = reactive({
  select: ''
});

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

    const index = _.findIndex(UA_LIST, ['ua', val.data]);
    if (index > -1) active.select = val.data;
  },
);

const changeUatextarea = (item) => {
  const index = _.findIndex(UA_LIST, ['ua', item]);
  if (index === -1) active.select = '';
};

const changeUaSelect = (item) => {
  formData.value.data = item;
};

const onSubmit = async () => {
  const { data, type } = formData.value;
  emit('receiveData', {
    data,
    type,
  });

  formVisible.value = false;
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>

<style lang="less" scoped>
:deep(.t-radio-group) {
  margin-bottom: 0 !important;
}
</style>
