<template>
  <t-dialog v-model:visible="formVisible" width="796px" placement="center" :footer="false">
    <template #body>
      <div class="detail-container">
        <div class="plist-body">
          <div class="detail-title clearfix">
            <div class="detail-info">
              <div class="title">
                <div v-show="info.vod_name" class="name">{{ info.vod_name }}</div>
                <div v-show="info.vod_douban_score" class="rate">
                  · {{
                    info.vod_douban_score === '0.0' && info.vod_score === '0.0'
                      ? '暂无评分'
                      : info.vod_douban_score === '0.0'
                      ? info.vod_score
                      : info.vod_douban_score
                    }}
                </div>
              </div>
              <div class="desc">
                <t-space size="small" class="tag-items">
                  <t-tag v-show="info.vod_type" shape="round" class="tag-item">{{ info.vod_type }}</t-tag>
                  <t-tag v-show="info.vod_area" shape="round" class="tag-item">{{ info.vod_area }}</t-tag>
                  <t-tag v-show="info.vod_lang" shape="round" class="tag-item">{{ info.vod_lang }}</t-tag>
                  <t-tag v-show="info.vod_year" shape="round" class="tag-item">{{ info.vod_year }}</t-tag>
                  <t-tag v-show="info.vod_note" shape="round" class="tag-item">{{ info.vod_note }}</t-tag>
                </t-space>
              </div>
            </div>
            <div class="binge">
              <div v-if="isVisible.binge" class="video-subscribe-text" @click="bingeEvnet">
                <t-space :size="8">
                  <heart-icon size="1.2em" class="icon" />
                  <span class="tip">追</span>
                </t-space>
              </div>
              <div v-else class="video-subscribe-text" @click="bingeEvnet">
                <span class="tip">在追</span>
              </div>
            </div>
          </div>
          <div class="intro-wrap">
            <div class="poster">
              <t-image
                class="card-main-item"
                :src="info.vod_pic"
                :style="{ width: '100px', height: '150px', borderRadius: '8px' }"
                :lazy="true"
                fit="cover"
              />
            </div>
            <div class="content-wrap">
              <div class="introduce-items">
                <div v-show="info.vod_director" class="director introduce-item">
                  <span class="title">导演：</span>
                  <div class="info">{{ info.vod_director }}</div>
                </div>
                <div v-show="info.vod_actor" class="actor introduce-item">
                  <span class="title">主演：</span>
                  <div class="info">{{ info.vod_actor }}</div>
                </div>
                <div v-show="info.vod_content" class="des introduce-item">
                  <span class="title">摘要：</span>
                  <div class="info">
                    <span v-html="filterContent(info.vod_content)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="plist-listbox">
          <div class="box-anthology-header">
            <h4 class="box-anthology-title">选集</h4>
            <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
              <order-descending-icon v-if="reverseOrder" size="1.3em" />
              <order-ascending-icon v-else size="1.3em" />
            </div>
          </div>
          <div class="box-anthology-items">
            <t-tabs v-model="selectPlaySource" class="film-tabs">
              <t-tab-panel v-for="(value, key, index) in season" :key="index" :value="key">
                <template #label> {{ key }} </template>
                <div>
                  <t-space break-line size="small" align="center">
                    <t-tag
                      v-for="item in value"
                      :key="item"
                      class="tag"
                      :class="{
                        select:
                          formatName(item) ===
                            (dataHistory.videoIndex ? dataHistory.videoIndex : selectPlayIndex) &&
                          (dataHistory.siteSource ? dataHistory.siteSource : selectPlaySource) === key,
                      }"
                      @click="gotoPlay(item)"
                    >
                      {{ formatName(item) }}
                    </t-tag>
                  </t-space>
                </div>
              </t-tab-panel>
            </t-tabs>
          </div>
        </div>
        <div v-show="onlineUrl" class="player-webview">
          <iframe
            ref="iframeRef"
            :src="onlineUrl"
            allowtransparency="true"
            frameborder="0"
            scrolling="no"
            allowfullscreen="true"
            webkit-playsinline
            playsinline
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
            style="height: 0; width: 0;"
            >
          </iframe>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import _ from 'lodash';
import {
  HeartIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive, watch, computed } from 'vue';
import moment from 'moment';

import { usePlayStore } from '@/store';

import { detailStar, addStar, delStar } from '@/api/star';
import { updateHistory, detailHistory, addHistory } from '@/api/history';
import { fetchAnalyzeDefault } from '@/api/analyze';
import { fetchDrpyPlayUrl, fetchHipyPlayUrl } from '@/utils/cms';
import { getConfig, getMeadiaType } from '@/utils/tool';

