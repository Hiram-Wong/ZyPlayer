<template>
  <div class="film-container mx-auto">
    <div class="tool" :class="{ 'tool-ext': showToolbar }">
      <div class="header">
        <t-row justify="space-between">
          <div class="left-operation-container">
            <t-space>
              <div class="header-title-wrap">
                <div class="title">
                  <span class="data-item source">{{
                    FilmSiteSetting.basic.name ? FilmSiteSetting.basic.name : '暂无选择源'
                  }}</span>
                  <span class="data-item data"
                    >共{{ FilmSiteSetting.basic.recordcount ? FilmSiteSetting.basic.recordcount : 0 }}资源</span
                  >
                </div>
              </div>
              <div v-if="classKeywords" class="head-center">
                <p class="head-center-class">{{ FilmSiteSetting.class.name }}</p>
                <t-popup placement="bottom-right" :overlay-style="{ maxWidth: '60%', width: 'auto' }">
                  <more-icon size="1.5rem" style="transform: rotate(90deg)" />
                  <template #content>
                    <div class="content">
                      <span
                        v-for="item in classKeywords"
                        :key="item.type_id"
                        variant="text"
                        @click="defaultClass(item)"
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
              <!-- 源站 -->
              <!-- <t-select placeholder="源站" v-model="filterData.site" autoWidth>
              <t-option v-for="item in FilmSiteList" :key="item.key" :label="item.name" :value="item.name" />
            </t-select> -->
              <!-- <t-input-adornment :prepend="protocolSelect">
                <t-input v-model.trim="searchTxt" clearable placeholder="请输入关键词搜索" @enter="searchEvent">
                  <template #prefix-icon>
                    <t-icon name="search" />
                  </template>
                </t-input>
              </t-input-adornment> -->
              <!-- <t-input v-model.trim="searchTxt" clearable placeholder="请输入关键词搜索" @enter="searchEvent">
                <template #prefix-icon>
                  <t-icon name="search" />
                </template>
              </t-input> -->
              <div class="search-box">
                <div class="search-input">
                  <input
                    v-model.trim="searchTxt"
                    placeholder="输入关键词搜索"
                    class="search-input-item"
                    @keyup.enter="searchEvent"
                  />
                  <div class="hot-search-button" @click="hotEvent">
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
              <div class="quick_item quick_refresh">
                <refresh-icon size="large" @click="refreshEvnent" />
              </div>
            </t-space>
          </div>
        </t-row>
      </div>
      <!-- 过滤工具栏 -->
      <div v-show="showToolbar" class="toolbar">
        <!-- <t-space> -->
        <!-- 地区 -->
        <t-select v-model="filterData.area" class="toolbar-item" placeholder="地区">
          <t-option v-for="item in areasKeywords" :key="item" :label="item" :value="item" />
        </t-select>
        <!-- 排序 -->
        <t-select v-model="filterData.sort" class="toolbar-item" placeholder="排序">
          <t-option v-for="item in sortKeywords" :key="item" :label="item" :value="item" />
        </t-select>
        <!-- 日期 -->
        <!-- <t-date-picker mode="year" clearable allow-input v-model="selectedYear" format="YYYY 年" valueType="YYYY">
          </t-date-picker> -->
        <!-- <t-date-picker mode="year" clearable allow-input /> -->
        <t-date-range-picker
          v-model="filterData.date"
          class="toolbar-item"
          mode="year"
          clearable
          allow-input
          format="YYYY"
          value-type="YYYY"
        />
        <!-- </t-space> -->
      </div>
    </div>
    <div class="main" :class="{ 'main-ext': showToolbar }" infinite-wrapper>
      <div class="wrap-item">
        <div class="tv-wrap">
          <div class="tv-content">
            <waterfall
              :list="FilmDataList.list"
              :row-key="options.rowKey"
              :gutter="options.gutter"
              :has-around-gutter="options.hasAroundGutter"
              :width="options.width"
              :breakpoints="options.breakpoints"
              :img-selector="options.imgSelector"
              :background-color="options.backgroundColor"
              :animation-effect="options.animationEffect"
              :animation-duration="options.animationDuration"
              :animation-delay="options.animationDelay"
              :lazyload="options.lazyload"
            >
              <template #item="{ item }">
                <div class="card" @click="detailEvent(item)">
                  <div class="card-header">
                    <t-tag v-show="item.vod_remarks" disabled size="small" variant="light-outline" theme="success">
                      <span>{{ item.vod_remarks }}</span>
                    </t-tag>
                  </div>
                  <div class="card-main">
                    <t-image
                      class="card-main-item"
                      :src="item.vod_pic"
                      :style="{ width: '100%', height: '245px', background: 'none' }"
                      :lazy="true"
                      fit="cover"
                    >
                      <!-- <template #overlayContent>
                        <div class="op">
                          <t-space>
                            <span class="o-play" @click="playEvent(item.site, item)">播放</span>
                            <span class="o-star" @click="starEvent(item.site, item)">收藏</span>
                            <span class="o-share" @click="shareEvent(item.site, item)">分享</span>
                          </t-space>
                        </div>
                      </template> -->
                    </t-image>
                  </div>
                  <div class="card-footer">
                    <p class="card-footer-title">{{ item.vod_name }}</p>
                    <p class="card-footer-desc">{{ item.vod_blurb ? item.vod_blurb.trim() : '暂无剧情简介' }}</p>
                    <!-- <div class="card-footer-desc">
                      <t-space>
                        <span>{{ item.vod_area }}</span>
                        <span>{{ item.vod_year }}</span>
                        <span>{{ item.vod_type }}</span>
                      </t-space>
                    </div> -->
                  </div>
                </div>
              </template>
            </waterfall>
            <infinite-loading :identifier="infiniteId" style="text-align: center" top :distance="200" @infinite="load">
              <template #complete>没有更多内容了</template>
              <template #error>哎呀，出了点差错</template>
            </infinite-loading>
          </div>
        </div>
      </div>
    </div>
    <detail-view v-model:visible="formDialogDetail" :info="formDetailData" :site="FilmSiteSetting.basic" />
    <hot-view v-model:visible="formDialogHot" :site="FilmSiteSetting.basic" />
  </div>
