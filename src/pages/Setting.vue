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
            <a href="https://github.com/hjdhnx/dr_py" target="_blank">py版本</a>
            <a href="https://github.com/flash168/Peach" target="_blank">c#版本</a>
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
                <p class="pay_desc">支付宝/微信扫码直接赞助</p>
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
            width: 50px;
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
  padding: 10px 0;
  .qrcode_title {
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    color: #cc9a45;
    line-height: 20px;
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
      margin-top: 6px;
      padding: 6px;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVYAAAFWCAMAAAAFcUWxAAAAM1BMVEUAAADarWParWPZpk3Nm0bOnEnNm0bMmkbNm0fMnEfRm0nZq1/UpVbZq2DSo1HOnUnMmkUrMTs8AAAAEHRSTlMAzGcK3fLGuWFaHHDf0J7VctKVegAAA0JJREFUeNrs1EtKQwEQRNGXqIPED+5/tXoXICEQxYJzBk2P76COzx88Hdz2/EM9WWX9f+7O+n7itpd7s76eue3FCOSPR+DgQWSNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZM1vZb1er++v14MHuXy8XS6XvtP54GHOp+8jq6wTZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbvtqpk5SGAgAKgnFKAor++59WG3EZgpDNg6oj9KJljawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbZI2sG2SNrBtkjawbfrOez+e31/OJB7l+flyv19Nx5MSDHEdklXWBrJF1g6yRdYOskXWDrJF1g6yRdYOskXWDrJF1w1/WG15O3Hc5kuRO1vdn7vv6b9YncsfbkSQm8AAXWX/IuuFW1m+0r0yc66ZNywAAAABJRU5ErkJggg==) 50% no-repeat;
      background-size: 100% 100%;
      text-align: center;
      margin: 0 auto;
      .qrcode {
        width: 100%;
        height: 100%;
      }
    }
    .pay_desc {
      margin-top: 12px;
      font-size: 12px;
      line-height: 14px;
      vertical-align: middle;
    }
  }
}
</style>
