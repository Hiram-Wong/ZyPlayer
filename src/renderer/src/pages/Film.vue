<template>
  <div class="film view-container">
    <common-nav title="影视" :list="siteConfig.data" :active="active.nav" @change-key="changeSitesEvent" />
    <div class="content">
      <header class="header">
        <div class="header-nav">
          <tag-nav :list="classConfig.data" :active="active.class" @change-key="changeClassEvent" />
        </div>
        <div v-if="filter.data[active.class]" class="quick_item quick_filter">
          <root-list-icon size="large" @click="isVisible.toolbar = !isVisible.toolbar" />
        </div>
      </header>
      <div class="container">
        <!-- 过滤工具栏 -->
        <div v-show="isVisible.toolbar" class="filter header-wrapper">
          <div class="tags">
            <div v-for="filterItem in filter.data[active.class]" :key="filterItem.key" class="tags-list">
              <div class="item title">{{ filterItem.name }}</div>
              <div class="wp">
                <div
                  v-for="item in filterItem.value"
                  :key="item"
                  class="item"
                  :class="{ active: active.filter[filterItem.key] === item.v }"
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
            <div v-for="item in filmData.list" :key="item.id" class="card-wrap">
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
                    :loading="renderLoading"
                    :error="renderError"
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
            v-if="isVisible.infiniteLoading"
            :identifier="infiniteId"
            :distance="200"
            style="text-align: center; margin-bottom: 2.5em"
            @infinite="load"
          >
            <template #complete>{{ infiniteCompleteTip }}</template>
            <template #error>哎呀，出了点差错</template>
          </infinite-loading>
        </div>
      </div>
    </div>

    <detail-view v-model:visible="isVisible.detail" :site="siteConfig.default" :data="formDetailData"/>
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

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import { useEventBus } from '@vueuse/core';
import _ from 'lodash';
import PQueue from 'p-queue';
import { RootListIcon } from 'tdesign-icons-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { onMounted, reactive, ref } from 'vue';

import { usePlayStore } from '@/store';
import { fetchSiteActive } from '@/api/site';
import { fetchClassify, fetchList, fetchSearch, fetchDetail } from '@/utils/cms';

import DetailView from './film/Detail.vue';
import CommonNav from '../components/common-nav/index.vue';
import TagNav from '../components/tag-nav/index.vue';

const storePlayer = usePlayStore();

const renderError = () => {
  return (
    <div class="renderIcon" style="width: 100%; height: 200px; overflow: hidden;">
      <img src={ lazyImg } style="width: 100%; height: 100%; object-fit: cover;"/>
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="width: 100%; height: 200px; overflow: hidden;">
      <img src={ lazyImg } style="width: 100%; height: 100%; object-fit: cover;"/>
    </div>
  );
};

const queue = new PQueue({ concurrency: 5 }); // 设置并发限制为5
const infiniteId = ref(+new Date()); // infinite-loading属性重置组件
const searchTxt = ref(''); // 搜索框
const searchCurrentSite = ref(); // 搜索当前源

const formDetailData = ref({
  neme: '',
  key: '',
  type: 1,
}); //  详情组件源传参
const isVisible = reactive({
  toolbar: false, // 筛选
  hot: false,
  detail: false,
  loadClass: false,
  infiniteLoading: false,
  gridList: false
});
const pagination = ref({
  pageIndex: 1,
  pageSize: 36,
  count: 0,
  total: 0,
}); // 分页请求
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

const infiniteCompleteTip = ref('没有更多内容了!');

const siteConfig = ref({
  default: {
    id: '',
    type: 0,
    categories: ''
  },
  search: '',
  data: [],
  searchGroup: []
})

const active = ref({
  site: '',
  nav: null,
  class: 0,
  filter: {
    site: '',
    sort: '按更新时间',
    class: '',
    area: '全部',
    year: '全部',
  }
})

const filmData = ref({
  list: [],
  rawList: [],
});

const classConfig = ref({
  data: [{ type_id: 0, type_name: '最新' }]
})

onMounted(() => {
  getSetting();
});

