<template>
  <div class="search-bar" v-if="route.name === 'FilmIndex' || route.name === 'IptvIndex' || route.name === 'AnalyzeIndex'">
    <t-popup placement="bottom-right" :visible="active.popup" :on-visible-change="popupVisibleEvent">
      <t-input :placeholder="$t('pages.search.searchPlaceholder')" class="search-input" clearable v-model="searchValue"
        :on-enter="searchEvent" :on-click="focusEvent" @clear="searchEvent(searchValue)">
        <template #label>
          <t-select auto-width v-model="active.filmGroupType" class="search-select"
            v-if="activeRouteName === 'FilmIndex'" @click.stop>
            <t-option key="site" :label="$t('pages.search.site')" value="site" />
            <t-option key="group" :label="$t('pages.search.group')" value="group" />
            <t-option key="all" :label="$t('pages.search.all')" value="all" />
          </t-select>
        </template>
        <template #suffixIcon>
          <search-icon @click="searchEvent(searchValue)" style="cursor: pointer;" />
        </template>
      </t-input>
      <template #content v-if="activeRouteName === 'FilmIndex' || activeRouteName === 'AnalyzeIndex'">
        <div class="search-content">
          <div class="history" v-show="searchList.length > 0">
            <div class="history-nav">
              <div class="history-title">{{ $t('pages.search.searchHistory') }}</div>
              <div class="history-clear" @click.stop="clearSearchHistory">
                <delete-icon />
              </div>
            </div>
            <div class="history-content">
              <t-tag class="nav-item" shape="round" variant="outline" v-for="(item, index) in searchList" :key="index"
                @click="searchEvent(item.videoName)">{{ item.videoName }}</t-tag>
            </div>
          </div>
          <div class="hot">
            <div class="hot-nav">
              <span :class="['nav-item', item.key === active.flag ? 'nav-item-active' : '']"
                v-for="item in hotConfig.hotOption" :key="item.key" @click="changeHotSource(item.key)">{{ item.name
                }}</span>
            </div>
            <div class="hot-content">
              <t-skeleton :row-col="rowCol" :loading="active.hotLoad"></t-skeleton>
              <div v-if="!active.hotLoad">
                <div v-if="hotConfig.hotData.length !== 0" class="hot-data">
                  <div v-for="(item, index) in hotConfig.hotData" :key="item.vod_id" class="rax-view-v2 hot-item"
                    @click="searchEvent(item.vod_name)">
                    <div class="normal-view" :class="[index in [0, 1, 2] ? `color-${index + 1}` : '']">
                      <div class="normal-index">{{ index + 1 }}</div>
                      <div class="normal-title no-warp">{{ item.vod_name }}</div>
                      <div class="normal-tip">{{ item.vod_hot }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty">
                  <t-empty :title="$t('pages.search.hotNoData')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </t-popup>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { DeleteIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import emitter from '@/utils/emitter';
import { fetchHistoryPage, delHistory, addHistory } from '@/api/history';
import { fetchSettingDetail } from '@/api/setting';
import { fetchHotPage } from '@/api/site';

import CONFIG from '@/config/hotClass';

const route = useRoute();

const active = ref({
  filmGroupType: 'site',
  filmFilterType: 'off',
  flag: '',
  hotType: '',
  setLoad: false,
  hotLoad: true,
  popup: false
});
const hotConfig = reactive({
  hotName: '',
  hotUrl: '',
  hotClass: 'episode',  // 仅酷云[旧]生效
  hotSource: 1,
  hotUpdateTime: moment().format('YYYY-MM-DD'),
  hotData: [],
  hotOption: [],
}) as any;
const searchList = ref<any []>([]);
const searchValue = ref<string>('');
const activeRouteName = computed(() => route.name);

watch(
  () => activeRouteName.value, async (newVal) => {
    if (newVal === 'FilmIndex' && !active.value.setLoad) await getFilmSet();
    searchValue.value = '';
    active.value.popup = false;
    active.value.hotLoad = true;
  }
);

onMounted(async () => {
  if (activeRouteName.value === 'FilmIndex' && !active.value.setLoad) await getFilmSet();
});

const rowCol = [
  { type: 'text', width: '100%', height: '22px' },
  { type: 'text', width: '100%', height: '22px' },
  { type: 'text', width: '100%', height: '22px' },
  { type: 'text', width: '100%', height: '22px' },
]

const focusEvent = async () => {
  if (activeRouteName.value === 'FilmIndex' || activeRouteName.value === 'AnalyzeIndex') {
    getSearchHistory();
    getHotList();
    active.value.popup = true;
  }
};

// 获取搜索历史
const getSearchHistory = async () => {
  const res = await fetchHistoryPage({
    page: 1,
    pageSize: 5,
    type: 'search'
  });
  if (res.hasOwnProperty('list')) searchList.value = res.list;
}

// 清空搜索历史
const clearSearchHistory = async () => {
  await delHistory({ type: 'search' });
  searchList.value = [];
}

// 热播映射
const hotTypeMappings = {
  komect: {
    hotUpdateTime: () => moment().format('YYYY/MM/DD'),
    hotSource: '电影',
  },
  douban: {
    hotUpdateTime: () => moment().format('YYYY/MM/DD'),
    hotSource: 'tv_hot',
  },
  enlightent: {
    hotUpdateTime: () => moment().format('YYYY/MM/DD'),
    hotSource: 'tv',
  },
  kuyun: {
    hotUpdateTime: () => moment().format('YYYY-MM-DD'),
    hotSource: 1,
  },
  kylive: {
    hotUpdateTime: () => moment().format('YYYY-MM-DD'),
    hotSource: 0,
  },
};

const getSearchTypeSet = async () => {
  const searchRes = await fetchSettingDetail('defaultSearchType');
  if (searchRes) active.value.filmGroupType = searchRes;
  else active.value.filmGroupType = 'group';
};

const getFilterTypeSet = async () => {
  const filterRes = await fetchSettingDetail('defaultFilterType');
  active.value.filmFilterType = filterRes || false;
};

const getHotSet = async () => {
  const hotRes = await fetchSettingDetail('defaultHot');
  if (hotRes) {
    active.value.hotType = hotRes;
    if (hotRes in hotTypeMappings) {
      const { hotUpdateTime, hotSource } = hotTypeMappings[hotRes];
      hotConfig.hotUpdateTime = hotUpdateTime();
      hotConfig.hotSource = hotSource;
      hotConfig.hotName = CONFIG[hotRes].name;
      hotConfig.hotUrl = CONFIG[hotRes].url;
      hotConfig.hotOption = CONFIG[hotRes].data;
      active.value.flag = hotConfig.hotOption[0].key;
    }
  }
};

const getFilmSet = async () => {
  try {
    await Promise.all([getSearchTypeSet(), getFilterTypeSet(), getHotSet()]);
  } finally {
    active.value.setLoad = true;
  }
};

// 切换数据源
const changeHotSource = (flag) => {
  hotConfig.hotSource = flag;
  active.value.flag = flag;
  active.value.hotLoad = true;
  hotConfig.hotData = [];
  getHotList();
};

// 获取数据
const getHotList = async (retryCount = 1) => {
  try {
    const retryLimit = 4; // 重试次数 实际为 3 次
    const date = moment().subtract(retryCount, 'days');
    const type = active.value.hotType;
    const dateFormat = type === 'enlightent' ? date.format('YYYY/MM/DD') : date.format('YYYY-MM-DD');

    let queryHotDoc = {};
    switch (type) {
      case 'kylive':
        queryHotDoc = {
          date: dateFormat,
          type: 2,
          plat: hotConfig.hotSource
        };
        break;
      case 'enlightent':
        queryHotDoc = {
          date: dateFormat,
          sort: 'allHot',
          channelType: hotConfig.hotSource,
          day: 1
        };
        break;
      case 'douban':
        queryHotDoc = {
          type: hotConfig.hotSource,
          limit: 20,
          start: 0
        };
        break;
      case 'komect':
        queryHotDoc = {
          type: hotConfig.hotSource,
          limit: 20,
          start: 1
        };
        break;
    };

    const queryHotList = await fetchHotPage(queryHotDoc);

    if (queryHotList && queryHotList.length > 0) {
      active.value.hotLoad = false;
      hotConfig.hotData = queryHotList;
      hotConfig.hotUpdateTime = dateFormat;
    } else {
      if (retryCount < retryLimit) {
        await getHotList(retryCount + 1);  // 递归请求
      } else {
        active.value.hotLoad = false;
      }
    }
  } catch (err) {
    MessagePlugin.error(`error:${err}`);
    console.error(err);
  }
};

// 搜索资源
const searchEvent = async (item) => {
  searchValue.value = item;
  if (activeRouteName.value === 'FilmIndex' || activeRouteName.value === 'AnalyzeIndex') {
    if (item && searchList.value.findIndex(doc => doc.videoName === item) === -1) {
      const doc = {
        date: moment().unix(),
        videoName: item,
        type: 'search'
      };
      const searchListSize = searchList.value.length;
      if (searchListSize <= 5) {
        searchList.value.unshift(doc);
      } else {
        searchList.value.unshift(doc);
        searchList.value.pop();
      };
      addHistory(doc);
    }
  }
  switch (activeRouteName.value) {
    case 'FilmIndex':
      emitter.emit('searchFilm', { kw: item, group: active.value.filmGroupType, filter: active.value.filmFilterType });
      break;
    case 'IptvIndex':
      emitter.emit('searchIptv', item);
      break;
    case 'AnalyzeIndex':
      emitter.emit('searchAnalyze', item);
      break;
  }

  active.value.popup = false;
};

const popupVisibleEvent = (_, context) => {
  if (context.trigger === 'document') {
    active.value.popup = false;
  }
}

// 监听设置变更
const refreshHotConfig = async () => {
  console.log('[search][bus][hot-refresh]');
  hotConfig.hotData = [];
  active.value.popup = false;
  active.value.hotLoad = true;
  await getFilmSet();
};

const refreshSearchConfig = () => {
  console.log('[search][bus][search-refresh]');
  searchValue.value = '';
};

const isListenedRefreshHotConfig = emitter.all.get('refreshHotConfig');
if (!isListenedRefreshHotConfig) emitter.on('refreshHotConfig', refreshHotConfig);
const isListenedRefreshSearchConfig = emitter.all.get('refreshSearchConfig');
if (!isListenedRefreshSearchConfig) emitter.on('refreshSearchConfig', refreshSearchConfig);
</script>

<style lang="less" scoped>
:global(.t-popup__content) {
  box-shadow: var(--td-shadow-1);
  background-color: var(--td-bg-color-container);
}

.no-warp {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.search-content {
  width: 465px;
  padding: 15px;
  font-weight: 500;

  .history {
    margin-bottom: 10px;

    .history-nav {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      .history-title {
        font-weight: 700;
      }
    }

    .history-content {
      .nav-item {
        font-weight: 500;
        padding: 0 10px;
        margin: 0 5px 5px 0;
        cursor: pointer;
      }
    }
  }

  .hot {
    .hot-nav {
      margin-bottom: 10px;

      .nav-item {
        margin-right: 10px;
        cursor: pointer;
      }

      .nav-item-active {
        font-size: 1.2em;
        font-weight: 700;
        color: var(--td-brand-color-active);
      }
    }

    .hot-content {
      .hot-data {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        flex-wrap: wrap;

        .rax-view-v2 {
          width: 50%;
        }

        .hot-item {
          .normal-view {
            display: flex;
            padding-left: 5px;
            cursor: pointer;

            .normal-index {
              flex: 0.15;
            }

            .normal-title {
              flex: 0.8;
              word-break: break-all;
              display: -webkit-box;
              text-overflow: ellipsis;
              overflow: hidden;
            }

            .normal-tip {
              font-weight: 700;
            }
          }

          .color-1 {
            color: #f7534f;
          }

          .color-2 {
            color: #fa7b32;
          }

          .color-3 {
            color: #ffc63f;
          }

          &:hover {
            border-radius: 5px;
            background-color: var(--td-bg-color-component-hover);
          }
        }
      }
    }
  }
}

.search-select {
  :deep(.t-input) {
    border-style: none;
  }

  :deep(.t-input--focused) {
    border-style: none;
    box-shadow: none;
  }
}

.search-input {
  height: 32px;
  width: 250px;

  :deep(.t-input__prefix) {
    .t-input--suffix {
      padding: 0;
    }

    .t-input__inner {
      color: var(--td-text-color-placeholder);
      font-weight: 500;
    }

    .t-input__suffix:not(:empty) {
      margin-left: var(--td-comp-margin-xxs);
    }
  }

  :deep(.t-input) {
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    border-color: transparent;
    box-shadow: none;

    .t-input__inner::placeholder {
      color: var(--td-text-color-placeholder);
      font-weight: 500;
    }

    &.t-is-focused .t-input__prefix>.t-icon {
      color: var(--td-text-color-placeholder);
    }
  }
}
</style>
