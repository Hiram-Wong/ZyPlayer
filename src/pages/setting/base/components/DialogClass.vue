<template>
  <t-dialog v-model:visible="formVisible" :header="classHeader" placement="center" :footer="false">
    <template #body>
      <div class="class-dialog-container dialog-container-padding">
        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-textarea
            v-model="classData"
            class="textarea"
            placeholder="请输入过滤关键词,逗号分隔"
            autofocus
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
          <p class="tip bottom-tip">分隔符请使用英文状态下","</p>
          <div class="optios">
            <t-form-item style="float: right; margin: ">
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
import { ref, watch, computed } from 'vue';
import _ from 'lodash';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {
        data: [],
        type: '',
      };
    },
  },
});
const formVisible = ref(false);
const formData = ref(props.data);

const classHeader = computed(() => {
  if (formData.value.type === 'rootClassFilter') return '主要分类';
  return '青少年分类';
});
const classData = computed({
  get() {
    return _.join((formData.value.data||[]).filter(p=> p!==''), ',');
  },
  set(val) {
    formData.value.data = _.split(val, ',').filter(p=> p!=='');
  },
});

const emit = defineEmits(['update:visible', 'receiveClassData']);

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
  },
);

const onSubmit = () => {
  emit('receiveClassData', {
    data: formData.value.data,
    type: formData.value.type,
  });

  formVisible.value = false;
};
const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>
<style lang="less" scoped>
@import '@/style/variables.less';
</style>
