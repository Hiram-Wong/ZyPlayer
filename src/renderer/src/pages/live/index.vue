<template>
  <div class="live view-container">
    <common-nav
      :list="config.list.map((t) => ({ id: t.id, name: t.name }))"
      :active="active.nav"
      search
      class="sidebar"
      @change="onNavChange"
    />

    <div class="content">
      <div v-if="classList.length > 1" class="header">
        <title-menu :list="classList" :active="active.class" class="nav" @change="onClassChange" />
      </div>

      <div id="back-top" class="container">
        <div class="content-wrapper">
          <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
            <t-col
              v-for="item in channelList"
              :key="item.id"
              :md="4"
              :xl="3"
              :xxl="2"
              class="card"
              @click="playEvent(item)"
            >
              <div class="card-main">
                <div v-if="config.extra.delay" class="card-tag card-tag-delay">
                  <span
                    v-if="item.delay"
                    class="card-tag-text"
                    :class="[item.delay < 500 ? 'card-tag-text-success' : 'card-tag-text-error']"
                  >
                    {{ item.delay < 9999 ? `${item.delay}ms` : '9999ms' }}
                  </span>
                  <span v-else class="card-tag-text card-tag-text-error">
                    {{ $t('common.unknown') }}
                  </span>
                </div>
                <div v-if="config.extra.ipMark" class="card-tag card-tag-ip">
                  <span
                    class="card-tag-text"
                    :class="[item.ipMark !== -1 ? 'card-tag-text-success' : 'card-tag-text-error']"
                  >
                    {{ item.ipMark !== -1 ? `IPV${item.ipMark}` : $t('common.unknown') }}
                  </span>
                </div>
                <t-image
                  class="card-main-item"
                  :src="isThumbnail(item) ? item.thumbnail : item.logo"
                  :class="{ 'card-main-logo-item': !isThumbnail(item) }"
                  :lazy="true"
                  fit="cover"
                  shape="round"
                  :loading="renderDefaultLazy"
                  :error="renderDefaultLazy"
                />
              </div>
              <div class="card-footer">
                <p class="card-footer-title txthide txthide1">{{ item.name }}</p>
              </div>
            </t-col>
          </t-row>

          <div class="infinite-loading">
            <infinite-loading
              v-if="active.lazyload"
              class="infinite-loading-container"
              :identifier="infiniteId"
              :duration="200"
              @infinite="loadMore"
            >
              <template #complete>{{ LOAD_TEXT_OPTIONS[active.loadStatus] }}</template>
              <template #error>{{ $t('common.infiniteLoading.error') }}</template>
            </infinite-loading>
            <infinite-loading v-else class="infinite-loading-container" />
          </div>
        </div>
      </div>
    </div>
    <t-loading :attach="`.${attachContent}`" size="medium" :loading="active.loading" />
    <t-back-top container="#back-top" size="small" :offset="['1rem', '0.8rem']" :duration="2000" />
  </div>
</template>
<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';

import { IPC_CHANNEL } from '@shared/config/ipcChannel';
import { checkIpVersion } from '@shared/modules/ip';
import { isArray, isArrayEmpty, isNil, isPositiveFiniteNumber } from '@shared/modules/validate';
import type { IModels } from '@shared/types/db';
import PQueue from 'p-queue';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import type { StateHandler as ILoadStateHdandler } from 'v3-infinite-loading/lib/types';
import { computed, onActivated, onMounted, onUnmounted, ref } from 'vue';

import { fetchChannelPage, fetchIptvActive, putIptvDefault } from '@/api/live';
import { addHistory, findHistory, putHistory } from '@/api/moment';
import { generateFfmpegScreenshot } from '@/api/system';
import CommonNav from '@/components/common-nav/index.vue';
import LazyBg from '@/components/lazy-bg/index.vue';
import TitleMenu from '@/components/title-menu/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { attachContent } from '@/config/global';
import { t } from '@/locales';
import { usePlayerStore } from '@/store';
import emitter from '@/utils/emitter';
import { normalRequest } from '@/utils/request';

type IChannel = IModels['channel'] & {
  delay?: number;
  thumbnail?: string;
  ipMark?: number;
};

const storePlayer = usePlayerStore();

const renderDefaultLazy = () => <LazyBg class="render-icon" />;

const queues = {
  delay: new PQueue({ concurrency: 5 }),
  ip: new PQueue({ concurrency: 5 }),
  thumbnail: new PQueue({ concurrency: 5 }),
};

const searchValue = ref('');
const infiniteId = ref(Date.now());

const pagination = ref({
  pageIndex: 1,
  pageSize: 32,
  total: 0,
});

