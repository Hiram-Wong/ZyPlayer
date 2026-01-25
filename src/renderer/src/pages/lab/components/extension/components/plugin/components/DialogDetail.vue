<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachContent}`"
    width="70%"
    placement="center"
    destroy-on-close
    lazy
    :footer="false"
  >
    <template #header>
      {{ $t('common.info') }}
    </template>
    <template #body>
      <div class="detail view-container">
        <div class="plugin-header">
          <div v-if="formData.logo" class="logo">
            <t-image
              class="icon"
              shape="round"
              :src="formData.logo"
              :lazy="true"
              fit="cover"
              :loading="renderDefaultLazy"
              :error="renderDefaultLazy"
            />
          </div>
          <div class="base">
            <h1 class="title">
              <span class="name">{{ formData.pluginName || '' }}</span>
              <span class="version">v{{ formData.version || '0.0.0' }}</span>
            </h1>
            <span class="desc txthide txthide2">
              {{ formData.description || $t('pages.lab.extension.plugin.empty') }}</span
            >
            <div class="info">
              <div v-if="[2, 3].includes(formData.type)" class="status info-item">
                <application-icon class="icon" />
                <t-tag v-if="formData.isActive" theme="success" shape="round" size="small">
                  {{ $t('pages.lab.extension.plugin.info.start') }}
                </t-tag>
                <t-tag v-else theme="danger" shape="round" size="small">{{
                  $t('pages.lab.extension.plugin.info.stop')
                }}</t-tag>
              </div>
              <div class="author info-item">
                <verified-icon class="icon" />
                <span>{{ formData.author || $t('pages.lab.extension.plugin.empty') }}</span>
              </div>
            </div>
          </div>
          <div class="action"></div>
        </div>

        <div class="plugin-readme data-item">
          <p class="title-label">{{ $t('pages.lab.extension.plugin.content.title') }}</p>
          <div class="md">
            <render-md class="custom-md" :text="formData.readme" />
          </div>
        </div>
      </div>
    </template>
  </t-dialog>
</template>
<script setup lang="tsx">
import { ApplicationIcon, VerifiedIcon } from 'tdesign-icons-vue-next';
import { ref, watch } from 'vue';

import LazyBg from '@/components/lazy-bg/index.vue';
import RenderMd from '@/components/render-markdown/index.vue';
import { attachContent } from '@/config/global';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {},
  },
});
const emits = defineEmits(['update:visible', 'submit']);

const formVisible = ref(false);
const formData = ref(props.data);

const renderDefaultLazy = () => <LazyBg class="render-icon" />;

watch(
  () => formVisible.value,
  (val) => emits('update:visible', val),
);
watch(
  () => props.visible,
  (val) => (formVisible.value = val),
);
watch(
  () => props.data,
  (val) => (formData.value = val),
);
</script>
<style lang="less" scoped>
.view-container {
  max-height: 340px;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .plugin-header {
    height: fit-content;
    display: flex;
    flex-direction: row;
    gap: var(--td-size-4);
    align-items: center;
    margin: auto 0;

    .logo {
      position: relative;
      width: calc(var(--td-size-8) + var(--td-size-16));
      height: calc(var(--td-size-8) + var(--td-size-16));

      .icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: var(--td-comp-size-xxxxl);
        height: var(--td-comp-size-xxxxl);
      }
    }

    .base {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      height: 100%;
      justify-content: space-around;
      color: var(--td-text-color-primary);

      .title {
        display: flex;
        gap: var(--td-size-4);
        align-items: flex-end;
        flex-direction: row;
        margin: 0;

        .name {
          font-size: var(--td-font-size-title-large);
          line-height: var(--td-line-height-title-large);
          font-weight: 500;
        }

        .version {
          font-size: var(--td-font-size-title-small);
          font-weight: 400;
        }
      }

      .desc {
        line-height: var(--td-line-height-body-large);
        width: 100%;
        white-space: wrap;
      }

      .info {
        display: flex;
        gap: var(--td-size-4);

        .info-item {
          display: flex;
          align-items: center;
          gap: var(--td-size-2);

          .icon {
            width: var(--td-comp-size-xxxs);
            height: var(--td-comp-size-xxxs);
          }
        }
      }
    }

    .action {
      margin-left: auto;
      display: flex;
      gap: var(--td-size-4);
      padding: 0 var(--td-comp-paddingLR-s) 0 0;
    }
  }

  .plugin-readme {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    width: 100%;
    overflow: hidden;

    .md {
      min-height: 24px;
      flex: 1;
      overflow: auto;
      padding: 0 var(--td-comp-paddingLR-s) 0 0;

      .custom-md {
        :deep(a) {
          pointer-events: none;
        }
      }
    }
  }
}
</style>
