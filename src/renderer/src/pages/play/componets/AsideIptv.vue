<template>
  <div class="container-aside-iptv">
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
    <div class="anthology-contents iptv-anthology">
      <t-tabs v-model="active.nav" class="listbox iptv-listbox">
        <t-tab-panel value="epg" :label="$t('pages.player.iptv.epg')">
          <t-list class="contents-wrap" split :scroll="{ type: 'virtual' }" v-if="active.nav === 'epg'">
            <t-list-item v-for="(item, index) in epgList" :key="index" class="content">
              <div class="time-warp">{{ item['start'] }}</div>
              <div class="title-wrap txthide">{{ item['title'] }}</div>
              <div class="status-wrap">
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'played'" class="played">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'playing'" class="playing">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'unplay'" class="unplay">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
              </div>
            </t-list-item>
          </t-list>
        </t-tab-panel>
        <t-tab-panel value="channel" :label="$t('pages.player.iptv.channel')">
          <title-menu :list="classList" :active="active.class" class="nav" @change-key="changeNavEvent" />
          <div class="contents-wrap scroll-y channel-wrap">
            <div v-for="item in channelList" :key="item['id']" class="content">
              <div class="content-item content-item-start" @click="changeChannelEvent(item)">
                <div class="logo-wrap">
                  <t-image
                    class="logo"
                    fit="contain"
                    :src="item.logo"
                    :style="{ width: '64px', height: '32px', maxHeight: '32px', background: 'none' }"
                    :lazy="true"
                    :loading="renderLoading"
                    :error="renderError"
                  >
                  </t-image>
                </div>
                <div class="title-wrap txthide title-warp-channel">{{ item['name'] }}</div>
                <div class="status-wrap">
                  <span :class="item['id'] === info['id'] ? 'playing' : 'unplay'">
                    {{
                      item['id'] === info['id']
                        ? $t('pages.player.status.playing')
                        : $t('pages.player.status.unplay')
                    }}
                  </span>
                </div>
              </div>
              <t-divider dashed style="margin: 5px 0" />
            </div>
            <infinite-loading
              class="infinite-loading-container"
              target=".channel-wrap"
              :identifier="infiniteId"
              :distance="200"
              @infinite="load"
            >
              <template #complete>{{ $t('pages.player.infiniteLoading.complete') }}</template>
              <template #error>{{ $t('pages.player.infiniteLoading.error') }}</template>
            </infinite-loading>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import { ref, watch, onMounted } from 'vue';
