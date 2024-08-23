<template>
  <div class="film view-container">
    <common-nav :title="$t('pages.film.name')" :list="siteConfig.data" :active="active.nav" search
      @change-key="changeSitesEvent" />
    <div class="content">
      <header class="header" v-if="classConfig.data.length > 0">
        <div class="header-nav">
          <tag-nav :list="classConfig.data" :active="active.class" @change-key="changeClassEvent" />
        </div>
        <div v-if="filter.data[active.class]" class="quick_item quick_filter">
          <root-list-icon size="large" @click="isVisible.toolbar = !isVisible.toolbar" />
        </div>
      </header>
      <div class="container" :class="classConfig.data.length > 0 ? 'container-full' : 'container-hidden'">
        <!-- 过滤工具栏 -->
        <div v-show="isVisible.toolbar" class="filter header-wrapper">
          <div class="tags">
            <div v-for="filterItem in filter.data[active.class]" :key="filterItem.key" class="tags-list">
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
        <div class="content-wrapper" id="back-top">
          <t-row :gutter="[16, 16]" style="margin: 0;">
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
          <infinite-loading v-if="isVisible.infiniteLoading" class="infinite-loading-container" :identifier="infiniteId"
            :distance="200" @infinite="load">
            <template #complete>{{ infiniteCompleteTip }}</template>
            <template #error>{{ $t('pages.film.infiniteLoading.complete') }}</template>
          </infinite-loading>
        </div>
      </div>
    </div>

    <detail-view v-model:visible="isVisible.detail" :site="siteConfig.default" :data="formDetailData" />
    <t-loading :attach="`.${prefix}-content`" size="medium" :text="$t('pages.setting.loading')"
      :loading="isVisible.loading" />
    <t-back-top container="#back-top" size="small" :offset="['1.4rem', '0.5rem']" :duration="2000" />
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import _ from 'lodash';
import PQueue from 'p-queue';
import { MessagePlugin } from 'tdesign-vue-next';
import { RootListIcon } from 'tdesign-icons-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { onActivated, onMounted, reactive, ref } from 'vue';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';

import { fetchSiteActive } from '@/api/site';
import emitter from '@/utils/emitter';
import {
  fetchClassify,
  fetchList,
  fetchSearch,
  fetchDetail,
  t3RuleInit,
  t3RuleTerminate,
  catvodRuleInit,
  xbpqInit
} from '@/utils/cms';

import DetailView from './film/Detail.vue';
import CommonNav from '../components/common-nav/index.vue';
import TagNav from '../components/tag-nav/index.vue';

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
  gridList: false,
  t3Work: false,
  catvod: false,
  loading: false
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
}) as any;

const infiniteCompleteTip = ref(`${t('pages.film.infiniteLoading.noMore')}`);

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
  searchGroup: []
}) as any;

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
}) as any;

const filmData = ref({
  list: [],
  rawList: [],
}) as any;

const classConfig = ref({
  data: [{ type_id: 0, type_name: '最新' }]
}) as any;

onMounted(() => {
  getSetting();
});

