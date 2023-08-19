<template>
  <div class="film-container">
    <div class="nav-sub-tab">
      <div class="nav-sub-tab-top">
        <ul class="nav-menu">
          <li class="nav-menu-item" :class="sitesListSelect === item.id ? 'is-active' : ''" v-for="item in sitesList" :key="item.id" :value="item.id" @click="changeSitesEvent(item.id)">
            <div class="name-wrapper">
              <span>{{ item.name }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="nav-sub-tab-bottom"></div>
    </div>
    <div class="content">
      <header class="header">
        <div class="page-title">
          <div class="title">
            <ul class="menu">
              <li class="menu-item" v-for="item in classKeywords.slice(0, 3)" :key="item.type_id" @click="changeClassEvent(item)">
                <a :class="item.type_name === FilmSiteSetting.class.name ? 'is-active' :''">{{ item.type_name }}</a>
              </li>
              <li class="menu-item morebtn">
                <t-popup
                  v-if="classKeywords.length > 3"
                  placement="bottom-left"
                  :overlay-inner-style="{
                    width: '500px',
                    lineHeight: '46px',
                    padding: '5px 0',
                    zIndex: '999',
                    background: 'var(--td-bg-color-page)',
                    boxShadow: '0 15px 30px rgba(0,0,0,.2)',
                    maxHeight: '500px',
                    overflow: 'auto'
                  }"
                >
                  <span class="more" :class="!formatMoreTitle(FilmSiteSetting.class.name, classKeywords.slice(0, 3)) ? 'is-active' :''">{{ formatMoreTitle(FilmSiteSetting.class.name, classKeywords.slice(0, 3)) ? '更多' : FilmSiteSetting.class.name }}</span>
                  <span class="dot">
                    <more-icon size="1.5rem" style="transform: rotate(90deg)" />
                  </span>
                  <template #content>
                    <div class="content-items">
                      <div v-for="item in classKeywords.slice(3)" :key="item.type_id" class="content-item">
                        <span variant="text" @click="changeClassEvent(item)">
                          {{ item.type_name }}
                        </span>
                      </div>
                    </div>
                  </template>
                </t-popup>
              </li>
            </ul>
          </div>
        </div>
        <div class="actions">
          <search-view v-model="searchTxt" :site="FilmSiteSetting.basic" @search="searchEvent" style="position: relative; margin-right: 5px;"/>
          <div
            v-if="(FilmSiteSetting.basic.type === 2 && filter.data.length !== 0) || FilmSiteSetting.basic.type !== 2"
            class="quick_item quick_filter"
          >
            <root-list-icon size="large" @click="showToolbar = !showToolbar" />
          </div>
        </div>
      </header>
      <div class="container">
        <!-- 过滤工具栏 -->
        <div v-show="showToolbar" class="filter header-wrapper">
          <div class="tags">
            <div v-for="filterItem in filter.data[FilmSiteSetting.class.id]" :key="filterItem.key" class="tags-list">
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
        </div>
        <div class="content-wrapper">
          <div class="container-flow-wrap">
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
                    :style="{ width: '100%', height: '200px', background: 'none' }"
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
      </div>
    </div>

    
    <hot-view v-model:visible="formDialogHot" :site="FilmSiteSetting.basic" />
    <t-back-top
      container=".content-wrapper"
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
import { MoreIcon, RootListIcon } from 'tdesign-icons-vue-next';
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
const classKeywords = ref([{ type_id: 0, type_name: '最新' }]); // 过滤类型

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
    categories: ''
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
  } else if (FilmSiteSetting.value.basic.type === 3 || FilmSiteSetting.value.basic.type === 4) {
    filterFormat = Object.entries(filter.value.select)
      .map(([key, value]) => `${key}=${value === '全部' ? '' : value}`)
      .join('&');
  }

  filter.value.format = filterFormat;

  FilmDataList.value.list = [];
  FilmDataList.value.rawList = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 筛选条件切换
const changeFilterEvent = (key, item) => {
  console.log(`[筛选变更] ${key}:${item}`);
  filter.value.select[key] = item;

  const { type } = FilmSiteSetting.value.basic;

  if (type === 1 || type === 0) filterEvent();
  else filterApiEvent();
};

const searchGroup = (type: string) => {
  let selfSearch;
  if (FilmSiteSetting.value.basic.search !== 0) selfSearch = [{ ...FilmSiteSetting.value.basic }];
  if (type === 'site') {
    return selfSearch;
  }
  if (type === 'group') {
    return sitesList.value
      .filter((item) => item.group === FilmSiteSetting.value.basic.group && item.search === 1)
      .concat(selfSearch);
  }
  return sitesList.value.filter((item) => item.search === 1).concat(selfSearch);
};

