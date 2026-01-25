<template>
  <div class="share-container">
    <div class="share-container-main">
      <div class="share-container-main-left">
        <div class="header-container">
          <div class="header-name">{{ textILabel.scan }}</div>
          <div class="header-desc">{{ textILabel.copyright }}</div>
        </div>
        <t-divider dashed class="divider" />
      </div>
      <div class="share-container-main-right">
        <div class="qrcode-container">
          <t-qrcode
            v-if="formIDataProps.url"
            :value="formIDataProps.url"
            borderless
            level="L"
            :size="66"
            type="svg"
            class="qrcode"
          />
          <t-qrcode v-else value="zyfun" borderless level="L" :size="66" type="svg" class="qrcode" status="loading" />
        </div>
      </div>
    </div>
    <div class="bottom-copy">
      <t-input-adornment>
        <t-input v-model="formIDataProps.url" readonly class="input-only" />
        <template #append>
          <t-button variant="text" @click="handleCopy">{{ $t('common.copy') }}</t-button>
        </template>
      </t-input-adornment>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'ShareCard',
});

const props = defineProps({
  data: {
    type: Object as PropType<IDataProps>,
    default: () => ({ name: '', url: '', enablePrefix: false }),
  },
  label: {
    type: Object as PropType<ILabelProps>,
    default: (): object => ({}),
  },
});

const emits = defineEmits(['copy']);

import { isHttp } from '@shared/modules/validate';
import { cloneDeep } from 'es-toolkit';
import qs from 'qs';
import { MessagePlugin, QRCode as TQrcode } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { computed, onMounted, ref, watch } from 'vue';

import { t } from '@/locales';

import type { IDataProps, ILabelProps } from './types';

const DEFAULT_PREFIX: string = 'https://web.zyplayer.fun/?url={url}';

const formIDataProps = ref<IDataProps>(cloneDeep(props.data));

const textILabel = computed(() => ({
  scan: props.label.scan || t('component.share.scan'),
  copyright: props.label.copyright || t('component.share.copyright'),
}));

watch(
  () => props.data,
  (newVal) => {
    formIDataProps.value = cloneDeep(newVal);
    setup();
  },
  { deep: true },
);

onMounted(() => setup());

const setup = () => {
  const { url, name, enablePrefix } = formIDataProps.value;
  if (!url) return;

  formIDataProps.value.url = formatUrl(url, enablePrefix, { name });
};

const formatUrl = (url: string, prefix: boolean = false, params: Record<string, any> = {}): string => {
  if (!isHttp(url)) return '';
  if (prefix) url = DEFAULT_PREFIX.replace('{url}', url);

  const urlObj = new URL(url);
  let searchParams = Object.fromEntries(urlObj.searchParams.entries());

  if (Object.keys(params).length > 0) {
    searchParams = { ...searchParams, ...params };
  }

  const queryString = qs.stringify(searchParams);

  const fullUrl = `${urlObj.origin}${urlObj.pathname}${queryString ? `?${decodeURIComponent(queryString)}` : ''}`;

  return fullUrl;
};

const handleCopy = async () => {
  const val = formIDataProps.value.url;
  if (!val) return;

  try {
    emits('copy');
    await navigator.clipboard.writeText(val);
    MessagePlugin.success(t('common.copySuccess'));
  } catch {
    MessagePlugin.error(t('common.copyFail'));
  }
};
</script>
<style lang="less" scoped>
.share-container {
  width: 300px;
  padding: var(--td-pop-padding-xl);
  position: relative;
  cursor: default;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  &-main {
    max-height: 80px;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    flex-wrap: nowrap;
    column-gap: var(--td-size-4);

    &-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .header-container {
        .header-name {
          font-size: 14px;
          line-height: 30px;
          font-weight: 500;
        }

        .header-desc {
          font-size: 12px;
          line-height: 20px;
        }
      }

      .divider {
        margin: var(--td-size-2) 0 0 0;
      }
    }

    &-right {
      flex-grow: 0;
      flex-shrink: 0;

      .qrcode-container {
        width: calc(var(--td-comp-size-xxxxxl) + var(--td-size-1));
        height: calc(var(--td-comp-size-xxxxxl) + var(--td-size-1));
        border-radius: var(--td-radius-medium);
        background-color: var(--td-bg-color-component);
        padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-xs);
        display: flex;
        align-items: center;
        justify-content: center;

        .qrcode {
          border-radius: var(--td-radius-default);
          padding: 0;
          border: 0;
          overflow: hidden;

          :deep(.t-mask) {
            border-radius: 0;
          }

          :deep(svg) {
            border-radius: var(--td-radius-xs);
          }
        }
      }
    }
  }

  .bottom-title {
    font-weight: 500;
  }

  .bottom-copy {
    :deep(.input-only) {
      .t-input {
        border-width: 0;
      }

      .t-input--focused {
        box-shadow: none;
      }
    }

    :deep(.t-input-adornment__append) {
      margin-left: 0;

      .t-button {
        border: none;
        width: calc(var(--td-comp-size-xxxxxl) + var(--td-size-1));
      }

      .t-button--variant-text:hover,
      .t-button--variant-text:focus-visible {
        border-radius: 0 var(--td-radius-medium) var(--td-radius-medium) 0;
      }
    }
  }
}
</style>
