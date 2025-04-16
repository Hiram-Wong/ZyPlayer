<template>
  <div class="history" id="back-top" ref="contentRef">
    <div class="filter_box" v-if="options.ago.length > 0 && options.week.length > 0 && options.today.length > 0"
      @click="clearEvent">
      <span class="icon_btn pos clear">
        <delete-icon /> {{ $t('pages.chase.history.clearAll') }}
      </span>
    </div>
    <div v-for="(item, name, index) in options" :key="index" class="container-item">
      <template v-if="item.length !== 0">
        <div class="container-item-header">
          <span class="title">{{ translateDate[name] }}</span>
        </div>
        <div class="container-item-main">
          <t-row :gutter="[16, 16]" style="margin: 0;">
            <t-col :md="3" :lg="3" :xl="2" :xxl="1" v-for="detail in item" :key='detail["id"]' class="card"
              @click="playEvent(detail)">
              <div class="card-close" @click.stop="removeEvent(detail)">
                <delete-icon />
              </div>
              <div class="card-main">
                <div class="card-tag card-tag-orange">
                  <span class="card-tag-text text-hide">{{ $t(`pages.chase.type.${detail["type"]}`) }}</span>
                </div>
                <t-image class="card-main-item" :src='detail["videoImage"]'
                  :style="{ width: '100%', background: 'none', overflow: 'hidden' }" :lazy="true" fit="cover"
                  :loading="renderLoading" :error="renderError">
                  <template #overlayContent>
                    <div class="op">
                      <div class="op-box">
                        <span>{{ detail?.["relateSite"]?.["name"] ? detail["relateSite"]["name"] : $t('pages.chase.sourceDeleted') }}</span>
                      </div>
                    </div>
                  </template>
                </t-image>
              </div>
              <div class="card-footer">
                <p class="card-footer-title text-hide">
                  <span>{{ detail["videoName"] }}</span>
                  <span v-if="['film'].includes(detail['type'])">{{ formatIndex(detail["videoIndex"]).index }}</span>
                </p>
                <p class="card-footer-desc tiles-item_desc_row text-hide">
                  <laptop-icon size="14px" class="tiles-item_watch_pc icon" />
                  <span class="tiles-item_desc_watch" v-if='detail["playEnd"]'>{{ $t('pages.chase.progress.watched')
                    }}</span>
                  <span class="tiles-item_desc_watch" v-else>
                    {{ $t('pages.chase.progress.watching') }}{{ formatProgress(detail["watchTime"],
                      detail["duration"]) }}
                  </span>
                </p>
              </div>
            </t-col>
          </t-row>
        </div>
      </template>
    </div>

    <infinite-loading class="infinite-loading-container" :identifier="infiniteId" :duration="200" @infinite="load">
      <template #complete>{{ $t('pages.chase.infiniteLoading.noMore') }}</template>
      <template #error>{{ $t('pages.chase.infiniteLoading.error') }}</template>
    </infinite-loading>
    <detail-view v-model:visible="isVisible.detail" :ext="detailFormData.ext" :info="detailFormData.info" />
    <t-loading :attach="`.${prefix}-content`" size="medium" :text="$t('pages.setting.loading')"
      :loading="isVisible.loading" />
    <t-back-top container="#back-top" size="small" :offset="['1.4rem', '0.5rem']" :duration="2000" />

  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import { size, reject } from 'lodash-es';
