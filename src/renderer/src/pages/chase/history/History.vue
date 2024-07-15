<template>
  <div class="history view-container">
    <div class="content">
      <div class="container">
        <div class="content-wrapper">
          <div v-for="(item, name, index) in options" :key="index" class="container-item">
            <div v-if="item.length !== 0" class="time">
              <span v-if="name === 'today'" class="title">{{ $t('pages.chase.date.today') }}</span>
              <span v-if="name === 'week'" class="title">{{ $t('pages.chase.date.week') }}</span>
              <span v-if="name === 'ago'" class="title">{{ $t('pages.chase.date.ago') }}</span>
            </div>
            <div class="main">
              <t-row :gutter="[16, 16]">
                <t-col :md="3" :lg="3" :xl="2" :xxl="1" v-for="detail in item" :key='detail["id"]' class="card"
                  @click="playEvent(detail)">
                  <div class="card-main">
                    <div class="card-close" @click.stop="removeEvent(detail)"></div>
                    <t-image class="card-main-item" :src='detail["videoImage"]'
                      :style="{ width: '100%', background: 'none', overflow: 'hidden' }" :lazy="true" fit="cover"
                      :loading="renderLoading" :error="renderError">
                      <template #overlayContent>
                        <div class="op">
                          <span>{{ detail["siteName"] ? detail["siteName"] : $t('pages.chase.sourceDeleted') }}</span>
                        </div>
                      </template>
                    </t-image>
                  </div>
                  <div class="card-footer">
                    <p class="card-footer-title text-hide">{{ detail["videoName"] }} {{
                      formatIndex(detail["videoIndex"]).index }}</p>
                    <p class="card-footer-desc text-hide">
                      <laptop-icon size="1.3em" class="icon" />
                      <span v-if='detail["playEnd"]'>{{ $t('pages.chase.progress.watched') }}</span>
                      <span v-else>{{ $t('pages.chase.progress.watching') }} {{ formatProgress(detail["watchTime"],
                        detail["duration"])
                        }}</span>
                    </p>
                  </div>
                </t-col>
              </t-row>
            </div>
          </div>

          <infinite-loading :identifier="infiniteId" style="text-align: center" :duration="200" @infinite="load">
            <template #complete>{{ $t('pages.chase.infiniteLoading.complete') }}</template>
            <template #error>{{ $t('pages.chase.infiniteLoading.error') }}</template>
          </infinite-loading>
        </div>
      </div>
    </div>
    <detail-view v-model:visible="isVisible.detail" :site="siteData" :data="formDetailData" />
    <t-loading :attach="`.${prefix}-content`" size="medium" :text="$t('pages.setting.loading')" :loading="isVisible.loading" />
  </div>
</template>
<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import { useEventBus } from '@vueuse/core';

import _ from 'lodash';
import moment from 'moment';
import { LaptopIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { ref, reactive } from 'vue';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';

import { delHistory, fetchHistoryList } from '@/api/history';
import { fetchSiteList } from '@/api/site';
import { fetchDetail, t3RuleInit, catvodRuleInit } from '@/utils/cms';
import { formatIndex } from '@/utils/common/film';

import DetailView from '../../film/Detail.vue';

const store = usePlayStore();
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

const options = ref({
  today: [],
  week: [],
  ago: [],
});
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});
const formDetailData = ref({
  neme: '',
  key: '',
  type: 1,
}); //  详情组件源传参
const siteData = ref();
const isVisible = reactive({
  detail: false,
  loading: false
});
const infiniteId = ref(+new Date());
const siteConfig = ref({
  data: []
})

