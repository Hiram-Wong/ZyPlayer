<template>
  <div class="common-nav">
    <div class="nav-sub">
      <div class="nav-sub-tab nav-sub-tab-title">
        <p class="title">{{ title }}</p>
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
import { computed, reactive, ref, watch } from 'vue';

import { useSettingStore } from '@/store';
const storeSetting = useSettingStore();

const props = defineProps<{
  title: string;
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
}>();

const activeData = ref(props.active);
const listData = ref(props.list);
const contextMenuItems = ref(props.contextMenuItems);
const isVisible = reactive({
  contentMenu: false
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

const conButtonClick = (item: any, { x, y }: any) => {
  isVisible.contentMenu = true;
  Object.assign(optionsComponent.value, { x, y });
  emit('contextMenu', { ...item });
};

const handleItemClick = (key: string | number) => {
  console.log(`[nav] clicked key: ${key}`);
  emit('changeKey', key);
};
</script>

<style lang="less" scoped>
.common-nav {
  width: 170px;

  .nav-sub {
    border-right: 1px solid rgba(132, 133, 141, .2);
    height: 100%;
    padding: var(--td-comp-paddingTB-xs) 0;

    .nav-sub-tab-title {
      margin: var(--td-comp-margin-m) 0 var(--td-comp-margin-m) var(--td-comp-margin-m);

      .title {
        padding-left: var(--td-comp-paddingTB-s);
        font-weight: 700;
        font-size: 1.5em;
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