const config = ref({
  default: {} as IModels['iptv'],
  list: [] as IModels['iptv'][],
  extra: {
    epg: 'https://epg.112114.eu.org/?ch={name}&date={date}',
    logo: 'https://epg.112114.eu.org/logo/{name}.png',
    ipMark: true,
    delay: false,
    thumbnail: false,
  },
});
const channelList = ref<IChannel[]>([]);
const classList = ref<Array<{ type_id: string; type_name: string }>>([]);

const active = ref({
  loadStatus: 'complete' as 'complete' | 'error' | 'noConfig' | 'noSelect',
  nav: '',
  class: '',
  lazyload: false,
  loading: false,
});

const isThumbnail = computed(() => (item: IChannel) => config.value.extra.thumbnail && item.thumbnail);

const LOAD_TEXT_OPTIONS = computed(() => ({
  complete: t('common.infiniteLoading.complete'),
  error: t('common.infiniteLoading.error'),
  noSelect: t('common.infiniteLoading.noSelect'),
  noConfig: t('pages.live.infiniteLoading.noConfig'),
}));

onMounted(() => getSetting());

onActivated(() => {
  emitter.off(emitterChannel.REFRESH_LIVE_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_LIVE_CONFIG, reloadConfig);

  emitter.off(emitterChannel.SEARCH_LIVE_RECOMMEND, onSearchRecommend);
  emitter.on(emitterChannel.SEARCH_LIVE_RECOMMEND, onSearchRecommend);
});

onUnmounted(() => {
  clearAllQueues();
});

const clearAllQueues = () => {
  Object.values(queues).forEach((queue) => {
    if (queue.size > 0) {
      queue.pause();
      queue.clear();
      queue.start();
    }
  });
};

const resetPagination = () => {
  pagination.value.pageIndex = 1;
  pagination.value.total = 0;
};

const getSetting = async () => {
  try {
    const resp = await fetchIptvActive();
    if (resp?.default) {
      config.value.default = resp.default;
      active.value.nav = resp.default.id;
    }
    if (resp?.list) config.value.list = resp.list;
    if (resp?.extra) config.value.extra = resp.extra;

    active.value.loadStatus =
      resp?.default && resp.list.length ? 'complete' : resp.list.length ? 'noSelect' : 'noConfig';
  } catch (error) {
    console.error(`Failed to get iptv config:`, error);
    active.value.loadStatus = 'error';
  } finally {
    active.value.lazyload = true;
  }
};

const getChannel = async (): Promise<number> => {
  const { pageIndex, pageSize } = pagination.value;

  const resp = await fetchChannelPage({
    page: pageIndex,
    pageSize,
    kw: searchValue.value,
    group: active.value.class,
  });

  if (isArray(resp.class) && !isArrayEmpty(resp.class)) {
    classList.value = [
      { type_id: '', type_name: computed(() => t('common.all')) },
      ...resp.class.map((item) => ({
        type_id: item.value,
        type_name: item.label,
      })),
    ];
    active.value.class = classList.value.map((item) => item.type_id).includes(active.value.class)
      ? active.value.class
      : classList.value[0].type_id;
  }

  if (isArray(resp.list) && !isArrayEmpty(resp.list)) {
    channelList.value.push(...resp.list);

    const { ipMark, delay, thumbnail } = config.value.extra;
    if (delay) processChannelDelay(resp.list);
    if (thumbnail) processChannelThumbnail(resp.list);
    if (ipMark) processChannelIp(resp.list);
  }

  if (resp.total) pagination.value.total = resp.total;

  return resp.list.length;
};

const updateChannelProperty = <K extends keyof IChannel>(id: string, key: K, value: IChannel[K]) => {
  const index = channelList.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    channelList.value[index][key] = value;
  }
};

const processChannelIp = (list: IChannel[]) => {
  list.forEach((item) => {
    queues.ip.add(async () => {
      try {
        const hostname = new URL(item.api)?.hostname;
        const version = checkIpVersion(hostname);
        updateChannelProperty(item.id, 'ipMark', version);
      } catch (error) {
        console.error(`Failed to check ${item.api} IP version:`, error);
        updateChannelProperty(item.id, 'ipMark', -1);
      }
    });
  });
};

const processChannelDelay = (list: IChannel[]) => {
  list.forEach((item) => {
    queues.delay.add(async () => {
      try {
        const start = Date.now();
        await normalRequest.request({
          url: item.api,
          method: 'GET',
          headers: { Range: 'bytes=0-1' },
        });
        const delay = Date.now() - start;
        updateChannelProperty(item.id, 'delay', delay);
      } catch (error) {
        console.error('Failed to gain delay:', error);
        updateChannelProperty(item.id, 'delay', 9999);
      }
    });
  });
};

