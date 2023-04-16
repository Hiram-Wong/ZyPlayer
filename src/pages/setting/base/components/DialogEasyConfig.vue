<template>
  <t-dialog v-model:visible="formVisible" header="一键配置" placement="center" :footer="false">
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" :data="formData" @submit="onSubmit">
        <t-input v-model="formData.url" autofocus clearable placeholder="请输入一键配置链接!" class="input" />
        <p class="tip">请保障网络连通性</p>
        <div class="optios">
          <t-form-item style="float: right; margin: ">
            <t-space>
              <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
              <t-button theme="primary" type="submit">确定</t-button>
            </t-space>
          </t-form-item>
        </div>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEventBus } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';
import _ from 'lodash';
import zy from '@/lib/utils/tools';
import { setting, sites, iptv, channelList, analyze } from '@/lib/dexie';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const formVisible = ref(false);
const formData = ref({
  url: '',
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
  const { url } = formData.value;
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

.tip {
  color: var(--td-gray-color-6);
  font-size: var(--td-font-size-link-small);
}
.input {
  padding: var(--td-size-1);
}
</style>