const remote = window.require('@electron/remote');
const win = remote.getCurrentWindow();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  site: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const storePlayer = usePlayStore();
const set = computed(() => {
  return storePlayer.getSetting;
});
const formVisible = ref(false);
const info = ref(props.data);
const formData = ref(props.site);
const recommendationsList = ref([]);
const reverseOrder = ref(true); // true 正序 false 倒序
const season = ref(); // 选集
const selectPlaySource = ref(); // 选择的播放源
const selectPlayIndex = ref();
const dataHistory = ref({}); // 历史

const iframeRef = ref(); // iframe dom节点
const onlineUrl = ref();
const snifferTimer = ref();
const snifferUrl = ref();

const analyzeConfig = ref({
  default: {
    url: ''
  }, // 
  flag: [] //标识
})

const isVisible = reactive({
  binge: false
})

// 嗅探
const videoFormats = ['.m3u8', '.mp4', '.flv', 'avi', 'mkv'];
const VIP_LIST = [
  'iqiyi.com',
  'iq.com',
  'mgtv.com',
  'qq.com',
  'youku.com',
  'le.com',
  'sohu.com',
  'pptv.com',
  'bilibili.com',
  'tudou.com',
];

const emit = defineEmits(['update:visible']);
watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
    recommendationsList.value = [];
    onlineUrl.value = '';

    if (val) getBinge();
    if (val) getHistoryData();
    if (val) getDetailInfo();
    if (val) getAnalyzeFlag();
  },
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
  },
);
watch(
  () => props.data,
  (val) => {
    info.value = val;
  },
);
watch(
  () => props.site,
  (val) => {
    formData.value = val;
  },
);

const getAnalyzeFlag = async() => {
  try {
    const res = await fetchAnalyzeDefault();
    if (_.has(res, 'default')) analyzeConfig.value.default = res.default;
    if (_.has(res, 'flag')) analyzeConfig.value.flag = res.flag;

    console.log(`[analyze] jx:${res.default.url}; flag:${[...res.flag]}`);
  } catch (error) {
    console.error(error);
  }
};

// 调用本地播放器 + 历史
const gotoPlay = async (e) => {
  const [index, url] = e.split('$');
  selectPlayIndex.value = index;

  snifferUrl.value = url;

  // 解析直链
  const { playUrl } = formData.value;
  if (playUrl) {
    const play = await getConfig(`${playUrl}${url}`);
    console.log(`解析地址:${play.url}`);
    if (play.url) {
      snifferUrl.value = play.url;
      callSysPlayer(snifferUrl.value);
      return;
    }
  }

  // 官解iframe
  try {
    const { hostname } = new URL(url);
    if (
        VIP_LIST.some((item) => hostname.includes(item)) ||
        analyzeConfig.value.flag.some((item) => selectPlaySource.value.includes(item))
      ) {
        snifferUrl.value = analyzeConfig.value.default.url + url;
        sniffer(snifferUrl.value);
        console.log(`[player] return: 官解播放地址:${snifferUrl.value}`);
        return;
      }
  } catch (err) {
    console.info(`[player] input: 传入地址不是url:${url}`);
  }

  if (formData.value.type === 6) {
    // hipy获取服务端播放链接
    console.log('[player] start: hipy获取服务端播放链接开启');
    try {
      const hipyPlayUrl = await fetchHipyPlayUrl(formData.value, selectPlaySource.value, url);
      snifferUrl.value = hipyPlayUrl;
      console.log(`[player] return: hipy获取服务端返回链接:${url}`);
    } catch (err) {
      console.log(err);
    } finally {
      console.log(`[player] end: hipy获取服务端播放链接结束`);
    }
  } else if (formData.value.type === 2) {
    // drpy嗅探
    MessagePlugin.info('免嗅资源中, 请等待!');
    console.log('[player] start: drpy免嗅流程开始');
    try {
      const drpySniffFree = await fetchDrpyPlayUrl(formData.value, url);
      if (drpySniffFree.redirect) {
        snifferUrl.value = drpySniffFree.url;
      }
    } catch (err) {
      console.log(err);
    }

    console.log(`[player] end: drpy免嗅流程结束`);
  }

  const mediaType = await checkMediaType(snifferUrl.value);
  console.log(`[player] mediaType: ${mediaType}`)
  if (mediaType !== 'unknown' && mediaType !== 'error') {
    callSysPlayer(snifferUrl.value);
    return;
  }

  // 兜底办法:嗅探
  console.log(`尝试提取播放链接,type:${formData.value.type}`);
  try {
    MessagePlugin.info('嗅探资源中, 如10s没有结果请换源,咻咻咻!');
    sniffer(url);
  } catch (err) {
    console.error(err);
  };
};

