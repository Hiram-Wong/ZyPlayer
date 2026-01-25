<template>
  <div ref="titleMenuRef" class="title-menu">
    <!-- first mask -->
    <div v-if="maskState.showFirstMask" class="title-menu__firstMask"></div>

    <!-- menu wrapper -->
    <div
      ref="superWrapperRef"
      class="title-menu__superWrapper"
      :style="{ transform: `translateX(${currentTransformX}px)` }"
    >
      <div
        v-for="(item, index) in menuList"
        :key="index"
        class="title-menu__superItem"
        :class="{ 'super-item_active': activeMenu === item.type_id }"
        @click="handleIMenuItemClick(item.type_id)"
      >
        <div class="content">{{ item.type_name }}</div>
        <div class="border">
          <div id="icon"></div>
          <div id="cover"></div>
          <div id="gradientBorder"></div>
        </div>
      </div>
    </div>

    <!-- last mask -->
    <div v-if="maskState.showLastMask" class="title-menu__lastMask"></div>

    <!-- dropdown -->
    <div v-if="maskState.showMenuWrapper" class="title-menu__menuWrapper">
      <t-dropdown theme="default" trigger="click" destroy-on-close>
        <t-button theme="default" shape="square" variant="outline" class="dropdown">
          <caret-down-small-icon />
        </t-button>
        <t-dropdown-menu>
          <t-dropdown-item
            v-for="(item, index) in menuList"
            :key="index"
            :value="item.type_id"
            :active="activeMenu === item.type_id"
            @click="handleIMenuItemClick(item.type_id)"
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

defineOptions({
  name: 'TitleMenu',
});

const props = defineProps({
  active: {
    type: String,
    default: '',
  },
  list: {
    type: Array<IMenuItem>,
    default: () => [],
  },
});

const emits = defineEmits(['change']);

interface IMenuItem {
  type_id: string;
  type_name: string;
}

interface IMaskState {
  showFirstMask: boolean;
  showLastMask: boolean;
  showMenuWrapper: boolean;
}

interface IRectInfo {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

interface ITransformResult {
  translateX: number;
  showFirstMask: boolean;
  showLastMask: boolean;
}

import { debounce, isEqual } from 'es-toolkit';
import { CaretDownSmallIcon } from 'tdesign-icons-vue-next';
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

const DROPDOWN_MARGIN = 40;
const DEBOUNCE_DELAY = 100;

const titleMenuRef = useTemplateRef<HTMLDivElement>('titleMenuRef');
const superWrapperRef = useTemplateRef<HTMLDivElement>('superWrapperRef');
const resizeObserver = ref<ResizeObserver>();

const maskState = ref<IMaskState>({
  showFirstMask: false,
  showLastMask: false,
  showMenuWrapper: false,
});

const currentTransformX = ref(0);
const activeMenu = ref(props.active);
const menuList = ref(props.list);

watch(
  () => props.active,
  (val) => {
    activeMenu.value = val;
    debouncedRedrawElement();
  },
);
watch(
  () => props.list,
  (newVal, oldVal) => {
    const isEq = isEqual(newVal, oldVal);
    if (isEq) return;

    menuList.value = Array.from(new Map(newVal.map((menuItem) => [menuItem.type_id, menuItem])).values());
    defaultConfig();
    debouncedRedrawElement();
  },
);

onMounted(() => setup());

onUnmounted(() => dispose());

const setup = () => {
  initializeResizeObserver();
  debouncedRedrawElement();
};

const dispose = () => {
  resizeObserver.value?.disconnect();
  defaultConfig();
};

const getElementRect = (element: HTMLElement): IRectInfo => {
  const rect = element.getBoundingClientRect();

  return {
    left: Math.floor(rect.left),
    right: Math.floor(rect.right),
    top: Math.floor(rect.top),
    bottom: Math.floor(rect.bottom),
    width: Math.floor(rect.width),
    height: Math.floor(rect.height),
  };
};

const calculateTransformOffset = (
  targetRect: IRectInfo,
  outerRect: IRectInfo,
  innerRect: IRectInfo,
  currentTransform: number,
): ITransformResult => {
  const halfOuterWidth = Math.floor(outerRect.width / 2);
  const halfTargetWidth = Math.floor(targetRect.width / 2);
  const maxTranslateX = Math.floor(outerRect.width - innerRect.width - DROPDOWN_MARGIN);

  let translateX = halfOuterWidth - (targetRect.left - outerRect.left) - halfTargetWidth;

  const next = currentTransform + translateX;
  translateX = Math.min(0, Math.max(next, maxTranslateX));

  return {
    translateX,
    showFirstMask: translateX < 0,
    showLastMask: innerRect.width > outerRect.width - translateX - DROPDOWN_MARGIN,
  };
};

const redrawElement = () => {
  const activeMenuIndex = menuList.value.findIndex((menuItem) => menuItem.type_id === activeMenu.value);
  if (activeMenuIndex === -1) return;

  nextTick(() => {
    const superRef = superWrapperRef.value;
    const titleRef = titleMenuRef.value;
    if (!superRef || !titleRef) return;

    const innerRect = getElementRect(superRef); // 内
    const outerRect = getElementRect(titleRef); // 外
    const targetElementRect = getElementRect(superRef.children[activeMenuIndex] as HTMLElement);

    const isOverflowing = innerRect.width > outerRect.width; // 内 > 外

    maskState.value.showMenuWrapper = isOverflowing;
    if (!isOverflowing) return;

    const { translateX, showFirstMask, showLastMask } = calculateTransformOffset(
      targetElementRect,
      outerRect,
      innerRect,
      currentTransformX.value,
    );

    const hasStateChanged =
      currentTransformX.value !== translateX ||
      maskState.value.showFirstMask !== showFirstMask ||
      maskState.value.showLastMask !== showLastMask;

    if (hasStateChanged) {
      currentTransformX.value = translateX;
      maskState.value.showFirstMask = showFirstMask;
      maskState.value.showLastMask = showLastMask;
    }
  });
};

const debouncedRedrawElement = debounce(redrawElement, DEBOUNCE_DELAY);

const initializeResizeObserver = () => {
  nextTick(() => {
    const containerElement = titleMenuRef.value;
    if (!containerElement) return;

    resizeObserver.value = new ResizeObserver(debounce(() => debouncedRedrawElement(), DEBOUNCE_DELAY));
    resizeObserver.value.observe(containerElement);
  });
};

const defaultConfig = () => {
  maskState.value = {
    showFirstMask: false,
    showLastMask: false,
    showMenuWrapper: false,
  };

  currentTransformX.value = 0;
};

const handleIMenuItemClick = (val: string) => {
  emits('change', val);
};
</script>
<style lang="less" scoped></style>
