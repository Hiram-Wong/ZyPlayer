<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.barrage.title')" placement="center"
    :footer="false">
    <template #body>
      <div class="doh-dialog-container dialog-container-padding">
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <div class="data-item top">
            <p class="title-label mg-b">{{ $t('pages.setting.barrage.base') }}</p>
            <div class="base">
              <t-input v-model="formData.url" :label="$t('pages.setting.barrage.api')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '408px' }" />
              <t-input v-model="formData.id" :label="$t('pages.setting.barrage.id')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '408px' }" />
              <t-input v-model="formData.key" :label="$t('pages.setting.barrage.key')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '408px' }" />
              <t-tag-input v-model="formData.support" :label="$t('pages.setting.barrage.support')"
                :placeholder="$t('pages.setting.placeholder.categoryTip')" clearable :style="{ width: '408px' }" />
            </div>
          </div>
          <div class="data-item">
            <p class="title-label mg-tb">{{ $t('pages.setting.barrage.param') }}</p>
            <div class="param">
              <t-input v-model="formData.start" :label="$t('pages.setting.barrage.start')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '90px' }" />
              <t-input v-model="formData.color" :label="$t('pages.setting.barrage.color')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '90px' }" />
              <t-input v-model="formData.mode" :label="$t('pages.setting.barrage.mode')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '90px' }" />
              <t-input v-model="formData.content" :label="$t('pages.setting.barrage.content')"
                :placeholder="$t('pages.setting.placeholder.general')" :style="{ width: '90px' }" />
            </div>
          </div>
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
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  barrage: {
    type: Object,
    default: () => {
      return { url: '', id: '', key: '', support: [], start: '', mode: '', color: '', content: '' }
    }
  },
});
const formVisible = ref(false);
const formData = ref(props.barrage);

const emits = defineEmits(['update:visible', 'submit']);

watch(
  () => formVisible.value,
  (val) => {
    emits('update:visible', val);
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
  emits('submit', {
    data: formData.value,
    type: 'barrage'
  });

  formVisible.value = false;
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>

<style lang="less" scoped>
.doh-dialog-container {
  :deep(.t-tag--default) {
    background-color: var(--td-bg-content-active-2);
  }

  .base {
    display: flex;
    flex-direction: column;
    gap: var(--td-comp-margin-m);
    align-items: stretch;
  }

  .param {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
  }
}
</style>
