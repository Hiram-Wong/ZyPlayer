<template>
  <div class="film-container">
    <div class="tool" :class="{ 'tool-ext': showToolbar }">
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
                  <span class="data-item data">
                    共{{ FilmSiteSetting.basic.recordcount ? FilmSiteSetting.basic.recordcount : 0 }}资源
                  </span>
                </div>
              </div>
              <div v-if="classKeywords" class="head-center">
                <p class="head-center-class">{{ FilmSiteSetting.class.name }}</p>
                <t-popup
                  placement="bottom-left"
                  :overlay-inner-style="{ marginTop: '16px', maxWidth: '60%' }"
                  attach=".head-center"
                >
                  <more-icon size="1.5rem" style="transform: rotate(90deg)" />
                  <template #content>
                    <div class="content">
                      <span
                        v-for="item in classKeywords"
                        :key="item.type_id"
                        variant="text"
                        @click="changeClassEvent(item)"
                      >
                        {{ item.type_name }}
                      </span>
                    </div>
                  </template>
                </t-popup>
              </div>
            </t-space>
          </div>
          <div class="right-operation-container">
            <t-space align="center">
              <div class="search-box">
                <div class="search-input">
                  <input
                    v-model.trim="searchTxt"
                    placeholder="输入关键词搜索"
                    class="search-input-item"
                    @keyup.enter="searchEvent"
                  />
                  <div class="hot-search-button" @click="formDialogHot = true">
                    <chart-bar-icon size="14" class="hot-search-button-icon" />
                    <span>热榜</span>
                  </div>
                  <div class="search-button-box" @click="searchEvent">
                    <div class="search-button">
                      <t-icon name="search" style="color: #fff" class="search-button-icon" />
                    </div>
                  </div>
                </div>
                <div class="search-list"></div>
              </div>
              <div class="quick_item quick_filter">
                <view-module-icon size="large" @click="showToolbar = !showToolbar" />
              </div>
            </t-space>
          </div>
        </t-row>
      </div>
      <!-- 过滤工具栏 -->
      <div v-show="showToolbar" class="toolbar">
        <!-- 地区 -->
        <div class="tags">
          <div class="tags-list">
            <div class="item title">地区</div>
            <div class="wp">
              <div
                v-for="item in areasKeywords"
                :key="item"
                class="item"
                :class="{ active: filterData.area === item }"
                :label="item"
                :value="item"
                @click="changeFilterEvent('area', item)"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
        <!-- 日期 -->
        <div class="tags">
          <div class="tags-list">
            <div class="item title">年份</div>
            <div class="wp">
              <div
                v-for="item in yearsKeywords"
                :key="item"
                class="item"
                :class="{ active: filterData.year === item }"
                :label="item"
                :value="item"
                @click="changeFilterEvent('year', item)"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 排序 -->
        <div class="tags">
          <div class="tags-list">
            <div class="item title">排序</div>
            <div class="wp">
              <div
                v-for="item in sortKeywords"
                :key="item"
                class="item"
                :class="{ active: filterData.sort === item }"
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
    </div>
    <div class="main" :class="{ 'main-ext': showToolbar }">
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
        style="text-align: center; margin-bottom: 2em"
        :distance="200"
        @infinite="load"
      >
        <template #complete>{{ infiniteCompleteTip }}</template>
        <template #error>哎呀，出了点差错</template>
      </infinite-loading>
    </div>
    <hot-view v-model:visible="formDialogHot" :site="FilmSiteSetting.basic" />
  </div>
</template>
<script setup lang="jsx">
import { ref, watch, onMounted } from 'vue';
import { useEventBus } from '@vueuse/core';
import { MoreIcon, ChartBarIcon, ViewModuleIcon } from 'tdesign-icons-vue-next';

import InfiniteLoading from 'v3-infinite-loading';
import 'v3-infinite-loading/lib/style.css';

import _ from 'lodash';

import { useIpcRenderer } from '@vueuse/electron';
import HotView from './film/hot/Hot.vue';

import { sites, setting } from '@/lib/dexie';
import zy from '@/lib/utils/tools';
import { usePlayStore } from '@/store';

const ipcRenderer = useIpcRenderer();

