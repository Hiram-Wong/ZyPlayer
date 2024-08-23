<template>
  <div class="binge">
    <div class="header operation-container">
      <div class="left-operation-container">
        <div class="component-op">
          <div class="item" @click="checkUpdaterEvent">
            <assignment-checked-icon />
            <span>{{ $t('pages.chase.binge.checkUpdate') }}</span>
          </div>
          <div class="item" @click="clearEvent">
            <delete-icon />
            <span>{{ $t('pages.chase.binge.clearAll') }}</span>
          </div>
        </div>
      </div>
      <div class="right-operation-container"></div>
    </div>
    <div class="main">
      <t-row :gutter="[16, 16]" style="margin: 0;">
        <t-col :md="3" :lg="3" :xl="2" :xxl="1" v-for="item in bingeConfig.data" :key='item["id"]' class="card"
          @click="playEvent(item)">
          <div class="card-close" @click.stop="removeEvent(item)">
            <delete-icon />
          </div>
          <div class="card-main">
            <div class="card-tag card-tag-orange" v-if='item["videoUpdate"]'>
              <span class="card-tag-text text-hide">{{ $t('pages.chase.isUpdate') }}</span>
            </div>
            <t-image class="card-main-item" :src='item["videoImage"]'
              :style="{ width: '100%', background: 'none', overflow: 'hidden' }" :lazy="true" fit="cover"
              :loading="renderLoading" :error="renderError">
              <template #overlayContent>
                <div class="op">
                  <div class="op-box">
                    <span>{{ item["siteName"] ? item["siteName"] : $t('pages.chase.sourceDeleted') }}</span>
                  </div>
                </div>
              </template>
            </t-image>
          </div>
          <div class="card-footer">
            <p class="card-footer-title text-hide">{{ item["videoName"] }}</p>
            <p class="card-footer-desc tiles-item_desc_row text-hide">
              {{ item["videoRemarks"] ? item["videoRemarks"] : '' }}</p>
          </div>
        </t-col>
      </t-row>

      <infinite-loading class="infinite-loading-container" :identifier="infiniteId" :duration="200" @infinite="load">
        <template #complete>{{ $t('pages.chase.infiniteLoading.complete') }}</template>
        <template #error>{{ $t('pages.chase.infiniteLoading.error') }}</template>
      </infinite-loading>
    </div>

    <detail-view v-model:visible="isVisible.detail" :site="siteData" :data="formDetailData" />
    <t-loading :attach="`.${prefix}-content`" size="medium" :text="$t('pages.setting.loading')"
      :loading="isVisible.loading" />
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import _ from 'lodash';
import PQueue from 'p-queue';
import { AssignmentCheckedIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { onActivated, onMounted, ref, reactive } from 'vue';

import { clearStar, delStar, fetchStarList } from '@/api/star';
import { fetchSiteList } from '@/api/site';
import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { catvodRuleInit, fetchDetail, t3RuleInit, xbpqInit } from '@/utils/cms';
import emitter from '@/utils/emitter';

import DetailView from '../../film/Detail.vue';

const store = usePlayStore();

const renderError = () => {
  return (
    <div class="renderIcon" style="width: 100%">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="width: 100%">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};

const queue = new PQueue({ concurrency: 5 }); // 设置并发限制为5

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
const bingeConfig = ref<any>({
  data: []
});
const siteConfig = ref({
  data: []
})

const infiniteId = ref(+new Date());

onMounted(async () => {
  const site_res = await fetchSiteList();
  if (_.has(site_res, "data") && !_.isEmpty(site_res["data"])) {
    siteConfig.value.data = site_res["data"]
  }
});

onActivated(() => {
  const isListenedRefreshBinge = emitter.all.get('refreshBinge');
  if (!isListenedRefreshBinge) emitter.on('refreshBinge', refreshBinge);
});

const getBingeList = async () => {
  let length = 0;
  try {
    const { pageIndex, pageSize } = pagination.value;

    const star_res = await fetchStarList(pageIndex, pageSize);

    for (const item of star_res.data) {
      const findItem: any = siteConfig.value.data.find(({ id }) => id === item.relateId);
      if (findItem) item.site = { ...findItem };
      item.siteName = findItem ? findItem.name : "";
    }

    bingeConfig.value.data = _.unionWith(bingeConfig.value.data, star_res.data, _.isEqual) as any;

    pagination.value.count = star_res.total;
    pagination.value.pageIndex++;

    length = _.size(star_res.data);
    return length;
  } catch (err) {
    console.error(err);
    length = 0;
  } finally {
    console.log(`[binge] load data length: ${length}`);
    return length;
  }
};

const load = async ($state) => {
  console.log('[binge] loading...');
  try {
    const resLength = await getBingeList();
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (error) {
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
    } else if (site.type === 8) {
      await catvodRuleInit(site);
    } else if (site.type === 9) {
      await xbpqInit(site);
    };
    if (!('vod_play_from' in item && 'vod_play_url' in item)) {
      const [detailItem] = await fetchDetail(site, videoId);
      if (site.type === 9) {
        detailItem.vod_name = item.videoName;
        detailItem.vod_pic = item.videoImage;
      };
      item = detailItem;
    }

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
    console.error(`[binge][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  } finally {
    isVisible.loading = false;
  }
};

// 删除
const removeEvent = async (item) => {
  const { id } = item;
  await delStar(id);
  bingeConfig.value.data = _.reject(bingeConfig.value.data, { id }) as any;
  pagination.value.count--;
};

// 更新
const updateVideoRemarks = (item, res) => {
  const index = _.findIndex(bingeConfig.value.data, { ...item });
  const isUpdate = res.vod_remarks !== bingeConfig.value.data[index].videoRemarks;
  bingeConfig.value.data[index].videoUpdate = isUpdate;
  bingeConfig.value.data[index].videoRemarks = res.vod_remarks;
};

const checkUpdaterEvent = async () => {
  if (!_.size(bingeConfig.value.data)) {
    MessagePlugin.info(t('pages.chase.binge.message.noCheckData'));
    return;
  }

  try {
    MessagePlugin.info(t('pages.setting.message.checking'));
    const fetchAndUpdateVideoRemarks = async (item) => {
      if (!item.siteName) return;
      const { site, videoId } = item;
      try {
        if (site.type === 7) await t3RuleInit(site);
        else if (site.type === 8) await catvodRuleInit(site);
        else if (site.type === 9) await xbpqInit(site);
        const [res] = await fetchDetail(site, videoId);
        if (res.vod_remarks) {
          updateVideoRemarks(item, res);
        }
      } catch (err) {
        console.error(err);
      }
    };
    await Promise.all(
      bingeConfig.value.data.map((item) => {
        queue.add(() => fetchAndUpdateVideoRemarks(item));
      }),
    );
    MessagePlugin.success(t('pages.setting.form.success'));
  } catch (err) {
    console.log('[chase][binge][checkUpdaterEvent][error]', err);
    MessagePlugin.error(t('pages.setting.form.fail'));
  }
};

const clearEvent = () => {
  const handleClear = () => {
    clearStar();
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

const defaultSet = () => {
  bingeConfig.value.data = [];
  if (!_.size(bingeConfig.value.data)) infiniteId.value++;
  pagination.value.pageIndex = 0;
};

const refreshBinge = () => {
  console.log('[binge][bus][refresh]');
  defaultSet();
};
</script>

<style lang="less" scoped>
.binge {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: hidden !important;

  .header {
    margin: var(--td-comp-margin-s) 0;
    display: flex;
    justify-content: space-between;
  }

  .main {
    height: calc(100% - 32px - 2 * var(--td-comp-margin-s));
    overflow-y: auto;
    overflow-x: hidden;
  }

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
      }
    }
  }
}
</style>
