<template>
  <div v-if="isSearchableRoute" class="search-panel">
    <t-popup
      placement="bottom"
      :attach="`.${attachContent}`"
      :z-index="20"
      hide-empty-popup
      :visible="isPopupVisible"
      :overlay-inner-style="{ borderRadius: 'var(--td-radius-large)' }"
      @visible-change="handlePopupVisible"
    >
      <t-input
        v-model="searchValue"
        :placeholder="$t('component.search.placeholder.input')"
        class="search-input"
        clearable
        @enter="handleSearch"
        @click="handleInputFocus"
        @clear.stop="handleSearch('')"
      >
        <template #label>
          <t-select
            v-if="activeRouteName === 'Film'"
            v-model="filmConfig.filmGroupType"
            auto-width
            class="search-select"
            @click.stop
          >
            <t-option key="site" :label="$t('pages.setting.base.site.searchMap.local')" value="site" />
            <t-option key="group" :label="$t('pages.setting.base.site.searchMap.group')" value="group" />
            <t-option key="all" :label="$t('pages.setting.base.site.searchMap.all')" value="all" />
          </t-select>
        </template>
        <template #suffixIcon>
          <search-icon />
        </template>
      </t-input>

      <template #content>
        <div v-if="(isSearchableRoute && historyList.length > 0) || isHotableRoute" class="search-recommend">
          <div v-show="isSearchableRoute && historyList.length > 0" class="search-recommend-top">
            <div class="search-textlist">
              <div class="search-textlist-title">{{ $t('component.search.history') }}</div>
              <div class="search-textlist-items">
                <div
                  v-for="(item, index) in historyList"
                  :key="index"
                  class="search-textlist-item txthide txthide1"
                  @click="handleSearch(item.videoName)"
                >
                  {{ item.videoName }}
                </div>
              </div>
              <t-button
                theme="default"
                shape="square"
                variant="text"
                class="search-recommend-top-icon"
                @click.stop="handleClearHistory"
              >
                <template #icon><delete-icon /></template>
              </t-button>
            </div>
          </div>

          <div v-show="isHotableRoute" class="search-recommend-bottom">
            <div class="search-hot-nav">
              <tag-nav :list="navOptions" :active="hotConfig.category" @change="handleSwitchHotTab" />
            </div>
            <div class="search-hot-content">
              <t-skeleton :row-col="SKELETON_CONFIG" :loading="hotConfig.load" />
              <template v-if="!hotConfig.load">
                <div v-if="hotList.length > 0" class="search-hot-list">
                  <div
                    v-for="(item, index) in hotList"
                    :key="item.vod_id"
                    class="search-hot-item"
                    @click="handleSearch(item.vod_name)"
                  >
                    <div class="search-hot-item_order" :class="`search-board-item_color${index + 1}`">
                      {{ index + 1 }}
                    </div>
                    <div class="search-hot-item_text txthide txthide1">{{ item.vod_name }}</div>
                    <div class="search-board-item_tag orange">{{ item.vod_hot }}</div>
                  </div>
                </div>
                <div v-else class="empty">
                  <t-empty />
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </t-popup>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'SearchPanel',
});