</template>
<script setup lang="jsx">
import { ref, reactive, watch, nextTick, onMounted } from 'vue';

import { MoreIcon, ChartBarIcon, ViewModuleIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';

import InfiniteLoading from 'v3-infinite-loading';
import { Waterfall } from 'vue-waterfall-plugin-next';
import 'vue-waterfall-plugin-next/style.css';
import 'v3-infinite-loading/lib/style.css';

// import _ from 'lodash';
import { unionWith, isEqual, size } from 'lodash';

import DetailView from './film/detail/Detail.vue';
import HotView from './film/hot/Hot.vue';

import { sites, setting } from '@/lib/dexie';
import zy from '@/lib/site/tools';

const infiniteId = ref(+new Date()); // infinite-loading此属性更改重置组件
const showToolbar = ref(false); // 是否显示过滤框 true显示 false隐藏
const searchTxt = ref(''); // 搜索框
const sortKeywords = ['按片名', '按上映年份', '按更新时间']; // 过滤排序条件
const areasKeywords = ref([]); // 过滤地区
const classKeywords = ref([]); // 过滤类型
const filterData = ref({
  site: '',
  sort: '',
  class: '',
  area: '',
  date: [],
}); // 过滤选择值
const formDialogDetail = ref(false); // dialog是否显示详情
const formDetailData = ref(); // 详情组件传参
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
    recordcount: 0,
  },
  class: {
    id: 0,
    name: '最新',
  },
}); // 当前站点源
const FilmDataList = ref({}); // Waterfall
const FilmSiteList = ref(); // 站点

const options = reactive({
  // 唯一key值
  rowKey: 'id',
  // 卡片之间的间隙
  gutter: 30,
  // 是否有周围的gutter
  hasAroundGutter: true,
  // 卡片在PC上的宽度
  width: 196,
  // 自定义行显示个数，主要用于对移动端的适配
  breakpoints: {
    1200: {
      // 当屏幕宽度小于等于1200
      rowPerView: 4,
    },
    800: {
      // 当屏幕宽度小于等于800
      rowPerView: 3,
    },
    500: {
      // 当屏幕宽度小于等于500
      rowPerView: 2,
    },
  },
  // 动画效果
  animationEffect: 'animate__fadeInUp',
  // 动画时间
  animationDuration: 1000,
  // 动画延迟
  animationDelay: 300,
  // 背景色
  backgroundColor: 'rgba(0,0,0,0)',
  // imgSelector
  imgSelector: 'src.original',
  // 是否懒加载
  lazyload: true,
});

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
});

