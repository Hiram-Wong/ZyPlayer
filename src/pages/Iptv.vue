<template>
  <div class="iptv-container">
    <div class="tool">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-space align="center">
            <div class="title">
              <t-select
                v-model="iptvListSelect"
                placeholder="暂无选择源"
                size="small"
                :show-arrow="false"
                style="max-width: 80px"
                class="data-item source"
                @change="changeDefaultIptvEvent"
              >
                <t-option v-for="item in iptvList" :key="item.id" :label="item.name" :value="item.id" />
              </t-select>
              <span class="data-item data">共{{ pagination.count ? pagination.count : 0 }}频道</span>
            </div>
            <div v-if="iptvClassList" class="head-center">
              <p class="head-center-class">{{ iptvClassSelect }}</p>
              <t-popup
                placement="bottom-left"
                :overlay-inner-style="{ marginTop: '16px', maxWidth: '60%' }"
                attach=".head-center"
              >
                <more-icon size="1.5rem" style="transform: rotate(90deg)" />
                <template #content>
                  <div class="content">
                    <span v-for="item in iptvClassList" :key="item.id" variant="text" @click="changeClassEvent(item)">
                      {{ item.name }}
                    </span>
                  </div>
                </template>
              </t-popup>
            </div>
          </t-space>
        </div>
        <div class="right-operation-container">
          <div class="search-box">
            <div class="search-input">
              <input
                v-model.trim="searchTxt"
                placeholder="输入关键词搜索"
                class="search-input-item"
                @keyup.enter="searchEvent"
              />
              <div class="search-button-box" @click="searchEvent">
                <div class="search-button">
                  <t-icon name="search" style="color: #fff" class="search-button-icon" />
                </div>
              </div>
            </div>
            <div class="search-list"></div>
          </div>
        </div>
      </t-row>
    </div>
    <div class="main">
      <div class="main-flow-wrap">
        <div v-for="item in iptvDataList.list" :key="item.id" class="card-wrap">
          <div class="card" @click="playEvent(item)" @contextmenu="conButtonClick(item, $event)">
            <div v-show="iptvSetting.iptvStatus" class="card-header">
              <t-tag v-if="item.status" disabled size="small" variant="outline" theme="success">有效</t-tag>
              <t-tag v-else disabled size="small" variant="outline" theme="danger">无效</t-tag>
            </div>
            <div class="card-main">
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
        </div>
        <context-menu :show="show" :options="optionsComponent" @close="show = false">
          <context-menu-item label="拷贝频道链接" @click="copyChannelEvent" />
          <context-menu-item label="删除频道" @click="delChannelEvent" />
        </context-menu>
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
  </div>
</template>
<script setup lang="tsx">
import { ref, computed, onMounted } from 'vue';
import { useEventBus, useClipboard } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';
import { MoreIcon, LoadingIcon, LinkUnlinkIcon } from 'tdesign-icons-vue-next';

import axios from 'axios';
import _ from 'lodash';
import { ContextMenu, ContextMenuItem } from '@imengyu/vue3-context-menu';
import InfiniteLoading from 'v3-infinite-loading';
import { useIpcRenderer } from '@vueuse/electron';
import { useSettingStore, usePlayStore } from '@/store';

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import 'v3-infinite-loading/lib/style.css';

import { channelList, setting, iptv } from '@/lib/dexie';
import zy from '@/lib/site/tools';

const ipcRenderer = useIpcRenderer();

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const renderError = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <LinkUnlinkIcon size="1.5em" stroke="#f2f2f2" stroke-width=".8" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <LoadingIcon size="1.5em" stroke="#f2f2f2" stroke-width=".8" />
    </div>
  );
};

const iptvSetting = ref({
  name: '',
  epg: '',
  skipIpv6: false,
  iptvStatus: false,
});
const iptvList = ref({});
const iptvListSelect = ref();
const iptvDataList = ref({});
const iptvClassList = ref([{ id: '全部', name: '全部' }]);
const iptvClassSelect = ref('全部');

const searchTxt = ref('');

const infiniteId = ref(+new Date());
const infiniteCompleteTip = ref('没有更多内容了');
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});

const show = ref(false);
const mode = computed(() => {
  return storeSetting.displayMode;
});
const optionsComponent = ref({
  zIndex: 3,
  width: 160,
  x: 500,
  y: 200,
  theme: mode.value === 'light' ? 'default' : 'default dark',
});
const channelItem = ref(null);

onMounted(() => {
  getIptvSetting();
  getChannelCount();
});

// 获取配置
const getIptvSetting = async () => {
  const defaultIptv = await setting.get('defaultIptv');
  if (defaultIptv) {
    const res = await iptv.get(defaultIptv);
    if (res) {
      iptvListSelect.value = res.id;
      iptvSetting.value.name = res.name;
      iptvSetting.value.epg = res.epg || (await setting.get('defaultIptvEpg'));
    }
  }
  iptvSetting.value.skipIpv6 = await setting.get('iptvSkipIpv6');
  iptvSetting.value.iptvStatus = await setting.get('iptvStatus');

  getIptvClass();

  iptvList.value = (await iptv.all()).filter((item: { isActive: any }) => item.isActive);
};