const getHistoryList = async () => {
  let length = 0;
  try {
    const { pageIndex, pageSize } = pagination.value;

    const [history_res, site_res] = await Promise.all([
      fetchHistoryList(pageIndex, pageSize, "film"),
      fetchSiteList()
    ]);

    if (_.has(site_res, "data") && !_.isEmpty(site_res["data"])) {
      siteConfig.value.data = site_res["data"]
    }

    for (const item of history_res.data) {
      const findItem: any = siteConfig.value.data.find(({ id }) => id === item.relateId);
      if (findItem) item.site = { ...findItem };
      item.siteName = findItem ? findItem["name"] : "";
      const timeDiff = filterDate(item.date);
      let timeKey;
      if (timeDiff === 0) timeKey = 'today';
      else if (timeDiff < 7) timeKey = 'week';
      else timeKey = 'ago';
      options.value[timeKey].push(item);
    }

    pagination.value.count = history_res.total;
    pagination.value.pageIndex++;

    length = _.size(history_res.data);
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

// 播放
const playEvent = async (item) => {
  isVisible.loading = true;

  try {
    const { videoName, videoId } = item;
    const site: any = siteConfig.value.data.find(({ id }) => id === item.relateId);
    siteData.value = site;
    if (site.type === 7) {
      await t3RuleInit(site);
    } else if (site.type === 8) await catvodRuleInit(site);
    if (!('vod_play_from' in item && 'vod_play_url' in item)) {
      const [detailItem] = await fetchDetail(site, videoId);
      item = detailItem;
    }
    console.log(item);

    const playerMode = store.getSetting.playerMode;

    if (playerMode.type === 'custom') {
      formDetailData.value = item;
      isVisible.detail = true;
    } else {
      const config = {
        type: 'film',
        status: true,
        data: {
          info: item,
          ext: { site: site }
        }
      };

      store.updateConfig(config);
      window.electron.ipcRenderer.send('openPlayWindow', videoName);
    }
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
  console.log(item, id)
  delHistory(id);
  if (timeDiff === 0) timeKey = 'today';
  else if (timeDiff < 7) timeKey = 'week';
  else timeKey = 'ago';
  options.value[timeKey] = _.reject(options.value[timeKey], { id });
  pagination.value.count--;
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

// 监听播放器变更
const eventBus = useEventBus('history-reload');
eventBus.on(() => {
  options.value = {
    today: [],
    week: [],
    ago: [],
  };
  if (!_.size(options.value)) infiniteId.value++;
  pagination.value.pageIndex = 0;
});
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;

  .content {
    .container {
      .content-wrapper {
        width: 100%;
        height: 100%;
        position: relative;

        .container-item {
          .time {
            position: relative;
            height: 40px;
            line-height: 40px;
            font-size: 20px;
            font-weight: 700;
            text-align: left;

            .title {
              position: relative;
              display: inline-block;
              padding-right: 18px;
              vertical-align: middle;
              z-index: 10;
            }
          }

          .main {
            .card {
              box-sizing: border-box;
              width: inherit;
              position: relative;
              cursor: pointer;
              border-radius: var(--td-radius-medium);

              .card-close {
                display: none;
                position: absolute;
                right: -9px;
                top: -9px;
                height: 22px;
                width: 22px;
                background: url(../../../assets/close.png) 0 0 no-repeat;
                z-index: 1000;
                cursor: pointer;
                background-size: 100%;
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

                &:hover {
                  .card-main-item {
                    overflow: hidden;

                    :deep(img) {
                      transition: all 0.25s ease-in-out;
                      transform: scale(1.05);
                    }
                  }
                }

                &:hover .card-close {
                  display: block !important;
                }

                .card-tag-orange {
                  background: #ffdd9a;
                  color: #4e2d03;
                }

                .card-tag {
                  z-index: 15;
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
                  border-radius: 5px;

                  .op {
                    background-color: rgba(22, 22, 23, 0.8);
                    width: 100%;
                    color: rgba(255, 255, 255, 0.8);
                    position: absolute;
                    bottom: 0;
                    display: flex;
                    justify-content: center;
                  }
                }
              }

              .card-footer {
                position: relative;
                padding-top: var(--td-comp-paddingTB-s);

                .card-footer-title {
                  font-weight: 700;
                  line-height: var(--td-line-height-title-medium);
                  height: 22px;
                }

                .card-footer-desc {
                  font-size: 13px;
                  line-height: var(--td-line-height-body-large);
                  color: var(--td-text-color-placeholder);

                  .icon {
                    margin-right: var(--td-comp-margin-xs);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
