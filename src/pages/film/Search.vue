<template>
  <div class="search">
    <t-popup
      attach=".search"
      destroy-on-close trigger="focus"
      :overlay-inner-style="{
        width: '146px',
        lineHeight: '46px',
        padding: '5px 0',
        zIndex: '999',
        background: 'var(--td-bg-color-page)',
        boxShadow: '0 15px 30px rgba(0,0,0,.2)',
        maxHeight: '560px',
        overflow: 'auto'
      }"
    >
      <t-input v-model="searchTxt" placeholder="搜索全网资源" clearable
        @enter="searchEvent"
        @focus="focusEvent"
        @clear="searchEvent"
        class="search-bar"
      >
        <template #prefix-icon>
          <search-icon size="16px" />
        </template>
      </t-input>
      <template #content>
        <div class="search-result-history">
          <div class="search-result-title">
            历史搜索
            <a class="search-result-clear" @click.stop="clearSearchHistory">
              <delete-icon />
              <span>清除</span>
            </a>
          </div>
          <a
            v-for="(item, index) in searchList"
            :key="index"
            class="search-result-item search-item-history"
            @click="searchHotEvent(item.title)"
          >
            <div class="search-result-simple">
              <span class="search-result-text">{{ item.title }}</span>
            </div>
            <span class="search-result-delete" @click.stop="deleteSearchHistory(item.id)">
              <close-icon />
            </span>
          </a>
        </div>
        <div class="search-result-hot">
          <div class="search-result-title">热门搜索</div>
          <a
            v-for="(item, index) in hotList"
            :key="index"
            class="search-result-item"
            @click="searchHotEvent(item.vod_name)"
          >
            <div class="search-result-simple">
              <em :class="['search-result-num',`search-result-num${index + 1}`]">{{ index + 1 }}</em>
              <span class="search-result-text">{{ item.vod_name }}</span>
            </div>
          </a>
        </div>
        <t-divider style="margin: 0" />
        <div class="search-result-more">
          <div class="search-result-title cursor" @click="openHotDialog">更多热门搜索</div>
        </div>
      </template>
    </t-popup>
    <hot-view v-model:visible="isDialogHot" @search="searchHotEvent" />
  </div>
</template>

<script setup lang="ts">
import { SearchIcon, DeleteIcon, CloseIcon } from 'tdesign-icons-vue-next';
import { ref, watch } from 'vue';
import _ from 'lodash';

import { setting, searchHistory } from '@/lib/dexie';
import zy from '@/lib/utils/tools';

import HotView from './Hot.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  site: {
    type: Object,
    default: () => ({}),
  },
});

const formData = ref(props.site); // 接受父组件参数
const hotList = ref([]); // 热播列表
const searchList = ref([]); //  搜索列表

const searchTxt = ref(props.modelValue);
const isFocus = ref(false);
const isChange = ref(false);
const isDialogHot = ref(false);

const searchRef = ref(null);

const emit = defineEmits(['update:modelValue', 'search']);

watch(
  () => props.site,
  (val) => {
    formData.value = val;
    isChange.value = true;
  },
);

watch(
  () => props.modelValue,
  (val) => {
    searchTxt.value = val;
  },
);

const getSearchRecommend = async () => {
  const searchRecommend = await setting.get('defaultSearchRecommend');
  const { key } = formData.value;

  if (searchRecommend === 'site') {
    hotList.value = await zy.hot(key, 24 * 7);
  } else if (searchRecommend === 'douban') {
    hotList.value = await zy.doubanHot('tv', '热门', 10, 0);
  } else if (searchRecommend === 'quark') {
    hotList.value = await zy.quarkHot();
  } else if (searchRecommend === 'baidu') {
    hotList.value = await zy.baiduHot();
  }
  if (hotList.value.length > 9) hotList.value = hotList.value.slice(0, 9);

  isChange.value = false;
};

const focusEvent = async () => {
  isFocus.value = true;
  if (isChange.value) await getSearchRecommend();
  getSearchHistory();
};

const searchHotEvent = (kw: string) => {
  searchTxt.value = kw;
  emit('update:modelValue', kw);
  searchEvent();
};

const searchEvent = () => {
  emit('update:modelValue', searchTxt.value)
  emit('search');
  if (searchTxt.value) addSearchHistory(searchTxt.value)
  isFocus.value = false;
};

const getSearchHistory = async () => {
  const res = await searchHistory.pagination(0, 5);
  searchList.value = res;
}

const addSearchHistory = async (item) => {
  const doc = {
    title: item,
    type: 'film'
  };
  const isFind = _.findIndex(searchList.value, doc);
  if (isFind === -1) {
    searchList.value.unshift(doc);
    await searchHistory.add(doc);
  }
}

const deleteSearchHistory = async (id) => {
  await searchHistory.remove(id);
  await getSearchHistory();
}

const clearSearchHistory = async () => {
  await searchHistory.clear();
  searchList.value = [];
}

const openHotDialog = () => {
  isDialogHot.value = true;
  isFocus.value = false;
};
</script>

<style lang="less" scoped>
.search-item-history {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  &:hover {
    padding: 0 28px 0 15px;
    .search-result-delete {
      display: inline-block;
    }
  }
  .search-result-delete {
    display: none;
    position: absolute;
    top: 0;
    right: 12px;
    width: 12px;
    height: 32px;
  }
}

.search-result-title {
  color: var(--td-text-color-placeholder);
  font-weight: 700;
  height: 32px;
  padding: 0 10px 0 15px;
  line-height: 32px;
  font-size: 14px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.cursor {
  cursor: pointer;
}

.search-result-item {
  display: block;
  height: 32px;
  padding: 0 10px 0 15px;
  line-height: 32px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    color: var(--td-brand-color);
    background-color: rgba(132, 133, 141, 0.16);
  }
  .search-result-simple {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--td-text-color-primary);
    .search-result-num {
      width: 18px;
      height: 18px;
      color: hsla(0,0%,100%,.9);
      border-radius: 2px;
      background-color: rgba(132, 133, 141, 0.16);
      margin-right: 10px;
      line-height: 18px;
      display: inline-block;
      text-align: center;
    }
    .search-result-num1, .search-result-num2, .search-result-num3 {
      background-image: linear-gradient(233deg,#00d099,#00cc4c);
    }
  }
}
</style>
