<template>
  <div class="moment-star view-component-container">
    <div class="content">
      <div id="back-top" class="container">
        <div class="content-wrapper">
          <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
            <t-col
              v-for="item in starList"
              :key="item.id"
              :md="4"
              :xl="3"
              :xxl="2"
              class="card"
              @click="playEvent(item)"
            >
              <div class="card-main">
                <div class="card-tag card-tag-mask">
                  <span v-if="item.type === 1" class="card-tag-text txthide txthide1">
                    {{ $t('pages.film.title') }}
                  </span>
                  <span v-else-if="item.type === 2" class="card-tag-text txthide txthide1">
                    {{ $t('pages.live.title') }}
                  </span>
                  <span v-else-if="item.type === 3" class="card-tag-text txthide txthide1">
                    {{ $t('pages.parse.title') }}
                  </span>
                </div>
                <div class="card-tag card-tag-close" @click.stop="handleRemoveItem(item)">
                  <delete-icon class="t-icon t-icon-delete" />
                </div>
                <t-image
                  class="card-main-item"
                  :src="item.videoImage"
                  :lazy="true"
                  fit="cover"
                  shape="round"
                  :loading="renderDefaultLazy"
                  :error="renderDefaultLazy"
                >
                  <template #overlayContent>
                    <div class="summary">
                      <span class="summary-text">
                        {{ item?.relateSite?.name ? item.relateSite.name : $t('pages.moment.noRelatedSource') }}
                      </span>
                    </div>
                  </template>
                </t-image>
              </div>
              <div class="card-footer">
                <p class="card-footer-title txthide txthide1">{{ item.videoName }}</p>
                <p class="card-footer-desc txthide txthide1">{{ item.videoRemarks || $t('pages.moment.noDesc') }}</p>
              </div>
            </t-col>
          </t-row>

          <infinite-loading
            class="infinite-loading-container"
            :identifier="infiniteId"
            :duration="200"
            @infinite="loadMore"
          >
            <template #complete>{{ $t('common.infiniteLoading.complete') }}</template>
            <template #error>{{ $t('common.infiniteLoading.error') }}</template>
          </infinite-loading>
        </div>
      </div>
    </div>

    <t-loading :attach="`.${attachContent}`" size="medium" :loading="active.loading" />
    <t-back-top container="#back-top" size="small" :offset="['1rem', '0.8rem']" :duration="2000" />

    <dialog-detail-view
      v-model:visible="dialogState.visibleDetail"
      :extra="detailFormData.extra"
      :info="detailFormData.info"
    />
  </div>
</template>
<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';

