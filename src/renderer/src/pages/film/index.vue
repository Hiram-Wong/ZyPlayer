<template>
  <div class="film view-container">
    <common-nav :list="config.list" :active="active.nav" search class="sidebar" @change="onNavChange" />

    <div class="content">
      <div v-if="classList.length > 1" class="header">
        <div class="left-op-container">
          <title-menu :list="classList" :active="active.class" class="nav" @change="onClassChange" />
        </div>
        <div v-if="filterData[active.class]" class="right-op-container">
          <t-popup
            placement="bottom"
            attach=".content"
            :overlay-style="{
              padding: '0 var(--td-comp-paddingLR-s)',
            }"
            :z-index="2"
            :visible="active.filterPopup"
            @visible-change="handleFilterPopupVisible"
          >
            <t-button theme="default" shape="square" variant="text" class="filter-btn" @click="handleFilterVisible">
              <template #icon><root-list-icon /></template>
            </t-button>

            <template #content>
              <div class="filter-wrapper">
                <div v-for="filterItem in filterData[active.class]" :key="filterItem.key" class="filter-content">
                  <div class="title">{{ filterItem.name }}</div>
                  <div class="tags">
                    <span
                      v-for="(item, index) in filterItem.value"
                      :key="index"
                      class="tag"
                      :class="{ active: active.filter[filterItem.key] === item.v }"
                      @click="changeFilterEvent(filterItem.key, item.v)"
                    >
                      {{ item.n }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </t-popup>
        </div>
      </div>

      <div v-if="folderBreadcrumb.length">
        <t-breadcrumb
          :max-items="8"
          :items-before-collapse="2"
          :items-after-collapse="3"
          max-item-width="140"
          class="breadcrumb"
        >
          <t-breadcrumb-item
            v-for="item in folderBreadcrumb"
            :key="item.value"
            @click="handleFolderBreadcrumbClick(item)"
          >
            {{ item.label }}
          </t-breadcrumb-item>
          <template #ellipsis="{ items }">
            <t-dropdown>
              <t-button variant="text" size="small" shape="square">
                <ellipsis-icon stroke-color="var(--td-text-color-placeholder)" />
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item
                  v-for="item in items"
                  :key="item.key"
                  :value="item.key"
                  @click="handleFolderBreadcrumbClick({ label: item.content, value: item.key })"
                >
                  {{ item.content }}
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </template>
        </t-breadcrumb>
      </div>

      <div id="back-top" class="container">
        <div class="content-wrapper">
          <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
            <t-col
              v-for="item in filmList"
              :key="item.vod_id"
              :md="3"
              :xl="2"
              :xxl="1"
              class="card"
              @click="playEvent(item)"
            >
              <div class="card-main">
                <div v-if="item.vod_remarks" class="card-tag card-tag-mask">
                  <span class="card-tag-text txthide txthide1">{{ item.vod_remarks }}</span>
                </div>
                <t-image
                  class="card-main-item"
                  :src="item.vod_pic"
                  :lazy="true"
                  fit="cover"
                  shape="round"
                  :loading="renderDefaultLazy"
                  :error="renderDefaultLazy"
                >
                  <template #overlayContent>
                    <div v-if="item.relateSite" class="summary">
                      <span class="summary-text">{{ item.relateSite.name }}</span>
                    </div>
                  </template>
                </t-image>
              </div>
              <div class="card-footer">
                <p class="card-footer-title txthide txthide1">{{ item.vod_name }}</p>
                <p class="card-footer-desc txthide txthide1">{{ item.vod_blurb || $t('pages.film.noDesc') }}</p>
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
import { isArray, isArrayEmpty, isObject, isObjectEmpty } from '@shared/modules/validate';
import type { ICmsHome, ICmsInfo } from '@shared/types/cms';
import type { IModels } from '@shared/types/db';
import { differenceBy } from 'es-toolkit';
import { EllipsisIcon, RootListIcon } from 'tdesign-icons-vue-next';
import type { PopupVisibleChangeContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import type { StateHandler as ILoadStateHdandler } from 'v3-infinite-loading/lib/types';
import { computed, onActivated, onMounted, ref } from 'vue';

import { fetchCmsCategory, fetchCmsDetail, fetchCmsHome, fetchCmsSearch, fetchSiteActive } from '@/api/film';
import CommonNav from '@/components/common-nav/index.vue';
import LazyBg from '@/components/lazy-bg/index.vue';
import TitleMenu from '@/components/title-menu/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { attachContent } from '@/config/global';
import { t } from '@/locales';
import { usePlayerStore } from '@/store';
import emitter from '@/utils/emitter';

import DialogDetailView from './components/DialogDetail.vue';

const storePlayer = usePlayerStore();

const renderDefaultLazy = () => <LazyBg class="render-icon" />;

const infiniteId = ref(Date.now());
const searchValue = ref('');

const detailFormData = ref({
  info: {},
  extra: {},
});

const pagination = ref({
  pageIndex: 1,
  pageSize: 32,
  total: 0,
});

const config = ref({
  default: {} as IModels['site'],
  list: [] as IModels['site'][],
  extra: {
    search: '',
    filter: false,
  },
  searchList: [] as IModels['site'][],
});

const classList = ref<ICmsHome['class']>([]);
const filterData = ref<ICmsHome['filters']>({});
const filmList = ref<Array<ICmsInfo & { relateSite: IModels['site'] }>>([]);
const folderBreadcrumb = ref<Array<{ label: ICmsInfo['vod_name']; value: ICmsInfo['vod_id'] }>>([]);

const dialogState = ref({
  visibleDetail: false,
});
const active = ref({
  nav: '',
  class: '' as ICmsInfo['vod_id'],
  filter: {},
  folder: '',
  searchCurrent: '',
  filterPopup: false,
  loadStatus: 'complete' as 'complete' | 'error' | 'noConfig' | 'noSelect',
  lazyload: false,
  loading: false,
});

const LOAD_TEXT_OPTIONS = computed(() => ({
  complete: t('common.infiniteLoading.complete'),
  error: t('common.infiniteLoading.error'),
  noSelect: t('common.infiniteLoading.noSelect'),
  noConfig: t('pages.film.infiniteLoading.noConfig'),
}));

onMounted(() => getSetting());

onActivated(() => {
  emitter.off(emitterChannel.REFRESH_FILM_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_FILM_CONFIG, reloadConfig);

  emitter.off(emitterChannel.SEARCH_FILM_RECOMMEND, onSearchRecommend);
  emitter.on(emitterChannel.SEARCH_FILM_RECOMMEND, onSearchRecommend);
});

const changeFilterEvent = (key: string, value: string | number) => {
  active.value.filter[key] = value;

  resetPagination();

  filmList.value = [];
  infiniteId.value = Date.now();

  active.value.filterPopup = false;
};

const resetFilter = () => {
  if (!isObject(filterData.value) || isObjectEmpty(filterData.value)) return;

  const currentFilters = filterData.value[active.value.class] || [];

  const result = currentFilters.reduce((o, { key, value }) => {
    o[key] = value[0]?.v ?? '全部';
    return o;
  }, {});

  active.value.filter = result;
};

const handleFilterVisible = () => {
  const status = active.value.filterPopup;

  active.value.filterPopup = !status;
};

const handleFilterPopupVisible = (_visible: boolean, context: PopupVisibleChangeContext) => {
  if (context.trigger === 'document') {
    active.value.filterPopup = false;
  }
};

const collateSearchSite = (type: string, source: IModels['site']): IModels['site'][] => {
  let query = config.value.list.filter((item) => Boolean(item.search));
  if (type === 'site') query = query.filter((item) => item.id === source.id);
  if (type === 'group') query = query.filter((item) => item.group === source.group);
  return query;
};

const resetPagination = () => {
  pagination.value.pageIndex = 1;
  pagination.value.total = 0;
};

const getSetting = async () => {
  try {
    const resp = await fetchSiteActive();
    if (resp?.default) {
      config.value.default = resp.default;
      active.value.nav = resp.default.id;
    }
    if (resp?.list) config.value.list = resp.list;
    if (resp?.extra) config.value.extra = resp.extra;

    active.value.loadStatus =
      resp?.default && resp.list.length ? 'complete' : resp.list.length ? 'noSelect' : 'noConfig';
  } catch (error) {
    console.error(`Failed to get site config:`, error);
    active.value.loadStatus = 'error';
  } finally {
    active.value.lazyload = true;
  }
};

const getCmsHome = async (source: IModels['site']): Promise<number> => {
  const resp = await fetchCmsHome({ uuid: source.id });

  if (isArray(resp.class) && !isArrayEmpty(resp.class)) {
    classList.value = [
      { type_id: '', type_name: computed(() => t('common.recommend')) },
      ...resp.class.map((item) => ({
        type_id: item.type_id,
        type_name: item.type_name,
      })),
    ];
    active.value.class = classList.value[0].type_id;
  }

  if (isObject(resp.filters) && !isObjectEmpty(resp.filters)) {
    filterData.value = resp.filters;
    resetFilter();
  }

  return resp.class.length;
};

const getCmsCategory = async (source: IModels['site']): Promise<number> => {
  const { pageIndex } = pagination.value;

  const tid = active.value.folder || active.value.class;
  const f = active.value.filter || {};

  const resp = await fetchCmsCategory({
    uuid: source.id,
    tid,
    page: pageIndex,
    extend: String(JSON.stringify(f)),
  });

  if (isArray(resp.list) && !isArrayEmpty(resp.list)) {
    resp.list = differenceBy(resp.list, filmList.value, (item: ICmsInfo) => item.vod_id);
    filmList.value.push(...resp.list);
  }
  if (resp.total) pagination.value.total = resp.total;

  return resp.list.length;
};

const loadMoreCategory = async (): Promise<number> => {
  const source = config.value.default;

  if (!isArray(classList.value) || isArrayEmpty(classList.value)) {
    const length = await getCmsHome(source);
    if (length < 1) active.value.loadStatus = 'error';
    return length;
  }

  return await getCmsCategory(source);
};

const loadMoreSearch = async (): Promise<number> => {
  const { pageIndex } = pagination.value;
  const searchCurrentId = active.value.searchCurrent;
  const searchSiteList = config.value.searchList;
  const searchCurrentIndex = searchSiteList.findIndex((item) => item.id === searchCurrentId);
  const isLastSearchSite = searchCurrentIndex + 1 >= searchSiteList.length;

  const switchNextSearchSite = (): number => {
    resetPagination();

    if (isLastSearchSite) {
      return 0;
    } else {
      active.value.searchCurrent = searchSiteList[searchCurrentIndex + 1].id;
      return 1;
    }
  };

  try {
    if (isLastSearchSite) return 0;

    const resp = await fetchCmsSearch({
      uuid: searchCurrentId,
      wd: searchValue.value,
      page: pageIndex,
    });

    if (!isArray(resp.list) || isArrayEmpty(resp.list)) {
      return switchNextSearchSite();
    }

    resp.list = differenceBy(resp.list, filmList.value, (item: ICmsInfo) => item.vod_id);
    if (isArrayEmpty(resp.list)) {
      return switchNextSearchSite();
    }

    filmList.value.push(
      ...resp.list.map((item) => ({
        ...item,
        relateSite: searchSiteList[searchCurrentIndex],
      })),
    );

    pagination.value.pageIndex++;
    return resp.list;
  } catch (error) {
    console.error('Failed to load search data:', error);
    return switchNextSearchSite();
  }
};

const loadMore = async ($state: ILoadStateHdandler) => {
  try {
    if (active.value.loadStatus !== 'complete') {
      $state.complete();
      return;
    }

    const length = searchValue.value ? await loadMoreSearch() : await loadMoreCategory();

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

const playEvent = async (item) => {
  active.value.loading = true;

  try {
    const site = item?.relateSite ? item.relateSite : config.value.default;

    if (['folder', 'action'].includes(item.vod_tag)) {
      handleCmsTag(item.vod_tag, item);
      return;
    }
    active.value.folder = '';

    const resp = await fetchCmsDetail({ uuid: site.id, ids: item.vod_id });
    if (
      !isArray(resp.list) ||
      isArrayEmpty(resp.list) ||
      !isObject(resp.list[0]?.vod_episode) ||
      isObjectEmpty(resp.list[0]?.vod_episode)
    ) {
      MessagePlugin.warning(t('pages.film.message.noDetailInfo'));
      return;
    }

    const info = {
      ...resp.list[0],
      ...(resp.list[0]?.vod_id ? {} : { vod_id: item.vod_id }),
      ...(resp.list[0]?.vod_name ? {} : { vod_name: item.vod_name }),
      ...(resp.list[0]?.vod_pic ? {} : { vod_pic: item.vod_pic }),
    };

    const player = storePlayer.player;

    if (player.type === 'custom') {
      playWithExternalPlayer(info, site);
    } else {
      playWithInternalPlayer(info, site);
    }
  } catch (error) {
    console.error('Failed to play:', error);
    MessagePlugin.error(`${t('common.error')}: ${(error as Error).message}`);
  } finally {
    active.value.loading = false;
  }
};

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
    data: {
      info: item,
      extra: { active, site: config.value.list },
    },
  });

  window.electron.ipcRenderer.invoke(IPC_CHANNEL.WINDOW_PLAYER);
};

const handleCmsTag = (type: 'folder' | 'action', doc: ICmsInfo) => {
  const helper = {
    folder: handleCmsTagFolder,
    action: handleCmsTagAction,
  };

  helper?.[type]?.(doc);
};

const handleCmsTagFolder = (doc: ICmsInfo) => {
  resetPagination();

  const prefixPath = folderBreadcrumb.value.map((item) => item.value).join('');
  folderBreadcrumb.value.push(
    doc.vod_id.startsWith(prefixPath)
      ? {
          label: doc.vod_name,
          value: doc.vod_id,
        }
      : { label: doc.vod_name, value: doc.vod_id },
  );

  active.value.folder = doc.vod_id;

  filmList.value = [];

  infiniteId.value = Date.now();
};

const handleCmsTagAction = (_doc: ICmsInfo) => {};

const handleSearch = async () => {
  filmList.value = [];
  classList.value = [];
  filterData.value = {};
  active.value.searchCurrent = config.value.searchList?.[0]?.id || '';
  resetPagination();
  infiniteId.value = Date.now();
};

const onSearchRecommend = (eventData: { source: string; data: any }) => {
  const {
    source,
    data: { kw, group, filter },
  } = eventData;
  if (source === emitterSource.PAGE_SHOW) return;

  searchValue.value = kw;
  config.value.extra.filter = filter;
  config.value.extra.search = group;
  config.value.searchList = collateSearchSite(group, config.value.default);

  if (isArrayEmpty(config.value.searchList)) {
    MessagePlugin.warning(t('pages.film.message.noEffectiveSearchSource'));
    return;
  }

  handleSearch();
};

const onClassChange = (id: string) => {
  resetPagination();

  active.value.folder = '';
  active.value.class = id;
  active.value.filter = {};

  filmList.value = [];
  folderBreadcrumb.value = [];

  resetFilter();

  infiniteId.value = Date.now();
};

const defaultConfig = () => {
  resetPagination();

  searchValue.value = '';

  active.value.lazyload = false;
  active.value.loadStatus = 'complete';
  active.value.folder = '';
  active.value.class = '';
  active.value.nav = '';
  active.value.filter = {};

  classList.value = [];
  filterData.value = {};
  filmList.value = [];
  folderBreadcrumb.value = [];

  config.value.default = {};

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
    config.value.default = config.value.list.find((item) => item.id === id);
  } catch (error) {
    console.error(`Failed to change config:`, error);
  } finally {
    active.value.lazyload = true;
  }
};

