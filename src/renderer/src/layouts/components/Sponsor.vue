<template>
  <div class="sponsor">
    <t-dropdown trigger="click" placement="bottom" :min-column-width="148">
      <t-button theme="default" shape="square" variant="text">
        <gift-icon />
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item>
          <div class="sponsor_main">
            <div class="qrcode_title">{{ $t('pages.sponsor.title') }}</div>
            <div class="qrcode-container">
              <div class="qrcode-arrow"></div>
              <div class="qrcode_bg">
                <img src="@/assets/pay/qr.png" class="qrcode">
              </div>
              <div class="scan_tips">
                <img src="@/assets/pay/ali.webp">
                <img src="@/assets/pay/wechat.webp">
                <span class="pay_desc">{{ $t('pages.sponsor.desc') }}</span>
              </div>
            </div>
          </div>
        </t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
  </div>
</template>

<script setup lang="ts">
import { GiftIcon } from 'tdesign-icons-vue-next';
</script>

<style lang="less" scoped>
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
