<template>
  <div class="iptv-container mx-auto">
    <div class="tool">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <div class="title">
            <t-select
              v-model="iptvListSelect"
              placeholder="暂无选择源"
              size="small"
              :show-arrow="false"
              style="max-width: 8em"
              @change="changeDefaultIptvEvent"
            >
              <t-option v-for="item in iptvList" :key="item.id" :label="item.name" :value="item.id" />
            </t-select>
            <!-- <span class="data-item source">{{ iptvSetting.name ? iptvSetting.name : '暂无选择源' }}</span> -->
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
          </t-space>
        </div>
      </t-row>
    </div>
    <div class="main">
      <div class="main-flow-wrap">
        <div v-for="item in iptvDataList.list" :key="item.id" class="card-wrap">
          <div class="card" @click="playEvent(item)">
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
      </div>
      <infinite-loading
        :identifier="infiniteId"
        style="text-align: center; margin-bottom: 2em"
        :distance="200"
        @infinite="load"
      >
        <template #complete>没有更多内容了</template>
        <template #error>哎呀，出了点差错</template>
      </infinite-loading>
    </div>
  </div>
</template>
<script setup lang="jsx">
import { ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { Icon, LoadingIcon, LinkUnlinkIcon } from 'tdesign-icons-vue-next';
import axios from 'axios';
import _ from 'lodash';
import InfiniteLoading from 'v3-infinite-loading';
import { useIpcRenderer } from '@vueuse/electron';
import { usePlayStore } from '@/store';
import 'v3-infinite-loading/lib/style.css';

import { channelList, setting, iptv } from '@/lib/dexie';
import zy from '@/lib/site/tools';

const ipcRenderer = useIpcRenderer();

const store = usePlayStore();

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
  skipIpv6: true,
  thumbnail: false,
});
const iptvList = ref({});
const iptvListSelect = ref();
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

onMounted(() => {
  getIptvSetting();
  getChannelCount();
  getIptvClass();
});

// 获取配置
const getIptvSetting = async () => {
  setting.get('defaultIptv').then(async (id) => {
    if (!id) MessagePlugin.warning({ content: '请设置iptv默认数据源', duration: 0, closeBtn: true });
    else
      await iptv.get(id).then(async (res) => {
        iptvListSelect.value = res.id;
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
  await iptv.all().then((res) => {
    iptvList.value = res.filter((item) => item.isActive);
  });
};

// 获取直播列表个数
const getChannelCount = () => {
  channelList.total().then((res) => {
    pagination.value.count = res;
  });
};

// 获取分类
const getIptvClass = () => {
  channelList.class().then((res) => {
    iptvClassList.value = _.unionWith(iptvClassList.value, res, _.isEqual);
  });
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
  console.log(res.list);
  if (iptvSetting.value.skipIpv6) res.list = res.list.filter((item) => !isIpv6(item.url));
  const restultLength = res.list.length;
  iptvDataList.value.list = _.unionWith(iptvDataList.value.list, res.list, _.isEqual);
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
    if (resLength === 0) $state.complete();
    else {
      $state.loaded();
    }
  } catch (error) {
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

// 分类
const classEvent = async () => {
  console.log('class');
  iptvDataList.value = {};
  if (!_.size(iptvDataList.value.list)) infiniteId.value++;
  pagination.value.pageIndex = 0;
  await getChannelList();
};

// 播放
const playEvent = (item) => {
  store.updateConfig({
    type: 'iptv',
    data: {
      info: item,
      ext: { epg: iptvSetting.value.epg },
    },
  });
  ipcRenderer.send('openPlayWindow', item.name);
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

// 修改源
const changeDefaultIptvEvent = async (event) => {
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

const m3u = (text) => {
  const GROUP = /.*group-title="(.?|.+?)".*/i;
  const LOGO = /.*tvg-logo="(.?|.+?)".*/i;
  const NAME = /.*,(.+?)$/i;

  const docs = [];
  let doc;
  const splitList = text.split('\n');
  splitList.forEach((line) => {
    if (line.startsWith('#EXTINF:')) {
      doc = {}; // 切断指针的联系
      doc.name = line.match(NAME) ? line.match(NAME)[1] : '';
      doc.logo = line.match(LOGO) ? line.match(LOGO)[1] : '';
      doc.group = line.match(GROUP) ? line.match(GROUP)[1] : '';
    } else if (line.indexOf('://') > -1) {
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

const txt = (text) => {
  const docs = [];
  let group;
  const splitList = text.split('\n');
  splitList.forEach((line) => {
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
</script>

<style lang="less" scoped>
@import '@/style/variables';
@import '@/style/index.less';

.iptv-container {
  overflow: hidden;
  position: relative;
  height: calc(100vh - var(--td-comp-size-l));
  .tool {
    height: 50px;
    margin-right: 10px;
    .left-operation-container {
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
      .title {
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
    height: calc(100% - var(--td-comp-size-l));
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow-y: auto;
    width: 100%;
    &-flow-wrap {
      display: grid;
      padding-bottom: 10px;
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
</style>
