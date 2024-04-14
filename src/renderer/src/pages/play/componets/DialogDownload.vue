<template>
  <t-dialog
    v-model:visible="formVisible"
    header="离线缓存"
    width="508"
    placement="center"
    confirm-btn="复制下载链接"
    :on-confirm="copyDownloadUrl"
    :cancel-btn="null"
  >
    <template #body>
      <div class="download-warp">
        <div class="source-warp">
          <t-select
            v-model="downloadSource"
            placeholder="请选下载源"
            size="small"
            style="width: 200px; display: inline-block"
            @change="downloadSourceChange"
          >
            <t-option v-for="(_, key) in formData.season" :key="key" :value="key">{{ key }}</t-option>
          </t-select>
          <t-button size="small" theme="default" @click="copyCurrentUrl">复制当前地址</t-button>
          <!-- <div>仅支持后缀为m3u8、flv、mp4</div> -->
        </div>
        <div class="content-warp">
          <t-transfer v-model="downloadTarget" :data="downloadEpisodes">
            <template #title="props">
              <div>{{ props.type === 'target' ? '需下载' : '待下载' }}</div>
            </template>
          </t-transfer>
        </div>
        <div class="tip-warp">
          <span>推荐使用开源下载器：</span>
          <t-link
            theme="primary"
            underline
            href="https://github.com/HeiSir2014/M3U8-Downloader/releases/"
            target="_blank"
          >
            M3U8-Downloader
          </t-link>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import _ from 'lodash';
import { reactive, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {
        season: {},
        current: '',
      };
    },
  },
});
const { isSupported, copy } = useClipboard();
const formVisible = ref(false);
const formData = ref(props.data);

const downloadSource = ref();
const downloadEpisodes = ref([]);
const downloadTarget = ref([]);

const emit = defineEmits(['update:visible']);

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

// 检查复制的复制
const checkDownloadUrl = (url) => {
  const allowedExtensions = ['m3u8', 'flv', 'mp4'];
  const urlExtension = url.match(/\.([^.]+)$/)?.[1]; // 使用正则表达式提取文件扩展名
  const isValid = urlExtension && allowedExtensions.includes(urlExtension); // 检查是否在允许的扩展名列表中

  if (!isValid) MessagePlugin.warning('注意: 当前选择非m3u8/flv/mp4播放源');
};

// 复制到剪贴板
const copyToClipboard = (content, successMessage, errorMessage) => {
  copy(content);
  if (isSupported) MessagePlugin.info(successMessage);
  else MessagePlugin.warning(errorMessage);
};

// 复制下载地址列表
const downloadSourceChange = () => {
  const list = [];
  for (const item of formData.value.season[downloadSource.value]) {
    const [index, url] = item.split('$');
    list.push({
      value: url,
      label: index,
      disabled: false,
    });
  }
  downloadEpisodes.value = list;
};

// 复制下载链接
const copyDownloadUrl = () => {
  const [firstUrl] = downloadTarget.value;

  if (firstUrl) {
    const downloadUrl = downloadTarget.value.join('\n');
    const successMessage = '复制成功，快到下载器里下载吧!';
    const errorMessage = '复制失败，当前环境不支持一键复制!';
    
    checkDownloadUrl(firstUrl);
    copyToClipboard(downloadUrl, successMessage, errorMessage);
    formVisible.value = false;
  } else {
    MessagePlugin.warning('请先选择需要下载的内容!');
  }
};

// 复制当前播放地址
const copyCurrentUrl = () => {
  const successMessage = '复制成功, 请使用第三方软件!';
  const errorMessage = '当前环境不支持一键复制,请手动复制链接!';
  copyToClipboard(formData.value.current, successMessage, errorMessage);
  checkDownloadUrl(formData.value.current);

  formVisible.value = false;
};
</script>

<style lang="less" scoped>
.download-warp {
  .source-warp {
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;
    flex-direction: row;
    align-items: center;
    color: var(--td-gray-color-6);
    font-size: var(--td-font-size-link-small);
  }

  .content-warp {
    margin: var(--td-comp-margin-s) 0;
    :deep(.t-button + .t-button) {
      margin-left: 0 !important;
    }
  }

  .tip-warp {
    bottom: calc(var(--td-comp-paddingTB-xxl) + 8px);
    font-size: var(--td-font-size-link-small);
    position: absolute;
    left: calc(var(--td-comp-paddingLR-xxl) + var(--td-size-1));
  }
}

// :deep(.t-select-input) {
//   color: var(--td-font-white-1) !important;
//   background-color: var(--td-bg-color-component) !important;
// }

// :deep(.t-input__inner),
// :deep(.t-transfer) {
//   color: var(--td-font-white-1) !important;
// }

// :deep(.t-input__inner) {
//   &::placeholder {
//     color: var(--td-gray-color-5);
//   }
// }

// .t-select :deep(.t-fake-arrow) {
//   color: var(--td-font-white-3);
// }

// .t-popup__content :deep(*) {
//   background: var(--td-gray-color-11) !important;
// }

// .t-select-option:not(.t-is-disabled):not(.t-is-selected):hover :deep(*) {
//   background-color: var(--td-gray-color-12);
// }

// .t-select-option :deep(*) {
//   color: var(--td-font-white-1);
// }

// .t-select-option.t-select-option__hover:not(.t-is-disabled).t-select-option.t-select-option__hover:not(.t-is-selected)
//   :deep(*) {
//   background-color: var(--td-gray-color-12);
// }

:deep(.t-transfer) {
  color: var(--td-text-color-primary);
  background-color: var(--td-bg-content-input);
  border-radius: var(--td-radius-large);

  &__list-source,
  &__list-target {
    border: var(--td-size-1) solid transparent;
  }

  &__list-header + :not(.t-transfer__list--with-search) {
    border-top: 1px solid var(--td-border-level-1-color);
  }

  &__list-item:hover {
    background-color: rgba(132, 133, 141, 0.16);
  }

  &__list-item.t-is-checked {
    background: var(--td-brand-color);
  }

  .t-checkbox__input {
    border: 1px solid transparent;
    background-color: var(--td-bg-color-secondarycontainer);
  }

  .t-button--variant-outline {
    background-color: var(--td-bg-color-secondarycontainer);
    border-color: transparent;

    &.t-is-disabled {
      border-color: transparent;
    }
  }
}

:deep(.t-input) {
  background-color: var(--td-bg-content-input) !important;
  border: none;
}
</style>
