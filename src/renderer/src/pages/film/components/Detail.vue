<template>
  <t-dialog v-model:visible="formVisible" width="70%" placement="center" :footer="false">
    <template #body>
      <div class="detail view-container">
        <div class="plist-body">
          <div class="intro-wrap">
            <div class="left">
              <t-image
                class="card-main-item"
                :src="info.vod_pic"
                fit="cover"
                shape="round"
                :style="{ width: '120px', height: '100%' }"
                :lazy="true"
                :loading="renderLoading"
                :error="renderError"
              />
            </div>
            <div class="right">
              <div class="info">
                <p class="name txthide2">{{ info.vod_name }}</p>
                <p class="info-item">
                  <span class="label">{{ $t('pages.film.info.release') }}: {{ info?.vod_year || $t('pages.film.info.unknown') }}</span>
                </p>
                <p class="info-item">
                  <span class="label">{{ $t('pages.film.info.type') }}: {{ info?.type_name || $t('pages.film.info.unknown') }}</span>
                </p>
                <p class="info-item">
                  <span class="label">{{ $t('pages.film.info.area') }}: {{ info?.vod_area || $t('pages.film.info.unknown') }}</span>
                </p>
              </div>
              <div class="add-box" @click="putBinge(false)">
                <div class="add">
                  <heart-icon class="icon" v-if="active.binge" />
                  <heart-filled-icon class="icon" v-else />
                </div>
              </div>

            </div>
          </div>
        </div>
        <div class="plist-listbox">
          <div class="box-anthology-header">
            <div class="left">
              <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
              <div class="box-anthology-line">
                <t-dropdown placement="bottom" :max-height="250">
                  <t-button size="small" theme="default" variant="text" auto-width>
                    <span class="title">{{ $t('pages.player.film.line') }}</span>
                    <template #suffix>
                      <chevron-down-icon size="16" />
                    </template>
                  </t-button>
                  <t-dropdown-menu>
                    <t-dropdown-item v-for="(_, key, index) in seasonData" :key="index" :value="key"
                      @click="(options) => switchLineEvent(options.value as string)">
                      <span :class="[key as any === active.flimSource ? 'active' : '']">{{ key }}</span>
                    </t-dropdown-item>
                  </t-dropdown-menu>
                </t-dropdown>
              </div>
              <div class="box-anthology-analyze" v-show="active.official">
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
                <order-descending-icon v-if="active.reverseOrder" size="1.2em" />
                <order-ascending-icon v-else size="1.2em" />
              </div>
            </div>
          </div>
          <div class="listbox">
            <div class="tag-container">
              <div v-for="(item, index) in seasonData?.[active.flimSource]" :key="item"
                :class='["mainVideo-num", item === active.filmIndex ? "mainVideo-selected" : ""]'
                @click="gotoPlay(item)">
                <t-tooltip :content="formatName(item)">
                  <div class="mainVideo_inner">
                    {{ formatReverseOrder(active.reverseOrder ? 'positive' : 'negative', index,
                      seasonData?.[active.flimSource]?.length)
                    }}
                    <div class="playing"></div>
                  </div>
                </t-tooltip>
              </div>
            </div>
            <!-- <t-tabs v-model="active.flimSource" class="film-tabs">
              <t-tab-panel v-for="(value, key, index) in seasonData" :key="index" :value="key" :label="key">
                <div class="tag-container">
                  <div v-for="(item, index) in value" :key="item"
                    :class='["mainVideo-num", item === active.filmIndex ? "mainVideo-selected" : ""]'
                    @click="gotoPlay(item)">
                    <t-tooltip :content="formatName(item)">
                      <div class="mainVideo_inner">
                        {{ formatReverseOrder(active.reverseOrder ? 'positive' : 'negative', index, value.length) }}
                        <div class="playing"></div>
                      </div>
                    </t-tooltip>
                  </div>
                </div>
              </t-tab-panel>
            </t-tabs> -->
          </div>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="tsx">
import lazyImg from '@/assets/lazy.png';
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

const renderError = () => {
  return (
    <div class="renderIcon" style="height: 100%">
      <img src={lazyImg} style="height: 100%; object-fit: cover;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="height: 100%">
      <img src={lazyImg} style="height: 100%; object-fit: cover;" />
    </div>
  );
};

const storePlayer = usePlayStore();
const set = computed(() => {
  return storePlayer.getSetting;
});
const formVisible = ref(false);
const info = ref(props.data);
const formData = ref(props.site);
const bingeData = ref<{ [key: string]: any }>({});
const historyData = ref<{ [key: string]: any }>({});
const seasonData = ref<{ [key: string]: any }>({});
const dataAnalyze = ref({
  default: { url: '' },
  flag: [],
  active: []
}) as any;

const active = reactive({
  binge: false,
  reverseOrder: true,
  official: false,
  flimSource: '',
  filmIndex: '',
  analyzeId: ''
})

