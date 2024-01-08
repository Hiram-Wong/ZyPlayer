<template>
  <div class="setting-container">
    <div class="nav-sub-tab">
      <div class="nav-sub-tab-top">
        <ul class="nav-menu">
          <li class="nav-menu-item" :class=" settingSet.select === item.key ? 'is-active' : ''" v-for="item in settingSet.list" :key="item.key" @click="changeClassEvent(item.key)">
            <div class="name-wrapper">
              <span>{{ item.value }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="nav-sub-tab-bottom">
        <div class="sign-bar">
          <div class="sign-content">
            <div class="sign-text">
              <h2>与drpy更配哦</h2>
              <p>js0模式</p>
            </div>
          </div>
          <div class="sign-btn">
            <a href="https://github.com/hjdhnx/dr_py" target="_blank">py</a>
            <a href="https://github.com/flash168/Peach" target="_blank">c</a>
            <a href="https://github.com/hjdhnx/fastapi_vue" target="_blank">hipy</a>
          </div>
        </div>
        <t-popup placement="right">
          <template #content>
            <div class="sponsor_main">
              <div class="qrcode_title">请作者喝杯咖啡吧</div>
              <div class="qrcode-container">
                <div class="qrcode-arrow"></div>
                <div class="qrcode_bg">
                  <img src="@/assets/pay/qr.png" class="qrcode">
                </div>
                <div class="scan_tips">
                  <img src="@/assets/pay/ali.webp">
                  <img src="@/assets/pay/wechat.webp">
                  <span class="pay_desc">请扫码完成赞助</span>
                </div>
              </div>
            </div>
          </template>
          <div class="membership-wrapper nav-sub-tab-member-info">
            <MoneyIcon />
            <span class="member-name">为爱发电</span>
          </div>
        </t-popup>
      </div>
    </div>
    <div class="content">
      <header class="header">
        <div class="page-title">
          <p class="title">设置</p>
        </div>
        <div class="actions">
        </div>
      </header>
      <div class="container">
      <div class="content-wrapper">
        <base-view class="container-item" v-if="settingSet.select === 'configBase'"/>
        <site-view class="container-item" v-else-if="settingSet.select === 'siteSource'"/>
        <iptv-view class="container-item" v-else-if="settingSet.select === 'iptvSource'"/>
        <analyze-view class="container-item" v-else-if="settingSet.select === 'analyzeSource'"/>
        <drive-view class="container-item" v-else-if="settingSet.select === 'driveSource'"/>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, watch } from 'vue';
import { useSettingStore } from '@/store';

import { MoneyIcon } from 'tdesign-icons-vue-next';

import analyzeView from './setting/analyze/AnalyzeSetting.vue';
import baseView from './setting/base/BaseSetting.vue';
import iptvView from './setting/iptv/IptvSetting.vue';
import siteView from './setting/site/SiteSetting.vue';
import driveView from './setting/drive/driveSetting.vue';

const storeSetting = useSettingStore();
const sysConfigSwitch = computed(() => {
  return storeSetting.getSysConfigSwitch;
});

const settingSet = reactive({
  select: 'configBase',
  list: [
    {
      key: 'configBase',
      value: '基础配置'
    },{
      key: 'siteSource',
      value: '影视配置'
    },{
      key: 'iptvSource',
      value: '电视配置'
    },{
      key: 'analyzeSource',
      value: '解析配置'
    },{
      key: 'driveSource',
      value: '网盘配置'
    }
  ]
})

if (storeSetting.getSysConfigSwitch) {
  settingSet.select = storeSetting.getSysConfigSwitch;
}

watch(() => settingSet.select, (newValue) => {
  storeSetting.updateConfig({ sysConfigSwitch: newValue });
})

watch(() => sysConfigSwitch.value, (newValue) => {
  settingSet.select = newValue;
})

const changeClassEvent = (item) => {
  settingSet.select = item
}
</script>

<style lang="less" scoped>
.setting-container {
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
      overflow: hidden;
      .sign-bar {
        background-image: url(../assets/drpy.png);
        width: 148px;
        height: 78px;
        border-radius: 10px;
        background-size: contain;
        position: relative;
        .sign-content {
          position: relative;
          display: flex;
          flex-direction: row;
          height: 32px;
          top: 9px;
          left: 42px;
          justify-content: space-between;
          align-items: center;
          .sign-text {
            display: flex;
            flex-direction: column;
            height: 32px;
            justify-content: space-between;
            h2 {
              font-size: 14px;
              font-weight: 600;
              line-height: 17px;
              color: #25262b;
            }
            p {
              font-size: 10px;
              line-height: 12px;
              color: rgba(37,38,43,.72);
              max-width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
        }
        .sign-btn {
          flex-direction: row;
          text-align: right;
          display: flex;
          align-items: center;
          backdrop-filter: blur(24px);
          color: #25262b;
          position: absolute;
          width: 136px;
          left: 5px;
          top: 48px;
          align-content: space-around;
          justify-content: space-around;
          a {
            width: 30px;
            height: 20px;
            font-size: 10px;
            border-radius: 11px;
            border: 2px solid rgba(132, 133, 141, 0.16);
            display: flex;
            justify-content: center;
            align-items: center;
            color: inherit;
            text-decoration: none;
          }
        }
      }
      .membership-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        width: 148px;
        border: 2px solid rgba(132, 133, 141, 0.16);
        transition: all .3s ease;
        font-size: 14px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 20px;
        .member-name {
          font-size: 12px;
          margin-left: 4px;
        }
      }
      .nav-sub-tab-member-info {
        margin-top: 16px;
      }
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
          line-height: 1.4;
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
      }
    }
  }
}

.sponsor_main {
  .qrcode_title {
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    color: #cc9a45;
    line-height: 16px;
  }
  .qrcode-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 4px;
    .qrcode-arrow {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 6px solid #d9ac63;
    }
    .qrcode_bg {
      width: 128px;
      height: 128px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 2px;
      border: 1px solid #f3a233;
      border-radius: 8px;
      text-align: center;
      margin: 0 auto;
      .qrcode {
        width: 100%;
        height: 100%;
        border-radius: 5px;
      }
    }
    .scan_tips {
      margin-top: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;
      img {
        background-size: 100%;
        display: inline-block;
        height: 16px;
        margin-right: 2px;
        width: 16px;
      }
      .pay_desc {
        font-size: 12px;
        font-weight: 700;
      }
    }
  }
}
</style>