const getFilmSetting = async () => {
  const [defaultSite, sitesAll, defaultSearchType] = await Promise.all(
    [
      setting.get('defaultSite'),
      sites.all(),
      setting.get('defaultSearchType'),
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
    searchType: defaultSearchType,
    searchGroup: searchGroup(defaultSearchType),
  });
};

// 获取地区
const arrangeCmsArea = () => {
  const { rawList } = FilmDataList.value;
  const data = _.compact(_.map(rawList, (item) => item.vod_area.split(',')[0]));
  data.unshift('全部');
  const dataFormat = _.uniq(data);

  const listFormat = dataFormat.map((item) => {;
    return { n: item, v: item === '全部'? '' : item };
  });

  const { id } = FilmSiteSetting.value.class;
  const currentFilter = filter.value.data[id];

  const index = _.findIndex(currentFilter, {key: 'area'});
  console.log(listFormat)
  filter.value.data[id][index].value = listFormat;
};

// 获取年份
const arrangeCmsYear = () => {
  const { rawList } = FilmDataList.value;
  const { id } = FilmSiteSetting.value.class;
  const { type } = FilmSiteSetting.value.basic;
  const currentFilter = filter.value.data[id];
  const index = _.findIndex(currentFilter, {key: 'year'});

  let data;
  if (type === 0) data = _.compact(_.map(rawList, (item) => item.vod_year));
  else data = _.compact(_.map(rawList, (item) => item.vod_year.split('–')[0]));
  data.unshift('全部');
  const dataFormat = _.uniq(data);
  const listFormat = dataFormat.map((item) => {;
    return { n: item, v: item === '全部'? '' : item };
  });
  console.log(listFormat)
  filter.value.data[id][index].value = listFormat;
};

// 类别过滤
const categoriesFilter = (classData: string[]): string[] => {
  const { categories } = FilmSiteSetting.value.basic;
  if (!categories || categories.trim() === '') return classData;
  
  const categoryList = categories.split(',').map((item) => item.trim());
  const classDataList = classData.map((item) => item.type_name);
  const categoriesInOrder: string[] = [];

  for (const category of categoryList) {
    const isFind = classDataList.indexOf(category);
    if (isFind === -1) continue;

    const foundCategory = classData.find((item) => item.type_name === category);
    if (foundCategory) {
      categoriesInOrder.push(foundCategory);
    }
  }

  return categoriesInOrder;
}

// 过滤条件-选中第一项
const classFilter = (filters) => {
  const result = {};

  filters[FilmSiteSetting.value.class.id].forEach((item) => {
    result[item.key] = item.value[0]?.v ?? '全部';
  });

  filter.value.select = result;
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

    const classDataFormat = categoriesFilter(classData);
    classKeywords.value = classDataFormat;

    if (_.isEmpty(classDataFormat)) {
      infiniteCompleteTip.value = '设置分类异常, 请前往设置检查源分类后尝试手动刷新!';

      isLoadClass.value = false;
    } else {
      const classItem = classDataFormat[0];
      FilmSiteSetting.value.class.id = classItem.type_id;
      FilmSiteSetting.value.class.name = classItem.type_name;
      classFilter(filters);

      isLoadClass.value = true;
    }
  } catch (err) {
    console.log(err);
    infiniteCompleteTip.value = '网络请求失败, 请尝试手动刷新!';
  }
};

// 切换分类
const changeClassEvent = (item) => {
  console.log(`[分类变更] ${item.type_id}:${item.type_id}`);
  FilmSiteSetting.value.class.id = item.type_id;
  FilmSiteSetting.value.class.name = item.type_name;
  classFilter(filter.value.data);
  filterApiEvent();
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
  const { format } = filter.value;

  console.log(FilmSiteSetting.value.basic.type === 2 ? { ...format } : format);

  try {
    const res = await zy.list(key, pg, t, FilmSiteSetting.value.basic.type === 2 ? { ...format } : format);

    const newFilms = _.differenceWith(res, FilmDataList.value.list, _.isEqual);
    FilmDataList.value.list = [...FilmDataList.value.list, ...newFilms];
    FilmDataList.value.rawList = [...FilmDataList.value.rawList, ...res];
    pagination.value.pageIndex++;
    if (FilmSiteSetting.value.basic.type === 0 || FilmSiteSetting.value.basic.type === 1) filterEvent();
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
        arrangeCmsArea();
        arrangeCmsYear();
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
    if (FilmSiteSetting.value.basic.type !== 3 && FilmSiteSetting.value.basic.type !== 4) {
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
    },
  };
  infiniteId.value++;
  pagination.value.pageIndex = 1;
  FilmSiteSetting.value.searchGroup = await searchGroup(FilmSiteSetting.value.searchType);
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

  if ( !('vod_play_from' in item && 'vod_play_url' in item) ) {
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
    },
  };
  infiniteId.value++;
  pagination.value.pageIndex = 1;
  FilmSiteSetting.value.searchGroup = await searchGroup(FilmSiteSetting.value.searchType);
});

