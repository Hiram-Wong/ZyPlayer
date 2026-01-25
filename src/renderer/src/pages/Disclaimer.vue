<template>
  <t-dialog
    v-model:visible="formVisible"
    placement="center"
    destroy-on-close
    lazy
    :close-btn="!active.init"
    :close-on-esc-keydown="!active.init"
    :close-on-overlay-click="!active.init"
    :footer="active.init"
    @confirm="handleAgree"
    @close="handleDisagree"
  >
    <template #header>
      {{ $t('pages.md.disclaimer.title') }}
    </template>
    <template #body>
      <div class="content-overflow">
        <div v-if="active.init" class="content-read-tips">
          <span v-if="active.scrollComplete">
            {{ $t('pages.md.disclaimer.readComplete') }}
          </span>
          <span v-else>
            {{ $t('pages.md.disclaimer.readProcess', [active.scrollProcess]) }}
          </span>
        </div>
        <div class="content-tips" @scroll="handleScroll">
          <render-md :text="$t('pages.md.disclaimer.content')" />
        </div>
      </div>
    </template>
    <template #footer>
      <t-button theme="default" variant="base" @click="handleDisagree">
        {{ $t('common.disagree') }}
      </t-button>
      <t-button theme="primary" variant="base" :disabled="active.init && !active.scrollComplete" @click="handleAgree">
        {{ $t('common.agree') }}
      </t-button>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch } from 'vue';

import { getSettingDetail, putSetting } from '@/api/setting';
import RenderMd from '@/components/render-markdown/index.vue';
import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: undefined,
  },
  type: {
    type: String,
    default: 'info',
  },
});

const emits = defineEmits(['update:visible']);

const KEY = 'disclaimer';

const formVisible = ref(false);
const parentTakesControl = computed(() => props.visible !== undefined);
const active = ref({
  scrollProcess: 0,
  scrollComplete: false,
  init: props.type === 'init',
});

watch(
  () => props.visible,
  (newVal) => {
    formVisible.value = !!newVal;
    if (newVal) {
      active.value.scrollProcess = 0;
      active.value.scrollComplete = false;
    }
  },
);
watch(
  () => formVisible.value,
  (val) => {
    emits('update:visible', val);
  },
);

onMounted(() => {
  if (!parentTakesControl.value) {
    getDisclaimer();
  }
});

const getDisclaimer = async () => {
  try {
    const resp = await getSettingDetail(KEY);
    formVisible.value = !resp;
  } catch (error) {
    console.error(`Fail to get disclaimer status`, error);
  }
};

const putDisclaimer = async (status: boolean) => {
  try {
    await putSetting({ key: KEY, value: status });
  } catch (error) {
    console.error(`Fail to put disclaimer status`, error);
  }
};

const handleAgree = async () => {
  await putDisclaimer(true);
  formVisible.value = false;
  MessagePlugin.success(t('pages.md.disclaimer.message.agree'));
};

const handleDisagree = async () => {
  if (!active.value.init) return;

  await putDisclaimer(false);
  MessagePlugin.warning(t('pages.md.disclaimer.message.disagree'));
  setTimeout(() => window.electron.ipcRenderer.invoke(IPC_CHANNEL.APP_QUIT), 3000);
};

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const scrollHeight = target.scrollHeight - target.clientHeight - 10;

  if (target.scrollTop > scrollHeight) {
    active.value.scrollComplete = true;
  }

  if (!active.value.scrollComplete) {
    active.value.scrollProcess = Math.round((target.scrollTop / scrollHeight) * 100);
  } else {
    active.value.scrollProcess = 100;
  }
};
</script>
<style lang="less" scoped>
.content-overflow {
  position: relative;

  .content-tips {
    max-height: 340px;
    overflow: hidden auto;
  }

  .content-read-tips {
    position: absolute;
    right: var(--td-size-4);
    top: 0;
    z-index: 9;
    font-size: 12px;
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
    background-color: var(--td-bg-color-container);
    border: 1px solid var(--td-border-level-2-color);
  }
}
</style>
