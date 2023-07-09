<template>
  <div class="iptv-container">
    <div class="header">
      <div class="left-operation-container">
        <div class="header-title-wrap">
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
        </div>
        <div v-if="iptvClassList.length !== 1" class="head-center">
          <p class="head-center-class">{{ iptvClassSelect }}</p>
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
                <div v-for="item in iptvClassList" :key="item.id" class="content-item">
                  <span variant="text" @click="changeClassEvent(item)">
                    {{ item.name }}
                  </span>
                </div>
              </div>
            </template>
          </t-popup>
        </div>
      </div>
      <div class="right-operation-container">
        <div class="hd-search">
          <div class="sh-search">
            <div class="hd-search skin1">
              <div class="hd-search-inner">
                <input v-model.trim="searchTxt" placeholder="输入关键词" class="hd-input" @keyup.enter="searchEvent" />

                <div class="hd-submit" @click="searchEvent">
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <g transform="translate(1.5 1.461)" stroke="currentColor" fill="none" fill-rule="evenodd">
                      <path d="M7.5 15a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" stroke-width="2"></path>
                      <rect
                        transform="rotate(-45 13.975 14.014)"
                        x="13.475"
                        y="12.014"
                        width="1"
                        height="4"
                        rx=".5"
                      ></rect>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="main-flow-wrap">
        <div v-for="item in iptvDataList.list" :key="item.id" class="card-wrap">
          <div class="card" @click="playEvent(item)" @contextmenu="conButtonClick(item, $event)">
            <div v-show="iptvSetting.iptvStatus" class="card-header">
              <t-tag v-if="item.status === true" disabled size="small" variant="outline" theme="success">有效</t-tag>
              <t-tag v-else-if="item.status === false" disabled size="small" variant="outline" theme="danger">
                无效
              </t-tag>
              <t-tag v-else disabled size="small" variant="outline" theme="warning">检查中</t-tag>
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
<script setup lang="tsx">
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import 'v3-infinite-loading/lib/style.css';

import { ContextMenu, ContextMenuItem } from '@imengyu/vue3-context-menu';
import { useClipboard, useEventBus } from '@vueuse/core';
import { useIpcRenderer } from '@vueuse/electron';
import _ from 'lodash';
import PQueue from 'p-queue';
import { LinkUnlinkIcon, LoadingIcon, MoreIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { computed, onMounted, ref } from 'vue';

import { channelList, iptv, setting } from '@/lib/dexie';
import zy from '@/lib/utils/tools';
import { usePlayStore, useSettingStore } from '@/store';
import { ChannelItem } from '@/types/channelList';

const ipcRenderer = useIpcRenderer();

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const renderError = () => {
  return (
    <div class="renderIcon">
      <LinkUnlinkIcon size="1.5em" stroke-width=".8" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon">
      <LoadingIcon size="1.5em" stroke-width=".8" />
    </div>
  );
};

const iptvSetting = ref({
  name: '',
  epg: '' as string,
  skipIpv6: false,
  iptvStatus: false,
});
const iptvList = ref([]);
const iptvListSelect = ref();
const iptvDataList = ref({
  list: [],
  total: 0,
});
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
  theme: mode.value === 'light' ? 'default' : 'mac dark',
});
const channelItem = ref(null);

const queue = new PQueue({ concurrency: 5 }); // 设置并发限制为5

onMounted(() => {
  getIptvSetting();
  getChannelCount();
});

