<template>
  <div class="lab-player view-component-container">
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('common.input') }}</p>
        <t-form
          ref="formRef"
          :data="formData"
          :rules="RULES"
          :label-width="80"
          required-mark-position="right"
          label-align="left"
          reset-type="initial"
          @submit="onSubmit"
          @reset="onReset"
        >
          <t-form-item :label="$t('common.url')" name="url">
            <t-input v-model="formData.url" />
          </t-form-item>
          <t-space class="t-form__item">
            <t-form-item :label="$t('media.decoder')" name="decoder">
              <t-select v-model="formData.decoder" :options="DECODER_OPTIONS" />
            </t-form-item>
            <t-form-item :label="$t('media.player')" name="player">
              <t-select v-model="formData.player" :options="PLAYER_OPTIONS" />
            </t-form-item>
          </t-space>
          <t-collapse class="t-form__item">
            <t-collapse-panel value="complete-import" :header="$t('common.optionalParams')">
              <t-form-item :label="$t('common.request.headers')" name="headers">
                <t-textarea
                  v-model="formData.headers"
                  :autosize="{ minRows: 3, maxRows: 5 }"
                  :placeholder="$t('common.placeholder.request.headers')"
                />
              </t-form-item>
            </t-collapse-panel>
          </t-collapse>
        </t-form>
      </div>
      <div class="action">
        <p class="title-label">{{ $t('common.action') }}</p>
        <div class="content-action">
          <t-button theme="default" variant="base" block @click="handleReset">{{ $t('common.reset') }}</t-button>
          <t-button theme="primary" variant="base" block @click="handleSubmit">{{ $t('common.execute') }}</t-button>
        </div>
      </div>
      <div class="output">
        <p class="title-label">{{ $t('common.preview') }}</p>
        <div class="content-output">
          <multi-player ref="playerRef" class="mse" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PLAYER_TYPE } from '@shared/config/setting';
import { jsonStrToObj } from '@shared/modules/obj';
import { isJsonStr } from '@shared/modules/validate';
import type { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

import type { IDecoderWithAutoType, IMultiPlayerType } from '@/components/multi-player';
import { mediaUtils, MultiPlayer } from '@/components/multi-player';
import { t } from '@/locales';
import { usePlayerStore } from '@/store';

const RULES = {
  url: [{ required: true }, { validator: (val: string) => mediaUtils.isValidMediaUrl(val) }],
  decoder: [{ required: true }],
  player: [{ required: true }],
  headers: [{ validator: (val: string) => isJsonStr(val) || val === '' }],
};

const storePlayer = usePlayerStore();

const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
const playerRef = useTemplateRef('playerRef');

const formData = ref({
  url: '',
  headers: '',
  decoder: 'auto' as IDecoderWithAutoType,
  player: 'artplayer' as IMultiPlayerType,
});

const PLAYER_OPTIONS = computed(() => [
  { value: PLAYER_TYPE.XGPLAYER, label: t('media.playerMap.xgplayer') },
  // { value: PLAYER_TYPE.DPLAYER, label: t('media.playerMap.dplayer')  },
  { value: PLAYER_TYPE.ARTPLAYER, label: t('media.playerMap.artplayer') },
  // { value: PLAYER_TYPE.NPLAYER, label: t('media.playerMap.nplayer') },
  // { value: PLAYER_TYPE.OPLAYER, label: t('media.playerMap.oplayer') },
]);
const DECODER_OPTIONS = computed(() => [
  { value: 'auto', label: t('common.auto') },
  { value: 'audio', label: t('media.decoderMap.audio') },
  { value: 'hls', label: t('media.decoderMap.hls') },
  { value: 'flv', label: t('media.decoderMap.flv') },
  { value: 'mp4', label: t('media.decoderMap.mp4') },
  { value: 'dash', label: t('media.decoderMap.dash') },
  { value: 'torrent', label: t('media.decoderMap.torrent') },
]);

onMounted(() => setup());

const setup = () => {
  const player = storePlayer.player;
  const isVisable = PLAYER_OPTIONS.value.findIndex((item) => item.value === player.type) !== -1;
  formData.value.player = (isVisable ? player.type : PLAYER_OPTIONS.value[0].value) as IMultiPlayerType;
};

const handleExecute = () => {
  const { url, headers: headersRaw, decoder, player } = formData.value;
  const headers = jsonStrToObj(headersRaw);

  playerRef.value?.create(
    {
      url,
      isLive: false,
      headers,
      type: decoder,
      container: 'lab-mse',
    },
    player,
  );
};

const onSubmit = (context: SubmitContext<FormData>) => {
  const { validateResult, firstError } = context;
  if (validateResult && typeof validateResult === 'boolean') {
    handleExecute();
  } else {
    MessagePlugin.warning(firstError!);
  }
};

const onReset = async () => {
  if (!playerRef.value) return;

  await playerRef.value.destroy();
};

const handleSubmit = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  formRef.value?.reset();
};
</script>
<style lang="less" scoped>
.view-component-container {
  padding: 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingTB-s) 0;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);
  overflow-y: auto;

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);

    .input {
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);
    }

    .action {
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      .content-action {
        display: flex;
        gap: var(--td-size-4);
      }
    }

    .output {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);

      .content-output {
        flex: 1;

        .mse {
          height: 100%;
          min-height: 296px;
          width: 100%;
          border-radius: var(--td-radius-medium);
          overflow: hidden;
        }
      }
    }
  }
}
</style>
