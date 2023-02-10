<template>
  <div class="iptv-container mx-auto">
    <div class="tool">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="title">
            <span class="data-item source">{{ iptvSetting.name ? iptvSetting.name : '暂无选择源' }}</span>
            <span class="data-item data">共{{ pagination.count ? pagination.count : 0 }}频道</span>
          </div>
        </div>
        <div class="right-operation-container">
          <t-space align="center">
            <t-select
              v-model="iptvClassSelect"
              :options="iptvClassList"
              :style="{ width: '100px' }"
              placeholder="分类"
              @change="classEvent"
            >
              <template #prefixIcon>
                <icon name="view-module" style="margin-right: 2px" />
              </template>
            </t-select>
            <t-input
              v-model.trim="searchTxt"
              placeholder="搜索频道"
              clearable
              :style="{ width: '200px' }"
              @enter="searchEvent"
              @clear="searchEvent"
            >
              <template #prefix-icon>
                <t-icon name="search" />
              </template>
            </t-input>
            <refresh-icon size="large" @click="refreshEvnent" />
          </t-space>
        </div>
      </t-row>
    </div>
    <div id="main" class="main">
      <div id="wrap-item" class="wrap-item">
        <div class="tv-wrap">
          <div id="tv-content" class="tv-content">
            <waterfall
              :list="iptvDataList.list"
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
                <div class="card" @click="playEvent(item)">
                  <div v-show="iptvSetting.iptvStatus" class="card-header">
                    <t-tag v-if="item.status" disabled size="small" variant="outline" theme="success">有效</t-tag>
                    <t-tag v-else disabled size="small" variant="outline" theme="danger">无效</t-tag>
                  </div>
                  <div class="card-main">
                    <!-- <LazyImg class="card-main-item" :url="item.logo" /> -->
                    <t-image
                      class="card-main-item"
                      :src="item.logo"
                      :style="{ width: '60px', height: '30px', background: 'none' }"
                      :lazy="true"
                      :loading="renderLoading"
                      :error="renderError"
                    >
                    </t-image>
                  </div>
                  <div class="card-footer">
                    <span class="card-footer-title">{{ item.name }}</span>
                  </div>
                </div>
              </template>
            </waterfall>
            <infinite-loading
              target="tv-content"
              :identifier="infiniteId"
              style="text-align: center; margin-bottom: 2em"
              top
              :distance="200"
              @infinite="load"
            >
              <template #complete>没有更多内容了</template>
              <template #error>哎呀，出了点差错</template>
            </infinite-loading>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="jsx">
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { Icon, LoadingIcon, LinkUnlinkIcon, RefreshIcon } from 'tdesign-icons-vue-next';

// import _ from 'lodash';
import { unionWith, isEqual, size } from 'lodash';

import InfiniteLoading from 'v3-infinite-loading';
import { Waterfall } from 'vue-waterfall-plugin-next';
import { usePlayStore } from '@/store';
import 'vue-waterfall-plugin-next/style.css';
import 'v3-infinite-loading/lib/style.css';

import { channelList, setting, iptv } from '@/lib/dexie';
import zy from '@/lib/site/tools';

const { ipcRenderer } = require('electron');

const store = usePlayStore();

const renderError = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
    <LinkUnlinkIcon size="1.5em" stroke="#f2f2f2" stroke-width=".8" />
  </div>
);
const renderLoading = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
    <LoadingIcon size="1.5em" stroke="#f2f2f2" stroke-width=".8" />
  </div>
);

const iptvSetting = ref({
  name: '',
  epg: '',
  skipIpv6: true,
  thumbnail: false,
});
const iptvDataList = ref({});
const iptvClassList = ref([
  {
    label: '全部',
    value: '全部',
  },
]);
const iptvClassSelect = ref('全部');

const searchTxt = ref('');

const infiniteId = ref(+new Date());
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