const callSysPlayer = (url) => {
  console.log(url);
  // const playerType = set.value.broadcasterType;
  const externalPlayer = set.value.externalPlayer;
  window.electron.ipcRenderer.send('call-player', externalPlayer, url);
  // if (playerType === 'iina') window.open(`iina://weblink?url=${url}`, '_self');
  // else if (playerType === 'potplayer') window.open(`potplayer://${url}`, '_self');
  // else if (playerType === 'vlc') window.open(`vlc://${url}`, '_self');
  getHistoryData(true);
}

// 在追
const bingeEvnet = async () => {
  try {
    const { id } = formData.value;
    const db = await detailStar({ relateId: id, videoId: info.value.vod_id });

    if (isVisible.binge) {
      const doc = {
        relateId: id,
        videoId: info.value.vod_id,
        videoImage: info.value.vod_pic,
        videoName: info.value.vod_name,
        videoType: info.value.type_name,
        videoRemarks: info.value.vod_remarks,
      };
      if (!db) {
        await addStar(doc);
      }
    } else {
      await delStar(db.id);
    }

    isVisible.binge = !isVisible.binge;
  } catch (error) {
    console.error(error);
    MessagePlugin.error(`操作失败:${error}`);
  }
};

// 获取是否收藏
const getBinge = async () => {
  const { id } = formData.value;
  const { vod_id } = info.value;
  const res = await detailStar({ relateId: id, videoId: vod_id });
  isVisible.binge = !res;
};

// 选择倒序
const reverseOrderEvent = () => {
  reverseOrder.value = !reverseOrder.value;
  seasonReverseOrder();
};

// 选集排序
const seasonReverseOrder = () => {
  if (reverseOrder.value) {
    console.log('正序');
    season.value = JSON.parse(JSON.stringify(info.value.fullList));
  } else {
    console.log('倒序');
    for (const key in season.value) {
      season.value[key].reverse();
    }
  }
};

// 格式化剧集名称
const formatName = (e) => {
  const [first] = e.split('$');
  return first.includes('http') ? '正片' : first;
};

// 获取历史
const getHistoryData = async (type = false) => {
  try {
    const { id } = formData.value;
    const res = await detailHistory({ relateId: id, videoId: info.value.vod_id });
    const doc = {
      date: moment().unix(),
      type: 'film',
      relateId: id,
      siteSource: selectPlaySource.value,
      playEnd: false,
      videoId: info.value.vod_id,
      videoImage: info.value.vod_pic,
      videoName: info.value.vod_name,
      videoIndex: selectPlayIndex.value,
      watchTime: 0,
      duration: null,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
    };

    if (res) {
      if (!type) {
        selectPlaySource.value = res.siteSource;
        selectPlayIndex.value = res.videoIndex;
      }
      if (res.siteSource !== selectPlaySource.value || res.videoIndex !== selectPlayIndex.value) {
        await updateHistory(res.id, doc);
        dataHistory.value = { ...doc, id: res.id };
      } else {
        dataHistory.value = { ...res };
      }
    } else {
      const add_res = await addHistory(doc);
      dataHistory.value = add_res;
    }
  } catch (error) {
    console.error(error);
  }
};

// 获取播放源及剧集
const getDetailInfo = async () => {
  const videoList = info.value;

  // 播放源
  const playFrom = videoList.vod_play_from;
  const playSource = playFrom.split('$').filter(Boolean);
  const [source] = playSource;
  if (!selectPlaySource.value) selectPlaySource.value = source;

  // 剧集
  const playUrl = videoList.vod_play_url;
  const playUrlDiffPlaySource = playUrl.split('$$$'); // 分离不同播放源
  const playEpisodes = playUrlDiffPlaySource.map((item) =>
    item
      .replace(/\$+/g, '$')
      .split('#')
      .map((e) => {
        if (!e.includes('$')) e = `正片$${e}`;
        return e;
      }),
  );
  if (!selectPlayIndex.value) selectPlayIndex.value = playEpisodes[0][0].split('$')[0];

  // 合并播放源和剧集
  const fullList = Object.fromEntries(playSource.map((key, index) => [key, playEpisodes[index]]));

  videoList.fullList = fullList;
  info.value = videoList;
  season.value = fullList;
};


