<template>
  <t-popup
    v-model:visible="formVisible"
    trigger="click"
    placement="bottom-right"
    :overlay-inner-style="{ boxShadow: 'none', padding: '0', borderRadius: '8px' }"
  >
    <share-icon size="1.5em" />
    <template #content>
      <div class="share-container">
        <div class="share-container-main">
          <div class="share-container-main-left">
            <div class="header-name">扫一扫，手机继续看</div>
            <div class="header-info">
              推荐使用 <span class="header-info-browser">夸克浏览器</span> -<photo-icon size="1.5em" />-扫码
            </div>
            <div class="header-copyright no-warp">
              <span>{{ data.provider }}</span>
              <span>提供支持,严禁传播资源</span>
            </div>
            <t-divider dashed style="margin: 5px 0" />
          </div>
          <div class="share-container-main-right">
            <div class="bg"></div>
            <div class="main">
              <img class="qrcode" :src="qrCodeUrl" alt="二维码" />
            </div>
          </div>
        </div>
        <div class="bottom-title no-warp">{{ data.name }}</div>
        <div class="bottom-copy">
          <input v-model="data.url" class="input-url" readonly />
          <button class="btn-copy" @click="copyShareUrl">复制地址</button>
        </div>
      </div>
    </template>
  </t-popup>
</template>
<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import QRCode from 'qrcode';
import { PhotoIcon, ShareIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

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

const QR_CODE_OPTIONS = {
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  quality: 0.3,
  margin: 4,
};

const data = ref(props.data);
const { isSupported, copy } = useClipboard();
const formVisible = ref(false);
const qrCodeUrl = ref('');

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
    if (val) generateQRCode();
  },
);
watch(
  () => props.data,
  (val) => {
    data.value = val;
  },
);

// 生成二维码
const generateQRCode = async () => {
  try {
    const url = await QRCode.toDataURL(data.value.url, QR_CODE_OPTIONS);
    qrCodeUrl.value = url;
  } catch (err) {
    console.log(err);
  }
};

const copyToClipboard = (content, successMessage, errorMessage) => {
  copy(content);
  if (isSupported) {
    MessagePlugin.info(successMessage);
  } else {
    MessagePlugin.warning(errorMessage);
  }
};

// 复制分享地址
const copyShareUrl = () => {
  const successMessage = '复制成功，快分享给好友吧!';
  const errorMessage = '当前环境不支持一键复制，请手动复制链接!';
  copyToClipboard(data.value.url, successMessage, errorMessage);

  formVisible.value = false;
};
</script>

<style lang="less" scoped>
.share-container {
  width: 350px;
  padding: 20px;
  border-radius: 8px;
  margin-top: 5px;
  position: relative;
  background-color: #2a2a31;
  cursor: default;

  .no-warp {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  &-main {
    display: flex;
    justify-content: flex-start;

    &-left {
      width: 190px;
      .header-name {
        color: hsla(0, 0%, 100%, 0.87);
        font-size: 15px;
        line-height: 40px;
      }

      .header-info {
        color: hsla(0, 0%, 100%, 0.6);
        font-size: 12px;
        line-height: 20px;

        &-browser {
          color: #61f6ff;
        }
      }

      .header-copyright {
        color: hsla(0, 0%, 100%, 0.6);
        font-size: 12px;
        line-height: 20px;
      }
    }

    &-right {
      position: relative;

      .bg {
        position: absolute;
        background-color: #16161a;
        width: 20px;
        height: 80px;
        border-radius: var(--td-radius-medium);
        top: 5px;
        left: 10px;
      }

      .main {
        position: absolute;
        top: 0;
        left: 30px;

        .qrcode {
          width: 90px;
          height: 90px;
          border-radius: var(--td-radius-large);
        }
      }
    }
  }

  .bottom-title {
    margin-top: 5px;
    line-height: 20px;
    font-weight: 500;
    color: hsla(0, 0%, 100%, 0.87);
  }
  .bottom-copy {
    margin-top: 5px;
    display: inline-block;
    position: relative;
    width: 100%;
    text-align: right;
    vertical-align: middle;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid hsla(0, 0%, 100%, 0.3);
    height: 43px;
    border-radius: 21px;

    .input-url {
      width: 100%;
      height: 40px;
      background-color: initial;
      border: none;
      outline: none;
      caret-color: #e7e7e7;
      font-size: 14px;
      color: #fff;
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
      background-color: #fff;
      color: #222;
      font-size: 12px;
      top: 5px;
      border: none;
      vertical-align: top;
      cursor: pointer;
    }
  }
}
</style>