const processChannelThumbnail = (list: IChannel[]) => {
  list.forEach((item) => {
    queues.thumbnail.add(async () => {
      try {
        const thumbnail = await generateFfmpegScreenshot({ url: item.api });
        updateChannelProperty(item.id, 'thumbnail', thumbnail);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    });
  });
};

const loadMore = async ($state: ILoadStateHdandler) => {
  try {
    if (active.value.loadStatus !== 'complete') {
      $state.complete();
      return;
    }

    const length = await getChannel();

    if (length === 0) {
      resetPagination();
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

const handleSearch = async () => {
  channelList.value = [];
  resetPagination();
  infiniteId.value = Date.now();
};

const onSearchRecommend = (eventData: { source: string; data: any }) => {
  const { source, data: kw } = eventData;
  if (source === emitterSource.PAGE_SHOW) return;

  searchValue.value = kw;
  clearAllQueues();
  handleSearch();
};

const onClassChange = (id: string) => {
  clearAllQueues();
  resetPagination();

  channelList.value = [];

  active.value.class = id;

  infiniteId.value = Date.now();
};

const createHistoryDoc = (item: IChannel, siteKey: string) => ({
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

const playEvent = async (item: IChannel) => {
  active.value.loading = true;

  try {
    const site = config.value.default;
    const player = storePlayer.player;

    if (player.type === 'custom') {
      playWithExternalPlayer(item, site);
    } else {
      playWithInternalPlayer(item, site);
    }
  } catch (error) {
    console.error('Failed to play:', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    active.value.loading = false;
  }
};

const playWithExternalPlayer = async (item: IChannel, active: IModels['iptv']) => {
  const player = storePlayer.player;

  window.electron.ipcRenderer.invoke(IPC_CHANNEL.CALL_PLAYER, player.external, item.api);

  const historyDoc = createHistoryDoc(item, active.key);
  await saveHistoryData(historyDoc, active.key, item.id);
};

const playWithInternalPlayer = (item: IChannel, active: IModels['iptv']) => {
  storePlayer.updateConfig({
    type: 'live',
    status: true,
    data: { info: item, extra: { active, site: config.value.list } },
  });

  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_PLAYER);
};

const defaultConfig = () => {
  clearAllQueues();
  resetPagination();

  searchValue.value = '';

  active.value.lazyload = false;
  active.value.loadStatus = 'complete';
  active.value.class = '';
  active.value.nav = '';

  classList.value = [];
  channelList.value = [];

  config.value.default = {} as IModels['iptv'];

  infiniteId.value = Date.now();
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.PAGE_SHOW) return;

  defaultConfig();
  await getSetting();
};

const onNavChange = async (id: string) => {
  try {
    defaultConfig();
    active.value.class = '';
    active.value.nav = id;
    await putIptvDefault(id);
    config.value.default = config.value.list.find((item) => item.id === id)!;
    emitter.emit(emitterChannel.REFRESH_LIVE_CONFIG, { source: emitterSource.PAGE_SHOW });
  } catch (error) {
    console.error(`Failed to change config:`, error);
  } finally {
    active.value.lazyload = true;
  }
};
</script>
<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: var(--td-size-4);

  .sidebar {
    flex: 0 0 auto;
  }

  .content {
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);
    overflow: hidden;
    position: relative;

    .header {
      width: 100%;
      padding: 0 var(--td-comp-paddingLR-s) 0 0;

      .nav {
        width: 100%;
        overflow: hidden;
      }
    }

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
              height: var(--td-comp-size-xxs);
              padding: 0 var(--td-comp-paddingLR-xs);
              background-color: var(--td-bg-color-container);
              border-radius: var(--td-radius-medium);
              box-shadow: var(--td-shadow-1);
              display: flex;
              flex-direction: row;
              align-items: center;
              position: absolute;
              z-index: 2;

              &-delay {
                top: var(--td-size-3);
                right: var(--td-size-3);
              }

              &-ip {
                bottom: var(--td-size-3);
                left: var(--td-size-3);
              }

              &-text {
                color: var(--td-text-color-secondary);
                font-weight: 500;
                font-size: var(--td-font-size-mark-small);
                height: var(--td-comp-size-xxs);
                line-height: var(--td-line-height-mark-small);
              }

              &-text-error {
                color: var(--td-error-color);
              }

              &-text-success {
                color: var(--td-success-color);
              }
            }

            .card-main-item {
              position: absolute;
              top: 0;
              left: 0;
              display: block;
              width: 100%;
              height: 100%;

              :deep(.render-icon) {
                height: var(--td-comp-size-xxxl);
                width: var(--td-comp-size-xxxl);
                background: transparent;
              }

              :deep(img) {
                transition: all 0.25s ease-in-out;
              }
            }

            .card-main-logo-item {
              padding: 35px 30px;
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
          }

          &:hover {
            .card-main {
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
