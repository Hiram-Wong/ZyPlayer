const uiIconHandle = {
  /**
   * 替换目标元素中的SVG图标
   * @param targetSelector 目标元素选择器
   * @param html 新元素的HTML字符串
   * @returns 是否成功替换
   */
  replace(targetSelector: string, html: string): boolean {
    // 获取目标SVG
    const targetSVG = document.querySelector(targetSelector);
    if (!targetSVG || !(targetSVG instanceof SVGElement)) return false;

    // 获取原class
    const originalClass = targetSVG.getAttribute('class') || '';

    // 创建新SVG元素
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const newSVG = tempDiv.querySelector('svg');
    if (!newSVG) return false;

    // 添加原class到新SVG
    if (originalClass) {
      const newClass = newSVG.getAttribute('class') || '';
      const combinedClass = `${newClass} ${originalClass}`;
      newSVG.setAttribute('class', combinedClass);
    }

    // 替换整个SVG元素
    targetSVG.replaceWith(newSVG);

    return true;
  },
};

/**
 * 过滤控制项数组，移除指定的控制项并重置非字符串项的disable状态
 * @param data 原始控制项数组，可以是字符串或包含name属性的对象
 * @param filter 需要过滤的控制项名称数组
 * @returns 过滤后的新数组
 */
const filterControls = <T extends string | { name: string; disable?: boolean }>(data: T[], filter: string[]): T[] => {
  // 无过滤条件时直接返回原数组的浅拷贝
  if (!filter.length) return [...data];

  return data
    .filter((item) => {
      const itemName = typeof item === 'string' ? item : item.name;
      return !filter.includes(itemName);
    })
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      } else {
        return { ...(item as any), disable: false };
      }
    }) as T[];
};

export { filterControls, uiIconHandle };
