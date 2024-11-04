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
        <div class="content-wrapper">
          <div class="container-flow-wrap">
            <div v-for="item in driveContent" :key="item.path" class="card-wrap">
              <div class="card" @click="getCloudFile(item)">
                <div class="cover">
                  <div class="folder-cover">
                    <t-image
                      class="card-main-item"
                      fit="contain"
                      shape="round"
                      :src="item.thumb"
                      :style="{ width: '115px', height: '90px', background: 'none' }"
                      :lazy="true"
                      :loading="renderLoading"
                      :error="renderError">
                    </t-image>
                  </div>
                </div>
                <div class="info">
                  {{ item.name }}
                </div>
              </div>
            </div>
          </div>

          <div>
            <infinite-loading
              v-if="isVisible.lazyload"
              class="infinite-loading-container"
            />
            <div v-else class="infinite-loading-container" style="min-height: 1px; text-align: center; margin-bottom: 2em;">
              {{ $t(`pages.iptv.infiniteLoading.${active.infiniteType}`) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <t-loading
      :attach="`.${prefix}-content`"
      size="medium"
      :text="$t('pages.setting.loading')"
      :loading="isVisible.loading"
    />

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

import { FolderIcon, LoadingIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onActivated, onMounted, reactive, ref } from 'vue';
import InfiniteLoading from 'v3-infinite-loading';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';

import { fetchDriveActive, putAlistInit, fetchAlistDir, fetchAlistFile } from '@/api/drive';
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
    let path = startPage;
    let files = await fetchAlistDir({ path: startPage, sourceId: id });
    driveContent.value = files.list;
    breadcrumb.value = formatBreadcrumb(path);
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

// 获取
const getCloudFile = async (item) => {
  if (isVisible.lazyload) {
    MessagePlugin.warning(t('pages.drive.message.skipOp'));
    return;
  }
  isVisible.lazyload = true;
  try {
    const { id } = driveConfig.value.default;
    const isFolder = item.type === 0;
    if (isFolder) {
      const res = await fetchAlistDir({ path: item.path, sourceId: id });
      driveContent.value = res.list;
      breadcrumb.value = formatBreadcrumb(item.path);
    } else {
      const res = await fetchAlistFile({ path: item.path, sourceId: id });
      const tid = item.path;
      const index = tid.indexOf('/', 1);
      const path = tid.substring(index);
      playEvent(res, path);
    };
  } catch (err) {
    console.log(err);
    MessagePlugin.error(t('pages.drive.message.reqError'));
  } finally {
    isVisible.lazyload = false;
  }
};

// 播放
const playEvent = (item, fullPath) => {
  isVisible.loading = true;

  try {
    const playerMode = storePlayer.getSetting.playerMode;
    const shareUrl = `${driveConfig.value.default.server}/d/${fullPath}${item.sign ? `?sign=${item.sign}` : ''}`
    if (playerMode.type === 'custom') {
      window.electron.ipcRenderer.send('call-player', playerMode.external, shareUrl);
    } else {
      storePlayer.updateConfig({
        type: 'drive',
        status: true,
        data: {
          info: {
            name: item.name,
            url: item.url,
            vod_pic: item.thumb
          },
          ext: {
            files: driveContent.value,
            site: driveConfig.value.default
          }
        },
      });
      window.electron.ipcRenderer.send('open-play-win', item.name);
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
    padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    flex: 1;

    .header {
      height: 40px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      margin-bottom: 10px;
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

                  :deep(.t-image__wrapper) {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .t-image {
                      max-width: 100%;
                      max-height: 100%;
                      width: fit-content;
                      height: fit-content;
                      border-radius: var(--td-radius-default);
                    }
                  }
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
              background-color: rgba(132, 133, 141, 0.16);
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