onActivated(() => {
  const isListenedRefreshFilmConfig = emitter.all.get('refreshFilmConfig');
  if (!isListenedRefreshFilmConfig) emitter.on('refreshFilmConfig', refreshConfig);
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
  if (type === 2 || type === 6 || type === 7 || type === 8 || type === 9) {
    filterFormat = Object.entries(active.value.filter)
      .reduce<{ [key: string]: string | undefined }>((item, [key, value]) => {
        if (typeof value === 'string' && value !== '') {
          item[key] = value as string;
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
      infiniteCompleteTip.value = t('pages.film.infiniteLoading.noData');
    }
    if (_.has(data, 'data') && !_.isEmpty(data["data"])) {
      siteConfig.value.data = data["data"];
    }
    if (_.has(data, 'filter') && !_.isEmpty(data["filter"])) {
      siteConfig.value.filter = data["filter"];
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

  const listFormat = dataFormat.map((item) => {
    ;
    return { n: item, v: item === '全部' ? '' : item };
  });

  const id = active.value.class;
  const currentFilter = filter.value.data[id];

  const index = _.findIndex(currentFilter, { key: 'area' });
  console.log(`[film] cms filter area: `, listFormat);
  filter.value.data[id][index].value = listFormat;
};

// 获取年份
const arrangeCmsYear = () => {
  const { rawList } = filmData.value;
  const id = active.value.class;
  const { type } = siteConfig.value.default;
  const currentFilter = filter.value.data[id];
  const index = _.findIndex(currentFilter, { key: 'year' });

  let data;
  if (type === 0) data = _.compact(_.map(rawList, (item) => item["vod_year"]));
  else data = _.compact(_.map(rawList, (item) => item["vod_year"].split('–')[0]));
  data.unshift('全部');
  const dataFormat = _.uniq(data);
  const listFormat = dataFormat.map((item) => {
    ;
    return { n: item, v: item === '全部' ? '' : item };
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
      infiniteCompleteTip.value = t('pages.film.infiniteLoading.categoryError');
      isVisible.loadClass = false;
    } else {
      const classItem = classDataFormat[0];
      active.value.class = classItem["type_id"];
      if (!_.isEmpty(filters)) classFilter(filters);
      isVisible.loadClass = true;
    }
  } catch (err) {
    console.log(err);
    infiniteCompleteTip.value = t('pages.film.infiniteLoading.netwotkError');
  }
};

// 切换分类
const changeClassEvent = (key) => {
  active.value.class = key;
  if (!_.isEmpty(filter.value.data)) classFilter(filter.value.data);
  filterApiEvent();
  searchTxt.value = '';
  infiniteCompleteTip.value = t('pages.film.infiniteLoading.noMore');
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

  console.log(`[film] load parameter: ${defaultSite.type === 2 || defaultSite.type === 7 ? JSON.stringify({ ...format }) : JSON.stringify(format)}`);

  let length = 0;
  try {
    const res = await fetchList(defaultSite, pg, t, defaultSite.type === 2 || defaultSite.type === 7 ? { ...format } : format);
    const newFilms = _.differenceWith(res, filmData.value.list, _.isEqual);
    filmData.value.list = [...filmData.value.list, ...newFilms];
    filmData.value.rawList = [...filmData.value.rawList, ...res];
    pagination.value.pageIndex++;
    if (defaultSite.type === 0 || defaultSite.type === 1) filterEvent();
    length = newFilms.length;
  } catch (err) {
    infiniteCompleteTip.value = t('pages.film.infiniteLoading.netwotkError');
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
      infiniteCompleteTip.value = t('pages.film.infiniteLoading.noData');
      $state.complete();
      return;
    };

    const defaultSite = searchTxt.value ? searchCurrentSite.value : siteConfig.value.default;

    if (defaultSite.type === 7 && !isVisible.t3Work) {
      const res = await t3RuleInit(defaultSite);
      if (res.code === 200) isVisible.t3Work = true;
      else $state.error();
    } else if (defaultSite.type === 8 && !isVisible.catvod) {
      const content = await catvodRuleInit(defaultSite);
      if (typeof content === 'object') isVisible.catvod = true;
      else $state.error();
    } else if (defaultSite.type === 9) {
      const content = await xbpqInit(defaultSite);
      if (!content) $state.error();
    };

    if (!isVisible.loadClass && !searchTxt.value) await getClassList(defaultSite); // 加载分类

    const loadFunction = searchTxt.value ? getSearchList : getFilmList;
    const resLength = await loadFunction(); // 动态加载数据

    if (resLength === 0 || filmData.value.list[0]?.vod_name === '无数据,防无限请求') {
      $state.complete();
    } else {
      if (defaultSite.type === 0 || defaultSite.type === 1) {
        arrangeCmsArea();
        arrangeCmsYear();
      }
      $state.loaded();
    };
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

// 搜索
const searchEvent = async () => {
  console.log(`[film] search keyword:${searchTxt.value}`);
  infiniteCompleteTip.value = t('pages.film.infiniteLoading.noMore');
  filmData.value.list = [];
  filmData.value.rawList = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;
  searchCurrentSite.value = siteConfig.value.searchGroup ? siteConfig.value.searchGroup[0] : null;
};

// 搜索加载数据
const getSearchList = async () => {
  let length = 0;
  const pg = pagination.value.pageIndex;
  const searchGroup: any = siteConfig.value.searchGroup;
  const currentSite = searchCurrentSite.value;

  if (!currentSite) {
    console.log('[film][search] No search site found.');
    return length;
  }

  const index = searchGroup.indexOf(currentSite);
  const isLastSite = index + 1 >= searchGroup.length;
  if (index + 1 > searchGroup.length && searchGroup.length > 1) return length; // 没有更多站点
  // if (pg > 5) return length; // 单个搜索不允许超过5页

  // searchCurrentSite.value = isLastSite ? null : searchGroup[index + 1];
  searchCurrentSite.value = isLastSite ? currentSite : searchGroup[index + 1];

  try {
    const resultSearch = await fetchSearch(currentSite, searchTxt.value, pg);
    if (!resultSearch || resultSearch.length === 0) {
      console.log('[film][search] Empty search results.');
      // 聚搜过程中,如果某个站搜不出来结果，返回1让其他站继续搜索。单搜就返回0终止搜索
      length = searchGroup.length > 1 ? 1 : 0;
      return length;
    }

    // console.log('currentSite:', currentSite);
    let resultDetail = siteConfig.value.filter === 'on' ? resultSearch.filter((item) => item?.vod_name.indexOf(searchTxt.value) > -1) : resultSearch;

    if (resultSearch.length > 0 && !_.has(resultSearch[0], 'vod_pic')) {
      if ([0, 1].includes(currentSite.type)) {
        const ids = resultSearch.map((item) => item.vod_id);
        resultDetail = await fetchDetail(currentSite, ids.join(','));
      } else if ([2, 6, 7].includes(currentSite.type)) {
        console.log('[film][search] updatePic not use in drpy/hipy sites.');
      } else {
        const updatePic = async (item) => {
          try {
            const result = await fetchDetail(currentSite, item.vod_id);
            return result[0];
          } catch (error) {
            return false;
          }
        };
        const res = await Promise.all(resultSearch.map(item => queue.add(() => updatePic(item))));
        resultDetail = res.filter(Boolean);
      }
    }

    const filmList = resultDetail
      .map((item) => ({
        ...item,
        relateSite: currentSite
      }));

    const newFilms = _.differenceWith(filmList, filmData.value.list, _.isEqual); // 去重
    filmData.value.list.push(...newFilms);
    // 最后一个站点，并且是聚搜，参与搜索的站点数大于1的情况，正常搜完一个就结束。只有一个站点正常搜索还要继续搜
    length = isLastSite && searchGroup.length > 1 ? 0 : newFilms.length;
  } catch (err) {
    // 聚搜的某一个站点发生错误,返回1让其他站点能继续搜索。只有一个站点进行搜索的时候发生错误就返回0终止搜索
    length = searchGroup.length > 1 ? 1 : 0;
    console.error(err);
  } finally {
    console.log(`[film] load data length: ${length}`);
    if (searchGroup.length > 1) { // 聚搜的站点每个搜索完都重新初始化drpy源
      isVisible.t3Work = false;
      isVisible.catvod = false;
    } else { // 只有一个站点搜索的情况给页面加1下次继续搜索
      pagination.value.pageIndex++;
    }
  }
  return length;
};

// 切换站点
const changeSitesEvent = async (key: string) => {
  isVisible.infiniteLoading = true;
  isVisible.loadClass = false;
  isVisible.t3Work = false;
  if (siteConfig.value.default.type === 7) await t3RuleTerminate();
  isVisible.catvod = false;
  infiniteCompleteTip.value = t('pages.film.infiniteLoading.noMore');
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
  siteConfig.value.searchGroup = await searchGroup(siteConfig.value.search);
};

// 播放
const playEvent = async (item) => {
  isVisible.loading = true;

  try {
    let site = siteConfig.value.default;
    if (_.has(item, 'relateSite')) {
      const relateSite = item.relateSite;
      site = relateSite;
      try {
        if (relateSite.type === 7) {
          await t3RuleTerminate();  // 搜索加载和详情同时触发会冲突, 优先详情, 会阻断搜索加载
          const res = await t3RuleInit(relateSite);
          if (res.code === 200) isVisible.t3Work = true;
        } else if (relateSite.type === 8) {
          const content = await catvodRuleInit(relateSite);
          if (typeof content === 'object') isVisible.catvod = true;
        };
      } catch (err) {
        console.log(`[film][playEvent][error]`, err)
      } finally {
        isVisible.t3Work = false;
        isVisible.catvod = false;
      }
    }

    if (!('vod_play_from' in item && 'vod_play_url' in item)) {
      let [detailItem] = await fetchDetail(site, item.vod_id);
      if (siteConfig.value.default.type === 9) {
        detailItem.vod_name = item.vod_name;
        detailItem.vod_pic = item.vod_pic;
      };
      item = detailItem;
    };

    console.log('[film][playEvent]', item);

    const playerMode = storePlayer.getSetting.playerMode;
    if (playerMode.type === 'custom') {
      formDetailData.value = item;
      isVisible.detail = true;
    } else {
      storePlayer.updateConfig({
        type: 'film',
        status: true,
        data: {
          info: item,
          ext: { site: site },
        },
      });

      window.electron.ipcRenderer.send('openPlayWindow', item.vod_name);
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
  if (siteConfig.value.search !== group) {
    siteConfig.value.search = group;
    siteConfig.value.searchGroup = searchGroup(group);
  };
  searchEvent();
});

const refreshConfig = async () => {
  console.log('[film][bus][refresh]');
  isVisible.loadClass = false;
  isVisible.t3Work = false;
  if (siteConfig.value.default.type === 7) await t3RuleTerminate();
  isVisible.catvod = false;
  infiniteCompleteTip.value = t('pages.film.infiniteLoading.noMore');
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
};
</script>

<style lang="less" scoped>
.film {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
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
    // width: calc(100% - 170px);
    min-width: 750px;
    position: relative;
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    flex: 1;
    display: flex;
    flex-direction: column;

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

      .quick_filter {
        display: flex;
        align-items: center;
        cursor: pointer;
      }
    }

    .container-full {
      height: calc(100% - 58px);
    }

    .container-hidden {
      height: 100%;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
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
            border-radius: 7px;
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
