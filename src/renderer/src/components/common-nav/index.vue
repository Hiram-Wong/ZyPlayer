<template>
  <div class="common-nav">
    <div class="nav-sub">
      <div class="nav-sub-tab nav-sub-tab-header">
        <div class="header" v-if="!isVisible.search">
          <p class="title">{{ title }}</p>
          <data-search-icon size="large" class="icon" v-if="search" @click="isVisible.search = true" />
        </div>
        <div class="search" v-if="isVisible.search" ref="headerOutsideRef">
          <t-input :placeholder="$t('pages.setting.placeholder.general')" clearable v-model="searchText"
            @change="searchEvent">
            <template #suffixIcon>
              <search-icon :style="{ cursor: 'pointer' }" />
            </template>
          </t-input>
        </div>
      </div>
      <div class="nav-sub-tab nav-sub-tab-content">
        <div class="nav-sub-tab-top">
          <ul class="nav-menu">
            <li class="nav-menu-item" :class="`${activeData}` === `${item.id}` ? 'is-active' : ''"
              v-for="item in listData" :key="item.id" :value="item.id" @click="handleItemClick(item.id)"
              @contextmenu="conButtonClick(item, $event)">
              <div class="name-wrapper">
                <span>{{ item.name }}</span>
              </div>
            </li>
          </ul>
        </div>
        <div class="nav-sub-tab-bottom">
          <slot name="customize"></slot>
        </div>
      </div>
    </div>
    <context-menu v-model:show="isVisible.contentMenu" :options="optionsComponent" v-if="contextMenuItems">
      <template v-for="(menuItem, index) in contextMenuItems" :key="index">
        <context-menu-item v-if="menuItem.type === 'item'" :label="menuItem.label" @click="menuItem.handler" />
        <context-menu-separator v-if="menuItem.type === 'separator'" />
        <context-menu-group v-if="menuItem.type === 'group'" :label="menuItem.label">
          <template v-for="(subItem, subIndex) in menuItem.children" :key="subIndex">
            <context-menu-item v-if="subItem.type === 'item'" :label="subItem.label" @click="subItem.handler" />
            <context-menu-separator v-if="subItem.type === 'separator'" />
          </template>
        </context-menu-group>
      </template>
    </context-menu>
  </div>
</template>

<script setup lang="ts">
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';

import { ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup } from '@imengyu/vue3-context-menu';
import { onClickOutside } from '@vueuse/core';
import { computed, reactive, ref, watch } from 'vue';
import { DataSearchIcon, SearchIcon } from 'tdesign-icons-vue-next';

import { useSettingStore } from '@/store';
const storeSetting = useSettingStore();

const props = withDefaults(defineProps<{
  title: string;
  search?: boolean;
  active: any;
  list: Array<{
    id: string | number;
    name: string;
  }>;
  contextMenuItems?: Array<{
    type: 'item' | 'separator' | 'group';
    label?: string;
    handler?: () => void;
    children?: Array<{
      type: 'item' | 'separator';
      label?: string;
      handler?: () => void;
    }>;
  }>;
}>(), {
  search: false
});

const activeData = ref(props.active);
const listData = ref(props.list);
const contextMenuItems = ref(props.contextMenuItems);
const headerOutsideRef = ref(null);
const searchText = ref('');
const isVisible = reactive({
  contentMenu: false,
  search: false
});
const mode = computed(() => {
  return storeSetting.displayMode;
});
const optionsComponent = ref({
  zIndex: 15,
  width: 160,
  x: 500,
  y: 200,
  theme: mode.value === 'light' ? 'default' : 'mac dark',
});

watch(
  () => props.active,
  (val) => {
    activeData.value = val;
  },
);

watch(
  () => props.list,
  (val) => {
    listData.value = val;
  },
);

watch(
  () => props.contextMenuItems,
  (val) => {
    contextMenuItems.value = val;
  },
);

const emit = defineEmits(['changeKey', 'contextMenu']);

onClickOutside(headerOutsideRef, () => {
  isVisible.search = false;
})

const conButtonClick = (item: any, { x, y }: any) => {
  isVisible.contentMenu = true;
  Object.assign(optionsComponent.value, { x, y });
  emit('contextMenu', { ...item });
};

const handleItemClick = (key: string | number) => {
  console.log(`[nav] clicked key: ${key}`);
  emit('changeKey', key);
};

const searchEvent = () => {
  listData.value = props.list.filter((item) => {
    return item.name.includes(searchText.value);
  });
};
</script>

<style lang="less" scoped>
.common-nav {
  width: 170px;

  .nav-sub {
    border-right: 1px solid rgba(132, 133, 141, .2);
    height: 100%;
    padding: var(--td-comp-paddingTB-xs) 0;

    .nav-sub-tab-header {
      margin: var(--td-comp-margin-m) 0 var(--td-comp-margin-s) var(--td-comp-margin-m);

      .header {
        display: flex;
        align-items: flex-end;
        height: 32px;
        transition: all 0.25s ease-in-out;

        .title {
          padding-left: var(--td-comp-paddingTB-s);
          font-weight: 700;
          font-size: 1.5em;
        }

        .icon {
          margin-left: var(--td-comp-margin-xxs);
          cursor: pointer;
        }
      }

      .search {
        transition: all 0.25s ease-in-out;

        :deep(.t-input) {
          background-color: var(--td-bg-content-input);
          border: none;
          outline: none;
          width: 148px;
        }

        :deep(.t-input--focused) {
          box-shadow: none;
          color: none;
        }
      }
    }

    .nav-sub-tab-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      height: calc(100% - 2 * var(--td-comp-margin-m) - 1.5em);

      .nav-sub-tab-top {
        overflow: auto;
        width: 100%;
        padding-left: var(--td-comp-paddingTB-s);

        .nav-menu {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          line-height: 1.5;

          .nav-menu-item {
            width: 148px;
            height: 40px;
            padding-left: var(--td-comp-paddingTB-s);
            line-height: 14px;
            display: flex;
            align-items: center;
            color: var(--td-text-color-primary);
            cursor: pointer;
            transition: background-color .3s ease;
            border-radius: var(--td-radius-medium);
            position: relative;

            &:not(:first-child) {
              margin-top: var(--td-comp-margin-xs);
            }

            &:hover {
              background-color: var(--td-bg-content-hover);
            }
          }

          .is-active {
            background-color: var(--td-bg-content-active);
          }
        }
      }

      .nav-sub-tab-bottom {
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        padding-top: var(--td-comp-paddingTB-xs);
      }
    }
  }
}
</style>
