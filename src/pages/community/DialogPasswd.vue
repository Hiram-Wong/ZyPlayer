<template>
  <t-dialog
    v-model:visible="formVisible"
    placement="center"
    header="请输入密码箱专属密码"
    :close-btn="false"
    width="340px"
    @confirm="verifyPasswd"
  >
    <template #body>
      <div class="content-wrapper">
        <t-input v-model="inputPasswd" type="password" class="input-item">
          <template #prefix-icon>
            <lock-on-icon />
          </template>
        </t-input>
        <!-- <div class="options" @click="forgotPasswordEvent">
          <div class="option">忘记密码</div>
        </div> -->
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { LockOnIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: String,
    default: '',
  },
});

const formVisible = ref(false); // 控制dialog
const vaultPasswd = ref(props.data);
const inputPasswd = ref('');

const emit = defineEmits(['update:visible', 'verify-passwd']);

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
    console.log(val);
    vaultPasswd.value = val;
  },
);

// const forgotPasswordEvent = {};
const verifyPasswd = () => {
  if (vaultPasswd.value === inputPasswd.value) {
    emit('verify-passwd');
  } else {
    MessagePlugin.error('密码错误');
  }
};
</script>

<style lang="less" scoped>
.content-wrapper {
  .options {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 12px;
    .option {
      cursor: pointer;
      font-size: 12px;
      line-height: 1.6;
    }
  }
}

:deep(.t-input) {
  border: var(--td-size-1) solid transparent;
  background-color: var(--td-bg-input);
  border-radius: var(--td-radius-medium);
}
</style>