import moment from 'moment';
import { DeleteIcon, LaptopIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { computed, onActivated, ref, reactive } from 'vue';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';

import { delHistory, fetchHistoryPage } from '@/api/history';
import { fetchCmsDetail, fetchCmsInit } from '@/api/site';
import { putAlistInit, fetchAlistDir, fetchAlistFile } from '@/api/drive';
import { fetchIptvActive, fetchChannelDetail } from '@/api/iptv';
import { fetchAnalyzeHelper } from '@/utils/common/film';
import { base64 } from '@/utils/crypto';

import { formatIndex } from '@/utils/common/film';
import emitter from '@/utils/emitter';

import DetailView from '@/pages/film/components/Detail.vue';

const storePlayer = usePlayStore();

const renderError = () => {
  return (
    <div class="renderIcon" style="width: 100%;">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="width: 100%;">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};

const translateDate = computed(() => {
  return {
    today: t('pages.chase.date.today'),
    week: t('pages.chase.date.week'),
    ago: t('pages.chase.date.ago'),
  }
});

const options = ref({
  today: [],
  week: [],
  ago: [],
});
const pagination = ref({
  pageIndex: 1,
  pageSize: 32,
  count: 0,
});
const detailFormData = ref({
  info: {},
  ext: { site: {}, setting: {} },
}); //  详情组件源传参
const isVisible = reactive({
  detail: false,
  loading: false
});
const infiniteId = ref(+new Date());

onActivated(() => {
  const isListenedRefreshHistory = emitter.all.get('refreshHistory');
  if (!isListenedRefreshHistory) emitter.on('refreshHistory', refreshHistory);
});

const getHistoryList = async () => {
  let length = 0;
  const { pageIndex, pageSize } = pagination.value;
  try {
    const res = await fetchHistoryPage({ page: pageIndex, pageSize, type: ['film', 'iptv', 'drive', 'analyze'] });

    if (res?.list && Array.isArray(res?.list) && res?.list?.length > 0) {
      for (const item of res.list) {
        const timeDiff = filterDate(item.date);
        let timeKey;
        if (timeDiff === 0) timeKey = 'today';
        else if (timeDiff < 7) timeKey = 'week';
        else timeKey = 'ago';
        options.value[timeKey].push(item);
      };
      pagination.value.count = res.total;
      pagination.value.pageIndex++;
      length = res.list.length || 0;
    }
    return length;
  } catch (err) {
    console.error(err);
    length = 0;
  } finally {
    console.log(`[history] load data length: ${length}`);
    return length;
  }
};

const load = async ($state) => {
  console.log('[history] loading...');

  try {
    const resLength = await getHistoryList();
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.log(err);
    $state.error();
  }
};

const handleFilmPlay = async (item) => {
  const { videoName, videoImage, videoId, relateSite } = item;
  await fetchCmsInit({ sourceId: relateSite.id });
  const response = await fetchCmsDetail({ sourceId: relateSite.id, id: videoId });
  const info = response?.list[0];
  if (!info?.vod_name) info.vod_name = videoName;
  if (!info?.vod_pic) info.vod_pic = videoImage;
  if (!info?.vod_id) info.vod_id = videoId;
  const doc = {
    info: { ...info },
    ext: { site: relateSite, setting: storePlayer.setting },
  };
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    detailFormData.value = doc;
    isVisible.detail = true;
  } else {
    storePlayer.updateConfig({ type: 'film', status: true, data: doc });
    window.electron.ipcRenderer.send('open-play-win', videoName);
  }
};

const handleIptvPlay = async (item) => {
  const { videoName, videoId, videoImage, relateSite } = item;
  const infoData = await fetchChannelDetail(videoId);
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    window.electron.ipcRenderer.send('call-player', playerMode.external, infoData.url);
  } else {
    const response = await fetchIptvActive();
    const { epg, markIp, logo } = response["ext"];
    const doc = {
      info: { id: videoId, logo: videoImage, name: videoName, url: infoData.url, group: infoData.group },
      ext: { epg, markIp, logo, site: relateSite, setting: storePlayer.setting },
    };
    storePlayer.updateConfig({ type: 'iptv', status: true, data: doc });
    window.electron.ipcRenderer.send('open-play-win', videoName);
  }
};

const handleDrivePlay = async (item) => {
  const { videoName, videoImage, videoId, siteSource, relateSite } = item;
  await putAlistInit({ sourceId: relateSite.id });
  const infoData = await fetchAlistFile({ path: base64.decode(videoId), sourceId: relateSite.id });
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    window.electron.ipcRenderer.send('call-player', playerMode.external, infoData.url);
  } else {
    const dirData = await fetchAlistDir({ path: siteSource, sourceId: relateSite.id });
    const doc = {
      info: {
        id: videoId, name: videoName, url: infoData.url,
        thumb: videoImage, remark: infoData.remark,  path: siteSource,
      },
      ext: { files: dirData?.list || [], site: relateSite }
    };
    storePlayer.updateConfig({ type: 'drive', status: true, data: doc });
    window.electron.ipcRenderer.send('open-play-win', videoName);
  }
};

const handleAnalyzePlay = async (item) => {
  const { relateSite, videoName, videoId } = item;
  const url = videoId;
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    const response = await fetchAnalyzeHelper(`${relateSite.url}${url}`, relateSite.type);
    if (!response.url) {
      MessagePlugin.error(t('pages.analyze.message.error'));
      return;
    };
    window.electron.ipcRenderer.send('call-player', playerMode.external, response.url);
  } else {
    const doc = {
      info: { id: videoId, url, name: videoName },
      ext: { site: relateSite, setting: storePlayer.setting },
    };
    storePlayer.updateConfig({ type: 'analyze', status: true, data: doc });
    window.electron.ipcRenderer.send('open-play-win', videoName);
  };
};

