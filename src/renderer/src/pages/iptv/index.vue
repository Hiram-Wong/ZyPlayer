<template>
  <div class="iptv view-container">
    <common-nav
      :title="$t('pages.iptv.name')"
      :list="iptvConfig.data"
      :active="active.nav"
      search
      @change-key="changeConf"
    />

    <div class="content">
      <header class="header" v-if="classList.length > 0">
        <div class="header-nav">
          <title-menu :list="classList" :active="active.class" @change-key="changeClassEvent" />
        </div>
      </header>
      <div class="container">
        <div class="content-wrapper" id="back-top">
          <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
            <t-col :md="3" :lg="3" :xl="2" :xxl="1" v-for="item in channelList" :key="item.id" class="card"
              @click="playEvent(item)" @contextmenu="conButtonClick(item, $event)">
              <div class="card-main">
                <div v-show="iptvConfig.ext.delay && item.delay" class="card-delay-tag">
                  <span v-if="item.delay < 500" class="status-item success">{{ item.delay }}ms</span>
                  <span v-else class="status-item error">
                    {{ item.delay ? `${item.delay}ms` : $t('pages.iptv.delay') }}
                  </span>
                </div>
                <div v-show="iptvConfig.ext.markIp && item.ipVersion" class="card-ip-tag">
                  <span v-if="item.ipVersion === -1" class="status-item error">{{ $t('pages.iptv.unknown') }}</span>
                  <span v-else class="status-item success">IPV{{ item.ipVersion }}</span>
                </div>
                <t-image class="card-main-item"
                  :src="iptvConfig.ext.thumbnail ? item.thumbnail : item.logo"
                  :style="{
                    width: '100%',
                    background: 'none',
                    overflow: 'hidden',
                    padding: iptvConfig.ext.thumbnail
                      ? 'none'
                      : '35px 30px'
                  }"
                  :lazy="true"
                  :loading="renderLoading"
                  :error="renderError"
                />
              </div>
              <div class="card-footer">
                <span class="card-footer-title text-hide">{{ item.name }}</span>
              </div>
            </t-col>

            <context-menu :show="isVisible.contentMenu" :options="optionsComponent"
              @close="isVisible.contentMenu = false">
              <context-menu-item :label="$t('pages.iptv.contextMenu.copyChannel')" @click="copyChannelEvent" />
              <context-menu-item :label="$t('pages.iptv.contextMenu.delChannel')" @click="delChannelEvent" />
            </context-menu>
          </t-row>

          <div class="infinite-loading">
            <infinite-loading
              v-if="isVisible.lazyload"
              class="infinite-loading-container"
              :identifier="infiniteId"
              :duration="200"
              @infinite="load"
            >
              <template #complete>{{ $t(`pages.iptv.infiniteLoading.${active.infiniteType}`) }}</template>
              <template #error>{{ $t('pages.iptv.infiniteLoading.error') }}</template>
            </infinite-loading>
            <infinite-loading
              v-else="isVisible.lazyload"
              class="infinite-loading-container"
            />
          </div>
        </div>
      </div>
    </div>

    <t-loading :attach="`.${prefix}-content`" size="medium" :loading="isVisible.loading" />
    <t-back-top container="#back-top" size="small" :offset="['1.4rem', '0.5rem']" :duration="2000" />
  </div>
</template>

<script setup lang="tsx">
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import { ContextMenu, ContextMenuItem } from '@imengyu/vue3-context-menu';
import PQueue from 'p-queue';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { computed, onActivated, onMounted, ref, reactive } from 'vue';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore, useSettingStore } from '@/store';

import { fetchIptvActive, fetchChannelPage, delChannel, putIptvDefault } from '@/api/iptv';
import { checkChannel, stopCheckChannel } from '@/utils/channel';
import emitter from '@/utils/emitter';
import { checkIpVersion, copyToClipboardApi } from '@/utils/tool';

import CommonNav from '@/components/common-nav/index.vue';
import TitleMenu from '@/components/title-menu/index.vue';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();

