<template>
  <div class="vault-container">
    <div v-if="isVerifySecret" class="empty-placeholder">
      <div class="wrapper">
        <img
          class="icon"
          src="https://img.alicdn.com/imgextra/i2/O1CN018yXBXY1caApf7qUew_!!6000000003616-2-tps-224-224.png"
        />
        <p class="text-primary">欢迎使用密码箱</p>
        <p class="text-secondary">为了确保你的安全，验证身份后即可进入"密码基地"</p>
        <div class="actions">
          <t-button theme="default" shape="round" @click="isPasswdDialog = true">验证身份</t-button>
        </div>
      </div>
      <dialog-passwd-view v-model:visible="isPasswdDialog" :data="vaultPasswd" @verify-passwd="verifyPasswd" />
    </div>
    <div v-else>
      <content-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { setting } from '@/lib/dexie';

import ContentView from './vault/Content.vue';
import DialogPasswdView from './vault/DialogPasswd.vue';

const isPasswdDialog = ref(false);

const isVerifySecret = ref(false);
const vaultPasswd = ref('');

onMounted(async () => {
  vaultPasswd.value = await setting.get('vaultPasswd');
  console.log(`密码：${vaultPasswd.value}`);
  if (vaultPasswd.value) isVerifySecret.value = true;
});

const verifyPasswd = () => {
  isPasswdDialog.value = false;
  isVerifySecret.value = false;
};
</script>

<style lang="less" scoped>
.vault-container {
  .empty-placeholder {
    .wrapper {
      width: 245px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -61.8%);
      .icon {
        width: 112px;
        height: 112px;
      }
      .text-primary {
        font-size: 16px;
        line-height: 1.5;
        font-weight: 500;
        text-align: center;
        width: 100%;
      }
      .text-secondary {
        font-size: 14px;
        line-height: 1.5;
        text-align: center;
        width: 100%;
        margin-top: 8px;
      }
      .actions {
        margin-top: 24px;
      }
    }
  }
}
</style>