const snifferAnalyze = computed(() => {
  const analyzeSource = active.analyzeId
    ? dataAnalyze.value.active.find(item => item.id === active.analyzeId)
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
  active.official = active.binge = false;
  active.reverseOrder = true;
  seasonData.value = [];
  historyData.value = bingeData.value = dataAnalyze.value = {};
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

const filmPlayAndHandleResponse = async (url, site, analyze, flimSource, skipAd) => {
  MessagePlugin.info(t('pages.player.message.play'));
  const response = await playHelper(url, site, analyze, flimSource, skipAd);
  active.official = response!.isOfficial;

  if (response?.url) {
    if (active.official) {
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
  const analyze = snifferAnalyze.value;

  const response = await filmPlayAndHandleResponse(url, formData.value, analyze, active.flimSource, false);
  if (response?.url) callSysPlayer(response!.url);
};

const switchLineEvent = async (id: string) => {
  active.flimSource = id;
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
  const { key } = formData.value;
  const { vod_id } = info.value;
  const response = await fetchBingeData(key, vod_id);
  bingeData.value = response.data;
  active.binge = !response.status;
};

// 更新收藏
const putBinge = async (update: boolean = false) => {
  const constructDoc = () => ({
    relateId: formData.value.key,
    videoId: info.value.vod_id,
    videoImage: info.value.vod_pic,
    videoName: info.value.vod_name,
    videoType: info.value.type_name,
    videoRemarks: info.value.vod_remarks,
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
        videoImage: "",
        videoName: "",
        videoType: "",
        videoRemarks: "",
        id: null
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

  if (!update) active.binge = !active.binge;
};

// 选集排序
const reverseOrderEvent = () => {
  active.reverseOrder = !active.reverseOrder;
  if (active.reverseOrder) {
    seasonData.value = reverseOrderHelper('positive', info.value.fullList);
  } else {
    seasonData.value = reverseOrderHelper('negative', seasonData.value);
  }
};

// 获取历史
const fetchHistory = async (): Promise<void> => {
  const response = await fetchHistoryData(formData.value.key, info.value.vod_id);
  historyData.value = response;
  if (response.siteSource) active.flimSource = response.siteSource;
  if (response.videoIndex) active.filmIndex = response.videoIndex;
};

// 更新历史
const putHistory = async (): Promise<void> => {
  const doc = {
    date: moment().unix(),
    type: 'film',
    relateId: formData.value.key,
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

  const response: any = await putHistoryData(historyData.value?.id, doc);
  historyData.value = response;
};

// 获取播放源及剧集
const getDetailInfo = async (): Promise<void> => {
  const formattedSeason = await formatSeason(info.value);

  active.flimSource = active.flimSource || Object.keys(formattedSeason)[0];
  active.filmIndex = active.filmIndex || formattedSeason[active.flimSource][0];

  info.value.fullList = formattedSeason;
  seasonData.value = formattedSeason;
};
</script>

<style lang="less" scoped>
.view-container {
  height: calc(100% - 48px);

  .nowrap {
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    height: auto;
    width: auto;
    font-weight: normal;
  }

  .plist-body {
    height: 165px;

    .detail-title {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .detail-info {
        max-width: 80%;

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
            align-items: center;
            width: inherit;
            overflow: visible;
            position: relative;

            .tag-item {
              margin-right: var(--td-comp-margin-xs);
              max-width: 30%;
            }
          }
        }
      }

      .binge {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--td-text-color-primary);
        background-color: var(--td-bg-color-component);
        border-radius: 36px;
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
      // padding: 10px 0 5px 0;
      position: relative;
      width: 100%;
      height: 100%;
      font-size: 14px;
      line-height: 20px;
      display: flex;
      flex-direction: row;

      .left {
        width: 120px;
        display: block;
        position: relative;
        height: 100%;
        margin-right: 12px;
      }

      .right {
        // width: calc(100% - 120px);
      }

      .info {
        .name {
          margin-bottom: var(--td-comp-margin-s);
          color: var(--td-text-color-primary);
          font-weight: 700;
          font-size: 26px;
          line-height: 36px;
        }
        .info-item {
          overflow: hidden;
          -o-text-overflow: ellipsis;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          line-height: 24px;
          color: var(--td-text-color-secondary);
        }
      }
      .add-box {
        position: absolute;
        bottom: 0;
        .add {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--td-text-color-secondary);
          background-color: var(--td-bg-color-component);
          border-radius: 20px;
          width: 40px;
          height: 36px;
          text-align: center;
          &:hover {
            color: var(--td-text-color-primary);
          }
          .icon {
            width: 20px;
            height: 20px;
          }
        }
      }

      .content-wrap {
        width: 80%;
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

        .box-anthology-line,
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
      overflow: hidden;

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
            background-color: var(--td-bg-container);
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