const renderError = () => {
  return (
    <div class="renderIcon" style="width: 100%;">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="width: 100%;">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};

const isVisible = reactive({
  contentMenu: false,
  lazyload: false,
  loading: false
});
const searchTxt = ref('');
const infiniteId = ref(+new Date());
const infiniteCompleteTip = ref('noMore');
const pagination = ref({
  pageIndex: 1,
  pageSize: 32,
  count: 0,
});

const iptvConfig = ref({
  default: {},
  data: [],
  ext: {
    epg: "https://epg.112114.eu.org/?ch={name}&date={date}",
    logo: "https://epg.112114.eu.org/logo/{name}.png",
    markIp: true,
    delay: false,
    thumbnail: false
  },
  ua: ""
})

const active = ref({
  nav: '',
  class: '全部',
  infiniteType: 'loading',
})

const channelList = ref<any[]>([]);
const classList = ref<any[]>([]);

const mode = computed(() => {
  return storeSetting.displayMode;
});

const optionsComponent = ref({
  zIndex: 15,
  width: 160,
  x: 500,
  y: 200,
  theme: mode.value === 'light' ? 'default' : 'mac dark',
});

const channelItem = ref<any>(null);

const delayQueue = new PQueue({ concurrency: 5 });
const ipversionQueue = new PQueue({ concurrency: 5 });
const thumbnailQueue = new PQueue({ concurrency: 5 });

onMounted(() => {
  getSetting();
});

onActivated(() => {
  const isListenedRefreshIptvConfig = emitter.all.get('refreshIptvConfig');
  if (!isListenedRefreshIptvConfig) emitter.on('refreshIptvConfig', refreshConf);
});

// 获取配置
const getSetting = async () => {
  try {
    const data = await fetchIptvActive();
    if (data.hasOwnProperty('default')) {
      iptvConfig.value.default = data["default"];
      active.value.nav = data["default"]["id"];
      active.value.infiniteType = 'noMore';
    } else {
      active.value.infiniteType = 'noData';
    }
    if (data.hasOwnProperty('ext')) {
      iptvConfig.value.ext = data["ext"];
    }
    if (data.hasOwnProperty('data')) {
      iptvConfig.value.data = data["data"];
    }
  } catch (err) {
    active.value.infiniteType = 'noData';
  } finally {
    isVisible.lazyload = true;
  }
};

// 获取直播列表
const getChannel = async () => {
  const { pageIndex, pageSize } = pagination.value;
  const { markIp, delay, thumbnail } = iptvConfig.value.ext;

  const res = await fetchChannelPage({ page: pageIndex, pageSize, kw:searchTxt.value, group: active.value.class });
  if (Array.isArray(res["class"]) && res["class"].length > 0) {
    classList.value = res["class"];
    classList.value.unshift({ type_id: '全部', type_name: '全部' });
  };
  if (res.hasOwnProperty('total')) pagination.value.count = res["total"];

  channelList.value = [...channelList.value, ...res.data];

  if (delay) checkChannelDelay(pageIndex, pageSize);
  if (thumbnail) generateThumbnail(pageIndex, pageSize);
  if (markIp) checkChannelIp(pageIndex, pageSize);

  pagination.value.pageIndex++;
  console.log(`[iptv] load data length: ${length}`);
  return res.data.length;
};

const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
  console.log('[iptv] loading...');
  try {
    if (active.value.infiniteType === 'noData') {
      $state.complete();
      return;
    };

    const resLength = await getChannel();

    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.log(err);
    $state.error();
  }
};

// 搜索
const searchEvent = async () => {
  console.log(`[iptv] search keyword: ${searchTxt.value}`);
  infiniteCompleteTip.value = 'noMore';
  channelList.value = [];
  pagination.value.pageIndex = 1;
  infiniteId.value++;
};

