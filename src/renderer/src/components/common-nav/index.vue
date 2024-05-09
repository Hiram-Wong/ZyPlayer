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
              v-for="item in listData" :key="item.id" :value="item.id" @click="handleItemClick(item.id)">
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  title: string;
  active: any;
  list: Array<{
    id: string | number;
    name: string;
  }>;
}>();

const activeData = ref(props.active);
const listData = ref(props.list);

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

const emit = defineEmits(['changeKey']);

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