// 获取直播列表个数
const getChannelCount = () => {
  channelList.total().then((res) => {
    pagination.value.count = res;
  });
};

// 获取分类
const getIptvClass = async () => {
  let res = await channelList.class();
  if (iptvSetting.value.skipIpv6) res = res.filter((item) => !/ipv6/i.test(item.name));

  iptvClassList.value = _.unionWith(iptvClassList.value, res, _.isEqual);
};

// 获取直播列表
const getChannelList = async () => {
  const res = await channelList.pagination(
    searchTxt.value,
    iptvClassSelect.value,
    pagination.value.pageIndex,
    pagination.value.pageSize,
  );
  const sourceLength = res.list.length;
  if (iptvSetting.value.skipIpv6) res.list = res.list.filter((item: { url: string }) => !isIpv6(item.url));
  const restultLength = res.list.length;
  iptvDataList.value.list = _.unionWith(iptvDataList.value.list, res.list, _.isEqual);
  if (iptvSetting.value.iptvStatus) await checkChannelList(pagination.value.pageIndex, pagination.value.pageSize);

  // 判断是否开启检查；判断原数据；判断原和目的
  // 1. 开启检查：为0  1).返回原或0
  // 2. 开启检查：非0  1).相等直接返回  2).不相等[原非0:目的0再次请求；原小于pagesise:目的小于pagesise返回原]  3).
  // 3. 非开启检查     1).直接返回原
  let length;

  if (iptvSetting.value.skipIpv6) {
    if (sourceLength) {
      if (sourceLength === restultLength) length = sourceLength;
      if (restultLength === 0) {
        pagination.value.pageIndex++;
        await getChannelList();
      }
    } else length = sourceLength;
  }
  pagination.value.pageIndex++;
  return length;
};

const isIpv6 = (url: string) => {
  // 去除协议
  const urlWithoutProtocol = url.replace(/^(https?:)?\/\//i, '');
  // 去除路径
  const hostname = urlWithoutProtocol.split('/')[0];
  // 直接提取[]
  const reg = /^\[(.+)\](:\d+)?\/?/;
  const match = hostname.match(reg);
  if (!match) {
    return false;
  }
  const ipv6Address = match[1];

  // ipv6规则
  const ipv6Regex =
    /^(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|(?=(?:[0-9A-Fa-f]{0,4}:){2,6}(?:\d{1,3}\.){3}\d{1,3}$)(([0-9A-Fa-f]{0,4}:){1,5}|:)((:[0-9A-Fa-f]{0,4}){1,5}:|:)|::(?:[0-9A-Fa-f]{0,4}:){0,4}(?:(?<=::)|(?:(?<=:)0{0,4})))|::(?:[0-9A-Fa-f]{0,4}:){0,5}(?:(?<=::)|(?:(?<=:)0{0,4}[0-9A-Fa-f]{1,4}))|(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?=(?:[0-9A-Fa-f]{0,4}:){0,7}[0-9A-Fa-f]{0,4}$)([0-9A-Fa-f]{0,4}:){0,6}[0-9A-Fa-f]{0,4}))(?:%[0-9A-Za-z]{1,})?(?:\:\:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})?$/;
  return ipv6Regex.test(ipv6Address);
};

const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
  console.log('loading...');
  try {
    const resLength = await getChannelList();
    if (resLength === 0) {
      if (!iptvSetting.value.name) infiniteCompleteTip.value = '暂无数据，请前往设置-直播源设置默认源!';
      $state.complete();
    } else $state.loaded();
  } catch (err) {
    console.log(err);
    $state.error();
  }
};

// 搜索
const searchEvent = async () => {
  console.log('search');
  iptvDataList.value = {};
  if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getChannelList();
};

// 切换分类
const changeClassEvent = async (item: { name: string }) => {
  console.log('class');
  iptvClassSelect.value = item.name;

  iptvDataList.value = {};
  if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getChannelList();
};

// 播放
const playEvent = (item: { name: any }) => {
  const { epg } = iptvSetting.value;
  console.log(epg);
  storePlayer.updateConfig({
    type: 'iptv',
    data: { info: item, ext: { epg } },
  });
  ipcRenderer.send('openPlayWindow', item.name);
};

// 检查状态
const checkChannelListStatus = async (pageIndex: number, pageSize: number) => {
  const promises = [];
  for (let i = pageIndex * pageSize; i < (pageIndex + 1) * pageSize; i++) {
    if (!iptvDataList.value.list[i]) return;

    promises.push(zy.checkChannel(iptvDataList.value.list[i].url));

    const results = await Promise.all(promises.map((p) => p.catch((error: any) => error)));
    for (let i = 0; i < results.length; i++) {
      if (results[i] !== undefined) {
        iptvDataList.value.list[pageIndex * pageSize + i].status = true;
      } else {
        iptvDataList.value.list[pageIndex * pageSize + i].status = false;
      }
    }
  }
};
// 500毫秒检测一次，防止异步阻塞
const checkChannelList = _.debounce(checkChannelListStatus, 500);

