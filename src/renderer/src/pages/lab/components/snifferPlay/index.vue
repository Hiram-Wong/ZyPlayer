<template>
  <div class="sniffrt-play view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.snifferPlay') }}</h3>
      </div>
      <div class="right-operation-container"></div>
    </div>
    <div class="content">
      <div class="left sniffer">
        <t-badge :count="$t('pages.lab.snifferPlay.sniffer')" color="var(--td-success-color)" shape="round">
          <div class="op card">
            <t-form :data="formData.sniffer">
              <t-form-item :label="$t('pages.lab.snifferPlay.snifferUrl')" name="url">
                <t-input v-model="formData.sniffer.url" :placeholder="$t('pages.setting.placeholder.general')"></t-input>
              </t-form-item>
              <t-form-item :label="$t('pages.lab.snifferPlay.initScript')">
                <t-textarea v-model="formData.sniffer.initScript" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')"/>
              </t-form-item>
              <t-form-item :label="$t('pages.lab.snifferPlay.runScript')">
                <t-textarea v-model="formData.sniffer.runScript" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')"/>
              </t-form-item>
              <t-form-item :label="$t('pages.lab.snifferPlay.customRegex')">
                <t-textarea v-model="formData.sniffer.customRegex" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')"/>
              </t-form-item>
              <t-form-item :label="$t('pages.lab.snifferPlay.snifferExclude')">
                <t-textarea v-model="formData.sniffer.snifferExclude" :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="$t('pages.setting.placeholder.general')"/>
              </t-form-item>
            </t-form>
            <t-button theme="primary" block @click="sniiferEvent">{{ $t('pages.lab.snifferPlay.sniffer') }}</t-button>
          </div>
        </t-badge>
        <t-badge :count="$t('pages.lab.snifferPlay.result')" color="var(--td-success-color)" shape="round">
          <div class="result card">
            <t-textarea v-model="formData.sniffer.result" :autosize="{ minRows: 3, maxRows: 5 }" readonly />
          </div>
        </t-badge>
      </div>

      <div class="right player">
        <t-badge :count="$t('pages.lab.snifferPlay.player')" color="var(--td-success-color)" shape="round">
          <div class="player card">
            <t-form :data="formData.sniffer">
              <t-form-item :label="$t('pages.lab.snifferPlay.playUrl')" name="url">
                <t-input v-model="formData.player.url" :placeholder="$t('pages.setting.placeholder.general')"></t-input>
              </t-form-item>
              <t-form-item :label="$t('pages.lab.snifferPlay.headers')" name="headers">
                <t-textarea v-model="formData.player.headers" :autosize="{ minRows: 3, maxRows: 5 }" placeholder='{ "User-Agent": "Mozilla/5.0" }' />
              </t-form-item>
              <t-form-item :label="$t('pages.lab.snifferPlay.mediaType')" name="url">
                <t-select v-model="formData.player.type">
                  <t-option label="Auto" value="auto" />
                  <t-option label="Hls" value="m3u8" />
                  <t-option label="Flv" value="flv" />
                  <t-option label="Mp4" value="mp4" />
                  <t-option label="Dash" value="mpd" />
                  <t-option label="Torrent" value="magnet" />
                </t-select>
              </t-form-item>
            </t-form>
            <div style="display: flex; justify-content: space-around;">
              <t-button theme="primary" block @click="playerPlayEvent">{{ $t('pages.lab.snifferPlay.play') }}</t-button>
              <t-button variant="outline" block @click="playerClearEvent">{{ $t('pages.lab.snifferPlay.clear') }}</t-button>
            </div>
          </div>
        </t-badge>
        <t-badge :count="$t('pages.lab.snifferPlay.preview')" style="flex: 1;" color="var(--td-success-color)" shape="round">
          <div class="result card" style="height: 100%; width: 100%;">
            <multi-player ref="playerRef" style="border-radius: var(--td-radius-default); overflow: hidden;" />
          </div>
        </t-badge>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import JSON5 from 'json5';
