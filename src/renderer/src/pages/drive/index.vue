<template>
  <div class="drive view-container">
    <common-nav
      :title="$t('pages.drive.name')"
      :list="driveConfig.data"
      :active="active.nav"
      search
      @change-key="changeConf"
    />

    <div class="content">
      <header class="header" v-if="breadcrumb.length > 0">
        <div class="page-title">
          <div class="title">
            <t-breadcrumb :max-item-width="'80%'">
              <t-breadcrumbItem @click="gotoBreadcrumbPath(item.path)" v-for="item in breadcrumb">
                {{ item.name }}
              </t-breadcrumbItem>
            </t-breadcrumb>
          </div>
        </div>
        <div class="actions">
        </div>
      </header>
      <div class="container">
        <div class="content-wrapper" id="back-top">
          <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
            <t-col :md="2" :lg="2" :xl="2" :xxl="1" v-for="item in driveContent" :key="item.id" class="card" @click="getFileOrFolder(item)">
              <div class="card-container">
                <div class="card-main">
                  <t-image
                    class="card-main-item"
                    fit="contain"
                    shape="round"
                    :src="item.thumb"
                    :style="{ width: '100px', height: '90px', background: 'none' }"
                    :lazy="true"
                    :loading="renderLoading"
                    :error="renderError"
                  />
                </div>
                <div class="card-footer">
                  <span class="card-footer-title">{{ item.name }}</span>
                </div>
              </div>
            </t-col>
          </t-row>

          <div>
            <infinite-loading
              v-if="isVisible.lazyload"
              class="infinite-loading-container"
            />
            <div v-else class="infinite-loading-container" style="min-height: 1px; text-align: center; margin-bottom: 2em;">
              {{ $t(`pages.drive.infiniteLoading.${active.infiniteType}`) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <t-loading :attach="`.${prefix}-content`" size="medium" :loading="isVisible.loading" />
    <t-back-top
      container=".container"
      :visible-height="200"
      size="small"
      :offset="['1.4rem', '0.5rem']"
      :duration="2000"
      :firstload="false"
    />
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';

import moment from 'moment';
import { FolderIcon, LoadingIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onActivated, onMounted, reactive, ref } from 'vue';
import InfiniteLoading from 'v3-infinite-loading';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { base64 } from '@/utils/crypto';

import { fetchDriveActive, putAlistInit, fetchAlistDir, fetchAlistFile } from '@/api/drive';
import { fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import emitter from '@/utils/emitter';

import CommonNav from '@/components/common-nav/index.vue';

const storePlayer = usePlayStore();

const renderError = () => {
  return (
    <div class="renderIcon">
      <FolderIcon size="1.5em" stroke-width="2" />
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

const driveConfig = ref<{ [key: string]: any }>({
  data: [],
  default: {
    id: '',
    name: '',
    server: '',
    startPage: '',
    search: false,
    headers: {},
    params: {}
  }
});
const active = ref({
  nav: '',
  infiniteType: 'noMore'
})
const isVisible = reactive({
  loading: false,
  lazyload: false
});
const driveContent = ref<any[]>([]);
const breadcrumb = ref<any[]>([]);

onMounted(async () => {
  await getSetting();
  if (active.value.nav) await initCloud();
});

onActivated(() => {
  const isListenedRefreshDriveConfig = emitter.all.get('refreshDriveConfig');
  if (!isListenedRefreshDriveConfig) emitter.on('refreshDriveConfig', refreshConf);
});

// 获取配置
const getSetting = async () => {
  try {
    const data = await fetchDriveActive();
    if (data.hasOwnProperty('default') && Object.keys(data["default"]).length > 0) {
      driveConfig.value.default = data["default"];
      active.value.nav = data["default"]["id"];
      driveConfig.value.default.startPage = driveConfig.value.default.startPage ? driveConfig.value.default.startPage : '/';
    } else {
      active.value.infiniteType = 'noData';
    }
    if (Array.isArray(data['data']) && data['data'].length > 0) {
      driveConfig.value.data = data["data"];
    } else {
      active.value.infiniteType = 'noData';
    }
  } catch (err) {
    console.error(err);
  }
};

const initCloud = async () => {
  isVisible.lazyload = true;
  try {
    const { startPage, id } = driveConfig.value.default;
    await putAlistInit({ sourceId: id });
    await getCloudFolder({ path: startPage});
  } finally {
    isVisible.lazyload = false;
  }
};

// 格式化面包屑
const formatBreadcrumb = (path: string) => {
  // 确保路径以 '/' 开头
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // 移除路径末尾的 '/'
  if (path !== '/' && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 分割路径为片段数组
  const segments = path.split('/').filter(Boolean);

  // 如果没有片段，则返回包含根路径的数组
  if (segments.length === 0) {
    return [{ name: '全部文件', path: '/' }];
  }

  // 递归构建路径数组
  const pathsArray: any[] = [];
  let currentPath = '';
  // 添加根路径到数组的最后
  pathsArray.push({ name: '全部文件', path: '/' });
  for (const segment of segments) {
    currentPath = `${currentPath}/${segment}`;
    pathsArray.push({ name: segment, path: currentPath });
  }

  // 返回构建的路径数组
  return pathsArray;
}

// 面包屑跳转
const gotoBreadcrumbPath = async (path:string) => {
  isVisible.lazyload = true;

  try {
    const { id } = driveConfig.value.default;
    const res = await fetchAlistDir({ path, sourceId: id });
    driveContent.value = res.list;
    breadcrumb.value = formatBreadcrumb(path);
  } finally{
    isVisible.lazyload = false;
  }
};

//
const getFileOrFolder = (item) => {
  const isFolder = item.type === 0;
  if (isFolder) {
    getCloudFolder(item)
  } else {
    playEvent(item);
  }
};

const getCloudFile = async (item) => {
  isVisible.lazyload = true;

  try {
    const { id } = driveConfig.value.default;
    const res = await fetchAlistFile({ path: item.path, sourceId: id });
    const tid = item.path;
    const index = tid.indexOf('/', 1);
    const path = tid.substring(index);
  } catch (err) {
    console.log(err);
    MessagePlugin.error(t('pages.drive.message.reqError'));
  } finally {
    isVisible.lazyload = false;
  }
};

const getCloudFolder = async (item) => {
  isVisible.lazyload = true;

  try {
    const { id } = driveConfig.value.default;
    const res = await fetchAlistDir({ path: item.path, sourceId: id });
    driveContent.value = res.list;
    breadcrumb.value = formatBreadcrumb(item.path);
  } catch (err) {
    console.log(err);
    MessagePlugin.error(t('pages.drive.message.reqError'));
  } finally {
    isVisible.lazyload = false;
  }
};

// 播放
const playEvent = async (item) => {
  isVisible.loading = true;

  try {
    const site: any = driveConfig.value.default;
    const res = await fetchAlistFile({ path: item.path, sourceId: site.id });
    const playerMode = storePlayer.getSetting.playerMode;
    if (playerMode.type === 'custom') {
      window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: res.url });

      // 记录播放记录
      const historyRes = await fetchHistoryData(site.key, base64.encode(item.path), ['drive']);
      const doc = {
        date: moment().unix(),
        type: 'drive',
        relateId: site.key,
        siteSource: breadcrumb.value?.at(-1)?.path,
        playEnd: false,
        videoId: base64.encode(item.path),
        videoImage: item.thumb,
        videoName: res.name,
        videoIndex: `${res.name}$${res.url}`,
        watchTime: 0,
        duration: 0,
        skipTimeInStart: 0,
        skipTimeInEnd: 0,
      };

      if (historyRes.code === 0 && historyRes.status) {
        putHistoryData('put', doc, historyRes.data.id);
      } else {
        putHistoryData('add', doc, null);
      }
    } else {
      storePlayer.updateConfig({
        type: 'drive',
        status: true,
        data: {
          info: {
            id: base64.encode(item.path),
            name: res.name,
            url: res.url,
            thumb: item.thumb,
            remark: res.remark,
            path: breadcrumb.value?.at(-1)?.path,
          },
          ext: { files: driveContent.value, site: driveConfig.value.default }
        },
      });
      window.electron.ipcRenderer.send('open-win', { action: 'play' });
    }
  } catch (err) {
    console.error(`[film][playEvent][error]`, err);
  } finally {
    isVisible.loading = false;
  }
};

const defaultConf = ()=>{
  driveContent.value = [];
  breadcrumb.value = [];
  active.value.nav = '';
  active.value.infiniteType = 'noMore';
};

const changeConf = async (id: string) => {
  console.log(`[drive] change source: ${id}`);

  const item: any = driveConfig.value.data.find(item => item.id === id);
  item.startPage = item?.startPage ? item.startPage : '/';

  defaultConf();
  active.value.nav = id;
  driveConfig.value.default = item;
  await initCloud();
};

const refreshConf = async () => {
  console.log('[drive][bus][refresh]');

  defaultConf();

  driveConfig.value = {
    data: [],
    default: {
      id: '',
      name: '',
      server: '',
      startPage: '',
      search: false,
      headers: {},
      params: {}
    }
  };
  await getSetting();
  if (active.value.nav) await initCloud();
};
</script>

<style lang="less" scoped>
.drive {
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
      height: 32px;
      display: flex;
      align-items: center;
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
        }
      }

      .actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
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

          &:hover {
            .card-container {
              background-color: var(--td-bg-color-container-hover);
            }
          }

          .card-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--td-comp-paddingLR-xs) var(--td-comp-paddingTB-s);
            border-radius: var(--td-radius-default);
          }

          .card-main {
            .card-main-item {
              width: 100px;
              height: 90px;
              border-radius: var(--td-radius-default);
              overflow: hidden;
            }
          }

          .card-footer {
            width: 100%;

            .card-footer-title {
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
              -webkit-transition: color .3s ease;
              transition: color .3s ease;
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
  color: rgba(255, 255, 255, 0.72);
}
</style>
