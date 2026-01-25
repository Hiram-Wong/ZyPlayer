<template>
  <div class="quick-menu__sponsor">
    <t-popup placement="bottom" :attach="`.${attachContent}`" show-in-attached-element trigger="click">
      <t-button theme="default" shape="square" class="btn">
        <template #icon><gift-icon /></template>
      </t-button>
      <template #content>
        <div class="sponsor_main">
          <div class="sponsor-title">{{ $t('component.sponsor.buyCoffee') }}</div>
          <div class="sponsor-container">
            <div class="sponsor-arrow"></div>
            <div class="sponsor-qrcode">
              <t-image
                v-if="isChinaMainland"
                :src="IMG_QR_ALIWECHAT"
                lazy
                shape="round"
                :style="{ width: '126px', height: '126px' }"
              />
              <t-image v-else :src="IMG_QR_KOFI" lazy shape="round" :style="{ width: '126px', height: '126px' }" />
            </div>
            <div class="sponsor-support">
              <p class="sponsor-support-info">{{ $t('common.support') }}</p>
              <div class="sponsor-support-platform">
                <template v-if="isChinaMainland">
                  <t-image :src="IMG_PLATFORM_ALI" lazy shape="round" :style="{ width: '16px', height: '16px' }" />
                  <t-image :src="IMG_PLATFORM_WECHAT" lazy shape="round" :style="{ width: '16px', height: '16px' }" />
                </template>
                <t-image
                  v-else
                  :src="IMG_PLATFORM_KOFI"
                  lazy
                  shape="round"
                  :style="{ width: '16px', height: '16px' }"
                />
              </div>
              <p class="sponsor-support-info">{{ $t('component.sponsor.scanDonate') }}</p>
            </div>
          </div>
        </div>
      </template>
    </t-popup>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'QuickMenuSponsor',
});

import { GiftIcon } from 'tdesign-icons-vue-next';
import { computed } from 'vue';

import IMG_PLATFORM_ALI from '@/assets/pay/platform-ali.webp';
import IMG_PLATFORM_KOFI from '@/assets/pay/platform-kofi.webp';
import IMG_PLATFORM_WECHAT from '@/assets/pay/platform-wechat.webp';
import IMG_QR_ALIWECHAT from '@/assets/pay/qr-ali_wechat.webp';
import IMG_QR_KOFI from '@/assets/pay/qr-kofi.webp';
import { attachContent } from '@/config/global';
import { useSettingStore } from '@/store';

const storeSetting = useSettingStore();

const isChinaMainland = computed(() => storeSetting.isChinaMainland);
</script>
<style lang="less" scoped>
.sponsor_main {
  .sponsor-title {
    text-align: center;
    font-size: 16px;
    line-height: 16px;
    font-weight: 700;
    color: var(--td-warning-color-6);
  }

  .sponsor-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    .sponsor-arrow {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 6px solid var(--td-warning-color-6);
      margin: var(--td-comp-paddingLR-xs) 0 var(--td-comp-paddingLR-xxs);
    }

    .sponsor-qrcode {
      width: 132px;
      height: 132px;
      padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-xxs);
      border: 1px solid var(--td-warning-color-6);
      border-radius: var(--td-radius-s);
      overflow: hidden;
    }

    .sponsor-support {
      margin-top: 2px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: var(--td-size-2);

      &-platform {
        display: flex;
        align-items: center;
        gap: var(--td-size-1);
      }

      &-info {
        font: var(--td-font-link-small);
      }
    }
  }
}
</style>