const store = usePlayStore();
const infiniteId = ref(+new Date()); // infinite-loading此属性更改重置组件
const showToolbar = ref(false); // 是否显示筛选框 true显示 false隐藏
const searchTxt = ref(''); // 搜索框
const sortKeywords = ['按更新时间', '按上映年份', '按片名']; // 过滤排序条件
const areasKeywords = ref(['全部']); // 过滤地区
const yearsKeywords = ref(['全部']); // 过滤年份
const classKeywords = ref([]); // 过滤类型
const filterData = ref({
  site: '',
  sort: '按更新时间',
  class: '',
  area: '全部',
  year: '全部',
  date: [],
}); // 过滤选择值
const formSiteData = ref({}); // 详情组件源传参
const formDialogHot = ref(false); // dialog是否显示热播榜
const pagination = ref({
  pageIndex: 0,
  pageSize: 36,
  count: 0,
}); // 分页请求
const FilmSiteSetting = ref({
  basic: {
    name: '',
    key: '',
    group: '',
    recordcount: 0,
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
const FilmSiteList = ref(); // 站点
const sitesList = ref({}); // 全部源
const sitesListSelect = ref(); // 选择的源
const infiniteCompleteTip = ref('没有更多内容了');

// 深度监听过滤条件变更
watch(
  () => filterData.value,
  (val) => {
    console.log(val);
    filterEvent();
  },
  { deep: true },
);

onMounted(async () => {
  await getFilmSetting();
  await getClass();
  await getFilmList();
  await getFilmSite();
  await getFilmArea();
  await getFilmYear();
});

// 筛选
const filterEvent = () => {
  const { rawList } = FilmDataList.value;
  const { area, year, sort } = filterData.value;

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
          return new Date(b.vod_time) - new Date(a.vod_time);
      }
    });

  // Get unique film data
  const uniqueData = Array.from(new Set(filteredData));
  FilmDataList.value.list = uniqueData;
};

