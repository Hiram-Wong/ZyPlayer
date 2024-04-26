<template>
  <t-dialog v-model:visible="formVisible" width="70%" placement="center" :footer="false">
    <template #body>
      <div class="detail view-container">
        <div class="plist-body">
          <div class="detail-title clearfix">
            <div class="detail-info">
              <div class="title">
                <div v-show="info.vod_name" class="name">{{ info.vod_name }}</div>
                <div class="rate">
                  · {{ info.vod_score ? info.vod_score : '0.0' }}
                </div>
              </div>
              <div class="desc">
                <div class="tag-items">
                  <t-tag v-show="info.vod_type" shape="round" class="tag-item">{{ info.vod_type }}</t-tag>
                  <t-tag v-show="info.vod_area" shape="round" class="tag-item">{{ info.vod_area }}</t-tag>
                  <t-tag v-show="info.vod_lang" shape="round" class="tag-item">{{ info.vod_lang }}</t-tag>
                  <t-tag v-show="info.vod_year" shape="round" class="tag-item">{{ info.vod_year }}</t-tag>
                  <t-tag v-show="info.vod_note" shape="round" class="tag-item">{{ info.vod_note }}</t-tag>
                </div>
              </div>
            </div>
            <div class="binge">
              <div class="video-subscribe-text" @click="bingeEvent">
                <span>
                  <heart-icon class="icon" v-if="isVisible.binge" />
                  <heart-filled-icon class="icon" v-else />
                </span>
                <span class="tip">{{ $t('pages.player.film.like') }}</span>
              </div>
            </div>
          </div>
          <div class="intro-wrap">
            <div class="poster">
              <t-image class="card-main-item" :src="info.vod_pic"
                :style="{ width: '100px', height: '150px', borderRadius: '8px' }" :lazy="true" fit="cover" />
            </div>
            <div class="content-wrap">
              <div class="introduce-items">
                <div v-show="info.vod_director" class="director introduce-item">
                  <span class="title">{{ $t('pages.player.film.director') }}: </span>
                  <div class="info">{{ info.vod_director }}</div>
                </div>
                <div v-show="info.vod_actor" class="actor introduce-item">
                  <span class="title">{{ $t('pages.player.film.actor') }}: </span>
                  <div class="info">{{ info.vod_actor }}</div>
                </div>
                <div v-show="info.vod_content" class="des introduce-item">
                  <span class="title">{{ $t('pages.player.film.desc') }}: </span>
                  <div class="info">
                    <span v-html="filterContent(info.vod_content)"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="plist-listbox">
          <div class="box-anthology-header">
            <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
            <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
              <order-descending-icon v-if="reverseOrder" size="1.3em" />
              <order-ascending-icon v-else size="1.3em" />
            </div>
          </div>
          <div class="box-anthology-items">
            <t-tabs v-model="active.flimSource" class="film-tabs">
              <t-tab-panel
                v-for="(value, key, index) in season"
                :key="index"
                :value="key"
                :label="key"
                >
                <div class="">
                  <t-space break-line size="small" align="center">
                    <t-tag
                      v-for="item in value"
                      :key="item"
                      :class="['tag', item === active.filmIndex ? 'select' : '' ]"
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
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import {
  HeartIcon,
  HeartFilledIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive, watch, computed } from 'vue';
import moment from 'moment';

import { usePlayStore } from '@/store';

import { fetchAnalyzeDefault } from '@/api/analyze';
import { updateHistory, detailHistory, addHistory } from '@/api/history';
import { detailStar, addStar, delStar } from '@/api/star';
import { setT3Proxy } from '@/api/proxy';
import { fetchDrpyPlayUrl, fetchHipyPlayUrl, fetchT3PlayUrl, t3RuleProxy, fetchCatvodPlayUrl } from '@/utils/cms';
import sniffer from '@/utils/sniffer';
import { getConfig, checkMediaType } from '@/utils/tool';

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
const reverseOrder = ref(true); // true 正序 false 倒序
const season = ref(); // 选集
const dataHistory = ref({}); // 历史

const analyzeConfig = ref({
  default: {
    url: ''
  },
  flag: [] //标识
})

const isVisible = reactive({
  binge: false
})

const active = reactive({
  flimSource: '',
  filmIndex: ''
})

// 嗅探
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

    if (val) {
      getBinge();
      getHistoryData();
      getAnalyzeFlag();
    } else {
      active.flimSource = '';
      active.filmIndex = '';
      season.value = [];
    }
  }
);
watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
  }
);
watch(
  () => props.data,
  (val) => {
    info.value = val;
    
    getDetailInfo();
  }
);
watch(
  () => props.site,
  (val) => {
    formData.value = val;
  }
);

const getAnalyzeFlag = async (): Promise<void> => {
  try {
    const res = await fetchAnalyzeDefault();
    if (res.hasOwnProperty('default')) analyzeConfig.value.default = res.default;
    if (res.hasOwnProperty('flag')) analyzeConfig.value.flag = res.flag;

    console.log(`[detail][analyze]-[jx]:${res.default.url}; flag:${[...res.flag]}`);
  } catch (error) {
    console.error(error);
  }
};

