const uiIconHandle = {
  /**
   * 替换目标元素中的SVG图标
   * @param targetSelector 目标元素选择器
   * @param html 新元素的HTML字符串
   * @returns 是否成功替换
   */
  replace(targetSelector: string, html: string): boolean {
    try {
      const targetEl = document.querySelector(targetSelector);
      if (!targetEl) return false;

      targetEl.innerHTML = html;

      return true;
    } catch (error) {
      console.error('Failed to replace icon:', error);
      return false;
    }
  },
};

export { uiIconHandle };
