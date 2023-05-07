<template>
  <t-dialog v-model:visible="formVisible" header="订阅配置" placement="center" :footer="false">
    <template #body>
      <div class="doh-dialog-container dialog-container-padding">
        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-textarea
            v-model="formData.data"
            class="dns-input"
            placeholder="请输入订阅链接"
            autofocus
            :autosize="{ minRows: 2, maxRows: 4 }"
          />

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
});
const formVisible = ref(false);

const formData = ref({ data: '' });

const emit = defineEmits(['update:visible', 'receiveCommunityData']);

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

const onSubmit = async () => {
  const { data } = formData.value;
  emit('receiveCommunityData', { data });

  formVisible.value = false;
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>
<style lang="less" scoped>
@import '@/style/variables.less';
</style>