// const protocolSelect = ref(() => (
//   <t-select autoWidth options={['站内', '组内', '全部'].map((value) => ({ label: value, value }))} />
// ));

const filterEvent = () => {
  let filteredData = FilmDataList.value.list;
  console.log(filteredData);
  // 地区
  filteredData = filteredData.filter(
    (x) => filterData.value.area.length === 0 || filterData.value.area.includes(x.vod_area),
  );
  console.log('地区', filteredData);
  filteredData = filteredData.filter((x) => !setting.excludeR18Films || !containsClassFilterKeyword(x.vod_type));
  // 年份
  filteredData = filteredData.filter(
    (x) =>
      filterData.value.date.length === 0 ||
      (filterData.value.date[0] <= x.vod_year && x.vod_year <= filterData.value.date[1]),
  );
  console.log('年份', filteredData);
  switch (filterData.value.sort) {
    case '按上映年份':
      filteredData.sort((a, b) => {
        return b.vod_year - a.vod_year;
      });
      break;
    case '按片名':
      filteredData.sort((a, b) => {
        return a.vod_name.localeCompare(b.vod_name, 'zh');
      });
      break;
    case '按更新时间':
      filteredData.sort((a, b) => {
        return new Date(b.vod_last) - new Date(a.vod_last);
      });
      break;
    default:
      filteredData.sort((a, b) => {
        return new Date(b.vod_last) - new Date(a.vod_last);
      });
      break;
  }
  console.log('排序', filteredData);

  // Get unique film data
  filteredData = Array.from(new Set(filteredData));
  FilmDataList.value.list = filteredData;
};

const getFilmSetting = async () => {
  await nextTick(async () => {
    await setting.get('defaultSite').then((res) => {
      FilmSiteSetting.value.basic = res;
    });
    await setting.get('excludeRootClasses').then((res) => {
      FilmSiteSetting.value.excludeRootClasses = res;
    });
    await setting.get('rootClassFilter').then((res) => {
      FilmSiteSetting.value.rootClassFilter = res;
    });
    await setting.get('r18ClassFilter').then((res) => {
      FilmSiteSetting.value.r18ClassFilter = res;
    });
    await setting.get('excludeR18Films').then((res) => {
      FilmSiteSetting.value.excludeR18Films = res;
    });
  });
};

const getFilmArea = () => {
  const { list } = FilmDataList.value;
  areasKeywords.value = [...new Set(list.map((ele) => ele.vod_area))].filter((x) => x);
};

const getFilmSite = () => {
  sites.all().then((res) => {
    FilmSiteList.value = res.filter((item) => item.isActive);
  });
};

const containsClassFilterKeyword = (name) => {
  let ret = false;
  // 主分类过滤, 检测关键词是否包含分类名
  if (FilmSiteSetting.value.excludeRootClasses) {
    ret = FilmSiteSetting.value.rootClassFilter?.some((v) => v.includes(name));
  }
  // 福利过滤,检测分类名是否包含关键词
  if (FilmSiteSetting.value.excludeR18Films && !ret) {
    ret = FilmSiteSetting.value.r18ClassFilter?.some((v) => name?.includes(v));
  }
  return ret;
};

const getClass = async () => {
  const { key } = FilmSiteSetting.value.basic;
  await zy.class(key).then((res) => {
    pagination.value.pageIndex = res.page;
    pagination.value.count = res.pagecount;
    pagination.value.pageSize = res.pagesize;
    FilmSiteSetting.value.basic.recordcount = res.recordcount;
    const allClass = [{ type_id: 0, type_name: '最新' }];
    res.class.forEach((element) => {
      if (!containsClassFilterKeyword(element.type_name)) {
        allClass.push(element);
      }
    });
    classKeywords.value = allClass;
  });
};

const defaultClass = async (item) => {
  FilmSiteSetting.value.class.id = item.type_id;
  FilmSiteSetting.value.class.name = item.type_name;
  FilmDataList.value.list = [];
  pagination.value.pageIndex = 1;
  infiniteId.value++;
  await getFilmList();
};

