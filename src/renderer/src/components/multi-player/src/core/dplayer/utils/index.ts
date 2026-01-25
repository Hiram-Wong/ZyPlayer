const uiIconHandle = {
  /**
   * 创建图标按钮元素
   * @param el 目标元素选择器
   * @param html 图标HTML字符串
   * @param className 基础类名
   * @param popup 可选的弹出提示文本
   * @returns 返回一个函数，可进一步添加类名并获取按钮元素
   */
  create(el: string, html: string, className: string, popup: string): Element | boolean {
    const controlSetting = document.querySelector(el);
    if (!controlSetting) return false;

    const btn = document.createElement('button');
    btn.className = `dplayer-icon dplayer-${className}-icon`;
    btn.setAttribute('data-balloon', className || '');
    btn.setAttribute('data-balloon-pos', 'up');
    btn.setAttribute('data-balloon-nofocus', '');
    btn.setAttribute('aria-label', popup || '');
    btn.innerHTML = `<span class="dplayer-icon-content">${html}</span>`;

    controlSetting.insertAdjacentElement('afterend', btn);

    return controlSetting;
  },

  /**
   * 替换目标元素中的SVG图标
   * @param targetSelector 目标元素选择器
   * @param html 新元素的HTML字符串
   * @returns 是否成功替换
   */
  replace(targetSelector: string, html: string): boolean {
    try {
      const targetEl = document.querySelector(`${targetSelector} .dplayer-icon-content`);
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
