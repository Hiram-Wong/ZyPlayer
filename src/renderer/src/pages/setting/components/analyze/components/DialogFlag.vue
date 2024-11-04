<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.setting.dialog.flag')" placement="center" :footer="false" @close="onClose">
    <template #body>
      <div class="class-dialog-container dialog-container-padding">
        <t-form ref="form" :data="formData" @submit="onSubmit" @reset="onReset">
          <t-textarea v-model="flagData" class="textarea" :placeholder="$t('pages.setting.dialog.splitTip')" autofocus
            :autosize="{ minRows: 3, maxRows: 5 }" />
          <p class="tip bottom-tip">{{ $t('pages.setting.dialog.splitTip') }}</p>
          <div class="optios">
            <t-form-item style="float: right;">
              <t-button variant="outline" type="reset">{{ $t('pages.setting.dialog.reset') }}</t-button>
              <t-button theme="primary" type="submit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
            </t-form-item>
          </div>
        </t-form>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default: () => {
      return [];
    },
  },
});
const formVisible = ref(false);
const formData = ref({
  data: props.data,
  raw: props.data,
});
const flagData = computed({
  get() {
    return (formData.value.data || []).filter((p) => p !== '').join(',');
  },
  set(val) {
    formData.value.data = val.split(',').filter((p) => p !== '');
  },
});

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
  () => props.data,
  (val) => {
    formData.value = {
      data: val,
      raw: val
    };
  },
);

const onSubmit = async ({ validateResult }) => {
  if (validateResult === true) {
    emits('submit', 'flag', formData.value.data);
    formVisible.value = false;
  }
};

const onReset = () => {
  formData.value.data = formData.value.raw;
};

const onClose = () => {
  onReset();
};
</script>

<style lang="less" scoped></style>