import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import {
  isArray,
  isArrayEmpty,
  isHttp,
  isNil,
  isObject,
  isObjectEmpty,
  isPositiveFiniteNumber,
} from '@shared/modules/validate';
import type { ICmsInfo } from '@shared/types/cms';
import type { IModels } from '@shared/types/db';
import { DeleteIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import type { StateHandler as ILoadStateHdandler } from 'v3-infinite-loading/lib/types';
import { onActivated, ref, watch } from 'vue';

import { fetchCmsDetail } from '@/api/film';
import { fetchChannelDetail } from '@/api/live';
import { addHistory, delStar, fetchStarPage, findHistory, putHistory } from '@/api/moment';
import { fetchParse } from '@/api/parse';
import LazyBg from '@/components/lazy-bg/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { attachContent } from '@/config/global';
import { t } from '@/locales';
import DialogDetailView from '@/pages/film/components/DialogDetail.vue';
import { usePlayerStore } from '@/store';
import emitter from '@/utils/emitter';

type IStarBase = IModels['star'];
type IStarFilm = IStarBase & {
  type: 1;
  relateSite: IModels['site'];
};
type IStarLive = IStarBase & {
  type: 2;
  relateSite: IModels['iptv'];
};
type IStarParse = IStarBase & {
  type: 3;
  relateSite: IModels['analyze'];
};
type IStar = IStarFilm | IStarLive | IStarParse;

interface IParse {
  api: NonNullable<IStarBase['videoId']>;
  name: NonNullable<IStarBase['videoName']>;
  id: NonNullable<IStarBase['videoId']>;
}

const props = defineProps({
  related: {
    type: Object as () => {
      parse: IModels['analyze'][];
      live: IModels['iptv'][];
      film: IModels['site'][];
    },
    default: () => ({ parse: [], live: [], site: [] }),
  },
});

const storePlayer = usePlayerStore();

const renderDefaultLazy = () => <LazyBg class="render-icon" />;

const detailFormData = ref({
  info: {} as ICmsInfo,
  extra: {} as { active: IModels['site'] },
});

const starList = ref<IStar[]>([]);

const infiniteId = ref(Date.now());

const pagination = ref({
  pageIndex: 1,
  pageSize: 32,
  total: 0,
});

const config = ref(props.related);

const dialogState = ref({
  visibleDetail: false,
});
const active = ref({
  loading: false,
});

watch(
  () => props.related,
  (val) => (config.value = val),
  { deep: true },
);

onActivated(() => {
  emitter.off(emitterChannel.REFRESH_MOMENT_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_MOMENT_CONFIG, reloadConfig);
});

const getSetting = async () => {
  const { pageIndex, pageSize } = pagination.value;

  const resp = await fetchStarPage({
    page: pageIndex,
    pageSize,
    type: [1, 2, 3],
  });

  if (isArray(resp.list) && !isArrayEmpty(resp.list)) {
    starList.value.push(...resp.list);
  }

  if (resp.total) pagination.value.total = resp.total;

  return resp.list.length;
};

const loadMore = async ($state: ILoadStateHdandler) => {
  try {
    const length = await getSetting();

    if (length === 0) {
      $state.complete();
    } else {
      pagination.value.pageIndex++;
      $state.loaded();
    }
  } catch (error) {
    console.error(`Failed to load more data:`, error);
    $state.error();
  }
};

const handleFilmPlay = async (conf: IStarFilm) => {
  const playWithExternalPlayer = async (item: ICmsInfo, active: IModels['site']) => {
    detailFormData.value = {
      info: item,
      extra: { active },
    };

    dialogState.value.visibleDetail = true;
  };

  const playWithInternalPlayer = (item: ICmsInfo, active: IModels['site']) => {
    storePlayer.updateConfig({
      type: 'film',
      status: true,
      data: { info: item, extra: { active, site: config.value.film } },
    });

    window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_PLAYER);
  };

  const { relateSite: site } = conf;
  const player = storePlayer.player;

  const resp = await fetchCmsDetail({ uuid: site.id, ids: conf.videoId });
  if (
    !isArray(resp.list) ||
    isArrayEmpty(resp.list) ||
    !isObject(resp.list[0]?.vod_episode) ||
    isObjectEmpty(resp.list[0]?.vod_episode)
  ) {
    MessagePlugin.warning(t('pages.film.message.noDetailInfo'));
    return;
  }

  const item = {
    ...resp.list[0],
    ...(resp.list[0]?.vod_id ? {} : { vod_id: conf.videoId }),
    ...(resp.list[0]?.vod_name ? {} : { vod_name: conf.videoName }),
    ...(resp.list[0]?.vod_pic ? {} : { vod_pic: conf.videoImage }),
  };

  if (player.type === 'custom') {
    playWithExternalPlayer(item, site);
  } else {
    playWithInternalPlayer(item, site);
  }
};

