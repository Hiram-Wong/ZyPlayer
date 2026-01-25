import type { ControlItem as IControlItem } from 'nplayer';

const uiIconHandle = {
  /**
   * 创建图标元素
   * @param html 图标HTML字符串
   * @param className 是否不添加默认类名
   * @returns 返回一个函数，可进一步添加类名并获取元素
   */
  create(html: string, className?: string): (cls?: string) => HTMLDivElement {
    const div = document.createElement('div');
    const classes = ['nplayer_icon'];

    if (className) {
      classes.push(`nplayer_${className}_icon`);
      div.id = className;
    }

    div.className = classes.join(' ');
    div.innerHTML = html;

    return () => {
      return div;
    };
  },

  /**
   * 替换目标元素中的SVG图标
   * @param targetSelector 目标元素选择器
   * @param html 新元素的HTML字符串
   * @param className 新元素的类名
   * @returns 是否成功替换
   */
  replace(targetSelector: string, html: string, className?: string): boolean {
    try {
      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) return false;

      const prevElement = targetElement.previousElementSibling;
      if (!prevElement) return false;

      const iconElement = prevElement.querySelector('.nplayer_icon');
      if (!iconElement) return false;

      const newIconElement = document.createElement('div');
      const classes = ['nplayer_icon'];

      if (className) {
        classes.push(`nplayer_${className}_icon`);
        newIconElement.id = className;
      }

      newIconElement.className = classes.join(' ');
      newIconElement.innerHTML = html;

      iconElement.replaceWith(newIconElement);

      return true;
    } catch (error) {
      console.error('[uiIconHandle][replace]', error);
      return false;
    }
  },
};

/**
 * 过滤控制项数组，移除指定的控制项
 * @param data 原始控制项数组，可以是字符串或包含id属性的对象
 * @param filter 需要过滤的控制项ID数组
 * @returns 过滤后的新数组（不修改原数组）
 */
const filterControls = (data: (IControlItem | string)[], filter: string[]): (IControlItem | string)[] => {
  // 无过滤条件时直接返回原数组的浅拷贝
  if (!filter.length) return [...(data || [])];

  return [...(data || [])].filter((item) => {
    const itemId = typeof item === 'string' ? item : (item as unknown as IControlItem).id;
    return !filter.includes(itemId);
  });
};

export { filterControls, uiIconHandle };