// 获取配置
const getIptvSetting = async () => {
  const [defaultIptv, defaultIptvEpg, iptvSkipIpv6, iptvStatus, iptvAll] = await Promise.all([
    setting.get('defaultIptv'),
    setting.get('defaultIptvEpg'),
    setting.get('iptvSkipIpv6'),
    setting.get('iptvStatus'),
    iptv.all(),
  ]);
  if (defaultIptv) {
    iptvListSelect.value = defaultIptv;
    try {
      const basic = await iptv.get(defaultIptv);
      if (basic) {
        iptvSetting.value.name = basic.name;
        iptvSetting.value.epg = basic.epg || defaultIptvEpg;
      }
    } catch {
      infiniteCompleteTip.value = '查无此id,请前往设置-直播源重新设置默认源!';
    }
  } else {
    infiniteCompleteTip.value = '暂无数据,请前往设置-直播源设置默认源!';
  }

  iptvSetting.value.skipIpv6 = iptvSkipIpv6;
  iptvSetting.value.iptvStatus = iptvStatus;

  getIptvClass();

  iptvList.value = iptvAll.filter((item) => item.isActive);
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
  const { pageIndex, pageSize } = pagination.value;
  const { skipIpv6, iptvStatus } = iptvSetting.value;
  const { list } = iptvDataList.value;

  const res = await channelList.pagination(pageIndex, pageSize, searchTxt.value, iptvClassSelect.value);
  const sourceLength = res.list.length;

  if (skipIpv6) res.list = await checkChannelListIpv6(res.list);
  const restultLength = res.list.length;
  iptvDataList.value.list = _.unionWith(list, res.list, _.isEqual);

  if (iptvStatus) await checkChannelListStatus(pageIndex, pageSize);

  // 判断是否开启检查；判断原数据；判断原和目的
  // 1. 开启检查：为0  1).返回原或0
  // 2. 开启检查：非0  1).相等直接返回  2).不相等[原非0:目的0再次请求；原小于pagesise:目的小于pagesise返回原]  3).
  // 3. 非开启检查     1).直接返回原
  const length = sourceLength;

  if (skipIpv6 && sourceLength && sourceLength !== restultLength) {
    if (res.list.length === 0) {
      pagination.value.pageIndex++;
      await getChannelList();
    }
  }

  pagination.value.pageIndex++;
  return length;
};