const handleFolderBreadcrumbClick = (item: { label: ICmsInfo['vod_name']; value: ICmsInfo['vod_id'] }) => {
  resetPagination();

  const index = folderBreadcrumb.value.findIndex((i) => i.value === item.value);
  folderBreadcrumb.value = folderBreadcrumb.value.slice(0, index + 1);
  active.value.folder = item.value;

  filmList.value = [];

  infiniteId.value = Date.now();
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      white-space: nowrap;
      gap: var(--td-size-4);
      padding: 0 var(--td-comp-paddingLR-s) 0 0;

      .left-op-container {
        flex: 1;
        width: 100%;
        overflow: hidden;

        .nav {
          width: 100%;
          flex-grow: 0;
          flex-shrink: 0;
        }
      }

      .right-op-container {
        flex-grow: 0;
        flex-shrink: 0;
      }
    }

    .breadcrumb {
      height: var(--td-comp-size-m);
      margin: auto var(--td-comp-paddingLR-s) auto 0;
      padding: 0 0 0 var(--td-comp-paddingLR-s);
      border-radius: var(--td-radius-medium);
      background-color: var(--td-bg-color-component);

      :deep(.t-breadcrumb__item) {
        .t-breadcrumb--text-overflow .t-breadcrumb__inner:hover {
          color: var(--td-text-color-primary);
          cursor: pointer;
        }
      }
    }

    .filter-wrapper {
      height: auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--td-size-4);
      overflow-y: auto;

      .filter-content {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: baseline;
        gap: var(--td-size-4);

        .title {
          flex-shrink: 0;
          padding: 0 var(--td-comp-paddingLR-s);
        }

        .tags {
          display: flex;
          flex-flow: wrap;
          overflow: hidden;
          gap: var(--td-size-4);

          .tag {
            display: inline-block;
            padding: 0 var(--td-comp-paddingTB-s);
            color: var(--td-text-color-secondary);
            text-align: center;
            cursor: pointer;

            &:hover {
              color: var(--td-text-color-primary);
            }
          }

          .active {
            color: var(--td-text-color-primary);
            border-radius: var(--td-radius-round);
            background-color: var(--td-bg-color-component);
          }
        }
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
            padding-top: 128%;
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
