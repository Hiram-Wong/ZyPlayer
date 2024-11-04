<template>
  <div class="title-menu_titleMenuB" ref="titleMenuBRef">
    <div class="title-menu_firstMask" v-if="active.showFirstMask"></div>
    <div class="title-menu_superWrapper" ref="superWrapperRef">
      <div class="title-menu_superItem"
        v-for="(item, index) in uniqueList"
        :key="'type_' + item.type_id + '_index_' + index"
        :class="[tagFlag === item.type_id ? 'title-menu_active' : '']"
        @click="handleItemClick(item.type_id)"
      >
        <div class="title-menu_content">{{ item.type_name }}</div>
        <div class="title-menu_border" style="cursor: pointer;">
          <div id="icon"></div>
          <div id="cover"></div>
          <div id="gradientBorder"></div>
        </div>
      </div>
    </div>
    <div class="title-menu_lastMask" v-if="active.showLastMask"></div>
    <div class="title-menu_menuWrapper" v-if="active.showMenuWrapper">
      <t-dropdown theme="default" trigger="click" destroy-on-close >
        <t-button theme="default" shape="square" variant="outline" class="menu_menu_btn">
          <caret-down-small-icon />
        </t-button>
        <t-dropdown-menu>
          <t-dropdown-item
            v-for="(item, index) in uniqueList"
            :key="'type_' + item.type_id + '_index_' + index"
            :value="item.type_id"
            :class="{ dropdown_active: tagFlag === item.type_id }"
            @click="handleItemClick(item.type_id)"
          >
            {{ item.type_name }}
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import './index.less';
import uniqBy from 'lodash/uniqBy';
import { computed, ref, watch, useTemplateRef, onMounted } from 'vue';
import { CaretDownSmallIcon } from 'tdesign-icons-vue-next';

const props = defineProps<{
  active: any;
  list: Array<{
    type_id: string | number;
    type_name: string;
  }>;
}>();

watch(
  () => props.active,
  (val) => {
    tagFlag.value = val || '';
    redrawEl();
  },
);

const emit = defineEmits(['changeKey']);
const titleMenuBRef = useTemplateRef('titleMenuBRef');
const superWrapperRef = useTemplateRef('superWrapperRef');
const active = ref({
  showFirstMask: false,
  showLastMask: false,
  showMenuWrapper: false,
  transformValue: 0,
});
const tagFlag = ref(props.active);
const uniqueList = computed(() => uniqBy(props.list, 'type_id'));

onMounted(() => {
  redrawEl();
});
const redrawEl = () => {
  let selectedIdx = -1;
  selectedIdx = uniqueList.value.findIndex(item => item.type_id === tagFlag.value);

  const superRef = superWrapperRef.value;
  const titleRef = titleMenuBRef.value;
  if (superRef && titleRef) {
    const rect = (rect) => ({
      left: Math.floor(rect.left),
      top: Math.floor(rect.top),
      right: Math.floor(rect.right),
      bottom: Math.floor(rect.bottom),
      width: Math.floor(rect.width),
      height: Math.floor(rect.height)
    });
    const innerRect = rect(superRef.getBoundingClientRect())  // 内
    const outerRect = rect(titleRef.getBoundingClientRect())  // 外
    const isInnerWider = innerRect.width > outerRect.width; // 内 > 外
    if (isInnerWider !== active.value.showMenuWrapper) {
      active.value.showMenuWrapper = isInnerWider;
    }

    if (!isInnerWider) return;

    const targetElement = superRef.children[selectedIdx];
    if (targetElement) {
      const targetRect = rect(targetElement.getBoundingClientRect());
      const halfOuterWidth = Math.floor(outerRect.width / 2);
      const halfTargetWidth = Math.floor(targetRect.width / 2);
      const margin = 43;
      const maxTranslateX = Math.floor(outerRect.width - innerRect.width - margin);
      let translateX = halfOuterWidth - (targetRect.left - outerRect.left) - halfTargetWidth;
      if (translateX > 0) {
        translateX = Math.min(0, active.value.transformValue + translateX);
      } else {
        translateX = active.value.transformValue === maxTranslateX ? maxTranslateX : Math.max(maxTranslateX, active.value.transformValue + translateX);
      }
      const showFirstMask = translateX < 0;
      const showLastMask = innerRect.width > outerRect.width - translateX;
      if (!(
        active.value.transformValue === translateX &&
        active.value.showFirstMask === showFirstMask &&
        active.value.showLastMask === showLastMask
      )) {
        active.value.transformValue = translateX;
        active.value.showFirstMask = showFirstMask;
        active.value.showLastMask = showLastMask;
      }
      superWrapperRef.value.style.transform = `translateX(${translateX}px)`;
    }
  }
};

const handleItemClick = (key: string | number) => {
  emit('changeKey', key);
};
</script>

<style lang="less" scoped>
</style>
