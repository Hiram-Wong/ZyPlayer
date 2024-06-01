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
              <div class="video-subscribe-text" @click="putBinge(false)">
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
                    <span v-html="formatContent(info.vod_content)"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="plist-listbox">
          <div class="box-anthology-header">
            <div class="left">
              <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
              <div class="box-anthology-analyze" v-show="isVisible.official">
                <t-dropdown placement="bottom" :max-height="250">
                  <t-button size="small" theme="default" variant="text" auto-width>
                    <span>{{ $t('pages.player.film.analyze') }}</span>
                    <template #suffix>
                      <chevron-down-icon size="16" />
                    </template>
                  </t-button>
                  <t-dropdown-menu>
                    <t-dropdown-item v-for="item in dataAnalyze.active" :key="item.id" :value="item.id"
                      @click="(options) => switchAnalyzeEvent(options.value as string)">
                      <span :class="[item.id === active.analyzeId ? 'active' : '']">{{ item.name }}</span>
                    </t-dropdown-item>
                  </t-dropdown-menu>
                </t-dropdown>
              </div>
            </div>
            <div class="right">
              <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
                <order-descending-icon v-if="isVisible.reverseOrder" size="1.2em" />
                <order-ascending-icon v-else size="1.2em" />
              </div>
            </div>
          </div>
          <div class="listbox">
            <t-tabs v-model="active.flimSource" class="film-tabs">
              <t-tab-panel v-for="(value, key, index) in season" :key="index" :value="key" :label="key">
                <div class="tag-container">
                  <div v-for="(item, index) in value" :key="item"
                    :class='["mainVideo-num", item === active.filmIndex ? "mainVideo-selected" : ""]'
                    @click="gotoPlay(item)">
                    <t-tooltip :content="formatName(item)">
                      <div class="mainVideo_inner">
                        {{ formatReverseOrder(isVisible.reverseOrder ? 'positive' : 'negative', index, value.length) }}
                        <div class="playing"></div>
                      </div>
                    </t-tooltip>
                  </div>
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
import _ from 'lodash';
import moment from 'moment';
import {
  ChevronDownIcon,
  HeartIcon,
  HeartFilledIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive, watch, computed } from 'vue';

import { usePlayStore } from '@/store';
import { t } from '@/locales';

import {
  fetchBingeData,
  putBingeData,
  fetchHistoryData,
  putHistoryData,
  fetchAnalyzeData,
  playHelper,
  reverseOrderHelper,
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder
} from '@/utils/common/film';

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
const season = ref(); // 选集
const dataHistory = ref({}) as any; // 历史
const dataBinge = ref({}) as any;
const dataAnalyze = ref({
  default: { url: '' },
  flag: [],
  active: []
}) as any;

const isVisible = reactive({
  binge: false,
  reverseOrder: true,
  official: false
})

const active = reactive({
  flimSource: '',
  filmIndex: '',
  analyzeId: ''
})

const snifferAnalyze = computed(() => {
  const analyzeSource = active.analyzeId
    ? _.find(dataAnalyze.value.active, { id: active.analyzeId })
    : dataAnalyze.value.default;

  const data = {
    flag: dataAnalyze.value.flag,
    name: analyzeSource.name,
    url: analyzeSource.url,
    type: analyzeSource.type,
  };
  return data;
});

const emit = defineEmits(['update:visible']);

const loadData = () => {
  fetchBinge();
  fetchHistory();
  fetchAnalyze();
}

const resetStates = () => {
  active.flimSource = active.filmIndex = active.analyzeId = '';
  isVisible.official = isVisible.binge = false;
  isVisible.reverseOrder = true;
  season.value = [];
  dataHistory.value = dataBinge.value = dataAnalyze.value = {};
}

watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);

    if (val) loadData();
    else resetStates();
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

// 获取解析
const fetchAnalyze = async (): Promise<void> => {
  const response = await fetchAnalyzeData();
  dataAnalyze.value = response;

  if (response.default?.id) active.analyzeId = response.default?.id;
};

const filmPlayAndHandleResponse = async (snifferMode, url, site, analyze, flimSource, skipAd) => {
  MessagePlugin.info(t('pages.player.message.play'));
  const response = await playHelper(snifferMode, url, site, analyze, flimSource, skipAd);
  isVisible.official = response!.isOfficial;

  if (response?.url) {
    if (isVisible.official) {
      if (analyze?.name) MessagePlugin.info(t('pages.player.message.official', [analyze.name]));
      else MessagePlugin.warning(t('pages.player.message.noDefaultAnalyze'));
    }
  } else MessagePlugin.error(t('pages.player.message.sniiferError'));

  return response;
};

// 调用本地播放器 + 历史
const gotoPlay = async (item) => {
  let { url } = formatIndex(item);
  url = decodeURIComponent(url);
  active.filmIndex = item;
  const { snifferMode } = set.value;
  const analyze = snifferAnalyze.value;

  const response = await filmPlayAndHandleResponse(snifferMode, url, formData.value, analyze, active.flimSource, false);
  if (response?.url) callSysPlayer(response!.url);
};

// 切换解析接口
const switchAnalyzeEvent = (id: string) => {
  active.analyzeId = id;
  if (active.filmIndex) gotoPlay(active.filmIndex);
};

const callSysPlayer = (url: string): void => {
  const playerMode = set.value.playerMode;
  window.electron.ipcRenderer.send('call-player', playerMode.external, url);
  putHistory();
};

