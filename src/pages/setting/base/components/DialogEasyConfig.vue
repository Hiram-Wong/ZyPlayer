<template>
  <t-dialog v-model:visible="formVisible" header="一键配置" placement="center" :footer="false">
    <template #body>
      <div class="easy-config-dialog-container dialog-container-padding">
        <!-- 表单内容 -->
        <t-form ref="form" :data="formData" @submit="onSubmit">
          <t-radio-group v-model="formData.type">
            <t-radio :value="0">软件接口</t-radio>
            <t-radio :value="1">drpy接口</t-radio>
            <t-radio :value="2">tvbox接口</t-radio>
          </t-radio-group>
          <p v-show="formData.type === 0" class="tip">请严格遵守本软件接口格式</p>
          <p v-show="formData.type === 1" class="tip">目前仅支持sites中type:1的数据,请将js模式设置为0</p>
          <p v-show="formData.type === 2" class="tip">目前仅支持sites中type:0或1且的cms类型的数据</p>
          <t-textarea
            v-model="formData.url"
            class="dns-input"
            placeholder="请输入一键配置链接"
            autofocus
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
          <p class="tip bottom-tip">一键配置会清除已有数据源呦～</p>
          <div class="optios">
            <t-form-item style="float: right">
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

import { analyze, channelList, iptv, setting, sites } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const formVisible = ref(false);
const formData = ref({
  url: '',
  type: 0,
});

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

const filmEmitReload = useEventBus<string>('film-reload');
const iptvEmitReload = useEventBus<string>('iptv-reload');
const analyzeEmitReload = useEventBus<string>('analyze-reload');

const onSubmit = async () => {
  const { url, type } = formData.value;
  if (!url) return;
  const config = await zy.getConfig(url).catch((error) => {
    MessagePlugin.error(`请求一键配置地址失败：${error}`);
  });
  console.log(typeof config);
  if (typeof config !== 'object') return;

  console.log(config);
  try {
    // 清空数据
    sites.clear();
    iptv.clear();
    analyze.clear();
    channelList.clear();

    // 添加数据
    const defaultObject = {
      defaultSite: '',
      defaultIptv: '',
      defaultAnalyze: '',
    };

    if (type === 0) {
      if (config.sites) {
        if (config.sites.data) sites.bulkAdd(config.sites.data);
        if (config.sites.default) defaultObject.defaultSite = config.sites.default;
      }
      if (config.iptv) {
        if (config.iptv.data) iptv.bulkAdd(config.iptv.data);
        if (config.iptv.default) {
          defaultObject.defaultIptv = config.iptv.default;
          const iptvItem = _.find(config.iptv.data, { id: config.iptv.default });
          if (iptvItem) setChannelList(iptvItem.url);
        }
      }
      if (config.analyzes) {
        if (config.analyzes.data) analyze.bulkAdd(config.analyzes.data);
        if (config.analyzes.default) defaultObject.defaultAnalyze = config.analyzes.default;
      }
    } else {
      const drpyResFilter = config.sites
        .filter((item) => item.type === 0 || item.type === 1) // 先过滤掉不需要的数据
        .map((item) => ({
          key: item.key,
          name: item.name,
          type: formData.value.type === 1 ? 2 : 1,
          api: item.api,
          group: formData.value.type === 1 ? 'drpy' : 'tvbox',
          search: item.searchable,
          isActive: true,
          status: true,
        }));
      console.log(drpyResFilter);
      sites.bulkAdd(drpyResFilter);
    }
    setting.update(defaultObject);

    filmEmitReload.emit('film-reload');
    iptvEmitReload.emit('iptv-reload');
    analyzeEmitReload.emit('analyze-reload');
    MessagePlugin.success('一键配置成功,畅享点点滴滴吧！');
  } catch (error) {
    MessagePlugin.error(`一键配置失败：${error}`);
    console.log(error);
  }

  formVisible.value = false;
};
const onClickCloseBtn = () => {
  formVisible.value = false;
};

const setChannelList = async (url) => {
  await zy
    .getConfig(url)
    .then((res) => {
      console.log(res);
      if (res) {
        if (res.trim().startsWith('#EXTM3U')) m3u(res);
        else txt(res);
      }
    })
    .catch((error) => {
      MessagePlugin.error(`请求直播默认源失败：${error}`);
    });
};

const m3u = (text) => {
  const GROUP = /.*group-title="(.?|.+?)".*/i;
  const LOGO = /.*tvg-logo="(.?|.+?)".*/i;
  const NAME = /.*,(.+?)(?:$|\n|\s)/i;

  const docs = [];
  let doc;
  const splitList = text.split('\n');
  splitList.forEach((line) => {
    if (line.startsWith('#EXTINF:')) {
      doc = {}; // 切断指针的联系
      doc.name = line.match(NAME) ? line.match(NAME)[1] : '';
      doc.logo = line.match(LOGO) ? line.match(LOGO)[1] : '';
      doc.group = line.match(GROUP) ? line.match(GROUP)[1] : '';
    } else if (line.indexOf('://') > -1) {
      if (line.startsWith('#EXT-X-SUB-URL')) return; // #EXT-X-SUB-URL https://ghproxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u
      if (line.startsWith('#EXTM3U')) return; // #EXTM3U url-tvg="http://epg.51zmt.top:8000/e.xml,https://epg.112114.xyz/pp.xml
      doc.url = line;
      docs.push(doc);
    }
  });

  channelList.bulkAdd(docs).then(() => {
    iptvEmitReload.emit('iptv-reload');
  });
};

const txt = (text) => {
  const docs = [];
  let group;
  const splitList = text.split('\n');
  splitList.forEach((line) => {
    const split = line.split(',');
    if (split.length < 2) return;
    if (line.indexOf('#genre#') > -1) [group] = split;
    if (split[1].indexOf('://') > -1) {
      const doc = {
        name: split[0],
        url: split[1],
        group,
      };
      docs.push(doc);
    }
  });

  channelList.bulkAdd(docs).then(() => {
    iptvEmitReload.emit('iptv-reload');
  });
};
</script>
<style lang="less" scoped>
@import '@/style/variables.less';
</style>