// 筛选条件切换
const changeFilterEvent = (type, item) => {
  filterData.value[type] = item;
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
    const basic = await sites.get(defaultSite);
    const { id } = basic;
    sitesListSelect.value = id;
    FilmSiteSetting.value.basic = basic;
  } else {
    infiniteCompleteTip.value = '暂无数据,请前往设置-影视源设置默认源!';
  }

  sitesList.value = sitesAll.filter((item) => item.isActive);

  Object.assign(FilmSiteSetting.value, {
    rootClassFilter,
    r18ClassFilter,
    change: defaultChangeModel,
    searchType: defaultSearch,
    searchGroup:
      defaultSearch === 'site'
        ? [{ ...FilmSiteSetting.value.basic }]
        : defaultSearch === 'group'
        ? sitesList.value.filter((item) => item.group === FilmSiteSetting.value.basic.group)
        : sitesList.value,
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
  [yearsKeywords.value] = _.sortedUniq([
    _.unionWith(
      yearsKeywords.value,
      _.map(list, (item) => item.vod_year.split('–')[0]),
      _.isEqual,
    ),
  ]);
  yearsKeywords.value = yearsKeywords.value.sort((a, b) => b - a);
};

// 获取所有站点资源
const getFilmSite = async () => {
  const res = await sites.all();
  FilmSiteList.value = res.filter((item) => item.isActive);
};

// 青少年过滤
const containsClassFilterKeyword = (name) => {
  const { rootClassFilter, r18ClassFilter } = FilmSiteSetting.value;
  let ret = false;
  // 主分类过滤, 检测关键词是否包含分类名
  if (FilmSiteSetting.value.rootClassFilter) {
    ret = rootClassFilter.includes(name);
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
  const res = await zy.class(key);

  const { page, pagecount, pagesize, recordcount, class: classList } = res;
  pagination.value.pageIndex = page;
  pagination.value.count = pagecount;
  pagination.value.pageSize = pagesize;
  FilmSiteSetting.value.basic.recordcount = recordcount;

  const allClass = [
    { type_id: 0, type_name: '最新' },
    ...classList.filter((item) => !containsClassFilterKeyword(item.type_name)),
  ];
  classKeywords.value = allClass;
};

// 切换分类
const changeClassEvent = async (item) => {
  const { type_id, type_name } = item;
  FilmSiteSetting.value.class.id = type_id;
  FilmSiteSetting.value.class.name = type_name;
  FilmDataList.value.list = [];
  pagination.value.pageIndex = 1;
  infiniteId.value++;
  await getFilmList();
};

// 获取资源
const getFilmList = async () => {
  const { key } = FilmSiteSetting.value.basic;
  const pg = pagination.value.pageIndex;
  const t = FilmSiteSetting.value.class.id;

  try {
    const res = await zy.list(key, pg, t);
    const newFilms = _.differenceWith(res, FilmDataList.value.rawList, _.isEqual);
    FilmDataList.value.list = [...FilmDataList.value.list, ...newFilms];
    FilmDataList.value.rawList = [...FilmDataList.value.rawList, ...res];
    pagination.value.pageIndex++;
    if (showToolbar.value) filterEvent();
    return newFilms.length;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

// 加载
const load = async ($state) => {
  console.log('loading...');
  if (!sitesListSelect.value) {
    if (infiniteCompleteTip.value.indexOf('暂无数据') > -1) {
      $state.complete();
    }
    return;
  }
  try {
    const resLength = searchTxt.value ? 0 : await getFilmList();

    if (resLength === 0) $state.complete();
    else {
      await Promise.all([getFilmArea(), getFilmYear()]);
      $state.loaded();
    }
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

// 搜索
const searchEvent = async () => {
  console.log('search');
  FilmDataList.value.list = [];
  if (!_.size(FilmDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;

  const wd = searchTxt.value;
  if (wd) {
    try {
      const searchPromises = FilmSiteSetting.value.searchGroup.map((site) => {
        return zy.search(site.key, wd).then(async (res) => {
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
      console.error(err);
    }
  } else await getFilmList();
};

// 切换站点
const changeSitesEvent = async (event) => {
  if (FilmSiteSetting.value.change) await setting.update({ defaultSite: event });

  const res = await sites.get(event);
  sitesListSelect.value = res.id;
  FilmSiteSetting.value.basic.name = res.name;
  FilmSiteSetting.value.basic.key = res.key;
  FilmSiteSetting.value.class = {
    id: 0,
    name: '最新',
  };
  await getClass();
  FilmDataList.value = { list: [], rawList: [] };
  if (_.isEmpty(FilmDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getFilmList();
  await getFilmSite();
  await getFilmArea();
};

// 播放
const playEvent = (item) => {
  const { siteName, siteKey, vod_name } = item;

  formSiteData.value = {
    name: siteName || FilmSiteSetting.value.basic.name,
    key: siteKey || FilmSiteSetting.value.basic.key,
  };

  store.updateConfig({
    type: 'film',
    data: {
      info: item,
      ext: { site: formSiteData.value },
    },
  });

  ipcRenderer.send('openPlayWindow', vod_name);
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
  if (_.isEmpty(FilmDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getFilmList();
  await getFilmSite();
  await getFilmArea();
});
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.film-container {
  overflow: hidden;
  position: relative;
  .tool-ext {
    height: 190px !important;
  }
  .tool {
    height: 50px;
    padding: 0 10px 0 0;
    .header,
    .toolbar {
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

          .content {
            padding: 10px 0 10px 25px;
            span {
              display: inline-block;
              line-height: 20px;
              margin-right: 25px;
              width: 60px;
              overflow: hidden;
              text-overflow: inherit;
              white-space: nowrap;
              text-align: center;
              cursor: pointer;
              &:hover {
                background-color: var(--td-bg-color-component);
                border-radius: var(--td-radius-default);
              }
            }
          }
        }
      }
      .right-operation-container {
        .search-box {
          width: 220px;
          position: relative;
          height: 34px;
          border-radius: 21px;
          border: 1px solid rgba(0, 0, 0, 0);
          .search-input {
            border: 1px solid hsla(0, 0%, 100%, 0);
            background: linear-gradient(
              90deg,
              rgba(85, 187, 56, 0.2),
              rgba(216, 244, 222, 0.2) 50%,
              rgba(124, 212, 118, 0.2)
            );
            border-radius: 100px;
            width: 100%;
            white-space: nowrap;
            .search-input-item {
              background: rgba(255, 25, 255, 0);
              border: 0;
              font-size: 14px;
              color: hsla(0, 0%, 0%, 0.6);
              outline: 0 none;
              padding: 0 0 0 20px;
              vertical-align: middle;
              height: 34px;
              width: calc(100% - 80px);
            }
            .hot-search-button {
              display: inline-block;
              font-size: 13px;
              color: hsla(0, 0%, 0%, 0.6);
              line-height: 13px;
              cursor: pointer;
              :hover {
                color: var(--td-brand-color);
              }
              .hot-search-button-icon {
                width: 14px;
                height: 14px;
                color: hsla(0, 0%, 0%, 0.6);
                opacity: 0.8;
                display: inline-block;
                vertical-align: middle;
              }
            }
            .search-button-box {
              width: 44px;
              height: 28px;
              position: absolute;
              right: 0;
              top: 4px;
              cursor: pointer;
              .search-button {
                display: inline-block;
                font-size: 14px;
                background-color: var(--td-brand-color);
                margin: 0 0 0 12px;
                width: 28px;
                height: 28px;
                border-radius: 100%;
                text-align: center;
                line-height: 24px;
                .search-button-icon {
                  width: 14px;
                  height: 14px;
                  display: inline-block;
                }
              }
            }
          }
        }
      }
    }
    .toolbar {
      position: relative;
      margin-bottom: 10px;
      .tags {
        .tags-list {
          padding: 5px 0;
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
  }

  .main-ext {
    height: calc(100vh - 55px - 140px - var(--td-comp-size-l)) !important;
  }
  .main {
    overflow-y: auto;
    height: calc(100vh - 55px - var(--td-comp-size-l));
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
            .op {
              transition: all 0.25s ease-in-out;
              transform: scale(1.05);
              bottom: -6px;
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
