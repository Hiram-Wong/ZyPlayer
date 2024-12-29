<template>
  <component :is="component" ref="wrapperRef" :class="classNames">
    <div
      :class="[`${prefixCls}-pane`, `${prefixCls}-pane-first`]"
      :style="firstPaneStyles"
    >
      <slot name="first"></slot>
    </div>
    <ResizeTrigger
      v-if="!disabled"
      :prefix-cls="`${prefixCls}-trigger`"
      :direction="isHorizontal ? 'vertical' : 'horizontal'"
      @mousedown="onMoveStart"
      @resize="onTriggerResize"
    >
      <template #default>
        <slot name="resize-trigger"></slot>
      </template>
      <template #icon>
        <slot name="resize-trigger-icon"></slot>
      </template>
    </ResizeTrigger>
    <div :class="[`${prefixCls}-pane`, `${prefixCls}-pane-second`]">
      <slot name="second"></slot>
    </div>
  </component>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  ref,
  toRefs,
  onMounted,
  nextTick,
} from 'vue';
import ResizeTrigger from './resize-trigger.vue';
import useMergeState from './hooks/use-merge-state';
import { prefix } from '@/config/global';
import { off, on } from './utils/dom';
import { isNumber, isString } from './utils/is';
import { SplitProps } from './interface';

function getSizeConfig(size: number | string) {
  const numberSize = isString(size) ? parseFloat(size) : size;
  let unit = '';

  if (isNumber(size) || String(numberSize) === size) {
    unit = numberSize > 1 ? 'px' : '%';
  } else {
    unit = 'px';
  }

  return {
    size: numberSize,
    unit,
    isPx: unit === 'px',
  };
}

function getPxSize({
  size,
  defaultSize,
  containerSize,
}: {
  size: number | string | undefined;
  defaultSize?: string;
  containerSize: number;
}) {
  const config = getSizeConfig(size ?? defaultSize);
  if (config.isPx) {
    return config.size;
  }
  return config.size * containerSize;
}

function px2percent(numerator: number | string, denominator: number | string) {
  return parseFloat(numerator as string) / parseFloat(denominator as string);
}