const handleLivePlay = async (conf: IStarLive) => {
  const createHistoryDoc = (item: IModels['channel'], siteKey: string) => ({
    type: 2,
    relateId: siteKey,
    siteSource: item.group,
    playEnd: false,
    videoId: item.id,
    videoImage: item.logo,
    videoName: item.name,
    videoIndex: `${item.name}$${item.api}`,
    watchTime: 0,
    duration: 0,
    skipTimeInStart: 0,
    skipTimeInEnd: 0,
  });

  const saveHistoryData = async (doc: ReturnType<typeof createHistoryDoc>, relateId: string, videoId: string) => {
    const resp = await findHistory({ relateId, videoId, type: 2 });

    const id = resp?.id;
    if (!isNil(id) && isPositiveFiniteNumber(resp.watchTime)) doc.watchTime = resp.watchTime;
    if (!isNil(id) && isPositiveFiniteNumber(resp.duration)) doc.duration = resp.duration;
    if (!isNil(id) && isPositiveFiniteNumber(resp.skipTimeInStart)) doc.skipTimeInStart = resp.skipTimeInStart;
    if (!isNil(id) && isPositiveFiniteNumber(resp.skipTimeInEnd)) doc.skipTimeInEnd = resp.skipTimeInEnd;

    isNil(id) ? await addHistory(doc) : await putHistory({ id: [id], doc });
  };

  const playWithExternalPlayer = (item: IModels['channel'], active: IModels['iptv']) => {
    const player = storePlayer.player;

    window.electron.ipcRenderer.invoke(IPC_CHANNEL.CALL_PLAYER, player.external, item.api);

    const historyDoc = createHistoryDoc(item, active.key);
    saveHistoryData(historyDoc, active.key, item.id);
  };

  const playWithInternalPlayer = (item: IModels['channel'], active: IModels['iptv']) => {
    storePlayer.updateConfig({
      type: 'live',
      status: true,
      data: { info: item, extra: { active, site: config.value.live } },
    });

    window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_PLAYER);
  };

  const { videoId: id, relateSite: site } = conf;
  const player = storePlayer.player;

  const item = await fetchChannelDetail(id);

  if (player.type === 'custom') {
    playWithExternalPlayer(item, site);
  } else {
    playWithInternalPlayer(item, site);
  }
};

const handleParsePlay = async (conf: IStarParse) => {
  const createHistoryDoc = (item: IParse, siteKey: string) => ({
    type: 3,
    relateId: siteKey,
    siteSource: '',
    playEnd: false,
    videoId: item.id,
    videoImage: '',
    videoName: item.name,
    videoIndex: `${item.name}$${item.api}`,
    watchTime: 0,
    duration: 0,
    skipTimeInStart: 0,
    skipTimeInEnd: 0,
  });

  const saveHistoryData = async (doc: ReturnType<typeof createHistoryDoc>, relateId: string, videoId: string) => {
    const resp = await findHistory({ relateId, videoId, type: 3 });

    const id = resp?.id;
    if (!isNil(id) && isPositiveFiniteNumber(resp.watchTime)) doc.watchTime = resp.watchTime;
    if (!isNil(id) && isPositiveFiniteNumber(resp.duration)) doc.duration = resp.duration;
    if (!isNil(id) && isPositiveFiniteNumber(resp.skipTimeInStart)) doc.skipTimeInStart = resp.skipTimeInStart;
    if (!isNil(id) && isPositiveFiniteNumber(resp.skipTimeInEnd)) doc.skipTimeInEnd = resp.skipTimeInEnd;

    isNil(id) ? await addHistory(doc) : await putHistory({ id: [id], doc });
  };

  const playWithExternalPlayer = async (item: IParse, active: IModels['analyze']) => {
    const resp = await fetchParse({ id: active.id, url: item.api });

    if (!isHttp(resp?.url)) {
      MessagePlugin.error(t('pages.parse.message.error'));
      return;
    }

    const player = storePlayer.player;

    window.electron.ipcRenderer.invoke(IPC_CHANNEL.CALL_PLAYER, player.external, resp.url);

    const historyDoc = createHistoryDoc(item, active.key);
    saveHistoryData(historyDoc, active.key, item.id);
  };

  const playWithInternalPlayer = (item: IParse, active: IModels['analyze']) => {
    storePlayer.updateConfig({
      type: 'parse',
      status: true,
      data: { info: item, extra: { active, site: config.value.parse } },
    });

    window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_PLAYER);
  };

  const { relateSite: site } = conf;
  const player = storePlayer.player;

  const item = { name: conf.videoName, api: conf.videoId, id: conf.videoId } as IParse;

  if (player.type === 'custom') {
    playWithExternalPlayer(item, site);
  } else {
    playWithInternalPlayer(item, site);
  }
};

