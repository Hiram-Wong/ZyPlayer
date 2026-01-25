<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    :attach="`.${attachMainContent}`"
    :width="508"
    placement="center"
    destroy-on-close
    lazy
  >
    <template #header>
      {{ $t('pages.player.download.title') }}
    </template>
    <template #body>
      <t-form
        ref="formRef"
        :data="formData"
        :rules="RULES"
        :label-width="120"
        required-mark-position="right"
        label-align="left"
        reset-type="initial"
        @submit="onSubmit"
      >
        <t-form-item :label-width="0" :style="{ marginBottom: 'var(--td-comp-margin-s)' }">
          <div class="input-horizontal-item">
            <t-select
              v-model="active.line"
              :placeholder="$t('pages.player.download.soureceSelect')"
              :style="{ maxWidth: '200px' }"
            >
              <t-option v-for="item in lineKeys" :key="item" :value="item">{{ item }}</t-option>
            </t-select>
            <t-button theme="default" @click="handleCopyCurrentURL">
              {{ $t('pages.player.download.copyCurrentUrl') }}
            </t-button>
          </div>
        </t-form-item>
        <t-form-item :label-width="0" name="episode">
          <t-transfer v-model="formData.episode" :data="currentEpisode" search>
            <template #title="transferProps">
              {{
                transferProps.type === 'target'
                  ? $t('pages.player.download.statusAwaitDownload')
                  : $t('pages.player.download.statusRequireDownload')
              }}
            </template>
          </t-transfer>
        </t-form-item>
      </t-form>
    </template>
    <template #footer>
      <t-button theme="default" variant="base" @click="handleReset">{{ $t('common.reset') }}</t-button>
      <t-button theme="primary" variant="base" @click="handleSubmit">{{ $t('common.confirm') }}</t-button>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import { isArray, isArrayEmpty, isHttp, isNil, isObject, isObjectEmpty } from '@shared/modules/validate';
import type { ICmsInfo } from '@shared/types/cms';
import { useClipboard } from '@vueuse/core';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { TransferValue } from 'tdesign-vue-next/es/transfer/type.d';
import type { PropType } from 'vue';
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';

import { mediaUtils } from '@/components/multi-player';
import { attachMainContent } from '@/config/global';
import { t } from '@/locales';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  episode: {
    type: Object as PropType<ICmsInfo['vod_episode']>,
    default: () => ({}),
  },
  current: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['update:visible']);

const RULES = {};

const { isSupported, copy } = useClipboard();

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const formVisible = ref(false);
const formData = ref<{ episode: TransferValue[] }>({ episode: [] });
const formEpisode = ref(props.episode);
const formCurrent = ref(props.current);

const lineKeys = computed(() =>
  isObject(props.episode) && !isObjectEmpty(props.episode) ? Object.keys(props.episode) : [],
);
const currentEpisode = computed(() => {
  if (!isObject(formEpisode.value) || isObjectEmpty(formEpisode.value)) return [];
  const episode = formEpisode.value[active.value.line];
  if (!isArray(episode) || isArrayEmpty(episode)) return [];
  return episode.map((item) => ({ value: item.link, label: item.text, disabled: false }));
});

const active = ref({
  line: '',
});

watch(
  () => formVisible.value,
  (val) => emits('update:visible', val),
);
watch(
  () => props.visible,
  (val) => (formVisible.value = val),
);
watch(
  () => props.episode,
  (val) => {
    formEpisode.value = val;
    setup();
  },
);
watch(
  () => props.current,
  (val) => (formCurrent.value = val),
);

onMounted(() => setup());

const setup = () => {
  if (!isObject(formEpisode.value) || isObjectEmpty(formEpisode.value)) return;
  const firstKey = Object.keys(formEpisode.value)[0];
  active.value.line = firstKey;
};

const handleCopyCurrentURL = async () => {
  try {
    if (!isHttp(formCurrent.value)) return;

    isSupported && copy(formCurrent.value);

    const mediaType = await mediaUtils.checkMediaType(formCurrent.value as string);
    if (isNil(mediaType)) {
      MessagePlugin.warning(t('pages.player.download.copyCheck'));
    } else {
      MessagePlugin.success(t('common.copySuccess'));
    }
  } catch {
    MessagePlugin.error(t('common.copyFail'));
  }
};

const copyEpisode = async () => {
  try {
    const { episode } = formData.value;
    if (isArrayEmpty(episode) || !isHttp(episode?.[0])) return;

    isSupported && copy(episode.join('\n'));

    const mediaType = await mediaUtils.checkMediaType(episode[0] as string);
    if (isNil(mediaType)) {
      MessagePlugin.warning(t('pages.player.download.copyCheck'));
    } else {
      MessagePlugin.success(t('common.copySuccess'));
    }
  } catch {
    MessagePlugin.error(t('common.copyFail'));
  }
};

const handleExecute = async () => {
  await copyEpisode();
  formVisible.value = false;
};

const onSubmit = (context: SubmitContext<FormData>) => {
  const { validateResult, firstError } = context;
  if (validateResult && typeof validateResult === 'boolean') {
    handleExecute();
  } else {
    MessagePlugin.warning(firstError!);
  }
};

const handleSubmit = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  formRef.value?.reset();
};
</script>
<style lang="less" scoped>
.input-horizontal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--td-size-4);
  width: 100%;
}
</style>
