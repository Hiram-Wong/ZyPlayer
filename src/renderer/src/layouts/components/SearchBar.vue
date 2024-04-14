<template>
  <div class="search-bar">
    <!-- <t-input v-model="searchValue" placeholder="搜索全网资源" clearable
        @enter="searchEvent"
        @focus="focusEvent"
        @clear="searchEvent"
        class="search-bar"
      >
      <template #prefix-icon>
        <search-icon size="16px" />
      </template>
    </t-input> -->
    <t-input-adornment style="height: 30px">
      <template #prepend>
        <t-select autoWidth v-model="active.type" class="search-select">
          <t-option key="film" :label="$t('pages.search.film')" value="film" />
          <t-option key="iptv" :label="$t('pages.search.iptv')" value="iptv" />
        </t-select>
      </template>
      <template #append>
        <search-icon size="large"/>
      </template>
      <t-popup placement="bottom-right" :visible="isVisible.popup" :on-visible-change="popupVisibleEvent">
        <t-input :placeholder="$t('pages.search.searchPlaceholder')" class="search-input" :on-focus="focusEvent" v-model="searchValue" :on-enter="searchEvent"/>
        <template #content>
          <div class="search-content">
            <div class="history" v-show="searchList.length > 0">
              <div class="history-nav">
                <div class="history-title">{{ $t('pages.search.searchHistory') }}</div>
                <div class="history-clear" @click.stop="clearSearchHistory">
                  <delete-icon />
                </div>
              </div>
              <div class="history-content">
                <t-tag class="nav-item" shape="round" variant="outline" v-for="(item, index) in searchList" :key="index" @click="searchEvent(item.title)">{{ item.title }}</t-tag>
              </div>
            </div>
            <div class="hot">
              <div class="hot-nav">
                <span :class="['nav-item', item.key === active.flag ? 'nav-item-active' : '']" v-for="item in hotConfig.hotOption" :key="item.key" @click="changeHotSource(item.key)">{{ item.name }}</span>
              </div>
              <div class="hot-content">
                <template v-for="i in 5" :key="i">
                  <t-skeleton theme="text" :loading="isVisible.load" class="news-skeleton" />
                </template>
                <div v-if="!isVisible.load">
                  <div v-if="hotConfig.hotData.length !== 0" class="hot-data">
                    <div
                      v-for="(item, index) in hotConfig.hotData"
                      :key="item.vod_id"
                      class="rax-view-v2 hot-item"
                      @click="searchEvent(item.vod_name)"
                    >
                      <div class="normal-view" :class="[index in [0, 1, 2] ? `color-${index + 1}` : '']">
                        <div class="normal-index">{{ index + 1 }}</div>
                        <div class="normal-title no-warp">{{ item.vod_name }}</div>
                        <div class="normal-tip">{{ item.vod_hot }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty">
                    <div class="image" style="width: 200px" v-html="emptyImage"></div>
                    <div class="desc">
                      <p>暂无近三天数据, 请查看其他分类!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </t-popup>
    </t-input-adornment>
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import moment from 'moment';
import { DeleteIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { kyLiveHot, enlightentHot } from '@/utils/hot';
import { fetchHistoryList, clearHistorySearchList, addHistory } from '@/api/history';
import { fetchSettingDetail } from '@/api/setting';

import CONFIG from '@/config/hotClass';
import emptyImage from '@/assets/empty.svg?raw';

const router = useRouter();

const hotReloadeventBus = useEventBus<string>('hot-reload');
const filmSearchEmitReload = useEventBus<string>('film-search');
const channelSearchEmitReload = useEventBus<string>('channel-search');

const isVisible = reactive({
  load: true,
  popup: false
});

const active = reactive({
  type: 'film',
  flag: ''
});

const searchList = ref([]);

const searchValue = ref('');

const hotConfig = reactive({
  hotType: '',
  hotName: '',
  hotUrl: '',
  hotClass: 'episode',  // 仅酷云[旧]生效
  hotSource: 1,
  hotUpdateTime: moment().format('YYYY-MM-DD'),
  hotData: [],
  hotOption: [] || {},
})

const focusEvent = async () => {
  getSearchHistory();
  getSetConfig();
  isVisible.popup = true;
};

// 获取搜索历史
const getSearchHistory = async () => {
  const res = await fetchHistoryList(0, 5, 'search');
  searchList.value = res.data;
}

// 清空搜索历史
const clearSearchHistory = async () => {
  await clearHistorySearchList();
  searchList.value = [];
}

// 热播映射
const hotTypeMappings = {
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

// 获取设置配置
const getSetConfig = async()=>{
  const res = await fetchSettingDetail('defaultHot');
  const hotType = res.value;
  
  hotConfig.hotType = hotType;
  if (hotType in hotTypeMappings) {
    const { hotUpdateTime, hotSource } = hotTypeMappings[hotType];
    hotConfig.hotUpdateTime = hotUpdateTime();
    hotConfig.hotSource = hotSource;
    hotConfig.hotName = CONFIG[hotType].name;
    hotConfig.hotUrl = CONFIG[hotType].url;
    hotConfig.hotOption = CONFIG[hotType].data;
    active.flag = hotConfig.hotOption[0].key;
  }

  getHotList();
}

// 切换数据源
const changeHotSource = (flag) => {
  hotConfig.hotSource = flag;
  active.flag = flag;
  isVisible.load = true;
  hotConfig.hotData = [];
  getHotList();
};

// 获取数据
const getHotList = async (retryCount = 1) => {
  try {
    const retryLimit = 4; // 重试次数 实际为 3 次
    const date = moment().subtract(retryCount, 'days');
    const dateFormat = hotConfig.hotType === 'enlightent' ? date.format('YYYY/MM/DD') : date.format('YYYY-MM-DD');

    let queryHotList;
    switch(hotConfig.hotType) {
      case 'kylive':
        queryHotList = await kyLiveHot(dateFormat, 2, hotConfig.hotSource);
        break;
      case 'enlightent':
        queryHotList = await enlightentHot(dateFormat, 'allHot', hotConfig.hotSource, 1);
        break;
    }

    if (_.size(queryHotList)) {
      isVisible.load = false;
      hotConfig.hotData = queryHotList;
      hotConfig.hotUpdateTime = dateFormat;
    } else {
      if (retryCount < retryLimit) {
        await getHotList(retryCount + 1);  // 递归请求
      } else {
        isVisible.load = false;
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
  if (item && _.findIndex(searchList.value, {title: item}) === -1) {
    const doc = {
      date: moment().unix(),
      title: item,
      type: 'search'
    };
    const searchListSize = _.size(searchList.value);
    if (searchListSize <= 5) {
      searchList.value.unshift(doc);
    } else {
      searchList.value.unshift(doc);
      searchList.value.pop();
    }
    addHistory(doc);
  }
  
  if (active.type === 'film') {
    router.push({
      name: 'FilmIndex',
    })
    filmSearchEmitReload.emit(searchValue.value);
  } else {
    router.push({
      name: 'IptvIndex',
    })
    channelSearchEmitReload.emit(searchValue.value);
  };

  isVisible.popup = false;
};

const popupVisibleEvent = (_, context) => {
  if (context.trigger === 'document') {
    isVisible.popup = false;
  }
}

// 监听设置变更
hotReloadeventBus.on(() => {
  hotConfig.hotData = [];
  getSetConfig()
});
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

:deep(.t-input-adornment__prepend) {
  border-radius: 50px 0 0 50px;
  background: var(--td-bg-content-input);
  height: 32px;
}
:deep(.t-input-adornment__append) {
  height: 32px;
  background: var(--td-bg-content-input);
  border-radius: 0 50px 50px 0;
  text-align: center;
  display: flex;
  align-items: center;
  padding-right: 6px;
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
  :deep(.t-input) {
    height: 32px;
    border-style: none;
    background: var(--td-bg-content-input);
    box-shadow: none;
    &.t-is-focused .t-input__prefix > .t-icon {
      color: var(--td-text-color-placeholder);
    }
  }
}

.empty {
  height: 360px;
  --el-empty-fill-color-0: #fff;
  --el-empty-fill-color-1: #fcfcfd;
  --el-empty-fill-color-2: #f8f9fb;
  --el-empty-fill-color-3: #f7f8fc;
  --el-empty-fill-color-4: #eeeff3;
  --el-empty-fill-color-5: #edeef2;
  --el-empty-fill-color-6: #e9ebef;
  --el-empty-fill-color-7: #e5e7e9;
  --el-empty-fill-color-8: #e0e3e9;
  --el-empty-fill-color-9: #d5d7de;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  box-sizing: border-box;
  padding: var(--td-comp-paddingTB-xxl) 0;
  .desc {
    margin-top: var(--td-comp-margin-xl);
    p {
      margin: 0;
      font-size: var(--td-font-size-title-small);
      font-weight: 500;
      color: var(--el-text-color-secondary);
    }
  }
}

:root[theme-mode='dark'] {
  .empty {
    --el-empty-fill-color-0: #000;
    --el-empty-fill-color-1: #4b4b52;
    --el-empty-fill-color-2: #36383d;
    --el-empty-fill-color-3: #1e1e20;
    --el-empty-fill-color-4: #262629;
    --el-empty-fill-color-5: #202124;
    --el-empty-fill-color-6: #212224;
    --el-empty-fill-color-7: #1b1c1f;
    --el-empty-fill-color-8: #1c1d1f;
    --el-empty-fill-color-9: #18181a;
  }
}
</style>