<template>
  <div class="container-aside-drive">
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
    <div class="anthology-contents drive-anthology">
      <div class="box-anthology-header">
        <div class="left">
          <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
        </div>
        <div class="right"></div>
      </div>
      <div class="listbox drive-listbox">
        <t-list class="contents-wrap" split :scroll="{ type: 'virtual' }">
          <t-list-item v-for="item in seasonList" :key="item.id" class="content" @click="changeDriveEvent(item)">
            <div class="logo-wrap">
              <t-image
                class="logo"
                fit="cover"
                :src="item['thumb']"
                :style="{ width: '64px', height: '28px', background: 'none', borderRadius: '6px' }"
                :lazy="true"
                :loading="renderLoading"
                :error="renderError"
              />
            </div>
            <div class="title-wrap txthide">{{ item['name'] }}</div>
            <div class="status-wrap">
              <span :class="info['name'] === item['name'] ? 'playing' : 'unplay'">
                {{
                  item['name'] === info['name']
                    ? $t('pages.player.status.playing')
                    : $t('pages.player.status.unplay')
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
import { Tv1Icon, LoadingIcon, HeartIcon, HeartFilledIcon, Share1Icon } from 'tdesign-icons-vue-next';
import { fetchBingeData, putBingeData, fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { fetchAlistFile, putAlistInit } from '@/api/drive';

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
const seasonList = ref<any[]>(extConf.value.files);
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
    seasonList.value = val.files;
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

// 获取收藏
const fetchBinge = async () => {
  const { key } = extConf.value.site;
  const { id: vod_id } = infoConf.value;

  const response = await fetchBingeData(key, vod_id, ['drive']);
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
  const { id: vod_id, thumb: vod_pic, name: vod_name, path: type_name, remark: vod_remarks } = infoConf.value;
  const doc = {
    date: moment().unix(),
    type: 'drive',
    relateId: key,
    videoId: vod_id,
    videoImage: vod_pic,
    videoName: vod_name,
    videoType: type_name,
    videoRemarks: vod_remarks,
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
  const { id: vod_id } = infoConf.value;

  const response = await fetchHistoryData(key, vod_id, ['drive']);
  const { code, data, status } = response;

  if (code === 0 && status) {
    historyData.value = data;
  }
};

// 更新历史
const putHistory = async () => {
  const { id = null } = historyData.value;
  const { key } = extConf.value.site;
  const { id: vod_id, thumb: vod_pic, name: vod_name, url: vod_url, path: type_name } = infoConf.value;
  const { watchTime, duration, playEnd, skipTimeInStart, skipTimeInEnd } = videoData.value;
  const doc = {
    date: moment().unix(),
    type: 'drive',
    relateId: key,
    siteSource: type_name,
    playEnd: playEnd,
    videoId: vod_id,
    videoImage: vod_pic,
    videoName: vod_name,
    videoIndex: `${vod_name}$${vod_url}`,
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

const renderError = () => {
  return (
    <div class="renderIcon">
      <Tv1Icon size="1.5em" stroke-width="2" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon">
      <LoadingIcon size="1.5em" stroke-width="2" />
    </div>
  );
};

const changeDriveEvent = async (item) => {
  await putAlistInit({ sourceId: extConf.value.site.id });
  const res = await fetchAlistFile({ sourceId: extConf.value.site.id, path: item.path });
  videoData.value.skipTime = videoData.value.watchTime;
  emits('update', {
    type: 'drive',
    data: Object.assign({ info: res, ext: extConf.value })
  });
  await callPlay({ url: res.url, headers: res?.header || {} });
};

// 分享 dialog 数据
const shareEvent = () => {
  let name = infoConf.value['name'];
  shareFormData.value = { ...shareFormData.value, name, url: infoConf.value.url };
  active.value.share = true;
};

// 调用播放器
const callPlay = async (item) => {
  emits('play', { ...item, startTime: videoData.value.skipTime });
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

  // 3. 初始化播放数据
  videoData.value.skipTime = historyData.value.watchTime;

  // 4. 播放
  await callPlay({ url: infoConf.value.url, headers: infoConf.value?.header || {} });
};
</script>

<style lang="less" scoped>
.container-aside-drive {
  .title-text {
    max-width: 100% !important;
  }
}
</style>
