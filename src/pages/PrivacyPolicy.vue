<template>
  <div class="privacy-policy-container">
    <t-dialog
      v-model:visible="formVisible"
      :close-btn="false"
      :close-on-esc-keydown="false"
      :header="false"
      :close-on-overlay-click="false"
      confirm-btn="同意并继续"
      cancel-btn="不同意"
      :on-confirm="confirmEvent"
      :on-close="cancelEvent"
      placement="center"
      width="480px"
    >
      <div class="privacy-policy">
        <div class="header">用户协议与免责声明</div>
        <div class="main-content">
          <p>感谢您选择使用zyplayer(以下简称本软件),在使用产品和服务之前，请您仔细阅读和理解以下声明:</p>
          <p>
            1.若您不同意本声明的任何内容，请您立即停止使用本软件;一旦您开始使用本软件产品和服务，则表示您已同意本声明的所有内容。
          </p>
          <p>
            2.本软件仅供个人学习、研究和技术交流使用。本软件仅提供搜索和展示功能，不直接存储、制作、上传、传播任何视频、音频或其他媒体内容。所有媒体资源均由第三方提供，包括但不限于视频网站、媒体分享站点等。本软件无法控制这些资源的合法性、准确性、完整性或可用性，因此不对资源内容的真实性、合法性或适用性负责。
          </p>
          <p>
            3.本软件资源嗅探特性可能引发隐私和安全风险。我们不对资源嗅探可能导致的信息泄露或滥用承担任何责任。
          </p>
          <p>
            4.您在使用本软件时需自行负责所有操作和使用结果。本软件不对您通过使用本软件获取的任何内容负责，包括但不限于媒体资源的准确性、版权合规性、完整性、安全性和可用性。对于任何因使用本软件导致的损失、损害或法律纠纷，不承担任何责任。
          </p>
          <p>
            5.您在使用本软件时必须遵守您所在国家/地区的相关法律法规。禁止使用本软件进行任何违反法律法规的活动，包括但不限于制作、上传、传播、存储任何违法、侵权、淫秽、诽谤、恶意软件等内容。如您违反相关法律法规，需自行承担法律责任。
          </p>
          <p>
            6.本免责声明适用于本软件的所有用户。本软件保留随时修改、更新本声明的权利，并以网站公告、软件更新等形式通知用户。请您定期查阅并遵守最新的免责声明。
          </p>
          <p>请您在使用本软件之前认真阅读并理解本免责声明的所有内容，感谢您的理解和支持！</p>
        </div>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { setting } from '@/lib/dexie';

const { getCurrentWindow } = window.require('@electron/remote');
const win = getCurrentWindow();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
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

const confirmEvent = () => {
  updateAgreementMask(true);
  formVisible.value = false;
};

const updateAgreementMask = async (status) => {
  await setting.update({
    agreementMask: status,
  });
};

const cancelEvent = () => {
  updateAgreementMask(false);
  MessagePlugin.warning({ content: '5秒后自动退出软件', duration: 5000 });
  setTimeout(() => {
    win.destroy();
  }, 5000);
};
</script>

<style lang="less" scoped>
.privacy-policy-container {
  :deep(.t-dialog) {
    .t-dialog__footer {
      display: flex;
      justify-content: space-around;
      .t-button {
        width: 180px;
        height: 45px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 15px;
        line-height: 45px;
      }
    }
  }
  .privacy-policy {
    opacity: 1;
    .header {
      margin-top: 45px;
      font-weight: 700;
      font-size: 28px;
      text-align: center;
    }
    .main-content {
      height: 220px;
      margin: 35px auto 40px;
      overflow-x: hidden;
      overflow-y: scroll;
      p {
        margin: 0 20px 15px;
        font-weight: 400;
        font-size: 13px;
        line-height: 22px;
        word-break: break-all;
        text-align: justify;
      }
    }
  }
}
</style>