// 切换分类
const changeClassEvent = (id: string) => {
  clearQueue();
  infiniteCompleteTip.value = 'noMore';
  active.value.class = id;
  channelList.value = [];
  infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 播放
const playEvent = (item) => {
  isVisible.loading = true;

  try {
    const playerMode = storePlayer.getSetting.playerMode;
    if (playerMode.type === 'custom') {
      window.electron.ipcRenderer.send('call-player', playerMode.external, item.url);
    } else {
      const { epg, markIp, logo } = iptvConfig.value.ext;
      storePlayer.updateConfig({
        type: 'iptv',
        status: true,
        data: {
          info: item,
          ext: { epg, markIp, logo },
        },
      });
      window.electron.ipcRenderer.send('open-play-win', item.name);
    }
  } catch (err) {
    console.error(`[iptv][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  } finally {
    isVisible.loading = false;
  }
};

const updateChannelStatus = (results, start, key) => {
  results.forEach((result, i) => {
    const index = start + i;
    if (index < channelList.value.length) {
      channelList.value[index][key] = result;
    }
  });
};

// 检查ip
const checkChannelIp = async (pageIndex: number, pageSize: number) => {
  console.log(`[channel] checkChanneIp`);
  const start = (pageIndex - 1) * pageSize;
  const end = pageIndex * pageSize;
  const dataList = channelList.value.slice(start, end); // 从原数组中截取需要处理的数据段
  const updateStatus = async (item) => {
    try {
      const hostname = new URL(item.url)?.hostname;
      const res = await checkIpVersion(hostname);
      return res;
    } catch (err) {
      return -1;
    }
  };

  // 将任务加入队列
  const results = await Promise.all(dataList.map(item => ipversionQueue.add(() => updateStatus(item))));

  // 更新频道状态
  updateChannelStatus(results, start, 'ipVersion');
};

// 检查状态
const checkChannelDelay = async (pageIndex: number, pageSize: number) => {
  console.log(`[channel] checkChannelDelay`);
  const start = (pageIndex - 1) * pageSize;
  const end = pageIndex * pageSize;
  const dataList = channelList.value.slice(start, end); // 从原数组中截取需要处理的数据段

  const updateStatus = async (item) => {
    try {
      const result = await checkChannel(item.url);
      return result;
    } catch (err) {
      return 9999;
    }
  };

  // 将任务加入队列
  const results = await Promise.all(dataList.map(item => delayQueue.add(() => updateStatus(item))));

  // 更新频道状态
  updateChannelStatus(results, start, 'delay');
};

// 缩略图
const generateThumbnail = async (pageIndex: number, pageSize: number) => {
  console.log(`[channel] generateThumbnail`);
  const start = (pageIndex - 1) * pageSize;
  const end = pageIndex * pageSize;
  const dataList = channelList.value.slice(start, end); // 从原数组中截取需要处理的数据段

  const updateThumbnail = async (item) => {
    try {
      const res = await window.electron.ipcRenderer.invoke('ffmpeg-thumbnail', item.url, item.id);
      if (res) {
        const index = channelList.value.findIndex(channel => channel.id === res.key);
        if (index !== -1) {
          channelList.value[index]["thumbnail"] = res.url;
        }
      }
    } catch (err) {
      console.error('Failed to generate thumbnail:', err);
    }
  };

  // 将任务加入队列
  await Promise.all(dataList.map(item => thumbnailQueue.add(() => updateThumbnail(item))));
}

// 清空队列，并终止请求
const clearQueue = () => {
  console.log(`[queue] clear queuectasks`);
  if (delayQueue.size > 0) {
    delayQueue.pause(); // 暂停队列，阻止新的任务加入
    delayQueue.clear(); // 清空队列中的任务
    delayQueue.start(); // 继续接管任务加入
  }
  if (ipversionQueue.size > 0) {
    ipversionQueue.pause(); // 暂停队列，阻止新的任务加入
    ipversionQueue.clear(); // 清空队列中的任务
    ipversionQueue.start(); // 继续接管任务加入
  }
  if (thumbnailQueue.size > 0) {
    thumbnailQueue.pause(); // 暂停队列，阻止新的任务加入
    thumbnailQueue.clear(); // 清空队列中的任务
    thumbnailQueue.start(); // 继续接管任务加入
  }
};

emitter.on('searchIptv', (kw: any) => {
  console.log('[iptv][bus][receive]', kw);
  searchTxt.value = kw;
  clearQueue();
  searchEvent();
});

const defaultConf = () => {
  clearQueue();
  isVisible.lazyload = false;
  active.value.infiniteType = 'noData';
  searchTxt.value = '';
  classList.value = [];
  active.value.class = '全部';
  active.value.nav = '';
  channelList.value = [];
  emitter.emit('refreshSearchConfig');
  pagination.value.pageIndex = 1;
  infiniteId.value++;
};

const changeConf = async (id: string) => {
  console.log(`[iptv] change source: ${id}`);

  try {
    defaultConf();
    active.value.class = '全部';
    active.value.nav = id;
    await putIptvDefault(id);
    active.value.infiniteType = 'noMore';
  } catch (err) {
    active.value.infiniteType = 'noData';
  } finally {
    isVisible.lazyload = true;
  }
};

const refreshConf = async () => {
  console.log('[iptv][bus][refresh]');
  defaultConf();
  await getSetting();
};

// 右键
const conButtonClick = (item: any, { x, y }: any) => {
  isVisible.contentMenu = true;
  Object.assign(optionsComponent.value, { x, y });
  channelItem.value = item;
};

// 删除
const delChannelEvent = () => {
  const index = channelList.value.indexOf(channelItem.value);
  if (index > -1) {
    channelList.value.splice(index, 1);
    delChannel({ids: [channelItem.value.id]});
  }
  isVisible.contentMenu = false;
};

// 拷贝
const copyToClipboard = async (content, successMessage, errorMessage) => {
  const res = await copyToClipboardApi(content);
  if (res) {
    MessagePlugin.info(successMessage);
  } else {
    MessagePlugin.warning(errorMessage);
  }
};
const copyChannelEvent = async () => {
  const successMessage = t('pages.iptv.message.setSuccess');
  const errorMessage = t('pages.iptv.message.copyFail');
  await copyToClipboard(channelItem.value.url, successMessage, errorMessage);

  isVisible.contentMenu = false;
};
</script>

<style lang="less" scoped>
.iptv {
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
          border-radius: var(--td-radius-default);


          &:hover {
            .card-main {
              border-color: var(--td-brand-color);
            }

            .card-footer {
              .card-footer-title {
                color: var(--td-brand-color);
              }
            }
          }

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
            padding-top: 62%;
            box-shadow: var(--td-shadow-1);
            border: var(--td-size-1) solid #211f20;
            background-color: #373536;
            transition: all 0.2s linear;

            .card-delay-tag {
              z-index: 15;
              display: flex;
              align-content: center;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 15px;
              background-color: rgb(0 0 0 / 60%);
              border-radius: var(--td-radius-default);
              box-shadow: var(--td-shadow-1);
              position: absolute;
              top: 5px;
              right: 5px;

              .status-item {
                font-size: 10px;
              }

              .error {
                color: var(--td-error-color);
              }

              .success {
                color: var(--td-success-color);
              }
            }

            .card-ip-tag {
              z-index: 15;
              display: flex;
              align-content: center;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 15px;
              background-color: rgb(0 0 0 / 60%);
              border-radius: var(--td-radius-default);
              box-shadow: var(--td-shadow-1);
              position: absolute;
              bottom: 5px;
              left: 5px;

              .status-item {
                font-size: 10px;
              }

              .error {
                color: var(--td-error-color);
              }

              .success {
                color: var(--td-success-color);
              }
            }

            .card-main-item {
              position: absolute;
              top: 0;
              left: 0;
              display: block;
              width: 100%;
              height: 100%;
              border-radius: var(--td-radius-default);
            }
          }

          .card-footer {
            position: relative;
            padding: 0 var(--td-comp-paddingLR-xs);

            .card-footer-title {
              font-weight: 700;
              line-height: var(--td-line-height-title-medium);
              height: 22px;
              transition: all 0.2s linear;
            }
          }
        }
      }
    }
  }
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
</style>
