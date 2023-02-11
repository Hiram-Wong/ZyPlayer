<template>
  <div class="privacy-policy-container">
    <div class="privacy-policy-confirm">
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
        attach=".privacy-policy-confirm"
        placement="center"
        width="480px"
      >
        <div class="privacy-policy">
          <div class="header">用户协议与免责声明</div>
          <div class="main-content">
            <p>
              &nbsp;&nbsp;&nbsp;&nbsp;感谢您对ZyPlayer的信任，我们将按照法律法规要求，采取严格的安全保护措施，在此，我们郑重提醒您：
            </p>
            <p>
              1.在您使用我们提供的服务时，我方平台并不会收集您的数据，在平台内所使用的所有内容均需您自行设置，与本平台无关，用户需自行负责。
            </p>
            <p>
              2.在使用ZyPlayer各项产品和服务前，请您务必仔细阅读和理解本政策，如您不同意本政策的任何内容，请您立即停止使用我方平台的服务。当您开始使用我方提供的任一产品和服务时，即表示您已同意ZyPlayer按照本政策保护您的个人信息。
            </p>
            <p>
              3.我方平台不参与任何制作, 上传, 储存等内容, 禁止传播违法资源. 该软件仅供学习参考, 请于安装后24小时内删除。
            </p>
          </div>
        </div>
      </t-dialog>
    </div>
    <div class="exit-confirm">
      <t-dialog
        v-model:visible="exitConfirmVisible"
        :close-btn="false"
        :close-on-esc-keydown="false"
        :header="false"
        :close-on-overlay-click="false"
        confirm-btn="取消"
        cancel-btn="退出"
        :on-confirm="cancelExitEvent"
        :on-close="exitEvent"
        attach=".exit-confirm"
        placement="center"
        width="200px"
      >
        <span>确认退出ZyPlayer</span>
      </t-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { setting } from '@/lib/dexie';

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const exitConfirmVisible = ref(false);
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
    console.log(val);
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
  exitConfirmVisible.value = true;
};

const cancelExitEvent = () => {
  formVisible.value = true;
  exitConfirmVisible.value = false;
};

const exitEvent = () => {
  win.destroy();
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';

.privacy-policy-container {
  .privacy-policy-confirm {
    :deep(.t-dialog) {
      background-image: url(../../../assets/bg-left-circle.svg), url(../../../assets/bg-right-circle.svg);
      background-position: 0 0, 100% 280px;
      background-repeat: no-repeat;
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
}
</style>
