<template>
  <div class="film-container">
    <div class="header">
      <div class="left-operation-container">
        <div class="header-title-wrap">
          <div class="title">
            <t-select
              v-model="sitesListSelect"
              placeholder="暂无选择源"
              size="small"
              :show-arrow="false"
              style="max-width: 80px"
              class="data-item source"
              @change="changeSitesEvent"
            >
              <t-option v-for="item in sitesList" :key="item.id" :label="item.name" :value="item.id" />
            </t-select>
            <span class="data-item data"> 共{{ pagination.total || 0 }}资源 </span>
          </div>
        </div>
        <div v-if="classKeywords.length !== 1" class="head-center">
          <p class="head-center-class">{{ FilmSiteSetting.class.name }}</p>
          <t-popup
            placement="bottom-left"
            :overlay-inner-style="{
              marginTop: '16px',
              width: '570px',
              boxShadow: 'none',
              lineHeight: '46px',
              padding: '5px 0',
              zIndex: '999',
              background: 'var(--td-bg-color-page)',
            }"
            attach=".head-center"
          >
            <more-icon size="1.5rem" style="transform: rotate(90deg)" />
            <template #content>
              <div class="content-items">
                <div v-for="item in classKeywords" :key="item.type_id" class="content-item">
                  <span variant="text" @click="changeClassEvent(item)">
                    {{ item.type_name }}
                  </span>
                </div>
              </div>
            </template>
          </t-popup>
        </div>
      </div>
      <div class="right-operation-container">
        <search-view v-model="searchTxt" :site="FilmSiteSetting.basic" @search="searchEvent" />
        <div
          v-if="(FilmSiteSetting.basic.type === 2 && filter.data.length !== 0) || FilmSiteSetting.basic.type !== 2"
          class="quick_item quick_filter"
        >
          <view-module-icon size="large" @click="showToolbar = !showToolbar" />
        </div>
      </div>
    </div>
    <!-- 过滤工具栏 -->
    <div v-show="showToolbar" class="filter">
      <!-- drpy -->
      <div v-if="FilmSiteSetting.basic.type === 2" class="tags">
        <div v-for="filterItem in filter.data" :key="filterItem.key" class="tags-list">
          <div class="item title">{{ filterItem.name }}</div>
          <div class="wp">
            <div
              v-for="item in filterItem.value"
              :key="item"
              class="item"
              :class="{ active: filter.select[filterItem.key] === item.v }"
              :label="item.n"
              :value="item.v"
              @click="changeFilterEvent(filterItem.key, item.v)"
            >
              {{ item.n }}
            </div>
          </div>
        </div>
      </div>
      <!-- app -->
      <div v-else-if="FilmSiteSetting.basic.type === 3" class="tags">
        <div v-for="filterItem in filter.data[FilmSiteSetting.class.id]" :key="filterItem.class" class="tags-list">
          <template v-for="(items, key) in filterItem" :key="key">
            <div class="item title">{{ formatFilterTitle(key) }}</div>
            <div class="wp">
              <div
                v-for="item in items"
                :key="item"
                class="item"
                :class="{ active: filter.select[key] === item }"
                :label="item"
                :value="item"
                @click="changeFilterEvent(key, item)"
              >
                {{ item }}
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- cms -->
      <div v-else class="tags">
        <!-- 地区 -->
        <div class="tags-list">
          <div class="item title">地区</div>
          <div class="wp">
            <div
              v-for="item in areasKeywords"
              :key="item"
              class="item"
              :class="{ active: filter.select.area === item }"
              :label="item"
              :value="item"
              @click="changeFilterEvent('area', item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
        <!-- 日期 -->
        <div class="tags-list">
          <div class="item title">年份</div>
          <div class="wp">
            <div
              v-for="item in yearsKeywords"
              :key="item"
              class="item"
              :class="{ active: filter.select.year === item }"
              :label="item"
              :value="item"
              @click="changeFilterEvent('year', item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
        <!-- 排序 -->
        <div class="tags-list">
          <div class="item title">排序</div>
          <div class="wp">
            <div
              v-for="item in sortKeywords"
              :key="item"
              class="item"
              :class="{ active: filter.select.sort === item }"
              :label="item"
              :value="item"
              @click="changeFilterEvent('sort', item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="main-flow-wrap">
        <div v-for="item in FilmDataList.list" :key="item.id" class="card-wrap">
          <div class="card" @click="playEvent(item)">
            <div v-if="item.vod_remarks || item.vod_remark" class="card-header">
              <span class="card-header-tag card-header-tag-orange">
                <span class="card-header-tag-tagtext">{{ item.vod_remarks || item.vod_remark }}</span>
              </span>
            </div>
            <div class="card-main">
              <t-image
                class="card-main-item"
                :src="item.vod_pic"
                :style="{ width: '100%', height: '245px', background: 'none' }"
                :lazy="true"
                fit="cover"
              >
                <template #overlayContent>
                  <div class="op">
                    <span v-if="item.siteName"> {{ item.siteName }}</span>
                  </div>
                </template>
              </t-image>
            </div>
            <div class="card-footer">
              <p class="card-footer-title">{{ item.vod_name }}</p>
              <p class="card-footer-desc">{{ item.vod_blurb ? item.vod_blurb.trim() : '暂无剧情简介' }}</p>
            </div>
          </div>
        </div>
      </div>
      <infinite-loading
        :identifier="infiniteId"
        :distance="200"
        style="text-align: center; margin-bottom: 2em"
        @infinite="load"
      >
        <template #complete>{{ infiniteCompleteTip }}</template>
        <template #error>哎呀，出了点差错</template>
      </infinite-loading>
    </div>
    <hot-view v-model:visible="formDialogHot" :site="FilmSiteSetting.basic" />
    <t-back-top
      container=".main"
      :visible-height="200"
      size="small"
      :offset="['1.4rem', '0.5rem']"
      :duration="2000"
      :firstload="false"
    ></t-back-top>
  </div>
