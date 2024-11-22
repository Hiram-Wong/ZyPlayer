<template>
  <div class="container-aside-film">
    <div v-if="!active.profile" class="contents-wrap">
      <div class="tvg-block">
        <div class="title-album">
          <div class="title-text txthide">{{ info['vod_name'] }}</div>
          <div class="title-desc" @click="active.profile = true">
            <span class="title-unfold">{{ $t('pages.player.film.desc') }}</span>
            <chevron-right-s-icon />
          </div>
        </div>
        <div class="hot-block txthide">
          <span class="rate">
            <star-icon size="12px" />
            {{ info['vod_score'] ? info['vod_score'] : '0.0' }}
          </span>
          <t-divider layout="vertical" v-show="info['type_name']" />
          <span v-show="info['type_name']" class="txthide">{{ info['type_name'] }}</span>
          <t-divider layout="vertical" v-show="info['vod_area']" />
          <span v-show="info['vod_area']" class="txthide">{{ info['vod_area'] }}</span>
          <t-divider layout="vertical" v-show="info['vod_year']" />
          <span v-show="info['vod_year']" class="txthide">{{ info['vod_year'] }}</span>
        </div>
        <div class="function">
          <div class="func-item like" @click="putBinge(false)">
            <span>
              <heart-icon class="icon" v-if="active.binge" />
              <heart-filled-icon class="icon" v-else />
            </span>
            <span class="tip">{{ $t('pages.player.film.like') }}</span>
          </div>
          <div class="dot"></div>
          <div class="func-item download" @click="downloadEvent">
            <download-icon class="icon" />
            <span class="tip">{{ $t('pages.player.film.download') }}</span>
          </div>
          <div class="dot"></div>
          <div class="func-item share" @click="shareEvent">
            <share-popup v-model:visible="active.share" :data="shareFormData">
              <template #customize>
                <div style="display: flex; flex-direction: row; align-items: center">
                  <share1-icon class="icon" />
                  <span class="tip">{{ $t('pages.player.film.share') }}</span>
                </div>
              </template>
            </share-popup>
          </div>
          <div class="dot"></div>
          <div class="func-item more">
            <t-dropdown trigger="click">
              <t-button theme="default" shape="square" variant="text">
                <more-icon />
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item>
                  <div class="setting-item" @click="settingEvent">
                    <setting-icon />
                    {{ $t('pages.player.film.setting') }}
                  </div>
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>
        </div>
        <dialog-setting-view v-model:visible="active.setting" :data="settingFormData" @update="settingUpdateEvent" />
        <dialog-download-view v-model:visible="active.download" :data="downloadFormData" />
      </div>
      <div class="anthology-contents scroll-y">
        <div class="box-anthology-header">
          <div class="left">
            <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
            <div class="box-anthology-analyze" v-show="active.official">
              <t-dropdown placement="bottom" :max-height="250">
                <t-button size="small" theme="default" variant="text" auto-width>
                  <span class="title">{{ $t('pages.player.film.analyze') }}</span>
                  <template #suffix>
                    <chevron-down-icon size="16" />
                  </template>
                </t-button>
                <t-dropdown-menu>
                  <t-dropdown-item v-for="item in analyzeData.list" :key="item.id" :value="item.id" @click="switchAnalyzeEvent(item.id)">
                    <span :class="[item.id === active.analyzeId ? 'active' : '']">{{ item.name }}</span>
                  </t-dropdown-item>
                </t-dropdown-menu>
              </t-dropdown>
            </div>
          </div>
          <div class="right">
            <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
              <order-descending-icon v-if="active.reverseOrder" size="1.2em" />
              <order-ascending-icon v-else size="1.2em" />
            </div>
          </div>
        </div>
        <div class="listbox">
          <title-menu v-if="lineList.length > 1" :list="lineList" :active="active.flimSource" class="nav" @change-key="switchLineEvent" />
          <div class="tag-container">
            <div
              v-for="(item, index) in seasonData?.[active.flimSource]"
              :key="item"
              :class="['mainVideo-num', item === active.filmIndex ? 'mainVideo-selected' : '']"
              @click="switchSeasonEvent(item)"
            >
              <t-tooltip :content="formatName(item)">
                <div class="mainVideo_inner">
                  {{
                    formatReverseOrder(
                      active.reverseOrder ? 'positive' : 'negative',
                      index,
                      seasonData?.[active.flimSource]?.length,
                    )
                  }}
                  <div class="playing"></div>
                </div>
              </t-tooltip>
            </div>
          </div>
        </div>
        <div class="recommend" v-show="recommendList.length != 0">
          <div class="component-title">{{ $t('pages.player.film.recommend') }}</div>
          <div class="component-list">
            <div v-for="content in recommendList" :key="content['id']" class="videoItem-card"  @click="recommendEvent(content)">
              <div class="videoItem-left">
                <t-image
                  class="card-main-item"
                  :src="content['vod_pic']"
                  :style="{ width: '126px', height: '70px', 'border-radius': '5px' }"
                  :lazy="true"
                  fit="cover"
                >
                </t-image>
              </div>
              <div class="videoItem-right">
                <div class="title txthide">{{ content['vod_name'] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="profile">
      <div class="side-head">
        <div class="title">{{ $t('pages.player.film.desc') }}</div>
        <close-icon size="1.3em" class="icon" @click="active.profile = false" />
      </div>
      <t-divider dashed style="margin: 5px 0" />
      <div class="side-body scroll-y">
        <div class="card">
          <div class="cover">
            <t-image
              class="card-main-item"
              :src="info['vod_pic']"
              :style="{ width: '100%', height: '100%', 'border-radius': '5px' }"
              :lazy="true"
              fit="cover"
            />
          </div>
          <div class="content">
            <div class="name">{{ info['vod_name'] }}</div>
            <div class="type">{{ info['type_name'] }}</div>
            <div class="num">{{ info['vod_remarks'] }}</div>
          </div>
        </div>
        <div class="background">
          <div class="title">{{ $t('pages.player.film.background') }} </div>
          <div class="content">
            <span class="txt" v-html="formatContent(info['vod_content'], '简介')"></span>
          </div>
        </div>
        <div class="case">
          <div class="title">{{ $t('pages.player.film.actors') }}</div>
          <div class="content">
            <div v-show="info['vod_director']">
              <span class="name">{{ $t('pages.player.film.director') }}: </span>
              <span class="role">{{ formatContent(info['vod_director'], '导演') }}</span>
            </div>
            <div v-show="info['vod_actor']">
              <span class="name">{{ $t('pages.player.film.actor') }}: </span>
              <span class="role">{{ formatContent(info['vod_actor'], '主演') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, watch, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import throttle from 'lodash/throttle';
import moment from 'moment';
import {
  ChevronDownIcon,
  ChevronRightSIcon,
  CloseIcon,
  DownloadIcon,
  HeartIcon,
  HeartFilledIcon,
  SettingIcon,
  MoreIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
  StarIcon,
  Share1Icon
} from 'tdesign-icons-vue-next';
import {
  VIP_LIST,
  fetchBingeData,
  putBingeData,
  fetchHistoryData,
  putHistoryData,
  playHelper,
  reverseOrderHelper,
  fetchRecommSearchHelper,
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder,
} from '@/utils/common/film';
import { fetchRecommPage } from '@/api/site';
import { fetchAnalyzeActive } from '@/api/analyze';
import { fetchConfig } from '@/api/setting';
import { t } from '@/locales';
import { hash } from '@/utils/crypto';
import DialogDownloadView from './DialogDownload.vue';
import DialogSettingView from './DialogSetting.vue';
import SharePopup from '@/components/share-popup/index.vue';
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

const emits = defineEmits(['update', 'play', 'barrage']);
const infoConf = ref(props.info);
const extConf = ref(props.ext);
const processConf = ref(props.process)

const formData = ref({
  title: props.info.vod_name
});
const analyzeData = ref<{ [key: string]: any[] }>({
  list: [],
  flag: [],
});
const bingeData = ref<{ [key: string]: any }>({});
const historyData = ref<{ [key: string]: any }>({});
const seasonData = ref<{ [key: string]: any }>({});
const lineList = computed(() => {
  return Object.keys(seasonData.value).map(item => ({ type_id: item, type_name: item}))
});
const videoData = ref<{ [key: string]: any }>({
  url: '',
  playEnd: false,
  watchTime: 0,
  duration: 0,
  skipTimeInStart: 30,
  skipTimeInEnd: 30,
});
const recommendList = ref<any[]>([]);
const shareFormData = ref({
  name: '',
  url: '',
  provider: 'zyfun',
});
const downloadFormData = ref({ season: {}, current: '' });
const settingFormData = ref({
  skipHeadAndEnd: false,
  skipTimeInStart: 30,
  skipTimeInEnd: 30,
  playNextPreload: false,
  playNextEnabled: true,
  skipAd: false
});
const active = ref({
  profile: false,
  binge: true,
  reverseOrder: true,
  share: false,
  download: false,
  setting: false,
  official: false,
  analyzeId: '',
  filmIndex: '',
  flimSource: '',
});
const tmp = ref({
  preloadNext: {
    url: '',
    headers: {},
    load: false,
    init: false,
    barrage: [],
    mediaType: '',
  },
  end: false,
});

watch(
  () => props.info,
  (val) => {
    infoConf.value = val;
    formData.value.title = val.vod_name;
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
  () => props.ext,
  (val) => {
    extConf.value = val;
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
  const { vod_id } = infoConf.value;
  const response = await fetchBingeData(key, vod_id);
  bingeData.value = response.data;
  active.value.binge = !response.status;
};

// 更新收藏
const putBinge = async (update: boolean = false) => {
  const constructDoc = () => ({
    relateId: extConf.value.site.key,
    videoId: infoConf.value.vod_id,
    videoImage: infoConf.value.vod_pic,
    videoName: infoConf.value.vod_name,
    videoType: infoConf.value.type_name,
    videoRemarks: infoConf.value.vod_remarks,
  });

  let response: any;

  if (bingeData.value?.id) {
    if (update) {
      response = await putBingeData('update', bingeData.value.id, constructDoc());
      if (response?.data) bingeData.value = response.data;
    } else {
      response = await putBingeData('del', bingeData.value.id, {});
      bingeData.value = {
        relateId: null,
        videoId: 0,
        videoImage: '',
        videoName: '',
        videoType: '',
        videoRemarks: '',
        id: null,
      };
    }
  } else if (!update) {
    response = await putBingeData('add', '', constructDoc());
    if (response?.data) bingeData.value = response.data;
  }

  if (response && !response.status) {
    MessagePlugin.error(t('pages.player.message.error'));
    return;
  }

  if (!update) active.value.binge = !active.value.binge;
};

// 获取历史
const fetchHistory = async () => {
  const response = await fetchHistoryData(extConf.value.site.key, infoConf.value.vod_id);
  if (response.siteSource) active.value.flimSource = response.siteSource;
  if (response.videoIndex) active.value.filmIndex = response.videoIndex;
  if (!response.siteSource) response.siteSource = active.value.flimSource;
  if (!response.videoIndex) response.videoIndex = active.value.filmIndex;
  historyData.value = response;
  videoData.value.skipTimeInStart = response.skipTimeInStart;
  videoData.value.skipTimeInEnd = response.skipTimeInEnd;
};

// 更新历史
const putHistory = async () => {
  const doc = {
    date: moment().unix(),
    type: 'film',
    relateId: extConf.value.site.key,
    siteSource: active.value.flimSource,
    playEnd: videoData.value.playEnd,
    videoId: infoConf.value['vod_id'],
    videoImage: infoConf.value['vod_pic'],
    videoName: infoConf.value['vod_name'],
    videoIndex: active.value.filmIndex,
    watchTime: videoData.value.watchTime,
    duration: videoData.value.duration,
    skipTimeInStart: videoData.value.skipTimeInStart,
    skipTimeInEnd: videoData.value.skipTimeInEnd,
  };
  const response: any = await putHistoryData(historyData.value?.id, doc);
  historyData.value = response;
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

// 分享 dialog 数据
const shareEvent = () => {
  const name = `${infoConf.value['vod_name']} ${formatIndex(active.value.filmIndex).index}`;
  shareFormData.value = { ...shareFormData.value, name, url: videoData.value.url };
  active.value.share = true;
};

// 下载 dialog 数据
const downloadEvent = () => {
  downloadFormData.value = {
    season: seasonData.value,
    current: videoData.value.url,
  };
  active.value.download = true;
};

const settingEvent = () => {
  const playConf = extConf.value.setting.playConf;
  settingFormData.value = {
    skipHeadAndEnd: playConf.skipHeadAndEnd,
    playNextPreload: playConf.playNextPreload,
    playNextEnabled: playConf.playNextEnabled,
    skipAd: playConf.skipAd,
    skipTimeInStart: videoData.value.skipTimeInStart,
    skipTimeInEnd: videoData.value.skipTimeInEnd
  };
  active.value.setting = true;
};

// 调用播放器
const callPlay = async (item) => {
  let { url } = formatIndex(item);
  url = decodeURIComponent(url);
  const originalUrl = url;
  active.value.filmIndex = item;
  const analyzeInfo = analyzeData.value.list.find(item => item.id === active.value.analyzeId);
  let response;
  if (tmp.value.preloadNext.init  && tmp.value.preloadNext.load) {
    response = { url: tmp.value.preloadNext.url, headers: tmp.value.preloadNext.headers, mediaType: tmp.value.preloadNext.mediaType };
  } else {
    let analyzeType = analyzeInfo?.type !== undefined ? analyzeInfo?.type : -1;
    if (active.value.official) {
      if (!analyzeInfo || typeof analyzeInfo !== 'object' || Object.keys(analyzeInfo).length === 0) {
        MessagePlugin.warning(t('pages.film.message.notSelectAnalyze'));
        return;
      };
      url = `${analyzeInfo.url}${url}`;
      analyzeType = analyzeInfo.type;
    } else {
      analyzeType = -1;
    }
    response = await playHelper(url, extConf.value.site, active.value.flimSource, analyzeType, extConf.value.setting.playConf.skipAd);
  };

  if (response?.url) {
    videoData.value.url = response.url;
    emits('play', { url: response.url, type: response.mediaType! || '', headers: response.headers, startTime: videoData.value.skipTime });
  };

  let barrage: any[] = [];
  const { url: barrageUrl, key, support, start, mode, color, content } = extConf.value.setting.barrage;
  if (barrageUrl && key && support && start && mode && color && content && support.includes(active.value.flimSource)) {
    if (tmp.value.preloadNext.init  && tmp.value.preloadNext.load) {
      if (tmp.value.preloadNext.barrage.length > 0) barrage = tmp.value.preloadNext.barrage;
    } else {
      try {
        const barrageRes = await fetchConfig({ url: `${barrageUrl}${originalUrl}`, method: 'GET'});
        if (Array.isArray(barrageRes[key]) && barrageRes[key].length > 0) barrage = barrageRes[key];
      } catch (err) {};
    };
  };
  if (response?.url && barrage.length > 0) {
    const formatBarrage = barrage.map((item) => ({
      text: item[content],
      time: parseInt(item[start]),
      color: item[color],
      border: false,
      mode: item[mode],
    }));
    emits('barrage', { comments: formatBarrage, url: barrageUrl, id: hash['md5-16'](originalUrl) });
  };

  tmp.value = {
    preloadNext: {
      url: '',
      headers: {},
      load: false,
      init: false,
      barrage: [],
      mediaType: '',
    },
    end: false,
  };
};

// 切换线路
const switchLineEvent = (key: string) => {
  active.value.flimSource = key;
  if (analyzeData.value.flag.includes(key)) active.value.official = true;
  else active.value.official = false;
};

// 切换解析接口
const switchAnalyzeEvent = async (key: string) => {
  active.value.analyzeId = key;
  if (active.value.filmIndex) await callPlay(active.value.filmIndex);
};

// 切换选集
const switchSeasonEvent = async (item) => {
  active.value.filmIndex = item;

  // 当前源dataHistory.value.siteSource 选择源active.flimSource；当前集dataHistory.value.videoIndex 选择源index
  // 1. 同源 不同集 变   return true
  // 2. 同源 同集 不变   return true
  // 3. 不同源 不同集 变 return true
  // 4. 不同源 同集 不变 return true
  // 待优化 不同源的index不同，要重新索引  但是 综艺不对应
  if (historyData.value['siteSource'] === active.value.flimSource) {
    // 同源
    if (formatIndex(historyData.value['videoIndex']).index !== formatIndex(active.value.filmIndex).index) {
      videoData.value.watchTime = 0;
      videoData.value.playEnd = false;
    }
  } else if (formatIndex(historyData.value['videoIndex']).index !== formatIndex(active.value.filmIndex).index) {
    // 不同源
    videoData.value.watchTime = 0;
    videoData.value.playEnd = false;
  };
  videoData.value.skipTime = videoData.value.watchTime;
  if (extConf.value.setting.playConf.skipHeadAndEnd) {
    if (videoData.value.skipTime < videoData.value.skipTimeInStart) {
      videoData.value.skipTime = videoData.value.skipTimeInStart;
    }
  }

  await callPlay(active.value.filmIndex);
};

// 剧集顺序
const reverseOrderEvent = () => {
  active.value.reverseOrder = !active.value.reverseOrder;
  if (active.value.reverseOrder) {
    seasonData.value = reverseOrderHelper('positive', infoConf.value.fullList);
  } else {
    seasonData.value = reverseOrderHelper('negative', seasonData.value);
  }
};

const settingUpdateEvent = (item) => {
  historyData.value.skipTimeInStart = item.skipTimeInStart;
  historyData.value.skipTimeInEnd = item.skipTimeInEnd;
  videoData.value.skipTimeInStart = item.skipTimeInStart;
  videoData.value.skipTimeInEnd = item.skipTimeInEnd;
  extConf.value.setting.playConf.skipHeadAndEnd = item.skipHeadAndEnd;
  extConf.value.setting.playConf.playNextPreload = item.playNextPreload;
  extConf.value.setting.playConf.playNextEnabled = item.playNextEnabled;
  extConf.value.setting.playConf.skipAd = item.skipAd;

  emits('update', {
    type: 'film',
    setting: extConf.value.setting,
    data: Object.assign({}, { info: infoConf, ext: extConf })
  });
};

// 获取豆瓣影片推荐
const fetchRecommend = async () => {
  let { vod_name: name, vod_year: year, vod_douban_id: doubanId, vod_douban_type: doubanType } = infoConf.value;
  if (!year) year = new Date().getFullYear();
  const res = await fetchRecommPage({ id: doubanId, type: doubanType, name, year });
  recommendList.value = res || [];
};

// 推荐刷新数据
const recommendEvent = async (item) => {
  const { site } = extConf.value;
  const res = await fetchRecommSearchHelper(site, item.vod_name);

  if (Object.keys(res).length > 0) {
    infoConf.value = res;
    recommendList.value = [];
    historyData.value = {};
    seasonData.value = {};
    videoData.value = {
      url: '',
      playEnd: false,
      watchTime: 0,
      duration: 0,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
    };
    active.value = {
      profile: false,
      binge: false,
      reverseOrder: true,
      share: false,
      download: false,
      setting: false,
      official: false,
      analyzeId: '',
      filmIndex: '',
      flimSource: '',
    };
    emits('update', {
      type: 'film',
      data: Object.assign({ info: item, ext: extConf })
    });
    setup();
  } else {
    MessagePlugin.warning(t('pages.player.message.noRecommendSearch'));
  }
};

const setup = async () => {
  // 1. 格式化剧集数据
  const formattedSeason: any = await formatSeason(infoConf.value);
  infoConf.value.fullList = formattedSeason;
  if (Object.keys(formattedSeason)?.[0] === 'error') {
    MessagePlugin.warning(t('pages.film.message.formatSeasonError'));
    return;
  };

  // 2. 设置默认选集
  active.value.flimSource = active.value.flimSource || Object.keys(formattedSeason)[0];
  active.value.filmIndex = active.value.filmIndex || formattedSeason[active.value.flimSource][0];

  // 3. 选集排序
  if (active.value.reverseOrder) seasonData.value = formattedSeason;
  else seasonData.value = reverseOrderHelper('negative', formattedSeason);

  // 4. 获取播放记录
  await fetchHistory();
  if (!historyData.value?.id) await putHistory();

  // 5. 获取解析规则 + 是否显示解析
  const analyzeRes = await fetchAnalyzeActive();
  if (analyzeRes.hasOwnProperty('data')) analyzeData.value.list = analyzeRes['data'];
  if (analyzeRes.hasOwnProperty('default')) active.value.analyzeId = analyzeRes['default']['id'];
  if (analyzeRes.hasOwnProperty('flag')) {
    analyzeData.value.flag = analyzeRes['flag'];
    let vipUrl = formatIndex(active.value.filmIndex)?.url;
    vipUrl = decodeURIComponent(vipUrl);
    const vipUrlHostname = /^(https?:\/\/)/.test(vipUrl) ? new URL(vipUrl)?.hostname : '';
    if (analyzeRes.flag.includes(active.value.flimSource) || VIP_LIST.includes(vipUrlHostname)) active.value.official = true;
  };

  // 6. 获取推荐(不影响)
  fetchRecommend();

  // 7. 获取收藏(不影响)
  fetchBinge();

  // 8. 获取跳过时间
  if (extConf.value.setting.playConf.skipHeadAndEnd) {
    if (historyData.value.watchTime < videoData.value.skipTimeInStart) {
      videoData.value.skipTime = videoData.value.skipTimeInStart;
    } else {
      videoData.value.skipTime = historyData.value.watchTime;
    };
  } else {
    videoData.value.skipTime = historyData.value.watchTime;
  };

  // 9. 播放
  await callPlay(active.value.filmIndex);
};

// 定时更新播放进度
const timerUpdatePlayProcess = async(currentTime: number, duration: number) => {
  // 1.不处理当前或总进度为0或负数
  if (!currentTime || !duration || currentTime < 0 || duration < 0) return;

  const index = seasonData.value[active.value.flimSource].indexOf(active.value.filmIndex);
  if (index === -1) return;

  const isLast = () => {
    if (active.value.reverseOrder) {
      return seasonData.value[active.value.flimSource].length === index + 1;
    } else {
      return index === 0;
    }
  };

  // 2.获取跳过时间
  const { preloadNext, skipStartEnd, playConf, barrage } = extConf.value.setting;
  const watchTime = skipStartEnd ? currentTime + videoData.value.skipTimeInEnd : currentTime;
  // console.log(
  //   `[player][timeUpdate] - current:${currentTime}; watch:${watchTime}; duration:${duration}; percentage:${Math.trunc((currentTime / duration) * 100)}%`,
  // );

  // 3.更新播放记录
  videoData.value.watchTime = currentTime;
  videoData.value.duration = duration;
  if (watchTime >= duration) videoData.value.playEnd = true;
  throttlePutHistory();

  // 4.播放下集  不是最后一集 & 时间>尾部跳过时间+观看时间
  if (!isLast() && playConf.playNextEnabled && watchTime >= duration && duration !== 0 && !tmp.value.end) {
    tmp.value.end = true;
    const nextIndex = active.value.reverseOrder ? index + 1 : index - 1;
    const nextInfo = seasonData.value[active.value.flimSource][nextIndex];
    await switchSeasonEvent(nextInfo);
    return;
  };

  // 5.预加载下集链接 提前30秒预加载
  if (watchTime + 30 >= duration && duration !== 0) {
    if (!isLast() && !tmp.value.preloadNext.load && preloadNext) {
      tmp.value.preloadNext.load = true; // 标识是否触发预加载
      try {
        const nextIndex = active.value.reverseOrder ? index + 1 : index - 1;
        const nextInfo = seasonData.value[active.value.flimSource][nextIndex];
        let url = formatIndex(nextInfo).url;
        url = decodeURIComponent(url);
        const originUrl = url;
        const analyzeInfo = analyzeData.value.list.find(item => item.id === active.value.analyzeId);
        let analyzeType = analyzeInfo?.type !== undefined ? analyzeInfo?.type : -1;
        if (active.value.official) {
          if (!analyzeInfo || typeof analyzeInfo !== 'object' || Object.keys(analyzeInfo).length === 0) return;
          url = `${analyzeInfo.url}${url}`;
          analyzeType = analyzeInfo.type;
        } else {
          analyzeType = -1;
        }
        const response = await playHelper(url, extConf.value.site, active.value.flimSource, analyzeType, playConf.skipAd);
        if (response?.url) {
          tmp.value.preloadNext.url = response.url;
          tmp.value.preloadNext.headers = response.headers;
          tmp.value.preloadNext.mediaType = response.mediaType;
          tmp.value.preloadNext.init = true; // 标识是否预加载完毕
          const { url: barrageUrl, key, support, start, mode, color, content } = barrage;
          if (barrageUrl && key && support && start && mode && color && content && support.includes(active.value.flimSource)) {
            try {
              const barrageRes = await fetchConfig({ url: `${barrageUrl}${originUrl}`, method: 'GET'});
              if (Array.isArray(barrageRes[key]) && barrageRes[key].length === 0) tmp.value.preloadNext.barrage = barrageRes[key] as any;
            } catch(err) {}
          }
        }
      } catch (err) {}
    }
  };
};
</script>

<style lang="less" scoped>
</style>
