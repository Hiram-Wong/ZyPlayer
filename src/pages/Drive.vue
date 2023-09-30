<template>
  <div class="drive-container">
    <div class="nav-sub-tab">
      <div class="nav-sub-tab-top">
        <ul class="nav-menu">
          <li class="nav-menu-item" :class="driveListSelect === item.id ? 'is-active' : ''" v-for="item in driveList" :key="item.id" :value="item.id" @click="changeDefaultIptvEvent(item)">
            <div class="name-wrapper">
              <span>{{ item.name }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="nav-sub-tab-bottom"></div>
    </div>
    <div class="content">
      <header class="header">
        <div class="page-title">
          <div class="title">
            <t-breadcrumb :max-item-width="'80%'">
              <t-breadcrumbItem @click="gotoBreadcrumbPath(item.path)" v-for="item in breadcrumb">{{ item.name }}</t-breadcrumbItem>
            </t-breadcrumb>
          </div>
        </div>
        <div class="actions">
          <!-- <div class="search" v-if="driveSetting.search">
            <t-input v-model="searchTxt" placeholder="搜索网盘资源" clearable @enter="searchEvent" @clear="searchEvent" class="search-bar">
              <template #prefix-icon>
                <search-icon size="16px" />
              </template>
            </t-input>
          </div> -->
        </div>
      </header>
      <div class="container">
        <div class="content-wrapper">
          <div class="container-flow-wrap">
            <div v-for="item in driveContent" :key="item.path" class="card-wrap">
              <div class="card" @click="getCloudFile(item)">
                <div class="cover">
                  <div class="folder-cover">
                    <t-image
                      class="card-main-item"
                      :src="item.thumb"
                      :style="{ width: '115px', height: '90px', background: 'none' }"
                      :lazy="true"
                      :loading="renderLoading"
                      :error="renderError"
                    >
                    </t-image>
                  </div>
                </div>
                <div class="info">
                  {{ item.name }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="driveList.length === 0 || driveContent.length === 0"
            style="
              min-height: 1px;
              text-align: center;
              margin-bottom: 2em;
            "
          >
          {{ infiniteCompleteTip }}
        </div>
        </div>
      </div>
    </div>
    <t-back-top
      container=".container"
      :visible-height="200"
      size="small"
      :offset="['1.4rem', '0.5rem']"
      :duration="2000"
      :firstload="false"
    ></t-back-top>
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';

import { useEventBus } from '@vueuse/core';
import { useIpcRenderer } from '@vueuse/electron';

import _ from 'lodash';
import { Tv1Icon, LoadingIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, reactive } from 'vue';

import { drive, setting } from '@/lib/dexie';
import { __jsEvalReturn } from '@/lib/utils/alist_open';
import { usePlayStore } from '@/store'

const ipcRenderer = useIpcRenderer();

const storePlayer = usePlayStore();
const spider = ref(null);
const renderError = () => {
  return (
    <div class="renderIcon">
      <Tv1Icon size="1.5em" stroke-width="2" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon">
      <LoadingIcon size="1.5em" stroke-width="2" />
    </div>
  );
};

const isVisible = reactive({
  infiniteLoading: false, // 筛选
});

const driveSetting = ref({
  name: '',
  server: '',
  startPage: '',
  search: false,
  headers: {},
  params: {}
});
const driveList = ref([]);
const driveListSelect = ref();
const driveContent = ref([]);
const breadcrumb = ref([]);

const searchTxt = ref('');

const infiniteCompleteTip = ref('没有更多内容了');

onMounted(() => {
  getSetting();
});

// 获取配置
const getSetting = async() => {
  try {
    const [defaultDrive, driveAll] = await Promise.all([
      setting.get('defaultDrive'),
      drive.all(),
    ]);

    if (driveAll) {
      driveListSelect.value = defaultDrive;
      try {
        const basic = await drive.get(defaultDrive);
        basic.startPage = basic.startPage ?  basic.startPage : '/';
        driveSetting.value = basic;
      } catch {
        infiniteCompleteTip.value = '查无此id,请前往设置-网盘源重新设置默认源!';
      }
    } else {
      infiniteCompleteTip.value = '暂无数据,请前往设置-网盘源设置默认源!';
    }

    driveList.value = driveAll.filter((item) => item.isActive);

    initCloud();
  } catch (err) {
    console.error(err);
  }
};

const initCloud = async() => {
  await spiderInit();
  const { startPage } = driveSetting.value;
  let path = startPage;
  let files = JSON.parse(await spider.value.dir(startPage));
  if (startPage === '/') {
    files = JSON.parse(await spider.value.dir(files.list[0].path));
    path = files.list[0].path;
  };
  driveContent.value = files.list;
  formatBreadcrumb(path);
};

// 格式化面包屑
const formatBreadcrumb = (str: string) => {
  const pathList = [];

  // 将字符串按每个斜杠分割，并保存分割出的所有部分
  const parts = str.split('/').filter(Boolean);

  // 从最后一个部分开始，将每个部分与它前面的部分组合成一个路径，并添加到结果列表中
  for (let i = parts.length - 1; i >= 0; i--) {
    const name = parts[i];
    let path = '/';
    for (let j = 0; j <= i; j++) {
      path += parts[j] + '/';
    }
    pathList.unshift({ name, path });
  }

  breadcrumb.value = pathList;
};

// 面包屑跳转
const gotoBreadcrumbPath = async(path) => {
  const res = JSON.parse(await spider.value.dir(path));
  driveContent.value = res.list;
  formatBreadcrumb(path);
};

const spiderInit = async() => {
  if (!spider.value) spider.value = __jsEvalReturn();
  await spider.value.init({
    skey: 'siteKey',
    ext: [
      { ...driveSetting.value }
    ],
  });
};

// 获取
const getCloudFile = async (item) => {
  try {
    const isFolder = item.type === 0;
    if (isFolder) {
      const res = JSON.parse(await spider.value.dir(item.path));
      driveContent.value = res.list;
      formatBreadcrumb(item.path);
    } else {
      const res = JSON.parse(await spider.value.file(item.path));
      const tid = item.path;
      const index = tid.indexOf('/', 1);
      const path = tid.substring(index);
      playEvent(res, path);
    };
  } catch(err){
    console.log(err)
    MessagePlugin.error(`请求出错`)
  }
};

// 搜索
const searchEvent = async () => {
  console.log(`[drive] search keyword: ${searchTxt.value}`);
  const res = JSON.parse(await spider.value.search(searchTxt.value));
  console.log(res)
};

// 播放
const playEvent = (item, fullPath) => {
  const playerType = storePlayer.getSetting.broadcasterType;
  const shareUrl = `${driveSetting.value.server}/d/${fullPath}${item.sign ? `?sign=${item.sign}`: ''}`
  if (playerType === 'iina') window.open(`iina://weblink?url=${shareUrl}`, '_self');
  else if (playerType === 'potplayer') window.open(`potplayer://${shareUrl}`, '_self')
  else {
    storePlayer.updateConfig({
      type: 'drive',
      data: {
        info: {
          name: item.name,
          url: item.url,
          vod_pic: item.thumb
        },
        ext: {
          files: driveContent.value,
          site: driveSetting.value
        }
      },
    });
    ipcRenderer.send('openPlayWindow', item.name);
  }
};

// 切换源
const changeDefaultIptvEvent = async (item) => {
  console.log(`[drive] change source: ${item.id}`);

  spider.value.destroy();
  driveContent.value = [];
  breadcrumb.value = [];
  infiniteCompleteTip.value = '没有更多内容了!';
  driveListSelect.value = item.id;
  driveSetting.value = item;
  driveSetting.value.startPage = driveSetting.value.startPage ?  driveSetting.value.startPage : '/';
  initCloud();
};

// 监听设置默认源变更
const eventBus = useEventBus('drive-reload');
eventBus.on(async () => {
  spider.value.destroy();
  infiniteCompleteTip.value = '没有更多内容了!';
  getSetting();
});
</script>

<style lang="less" scoped>
.drive-container {
  height: 100%;
  display: flex;
  position: relative;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
  flex: 1 1;

  .nav-sub-tab {
    width: 170px;
    border-right: 1px solid rgba(132,133,141,.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    z-index: 2;
    overflow: auto;
    .nav-sub-tab-top {
      .nav-menu {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        line-height: 1.5;
        .nav-menu-item {
          width: 140px;
          height: 40px;
          padding-left: 8px;
          line-height: 14px;
          display: flex;
          align-items: center;
          color: var(--td-text-color-primary);
          cursor: pointer;
          transition: background-color .3s ease;
          border-radius: 10px;
          position: relative;
        }
        .is-active {
          background-color: rgba(132, 133, 141, 0.16);
        }
      }
    }
    .nav-sub-tab-bottom {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding-bottom: 20px;
    }
  }

  .content {
    flex: 1 1;
    position: relative;
    overflow: hidden;
    .header {
      height: 40px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      justify-content: space-between;
      white-space: nowrap;
      flex-shrink: 0;
      .page-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-grow: 1;
        height: 100%;
        overflow: hidden;
        position: relative;
        .title {
          font-size: 18px;
          font-weight: 600;
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          .menu {
            .is-active {
              font-size: 18px !important;
              color: var(--td-text-color-primary) !important;
            }
            .menu-item {
              font-size: 14px;
              margin-right: 20px;
              float: left;
              display: block;
              opacity: 1\9\0;
              animation: blockshow .2s ease .2s forwards;
              cursor: pointer;
              a {
                display: block;
                color: var(--td-text-color-secondary);
                font-weight: 700;
                font-size: 14px;
              }
            }
            .morebtn {
              position: relative;
              display: block;
              margin-right: 0;
              color: var(--td-text-color-secondary);

              .dot {
                float: right;
                padding-left: 5px;
              }
            }
          }
        }
      }
      .actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }
    }
    .container {
      height: calc(100% - 45px);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow-y: auto;
      width: 100%;
      .content-wrapper {
        width: 100%;
        height: 100%;
        padding: 0 40px;
        display: flex;
        flex-direction: column;
        position: relative;
        flex-grow: 1;
        .container-flow-wrap {
          display: grid;
          padding: 10px 0;
          grid-template-columns: repeat(auto-fill, 115px);
          grid-column-gap: 10px;
          grid-row-gap: 10px;
          justify-content: center;
          width: inherit;
          .card-wrap {
            flex-direction: column;
            position: relative;
            .card {
              position: relative;
              width: 115px;
              border-radius: 10px;
              transition: background-color .3s ease;
              user-select: none;
              display: -ms-flexbox;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: stretch;
              padding: 8px 4px 10px;
              .cover {
                margin-bottom: 12px;
                position: relative;
                .folder-cover {
                  position: relative;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  flex-shrink: 0;
                  flex-grow: 0;
                }
              }
              .info {
                width: 100%;
                text-align: center;
                font-size: 14px;
                line-height: 1.5;
                max-width: 100%;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                overflow-wrap: break-word;
                margin-bottom: 2px;
                transition: color .3s ease;
              }
            }
            .card:hover {
              background-color:rgba(132, 133, 141, 0.16);
            }
          }
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
  color: rgba(255,255,255, 0.72);
}
</style>
