<template>
  <div class="lab-crypto view-component-container">
    <div class="header">
      <div class="left-op-container">
        <t-dropdown theme="default" trigger="click" destroy-on-close>
          <t-button theme="default" shape="square" variant="outline" class="nav-btn"><app-icon /></t-button>
          <t-dropdown-menu>
            <t-dropdown-item
              v-for="item in CRYPTO_OPTIONS"
              :key="item.value"
              :value="item.value"
              :active="active.nav === item.value"
              @click="handleOpChange(item.value)"
            >
              {{ item.label }}
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </div>
      <div class="right-op-container">
        <title-menu
          :list="ALGORITHM_OPTIONS[active.nav]"
          :active="active.class"
          class="nav"
          @change="changeClassEvent"
        />
      </div>
    </div>
    <div class="content">
      <div class="container">
        <keep-alive>
          <component :is="currentComponent" class="content-wrapper" :active="active.class"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { AppIcon } from 'tdesign-icons-vue-next';
import { computed, defineAsyncComponent, ref, shallowRef } from 'vue';

import TitleMenu from '@/components/title-menu/index.vue';
import { t } from '@/locales';

const CRYPTO_OPTIONS = computed(() => [
  { value: 'encrypt', label: t('pages.lab.crypto.encrypt.title') },
  { value: 'hash', label: t('pages.lab.crypto.hash.title') },
  { value: 'encode', label: t('pages.lab.crypto.encode.title') },
]);

const ENCRYPT_ALGORITHM_OPTIONS = computed(() => [
  { value: 'rsa', label: t('pages.lab.crypto.encrypt.field.algorithmMap.rsa') },
  { value: 'aes', label: t('pages.lab.crypto.encrypt.field.algorithmMap.aes') },
  { value: 'des', label: t('pages.lab.crypto.encrypt.field.algorithmMap.des') },
  { value: 'tripleDes', label: t('pages.lab.crypto.encrypt.field.algorithmMap.tripleDes') },
  { value: 'rc4', label: t('pages.lab.crypto.encrypt.field.algorithmMap.rc4') },
  { value: 'rc4Drop', label: t('pages.lab.crypto.encrypt.field.algorithmMap.rc4Drop') },
  { value: 'rabbit', label: t('pages.lab.crypto.encrypt.field.algorithmMap.rabbit') },
  { value: 'rabbitLegacy', label: t('pages.lab.crypto.encrypt.field.algorithmMap.rabbitLegacy') },
  { value: 'sm4', label: t('pages.lab.crypto.encrypt.field.algorithmMap.sm4') },
]);

const HASH_ALGORITHM_OPTIONS = computed(() => [
  { value: 'hash', label: t('pages.lab.crypto.hash.field.typeMap.hash') },
  { value: 'hmac', label: t('pages.lab.crypto.hash.field.typeMap.hmac') },
]);

const ENCODE_ALGORITHM_OPTIONS = computed(() => [
  { value: 'html', label: t('pages.lab.crypto.encode.field.algorithmMap.html') },
  { value: 'unicode', label: t('pages.lab.crypto.encode.field.algorithmMap.unicode') },
  { value: 'base64', label: t('pages.lab.crypto.encode.field.algorithmMap.base64') },
  { value: 'url', label: t('pages.lab.crypto.encode.field.algorithmMap.url') },
  { value: 'hex', label: t('pages.lab.crypto.encode.field.algorithmMap.hex') },
  { value: 'gzip', label: t('pages.lab.crypto.encode.field.algorithmMap.gzip') },
]);

const ALGORITHM_OPTIONS = computed(() => ({
  encrypt: [...ENCRYPT_ALGORITHM_OPTIONS.value.map((item) => ({ type_id: item.value, type_name: item.label }))],
  hash: [...HASH_ALGORITHM_OPTIONS.value.map((item) => ({ type_id: item.value, type_name: item.label }))],
  encode: [...ENCODE_ALGORITHM_OPTIONS.value.map((item) => ({ type_id: item.value, type_name: item.label }))],
}));

const componentMap = {
  encrypt: defineAsyncComponent(() => import('./components/encrypt.vue')),
  hash: defineAsyncComponent(() => import('./components/hash.vue')),
  encode: defineAsyncComponent(() => import('./components/encode.vue')),
};

const active = ref({
  nav: 'encrypt',
  class: 'rsa',
});

const currentComponent = shallowRef(componentMap[Object.keys(componentMap)[0]]);

const handleOpChange = (id: string) => {
  active.value.nav = id;
  active.value.class = ALGORITHM_OPTIONS.value[id][0].type_id;
  currentComponent.value = componentMap[id];
};

const changeClassEvent = (id: string) => {
  active.value.class = id;
};
</script>
<style lang="less" scoped>
.view-component-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap;
    gap: var(--td-size-4);
    padding: 0 var(--td-comp-paddingLR-s) 0 0;

    .left-op-container {
      flex-grow: 0;
      flex-shrink: 0;

      .nav-btn {
        border: 1px solid var(--td-border-level-2-color);
        color: var(--td-text-color-secondary);

        &:hover {
          color: var(--td-text-color-primary);
        }
      }
    }

    .right-op-container {
      flex: 1;
      width: 100%;
      overflow: hidden;

      .nav {
        width: 100%;
        flex-grow: 0;
        flex-shrink: 0;
      }
    }
  }

  .content {
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);
    overflow: hidden;

    .container {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
