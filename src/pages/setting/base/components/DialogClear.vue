<template>
  <t-dialog v-model:visible="formVisible" header="清理数据" placement="center" :footer="false">
    <template #body>
      <div class="class-dialog-container dialog-container-padding">
        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-space direction="vertical">
            <t-radio v-model="formData.sites" allow-uncheck>清除站点源配置</t-radio>
            <t-radio v-model="formData.iptv" allow-uncheck>清除直播源配置</t-radio>
            <t-radio v-model="formData.analyze" allow-uncheck>清除解析源配置</t-radio>
            <t-radio v-model="formData.history" allow-uncheck>清除历史数据(含解析历史)</t-radio>
            <t-radio v-model="formData.binge" allow-uncheck>清除收藏数据</t-radio>
            <t-radio v-model="formData.cache" allow-uncheck>清除缓存</t-radio>
          </t-space>
          <div class="optios">
            <t-form-item style="float: right; margin: ">
              <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
              <t-button theme="primary" type="submit">确定</t-button>
            </t-form-item>
          </div>
        </t-form>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';

import { analyze, analyzeHistory, channelList, history, iptv, setting, sites, star } from '@/lib/dexie';

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const formVisible = ref(false);
const formData = ref({
  sites: false,
  iptv: false,
  analyze: false,
  history: false,
  binge: false,
  cache: false,
});

const filmEmitReload = useEventBus('film-reload');
const iptvEmitReload = useEventBus('iptv-reload');
const analyzeEmitReload = useEventBus('analyze-reload');
const historyEmitReload = useEventBus('history-reload');
const bingeEmitReload = useEventBus('binge-reload');

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

// 清空sites数据的函数
const clearSitesData = async () => {
  await sites.clear();
  await setting.update({
    defaultSite: null,
  });
  filmEmitReload.emit('film-reload');
};

// 清空iptv数据的函数
const clearIptvData = async () => {
  await iptv.clear();
  await channelList.clear();
  await setting.update({
    defaultIptv: null,
  });
  iptvEmitReload.emit('iptv-reload');
};

// 清空analyze数据的函数
const clearAnalyzeData = async () => {
  await analyze.clear();
  await setting.update({
    defaultAnalyze: null,
  });
  analyzeEmitReload.emit('analyze-reload');
};

// 清空history数据的函数
const clearHistoryData = async () => {
  await history.clear();
  await analyzeHistory.clear();
  historyEmitReload.emit('history-reload');
};

// 清空binge数据的函数
const clearBingeData = async () => {
  await star.clear();
  bingeEmitReload.emit('binge-reload');
};

// 清空cache数据的函数
const clearCacheData = async () => {
  const { session } = win.webContents;
  await session.clearCache();
};

// 清空数据的映射对象
const clearDataFunctions = {
  sites: clearSitesData,
  iptv: clearIptvData,
  analyze: clearAnalyzeData,
  history: clearHistoryData,
  binge: clearBingeData,
  cache: clearCacheData,
};

const onSubmit = () => {
  try {
    for (const key in formData.value) {
      if (formData.value[key]) {
        // 根据formData值执行对应的清空数据函数
        const clearDataFunction = clearDataFunctions[key];
        if (clearDataFunction) {
          clearDataFunction();
        }
      }
    }
    MessagePlugin.success('清理成功');
  } catch (err) {
    MessagePlugin.error(`清理失败:${err}`);
  }

  formVisible.value = false;
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};
</script>
