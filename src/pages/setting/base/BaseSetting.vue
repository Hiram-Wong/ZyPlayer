<template>
  <div class="setting-base-container">
    <t-form ref="form" colon :data="formData">
      <t-form-item label="外观" name="theme">
        <t-radio-group v-model="formData.theme" variant="default-filled" style="width: auto">
          <template v-for="(item, index) in MODE_OPTIONS" :key="index">
            <t-radio-button :value="item.type">
              <component :is="getModeIcon(item.type)" />
              <p :style="{ textAlign: 'center', marginTop: '8px' }">{{ item.text }}</p>
            </t-radio-button>
          </template>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="软件" name="data">
        <t-space>
          <t-button theme="default" variant="base" @click="clearDBEvent">重置数据库</t-button>
          <t-button theme="default" variant="base" @click="clearCache">清理缓存</t-button>
        </t-space>
      </t-form-item>
      <t-form-item label="代理" name="proxy">
        <t-space direction="vertical">
          <div class="proxy-switch">
            <t-select v-if="formData.proxy?.type" v-model="formData.proxy.type" :style="{ width: '300px' }">
              <t-option value="disable" label="无代理" />
              <t-option value="system" label="使用系统代理" />
              <t-option value="manual" label="指定代理服务器" />
            </t-select>
          </div>

          <div v-if="formData.proxy?.type == 'manual'" class="proxy-item">
            <t-space direction="vertical">
              <t-select v-model="formData.proxy.scheme" :style="{ width: '300px' }" placeholder="请选择代理协议">
                <t-option value="http" label="http">http</t-option>
                <t-option value="socks5" label="socks5">socks5</t-option>
              </t-select>
              <t-input-group separate>
                <t-input v-model="formData.proxy.url" :style="{ width: '200px' }" placeholder="ip" />
                <span :style="{ lineHeight: '32px' }">&nbsp;:&nbsp;</span>
                <t-input v-model="formData.proxy.port" :style="{ width: '88px' }" placeholder="端口" />
              </t-input-group>
            </t-space>
          </div>
        </t-space>
      </t-form-item>
      <t-form-item label="站点" name="site">
        <div class="site">
          <t-space direction="vertical">
            <div class="hot-recommend site-item">
              <t-radio-group v-model="formData.defaultHot">
                <t-radio value="site">站内推荐</t-radio>
                <t-radio value="douban">豆瓣推荐</t-radio>
              </t-radio-group>
            </div>
            <div class="check-status site-item">
              <t-space>
                <t-switch v-model="formData.defaultCheckModel" size="large">
                  <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
                </t-switch>
                <span>站点源检查状态变更启用状态</span>
              </t-space>
            </div>
            <div class="filter site-item">
              <t-space direction="vertical">
                <div class="filter-item">
                  <t-space direction="vertical">
                    <t-space>
                      <t-switch v-model="formData.filterKeywordsDialogVisible" size="large">
                        <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
                      </t-switch>
                      <span>主要分类</span>
                    </t-space>
                    <t-textarea
                      v-if="formData.filterKeywordsDialogVisible"
                      v-model="rootClassFilter"
                      class="textarea"
                      placeholder="请输入过滤关键词,逗号分隔"
                      autofocus
                    />
                  </t-space>
                </div>
                <div class="filter-item">
                  <t-space direction="vertical">
                    <t-space>
                      <t-switch v-model="formData.excludeR18Films" size="large">
                        <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
                      </t-switch>
                      <span>青少年模式</span>
                    </t-space>
                    <t-textarea
                      v-if="formData.excludeR18Films"
                      v-model="r18ClassFilter"
                      class="textarea"
                      placeholder="请输入过滤关键词,逗号分隔"
                      autofocus
                    />
                  </t-space>
                </div>
              </t-space>
            </div>
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="直播" name="iptv">
        <div class="iptv">
          <t-space direction="vertical">
            <t-space>
              <t-switch v-model="formData.iptvSkipIpv6" size="large">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>跳过ipv6</span>
              <t-switch v-model="formData.iptvStatus" size="large">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>检测可用性</span>
              <!-- <t-switch v-model="formData.iptvThumbnail" size="large">
              <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
            </t-switch>
            <span>缩略图</span> -->
            </t-space>
            <t-input
              v-model="formData.defaultIptvEpg"
              label="默认EPG："
              placeholder="仅支持DIYP"
              :style="{ width: '300px' }"
            />
          </t-space>
        </div>
      </t-form-item>
      <t-form-item label="播放器" name="player">
        <div class="shortcut">
          <t-space direction="vertical">
            <t-space>
              <!-- <t-switch v-model="formData.shortcut" size="large">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>快捷键</span> -->
              <t-switch v-model="formData.pauseWhenMinimize" size="large">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>最小化暂停播放</span>
              <!-- <t-switch v-model="formData.skipStartEnd" size="large">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
              <span>跳过开始结尾</span> -->
            </t-space>
            <!-- <t-space>
              <t-input-number
                v-model="formData.forwardTimeInSec"
                theme="normal"
                align="center"
                :min="0"
                style="width: 150px"
              >
                <template #label><span>定位：</span></template>
                <template #suffix><span>秒</span></template>
              </t-input-number>
            </t-space> -->
            <!-- <div class="" v-if="formData.skipStartEnd">
              <div class="">
                <span>开始</span>
                <t-slider v-model="formData.skipTimeInStart" :show-tooltip="true" :marks="MASKS" :max="180"/>
              </div>
              <br>
              <div class="" >
                <span>结尾</span>
                <t-slider v-model="formData.skipTimeInEnd" :show-tooltip="true" :marks="MASKS" :max="180"/>
              </div>
            </div> -->
          </t-space>
        </div>
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { join, split } from 'lodash';
import db from '@/lib/dexie/dexie';
import { setting } from '@/lib/dexie';
import { useSettingStore } from '@/store';
// import _ from 'lodash';
import SettingDarkIcon from '@/assets/assets-setting-dark.svg';
import SettingLightIcon from '@/assets/assets-setting-light.svg';
import SettingAutoIcon from '@/assets/assets-setting-auto.svg';