// cms筛选：基于已有数据
const filterEvent = () => {
  const { rawList } = filmData.value;
  const { area, year, sort } = active.value.filter;

  const filteredData = rawList
    .filter((item) => area === '全部' || item["vod_area"].includes(area))
    .filter((item) => year === '全部' || item["vod_area"].includes(year))
    .sort((a, b) => {
      switch (sort) {
        case '按上映年份':
          return b["vod_year"] - a["vod_year"];
        case '按片名':
          return a["vod_name"].localeCompare(b["vod_name"], 'zh-Hans-CN');
        default:
          return +new Date(b["vod_time"]) - +new Date(a["vod_time"]);
      }
    });

  filmData.value.list = filteredData;
};

// 非cms筛选：基于请求数据
const filterApiEvent = async () => {
  const { type } = siteConfig.value.default;
  let filterFormat;
  if (type === 2 || type === 6) {
    filterFormat = Object.entries(active.value.filter).reduce((item, [key, value]) => {
      if (value !== '' && value.length !== 0) {
        item[key] = value;
      }
      return item;
    }, {});
  } else if (type === 3 || type === 4) {
    filterFormat = Object.entries(active.value.filter)
      .map(([key, value]) => `${key}=${value === '全部' ? '' : value}`)
      .join('&');
  }

  filter.value.format = filterFormat;

  filmData.value.list = [];
  filmData.value.rawList = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 筛选条件切换
const changeFilterEvent = (key, item) => {
  console.log(`[film] change filter: ${key}:${item}`);
  active.value.filter[key] = item;

  const { type } = siteConfig.value.default;

  if (type === 1 || type === 0) filterEvent();
  else filterApiEvent();
};

const searchGroup = (type: string) => {
  // 全局搜索 + 源搜索 0关闭1聚合搜索2本站搜索
  const defaultConfig = siteConfig.value.default;
  const selfSearch = defaultConfig["search"] !== 0 ? [{ ...defaultConfig }] : [];

  const groupRes = siteConfig.value.data.filter((item) => item["group"] === defaultConfig["group"] && item["search"] === 1);
  const allRes = siteConfig.value.data.filter((item) => item["search"] === 1);

  switch (type) {
    case 'site':
      return selfSearch;
    case 'group':
      return defaultConfig["search"] === 2 ? groupRes.concat(selfSearch) : groupRes;
    case 'all':
      return defaultConfig["search"] === 2 ? allRes.concat(selfSearch) : allRes;
    default:
      return [];
  }
};

const getSetting = async () => {
  try {
    const data = await fetchSiteActive();
    if (_.has(data, 'default') && !_.isEmpty(data["default"])) {
      siteConfig.value.default = data["default"];
      active.value.nav = data["default"]["id"];
    } else {
      infiniteCompleteTip.value = '暂无数据,请前往设置-影视源设置默认源!';
    }
    if (_.has(data, 'data') && !_.isEmpty(data["data"])) {
      siteConfig.value.data = data["data"];
    }
    if (_.has(data, 'search') && !_.isEmpty(data["search"])) {
      siteConfig.value.search = data["search"];
      siteConfig.value.searchGroup = searchGroup(data["search"]);
    }
    isVisible.infiniteLoading = true;
  } catch (err) {
    console.log(err);
    isVisible.infiniteLoading = false;
  }
};

// 获取地区
const arrangeCmsArea = () => {
  const { rawList } = filmData.value;
  const data = _.compact(_.map(rawList, (item) => item["vod_area"].split(',')[0]));
  data.unshift('全部');
  const dataFormat = _.uniq(data);

  const listFormat = dataFormat.map((item) => {;
    return { n: item, v: item === '全部'? '' : item };
  });

  const id = active.value.class;
  const currentFilter = filter.value.data[id];

  const index = _.findIndex(currentFilter, {key: 'area'});
  console.log(`[film] cms filter area: `, listFormat);
  filter.value.data[id][index].value = listFormat;
};

// 获取年份
const arrangeCmsYear = () => {
  const { rawList } = filmData.value;
  const id = active.value.class;
  const { type } = siteConfig.value.default;
  const currentFilter = filter.value.data[id];
  const index = _.findIndex(currentFilter, {key: 'year'});

  let data;
  if (type === 0) data = _.compact(_.map(rawList, (item) => item["vod_year"]));
  else data = _.compact(_.map(rawList, (item) => item["vod_year"].split('–')[0]));
  data.unshift('全部');
  const dataFormat = _.uniq(data);
  const listFormat = dataFormat.map((item) => {;
    return { n: item, v: item === '全部'? '' : item };
  });
  console.log(`[film] cms filter year: `, listFormat);
  filter.value.data[id][index].value = listFormat;
};

// 类别过滤
const categoriesFilter = (classData: string[]): string[] => {
  const { categories } = siteConfig.value.default;
  if (!categories || categories.trim() === '') return classData;

  const categoryList = categories.split(',').map((item) => item.trim());
  const classDataList = classData.map((item) => item["type_name"]);
  const categoriesInOrder: string[] = [];

  for (const category of categoryList) {
    const isFind = classDataList.indexOf(category);
    if (isFind === -1) continue;

    const foundCategory = classData.find((item) => item["type_name"] === category);
    if (foundCategory) {
      categoriesInOrder.push(foundCategory);
    }
  }

  return categoriesInOrder;
}

// 过滤条件-选中第一项
const classFilter = (filters) => {
  const result = {};

  if (_.has(filters, active.value.class)) {
    filters[active.value.class].forEach((item) => {
      result[item.key] = item.value[0]?.v ?? '全部';
    });
  }

  active.value.filter = result;
};

// 获取分类
const getClassList = async (site) => {
  try {
    const res = await fetchClassify(site);

    const { pagecount, limit, total, classData, filters } = res;
    const { pageIndex, ...rest } = pagination.value;
    pagination.value = { pageIndex, ...rest, count: pagecount, pageSize: limit, total };
    filter.value.data = filters;

    const classDataFormat = categoriesFilter(classData);
    classConfig.value.data = classDataFormat;

    if (_.isEmpty(classDataFormat)) {
      infiniteCompleteTip.value = '设置分类异常, 请前往设置检查源分类后尝试手动刷新!';
      isVisible.loadClass = false;
    } else {
      const classItem = classDataFormat[0];
      active.value.class = classItem["type_id"];
      if (!_.isEmpty(filters)) classFilter(filters);
      isVisible.loadClass = true;
    }
  } catch (err) {
    console.log(err);
    infiniteCompleteTip.value = '网络请求失败, 请尝试手动刷新!';
  }
};

// 切换分类
const changeClassEvent = (key) => {
  active.value.class = key;
  if (!_.isEmpty(filter.value.data)) classFilter(filter.value.data);
  filterApiEvent();
  searchTxt.value = '';
  infiniteCompleteTip.value = '没有更多内容了!';
  filmData.value = { list: [], rawList: [] };
  infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 获取资源
const getFilmList = async () => {
  const defaultSite = siteConfig.value.default;
  const pg = pagination.value.pageIndex;
  const t = active.value.class;
  const { format } = filter.value;

  console.log(`[film] load parameter: ${defaultSite.type === 2 ? JSON.stringify({ ...format }) : JSON.stringify(format)}`);

  let length = 0;
  try {
    const res = await fetchList(defaultSite, pg, t, defaultSite.type === 2 ? { ...format } : format);
    const newFilms = _.differenceWith(res, filmData.value.list, _.isEqual);
    filmData.value.list = [...filmData.value.list, ...newFilms];
    filmData.value.rawList = [... filmData.value.rawList, ...res];
    pagination.value.pageIndex++;
    if (defaultSite.type === 0 || defaultSite.type === 1) filterEvent();
    length = newFilms.length;
  } catch (err) {
    infiniteCompleteTip.value = '网络请求失败, 请尝试手动刷新!';
    console.error(err);
    length = 0;
  } finally {
    console.log(`[film] load data length: ${length}`);
    return length;
  } 
};

// 加载
const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
  console.log('[film] loading...');
  try {
    if (_.isEmpty(active.value.nav)) {
      infiniteCompleteTip.value = '暂无数据,请前往设置-影视源设置默认源!';
      $state.complete();
      return;
    }

    const defaultSite = siteConfig.value.default;
    if (!isVisible.loadClass) await getClassList(defaultSite); // 加载分类

    const loadFunction = searchTxt.value ? getSearchList : getFilmList;
    const resLength = await loadFunction(); // 动态加载数据

    if (resLength === 0) {
      $state.complete();
    } else {
      if (defaultSite.type === 0 || defaultSite.type === 1) {
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
  console.log(`[film] search keyword:${searchTxt.value}`);
  infiniteCompleteTip.value = '没有更多内容了!';
  filmData.value.list = [];
  filmData.value.rawList = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;
  searchCurrentSite.value =  siteConfig.value.searchGroup ? siteConfig.value.searchGroup[0]: null;
};

// 搜索加载数据
const getSearchList = async () => {
  let length = 0;
  const defaultSite = siteConfig.value.default;
  const searchGroup = siteConfig.value.searchGroup;
  const currentSite = searchCurrentSite.value;

  if (!currentSite) return 0; // 没有搜索站点

  const index = searchGroup.indexOf(currentSite);
  const isLastSite = index + 1 >= searchGroup.length;

  if(index + 1 > searchGroup.length) return 0; // 没有更多站点

  searchCurrentSite.value = isLastSite ? null : searchGroup[index + 1];

  try {
    const resultSearch = await fetchSearch(currentSite, searchTxt.value);
    if (!resultSearch) {
      length = 1;
      return;
    }

    let resultDetail = resultSearch;
    if (![3, 4, 5].includes(defaultSite.type)) {
      const ids = resultSearch.map((item) => item.vod_id);
      resultDetail = await fetchDetail(currentSite, ids.join(','));
    }

    const filmList = resultDetail.map((item) => ({
      ...item,
      siteKey: currentSite.key,
      siteName: currentSite.name,
      siteId: currentSite.id,
    }));

    const newFilms = _.differenceWith(filmList, filmData.value.list, _.isEqual); // 去重
    filmData.value.list.push(...newFilms);
    length = isLastSite ? 0 : newFilms.length;
  } catch (err) {
    length = searchGroup.length === 1 ? 0 : 1;
    console.error(err);
  } finally {
    console.log(`[film] load data length: ${length}`);
    return length;
  }
};

// 切换站点
const changeSitesEvent = async (key: string) => {
  isVisible.loadClass = false;
  isVisible.infiniteLoading = true;
  infiniteCompleteTip.value = '没有更多内容了!';
  searchTxt.value = '';
  const res = _.find(siteConfig.value.data, { id: key });
  active.value.nav = key;
  siteConfig.value.default = res;
  classConfig.value.data = [{ type_id: 0, type_name: '最新' }];
  filmData.value = { list: [], rawList: [] };
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
  getClassList(siteConfig.value.default);
  siteConfig.value.searchGroup = await searchGroup(siteConfig.value.search);
};

// 播放
const playEvent = async (item) => {
  const defaultSite = siteConfig.value.default;

  if ( !('vod_play_from' in item && 'vod_play_url' in item) ) {
    const [detailItem] = await fetchDetail(defaultSite, item.vod_id);
    item = detailItem;
  }

  const playerType = storePlayer.getSetting.broadcasterType;

  if (playerType === 'iina' || playerType === 'potplayer' || playerType === 'vlc' ) {
    formDetailData.value = item;
    isVisible.detail = true;
  } else {
    storePlayer.updateConfig({
      type: 'film',
      data: {
        info: item,
        ext: { site: defaultSite },
      },
    });

    window.electron.ipcRenderer.send('openPlayWindow', item.vod_name);
  }
};

// 监听设置默认源变更
const filmReloadeventBus = useEventBus<string>('film-reload');
const filmSearcheventBus = useEventBus<string>('film-search');

filmSearcheventBus.on((kw: string)=>{
  searchTxt.value = kw;
  searchEvent();
});

filmReloadeventBus.on(async () => {
  isVisible.loadClass = false;
  infiniteCompleteTip.value = '没有更多内容了!';
  searchTxt.value = '';
  await getSetting();
  classConfig.value.data = [{ type_id: 0, type_name: '最新' }];
  filmData.value = { list: [], rawList: [] };
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
});
</script>

<style lang="less" scoped>
.film {
  height: 100%;
  display: flex;
  position: relative;
  flex-direction: row;
  overflow: hidden;

  .membership-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 148px;
    border: 2px solid rgba(132, 133, 141, 0.16);
    transition: all .3s ease;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 20px;
    .member-name {
      font-size: 12px;
      margin-left: 4px;
    }
  }
  .nav-sub-tab-member-info {
    margin-top: var(--td-comp-margin-s);
  }

  .content {
    width: calc(100% - 170px);
    position: relative;
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      justify-content: space-between;
      white-space: nowrap;
      flex-shrink: 0;
      width: 100%;
      .header-nav {
        width: 100%;
        overflow: hidden;
      }
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      height: calc(100% - 58px);
      width: 100%;
      .filter {
        position: relative;
        height: auto;
        margin-bottom: 10px;
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
      .content-wrapper {
        overflow-y: auto;
        width: 100%;
        height: 100%;
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
</style>
