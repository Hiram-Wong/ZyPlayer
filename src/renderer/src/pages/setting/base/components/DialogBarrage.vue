<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.barrage.title')" placement="center"
    :footer="false">
    <template #body>
      <div class="doh-dialog-container dialog-container-padding">
        <div class="header">
          <p>{{ $t('pages.setting.barrage.header') }}</p>
        </div>

        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-space direction="vertical">
            <t-input v-model="formData.url" :label="$t('pages.setting.barrage.api')"
              :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '408px' }" />
            <t-input v-model="formData.key" :label="$t('pages.setting.barrage.key')"
              :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '408px' }" />
            <t-tag-input v-model="formData.support" :label="$t('pages.setting.barrage.support')"
              :placeholder="$t('pages.setting.placeholder.categoryTip')" clearable :style="{ width: '408px' }" />
            <p>{{ $t('pages.setting.barrage.param') }}</p>
            <t-space align="center">
              <t-input v-model="formData.start" :label="$t('pages.setting.barrage.start')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '90px' }" />
              <t-input v-model="formData.color" :label="$t('pages.setting.barrage.color')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '90px' }" />
              <t-input v-model="formData.mode" :label="$t('pages.setting.barrage.mode')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '90px' }" />
              <t-input v-model="formData.content" :label="$t('pages.setting.barrage.content')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '90px' }" />
            </t-space>
          </t-space>
          <p class="tip bottom-tip">{{ $t('pages.setting.barrage.tip') }}</p>
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
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  barrage: {
    type: Object,
    default: () => {
      return { url: '', key: '', support: [], start: '', mode: '', color: '', content: '' }
    }
  },
});
const formVisible = ref(false);
const formData = ref(props.barrage);

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
  () => props.barrage,
  (val) => {
    formData.value = val;
  },
);

const onSubmit = async () => {
  emit('receiveData', {
    data: formData.value,
    type: 'barrage'
  });

  formVisible.value = false;
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>

<style lang="less" scoped></style>