// 获取收藏
const fetchBinge = async () => {
  const { id } = formData.value;
  const { vod_id } = info.value;
  const response = await fetchBingeData(id, vod_id);
  dataBinge.value = response.data;
  isVisible.binge = !response.status;
};

// 更新收藏
const putBinge = async (update: boolean = false) => {
  const constructDoc = () => ({
    relateId: formData.value.id,
    videoId: info.value.vod_id,
    videoImage: info.value.vod_pic,
    videoName: info.value.vod_name,
    videoType: info.value.type_name,
    videoRemarks: info.value.vod_remarks,
  });

  let response: any;

  if (dataBinge.value?.id) {
    if (update) {
      response = await putBingeData('update', dataBinge.value.id, constructDoc());
      if (response?.data) dataBinge.value = response.data;
    } else {
      response = await putBingeData('del', dataBinge.value.id, {});
      dataBinge.value = {
        relateId: null,
        videoId: 0,
        videoImage: "",
        videoName: "",
        videoType: "",
        videoRemarks: "",
        id: null
      };
    }
  } else if (!update) {
    response = await putBingeData('add', '', constructDoc());
    if (response?.data) dataBinge.value = response.data;
  }

  if (response && !response.status) {
    MessagePlugin.error(t('pages.player.message.error'));
    return;
  }

  if (!update) isVisible.binge = !isVisible.binge;
};

// 选集排序
const reverseOrderEvent = () => {
  isVisible.reverseOrder = !isVisible.reverseOrder;
  if (isVisible.reverseOrder) {
    season.value = reverseOrderHelper('positive', info.value.fullList);
  } else {
    season.value = reverseOrderHelper('negative', season.value);
  }
};

// 获取历史
const fetchHistory = async (): Promise<void> => {
  const response = await fetchHistoryData(formData.value.id, info.value.vod_id);
  dataHistory.value = response;
  if (response.siteSource) active.flimSource = response.siteSource;
  if (response.videoIndex) active.filmIndex = response.videoIndex;
};

// 更新历史
const putHistory = async (): Promise<void> => {
  const doc = {
    date: moment().unix(),
    type: 'film',
    relateId: formData.value.id,
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

  const response = await putHistoryData(dataHistory.value?.id, doc);
  dataHistory.value = response;
};

// 获取播放源及剧集
const getDetailInfo = async (): Promise<void> => {
  const formattedSeason = await formatSeason(info.value);

  active.flimSource = active.flimSource || Object.keys(formattedSeason)[0];
  active.filmIndex = active.filmIndex || formattedSeason[active.flimSource][0];

  info.value.fullList = formattedSeason;
  season.value = formattedSeason;
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
      font-size: 16px;
      line-height: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--td-text-color-primary);

      .left {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-end;

        .mg-left {
          margin-left: var(--td-comp-margin-xs);
        }

        .box-anthology-title {
          white-space: nowrap;
          position: relative;
          font-size: 18px;
          line-height: 25px;
          font-weight: 600;
        }

        .box-anthology-analyze {
          :deep(.t-button) {
            padding: 0;
          }

          :deep(.t-button:not(.t-is-disabled):not(.t-button--ghost)) {
            --ripple-color: transparent;
          }

          :deep(.t-button--variant-text) {
            .t-button__suffix {
              margin-left: var(--td-comp-margin-xxs);
            }

            .t-button__text {
              &:before {
                content: "";
                width: 1px;
                margin: 0 var(--td-comp-margin-xs);
                background: linear-gradient(180deg, transparent, var(--td-border-level-1-color), transparent);
              }
            }

            &:hover,
            &:focus-visible {
              background-color: transparent !important;
              border-color: transparent !important;
              color: var(--td-brand-color);
            }
          }
        }
      }

      .right {
        .box-anthology-reverse-order {
          cursor: pointer;
        }
      }
    }

    .listbox {
      .film-tabs {
        .tag-container {
          display: flex;
          flex-wrap: wrap;
          padding-top: 10px;

          .mainVideo-num {
            position: relative;
            width: 41px;
            font-size: 18px;
            height: 41px;
            line-height: 41px;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            margin-bottom: 4px;
            margin-right: 4px;
            box-shadow: 0 2px 8px 0 rgba(0, 0, 0, .08);

            &:hover {
              background-image: linear-gradient(var(--td-brand-color-2), var(--td-brand-color-3));
            }

            &:before {
              content: "";
              display: block;
              position: absolute;
              top: 1px;
              left: 1px;
              right: 1px;
              bottom: 1px;
              border-radius: 8px;
              background-color: var(--td-bg-color-container);
              z-index: 2;
            }

            .mainVideo_inner {
              position: absolute;
              top: 1px;
              left: 1px;
              right: 1px;
              bottom: 1px;
              border-radius: 8px;
              z-index: 3;
              overflow: hidden;
              background-image: linear-gradient(hsla(0, 0%, 100%, .04), hsla(0, 0%, 100%, .06));

              .playing {
                display: none;
                min-width: 10px;
                height: 8px;
                background: url(@/assets/player/playon-green.gif) no-repeat;
              }
            }
          }

          .mainVideo-selected {
            color: var(--td-brand-color);
            background-image: linear-gradient(hsla(0, 0%, 100%, .1), hsla(0, 0%, 100%, .06));

            // box-shadow: 0 2px 8px 0 rgba(0,0,0,.08), inset 0 4px 10px 0 rgba(0,0,0,.14);
            .playing {
              display: inline-block !important;
              position: absolute;
              left: 6px;
              bottom: 6px;
            }
          }
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

.active {
  color: var(--td-brand-color);
}
</style>