import sniffer from '@/utils/sniffer';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { MultiPlayer, mediaUtils } from '@/components/player';

const storePlayer = usePlayStore();

const formData = ref({
  sniffer: {
    url: '',
    ua: '',
    snifferExclude: '',
    customRegex: '',
    initScript: '',
    runScript: '',
    result: '',
  },
  player: {
    url: '',
    headers: '',
    type: 'auto',
  }
});
const playerRef = useTemplateRef('playerRef');

const sniiferEvent = async () => {
  const { url, runScript, initScript, customRegex, snifferExclude } = formData.value.sniffer;
  if (!url) {
    MessagePlugin.warning(t('pages.lab.snifferPlay.message.snifferNoUrl'))
    return;
  };
  const res = await sniffer(url, runScript, initScript, customRegex, snifferExclude);
  if (res?.url) {
    formData.value.sniffer.result = JSON5.stringify(res);
    MessagePlugin.success(t('pages.setting.form.success'));
  } else {
    MessagePlugin.success(t('pages.setting.form.fail'));
  };
};

const playerPlayEvent = async () => {
  let { url, headers = '{}', type } = formData.value.player;
  if (!headers) headers = '{}';
  headers = Function('return (' + headers + ')')();

  if (!url || !(/^(http:\/\/|https:\/\/)/.test(url) || url.includes('magnet:'))) {
    MessagePlugin.warning(t('pages.lab.snifferPlay.message.playerNoUrl'));
    return;
  };

  const playerMode = storePlayer.setting.playerMode;

  if (playerMode.type === 'custom') {
    window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url });
  } else {
    let mediaType = type;
    if (mediaType === 'auto') {
      const checkType = await mediaUtils.checkMediaType(url, headers as Object);
      if (checkType === 'unknown' && !checkType) {
        MessagePlugin.warning(t('pages.lab.snifferPlay.message.mediaNoType'));
        return;
      }
      mediaType = checkType as string;
    };
    if (playerRef.value) {
      await playerRef.value.create({
        url: url,
        isLive: false,
        headers: headers,
        type: mediaType,
        container: 'lab-mse'
      }, playerMode.type);
    }
  }

  MessagePlugin.success(t('pages.setting.form.success'));
};

const playerClearEvent = async () => {
  if (!playerRef.value) return;
  await playerRef.value.destroy();
};
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 36px;

    .left-operation-container {
      display: flex;
      flex-direction: row;
      align-items: center;

      .title {
        margin-right: 5px
      }
    }

    .right-operation-container { }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    grid-gap: var(--td-comp-margin-s);
    width: 100%;
    height: 100%;
    overflow: hidden;

    .left, .right {
      width: 50%;
      overflow-y: auto;
      padding-top: var(--td-comp-paddingTB-m);
      display: flex;
      flex-direction: column;
      gap: 16px;

      :deep(.t-badge) {
        width: 100%;

        .t-badge--round {
          right: auto;
          left: 10px !important;
          top: -10px !important;
          transform: none !important;
        }
      }
    }


    p.title {
      font-weight: 500;
      color: var(--td-text-color-primary);
      font-size: 16px;

      &::before {
        content: "";
        border: 1px solid var(--td-brand-color);
        height: 0.6rem;
        border-radius: var(--td-radius-default);
        display: inline-block;
        opacity: 1;
        transition: all 0.4s ease-in-out;
        margin-right: var(--td-comp-paddingLR-xs);
      }
    }

    .card {
      padding: 6px 4px;
      border-radius: var(--td-radius-medium);
      border: 1px solid rgba(132, 133, 141, 0.2);
      display: flex;
      flex-direction: column;
    }

    .result {
      // margin-top: var(--td-comp-margin-s);
    }

    :deep(textarea) {
      border-color: transparent;
      background-color: var(--td-bg-content-input-2);
      border-radius: var(--td-radius-medium);
    }

    :deep(.t-form__item) {
      margin-bottom: var(--td-comp-margin-xxs);
    }
  }
}
</style>