const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
  console.log('loading...');

  if (!iptvSetting.value.name) {
    const isNoData = infiniteCompleteTip.value.indexOf('暂无数据');
    if (isNoData > -1) {
      $state.complete();
      return;
    }
    infiniteId.value++;
    return;
  }

  try {
    const resLength = await getChannelList();
    console.log(`[list] 返回数据长度${resLength}`);
    if (resLength === 0) {
      infiniteCompleteTip.value = '没有更多内容了!';
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
  iptvDataList.value = { list: [], total: 0 };
  if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
};

// 切换分类
const changeClassEvent = async (item: { name: string }) => {
  console.log('class');
  clearQueue();
  infiniteCompleteTip.value = '没有更多内容了!';
  iptvClassSelect.value = item.name;

  iptvDataList.value = { list: [], total: 0 };
  if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
};

// 播放
const playEvent = (item: { name: any }) => {
  const { epg } = iptvSetting.value;
  console.log(epg);
  storePlayer.updateConfig({
    type: 'iptv',
    data: {
      info: item,
      ext: { epg, skipIpv6: iptvSetting.value.skipIpv6 },
    },
  });
  console.log({ epg, skipIpv6: iptvSetting.value.skipIpv6 });
  ipcRenderer.send('openPlayWindow', item.name);
};

// 检查ipv6
const checkChannelListIpv6 = async (data: ChannelItem[]): Promise<ChannelItem[]> => {
  const newdata = await Promise.allSettled(
    data.map(async (item) => {
      try {
        const checkStatus = await zy.checkUrlIpv6(item.url);
        if (checkStatus !== 'IPv6') return item;
        return false;
      } catch (err) {
        console.log(err);
        return false;
      }
    }),
  );

  const filteredData = newdata
    .filter((result) => result.status === 'fulfilled' && result.value !== false)
    .map((result) => {
      if (result.status === 'fulfilled') return result.value as ChannelItem;
      return null;
    })
    .filter((item): item is ChannelItem => item !== null);

  return filteredData;
};

// 检查状态
const checkChannelListStatus = async (pageIndex: number, pageSize: number) => {
  console.log(`[iptv] checkChannelListStatus`);
  const start = pageIndex * pageSize;
  const end = (pageIndex + 1) * pageSize;
  const dataList = iptvDataList.value.list.slice(start, end); // 从原数组中截取需要处理的数据段

  const updateStatus = async (item) => {
    try {
      const result = await zy.checkChannel(item.url);
      return result;
    } catch (error) {
      return false;
    }
  };

  for (let i = 0; i < dataList.length; i++) {
    const item = dataList[i];
    // eslint-disable-next-line no-await-in-loop
    const result = await queue.add(() => {
      return updateStatus(item);
    });

    console.log(`${i} ${result}`);

    const index = start + i;
    if (index < iptvDataList.value.list.length) {
      iptvDataList.value.list[index].status = result;
    }
  }
};

// 清空队列，并终止请求
const clearQueue = () => {
  if (queue.size > 0) {
    console.log(`[queue] clear queuectasks and cancel axios request`);
    queue.pause(); // 暂停队列，阻止新的任务加入
    zy.stopCheckChannel(); // 中止正在执行的任务
    queue.clear(); // 清空队列中的任务
    queue.start(); // 继续接管任务加入
  }
};

// 切换源
const changeDefaultIptvEvent = async (item: any) => {
  console.log(item);

  infiniteCompleteTip.value = '没有更多内容了!';
  iptvDataList.value = { list: [], total: 0 };
  iptvClassSelect.value = '全部';
  await channelList.clear();
  const { url } = await iptv.get(item);
  const data = await zy.getConfig(url);
  if (data) {
    if (data.trim().startsWith('#EXTM3U')) m3u(data);
    else txt(data);
    MessagePlugin.success('设置成功');
  }
  await setting.update({ defaultIptv: item });
  await Promise.all([getIptvSetting(), getChannelCount()]);

  infiniteId.value++;
  pagination.value.pageIndex = 0;
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
  infiniteCompleteTip.value = '没有更多内容了!';
  searchTxt.value = '';
  iptvClassList.value = [{ id: '全部', name: '全部' }];
  iptvClassSelect.value = '全部';
  iptvDataList.value = { list: [], total: 0 };
  await Promise.all([getIptvSetting(), getChannelCount()]);
  infiniteId.value++;
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
.iptv-container {
  overflow: hidden;
  position: relative;
  height: calc(100vh - var(--td-comp-size-l));
  display: flex;
  flex-direction: column;

  .header {
    margin-bottom: 10px;
  }

  .header {
    height: 45px;
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

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
      .hd-search {
        width: auto;
        background: rgba(0, 0, 0, 0.08);
        border-radius: 20px;
        width: 200px;
        .sh-search {
          width: 200px;
          display: block;
          transition: width 0.2s ease;
        }
        .skin1 {
          background-image: linear-gradient(130deg, rgba(216, 244, 222, 0.3) 0%, rgba(146, 218, 178, 0.2) 100%);
        }

        .hd-search-inner {
          width: 100%;
          display: flex;
          align-items: center;
          .hd-input::placeholder {
            color: var(--td-text-color-primary);
          }
          .hd-input {
            flex-grow: 1;
            border: none;
            box-sizing: border-box;
            width: 0;
            height: 100%;
            padding-left: 20px;
            background: none;
            outline: none;
            font-size: 14px;
            text-overflow: ellipsis;
            color: var(--td-text-color-primary);
          }

          .hd-submit {
            flex-shrink: 0;
            width: 54px;
            height: 45px;
            cursor: pointer;
            display: flex;
            align-items: center;
            padding-left: 16px;
            box-sizing: border-box;
            &:hover {
              color: var(--td-brand-color);
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
      .hd-input,
      .hot-search-button {
        color: hsla(0, 0%, 100%, 0.6) !important;
        &-icon {
          color: hsla(0, 0%, 100%, 0.6) !important;
        }
      }
    }
  }
}

:deep(.renderIcon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  stroke: #f2f2f2;
}
</style>
