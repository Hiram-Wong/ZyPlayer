<template>
  <div class="container-aside-analyze">
    <div class="tvg-block">
      <div class="title-album">
        <p class="title-text txthide">{{ formData.title }}</p>
      </div>
      <div class="function">
        <div class="func-item like" @click="putBinge">
          <span>
            <heart-filled-icon class="icon" v-if="active.binge" />
            <heart-icon class="icon" v-else />
          </span>
          <span class="tip">{{ $t('pages.player.function.like') }}</span>
        </div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="func-item share" @click="shareEvent">
          <share-popup v-model:visible="active.share" :data="shareFormData">
            <template #customize>
              <div style="display: flex; flex-direction: row; align-items: center">
                <share1-icon class="icon" />
                <span class="tip">{{ $t('pages.player.function.share') }}</span>
              </div>
            </template>
          </share-popup>
        </div>
      </div>
    </div>
    <div class="anthology-contents">
      <div class="box-anthology-header">
        <div class="left">
          <h4 class="box-anthology-title">{{ $t('pages.player.film.analyze') }}</h4>
        </div>
        <div class="right"></div>
      </div>
      <div class="listbox drive-listbox">
        <t-list class="contents-wrap" split :scroll="{ type: 'virtual' }">
          <t-list-item v-for="item in seasonList" :key="item.id" class="content" @click="changeAnalyzeEvent(item)">
            <div class="title-wrap txthide">{{ item['name'] }}</div>
            <div class="status-wrap">
              <span :class="extConf['site']['id'] === item['id'] ? 'useing' : 'unuse'">
                {{
                  extConf['site']['id'] === item['id']
                    ? $t('pages.player.status.useing')
                    : $t('pages.player.status.unuse')
                }}
              </span>
            </div>
          </t-list-item>
        </t-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, watch, onMounted } from 'vue';