// 替换style
const filterContent = (item) => {
  return _.replace(item, /style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};

const sniffer_pie = () => {
  window.electron.ipcRenderer.invoke('sniffer-media', snifferUrl.value).then(res => {
    console.log(res)
    if (res.code == 200) {
      const formatIndex = videoFormats.findIndex((format) => res.data.url.toLowerCase().indexOf(format) > -1);
      if (formatIndex > -1) {
        snifferUrl.value = res.data.url;
        callSysPlayer(snifferUrl.value);
      }
    } else {
      MessagePlugin.warning(`嗅探超时并结束, 请换源`);
    };
  });
};

const sniffer_iframe = () => {
  win.webContents.setAudioMuted(true);
  const iframeWindow = iframeRef.value.contentWindow;

  const totalTime = 15000;
  const speeder = 250;
  let counter = 1;
  const totalCounter = totalTime / speeder;
  clearInterval(snifferTimer.value);

  snifferTimer.value = setInterval(() => {
    console.log(`第${counter}次嗅探开始`);

    if (counter >= totalCounter) {
      clearInterval(snifferTimer.value);
      MessagePlugin.warning(`嗅探超时并结束, 共计嗅探:${counter}次, 请换源`);
      console.log(`嗅探超时并结束，共计嗅探:${counter}次`);
      return;
    }

    try {
      const resources = iframeWindow.performance.getEntriesByType('resource');

      for (const resource of resources) {
        const resourceName = resource.name;
        const sniffUrl = resourceName;
        const formatIndex = videoFormats.findIndex((format) => sniffUrl.toLowerCase().indexOf(format) > -1);
        if (formatIndex > -1) {
          const videoFormat = videoFormats[formatIndex];
          console.log(`嗅探到${videoFormat}文件:${resourceName},共计嗅探:${counter}次`);
          const regex = new RegExp(`https?:\\/\\/.*(https?:\\/\\/(?:[^\\s"]+\\/)+[^\\s"]+\\${videoFormat})`);
          const match = sniffUrl.match(regex);

          if (match && match.length > 1) {
            console.log(`最终嗅探地址：${match[1]}`);
            snifferUrl.value = match[1];
          } else {
            console.log(`最终嗅探地址：${resourceName}`);
            snifferUrl.value = resourceName;
          }

          onlineUrl.value = '';
          callSysPlayer(snifferUrl.value);
          win.webContents.setAudioMuted(false);

          clearInterval(snifferTimer.value);
          break;
        }
      }
    } catch (err) {
      MessagePlugin.error(`温馨提示：嗅探发生错误:${err}`);
      console.log(`第${counter}次嗅探发生错误:${err}`);
    }
    counter += 1;
  }, speeder);
};

const sniffer = (url) => {
  if (set.value.snifferType === 'iframe') {
    onlineUrl.value = url;
    sniffer_iframe();
  } else sniffer_pie();
};

// 判断媒体类型
const checkMediaType = async (url) => {
  const supportedFormats = ['mp4', 'mkv', 'flv', 'm3u8', 'avi'];

  if (url.startsWith('http')) {
    const fileType = supportedFormats.find(format => url.includes(format));
    if (fileType) {
      return fileType;
    } else {
      const getMediaType = await getMeadiaType(url);
      return getMediaType;
    }
  } else {
    return null; // 如果 URL 不以 http 开头，返回 null
  }
};

</script>

<style lang="less" scoped>
.detail-container {
  height: calc(100% - 48px);
  .plist-body {
    .detail-title {
      position: relative;
      display: flex;
      justify-content: space-between;
      box-shadow: 0 26px 40px -30px rgba(0,36,100,0.3);
      .detail-info {
        .title {
          display: flex;
          align-items: baseline;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: flex-start;
          .name {
            position: relative;
            font-weight: 700;
            font-size: 28px;
            line-height: 28px;
            max-width: 200px;
            word-break: keep-all;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .rate {
            color: var(--td-brand-color);
            font-weight: 700;
            font-size: 14px;
            margin-right: 12px;
          }
        }
        .desc {
          margin-top: 10px;
        }
      }
      .binge {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.15);
        border-radius: 36px;
        filter: blur(0);
        width: 84px;
        height: 42px;
        z-index: 14;
      }
    }
    .intro-wrap {
      padding: 10px 0 5px 0;
      position: relative;
      width: 100%;
      font-size: 14px;
      line-height: 20px;
      display: flex;
      .poster {
        display: block;
        position: relative;
        height: 100%;
        margin-right: 12px;
        border-radius: 8px;
      }
      .content-wrap {
        height: 150px;
        overflow-x: hidden;
        overflow-y: scroll;
        .introduce-items {
          overflow: hidden;
          .introduce-item {
            margin-bottom: 12px;
            .title {
              display: block;
              float: left;
              line-height: 22px;
              height: 22px;
            }
            .info {
              line-height: 22px;
              margin-right: 12px;
              cursor: default;
            }
          }
        }
      }
    }
  }
  .plist-listbox {
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    .box-anthology-header {
      display: flex;
      justify-content: space-between;
      .box-anthology-title {
        position: relative;
        font-size: 18px;
        line-height: 25px;
        font-weight: 600;
      }
      .box-anthology-reverse-order {
        cursor: pointer;
      }
    }
  }
}

.select {
  color: var(--td-brand-color) !important;
  cursor: pointer;
}

.t-tabs {
  background-color: transparent;
}

:deep(.t-tabs__content) {
  max-height: 150px;
  padding: 10px 0 0 0;
  overflow-y: auto;
}
</style>