const options = reactive({
  // 唯一key值
  rowKey: 'id',
  // 卡片之间的间隙
  gutter: 30,
  // 是否有周围的gutter
  hasAroundGutter: true,
  // 卡片在PC上的宽度
  width: 190,
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

onMounted(() => {
  getIptvSetting();
  getChannelCount();
  getIptvClass();
});

const getIptvSetting = () => {
  setting.get('defaultIptv').then(async (id) => {
    if (!id) MessagePlugin.warning('请设置默认数据源');
    await iptv.get(id).then(async (res) => {
      iptvSetting.value.name = res.name;
      iptvSetting.value.epg = res.epg;
      if (!res.epg) iptvSetting.value.epg = await setting.get('defaultIptvEpg');
    });
  });
  setting.get('iptvSkipIpv6').then((res) => {
    iptvSetting.value.skipIpv6 = res;
  });
  setting.get('iptvStatus').then((res) => {
    iptvSetting.value.iptvStatus = res;
  });
};

const getChannelCount = () => {
  channelList.total().then((res) => {
    pagination.value.count = res;
  });
};

const getIptvClass = () => {
  channelList.class().then((res) => {
    // iptvClassList.value = _.unionWith(iptvClassList.value, res, _.isEqual);
    iptvClassList.value = unionWith(iptvClassList.value, res, isEqual);
  });
};

const getChannelList = async () => {
  const res = await channelList.pagination(
    searchTxt.value,
    iptvClassSelect.value,
    pagination.value.pageIndex,
    pagination.value.pageSize,
  );
  const sourceLength = res.list.length;
  console.log(res.list);
  if (iptvSetting.value.skipIpv6) res.list = res.list.filter((item) => !isIpv6(item.url));
  const restultLength = res.list.length;
  // iptvDataList.value.list = _.unionWith(iptvDataList.value.list, res.list, _.isEqual);
  iptvDataList.value.list = unionWith(iptvDataList.value.list, res.list, isEqual);
  if (iptvSetting.value.iptvStatus) await checkChannelList(pagination.value.pageIndex, pagination.value.pageSize);

  // 判断是否开启检查；判断原数据；判断原和目的
  // 1. 开启检查：为0  1).返回原或0
  // 2. 开启检查：非0  1).相等直接返回  2).不相等[原非0:目的0再次请求；原小于pagesise:目的小于pagesise返回原]  3).
  // 3. 非开启检查     1).直接返回原
  let length = sourceLength;
  if (iptvSetting.value.skipIpv6) {
    if (sourceLength) {
      if (sourceLength === restultLength) length = sourceLength;
      else if (restultLength === 0) {
        pagination.value.pageIndex++;
        await getChannelList();
      }
    } else length = sourceLength;
  }
  pagination.value.pageIndex++;
  return length;
};

const isIpv6 = (str) => {
  return /([0-9a-z]*:{1,4}){1,7}[0-9a-z]{1,4}/i.test(str);
};

const load = async ($state) => {
  console.log('loading...');
  try {
    const resLength = await getChannelList();
    // console.log(resLength, pagination.value.pageSize,resLength < pagination.value.pageSize)
    if (resLength === 0) $state.complete();
    else {
      // $state.loaded();
    }
  } catch (error) {
    $state.error();
  }
};

const refreshEvnent = () => {
  console.log('refresh');
  getIptvSetting();
  getChannelCount();
  getIptvClass();
  iptvDataList.value = {};
  // if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  if (!size(iptvDataList.value.list)) infiniteId.value++;
  // $state.loaded();
  pagination.value.pageIndex = 0;
  getChannelList();
};

const searchEvent = async () => {
  console.log('search');
  iptvDataList.value = {};
  // if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  if (!size(iptvDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getChannelList();
};

const classEvent = async () => {
  console.log('class');
  iptvDataList.value = {};
  // if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  if (!size(iptvDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getChannelList();
};

const playEvent = (item) => {
  store.updateConfig({
    type: 'iptv',
    data: {
      url: item.url,
      title: item.name,
      id: item.id,
      epg: iptvSetting.value.epg,
    },
  });

  ipcRenderer.send('openPlayWindow');
  // router.push({
  //   name: 'PlayIndex',
  //   query: { type: 'iptv', url: item.url, name: item.name, id: item.id },
  // });
};

// 检查状态
const checkChannelList = (pageIndex, pageSize) => {
  for (let i = pageIndex * pageSize; i < (pageIndex + 1) * pageSize; i++) {
    // console.log(iptvDataList.value.list[i].name);
    zy.checkChannel(iptvDataList.value.list[i].url).then((res) => {
      if (res) {
        iptvDataList.value.list[i].status = true;
      } else {
        iptvDataList.value.list[i].status = false;
      }
    });
  }
};
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';

.iptv-container {
  .tool {
    height: 50px;
    padding: 0 30px !important;
    .left-operation-container {
      .title {
        height: 32px;
        padding: 0 5px;
        // background-color: #f2f2f2;
        border-radius: 5px;
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
    .right-operation-container {
      width: auto;
    }
  }
  .main {
    overflow-y: auto;
    height: calc(100vh - 75px);
    .wrap-item {
      .tv-wrap {
        position: relative;
        .tv-content {
          height: calc(100vh - 105px);
          overflow-y: auto;
          .card {
            box-sizing: border-box;
            width: 190px;
            height: 110px;
            position: relative;
            box-shadow: var(--td-shadow-1);
            border-radius: var(--td-radius-medium);
            border: 5px solid #211f20;
            background-color: #373536;
            cursor: pointer;
            .card-header {
              color: #fbfbfb;
              .t-tag {
                position: absolute;
                top: 5px;
                left: 5px;
                font-size: 10px;
              }
              .card-header-title {
                background-color: rgba(0, 0, 0, 0.5);
                border-radius: 5px;
                padding: 0 5px;
                position: absolute;
                top: 5px;
                left: 5px;
                color: #fbfbfb;
                font-size: 10px;
              }
            }
            .card-main {
              width: 100%;
              height: 100%;
              .card-main-item {
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
              }
            }
            .card-footer {
              color: #fbfbfb;
              .card-footer-title {
                position: absolute;
                right: 0;
                bottom: 0;
                padding: 0 5px;
                max-width: 90%;
                color: #fbfbfb;
                font-weight: bold;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: clip;
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
    }
  }
}
</style>