import { toSubtract, toYMD } from '@shared/modules/date';
import { DeleteIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { PopupVisibleChangeContext } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { fetchRecHot } from '@/api/film';
import { addHistory, delHistory, fetchHistoryPage } from '@/api/moment';
import { getSettingDetail } from '@/api/setting';
import TagNav from '@/components/tag-nav/index.vue';
import { emitterChannel, emitterSource } from '@/config/emitterChannel';
import { attachContent } from '@/config/global';
import HOT_CONFIG from '@/config/hot';
import { t } from '@/locales';
import emitter from '@/utils/emitter';

const RELATE_MAP = { Film: 1, Live: 2, Parse: 3 };
const SEARCHABLE_ROUTES = Object.keys(RELATE_MAP);
const POPUP_CONTENT_ROUTES = Object.keys(RELATE_MAP).filter((name) => !['Live'].includes(name));
const MAX_HISTORY_SIZE = 10;
const MAX_HOT_ITEMS = 10;
const MAX_RETRY_COUNT = 3;
const SKELETON_CONFIG = [...Array.from({ length: 4 })].map(() => ({
  type: 'text',
  width: '100%',
  height: '22px',
}));

const route = useRoute();

const filmConfig = ref({
  filmGroupType: 'site',
  filmFilterType: 'off',
});

const isPopupVisible = ref(false);

const hotList = ref<Array<{ vod_id: string; vod_name: string; vod_hot: string }>>([]);
const hotConfig = ref({
  category: 1,
  load: true,
  active: 'kylive',
});

const historyList = ref<any[]>([]);
const searchValue = ref('');

const activeRouteName = computed(() => route.name as string);
const isSearchableRoute = computed(() => SEARCHABLE_ROUTES.includes(activeRouteName.value));
const isHotableRoute = computed(() => POPUP_CONTENT_ROUTES.includes(activeRouteName.value));
const navOptions = computed(() =>
  HOT_CONFIG?.[hotConfig.value.active]?.category.map((category) => ({
    value: category,
    label: t(`component.hot.category.field.${category}`),
  })),
);

onMounted(() => {
  getFilmConf();

  emitter.off(emitterChannel.REFRESH_SEARCH_CONFIG, reloadConfig);
  emitter.on(emitterChannel.REFRESH_SEARCH_CONFIG, reloadConfig);

  emitter.off(emitterChannel.SEARCH_RECOMMEND, reloadKwConfig);
  emitter.on(emitterChannel.SEARCH_RECOMMEND, reloadKwConfig);
});

watch(
  () => activeRouteName.value,
  () => {
    isPopupVisible.value = false;
    searchValue.value = '';
    hotConfig.value.load = true;
  },
);

const getSiteConfig = async () => {
  try {
    const resp = await getSettingDetail('site');
    filmConfig.value.filmGroupType = resp?.searchMode || 'group';
    filmConfig.value.filmFilterType = resp?.filterMode || false;
  } catch (error) {
    console.error('Failed to load film config:', error);
  }
};

const getHotConfig = async () => {
  try {
    const resp = await getSettingDetail('hot');
    if (resp) {
      hotConfig.value.active = resp;
      hotConfig.value.category = HOT_CONFIG?.[resp]?.category?.[0] || 1;
    }
  } catch (error) {
    console.error('Failed to load hot config:', error);
  }
};

const getFilmConf = async () => {
  try {
    await Promise.all([getSiteConfig(), getHotConfig()]);
  } catch {}
};

const getHotList = async (retryCount: number = 1) => {
  try {
    const daysToSubtract = retryCount;
    const targetDate = toSubtract(daysToSubtract, 'day');
    const formattedDate = toYMD(targetDate);

    const resp = await fetchRecHot({
      source: hotConfig.value.active,
      date: formattedDate,
      type: hotConfig.value.category,
    });

    if (resp?.length) {
      hotList.value = resp.slice(0, MAX_HOT_ITEMS);
    } else {
      if (retryCount <= MAX_RETRY_COUNT) {
        await getHotList(retryCount + 1);
      }
    }
  } catch (error) {
    console.error('Failed to load hot list:', error);
  } finally {
    hotConfig.value.load = false;
  }
};

const getHistoryConfig = async () => {
  try {
    const resp = await fetchHistoryPage({
      page: 1,
      pageSize: MAX_HISTORY_SIZE,
      type: [5],
    });
    if (resp?.list) historyList.value = resp.list;
  } catch (error) {
    console.error('Failed to load search history:', error);
  }
};

const handleClearHistory = async () => {
  await delHistory({ type: [5] });
  historyList.value = [];
};

const handleInputFocus = async () => {
  if (!isSearchableRoute.value) return;

  await Promise.all([getHistoryConfig(), getHotList()]);

  isPopupVisible.value = true;
};

const handleSwitchHotTab = (type: number) => {
  hotConfig.value.category = type;
  hotConfig.value.load = true;
  hotList.value = [];

  getHotList();
};

const handleSearch = async (kw: string) => {
  searchValue.value = kw;

  const isDuplicate = historyList.value.some((item) => item.videoName === kw);
  if (kw && !isDuplicate) {
    const historyItem = {
      relateId: hotConfig.value.active,
      videoId: RELATE_MAP[activeRouteName.value] || 1,
      videoName: kw,
      type: 5,
    };

    historyList.value.unshift(historyItem);

    if (historyList.value.length > MAX_HISTORY_SIZE) {
      historyList.value.pop();
    }

    addHistory(historyItem);
  }

  const eventMap = {
    Film: () =>
      emitter.emit(emitterChannel.SEARCH_FILM_RECOMMEND, {
        source: emitterSource.LAYOUT_HEADER_SEARCH,
        data: {
          kw,
          group: filmConfig.value.filmGroupType,
          filter: filmConfig.value.filmFilterType,
        },
      }),
    Live: () =>
      emitter.emit(emitterChannel.SEARCH_LIVE_RECOMMEND, { source: emitterSource.LAYOUT_HEADER_SEARCH, data: kw }),
    Parse: () =>
      emitter.emit(emitterChannel.SEARCH_PARSE_RECOMMEND, { source: emitterSource.LAYOUT_HEADER_SEARCH, data: kw }),
  };

  eventMap[activeRouteName.value]?.();

  isPopupVisible.value = false;
};

const handlePopupVisible = (_visible: boolean, context: PopupVisibleChangeContext) => {
  if (context.trigger === 'document') {
    isPopupVisible.value = false;
  }
};

const reloadConfig = async (eventData: { source: string; data: any }) => {
  const { source } = eventData;
  if (source === emitterSource.LAYOUT_HEADER_SEARCH) return;

  hotList.value = [];
  hotConfig.value.load = true;
  isPopupVisible.value = false;

  searchValue.value = '';

  await getFilmConf();
};

const reloadKwConfig = async (eventData: { source: string; data: any }) => {
  const { source, data } = eventData;
  if (source === emitterSource.LAYOUT_HEADER_SEARCH) return;

  searchValue.value = data;
};
</script>
<style lang="less" scoped>
.search-panel {
  width: 250px;
  background: var(--td-bg-color-container-hover);
  border-radius: var(--td-radius-medium);

  .search-input {
    :deep(.t-input) {
      background-color: transparent;
      border-width: 0;
      box-shadow: none;
    }
  }
}

.search-recommend {
  width: 628px;
  padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);
  overflow: hidden;

  @media (width <= 1240px) {
    width: 483px;
  }

  .search-recommend-top {
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);

    .search-textlist {
      align-items: flex-start;
      display: flex;
      flex-direction: column;
      padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
      position: relative;
      width: 100%;

      .search-textlist-title {
        font-size: var(--td-font-size-title-medium);
        line-height: calc(var(--td-font-size-title-medium) + 1px);
      }

      .search-recommend-top-icon {
        align-items: center;
        cursor: pointer;
        display: flex;
        justify-content: center;
        position: absolute;
        right: var(--td-size-4);
        top: calc(0px - var(--td-size-1));
      }
    }

    .search-textlist-items {
      display: flex;
      flex-wrap: wrap;
      margin-top: var(--td-comp-margin-s);
      max-height: 68px;
      overflow: hidden;

      .search-textlist-item {
        background-color: var(--td-bg-color-secondarycontainer);
        border-radius: var(--td-radius-medium);
        cursor: pointer;
        height: 26px;
        line-height: 26px;
        margin-right: var(--td-comp-margin-s);
        margin-top: var(--td-comp-margin-s);
        max-width: 130px;
        padding: 0 var(--td-comp-paddingLR-xs);

        &:hover {
          border-radius: var(--td-radius-medium);
          background-color: var(--td-bg-color-component-hover);
        }
      }
    }
  }

  .search-recommend-bottom {
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);

    .search-hot-nav {
      .search-textlist-item {
        margin-right: 10px;
        cursor: pointer;
      }

      .search-textlist-item-active {
        font-size: 1.2em;
        font-weight: 700;
        color: var(--td-brand-color-active);
      }
    }

    .search-hot-content {
      .search-hot-list {
        column-count: 2;
        column-fill: auto;
        display: flex;
        flex-flow: column wrap;
        flex-grow: 1;
        height: 152px;

        @media (width <= 1240px) {
          column-count: 1;
        }

        .search-hot-item {
          align-items: center;
          break-inside: avoid;
          cursor: pointer;
          display: inline-flex;
          justify-content: flex-start;
          padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
          width: 50%;

          @media (width <= 1240px) {
            width: 100%;
          }

          .search-hot-item_order {
            flex: 0.15;
          }

          .search-hot-item_text {
            flex: 0.8;
          }

          .search-board-item_color1 {
            color: #f7534f;
          }

          .search-board-item_color2 {
            color: #fa7b32;
          }

          .search-board-item_color3 {
            color: #ffc63f;
          }

          &:hover {
            border-radius: var(--td-radius-medium);
            background-color: var(--td-bg-color-component-hover);
          }
        }
      }
    }
  }
}
</style>