export default defineComponent({
  name: 'Split',
  components: {
    ResizeTrigger,
  },
  props: {
    /**
     * @zh 分割框的 html 标签
     * @en The html tag of the split box
     */
    component: {
      type: String,
      default: 'div',
    },
    /**
     * @zh 分割的方向
     * @en Direction of division
     */
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    /**
     * @zh 分割的大小，可以是 0~1 代表百分比，或具体数值的像素，如 300px
     * @en The size of the segmentation, it can be 0~1 representing a percentage, or a specific number of pixels, such as 300px
     * @vModel
     */
    size: {
      type: [Number, String],
      default: undefined,
    },
    /**
     * @zh 默认分割的大小，可以是 0~1 代表百分比，或具体数值的像素，如 300px
     * @en Default split size, it can be 0~1 representing a percentage, or a specific number of pixels, such as 300px
     */
    defaultSize: {
      type: [Number, String],
      default: 0.5,
    },
    /**
     * @zh 最小阈值，可以是 0~1 代表百分比，或具体数值的像素，如 300px
     * @en Minimum threshold, it can be 0~1 representing a percentage, or a specific number of pixels, such as 300px
     */
    min: {
      type: [Number, String],
    },
    /**
     * @zh 最大阈值，可以是 0~1 代表百分比，或具体数值的像素，如 300px
     * @en Maximum threshold, it can be 0~1 representing a percentage, or a specific number of pixels, such as 300px
     * */
    max: {
      type: [Number, String],
    },
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    /**
     * @zh 开始拖拽之前触发
     * @en Triggered before dragging
     * */
    'moveStart': (ev: MouseEvent) => true,
    /**
     * @zh 拖拽时触发
     * @en Triggered when dragging
     */
    'moving': (ev: MouseEvent) => true,
    /**
     * @zh 拖拽结束之后触发
     * @en Triggered after dragging ends
     */
    'moveEnd': (ev: MouseEvent) => true,
    'update:size': (size: number | string) => true,
  },
  /**
   * @zh 第一个面板的内容
   * @en The contents of the first panel
   * @slot first
   */
  /**
   * @zh 第二个面板的内容
   * @en The contents of the second panel
   * @slot second
   */
  /**
   * @zh 伸缩杆的内容
   * @en The contents of the resize pole
   * @slot resize-trigger
   */
  /**
   * @zh 伸缩杆的图标
   * @en Resize pole icon
   * @slot resize-trigger-icon
   */
  setup(props: SplitProps, { emit }) {
    const { direction, size: propSize, defaultSize, min, max } = toRefs(props);
    const triggerSize = ref(0);
    const wrapperRef = ref<HTMLDivElement>();
    // const prefixCls = getPrefixCls('split');
    const prefixCls = `${prefix}-split`;
    const [size, setSize] = useMergeState(
      defaultSize.value,
      reactive({
        value: propSize,
      })
    );
    const sizeConfig = computed(() => getSizeConfig(size.value));
    const isHorizontal = computed(() => direction.value === 'horizontal');
    const classNames = computed(() => [
      prefixCls,
      {
        [`${prefixCls}-horizontal`]: isHorizontal.value,
        [`${prefixCls}-vertical`]: !isHorizontal.value,
      },
    ]);
    const firstPaneStyles = computed(() => {
      const { size: numberSize, unit, isPx } = sizeConfig.value;
      const baseVal = isPx ? numberSize : numberSize * 100;
      return {
        flex: `0 0 calc(${baseVal}${unit} - ${triggerSize.value / 2}px)`,
      };
    });
    const record: {
      startPageX: number;
      startPageY: number;
      startContainerSize: number;
      startSize: number | string;
    } = {
      startPageX: 0,
      startPageY: 0,
      startContainerSize: 0,
      startSize: 0,
    };

    async function getContainerSize() {
      const getSize = () => {
        return isHorizontal.value
          ? wrapperRef.value?.clientWidth
          : wrapperRef.value?.clientHeight || 0;
      };

      if (!wrapperRef.value || getSize()) {
        await nextTick();
      }

      return getSize();
    }

    function updateSize(newPxSize: number, containerSize: number) {
      if (!containerSize) {
        return;
      }

      const newSize = sizeConfig.value.isPx
        ? `${newPxSize}px`
        : px2percent(newPxSize, containerSize);

      if (size.value === newSize) return;
      setSize(newSize);
      emit('update:size', newSize);
    }

    function getLegalPxSize(size: number | string, containerSize: number) {
      const pxSize = getPxSize({
        size,
        containerSize,
      });
      const minPxSize = getPxSize({
        size: min.value,
        defaultSize: '0px',
        containerSize,
      });
      const maxPxSize = getPxSize({
        size: max.value,
        defaultSize: `${containerSize}px`,
        containerSize,
      });

      let legalPxSize = pxSize;
      legalPxSize = Math.max(legalPxSize, minPxSize);
      legalPxSize = Math.min(legalPxSize, maxPxSize);

      return legalPxSize;
    }

    function getNewPxSize({
      startContainerSize,
      startSize,
      startPosition,
      endPosition,
    }: {
      startContainerSize: number;
      startSize: number | string;
      startPosition: number;
      endPosition: number;
    }) {
      const startPxSize = getPxSize({
        size: startSize,
        containerSize: startContainerSize,
      });
      return getLegalPxSize(
        `${startPxSize + (endPosition - startPosition)}px`,
        startContainerSize
      );
    }

    // 移动中，更新 firstPane 的占位大小
    function onMoving(e: MouseEvent) {
      emit('moving', e);

      const newPxSize = isHorizontal.value
        ? getNewPxSize({
            startContainerSize: record.startContainerSize,
            startSize: record.startSize,
            startPosition: record.startPageX,
            endPosition: e.pageX,
          })
        : getNewPxSize({
            startContainerSize: record.startContainerSize,
            startSize: record.startSize,
            startPosition: record.startPageY,
            endPosition: e.pageY,
          });

      updateSize(newPxSize, record.startContainerSize);
    }

    // 移动结束，解除事件绑定
    function onMovingEnd(e: MouseEvent) {
      off(window, 'mousemove', onMoving);
      off(window, 'mouseup', onMovingEnd);
      off(window, 'contextmenu', onMovingEnd);

      document.body.style.cursor = 'default';
      emit('moveEnd', e);
    }

    // 移动开始，记录初始值，绑定移动事件
    async function onMoveStart(e: MouseEvent) {
      emit('moveStart', e);

      record.startPageX = e.pageX;
      record.startPageY = e.pageY;
      record.startContainerSize = await getContainerSize();
      record.startSize = size.value;

      on(window, 'mousemove', onMoving);
      on(window, 'mouseup', onMovingEnd);
      on(window, 'contextmenu', onMovingEnd);

      document.body.style.cursor = isHorizontal.value
        ? 'col-resize'
        : 'row-resize';
    }

    function onTriggerResize(entry: ResizeObserverEntry) {
      const { width, height } = entry.contentRect;
      triggerSize.value = isHorizontal.value ? width : height;
    }

    onMounted(async () => {
      const containerSize = await getContainerSize();
      const fixedPxSize = getLegalPxSize(size.value, containerSize);
      updateSize(fixedPxSize, containerSize);
    });

    return {
      prefixCls,
      classNames,
      isHorizontal,
      wrapperRef,
      onMoveStart,
      onTriggerResize,
      firstPaneStyles,
    };
  },
});
</script>