const { ipcRenderer } = require('electron');

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const MODE_OPTIONS = [
  { type: 'light', text: '明亮' },
  { type: 'dark', text: '暗黑' },
  { type: 'auto', text: '跟随系统' },
];
const start = ref();
const end = ref();
const MASKS = {
  0: '0s',
  30: '30s',
  60: '60s',
  90: '90s',
  120: '120s',
  150: '150s',
  180: '180s',
};

const getModeIcon = (mode) => {
  if (mode === 'light') {
    return SettingLightIcon;
  }
  if (mode === 'dark') {
    return SettingDarkIcon;
  }
  return SettingAutoIcon;
};

const settingStore = useSettingStore();

const formData = ref({});

const rootClassFilter = computed({
  get() {
    // return _.join(formData.value.rootClassFilter, ',');
    return join(formData.value.rootClassFilter, ',');
  },
  set(val) {
    // formData.value.rootClassFilter = _.split(val, '-');
    formData.value.rootClassFilter = split(val, '-');
  },
});

const r18ClassFilter = computed({
  get() {
    // return _.join(formData.value.r18ClassFilter, ',');
    return join(formData.value.r18ClassFilter, ',');
  },
  set(val) {
    // formData.value.r18ClassFilter = _.split(val, '-');
    formData.value.r18ClassFilter = split(val, '-');
  },
});

watchEffect(() => {
  const res = JSON.parse(JSON.stringify(formData.value));
  setting.update(res);

  setting.find().then((res) => {
    console.log(res);
  });
  // setting.clear();
  // setting.bulkAdd(formData.value);
  settingStore.updateConfig({ mode: formData.value.theme });
});

onMounted(() => {
  getSetting();
});

const getSetting = async () => {
  await setting.find().then((res) => {
    formData.value = res;
  });
};

const clearDBEvent = () => {
  clearDB();
};

const clearDB = () => {
  db.delete().then(() => {
    MessagePlugin.success('重置成功,请手动重启软件！');
    win.relaunch();
    win.destroy();
  });
};

const clearCache = async () => {
  const ses = win.webContents.session;
  const size = (await ses.getCacheSize()) / 1024 / 1024;
  const mb = size.toFixed(2);
  await ses.clearCache();
  MessagePlugin.success(`清除缓存成功, 共清理 ${mb} MB`);
};
</script>

<style lang="less" scoped>
@import '@/style/variables';

:deep(.t-form__controls-content) {
  justify-content: start !important;
}
.textarea {
  width: 60vw;
}
</style>