// 播放
const playEvent = async (item) => {
  isVisible.loading = true;

  try {
    const { type } = item;
    const methpodMap = {
      film: handleFilmPlay,
      iptv: handleIptvPlay,
      drive: handleDrivePlay,
      analyze: handleAnalyzePlay,
    };
    await methpodMap[type](item);
  } catch (err) {
    console.error(`[history][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  } finally {
    isVisible.loading = false;
  }
};

// 删除
const removeEvent = async (item) => {
  const { id } = item;
  const timeDiff = filterDate(item.date);
  let timeKey;
  delHistory({ids:[id]});
  if (timeDiff === 0) timeKey = 'today';
  else if (timeDiff < 7) timeKey = 'week';
  else timeKey = 'ago';
  options.value[timeKey] = reject(options.value[timeKey], { id });
  pagination.value.count--;
};

const clearEvent = () => {
  const handleClear = () => {
    delHistory({type: 'film'});
    defaultSet();
    confirmDia.hide();
  };

  const confirmDia = DialogPlugin({
    body: t('pages.chase.dialog.clearAll.body'),
    header: t('pages.chase.dialog.clearAll.header'),
    width: '340px',
    placement: 'center',
    closeBtn: '',
    confirmBtn: t('pages.chase.dialog.confirm'),
    cancelBtn: t('pages.chase.dialog.cancel'),
    onConfirm: handleClear,
    onClose: () => confirmDia.hide(),
  });
};

// 日期计算
const filterDate = (date) => {
  const timeToday = moment().format('YYYY-MM-DD');
  const timeSource = moment.unix(date).format('YYYY-MM-DD'); // Parse Unix timestamp
  const timeDiff = moment(timeToday).diff(timeSource, 'days');
  return timeDiff;
};

// 播放进度
const formatProgress = (start, all) => {
  const progress = Math.trunc((start / all) * 100);
  return progress ? `${progress}%` : '0%';
};

const defaultSet = () => {
  options.value = {
    today: [],
    week: [],
    ago: [],
  };
  if (!size(options.value)) infiniteId.value++;
  pagination.value.pageIndex = 1;
};

const refreshHistory = () => {
  console.log('[history][bus][refresh]');
  defaultSet();
};
</script>

<style lang="less" scoped>
.history {
  width: 100%;
  height: 100%;
  position: relative;

  .filter_box {
    position: absolute;
    top: 10px;
    right: 5px;
    z-index: 11;

    .pos {
      cursor: pointer;
    }

    .icon_btn {
      font-size: 12px;
      // color: rgba(132, 133, 141, 0.8);
      letter-spacing: 0;
      line-height: 16px;
      user-select: none;
      padding-left: 20px;
      position: relative;

      svg {
        position: absolute;
        left: 0;
        bottom: 2px;
      }
    }

    .clear {
      margin-left: 20px;
    }

    &:hover {
      .icon_btn {
        color: var(--td-text-color-primary);
      }
    }
  }

  .container-item {
    .container-item-header {
      height: 40px;
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: var(--td-bg-color-container);

      .title {
        display: inline-block;
        padding-right: 18px;
        vertical-align: middle;
        line-height: 40px;
        font-size: 20px;
        font-weight: 700;
        text-align: left;
      }
    }

    .container-item-main {

      .card {
        box-sizing: border-box;
        width: inherit;
        position: relative;
        cursor: pointer;
        border-radius: var(--td-radius-medium);

        &:hover {
          .card-close {
            display: flex;
          }

          .card-main {
            .card-main-item {
              overflow: hidden;

              :deep(img) {
                transition: all 0.25s ease-in-out;
                transform: scale(1.05);
              }
            }
          }

          .card-footer {
            .card-footer-title {
              transition: all 0.25s ease-in-out;
              color: var(--td-brand-color);
            }
          }
        }

        .card-close {
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          position: absolute;
          right: 8px;
          height: 28px;
          width: 28px;
          z-index: 9;
          background-color: rgba(22, 24, 35, .8);
          border-radius: 0 var(--td-radius-medium);

          svg {
            color: var(--td-gray-color-5);
          }

          &:hover {
            svg {
              color: var(--td-brand-color);
            }
          }
        }

        .text-hide {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }

        .card-main {
          position: relative;
          width: 100%;
          height: 0;
          border-radius: 7px;
          padding-top: 62%;

          .card-tag-orange {
            background: #ffdd9a;
            color: #4e2d03;
          }

          .card-tag {
            z-index: 9;
            position: absolute;
            left: 0;
            top: 0;
            border-radius: 6px 0 6px 0;
            padding: 1px 6px;
            max-width: 60%;

            .card-tag-text {
              font-size: 12px;
              height: 18px;
              line-height: 18px;
            }
          }

          .card-main-item {
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            width: 100%;
            height: 100%;
            border-radius: var(--td-radius-default);

            .op {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              background: linear-gradient(to bottom, rgba(22, 24, 35, 0.4) 0%, rgba(22, 24, 35, .8) 100%);

              .op-box {
                padding: var(--td-comp-paddingTB-xs) 0;
                background: linear-gradient(to right,
                    rgba(255, 255, 255, 0),
                    rgba(255, 255, 255, 0.4) 30%,
                    rgba(255, 255, 255, 0.4) 70%,
                    rgba(255, 255, 255, 0));
                ;

                span {
                  text-align: center;
                  display: inline-block;
                  width: 100%;
                  color: #fdfdfd;
                  font-weight: 500;
                }
              }
            }
          }
        }

        .card-footer {
          position: relative;
          padding-top: var(--td-comp-paddingTB-xs);

          .card-footer-title {
            font-weight: 700;
            line-height: var(--td-line-height-title-medium);
            height: 22px;
          }

          .card-footer-desc {
            font-size: 12px;
            color: var(--td-text-color-placeholder);
            align-items: center;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            position: relative;

            .icon {
              margin-right: var(--td-comp-margin-xs);
            }
          }
        }
      }
    }
  }
}
</style>
