<template>
  <div class="container">
    <div class="header">
      <div class="header-tip">
        <span class="title">社区</span>
        <span class="desc">汇聚影视碎片，解决收藏难题。不定期更新!</span>
      </div>

      <div class="header-setting" @click="isSubscribeDialog = true">
        <setting-icon size="1.5em" />
      </div>
    </div>
    <div class="main">
      <div class="main-flow-wrap">
        <div v-for="item in dataList" :key="item.name" class="card-wrap">
          <div class="card">
            <div class="card-logo">
              <t-image
                class="card-logo-item"
                :src="item.logo"
                :style="{ width: '44px', height: '44px', background: 'none' }"
                :lazy="true"
              >
              </t-image>
            </div>
            <div class="card-main">
              <span class="card-main-title">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <dialog-subscribe-view v-model:visible="isSubscribeDialog" />
  </div>
</template>

<script setup lang="tsx">
import { SettingIcon } from 'tdesign-icons-vue-next';
import { ref } from 'vue';

import DialogSubscribeView from './DialogSubscribe.vue';

const dataList = ref([
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
  {
    name: '360影视',
    logo: 'https://p1.ssl.qhimg.com/t0188fe3a6202a9e1e6.png',
    url: '',
  },
]);

const isSubscribeDialog = ref(false);
</script>

<style lang="less" scoped>
.container {
  .header {
    height: 40px;
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
      }
      .desc {
        font-size: 14px;
        line-height: 20px;
        font-weight: 400;
        color: var(--td-text-color-primary);
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
          width: 168px;
          height: 80px;
          position: relative;
          border-radius: var(--td-radius-medium);
          background-color: var(--td-bg-input);
          padding: 18px 24px;
          cursor: pointer;
          display: flex;
          .card-logo {
            height: 44px;
            width: 44px;
            display: inline-block;
            .t-tag {
              position: absolute;
              top: 5px;
              left: 5px;
              font-size: 10px;
            }
          }
          .card-main {
            margin-left: 0.75rem;
            .card-main-title {
              font-weight: 600;
              color: var(--td-text-color-primary);
            }
          }
        }
        .card:hover {
          .card-footer-title {
            color: var(--td-brand-color);
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            line-height: 22px;
          }
        }
      }
    }
  }
}
</style>
