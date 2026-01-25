<template>
  <t-dialog v-model:visible="formVisible" v-bind="attrsCustom">
    <template #header>
      {{ formData.title }}
    </template>

    <template #body>
      <div class="content-overflow">
        <div class="content-wrapper">
          <render-md :content="formData.content" />
        </div>
      </div>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
defineOptions({
  name: 'DialogDocument',
});

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:visible']);

import type { Dialog, DialogProps } from 'tdesign-vue-next';
import { computed, ref, useAttrs, watch } from 'vue';

import RenderMd from '@/components/render-markdown/index.vue';

const attrs: Partial<DialogProps & { title: string; content: string; visible: boolean }> = useAttrs();

const dialogRef = ref<InstanceType<typeof Dialog>>();
const formVisible = ref(props.visible);
const formData = ref({
  title: props.title,
  content: props.content,
});

const attrsCustom = computed<Partial<DialogProps>>(() => {
  // eslint-disable-next-line ts/no-unused-vars
  const { title, content, visible, ...rest } = attrs;

  return {
    ref: dialogRef,
    showInAttachedElement: true,
    destroyOnClose: true,
    placement: 'center',
    lazy: true,
    footer: null,
    ...rest,
  } as Partial<DialogProps>;
});

watch(
  () => formVisible.value,
  (val) => emits('update:visible', val),
);
watch(
  () => props.visible,
  (val) => (formVisible.value = val),
);
watch(
  () => props.title,
  (val) => (formData.value.title = val),
);
watch(
  () => props.content,
  (val) => (formData.value.content = val),
);
</script>
<style scoped lang="less">
.content-overflow {
  position: relative;

  .content-wrapper {
    max-height: 340px;
    overflow: hidden auto;
  }
}
</style>
