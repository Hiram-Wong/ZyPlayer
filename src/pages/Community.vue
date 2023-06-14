<template>
  <div class="vault-container">
    <div class="header">
      <div class="header-tip">
        <span class="title">社区</span>
        <span class="desc">汇聚时光碎片!</span>
      </div>

      <div class="header-setting" @click="isSubscribeDialog = true">
        <setting-icon size="1.5em" />
      </div>
    </div>
    <div class="main">
      <div class="feed-list">
        <div class="simplebar-offset" style="right: 0px; bottom: 0px">
          <div class="simplebar-content-wrapper">
            <div class="list-container">
              <div class="list-wrapper">
                <template v-for="item in data.share" :key="item.name">
                  <div class="feed-card">
                    <div class="header">
                      <div class="info">
                        <div class="user">
                          <div class="avatar">
                            <t-image class="img" :src="data.user.avatar" :lazy="true"> </t-image>
                          </div>
                          <div class="title">{{ data.user.name }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="content">
                      <div v-if="item.type === 'recommend'" class="video-feed-cover">
                        <div class="cover-container">
                          <div class="cover">
                            <t-image class="img" :src="item.img" :lazy="true"> </t-image>
                          </div>
                        </div>
                        <div class="meta">
                          <div class="info">{{ item.desc }}</div>
                          <div class="actions">
                            <div class="action" @click="filmSearch(item.key)">搜索</div>
                          </div>
                        </div>
                      </div>
                      <div v-if="item.type === 'source'" class="file-feed-cover">
                        <div class="file-feed-cover-item">
                          <div class="wrapper">
                            <div class="cover"><gift-icon size="20px" /></div>
                            <div class="content">
                              <p class="text">{{ item.desc }}</p>
                            </div>
                            <div class="meta">
                              <div class="actions">
                                <div class="action" @click="sourceAdd(item.key, item.url)">添加</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="footer">
                      <div class="meta">
                        <div class="info">{{ item.time }}</div>
                        <div class="data"></div>
                      </div>
                    </div>
                    <t-divider />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="data.user.name" class="feed-creator">
        <div class="profile">
          <div class="avatar">
            <t-image class="img" :src="data.user.avatar" :lazy="true"> </t-image>
          </div>
          <div class="name-wrapper">
            <div class="user_name">{{ data.user.name }}</div>
          </div>
          <p class="desc">{{ data.user.desc }}</p>
        </div>
      </div>
    </div>
    <dialog-subscribe-view v-model:visible="isSubscribeDialog" @receive-community-data="setCommunityEvent" />
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
// import { useIpcRenderer } from '@vueuse/electron';
import { GiftIcon, SettingIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

import { analyze, iptv, setting, sites } from '@/lib/dexie';
import zy from '@/lib/utils/tools';
import { usePlayStore } from '@/store';

// const ipcRenderer = useIpcRenderer();
const store = usePlayStore();

import DialogSubscribeView from './community/DialogSubscribe.vue';

const data = ref({ user: { avatar: '', name: '', desc: '' }, share: [] });
const site = ref();

const isSubscribeDialog = ref(false);

onMounted(() => {
  getSetting();
});

const getShareData = async (url) => {
  try {
    const res = await zy.getConfig(url);
    if (Object.prototype.hasOwnProperty.call(res, 'user') && Object.prototype.hasOwnProperty.call(res, 'share'))
      data.value = res;
  } catch (err) {
    console.log(err);
  }
};

const getSetting = async () => {
  const res = await setting.get('defaultSite');
  if (res) site.value = await sites.get(res);

  const url = await setting.get('communitySubscribe');
  if (url) getShareData(url);
};

const filmSearch = async (item) => {
  const { key } = site.value;
  try {
    MessagePlugin.info('请等待,正在搜索相关资源!');

    const res = await zy.searchFirstDetail(key, item);
    if (!res) {
      MessagePlugin.warning('暂无在本源搜索到相关资源!');
      return;
    }

    store.updateConfig({
      type: 'film',
      data: {
        info: res,
        ext: { site: site.value },
      },
    });

    // if (res) ipcRenderer.send('openPlayWindow', item);
  } catch (err) {
    console.error(err);
    MessagePlugin.error('网络出错啦,请稍后再试!');
  }
};

const sourceAdd = (key, { ...item }) => {
  console.log(key, item);

  const sourceMap = {
    site: () => sites.add(item),
    iptv: () => iptv.add(item),
    analyze: () => analyze.add(item),
  };

  const addFn = sourceMap[key];

  try {
    if (addFn) {
      addFn();
      MessagePlugin.success('添加成功');
    } else {
      MessagePlugin.warning(`参数 ${key} 不合法`);
    }
  } catch (err) {
    console.error(err);
    MessagePlugin.error(`添加失败:${err}`);
  }
};

const setCommunityEvent = async (item) => {
  const { data } = item;
  console.log(data);
  await setting.update({ communitySubscribe: data });

  getShareData(data);
};

// 监听设置默认源变更
const eventBus = useEventBus('community-reload');
eventBus.on(async () => {
  data.value = { user: { avatar: '', name: '', desc: '' }, share: [] };
  getSetting();
});
</script>

<style lang="less" scoped>
.vault-container {
  overflow: hidden;
  height: calc(100vh - var(--td-comp-size-l));
  position: relative;

  .header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-tip {
      height: 43px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      .title {
        font-size: 18px;
        line-height: 24px;
        font-weight: 600;
        margin-left: 0.5rem;
        color: var(--td-text-color-primary);
      }
      .desc {
        font-size: 14px;
        line-height: 20px;
        font-weight: 500;
        color: var(--td-text-color-secondary);
        margin-left: 1rem;
      }
    }
    .header-setting {
      margin-right: 5px;
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 5px;
      text-align: center;
      line-height: 25px;
      &:hover {
        background-color: var(--td-bg-color-component-hover);
      }
    }
  }
  .main {
    height: calc(100% - 50px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    flex-grow: 1;
    .feed-list {
      position: relative;
      flex-shrink: 0;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      .simplebar-offset {
        direction: inherit !important;
        box-sizing: inherit !important;
        resize: none !important;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        padding: 0;
        margin: 0;
        .simplebar-content-wrapper {
          direction: inherit;
          box-sizing: border-box;
          position: relative;
          display: block;
          height: 100%;
          width: auto;
          max-width: 100%;
          max-height: 100%;
          overflow: hidden scroll;
        }
      }

      .list-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        min-height: 100%;
        padding-left: 40px;
        padding-right: 40px;
        .list-wrapper {
          margin-right: 320px;
          min-height: 100%;
          width: 100%;
          max-width: 640px;
          min-width: 320px;
          .header {
            margin-bottom: 16px;
            .info {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              position: relative;
              .user {
                display: flex;
                flex-direction: row;
                align-items: center;
                overflow: hidden;
                .avatar {
                  box-shadow: 0 0 0 1px rgba(28, 28, 32, 0.08);
                  background-position: 50%;
                  background-repeat: no-repeat;
                  background-size: cover;
                  margin-right: 12px;
                  width: 32px;
                  height: 32px;
                  .img {
                    width: 100%;
                    height: 100%;
                    background-position: 50%;
                    background-repeat: no-repeat;
                    background-size: cover;
                    transition: opacity 0.3s ease;
                    opacity: 1;
                    border-radius: 50%;
                  }
                }
                .title {
                  max-width: 100%;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  font-weight: 600;
                  font-size: 12px;
                  line-height: 1.6;
                }
              }
            }
          }
          .content {
            position: relative;
            .video-feed-cover {
              width: 100%;
              padding: 20px;
              border-radius: 10px;
              position: relative;
              background-color: var(--td-bg-input);
              transition: background 2s ease;
              .cover-container {
                width: 100%;
                padding-bottom: calc(100% / 16 * 9);
                position: relative;
                .cover {
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  width: 100%;
                  height: 100%;
                  border-radius: 10px;
                  cursor: pointer;
                  .img {
                    width: 100%;
                    height: 100%;
                    background-position: 50%;
                    background-repeat: no-repeat;
                    background-size: cover;
                    opacity: 1;
                    border-radius: 10px;
                  }
                }
              }
              .meta {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                margin-top: 20px;
                .info {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  width: calc(100% - 100px);
                }
              }
            }
            .file-feed-cover {
              position: relative;
              .file-feed-cover-item {
                width: 100%;
                height: 52px;
                border-radius: 10px;
                padding: 12px 16px;
                position: relative;
                background-color: var(--td-bg-input);
                transition: background-color 0.3s ease;
                cursor: pointer;
                .wrapper {
                  position: relative;
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  .cover {
                    width: 28px;
                    height: 28px;
                    margin-right: 16px;
                    display: flex;
                    flex-shrink: 0;
                    align-items: center;
                  }
                  .content {
                    flex-grow: 1;
                    flex-shrink: 1;
                    flex-basis: 0;
                    width: calc(100% - 28px - 16px - 100px);
                    .text {
                      font-size: 14px;
                      line-height: 1.5;
                      max-width: 100%;
                      overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      color: var(--context_primary);
                    }
                  }
                  .meta {
                    flex-shrink: 0;
                    width: 100px;
                    display: flex;
                    justify-content: flex-end;
                  }
                }
              }
            }
            .actions {
              display: flex;
              flex-direction: row;
              align-items: center;
              flex-shrink: 0;
              .action {
                height: 28px;
                padding-left: 16px;
                padding-right: 16px;
                border-radius: 14px;
                background-color: #fff;
                white-space: nowrap;
                color: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 14px;
                line-height: 1.5;
                cursor: pointer;
                user-select: none;
              }
            }
          }
          .footer {
            margin-top: 16px;
            .meta {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              margin-top: 20px;
              .info {
                font-size: 12px;
                line-height: 1.6;
                color: var(--td-text-color-secondary);
              }
            }
          }
        }
      }
    }

    @media (max-width: 959px) {
      .feed-creator {
        right: 40px !important;
      }
    }

    .feed-creator {
      width: 240px;
      position: absolute;
      top: 0;
      right: calc((100% - 640px - 80px - 80px - 80px) / 2);

      .profile {
        width: 240px;
        padding: 24px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: var(--td-bg-input);
        .avatar {
          width: 100px;
          height: 100px;
          position: relative;
          transition: background-color 0.3s ease;
          flex-shrink: 0;
          overflow: hidden;
          .img {
            width: 100%;
            height: 100%;
            background-position: 50%;
            background-repeat: no-repeat;
            background-size: cover;
            transition: opacity 0.3s ease;
            opacity: 1;
            border-radius: 50%;
          }
        }
        .name-wrapper {
          margin-top: 24px;
          font-size: 16px;
          line-height: 1.4;
          font-weight: 600;
          color: var(--td-text-color-primary);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          .user_name {
            font-size: 16px;
            line-height: 1.4;
            font-weight: 600;
            max-width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        .desc {
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.6;
          color: var(--td-text-color-secondary);
          width: 100%;
          text-align: center;
          max-width: 100%;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