import { throttle } from 'lodash-es';
import moment from 'moment';
import InfiniteLoading from 'v3-infinite-loading';
import { Tv1Icon, LoadingIcon, HeartIcon, HeartFilledIcon, Share1Icon } from 'tdesign-icons-vue-next';
import { fetchBingeData, putBingeData, fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { fetchChannelPage, fetchChannelEpg } from '@/api/iptv';
import TitleMenu from '@/components/title-menu/index.vue';

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
const infiniteId = ref(+new Date());
const formData = ref({
  title: props.info.name
});
const channelList = ref<any[]>([]);
const classList = ref<any[]>([]);
const epgList = ref([]);
const active = ref({
  nav: 'epg',
  class: '全部',
  share: false,
  binge: false,
});
const shareFormData = ref({
  name: '',
  url: '',
  provider: 'zyfun',
});
const pagination = ref({
  pageIndex: 1,
  pageSize: 32,
  count: 0,
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
    getEpgList(val.name, moment().format('YYYY-MM-DD'));
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

onMounted(()=>{
  setup();
});

// 获取收藏
const fetchBinge = async () => {
  const { key } = extConf.value.site;
  const { id: vod_id } = infoConf.value;

  const response = await fetchBingeData(key, vod_id, ['film']);
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
  const { id: vod_id, logo: vod_pic, name: vod_name, group: type_name } = infoConf.value;
  const doc = {
    date: moment().unix(),
    type: 'iptv',
    relateId: key,
    videoId: vod_id,
    videoImage: vod_pic,
    videoName: vod_name,
    videoType: type_name,
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
  const { id: vod_id } = infoConf.value;

  const response = await fetchHistoryData(key, vod_id, ['iptv']);
  const { code, data, status } = response;

  if (code === 0 && status) {
    historyData.value = data;
  }
};

// 更新历史
const putHistory = async () => {
  const { id = null } = historyData.value;
  const { key } = extConf.value.site;
  const { id: vod_id, logo: vod_pic, name: vod_name, url: vod_url, group: type_name } = infoConf.value;
  const { watchTime, duration, playEnd, skipTimeInStart, skipTimeInEnd } = videoData.value;
  const doc = {
    date: moment().unix(),
    type: 'iptv',
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

/**
 * 格式化 EPG 状态
 * @param start 开始时间
 * @param end 结束时间
 * @returns 'playing' | 'unplay' | 'played'
 */
const formatEpgStatus = (start: string, end: string): 'playing' | 'unplay' | 'played' => {
  const nowTimestamp = moment();
  const startTimestamp = moment().set({
    hours: parseInt(start.split(':')[0], 10),
    minutes: parseInt(start.split(':')[1], 10),
  });
  const endTimestamp = moment().set({
    hours: parseInt(end.split(':')[0], 10),
    minutes: parseInt(end.split(':')[1], 10),
  });

  if (nowTimestamp.isBetween(startTimestamp, endTimestamp)) return 'playing';
  if (nowTimestamp.isBefore(startTimestamp)) return 'unplay';
  if (nowTimestamp.isAfter(endTimestamp)) return 'played';

  throw new Error('Invalid state: unable to determine EPG status');
};

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

// 获取直播列表
const getChannelList = async () => {
  const { pageIndex, pageSize } = pagination.value;

  const res = await fetchChannelPage({ page: pageIndex, pageSize, kw: '', group: active.value.class });
  if (Array.isArray(res["class"]) && res["class"].length > 0) {
    classList.value = res["class"];
    classList.value.unshift({ type_id: '全部', type_name: '全部' });
  };
  if (res.hasOwnProperty('total')) pagination.value.count = res["total"];
  channelList.value = [...channelList.value, ...res.data];

  pagination.value.pageIndex++;
  return res.data.length;
};

// 加载channel
const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
  console.log('[iptv][channel]loading...');
  try {
    const resLength = await getChannelList();
    console.log(`[iptv][channel]return length: ${resLength}`);
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

/**
 * 获取epg列表
 * @param name 频道名称
 * @param date 日期
 */
const getEpgList = async (name: string, date: string) => {
  try {
    const res = await fetchChannelEpg({ name, date });
    epgList.value = res;
  } catch (err: any) {
    console.log(`[iptv][epg][error]${err.message}`);
  }
};

// 切换channel
const changeChannelEvent = async (item) => {
  emits('update', {
    type: 'iptv',
    data: Object.assign({ info: item, ext: extConf.value })
  })
  await callPlay({ url: item.url, isLive: true });
};

// 切换nav
const changeNavEvent = (key: string) => {
  active.value.class = key;
  channelList.value = [];
  pagination.value.pageIndex = 1;
  infiniteId.value++;
};

// 分享 dialog 数据
const shareEvent = () => {
  let name = infoConf.value['name'];
  if (infoConf.value.group) name = `${infoConf.value['group']}-${infoConf.value['name']}`;
  shareFormData.value = { ...shareFormData.value, name, url: infoConf.value.url };
  active.value.share = true;
};

// 调用播放器
const callPlay = async (item) => {
  emits('play', { ...item });
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

  // 2. 获取电子节目单(不影响)
  getEpgList(formData.value.title, moment().format('YYYY-MM-DD'));

  // 3. 获取收藏(不影响)
  fetchBinge();

  // 4. 播放
  await callPlay({ url: infoConf.value.url, isLive: true });
};
</script>

<style lang="less" scoped>
.container-aside-iptv {
  .title-text {
    max-width: 100% !important;
  }
}
</style>
