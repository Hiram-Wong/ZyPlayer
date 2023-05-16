<template>
  <div class="film-container">
    <div class="header">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-space align="center">
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
          </t-space>
        </div>
        <div class="right-operation-container">
          <t-space align="center">
            <search-view :site="FilmSiteSetting.basic" @search="searchEvent" />
            <div v-if="!(FilmSiteSetting.basic.type === 2 && filter.data.length === 0)" class="quick_item quick_filter">
              <view-module-icon size="large" @click="showToolbar = !showToolbar" />
            </div>
          </t-space>
        </div>
      </t-row>
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
import { onMounted, ref, watch } from 'vue';

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
const sortKeywords = ['按更新时间', '按上映年份', '按片名']; // 过滤排序条件
const areasKeywords = ref(['全部']); // 过滤地区
const yearsKeywords = ref(['全部']); // 过滤年份
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
  data: {},
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
  const uniqueData = Array.from(new Set(filteredData));
  FilmDataList.value.list = uniqueData;
};

// drpy筛选：基于接口
const filterDrpyEvent = async () => {
  const filterFormat = Object.entries(filter.value.select).reduce((item, [key, value]) => {
    if (value !== '' && value.length !== 0) {
      item[key] = value;
    }
    return item;
  }, {});

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

  if (FilmSiteSetting.value.basic.type === 2) filterDrpyEvent();
  else filterEvent();
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

  await getClass();

  sitesList.value = sitesAll.filter((item) => item.isActive);

  const searchGroup = () => {
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

  Object.assign(FilmSiteSetting.value, {
    rootClassFilter,
    r18ClassFilter,
    change: defaultChangeModel,
    searchType: defaultSearch,
    searchGroup: searchGroup(),
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

    let firstTypeId = 0;
    if (FilmSiteSetting.value.basic.type === 2) {
      firstTypeId = classData[0].type_id;
      FilmSiteSetting.value.class.id = firstTypeId;

      if (filters.length !== 0) {
        const result = {};
        filters.forEach((item) => {
          result[item.key] = item.value[0].v;
        });
        filter.value.select = result;
        console.log(filter.value.select);
      }
    }

    const allClass = [
      { type_id: firstTypeId, type_name: '最新' },
      ...classData.filter((item) => !containsClassFilterKeyword(item.type_name)),
    ];

    classKeywords.value = allClass;
  } catch (err) {
    console.log(err);
  }
};

// 切换分类
const changeClassEvent = async (item) => {
  console.log(`[分类变更] ${item.type_id}:${item.type_id}`);
  FilmSiteSetting.value.class.id = item.type_id;
  FilmSiteSetting.value.class.name = item.type_name;
  FilmDataList.value.list = [];
  FilmDataList.value.rawList = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 获取资源
const getFilmList = async () => {
  const { key } = FilmSiteSetting.value.basic;
  const pg = pagination.value.pageIndex;
  const t = FilmSiteSetting.value.class.id;
  const f = JSON.stringify({ ...filter.value.format });
  console.log(`[list请求参数] key:${key},pg:${pg},t:${t},f:${f}`);

  try {
    let res;
    if (f) res = await zy.list(key, pg, t, f);
    else res = await zy.list(key, pg, t);

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

  try {
    const resLength = searchTxt.value ? 0 : await getFilmList();
    console.log(resLength);
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
const searchEvent = async (kw) => {
  console.log(`search: ${kw}`);
  searchTxt.value = kw;
  FilmDataList.value.list = [];
  FilmDataList.value.rawList = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;

  console.log(FilmDataList.value.list, FilmDataList.value.rawList);
  if (kw) {
    try {
      const searchPromises = FilmSiteSetting.value.searchGroup.map((site) => {
        return zy.search(site.key, kw).then(async (res) => {
          console.log(res);
          if (res) {
            await Promise.all(
              res.map(async (item) => {
                const detailRes = await zy.detail(site.key, item.vod_id);
                detailRes.siteKey = site.key; // 添加站点标识
                detailRes.siteName = site.name; // 添加站点名称
                detailRes.siteId = site.id; // 添加站点id
                FilmDataList.value.list.push(detailRes);
              }),
            );
          }
        });
      });
      await Promise.all(searchPromises);
      console.log('complete');
    } catch (err) {
      console.info(err);
    }
  }
};

// 切换站点
const changeSitesEvent = async (item) => {
  if (FilmSiteSetting.value.change) await setting.update({ defaultSite: item });

  const res = await sites.get(item);
  sitesListSelect.value = res.id;
  FilmSiteSetting.value.basic.name = res.name;
  FilmSiteSetting.value.basic.key = res.key;
  FilmSiteSetting.value.basic.type = res.type;
  FilmSiteSetting.value.class = {
    id: 0,
    name: '最新',
  };
  FilmDataList.value = { list: [], rawList: [] };
  filter.value = {
    data: {},
    format: {},
    select: {
      site: '',
      sort: '按更新时间',
      class: '',
      area: '全部',
      year: '全部',
      data: [],
    },
  };
  infiniteId.value++;
  pagination.value.pageIndex = 1;

  getClass();
};

// 播放
const playEvent = async (item) => {
  const { siteName, siteKey } = item;
  const { name, key, type } = FilmSiteSetting.value.basic;

  formSiteData.value = {
    name: siteName || name,
    key: siteKey || key,
    type,
  };

  if (type === 2 || type === 0) {
    item = await zy.detail(formSiteData.value.key, item.vod_id);
  }

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
  await getFilmSetting();
  FilmSiteSetting.value.class = {
    id: 0,
    name: '最新',
  };
  await getClass();
  FilmDataList.value = { list: [], rawList: [] };
  filter.value = {
    data: {},
    format: {},
    select: {
      site: '',
      sort: '按更新时间',
      class: '',
      area: '全部',
      year: '全部',
      data: [],
    },
  };
  infiniteId.value++;
  pagination.value.pageIndex = 1;
  await getFilmList();
  await getFilmArea();
});
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

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
    .left-operation-container {
      .header-title-wrap {
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
        .head-center-class {
          max-width: 75px;
          height: 23px;
          font-size: 18px;
          font-weight: bold;
          float: left;
          margin-right: 5px;
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
      .act {
        width: 518px !important;
      }
      .search-box {
        z-index: 999;

        position: relative;
        // width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        // background-image: linear-gradient(130deg, rgba(85, 187, 56, 0.3) 0%, rgba(124, 212, 118, 0.2) 100%);
        // background-image: linear-gradient(140deg, rgba(255, 228, 231, 0.8) 0%, rgba(244, 244, 255, 0.85) 100%);
        background-color: var(--bg-color-theme-transparent);
        border-radius: 25px;
        overflow: hidden;
        font-size: 14px;
        backdrop-filter: blur(40px);

        animation: fs-mask-hide 0.2s ease both;
        width: 260px;
        .hd-search-inner {
          width: 100%;
          height: 38px;
          display: flex;
          align-items: center;
          .hd-input {
            flex-grow: 1;
            border: none;
            box-sizing: border-box;
            width: 0;
            height: 100%;
            // color: rgba(255, 255, 255, 0.6);
            padding-left: 20px;
            background: none;
            outline: none;
            font-size: 14px;
            text-overflow: ellipsis;
            ::input-placeholder {
              color: red;
            }
          }
          .search-hotlink {
            color: rgba(255, 255, 255, 0.6);
            display: flex;
            align-items: center;
            flex-shrink: 0;
            height: 100%;
            text-decoration: none;
            &:hover {
              color: var(--td-brand-color);
              .search-hotlink-icon {
                color: var(--td-brand-color);
              }
            }
            .search-hotlink-icon {
              width: 14px;
              height: 14px;
              color: rgba(255, 255, 255, 0.6);
              vertical-align: middle;
            }
          }
          .search-button-box {
            flex-shrink: 0;
            width: 40px;
            height: 45px;
            cursor: pointer;
            display: flex;
            align-items: center;
            padding-left: 10px;
            box-sizing: border-box;
          }
        }
        .hd-result {
          width: 100%;
          // display: none;
          max-height: calc(100vh - 75px);
          overflow-x: hidden;
          overflow-y: auto;
          .top-line {
            border-top: 1px solid rgba(0, 0, 0, 0.04);
            margin: 0 20px;
          }

          .search-hot {
            .search-head {
              display: flex;
              justify-content: space-between;
              position: relative;
              margin: 18px 20px 5px;
              overflow: hidden;
              color: #999;
              .search-title {
                color: rgba(255, 255, 255, 0.5);
                font-weight: 600;
              }
            }
            .search-body {
              margin: 12px 16px 0 20px;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              justify-content: space-between;
              .num-svg {
                flex-shrink: 0;
                width: 60px;
                color: #fff;
                opacity: 0.3;
                font-weight: 700;
              }

              .txt {
                width: 100px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex-grow: 1;
                line-height: 22px;
                margin-top: 8px;
              }

              a:nth-child(-n + 4) {
                margin-bottom: 20px;
                width: 25%;
              }

              a:nth-child(-n + 4) .num,
              a:nth-child(n + 5) .num-svg {
                display: none;
              }

              a:nth-child(n + 5) {
                width: 50%;
                align-items: center;
                margin-left: -10px;
                .num {
                  width: 20px;
                  font-size: 18px;
                  opacity: 0.4;
                  text-align: right;
                  font-weight: 700;
                  flex-shrink: 0;
                  line-height: 18px;
                }
                .name {
                  width: auto;
                  margin-top: 0;
                  margin-left: 9px;
                }
                .info {
                  margin-left: 0;
                  width: 0;
                }
                .txt {
                  width: 100%;
                  margin: 0;
                  line-height: 18px;
                }
                .name {
                  width: auto;
                  margin-top: 0;
                  margin-left: 9px;
                }
              }

              a:nth-child(n + 5) .pic,
              a:nth-child(n + 5) .remarks {
                display: none;
              }

              a {
                display: flex;
                flex-direction: row;
                margin-bottom: 16px;
                color: rgba(0, 0, 0, 0.9);
              }

              .info {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                margin-left: -25px;
                z-index: 1;
              }

              .pic {
                width: 64px;
                height: 87px;
                flex-shrink: 0;
                box-shadow: -6px 0 12px 0 rgba(0, 0, 0, 0.4);
                border-radius: 4px;
                overflow: hidden;
                img {
                  width: 100%;
                  height: 100%;
                }
              }

              .name,
              .remarks {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
              }
            }
          }
        }
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

  .main-ext {
    height: calc(100vh - 55px - 150px - var(--td-comp-size-l)) !important;
  }
  .main {
    flex-grow: 1;
    overflow-y: auto;
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
          right: 0;
          top: 0;
          &-tag {
            height: 18px;
            line-height: 18px;
            padding: 1px 6px;
            border-radius: 0 7px 0 7px;
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
