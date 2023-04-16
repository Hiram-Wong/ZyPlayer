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
          <p>感谢您对ZyPlayer的信任，在此我们郑重提醒您:</p>
          <p>
            1.在您使用我们提供的服务时，我方平台并不会收集您的数据，在平台内所使用的所有内容均需您自行设置，与本平台无关，用户需自行负责。
          </p>
          <p>
            2.在使用ZyPlayer产品和服务前，请您务必仔细阅读和理解本政策，如您不同意本政策的任何内容，请您立即停止使用。当您开始使用我方提供的产品和服务时，即表示您已同意ZyPlayer本政策。
          </p>
          <p>
            3.我方平台不参与任何制作、上传、储存等内容, 禁止传播违法资源。该软件仅供学习参考, 请于安装后24小时内删除。
          </p>
        </div>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
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
  updateAgreementMask();
  formVisible.value = false;
};

const updateAgreementMask = async () => {
  await setting.update({
    agreementMask: 'true',
  });
};

const cancelEvent = () => {
  MessagePlugin.warning({ content: '5s后自动退出软件', duration: 5000 });
  setTimeout(() => {
    win.destroy();
  }, 5000);
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.privacy-policy-container {
  :deep(.t-dialog) {
    background-image: url(../assets/bg-left-circle.svg), url(../assets/bg-right-circle.svg);
    background-position: 0 0, 100% 280px;
    background-repeat: no-repeat;
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
        color: #777;
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