const getFilmList = async () => {
  const { key } = FilmSiteSetting.value.basic;
  const pg = pagination.value.pageIndex;
  const t = FilmSiteSetting.value.class.id;
  let length;
  await zy.list(key, pg, t).then((res) => {
    // console.log(res);
    // FilmDataList.value.list = _.unionWith(FilmDataList.value.list, res, _.isEqual);
    FilmDataList.value.list = unionWith(FilmDataList.value.list, res, isEqual);
    pagination.value.pageIndex++;
    // length = _.size(res);
    length = size(res);
  });
  if (showToolbar.value) filterEvent();
  return length;
};

const load = async ($state) => {
  console.log('loading...');
  let resLength;
  try {
    if (!searchTxt.value) {
      resLength = await getFilmList();
    } else {
      resLength = 0;
    }
    // resLength = await getFilmList();
    await getFilmArea();
    console.log(resLength);
    if (resLength === 0) $state.complete();
    else {
      // $state.loaded();
    }
  } catch (error) {
    $state.error();
    console.log(error);
  }
};

const searchEvent = async () => {
  console.log('search');
  FilmDataList.value.list = [];
  // if (!_.size(FilmDataList.value.list)) infiniteId.value++;
  if (!size(FilmDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;

  const wd = searchTxt.value;
  const { key } = FilmSiteSetting.value.basic;
  if (wd) {
    await zy.search(key, wd).then((res) => {
      console.log(res);
      if (res) {
        res.forEach(async (item) => {
          await zy.detail(key, item.vod_id).then((res) => {
            FilmDataList.value.list.push(res);
          });
        });
      } else MessagePlugin.warning('暂无在本源搜索到相关资源');
    });
    console.log(FilmDataList.value.list);
  } else {
    await getFilmList();
  }
};

const refreshEvnent = async () => {
  console.log('refresh');
  await getFilmSetting();
  await getClass();
  FilmDataList.value = {};
  // if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  if (!size(FilmDataList.value.list)) infiniteId.value++;
  // $state.loaded();
  pagination.value.pageIndex = 0;
  await getFilmList();
  await getFilmSite();
  await getFilmArea();
};

const detailEvent = (item) => {
  formDetailData.value = item;
  console.log(formDetailData.value);
  formDialogDetail.value = true;
};

const hotEvent = () => {
  formDialogHot.value = true;
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';

.film-container {
  .tool-ext {
    height: 90px !important;
  }
  .tool {
    height: 50px;
    padding: 0 30px !important;
    .header,
    .toolbar {
      margin-bottom: 10px;
    }
    .header-title-wrap {
      .title {
        height: 32px;
        padding: 0 5px;
        .data-item {
          display: block;
          line-height: 1rem;
        }
        .source {
          font-weight: bold;
          font-size: 0.8rem;
        }
        .data {
          font-size: 0.7rem;
        }
      }
    }
    .header {
      .head-center {
        .head-center-class {
          max-width: 75px;
          height: 23px;
          font-size: 18px;
          font-weight: bold;
          float: left;
          margin-right: 5px;
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
            rgba(114, 214, 245, 0.2),
            rgba(200, 193, 221, 0.2) 50%,
            rgba(255, 148, 179, 0.2)
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
              color: #ed6a2c;
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
              vertical-align: middle;
              background-color: #ff008c;
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
    .toolbar {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      .toolbar-item {
        width: 33%;
      }
    }
  }

  .main-ext {
    height: calc(100vh - 115px) !important;
  }
  .main {
    overflow-y: auto;
    height: calc(100vh - 75px);
    .card {
      box-sizing: border-box;
      width: 196px;
      height: 310px;
      position: relative;
      cursor: pointer;
      .card-header {
        color: #fbfbfb;
        position: absolute;
        z-index: 2222;
        .t-tag {
          position: absolute;
          top: 5px;
          left: 5px;
          font-size: 10px;
        }
      }
      .card-main {
        width: 100%;
        // height: 100%;
        .card-main-item {
          border-radius: 7px;
          .op {
            background-color: rgba(0, 0, 0, 0.5);
            width: 100%;
            color: #f2f2f2;
            position: absolute;
            bottom: 0px;
            display: flex;
            justify-content: center;
          }
          :hover {
            transform: scale(1.05);
            transition: all 0.25s ease-in-out;
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
          // display: flex;
          // justify-content: center;
        }
      }
    }

    .card:hover {
      .card-footer-title {
        color: #ed6a2c;
      }
    }
  }
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
