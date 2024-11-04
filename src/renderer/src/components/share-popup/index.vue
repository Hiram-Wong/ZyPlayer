<template>
  <t-popup v-model:visible="formVisible" :on-visible-change="onShareVisibleChange" trigger="click" placement="bottom"
    :overlay-inner-style="{ boxShadow: 'none', padding: '0', borderRadius: '8px' }">
    <slot name="customize"></slot>
    <template #content>
      <div class="share-container">
        <div class="share-container-main">
          <div class="share-container-main-left">
            <div class="header-name">{{ $t('pages.share.headerName') }}</div>
            <div class="header-info">
              {{ $t('pages.share.headerInfoRecommend') }}
              <span class="header-info-browser">{{ $t('pages.share.headerInfoBrowser') }}</span>
              {{ $t('pages.share.headerInfoScan') }}
            </div>
            <div class="header-copyright text-hide">
              <span>{{ formData.provider }}</span>
              <span>&nbsp;{{ $t('pages.share.headerCopyright') }}</span>
            </div>
            <t-divider dashed style="margin: 5px 0" />
          </div>
          <div class="share-container-main-right">
            <qrcode-vue :value="formData.url" :size="85" :margin="5" level="H" render-as="svg" class="qrcode" />
          </div>
        </div>
        <div class="bottom-title text-hide">{{ formData.name }}</div>
        <div class="bottom-copy">
          <input v-model="formData.url" class="input-url" readonly />
          <button class="btn-copy" @click="copyShareUrl">{{ $t('pages.share.copyUrl') }}</button>
        </div>
      </div>
    </template>
  </t-popup>
</template>
<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { t } from '@/locales';
import { copyToClipboardApi } from '@/utils/tool';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {
        name: '',
        url: '',
        provider: '',
      };
    },
  },
});

const formData = ref(props.data);
const formVisible = ref(false);
const DEFAULT_SHARE_URL = 'https://web.zyplayer.fun/?url=';

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
    formData.value.url = DEFAULT_SHARE_URL + formData.value.url + '&name=' + formData.value.name;
  },
);

const copyToClipboard = async (content, successMessage, errorMessage) => {
  const res = await copyToClipboardApi(content);
  if (res) {
    MessagePlugin.info(successMessage);
  } else {
    MessagePlugin.warning(errorMessage);
  }
};

// 点击非浮层元素触发关闭分享
const onShareVisibleChange = (_, context) => {
  // trigger=document 表示点击非浮层元素触发
  if (context.trigger === 'document') formVisible.value = false;
};

// 复制分享地址
const copyShareUrl = async () => {
  const successMessage = t('pages.share.message.copySuccess');
  const errorMessage = t('pages.share.message.copyFail');
  await copyToClipboard(formData.value.url, successMessage, errorMessage);

  formVisible.value = false;
};
</script>

<style lang="less" scoped>
.share-container {
  width: 300px;
  padding: var(--td-pop-padding-xl);
  border-radius: var(--td-radius-large);
  position: relative;
  cursor: default;

  .text-hide {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  &-main {
    display: flex;
    justify-content: flex-start;
    height: 80px;
    flex-wrap: nowrap;
    flex-direction: row;
    align-items: stretch;

    &-left {
      width: 210px;

      .header-name {
        font-size: 14px;
        line-height: 30px;
      }

      .header-info {
        font-size: 12px;
        line-height: 20px;

        &-browser {
          color: var(--td-brand-color);
        }
      }

      .header-copyright {
        font-size: 12px;
        line-height: 20px;
      }
    }

    &-right {
      margin: 0 0 0 10px;

      .qrcode {
        width: 80px;
        height: 80px;
        border-radius: var(--td-radius-large);
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid var(--td-border-level-2-color);
      }
    }
  }

  .bottom-title {
    margin-top: var(--td-comp-margin-xxs);
    line-height: 20px;
    font-weight: 500;
  }

  .bottom-copy {
    margin-top: var(--td-comp-margin-s);
    display: inline-block;
    position: relative;
    width: 100%;
    text-align: right;
    vertical-align: middle;
    background: var(--td-bg-content-input-2);
    height: 32px;
    border-radius: var(--td-radius-round);

    .input-url {
      width: 100%;
      height: 32px;
      background-color: initial;
      border: none;
      outline: none;
      font-size: 14px;
      color: var(--td-text-color-primary);
      letter-spacing: 0;
      padding: 8px 80px 9px 10px;
      position: absolute;
      left: 0;
    }

    .btn-copy {
      position: relative;
      right: 6px;
      width: 5em;
      height: 22px;
      line-height: 20px;
      border-radius: 15px;
      font-weight: 500;
      background-color: var(--td-context-primary);
      color: var(--td-bg-popup);
      top: 5px;
      border: none;
      vertical-align: top;
      cursor: pointer;
    }
  }
}
</style>