const formatMoreTitle = (item, list) => {
  console.log(item, list)
  return _.find(list, {type_name: item});
}
</script>

<style lang="less" scoped>
.film-container {
  height: 100%;
  display: flex;
  position: relative;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
  flex: 1 1;

  .nav-sub-tab {
    width: 170px;
    border-right: 1px solid rgba(132,133,141,.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    z-index: 2;
    overflow: auto;
    .nav-sub-tab-top {
      .nav-menu {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        line-height: 1.5;
        .nav-menu-item {
          width: 140px;
          height: 40px;
          padding-left: 8px;
          line-height: 14px;
          display: flex;
          align-items: center;
          color: var(--td-text-color-primary);
          cursor: pointer;
          transition: background-color .3s ease;
          border-radius: 10px;
          position: relative;
        }
        .is-active {
          background-color: rgba(132, 133, 141, 0.16);
        }
      }
    }
    .nav-sub-tab-bottom {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding-bottom: 20px;
    }
  }

  .content {
    flex: 1 1;
    position: relative;
    overflow: hidden;
    .header {
      height: 40px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      justify-content: space-between;
      white-space: nowrap;
      flex-shrink: 0;
      .page-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-grow: 1;
        height: 100%;
        overflow: hidden;
        position: relative;
        .title {
          font-size: 18px;
          font-weight: 600;
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          .menu {
            .is-active {
              font-size: 18px !important;
              color: var(--td-text-color-primary) !important;
            }
            .menu-item {
              font-size: 14px;
              margin-right: 20px;
              float: left;
              display: block;
              opacity: 1\9\0;
              animation: blockshow .2s ease .2s forwards;
              a {
                display: block;
                color: var(--td-text-color-secondary);
                font-weight: 700;
                font-size: 14px;
              }
            }
            .morebtn {
              position: relative;
              display: block;
              margin-right: 0;
              color: var(--td-text-color-secondary);

              .dot {
                float: right;
                padding-left: 5px;
              }
            }
          }
        }
      }
      .actions {
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        .no-filter {
          right: 5px !important;
        }
      }
    }
    .header-wrapper {
      display: flex;
      height: 100%;
      font-size: 12px;
      line-height: 1.6;
      padding: 0 40px;
      margin-bottom: 12px;
      white-space: nowrap;
      position: relative;
    }
    .filter {
      position: relative;
      height: auto;
      padding: 0 40px;
      margin-bottom: 5px;
      transition: height 0.3s;
      width: 100%;
      .tags {
        width: 100%;
        .tags-list {
          padding-top: var(--td-comp-paddingTB-xs);
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          &:after {
            clear: both;
            display: block;
            height: 0;
            visibility: hidden;
            content: '';
          }
          .title {
            // float: left;
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
            // float: left;
            // width: calc(100% - 50px);
            width: 100%;
            overflow-y: auto;
            white-space: nowrap;
            flex-wrap: nowrap;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            align-content: center;
            &::-webkit-scrollbar {
              height: 8px;
              background: transparent;
            }
            .item {
              display: block;
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
    .container {
      height: calc(100% - 45px);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      width: 100%;
      .content-wrapper {
        overflow-y: auto;
        width: 100%;
        height: 100%;
        padding: 0 40px;
        display: flex;
        flex-direction: column;
        position: relative;
        flex-grow: 1;
        .container-flow-wrap {
          display: grid;
          grid-template-columns: repeat(auto-fill, 153px);
          grid-column-gap: 15px;
          grid-row-gap: 15px;
          justify-content: center;
          width: inherit;
          .card {
            box-sizing: border-box;
            width: 153px;
            height: 250px;
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
              max-height: 44px;
              padding-top: 10px;
              overflow: hidden;
              height: auto;
              .card-footer-title {
                height: auto;
                line-height: 15px;
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
  }
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