</template>
<script setup lang="ts">
import 'v3-infinite-loading/lib/style.css';

import { useEventBus } from '@vueuse/core';
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';
import { MoreIcon, ViewModuleIcon } from 'tdesign-icons-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { onMounted, reactive, ref } from 'vue';

import APP_FILTER_CONFIG from '@/config/appFilter';
import { setting, sites } from '@/lib/dexie';
import zy from '@/lib/utils/tools';
import { usePlayStore } from '@/store';

import HotView from './film/Hot.vue';
import SearchView from './film/Search.vue';

const ipcRenderer = useIpcRenderer();

const store = usePlayStore();
const infiniteId = ref(+new Date()); // infinite-loading此属性更改重置组件
const showToolbar = ref(false); // 是否显示筛选框 true显示 false隐藏
const searchTxt = ref(''); // 搜索框
const searchCurrentSite = ref(); // 搜索当前源
const sortKeywords = ['按更新时间', '按上映年份', '按片名']; // 过滤排序条件
const areasKeywords = ref(['全部']); // 过滤地区
const yearsKeywords = ref(['全部']); // 过滤年份
const classKeywords = ref([{ type_id: 0, type_name: '最新' }]); // 过滤类型
const AppFilterList = reactive([...APP_FILTER_CONFIG.appFilter]);

const formSiteData = ref({
  neme: '',
  key: '',
  type: 1,
}); // 详情组件源传参
const formDialogHot = ref(false); // dialog是否显示热播榜
const pagination = ref({
  pageIndex: 1,
  pageSize: 36,
  count: 0,
  total: 0,
}); // 分页请求
const FilmSiteSetting = ref({
  basic: {
    name: '',
    key: '',
    group: '',
    type: 1,
    search: 1,
    playUrl: '',
  },
  class: {
    id: 0,
    name: '最新',
  },
  change: false,
  searchType: 'site',
  searchGroup: [],
}); // 站点源设置
const FilmDataList = ref({
  list: [],
  rawList: [],
}); // Waterfall
const filter = ref({
  data: [],
  format: {},
  select: {
    site: '',
    sort: '按更新时间',
    class: '',
    area: '全部',
    year: '全部',
    date: [],
  },
});
const sitesList = ref([]); // 全部源
const sitesListSelect = ref(); // 选择的源
const isLoadClass = ref(false); // 是否加载 class
const infiniteCompleteTip = ref('没有更多内容了!');