// 修改源
const changeDefaultIptvEvent = async (event: any) => {
  console.log(event);
  const { url } = await iptv.get(event);
  await axios.get(url).then((res) => {
    const { data } = res;
    if (data) {
      if (data.trim().startsWith('#EXTM3U')) m3u(data);
      else txt(data);
      MessagePlugin.success('设置成功');
    }
  });
  await setting.update({ defaultIptv: event });
  getIptvSetting();
  getChannelCount();
  getIptvClass();
  iptvDataList.value = {};
  if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  // $state.loaded();
  pagination.value.pageIndex = 0;
  getChannelList();
};

const m3u = (text: string) => {
  const GROUP = /.*group-title="(.?|.+?)".*/i;
  const LOGO = /.*tvg-logo="(.?|.+?)".*/i;
  const NAME = /.*,(.+?)(?:$|\n|\s)/i;

  const docs = [];
  let doc: { name?: any; logo?: any; group?: any; url?: any };
  const splitList = text.split('\n');
  splitList.forEach((line: string) => {
    if (line.startsWith('#EXTINF:')) {
      doc = {}; // 切断指针的联系
      doc.name = line.match(NAME) ? line.match(NAME)[1] : '';
      doc.logo = line.match(LOGO) ? line.match(LOGO)[1] : '';
      doc.group = line.match(GROUP) ? line.match(GROUP)[1] : '';
    } else if (line.indexOf('://') > -1) {
      if (line.startsWith('#EXT-X-SUB-URL')) return; // #EXT-X-SUB-URL https://ghproxy.com/https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u
      if (line.startsWith('#EXTM3U')) return; // #EXTM3U url-tvg="http://epg.51zmt.top:8000/e.xml,https://epg.112114.xyz/pp.xml
      doc.url = line;
      docs.push(doc);
    }
  });
  channelList.clear().then((res) => {
    channelList.bulkAdd(docs).then((e) => {
      console.log(res, e);
    });
  });
};

const txt = (text: string) => {
  const docs = [];
  let group: any;
  const splitList = text.split('\n');
  splitList.forEach((line: string) => {
    const split = line.split(',');
    if (split.length < 2) return;
    if (line.indexOf('#genre#') > -1) [group] = split;
    if (split[1].indexOf('://') > -1) {
      const doc = {
        name: split[0],
        url: split[1],
        group,
      };
      docs.push(doc);
    }
  });
  channelList.clear().then((res) => {
    channelList.bulkAdd(docs).then((e) => {
      console.log(res, e);
    });
  });
};

// 监听设置默认源变更
const eventBus = useEventBus('iptv-reload');
eventBus.on(async () => {
  await Promise.all([getIptvSetting(), getChannelCount(), getIptvClass(), getChannelList()]);
  iptvDataList.value = {};
  if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
});

// 右键
const conButtonClick = (item: any, { x, y }: any) => {
  show.value = true;
  // Object.assign()用于同时设置两个属性，而不是逐个分配x和y属性。
  Object.assign(optionsComponent.value, { x, y });
  channelItem.value = item;
};

// 删除
const delChannelEvent = () => {
  const index = iptvDataList.value.list.indexOf(channelItem.value);
  if (index > -1) {
    iptvDataList.value.list.splice(index, 1);
    channelList.remove(channelItem.value.id);
  }
  show.value = false;
};

// 拷贝
const copyChannelEvent = () => {
  const { isSupported, copy } = useClipboard();
  if (isSupported) copy(channelItem.value.url);
  show.value = false;
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.iptv-container {
  overflow: hidden;
  position: relative;
  height: calc(100vh - var(--td-comp-size-l));

  .tool {
    height: 50px;
    margin-right: 10px;

    .left-operation-container {
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

            &--focused {
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
            outline: none;
            padding: 0 0 0 20px;
            vertical-align: middle;
            height: 34px;
            width: calc(100% - 80px);
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
  .main {
    height: calc(100% - 50px);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow-y: auto;
    width: 100%;
    &-flow-wrap {
      display: grid;
      padding: 10px 0;
      grid-template-columns: repeat(auto-fill, 190px);
      grid-column-gap: 25px;
      grid-row-gap: 10px;
      justify-content: center;
      width: inherit;
      .card-wrap {
        flex-direction: column;
        position: relative;
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
            color: var(--td-brand-color);
          }
        }
      }
    }
  }
}

:root[theme-mode='dark'] {
  .right-operation-container {
    .search-box {
      .search-input-item,
      .hot-search-button {
        color: hsla(0, 0%, 100%, 0.6) !important;
        &-icon {
          color: hsla(0, 0%, 100%, 0.6) !important;
        }
      }
    }
  }
}
</style>
