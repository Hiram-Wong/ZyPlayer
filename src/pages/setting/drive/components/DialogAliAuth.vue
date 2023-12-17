<template>
  <t-dialog v-model:visible="formVisible" header="阿里云盘授权" :width="650" placement="center" :footer="false">
    <div class="">请使用<span class="quark-browser-logo"></span><span>阿里云盘APP</span>扫码登录</div>
    <div class="qr-code-sub-title">打开<span>阿里云盘APP</span>- 点击右上角的的扫码</div>
    <img :src="ali.qrCodeUrl" alt="" srcset="">
  </t-dialog>
</template>

<script setup>
import axios from 'axios';

import { MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive, watch } from 'vue';

import { drive } from '@/lib/dexie';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: Array,
});
const driveData = ref(props.data);
const formVisible = ref(false);
const formData = reactive({
  name: '',
  server: '',
  startPage: '',
  search: false,
  headers: null,
  params: null,
  isActive: true
});
const ali = reactive({
  qrCodeUrl: '',
  sid: '',
  status: '',
  authCode: ''
})
const onSubmit = () => {
  addEvent();
  formVisible.value = false;
};
const onClickCloseBtn = () => {
  formVisible.value = false;
};
const emit = defineEmits(['update:visible', 'refreshTableData']);
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
    getQrCode();
  },
);
watch(
  () => props.data,
  (val) => {
    driveData.value = val;
  },
);
const rulesSingle = {
  name: [{ required: true, message: '请输入内容', type: 'error' }],
  server: [{ required: true, message: '请输入内容', type: 'error' }],
};

const addEvent = () => {
  drive
    .add(JSON.parse(JSON.stringify({...formData})))
    .then((res) => {
      MessagePlugin.success('添加成功');
      if (res) emit('refreshTableData');
    })
    .catch((error) => {
      MessagePlugin.error(`添加失败: ${error}`);
    });
};

const getQrCode = async () => {
  const { data } = await axios.post('https://openapi.alipan.com/oauth/authorize/qrcode', {
    "client_id": "d1af8f792c15469b9c3b35cba10dad3b",
    "client_secret": "cfc7beea544c463997e169e80a74b837",
    "scopes": [
      "user:base",
      "file:all:read"
    ],
    "width": 430,
    "height": 430
  });

  console.log(data);
  ali.qrCodeUrl = data.qrCodeUrl;
  ali.sid = data.sid;

  const checkStatus = async () => {
    const { data } = await axios.get(`https://openapi.alipan.com/oauth/qrcode/${ali.sid}/status`);
    ali.status = data.status;
    console.log(data);
    
    if (data.status === 'QRCodeExpired') {
      // Call getQrCode again after a delay if QRCodeExpired
      setTimeout(getQrCode, 1000);
    } else if (data.status === 'LoginSuccess') {
      ali.authCode = data.authCode;
      const access_token = await axios.post('https://openapi.alipan.com/oauth/access_token', {
        "client_id": "d1af8f792c15469b9c3b35cba10dad3b",
        "client_secret": "cfc7beea544c463997e169e80a74b837",
        "grant_type": "authorization_code",   
        "code": ali.authCode
      });
      console.log(access_token.data);
      // Do whatever you need to do after successful login
    } else {
      // If status is neither QRCodeExpired nor LoginSuccess, check again after a delay
      setTimeout(checkStatus, 1000);
    }
  };

  // Initial check for status after getting QR code
  setTimeout(checkStatus, 1000);
};

</script>
<style lang="less" scoped>
.input-item,
:deep(.t-upload__dragger) {
  width: calc(518px - var(--td-size-1));
}

.upload-item {
  :deep(.t-button--variant-outline) {
    background-color: var(--td-bg-input) !important;
    border-color: transparent;
  }
}

.input-item-split {
  width: calc(518px - 130px);
}

.input-textarea {
  width: calc(518px - var(--td-size-2)) !important;
}
</style>
