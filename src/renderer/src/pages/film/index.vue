<template>
  <div class="film view-container">
    <common-nav
      :title="$t('pages.film.name')"
      :list="siteConfig.filterOnlySearchData"
      :active="active.nav"
      search
      @change-key="changeConf"
   />

    <div class="content">
      <header class="header" v-if="classConfig.data.length > 0">
        <div class="header-nav">
          <title-menu :list="classConfig.data" :active="active.class" @change-key="changeClassEvent" />
        </div>
        <t-button theme="default" shape="square" variant="text" v-if="filterData[active.class]" class="quick_filter">
          <root-list-icon @click="isVisible.toolbar = !isVisible.toolbar" />
        </t-button>
      </header>
      <!-- 过滤工具栏 -->
      <div v-show="isVisible.toolbar" class="filter header-wrapper">
        <div class="tags">
          <div v-for="filterItem in filterData[active.class]" :key="filterItem.key" class="tags-list">
            <div class="item title">{{ filterItem.name }}</div>
            <div class="wp">
              <div v-for="item in filterItem.value" :key="item" class="item"
                :class="{ active: active.filter[filterItem.key] === item.v }" :label="item.n" :value="item.v"
                @click="changeFilterEvent(filterItem.key, item.v)">
                {{ item.n }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="content-wrapper" id="back-top">
          <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
            <t-col :md="3" :lg="3" :xl="2" :xxl="1" v-for="item in filmData.list" :key="item.vod_id" class="card"
              @click="playEvent(item)">
              <div class="card-main">
                <div v-if="item.vod_remarks || item.vod_remark" class="card-tag card-tag-orange">
                  <span class="card-tag-text text-hide">{{ item.vod_remarks || item.vod_remark }}</span>
                </div>
                <t-image class="card-main-item" :src="item.vod_pic"
                  :style="{ height: '100%', background: 'none', overflow: 'hidden' }" :lazy="true" fit="cover"
                  :loading="renderLoading" :error="renderError">
                  <template #overlayContent>
                    <div class="op" v-if="item.relateSite">
                      <div class="op-box">
                        <span>{{ item.relateSite.name }}</span>
                      </div>
                    </div>
                  </template>
                </t-image>
              </div>
              <div class="card-footer">
                <p class="card-footer-title text-hide">{{ item.vod_name }}</p>
                <p class="card-footer-desc text-hide">
                  <span v-if="item.vod_blurb">{{ item.vod_blurb }}</span>
                  <span v-else-if="item.vod_content">{{ item.vod_content }}</span>
                  <span v-else-if="item.vod_remarks">{{ item.vod_remarks }}</span>
                  <span v-else>{{ $t('pages.film.noDesc') }}</span>
                </p>
              </div>
            </t-col>
          </t-row>

          <div class="infinite-loading">
            <infinite-loading
              v-if="isVisible.lazyload"
              class="infinite-loading-container"
              :identifier="infiniteId"
              :duration="200"
              @infinite="load"
            >
              <template #complete>{{ $t(`pages.film.infiniteLoading.${active.infiniteType}`) }}</template>
              <template #error>{{ $t('pages.film.infiniteLoading.error') }}</template>
            </infinite-loading>
            <infinite-loading
              v-else="isVisible.lazyload"
              class="infinite-loading-container"
            />
          </div>
        </div>
      </div>
    </div>

    <detail-view v-model:visible="isVisible.detail" :ext="detailFormData.ext" :info="detailFormData.info" />
    <t-loading :attach="`.${prefix}-content`" size="medium" :loading="isVisible.loading" />
    <t-back-top container="#back-top" size="small" :offset="['1.4rem', '0.5rem']" :duration="2000" />
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import differenceBy from 'lodash/differenceBy';
import { MessagePlugin } from 'tdesign-vue-next';
import { RootListIcon } from 'tdesign-icons-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { onActivated, onMounted, reactive, ref } from 'vue';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';

import { fetchSiteActive, fetchCmsHome, fetchCmsInit, fetchCmsHomeVod, fetchCmsCategory, fetchCmsDetail, fetchCmsSearch } from '@/api/site';
import emitter from '@/utils/emitter';

import DetailView from './components/Detail.vue';
import CommonNav from '@/components/common-nav/index.vue';
import TitleMenu from '@/components/title-menu/index.vue';

const storePlayer = usePlayStore();

const renderError = () => {
  return (
    <div class="renderIcon" style="height: 100%">
      <img src={lazyImg} style="height: 100%; object-fit: cover;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="height: 100%">
      <img src={lazyImg} style="height: 100%; object-fit: cover;" />
    </div>
  );
};

const infiniteId = ref(+new Date()); // infinite-loading属性重置组件
const searchTxt = ref(''); // 搜索框
const searchCurrentSite = ref(); // 搜索当前源

const detailFormData = ref({
  info: {},
  ext: { site: {}, setting: {} },
}); //  详情组件源传参
const isVisible = reactive({
  toolbar: false,
  detail: false,
  loadClass: false,
  loading: false,
  lazyload: false
});
const pagination = ref({
  pageIndex: 1,
  pageSize: 36,
  count: 0,
  total: 0,
}); // 分页请求
const filterData = ref({});
const siteConfig = ref({
  default: {
    id: '',
    type: 0,
    categories: '',
    ext: ''
  },
  search: '',
  filter: false,
  data: [],
  filterOnlySearchData: [],
  searchGroup: []
}) as any;

const active = ref({
  nav: null,
  class: 'homeVod',
  tmpClass: '',
  tmpId: '',
  infiniteType: 'loading',
  filter: {}
}) as any;

const filmData = ref({
  list: [],
  rawList: [],
}) as any;

const classConfig = ref({
  data: []
});

onMounted(() => {
  getSetting();
});

onActivated(() => {
  const isListenedRefreshFilmConfig = emitter.all.get('refreshFilmConfig');
  if (!isListenedRefreshFilmConfig) emitter.on('refreshFilmConfig', refreshConf);
});


// 非cms筛选：基于请求数据
const filterApiEvent = async () => {
  filmData.value = { list: [], rawList: [] };
  pagination.value.pageIndex = 1;
  infiniteId.value++;
};

// 筛选条件切换
const changeFilterEvent = (key, item) => {
  console.log(`[film] change filter: ${key}:${item}`);
  active.value.filter[key] = item;

  filterApiEvent();
};

const searchGroup = (type: string, defaultConfig:{ [key: string]: string }) => {
  let query = siteConfig.value.data.filter((item) => item["search"] !== 0);
  if (type === 'site') query = query.filter((item) => item["id"] === defaultConfig["id"]);
  if (type === 'group') query = query.filter((item) => item["group"] === defaultConfig["group"]);

  return query;
};

const getSetting = async () => {
  try {
    const data = await fetchSiteActive();
    if (data.hasOwnProperty('default')) {
      siteConfig.value.default = data["default"];
      active.value.nav = data["default"]["id"];
      active.value.infiniteType = 'noMore';
    } else {
      active.value.infiniteType = 'noData';
    }
    if (Array.isArray(data['data']) && data["data"].length > 0) {
      siteConfig.value.data = data["data"];
      siteConfig.value.filterOnlySearchData = data["data"].filter((item) => item["search"] !== 2);
    }
    if (data.hasOwnProperty('filter')) {
      siteConfig.value.filter = data["filter"];
    }
    if (data.hasOwnProperty('search')) {
      siteConfig.value.search = data["search"];
      siteConfig.value.searchGroup = searchGroup(data["search"], data["default"]);
    }
  } catch (err) {
    active.value.infiniteType = 'noData';
  } finally {
    isVisible.lazyload = true;
  }
};

// 过滤条件-选中第一项
const classFilter = () => {
  const result = {};

  if (filterData[active.value.class]) {
    filterData[active.value.class].forEach((item) => {
      result[item.key] = item.value[0]?.v ?? '全部';
    });
  }

  active.value.filter = result;
};

// 获取分类
const getClassList = async (source) => {
  try {
    const res = await fetchCmsHome({ sourceId: source.id });
    if (Array.isArray(res?.class) && res?.class.length > 0) {
      const classDataFormat = res.class;
      classDataFormat.unshift({
        type_id: "homeVod",
        type_name: "首页"
      });
      classConfig.value.data = classDataFormat;
      const classItem = classDataFormat[0];
      active.value.class = classItem["type_id"];
    } else {
      active.value.infiniteType = 'categoryError';
    };
    if (Object.keys(res.filters).length > 0) filterData.value = res.filters;
  } catch (err) {
    console.log(err);
    active.value.infiniteType = 'netwotkError';
  }
};

// 切换分类
const changeClassEvent = (key: string) => {
  active.value.class = key;
  active.value.tmpClass = '';

  classFilter();
  searchTxt.value = '';
  active.value.infiniteType = 'noMore';
  filmData.value = { list: [], rawList: [] };
  emitter.emit('refreshSearchConfig');
  pagination.value.pageIndex = 1;
  infiniteId.value++;
};

// 获取资源
const getFilmList = async (source) => {
  const pg = pagination.value.pageIndex;
  const t = active.value.tmpClass || active.value.class;

  let length = 0;
  try {
    let res = { list: [] };
    if (active.value.class === 'homeVod') {
      res = await fetchCmsHomeVod({ sourceId: source.id })
    } else {
      res = await fetchCmsCategory({
        sourceId: source.id,
        page: pg,
        tid: t,
        f: JSON.stringify(active.value.filter)
      });
    };
    if (Array.isArray(res?.list) && res?.list.length > 0) {
      const newFilms = differenceBy(res.list, filmData.value.list, 'vod_id');
      filmData.value.list = [...filmData.value.list, ...newFilms];
      filmData.value.rawList = [...filmData.value.rawList, ...res.list];
      pagination.value.pageIndex++;
      length = newFilms.length;
    } else {
      active.value.infiniteType = 'netwotkError';
      length = 0;
    };
  } catch (err) {
    active.value.infiniteType = 'netwotkError';
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
    const checkComplete = () => {
      const stopFlag = ['noData', 'netwotkError', 'categoryError']
      return stopFlag.includes(active.value.infiniteType)
    }
    if (checkComplete()) {
      $state.complete();
      return;
    };
    const defaultSite = searchTxt.value ? searchCurrentSite.value : siteConfig.value.default;

    // setp1: 初始化
    if (!active.value.tmpId || active.value.tmpId !== defaultSite.id) {
      await fetchCmsInit({ sourceId: defaultSite.id });
      active.value.tmpId = defaultSite.id;
      pagination.value.pageIndex = 1;
    };

    // setp2: 获取分类
    if (classConfig.value.data.length <= 1 && !searchTxt.value) {
      await getClassList(defaultSite);
      if (checkComplete()) {
        $state.complete();
        return;
      };
    };

    // setp3: 加载数据
    const loadFunction = searchTxt.value ? getSearchList : getFilmList;
    const resLength = await loadFunction(defaultSite); // 动态加载数据

    if (resLength === 0 || filmData.value.list.filter((item) => item.vod_id === 'no_data').length > 0) {
      $state.complete();
    } else $state.loaded();
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

// 搜索
const searchEvent = async () => {
  console.log(`[film] search keyword:${searchTxt.value}`);
  active.value.infiniteType = 'noMore';
  filmData.value = { list: [], rawList: [] };
  pagination.value.pageIndex = 1;
  searchCurrentSite.value = siteConfig.value.searchGroup ? siteConfig.value.searchGroup[0] : null;
  infiniteId.value++;
};

// 搜索加载数据
const getSearchList = async () => {
  let length = 0;
  const pg = pagination.value.pageIndex;
  const searchGroup = siteConfig.value.searchGroup;
  const currentSite = searchCurrentSite.value;

  const index = searchGroup.indexOf(currentSite);
  const isLastSite = index + 1 >= searchGroup.length;
  const filterStatus = siteConfig.value.filter === 'on';

  try {
    // 1. 判断当前搜索的站点是否为空 || 超出站点
    if (!currentSite || index + 1 > searchGroup.length) {
      console.log('[film][search] no site or index out of bounds');
      return length;
    };

    // 2. 请求数据
    const res = await fetchCmsSearch({ sourceId: currentSite.id, wd: searchTxt.value, page: pg === 1 ? null : pg });
    const reSearch = res?.list;

    // 2.1 数据为空
    if (!Array.isArray(reSearch) || reSearch.length === 0) {
      console.log('[film][search] empty search results');
      // 聚搜过程中,如果某个站搜不出来结果，返回1让其他站继续搜索。单搜就返回0终止搜索
      if (isLastSite) {
        length = 0;
      } else {
        length = 1;
        searchCurrentSite.value = searchGroup[index + 1];
      };
      pagination.value.pageIndex = 1;
      return length;
    }

    // 2.2 数据去重
    let resultDetail = filterStatus ? reSearch.filter((item) => item?.vod_name.includes(searchTxt.value)) : reSearch;
    let newFilms = differenceBy(resultDetail, filmData.value.list, 'vod_id'); // 去重
    if (newFilms.length > 0) {
      newFilms = resultDetail.map(item => ({ ...item, relateSite: currentSite }));
      filmData.value.list.push(...newFilms);

      length = newFilms.length;
      pagination.value.pageIndex++;
      return length;
    } else {
      if (isLastSite) {
        length = 0;
      } else {
        length = 1;
        searchCurrentSite.value = searchGroup[index + 1];
      };
      pagination.value.pageIndex = 1;
      return length;
    }
  } catch (err) {
    console.log(err)
    // 聚搜的某一个站点发生错误,返回1让其他站点能继续搜索。只有一个站点进行搜索的时候发生错误就返回0终止搜索
    if (isLastSite) {
      length = 0;
    } else {
      length = 1;
      searchCurrentSite.value = searchGroup[index + 1];
    };
    pagination.value.pageIndex = 1;
  } finally {
    console.log(`[film] load data length: ${length}`);
    return length;
  }
};

// 播放
const playEvent = async (item) => {
  isVisible.loading = true;

  try {
    let site = item?.relateSite ? item.relateSite: siteConfig.value.default;

    if (!active.value.tmpId || active.value.tmpId !== site.id) {
      await fetchCmsInit({ sourceId: site.id });
      active.value.tmpId = site.id;
    };

    // folder模式
    if (item.hasOwnProperty('vod_tag') && item['vod_tag'] === 'folder') {
      active.value.tmpClass = item.vod_id;
      filmData.value = { list: [], rawList: [] };
      pagination.value.pageIndex = 1;
      infiniteId.value++;
      return;
    };

    if (!('vod_play_from' in item && 'vod_play_url' in item)) {
      const res = await fetchCmsDetail({ sourceId: site.id, id: item.vod_id });
      const detailItem = res?.list[0];
      detailItem.vod_name = item.vod_name;
      detailItem.vod_pic = item.vod_pic;
      item = detailItem;
    };

    console.log('[film][playEvent]', item);

    const playerMode = storePlayer.getSetting.playerMode;
    const doc = {
      info: item,
      ext: { site, setting: storePlayer.setting },
    }
    if (playerMode.type === 'custom') {
      detailFormData.value = doc;
      isVisible.detail = true;
    } else {
      storePlayer.updateConfig({
        type: 'film',
        status: true,
        data: doc,
      });

      window.electron.ipcRenderer.send('open-play-win', item.vod_name);
    }
  } catch (err) {
    console.error(`[film][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  } finally {
    isVisible.loading = false;
  }
};

emitter.on('searchFilm', (data: any) => {
  console.log('[film][bus][receive]', data);
  const { kw, group, filter } = data;
  searchTxt.value = kw;
  siteConfig.value.filter = filter;
  if (siteConfig.value.search !== group)  siteConfig.value.search = group;
  siteConfig.value.searchGroup = searchGroup(group, siteConfig.value.default);
  searchEvent();
});

const defaultConf = () => {
  isVisible.lazyload = true;
  isVisible.loadClass = false;
  active.value.infiniteType = 'noData';
  active.value.class = 'homeVod';
  active.value.tmpClass = '';
  active.value.tmpId = '';
  searchTxt.value = '';
  active.value.nav = '';
  siteConfig.value.default = {};
  classConfig.value.data = [];
  filmData.value = { list: [], rawList: [] };
  filterData.value = {};
  emitter.emit('refreshSearchConfig');
  pagination.value.pageIndex = 1;
  infiniteId.value++;
};

const refreshConf = async () => {
  console.log('[film][bus][refresh]');
  defaultConf();
  await getSetting();
};

const changeConf = async (key: string) => {
  try {
    defaultConf();
    active.value.nav = key;
    siteConfig.value.default = siteConfig.value.data.find(item => item.id === key);
    active.value.infiniteType = 'noMore';
  } catch (err) {
    active.value.infiniteType = 'noData';
  } finally {
    isVisible.lazyload = true;
  }
};
</script>

<style lang="less" scoped>
.film {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;

  .content {
    // width: calc(100% - 170px);
    min-width: 750px;
    position: relative;
    padding: var(--td-pop-padding-l);
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      white-space: nowrap;
      flex-shrink: 0;
      width: 100%;

      .header-nav {
        width: 100%;
        overflow: hidden;
      }

      :deep(.t-button) {
        &:not(.t-is-disabled):not(.t-button--ghost) {
          --ripple-color: transparent;
        }
      }

      :deep(.t-button__text) {
        svg {
          color: var(--td-text-color-placeholder);
        }
      }

      :deep(.t-button--variant-text) {
        &:hover {
          border-color: transparent;
          background-color: transparent;

          .t-button__text {
            svg {
              color: var(--td-primary-color);
            }
          }
        }
      }

      .quick_filter {
        margin-right: -6px;
      }
    }

    .filter {
      position: relative;
      height: auto;
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
      flex: 1;
      height: 100%;
      width: 100%;
      overflow: hidden;

      .content-wrapper {
        overflow-y: auto;
        overflow-x: hidden;
        width: 100%;
        height: 100%;
        position: relative;

        .card {
          box-sizing: border-box;
          width: inherit;
          position: relative;
          cursor: pointer;

          .text-hide {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
          }

          .card-main {
            position: relative;
            width: 100%;
            height: 0;
            overflow: hidden;
            border-radius: var(--td-radius-default);
            padding-top: 139.9%;

            .card-tag-orange {
              background: #ffdd9a;
              color: #4e2d03;
            }

            .card-tag {
              z-index: 15;
              position: absolute;
              left: 0;
              top: 0;
              border-radius: 6px 0 6px 0;
              padding: 1px 6px;
              max-width: 60%;

              .card-tag-text {
                font-size: 12px;
                height: 18px;
                line-height: 18px;
              }
            }

            .card-main-item {
              position: absolute;
              top: 0;
              left: 0;
              display: block;
              width: 100%;
              height: 100%;

              .op {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                background: linear-gradient(to bottom, rgba(22, 24, 35, 0.4) 0%, rgba(22, 24, 35, .8) 100%);

                .op-box {
                  padding: var(--td-comp-paddingTB-xs) 0;
                  background: linear-gradient(to right,
                      rgba(255, 255, 255, 0),
                      rgba(255, 255, 255, 0.4) 30%,
                      rgba(255, 255, 255, 0.4) 70%,
                      rgba(255, 255, 255, 0));
                  ;

                  span {
                    text-align: center;
                    display: inline-block;
                    width: 100%;
                    color: #fdfdfd;
                    font-weight: 500;
                  }
                }
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
            position: relative;
            padding-top: var(--td-comp-paddingTB-s);

            .card-footer-title {
              font-weight: 700;
              line-height: var(--td-line-height-title-medium);
              height: 22px;
            }

            .card-footer-desc {
              font-size: 13px;
              line-height: var(--td-line-height-body-large);
              color: var(--td-text-color-placeholder);
            }
          }

          &:hover {
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
