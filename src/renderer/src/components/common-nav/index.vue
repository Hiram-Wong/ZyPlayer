<template>
  <div class="common-nav">
    <div class="nav-sub" :class="{ 'nav-sub-hidden': !active.show }">
      <div v-if="props.search" class="nav-sub-header">
        <t-input v-model="searchValue" clearable class="nav-sub-input" @change="handleListFilter">
          <template #prefix-icon><search-icon /></template>
        </t-input>
      </div>

      <div class="nav-sub-content">
        <t-list ref="listRef" class="list-wrap" :scroll="{ rowHeight: 35, threshold: 15, type: 'virtual' }">
          <t-list-item
            v-for="(item, index) in listData"
            :key="index"
            class="item-wrap"
            :class="[activeData === item.id ? 'is-active' : '']"
            @click="handleItemClick(item.id)"
          >
            <div class="list-item">
              <template v-if="measureText(item.name) < width">
                <div class="title txthide txthide1">{{ item.name }}</div>
              </template>

              <template v-else>
                <t-tooltip attach=".common-nav" :z-index="3" destroy-on-close :content="item.name">
                  <div class="title-wrap txthide txthide1">{{ item.name }}</div>
                </t-tooltip>
              </template>
            </div>
          </t-list-item>
        </t-list>
      </div>
      <div class="nav-sub-footer">
        <slot name="bottom"></slot>
      </div>
    </div>

    <div v-show="active.show" class="dragbar"></div>

    <div class="pin-wrapper" @click="active.show = !active.show">
      <div class="pin-icon-wrapper" :class="[active.show ? 'pin-icon-wrapper-show' : 'pin-icon-wrapper-hide']">
        <caret-left-small-icon v-if="active.show" class="icon" />
        <caret-right-small-icon v-else class="icon" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'CommonNav',
});

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  search: {
    type: Boolean,
    default: false,
  },
  active: {
    type: String,
    default: '',
  },
  list: {
    type: Array<{ id: string; name: string }>,
    default: () => [],
  },
});

const emit = defineEmits(['change']);

import { isStrEmpty, isString } from '@shared/modules/validate';
import Fuse from 'fuse.js';
import { CaretLeftSmallIcon, CaretRightSmallIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { ListInstanceFunctions } from 'tdesign-vue-next';
import { onActivated, onMounted, ref, useTemplateRef, watch } from 'vue';

const listRef = useTemplateRef<ListInstanceFunctions>('listRef');

const activeData = ref<string>(props.active);
const listData = ref<Array<{ id: string; name: string }>>(props.list);

const searchValue = ref<string>('');
const active = ref({
  search: false,
  show: true,
});
const width = ref<number>(114);
const fuse = ref();

watch(
  () => props.active,
  (val) => {
    activeData.value = val;
    handleScroll();
  },
);

watch(
  () => props.list,
  (val) => {
    listData.value = val;
    fuseCollection();
    handleScroll();
  },
);

onActivated(() => handleScroll());

onMounted(() => {
  fuseCollection();
  handleScroll();
});

const fuseCollection = () => {
  const list = listData.value || [];

  if (fuse.value) {
    fuse.value.setCollection(list);
  } else {
    fuse.value = new Fuse(list, { keys: ['name'], useExtendedSearch: true });
  }
};

const measureText = (text: string): number => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  return ctx!.measureText(text).width;
};

const handleItemClick = (key: string | number) => {
  emit('change', key);
};

const handleListFilter = () => {
  const kw = searchValue.value?.trim() || '';
  listData.value = isString(kw) && !isStrEmpty(kw) ? fuse.value.search(`'${kw}`).map((item) => item.item) : props.list;
};

const handleScroll = () => {
  if (!listRef.value) return;

  const id = activeData.value;
  if (!id) return;

  const list = listData.value;
  if (list.length === 0) return;

  const index = list.findIndex((item) => item.id === id) - 1;
  if (index < 0) return;

  listRef.value?.scrollTo?.({
    index,
    behavior: 'smooth',
  });
};
</script>
<style lang="less" scoped>
.common-nav {
  height: 100%;
  width: fit-content;
  position: relative;

  .nav-sub {
    height: 100%;
    width: 162px;
    padding-left: var(--td-comp-paddingLR-s);
    will-change: width;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);
    overflow: hidden;
    transition: all 0.25s ease-in-out;

    &-hidden {
      width: 0;
      padding: var(--td-comp-paddingTB-s) 0;
    }

    .nav-sub-header {
      width: 100%;
      height: fit-content;
      flex: 0 0 auto;
      padding-right: var(--td-comp-paddingLR-s);
    }

    .nav-sub-content {
      width: 100%;
      height: 100%;
      flex: 1;
      overflow: hidden;

      .list-wrap {
        height: 100%;
        overflow-y: scroll;

        :deep(.item-wrap) {
          width: 100%;
          height: calc(var(--td-comp-size-m) + 2px);
          padding: 0;
          cursor: pointer;
          margin-bottom: 1px;

          &::after {
            content: none;
          }

          &:last-of-type {
            margin-bottom: 0;
          }

          .list-item {
            display: flex;
            align-items: center;
            width: 100%;
            height: var(--td-comp-size-m);
            flex: 1;
            padding: 0 var(--td-comp-paddingTB-s);
            border-radius: var(--td-radius-medium);

            .title {
              width: 100%;
              flex: 1;
            }
          }

          &:hover {
            .list-item {
              background-color: var(--td-bg-color-component-hover);
            }
          }
        }

        .is-active {
          .list-item {
            background-color: var(--td-bg-color-component-hover);
          }
        }
      }
    }

    .nav-sub-footer {
      width: 100%;
      height: fit-content;
      flex: 0 0 auto;
    }
  }

  .dragbar {
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    right: -6px;
    width: 6px;
    user-select: none;

    &::after,
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      background: linear-gradient(
        180deg,
        transparent,
        color-mix(in srgb, var(--td-text-color-primary) 10%, transparent) 50%,
        transparent
      );
    }

    &::before {
      right: 0;
      transition: all 0.2s ease-in-out;
    }

    &::after {
      transition: background-color 0.2s ease-in-out;
      right: 6px;
      width: 1px;
    }
  }

  .pin-wrapper {
    position: absolute;
    z-index: 8;
    right: 0;
    top: 0;
    width: 1px;
    height: 100%;

    .pin-icon-wrapper {
      position: absolute;
      top: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 44px;
      width: 14px;
      border: 1px solid var(--td-border-level-2-color);
      box-shadow: var(--td-shadow-2);
      background-color: var(--td-bg-color-container);
      cursor: pointer;
      transform: translateY(-50%);
      transition: all 0.25s ease-in-out;

      &-show {
        border-radius: var(--td-radius-large);
        right: calc(0px - var(--td-size-3));
      }

      &-hide {
        border-radius: 0 var(--td-radius-large) var(--td-radius-large) 0;
        right: calc(0px - var(--td-size-5));
      }
    }
  }
}
</style>