// Helper functions
const fetchHipyPlayUrlHelper = async (site: { [key: string]: any }, flag: string, url: string): Promise<string> => {
  console.log('[detail][hipy][start]获取服务端播放链接开启');
  let data: string = '';
  try {
    const res = await fetchHipyPlayUrl(site, flag, url);
    data = res;
    console.log(`[detail][hipy][return]${data}`);
  } catch (err) {
    console.log(`[detail][hipy][error]${err}`);
  } finally {
    console.log(`[detail][hipy][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchT3PlayUrlHelper = async (flag: string, id: string, flags: string[] = []): Promise<string> => {
  console.log('[detail][t3][start]获取服务端播放链接开启');
  let data: string = '';
  try {
    const playRes = await fetchT3PlayUrl(flag, id, flags);
    if (playRes?.parse === 0 && playRes?.url.indexOf('http://127.0.0.1:9978/proxy') > -1) {
      const proxyRes: any = await t3RuleProxy(playRes.url);
      await setT3Proxy(proxyRes);
    }

    data = playRes.url;
    console.log(`[detail][t3][return]${data}`);
  } catch (err) {
    console.log(`[detail][t3][error]${err}`);
  } finally {
    console.log(`[detail][t3][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchCatvodPlayUrlHelper = async (site: { [key: string]: any }, flag: string, id: string): Promise<string> => {
  console.log('[detail][catvod][start]获取服务端播放链接开启');
  let data: string = '';
  try {
    const res = await fetchCatvodPlayUrl(site, flag, id);
    data = res.url;
    console.log(`[detail][catvod][return]${data}`);
  } catch (err) {
    console.log(`[detail][catvod][error]${err}`);
  } finally {
    console.log(`[detail][catvod][end]获取服务端播放链接结束`);
    return data;
  }
};

const fetchDrpyPlayUrlHelper = async (site: { [key: string]: any }, url: string): Promise<string> => {
  console.log('[detail][drpy][start]免嗅流程开启');
  let data: string = '';
  try {
    const res = await fetchDrpyPlayUrl(site, url);
    if (res.redirect) {
      data = res.url;
      console.log(`[detail][drpy][return]${data}`);
    }
  } catch (err) {
    console.log(`[detail][drpy][error]:${err}`);
  } finally {
    console.log(`[detail][drpy][end]免嗅流程结束`);
    return data;
  }
};

const fetchJsonPlayUrlHelper = async (playUrl: string, url: string): Promise<string> => {
  console.log('[detail][json][start]json解析流程开启');
  let data: string = '';
  try {
    const res = await getConfig(`${playUrl}${url}`);
    if (res.url) {
      data = res.url;
      console.log(`[detail][json][return]${data}`);
    }
  } catch (err) {
    console.log(`[detail][json][error]${err}`);
  } finally {
    console.log(`[detail][json][end]json解析流程结束`);
    return data;
  }
};

const fetchJxPlayUrlHelper = async (type: string, url: string): Promise<string> => {
  console.log('[detail][jx][start]官解流程开启');
  let data: string = '';
  try {
    const res = await sniffer(type, url);
    data = res;
    console.log(`[detail][jx][return]${data}`);
  } catch (err) {
    console.log(`[detail][jx][error]${err}`);
  } finally {
    console.log(`[detail][jx][end]官解流程结束`);
    return data;
  }
};

// 调用本地播放器 + 历史
const gotoPlay = async (item) => {
  const { url } = formatIndex(item);
  active.filmIndex = item;
  const { playUrl, type } = formData.value;
  const { snifferMode } = set.value;

  let playerUrl = url;

  if (playUrl) {
    playerUrl = await fetchJsonPlayUrlHelper(playUrl, url);
  } else {
    if (url.startsWith('http')) {
      const { hostname } = new URL(url);
      let snifferUrl;
      if (url.includes('uri=')) snifferUrl = url; // 判断有播放器的
      if (
        VIP_LIST.some((item) => hostname.includes(item)) ||
        analyzeConfig.value.flag.some((item) => active.flimSource.includes(item))
      ) {
        // 官解iframe
        snifferUrl = analyzeConfig.value.default.url + url;
      }
      if (snifferUrl) {
        playerUrl = await fetchJxPlayUrlHelper(snifferMode.type, snifferMode.type === 'custom' ? `${snifferMode.url}${snifferUrl}` : snifferUrl);
        if (playerUrl) callSysPlayer(playerUrl);
        return;
      }
    }
    switch (type) {
      case 2:
        // drpy免嗅
        playerUrl = await fetchDrpyPlayUrlHelper(formData.value, url);
        break;
      case 6:
        // hipy获取服务端播放链接
        playerUrl = await fetchHipyPlayUrlHelper(formData.value, active.flimSource, url);
        break;
      case 7:
        // t3获取服务端播放链接
        playerUrl = await fetchT3PlayUrlHelper(active.flimSource, url, []);
        break;
      case 8:
        // catvod获取服务端播放链接
        playerUrl = await fetchCatvodPlayUrlHelper(formData.value, active.flimSource, url);
        break;
    }
  }

  if (!playerUrl) playerUrl = url;

  if (playerUrl) {
    const mediaType = await checkMediaType(playerUrl);
    console.log(`[detail][mediaType]${mediaType}`)
    if (mediaType !== 'unknown' && mediaType !== 'error') {
      callSysPlayer(playerUrl);
      return;
    }
  }

  // 兜底办法:嗅探
  console.log(`[detail][sniffer][reveal]尝试提取播放链接,type:${type}`);
  try {
    MessagePlugin.info('嗅探资源中, 如10s没有结果请换源,咻咻咻!');
    playerUrl = await sniffer(snifferMode.type, snifferMode.type === 'custom' ? `${snifferMode.url}${url}` : url);
    if (playerUrl) callSysPlayer(playerUrl);
  } catch (err) {
    console.error(err);
  };
};

const callSysPlayer = (url: string): void => {
  const playerMode = set.value.playerMode;
  window.electron.ipcRenderer.send('call-player', playerMode.external, url);
  putHistoryData();
};

// 在追
const bingeEvent = async (): Promise<void> => {
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
      if (!db) await addStar(doc);
    } else {
      if (db) await delStar(db.id);
    }

    isVisible.binge = !isVisible.binge;
  } catch (err) {
    console.error(`[detail][binge][error]${err}`);
    MessagePlugin.error(`操作失败:${err}`);
  }
};

// 获取是否收藏
const getBinge = async (): Promise<void> => {
  const { id } = formData.value;
  const { vod_id } = info.value;
  const res = await detailStar({ relateId: id, videoId: vod_id });
  isVisible.binge = !res;
};

// 选择倒序
const reverseOrderEvent = (): void => {
  reverseOrder.value = !reverseOrder.value;
  if (reverseOrder.value) {
    console.log('[detail][season]正序');
    season.value = JSON.parse(JSON.stringify(info.value.fullList));
  } else {
    console.log('[detail][season]倒序');
    for (const key in season.value) {
      season.value[key].reverse();
    }
  }
};

// 获取历史
const getHistoryData = async (): Promise<void> => {
  try {
    const { id } = formData.value;
    const res = await detailHistory({ relateId: id, videoId: info.value.vod_id });
    
    if (res) {
      dataHistory.value = { ...res };
      active.flimSource = res.siteSource;
      active.filmIndex = res.videoIndex;
    };
  } catch (err) {
    console.error(`[detail][history][error]${err}`);
  }
};

// 更新历史
const putHistoryData = async (): Promise<void> => {
  try {
    const { id } = formData.value;
    const res = await detailHistory({ relateId: id, videoId: info.value["vod_id"] });
    const doc = {
      date: moment().unix(),
      type: 'film',
      relateId: id,
      siteSource: active.flimSource,
      playEnd: false,
      videoId: info.value["vod_id"],
      videoImage: info.value["vod_pic"],
      videoName: info.value["vod_name"],
      videoIndex: active.filmIndex,
      watchTime: 0,
      duration: null,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
    };

    if (res) {
      if (res.siteSource !== active.flimSource || res.videoIndex !== active.filmIndex) {
        await updateHistory(res.id, doc);
        dataHistory.value = { ...doc, id: res.id };
      } else {
        dataHistory.value = { ...res };
      }
    } else {
      const add_res = await addHistory(doc);
      dataHistory.value = add_res;
    }
  } catch (err) {
    console.error(`[detail][history][error]${err}`);
  }
};

// 获取播放源及剧集
const getDetailInfo = async (): Promise<void> => {
  const videoList = info.value;

  // 播放源
  const playFrom = videoList["vod_play_from"];
  const playSource = playFrom.split('$').filter(Boolean);
  const [source] = playSource;

  if (!active.flimSource) active.flimSource = source;

  // 剧集
  const playUrl = videoList["vod_play_url"];
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

  if (!active.filmIndex) active.filmIndex = playEpisodes[0][0];

  // 合并播放源和剧集
  const fullList: Record<string, string[][]> = Object.fromEntries(
    playSource.map((key, index) => [key, playEpisodes[index]])
  );

  videoList.fullList = fullList;
  info.value = videoList;
  season.value = fullList;
};

// 格式化剧集名称
const formatName = (item: string): string => {
  const [first] = item.split('$');
  return first.includes('http') ? '正片' : first;
};

// 格式化剧集集数
const formatIndex = (item) => {
  const [index, url] = item.split('$');
  return { index, url };
};

// 替换style
const filterContent = (item: string | undefined | null): string => {
  if (!item) return '';
  return item.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};
</script>

<style lang="less" scoped>
.view-container {
  height: calc(100% - 48px);

  .plist-body {
    .detail-title {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;

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

          .tag-items {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: stretch;

            .tag-item {
              margin-right: var(--td-comp-margin-xs);
            }
          }
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

        .tip {
          vertical-align: top;
          line-height: 25px;
          text-align: center;
          margin-left: 4px;
        }
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

    .box-anthology-items {
      .film-tabs {
        .tag {
          cursor: pointer;
        }
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
