<template>
  <div :class="['common-nav', isVisible.show ? 'show' : 'hidden']">
    <div class="nav-sub" :style="{ display: isVisible.show ? 'block' : 'none' }">
      <div class="nav-sub-tab nav-sub-tab-header">
        <div class="header" v-if="!isVisible.search">
          <p class="title">{{ title }}</p>
          <t-popup :content="$t('pages.search.searchSource')">
            <data-search-icon size="large" class="icon" v-if="search" @click="isVisible.search = true" />
          </t-popup>
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
        <div class="nav-sub-tab-top" ref="contentRef">
          <ul class="nav-menu">
            <li class="nav-menu-item" :class="`${activeData}` === `${item.id}` ? 'is-active' : ''"
              v-for="item in listData" :key="item.id" :value="item.id" @click="handleItemClick(item.id)"
              @contextmenu="conButtonClick(item, $event)">
              <t-tooltip :content="item.name">
                <div class="name-wrapper">
                  <span>{{ item.name }}</span>
                </div>
              </t-tooltip>
            </li>
          </ul>
        </div>
        <div class="nav-sub-tab-bottom">
          <slot name="customize"></slot>
        </div>
      </div>
    </div>

    <div class="nav-sub-tab-line" @click="isVisible.show = !isVisible.show">
      <div class="nav-sub-tab-line-0"></div>
      <div class="nav-sub-tab-line-1"></div>
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
import Scrollbar from 'smooth-scrollbar';
import { DataSearchIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { onMounted, computed, reactive, ref, watch } from 'vue';

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
const contentRef = ref(null);
const headerOutsideRef = ref(null);
const searchText = ref('');
const isVisible = reactive({
  contentMenu: false,
  search: false,
  show: true
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

onMounted(() => {
  Scrollbar.init(contentRef.value!);
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

if (props.search) {
  onClickOutside(headerOutsideRef, () => {
    isVisible.search = false;
  })
}

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
    return item.name.toLowerCase().includes(searchText.value.toLowerCase());
  });
};
</script>

<style lang="less" scoped>
.common-nav {
  height: 100%;
  width: fit-content;
  position: relative;
  padding-right: var(--td-comp-margin-s);

  .nav-sub {
    height: 100%;
    min-width: 162px;
    // width: fit-content;
    padding: var(--td-comp-paddingTB-xs) 0;
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    transition: all .3s ease;

    .nav-sub-tab-header {
      margin: var(--td-comp-margin-m) 0 var(--td-comp-margin-s) var(--td-comp-margin-s);

      .header {
        display: flex;
        align-items: center;
        height: 32px;
        transition: all 0.25s ease-in-out;

        .title {
          padding-left: var(--td-comp-paddingTB-s);
          font-weight: 700;
          font-size: 1.5em;
        }

        .icon {
          margin-left: auto;
          margin-right: var(--td-comp-margin-s);
          cursor: pointer;
        }
      }

      .search {
        transition: all 0.25s ease-in-out;

        :deep(.t-input) {
          background-color: var(--td-bg-content-input-2);
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
      height: calc(100% - var(--td-comp-margin-s) - var(--td-comp-margin-m) - 32px);

      .nav-sub-tab-top {
        // overflow-y: auto;
        // overflow-x: hidden;
        width: 100%;
        // padding-left: var(--td-comp-paddingTB-s);

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
            transition: background-color .3s ease;
            border-radius: var(--td-radius-medium);


            &:not(:first-child) {
              margin-top: var(--td-comp-margin-xs);
            }

            &:hover {
              background-color: var(--td-bg-content-hover-2);
            }

            .name-wrapper {
              height: 100%;
              width: 100%;
              padding: 0 var(--td-comp-paddingTB-s);
              line-height: 14px;
              display: flex;
              align-items: center;
              color: var(--td-text-color-primary);
              cursor: pointer;

              span {
                overflow: hidden;
                display: inline-block;
                white-space: nowrap;
                // text-overflow: ellipsis;
              }
            }
          }

          .is-active {
            background-color: var(--td-bg-content-active-2);
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

.show {
  .nav-sub-tab-line {
    width: 12px;
    height: 26px;
    position: absolute;
    right: -2px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    transition: all .2s ease;

    .nav-sub-tab-line-0 {
      width: 4px;
      height: 13px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      background-color: var(--td-bg-color-component-hover);
      left: 4px;
      top: 0;
      position: absolute;
      transition: all .2s ease;
      transform-origin: 50% 0;
    }

    .nav-sub-tab-line-1 {
      width: 4px;
      height: 13px;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      background-color: var(--td-bg-color-component-hover);
      left: 4px;
      bottom: 0;
      position: absolute;
      transition: all .2s ease;
      transform-origin: 50% 100%;
    }

    &:hover {
      .nav-sub-tab-line-0 {
        background-color: var(--td-bg-color-component-active);
        transform-origin: 50% 0%;
        transform: rotate(5deg) translateY(1px);
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-left-radius: 10px;
        height: 16px;
      }

      .nav-sub-tab-line-1 {
        background-color: var(--td-bg-color-component-active);
        transform-origin: 50% 100%;
        transform: rotate(-5deg) translateY(-1px);
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        border-top-left-radius: 10px;
        height: 16px;
      }
    }
  }
}

.hidden {
  .nav-sub-tab-line {
    width: 12px;
    height: 26px;
    position: absolute;
    right: -2px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    transition: all .2s ease;

    .nav-sub-tab-line-0 {
      width: 4px;
      height: 13px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      background-color: var(--td-bg-color-component-hover);
      left: 4px;
      top: 0;
      position: absolute;
      transition: all .2s ease;
      transform-origin: 50% 0;
    }

    .nav-sub-tab-line-1 {
      width: 4px;
      height: 13px;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      background-color: var(--td-bg-color-component-hover);
      left: 4px;
      bottom: 0;
      position: absolute;
      transition: all .2s ease;
      transform-origin: 50% 100%;
    }

    &:hover {
      .nav-sub-tab-line-0 {
        background-color: var(--td-bg-color-component-active);
        transform-origin: 50% 0%;
        transform: rotate(-5deg) translateY(1px);
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 10px;
        height: 16px;
      }

      .nav-sub-tab-line-1 {
        background-color: var(--td-bg-color-component-active);
        transform-origin: 50% 100%;
        transform: rotate(5deg) translateY(-1px);
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        border-top-right-radius: 10px;
        height: 16px;
      }
    }
  }
}
</style>