onMounted(() => {
  getFilmSetting();
});

// cms筛选：基于已有数据
const filterEvent = () => {
  const { rawList } = FilmDataList.value;
  const { area, year, sort } = filter.value.select;

  const filteredData = rawList
    .filter((item) => area === '全部' || item.vod_area.includes(area))
    .filter((item) => year === '全部' || item.vod_year.includes(year))
    .sort((a, b) => {
      switch (sort) {
        case '按上映年份':
          return b.vod_year - a.vod_year;
        case '按片名':
          return a.vod_name.localeCompare(b.vod_name, 'zh-Hans-CN');
        default:
          return +new Date(b.vod_time) - +new Date(a.vod_time);
      }
    });

  // Get unique film data
  // const uniqueData = Array.from(new Set(filteredData));
  // FilmDataList.value.list = uniqueData;

  FilmDataList.value.list = filteredData;
};

// 非cms筛选：基于请求数据
const filterApiEvent = async () => {
  let filterFormat;
  if (FilmSiteSetting.value.basic.type === 2) {
    filterFormat = Object.entries(filter.value.select).reduce((item, [key, value]) => {
      if (value !== '' && value.length !== 0) {
        item[key] = value;
      }
      return item;
    }, {});
  } else if (FilmSiteSetting.value.basic.type === 3) {
    filterFormat = Object.entries(filter.value.select)
      .map(([key, value]) => `${key}=${value === '全部' ? '' : value}`)
      .join('&');
  }

  console.log(filterFormat);
  filter.value.format = filterFormat;
  console.log(filter.value.format);

  FilmDataList.value.list = [];
  FilmDataList.value.rawList = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 筛选条件切换
const changeFilterEvent = (type, item) => {
  console.log(`[筛选变更] ${type}:${item}`);
  filter.value.select[type] = item;

  if (FilmSiteSetting.value.basic.type === 2 || FilmSiteSetting.value.basic.type === 3) filterApiEvent();
  else filterEvent();
};

const searchGroup = (defaultSearch) => {
  let selfSearch;
  if (FilmSiteSetting.value.basic.search !== 0) selfSearch = [{ ...FilmSiteSetting.value.basic }];
  if (defaultSearch === 'site') {
    return selfSearch;
  }
  if (defaultSearch === 'group') {
    return sitesList.value
      .filter((item) => item.group === FilmSiteSetting.value.basic.group && item.search === 1)
      .concat(selfSearch);
  }
  return sitesList.value.filter((item) => item.search === 1).concat(selfSearch);
};

const getFilmSetting = async () => {
  const [defaultSite, rootClassFilter, r18ClassFilter, defaultChangeModel, sitesAll, defaultSearch] = await Promise.all(
    [
      setting.get('defaultSite'),
      setting.get('rootClassFilter'),
      setting.get('r18ClassFilter'),
      setting.get('defaultChangeModel'),
      sites.all(),
      setting.get('defaultSearch'),
    ],
  );
  if (defaultSite) {
    sitesListSelect.value = defaultSite;
    try {
      const basic = await sites.get(defaultSite);
      FilmSiteSetting.value.basic = basic;
    } catch {
      infiniteCompleteTip.value = '查无此id,请前往设置-影视源重新设置默认源!';
    }
  } else {
    infiniteCompleteTip.value = '暂无数据,请前往设置-影视源设置默认源!';
  }

  sitesList.value = sitesAll.filter((item) => item.isActive);

  Object.assign(FilmSiteSetting.value, {
    rootClassFilter,
    r18ClassFilter,
    change: defaultChangeModel,
    searchType: defaultSearch,
    searchGroup: searchGroup(defaultSearch),
  });
};

// 获取地区
const getFilmArea = () => {
  const { list } = FilmDataList.value;
  [areasKeywords.value] = _.sortedUniq([
    _.unionWith(
      areasKeywords.value,
      _.map(list, (item) => item.vod_area.split(',')[0]),
      _.isEqual,
    ),
  ]);
};

// 获取年份
const getFilmYear = () => {
  const { list } = FilmDataList.value;
  if (FilmSiteSetting.value.basic.type === 0) {
    [yearsKeywords.value] = _.sortedUniq([
      _.unionWith(
        yearsKeywords.value,
        _.map(list, (item) => item.vod_year),
        _.isEqual,
      ),
    ]);
  } else {
    [yearsKeywords.value] = _.sortedUniq([
      _.unionWith(
        yearsKeywords.value,
        _.map(list, (item) => item.vod_year.split('–')[0]),
        _.isEqual,
      ),
    ]);
  }
  yearsKeywords.value = yearsKeywords.value.sort((a, b) => (b as unknown as number) - (a as unknown as number));
};

// 青少年过滤
const containsClassFilterKeyword = (name) => {
  const { rootClassFilter, r18ClassFilter } = FilmSiteSetting.value;
  let ret = false;
  // 主分类过滤, 检测关键词是否包含分类名
  if (FilmSiteSetting.value.rootClassFilter) {
    // ret = rootClassFilter.includes(name);
    ret = rootClassFilter?.some((v) => name?.includes(v));
  }
  // 福利过滤,检测分类名是否包含关键词
  if (r18ClassFilter?.length && !ret) {
    ret = r18ClassFilter?.some((v) => name?.includes(v));
  }
  return ret;
};

// 获取分类
const getClass = async () => {
  const { key } = FilmSiteSetting.value.basic;
  try {
    const res = await zy.classify(key);

    const { pagecount, limit, total, classData, filters } = res;

    const { pageIndex, ...rest } = pagination.value;
    pagination.value = { pageIndex, ...rest, count: pagecount, pageSize: limit, total };
    filter.value.data = filters;

    let allClass;
    const classItem = classData[0];
    FilmSiteSetting.value.class.id = classItem.type_id;
    FilmSiteSetting.value.class.name = classItem.type_name;

    if (FilmSiteSetting.value.basic.type === 2) {
      const result = {};
      filters.forEach((item) => {
        result[item.key] = item.value[0].v;
      });
      filter.value.select = result;
      allClass = [...classData.filter((item) => !containsClassFilterKeyword(item.type_name))];
    } else if (FilmSiteSetting.value.basic.type === 3) {
      const data = filter.value.data[FilmSiteSetting.value.class.id];
      const result = {
        class: data[0]?.class?.[0] ?? '全部',
        area: data[1]?.area?.[0] ?? '全部',
        lang: data[2]?.lang?.[0] ?? '全部',
        year: data[3]?.year?.[0] ?? '全部',
      };
      filter.value.select = result;
      allClass = [...classData.filter((item) => !containsClassFilterKeyword(item.type_name))];
    } else {
      FilmSiteSetting.value.class.id = 0;
      FilmSiteSetting.value.class.name = '最新';
      allClass = [
        { type_id: 0, type_name: '最新' },
        ...classData.filter((item) => !containsClassFilterKeyword(item.type_name)),
      ];
    }

    classKeywords.value = allClass;
    isLoadClass.value = true;
  } catch (err) {
    console.log(err);
    infiniteCompleteTip.value = '网络请求失败, 请尝试手动刷新!';
  }
};

// 切换分类
const changeClassEvent = async (item) => {
  console.log(`[分类变更] ${item.type_id}:${item.type_id}`);
  FilmSiteSetting.value.class.id = item.type_id;
  FilmSiteSetting.value.class.name = item.type_name;
  searchTxt.value = '';
  infiniteCompleteTip.value = '没有更多内容了!';
  FilmDataList.value = { list: [], rawList: [] };
  infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 获取资源
const getFilmList = async () => {
  const { key } = FilmSiteSetting.value.basic;
  const pg = pagination.value.pageIndex;
  const t = FilmSiteSetting.value.class.id;
  let f;
  if (FilmSiteSetting.value.basic.type === 2) f = { ...filter.value.format };
  else if (FilmSiteSetting.value.basic.type === 3) f = filter.value.format;
  console.log(f);

  // console.log(`[list请求参数] key:${key},pg:${pg},t:${t},f:${JSON.stringify(f)}`);

  try {
    const res = await zy.list(key, pg, t, f);

    const newFilms = _.differenceWith(res, FilmDataList.value.list, _.isEqual);
    FilmDataList.value.list = [...FilmDataList.value.list, ...newFilms];
    FilmDataList.value.rawList = [...FilmDataList.value.rawList, ...res];
    pagination.value.pageIndex++;
    if (showToolbar.value && FilmSiteSetting.value.basic.type !== 2) filterEvent();
    return newFilms.length;
  } catch (err) {
    infiniteCompleteTip.value = '网络请求失败, 请尝试手动刷新!';
    console.error(err);
    return 0;
  }
};

// 加载
const load = async ($state) => {
  console.log('loading...');
  if (!sitesListSelect.value || !FilmSiteSetting.value.basic.key) {
    const isNoData = infiniteCompleteTip.value.indexOf('暂无数据');
    if (isNoData > -1) {
      $state.complete();
      return;
    }
    infiniteId.value++;
    return;
  }

  if (!isLoadClass.value) {
    await getClass();
    if (infiniteCompleteTip.value.indexOf('刷新') > -1) {
      $state.complete();
      return;
    }
  }

  try {
    const resLength = searchTxt.value ? await getSearchList() : await getFilmList();
    console.log(`[list] 返回数据长度${resLength}`);
    if (resLength === 0) {
      if (infiniteCompleteTip.value.indexOf('刷新') === -1) infiniteCompleteTip.value = '没有更多内容了!';
      $state.complete();
    } else {
      if (FilmSiteSetting.value.basic.type === 0 || FilmSiteSetting.value.basic.type === 1) {
        getFilmArea();
        getFilmYear();
      }
      $state.loaded();
    }
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

// 搜索
const searchEvent = async () => {
  console.log(`search: ${searchTxt.value}`);
  infiniteCompleteTip.value = '没有更多内容了!';
  FilmDataList.value.list = [];
  FilmDataList.value.rawList = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;
  searchCurrentSite.value = FilmSiteSetting.value.searchGroup[0];
};

// 搜索加载数据
const getSearchList = async () => {
  const site = searchCurrentSite.value;
  const index = FilmSiteSetting.value.searchGroup.indexOf(searchCurrentSite.value);
  const searchGroupLength = FilmSiteSetting.value.searchGroup.length;

  if (!site) return 0;
  if (index + 1 >= searchGroupLength && searchGroupLength !== 1) return 0;
  if (searchGroupLength !== 1) searchCurrentSite.value = FilmSiteSetting.value.searchGroup[index + 1];
  else searchCurrentSite.value = null;

  try {
    const resultSearch = await zy.search(site.key, searchTxt.value);
    if (!resultSearch) {
      return 1;
    }

    let resultDetail = resultSearch;
    if (FilmSiteSetting.value.basic.type !== 3) {
      const ids = resultSearch.map((item) => item.vod_id);
      resultDetail = await zy.detail(site.key, ids.join(','));
    }

    const filmList = resultDetail.map((item) => {
      return {
        ...item,
        siteKey: site.key, // 添加站点标识
        siteName: site.name, // 添加站点名称
        siteId: site.id, // 添加站点id
      };
    });

    const newFilms = _.differenceWith(filmList, FilmDataList.value.list, _.isEqual);
    FilmDataList.value.list.push(...newFilms);
    return newFilms.length;
  } catch (err) {
    console.error(err);
    if (searchGroupLength === 1) return 0;
    return 1;
  }
};

// 切换站点
const changeSitesEvent = async (item) => {
  if (FilmSiteSetting.value.change) await setting.update({ defaultSite: item });
  isLoadClass.value = false;
  infiniteCompleteTip.value = '没有更多内容了!';
  searchTxt.value = '';
  const res = await sites.get(item);
  sitesListSelect.value = res.id;
  FilmSiteSetting.value.basic = res;
  FilmSiteSetting.value.class = {
    id: 0,
    name: '最新',
  };
  FilmDataList.value = { list: [], rawList: [] };
  filter.value = {
    data: [],
    format: {},
    select: {
      site: '',
      sort: '按更新时间',
      class: '',
      area: '全部',
      year: '全部',
      date: [],
    },
  };
  infiniteId.value++;
  pagination.value.pageIndex = 1;
  FilmSiteSetting.value.searchGroup = await searchGroup(FilmSiteSetting.value.searchType);
};

const formatFilterTitle = (id) => {
  return _.find(AppFilterList, { key: id }).desc;
};

// 播放
const playEvent = async (item) => {
  const { siteName, siteKey } = item;
  const { name, key, type, playUrl } = FilmSiteSetting.value.basic;

  formSiteData.value = {
    name: siteName || name,
    key: siteKey || key,
    playUrl,
    type,
  };

  if (type !== 1) {
    const [detailItem] = await zy.detail(formSiteData.value.key, item.vod_id);
    item = detailItem;
  }
  console.log(item);
  store.updateConfig({
    type: 'film',
    data: {
      info: item,
      ext: { site: formSiteData.value },
    },
  });

  ipcRenderer.send('openPlayWindow', item.vod_name);
};

// 监听设置默认源变更
const eventBus = useEventBus('film-reload');
eventBus.on(async () => {
  isLoadClass.value = false;
  infiniteCompleteTip.value = '没有更多内容了!';
  searchTxt.value = '';
  await getFilmSetting();
  FilmSiteSetting.value.class = {
    id: 0,
    name: '最新',
  };
  await getClass();
  FilmDataList.value = { list: [], rawList: [] };
  filter.value = {
    data: [],
    format: {},
    select: {
      site: '',
      sort: '按更新时间',
      class: '',
      area: '全部',
      year: '全部',
      date: [],
    },
  };
  infiniteId.value++;
  pagination.value.pageIndex = 1;
  FilmSiteSetting.value.searchGroup = await searchGroup(FilmSiteSetting.value.searchType);
});
</script>

<style lang="less" scoped>
.film-container {
  overflow: hidden;
  position: relative;
  height: calc(100vh - var(--td-comp-size-l));
  display: flex;
  flex-direction: column;

  .header,
  .filter {
    margin-bottom: 10px;
  }

  .header {
    flex-shrink: 0;
    height: 45px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left-operation-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      .header-title-wrap {
        margin-right: var(--td-comp-margin-s);
        .title {
          .data-item {
            display: block;
            line-height: 1rem;
          }
          .source {
            :deep(.t-input) {
              padding: 0;
              border-style: none !important;
              font-size: 0.8rem;
              font-weight: bold;
            }
            :deep(.t-input--focused) {
              border-color: rgba(255, 255, 255, 0) !important;
              box-shadow: none !important;
            }
          }
          .data {
            font-size: 0.7rem;
          }
        }
      }
      .head-center {
        display: flex;
        .head-center-class {
          max-width: 150px;
          font-size: 18px;
          font-weight: bold;
          margin-right: 5px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        .content-items {
          overflow: hidden;
          width: 100%;
          .content-item {
            float: left;
            box-sizing: border-box;
            width: 92px;
            padding-left: 30px;
            height: 46px;
            cursor: pointer;
            span {
              text-shadow: 0 0 0 rgba(0, 0, 0, 0.2);
              font-size: 15px;
              font-weight: 500;
              display: inline-block;
              width: 62px;
              max-width: 62px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              &:hover {
                color: var(--td-brand-color);
              }
            }
          }
        }
      }
    }
    .right-operation-container {
      display: flex;
      align-items: center;
      flex-direction: column;
      .no-filter {
        right: 5px !important;
      }
    }
  }
  .filter {
    position: relative;
    height: auto;
    transition: height 0.3s;
    .tags {
      .tags-list {
        padding-top: var(--td-comp-paddingTB-xs);
        &:after {
          clear: both;
          display: block;
          height: 0;
          visibility: hidden;
          content: '';
        }
        .title {
          float: left;
          width: 50px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: left;
          cursor: auto;
          box-sizing: border-box;
          height: 30px;
          font-weight: 400;
          font-size: 15px;
          line-height: 30px;
        }
        .wp {
          float: left;
          width: calc(100% - 50px);
          overflow-y: auto;
          white-space: nowrap;
          &::-webkit-scrollbar {
            height: 8px;
            background: transparent;
          }
          .item {
            display: inline-block;
            padding: 0 14px;
            margin-right: 5px;
            box-sizing: border-box;
            height: 30px;
            font-weight: 400;
            font-size: 13px;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
          }
          .active {
            height: 30px;
            border-radius: 20px;
            background: var(--td-bg-color-component);
          }
        }
      }
    }
  }
  .main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow-y: auto;
    width: 100%;
    &-flow-wrap {
      display: grid;
      padding: 10px 0;
      grid-template-columns: repeat(auto-fill, 196px);
      grid-column-gap: 20px;
      grid-row-gap: 15px;
      justify-content: center;
      width: inherit;
      .card {
        box-sizing: border-box;
        width: 196px;
        height: 310px;
        position: relative;
        cursor: pointer;
        .card-header {
          position: absolute;
          color: #fff;
          font-size: 12px;
          z-index: 15;
          height: 18px;
          line-height: 18px;
          left: 0;
          top: 0;
          &-tag {
            height: 18px;
            line-height: 18px;
            padding: 1px 6px;
            border-radius: 6px 0 6px 0;
            background: #03c8d4;
            display: block;
            &-tagtext {
              display: inline-block;
              font-size: 12px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              max-width: 100px;
            }
          }
          &-tag-orange {
            background: #ffdd9a;
            color: #4e2d03;
          }
        }
        .card-main {
          width: 100%;
          overflow: hidden;
          border-radius: 7px;
          .card-main-item {
            border-radius: 7px;
            .op {
              backdrop-filter: saturate(180%) blur(20px);
              background-color: rgba(22, 22, 23, 0.8);
              border-radius: 0 0 7px 7px;
              width: 100%;
              color: rgba(255, 255, 255, 0.8);
              position: absolute;
              bottom: 0px;
              display: flex;
              justify-content: center;
            }
          }
        }
        .card-main:hover {
          .card-main-item {
            :deep(img) {
              transition: all 0.25s ease-in-out;
              transform: scale(1.05);
            }
          }
        }
        .card-footer {
          height: 52px;
          padding-top: 10px;
          overflow: hidden;
          height: auto;
          line-height: 26px;
          .card-footer-title {
            height: auto;
            line-height: 26px;
            font-size: 14px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
          .card-footer-desc {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            height: auto;
            width: 100%;
            line-height: 26px;
            font-size: 13px;
            color: #999;
            font-weight: normal;
          }
        }
      }
      .card:hover {
        .card-footer-title {
          color: var(--td-brand-color);
        }
      }
    }
  }
}

:root[theme-mode='dark'] {
  .right-operation-container {
    .search-box {
      .search-input-item {
        color: hsla(0, 0%, 100%, 0.6) !important;
      }
      .hot-search-button {
        color: hsla(0, 0%, 100%, 0.6) !important;
        .hot-search-button-icon {
          color: hsla(0, 0%, 100%, 0.6) !important;
        }
      }
    }
  }
}
</style>
