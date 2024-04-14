<template>
  <t-popup
    v-model:visible="formVisible"
    :on-visible-change="onShareVisibleChange"
    trigger="click"
    placement="bottom"
    :overlay-inner-style="{ boxShadow: 'none', padding: '0', borderRadius: '8px' }"
  >
    <slot name="customize"></slot>
    <template #content>
      <div class="share-container">
        <div class="share-container-main">
          <div class="share-container-main-left">
            <div class="header-name">扫一扫，手机继续看</div>
            <div class="header-info">
              推荐<span class="header-info-browser">夸克APP</span>-搜索框中的相机-扫码
            </div>
            <div class="header-copyright text-hide">
              <span>{{ data.provider }}</span>
              <span>提供支持,严禁传播资源</span>
            </div>
            <t-divider dashed style="margin: 5px 0" />
          </div>
          <div class="share-container-main-right">
            <qrcode-vue :value="data.url" :size="85" :margin="5" level="H" render-as="svg" class="qrcode" />
          </div>
        </div>
        <div class="bottom-title text-hide">{{ data.name }}</div>
        <div class="bottom-copy">
          <input v-model="data.url" class="input-url" readonly />
          <button class="btn-copy" @click="copyShareUrl">复制地址</button>
        </div>
      </div>
    </template>
  </t-popup>
</template>
<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

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

const data = ref(props.data);
const formVisible = ref(false);

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
    data.value = val;
  },
);

const copyToClipboard = async(content, successMessage, errorMessage) => {
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
const copyShareUrl = async() => {
  const successMessage = '复制成功，快分享给好友吧!';
  const errorMessage = '当前环境不支持一键复制，请手动复制链接!';
  await copyToClipboard(data.value.url, successMessage, errorMessage);

  formVisible.value = false;
};
</script>

<style lang="less" scoped>
.share-container {
  width: 340px;
  padding: 20px;
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
    height: 85px;

    &-left {
      width: 210px;
      .header-name {
        font-size: 15px;
        line-height: 40px;
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
        width: 85px;
        height: 85px;
        border-radius: var(--td-radius-large);
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid var(--td-border-level-2-color);
      }
    }
  }

  .bottom-title {
    margin-top: var(--td-comp-margin-s);
    line-height: 20px;
    font-weight: 600;
  }

  .bottom-copy {
    margin-top: var(--td-comp-margin-s);
    display: inline-block;
    position: relative;
    width: 100%;
    text-align: right;
    vertical-align: middle;
    background: var(--td-bg-content-input);
    height: 43px;
    border-radius: var(--td-radius-round);

    .input-url {
      width: 100%;
      height: 40px;
      background-color: initial;
      border: none;
      outline: none;
      font-size: 14px;
      color: var(--td-text-color-primary);
      letter-spacing: 0;
      padding: 9px 80px 9px 10px;
      position: absolute;
      left: 0;
    }
    .btn-copy {
      position: relative;
      right: 6px;
      width: 6em;
      height: 30px;
      line-height: 30px;
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
  