const playEvent = async (item: IStar) => {
  active.value.loading = true;

  try {
    if (isNil(item.relateSite) || isObjectEmpty(item.relateSite)) {
      return;
    }

    const handlers = {
      1: handleFilmPlay,
      2: handleLivePlay,
      3: handleParsePlay,
    };
    await handlers?.[item.type]?.(item as any);
  } catch (error) {
    console.error('Failed to play:', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    active.value.loading = false;
  }
};

const handleRemoveItem = async (item: IStar) => {
  await delStar({ id: [item.id] });

  starList.value = starList.value.filter((i) => i.id !== item.id);
  pagination.value.total--;
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.PAGE_SHOW) return;

  starList.value = [];
  pagination.value.pageIndex = 1;
  infiniteId.value = Date.now();
};
</script>
<style lang="less" scoped>
.view-component-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;

  .content {
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);
    overflow: hidden;
    position: relative;

    .container {
      flex: 1;
      height: 100%;
      width: 100%;
      overflow: auto;
      padding: 0 var(--td-comp-paddingLR-s) 0 0;

      .content-wrapper {
        width: 100%;
        height: 100%;
        position: relative;

        .card {
          width: inherit;
          cursor: pointer;

          .card-main {
            position: relative;
            width: 100%;
            height: 0;
            overflow: hidden;
            border-radius: var(--td-radius-medium);
            padding-top: 62%;
            background-color: var(--td-bg-color-component);
            transition: all 0.25s ease-in-out;

            .card-tag {
              position: absolute;
              z-index: 2;

              &-mask {
                left: 0;
                top: 0;
                border-radius: var(--td-radius-medium) 0 var(--td-radius-large) 0;
                padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-s);
                background: linear-gradient(-45deg, #45c58b, #94dab2);
                border: 1px solid #33a371;
                border-width: 0 1px 1px 0;
                max-width: 66%;
              }

              &-close {
                right: 0;
                top: 0;
                height: var(--td-comp-size-xs);
                width: var(--td-comp-size-xs);
                background-color: var(--td-bg-color-container);
                border: 1px solid var(--td-bg-color-container);
                border-radius: 0 var(--td-radius-medium);
                display: none;
                align-items: center;
                justify-content: center;
                transition: all 0.25s ease-in-out;

                .t-icon-delete {
                  color: var(--td-text-color-secondary);
                }

                &:hover {
                  .t-icon-delete {
                    color: var(--td-text-color-primary);
                  }
                }
              }

              &-text {
                color: #006c44;
                font-weight: 500;
                font-size: var(--td-font-size-mark-small);
                height: var(--td-comp-size-xxs);
                line-height: var(--td-line-height-mark-small);
              }
            }

            .card-main-item {
              position: absolute;
              top: 0;
              left: 0;
              display: block;
              width: 100%;
              height: 100%;
              border-radius: var(--td-radius-medium);

              :deep(.render-icon) {
                height: var(--td-comp-size-xxxl);
                width: var(--td-comp-size-xxxl);
                background: transparent;
              }

              :deep(img) {
                transition: all 0.25s ease-in-out;
              }

              .summary {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                border-radius: 0 0 var(--td-radius-medium) var(--td-radius-medium);
                background: linear-gradient(180deg, rgb(0 0 0 / 0%), rgb(22 24 35 / 40%));

                &-text {
                  text-align: center;
                  display: inline-block;
                  width: 100%;
                  padding: var(--td-comp-paddingTB-xs) 0;
                  color: var(--td-font-white-1);
                  line-height: var(--td-line-height-body-small);
                  font-size: var(--td-font-size-body-medium);
                  font-weight: 500;
                }
              }
            }
          }

          .card-footer {
            padding: var(--td-comp-paddingTB-xs) 0 var(--td-comp-paddingTB-xxs) 0;

            .card-footer-title {
              font-weight: 500;
              font-size: var(--td-font-size-title-medium);
              line-height: var(--td-line-height-title-medium);
              color: var(--td-text-color-primary);
              transition: all 0.25s ease-in-out;
            }

            .card-footer-desc {
              font-size: var(--td-font-size-body-medium);
              line-height: var(--td-line-height-body-small);
              color: var(--td-text-color-placeholder);
            }
          }

          &:hover {
            .card-main {
              .card-tag {
                &-close {
                  display: flex;
                }
              }

              .card-main-item {
                :deep(img) {
                  transform: scale(1.05);
                }
              }
            }

            .card-footer {
              .card-footer-title {
                color: var(--td-brand-color);
              }
            }
          }
        }
      }
    }
  }
}

.infinite-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--td-text-color-placeholder);
  text-align: center;
}
</style>
