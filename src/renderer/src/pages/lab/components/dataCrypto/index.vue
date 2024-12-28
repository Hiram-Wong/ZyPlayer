<template>
  <div class="data-crypto view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.dataCrypto') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="encodeDecode">{{ t('pages.lab.dataCrypto.nav.encodeDecode') }}</t-radio-button>
          <t-radio-button value="hashCalculation">{{ t('pages.lab.dataCrypto.nav.hashCalculation') }}</t-radio-button>
          <t-radio-button value="codeConversion">{{ t('pages.lab.dataCrypto.nav.codeConversion') }}</t-radio-button>
        </t-radio-group>
      </div>
    </div>
    <div class="content">
      <keep-alive>
        <component :is="currentComponent" class="content-wrapper"></component>
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent, shallowRef } from 'vue';
import { t } from '@/locales';

const active = ref({
  nav: 'encodeDecode'
});

const componentMap = {
  'encodeDecode': defineAsyncComponent(() => import('./components/encodeDecode.vue')),
  'hashCalculation': defineAsyncComponent(() => import('./components/hashCalculation.vue')),
  'codeConversion': defineAsyncComponent(() => import('./components/codeConversion.vue')),
};

const currentComponent = shallowRef(componentMap['encodeDecode']);

const handleOpChange = (key: string) => {
  currentComponent.value = componentMap[key];
};
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 36px;

    .left-operation-container {
      display: flex;
      flex-direction: row;
      align-items: center;

      .title {
        margin-right: 5px
      }
    }

    .right-operation-container {
      :deep(.t-radio-group.t-size-m) {
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;
      }
    }
  }

  .content {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
}
</style>