import { throttle } from 'lodash-es';
import moment from 'moment';
import { HeartIcon, HeartFilledIcon, Share1Icon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { fetchBingeData, putBingeData, fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { fetchAnalyzeActive } from '@/api/analyze';
import { fetchAnalyzeHelper } from '@/utils/common/film';

const props = defineProps({
  info: {
    type: Object,
    default: {}
  },
  ext: {
    type: Object,
    default: {}
  },
  process: {
    type: Object,
    default: {
      currentTime: 0,
      duration: 0
    }
  }
});

const emits = defineEmits(['update', 'play']);
const infoConf = ref(props.info);
const extConf = ref(props.ext);
const processConf = ref(props.process);
const formData = ref({
  title: props.info.name
});
const seasonList = ref<any[]>([]);
const active = ref({
  nav: 'season',
  share: false,
  binge: false,
});
const shareFormData = ref({
  name: '',
  url: '',
  provider: 'zyfun',
});
const bingeData = ref<{ [key: string]: any }>({});
const historyData = ref<{ [key: string]: any }>({});
const videoData = ref<{ [key: string]: any }>({
  url: '',
  playEnd: false,
  watchTime: 0,
  duration: 0,
  skipTimeInStart: 0,
  skipTimeInEnd: 0,
});

watch(
  () => props.info,
  (val) => {
    infoConf.value = val;
    formData.value.title = val.name;
  },
  { deep: true }
);
watch(
  () => props.ext,
  (val) => {
    extConf.value = val;
  },
  { deep: true }
);
watch(
  () => props.process,
  (val) => {
    processConf.value = val;
  },
  { deep: true }
);
watch(
  () => processConf.value,
  (val) => {
    timerUpdatePlayProcess(val.currentTime, val.duration);
  },
  { deep: true }
);

onMounted(() => {
  setup();
});

const fetchAnalyze = async () => {
  try {
    const data = await fetchAnalyzeActive();
    if (data.hasOwnProperty('default')) {
      extConf.value.site = data["default"];
    }
    if (data.hasOwnProperty('data')) {
      seasonList.value = data["data"];
    }
  } catch (err) {
    console.log(err)
  }
};

// 获取收藏
const fetchBinge = async () => {
  const { key } = extConf.value.site;
  const { url: vod_id } = infoConf.value;

  const response = await fetchBingeData(key, vod_id, ['analyze']);
  const { code } = response;

  if (code === 0) {
    bingeData.value = response.data;
    active.value.binge = response.status;
  }
};

// 更新收藏
const putBinge = async () => {
  const { id = null } = bingeData.value;
  const { key } = extConf.value.site;
  const { url: vod_id, name: vod_name,  } = infoConf.value;
  const doc = {
    date: moment().unix(),
    type: 'analyze',
    relateId: key,
    videoId: vod_id,
    videoImage: '',
    videoName: vod_name,
    videoType: '',
    videoRemarks: '',
  };

  let response: any;
  if (id) response = await putBingeData('del', {}, id);
  else response = await putBingeData('add', doc, null);
  const { code, data, status } = response;

  if (code === 0) {
    bingeData.value = data;
    active.value.binge = status;
  }
};

// 获取历史
const fetchHistory = async () => {
  const { key } = extConf.value.site;
  const { url: vod_id } = infoConf.value;

  const response = await fetchHistoryData(key, vod_id, ['analyze']);
  const { code, data, status } = response;

  if (code === 0 && status) {
    historyData.value = data;
  }
};

// 更新历史
const putHistory = async () => {
  const { id = null } = historyData.value;
  const { key } = extConf.value.site;
  const { url: vod_id, name: vod_name, } = infoConf.value;
  const { watchTime, duration, playEnd, skipTimeInStart, skipTimeInEnd } = videoData.value;
  const doc = {
    date: moment().unix(),
    type: 'analyze',
    relateId: key,
    siteSource: '',
    playEnd: playEnd,
    videoId: vod_id,
    videoImage: '',
    videoName: vod_name,
    videoIndex: `${vod_name}$${vod_id}`,
    watchTime: watchTime,
    duration: duration,
    skipTimeInStart: skipTimeInStart,
    skipTimeInEnd: skipTimeInEnd,
  };

  let response: any;
  if (id) response = await putHistoryData('put', doc, id);
  else response = await putHistoryData('add', doc, null);
  const { code, data, status } = response;

  if (code === 0 && status) {
    historyData.value = data;
  }
};

// 节流更新历史
const throttlePutHistory = throttle(
  putHistory,
  3000,
  {
    leading: true, // 节流开始前，默认true
    trailing: false, // 节流结束后，默认true
  }
);

const changeAnalyzeEvent = async (item) => {
  extConf.value.site = item;
  emits('update', {
    type: 'analyze',
    data: Object.assign({ info: infoConf.value, ext: extConf.value })
  });
  await callPlay({ url: infoConf.value.url, headers: item?.headers || {} });
};

// 分享 dialog 数据
const shareEvent = () => {
  active.value.share = true;
};

// 调用播放器
const callPlay = async (item) => {
  MessagePlugin.info(t('pages.analyze.message.info'));

  try {
    const { site, headers } = extConf.value;
    const response = await fetchAnalyzeHelper(`${site.url}${item.url}`, site.type, headers);
    if (response?.url) {
      shareFormData.value.url = response.url;
      emits('play', { url: response.url, headers: response?.headers || {}, type: response.mediaType });
    } else {
      MessagePlugin.error(t('pages.analyze.message.error'));
    }
  } catch (err) {
    console.log(err);
  };
};

// 定时更新播放进度
const timerUpdatePlayProcess = async(currentTime: number, duration: number) => {
  // 1.不处理当前或总进度为0或负数
  if (!currentTime || !duration || currentTime < 0 || duration < 0) return;

  // 2.获取跳过时间
  const watchTime = currentTime;
  // console.log(
  //   `[player][timeUpdate] - current:${currentTime}; watch:${watchTime}; duration:${duration}; percentage:${Math.trunc((currentTime / duration) * 100)}%`,
  // );

  // 3.更新播放记录
  videoData.value.watchTime = currentTime;
  videoData.value.duration = duration;
  if (watchTime >= duration) videoData.value.playEnd = true;
  throttlePutHistory();
};

const setup = async () => {
  // 1. 获取播放记录
  await fetchHistory();
  if (!historyData.value?.id) await putHistory();

  // 2. 获取收藏(不影响)
  fetchBinge();

  // 3. 获取解析(不影响)
  fetchAnalyze();

  // 3. 播放
  await callPlay({ url: infoConf.value.url, headers: extConf.value.site.headers || {} });
};
</script>

<style lang="less" scoped>
.container-aside-drive {
  .title-text {
    max-width: 100% !important;
  }
}
</style>
