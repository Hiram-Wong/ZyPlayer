import { VNode } from 'vue';
import { isString } from './is';

export const NOOP = () => {
  return undefined;
};
export interface Size {
  height: number;
  width: number;
}
export const getDocumentSize = (): Size => {
  const { body } = document;
  const html = document.documentElement;
  let topBody;
  try {
    const topWindow = window.top || window.self || window;
    topBody = topWindow.document.body;
  } catch {}

  return {
    height: Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
      topBody?.scrollHeight || 0,
      topBody?.clientHeight || 0
    ),
    width: Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth,
      topBody?.scrollWidth || 0,
      topBody?.clientWidth || 0
    ),
  };
};
export const isServerRendering = (() => {
  try {
    return !(typeof window !== 'undefined' && document !== undefined);
  } catch (e) {
    return true;
  }
})();

export const on = (() => {
  if (isServerRendering) {
    return NOOP;
  }
  return <K extends keyof HTMLElementEventMap>(
    element: HTMLElement | Window,
    event: K,
    handler: (ev: HTMLElementEventMap[K]) => void,
    options: boolean | AddEventListenerOptions = false
  ) => {
    element.addEventListener(
      event,
      handler as EventListenerOrEventListenerObject,
      options
    );
  };
})();

export const off = (() => {
  if (isServerRendering) {
    return NOOP;
  }
  return <K extends keyof HTMLElementEventMap>(
    element: HTMLElement | Window,
    type: K,
    handler: (ev: HTMLElementEventMap[K]) => void,
    options: boolean | EventListenerOptions = false
  ) => {
    element.removeEventListener(
      type,
      handler as EventListenerOrEventListenerObject,
      options
    );
  };
})();

export const findDomNode = (vnode: VNode) => {
  let node = vnode.el;
  while (node && !node.tagName) {
    node = node.nextSibling;
  }
  return node as HTMLElement;
};

export const contains = (root: Node | null | undefined, ele: Node | null) => {
  if (!root || !ele) {
    return false;
  }
  let node: Node | null = ele;
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

export const OVERLAY_TYPES = [
  'modal',
  'message',
  'notification',
  'drawer',
] as const;

export const getOverlay = (type: typeof OVERLAY_TYPES[number]) => {
  const popper = document.createElement('div');
  popper.setAttribute('class', `arco-overlay arco-overlay-${type}`);
  return popper;
};

export const querySelector = (
  selectors: string,
  container?: Document | HTMLElement
) => {
  if (isServerRendering) {
    return NOOP();
  }
  return (
    (container ?? document).querySelector<HTMLElement>(selectors) ?? undefined
  );
};

export const getElement = (
  target: string | HTMLElement | undefined,
  container?: Document | HTMLElement
): HTMLElement | undefined => {
  if (isString(target)) {
    const selector = target[0] === '#' ? `[id='${target.slice(1)}']` : target;
    return querySelector(selector, container);
  }
  return target;
};

/**
 * Get the relative distance between two DOMs
 * @param target
 * @param relative
 */
export const getRelativeRect = (target: HTMLElement, relative: HTMLElement) => {
  const targetRect = target.getBoundingClientRect();
  const relativeRect = relative.getBoundingClientRect();

  return {
    top: targetRect.top - relativeRect.top,
    bottom: relativeRect.bottom - targetRect.bottom,
    left: targetRect.left - relativeRect.left,
    right: relativeRect.right - targetRect.right,
    width: targetRect.width,
    height: targetRect.height,
  };
};

export const isScroll = (element: HTMLElement) => {
  return element.tagName === 'BODY'
    ? document.documentElement.scrollHeight > window.innerHeight
    : element.scrollHeight > element.offsetHeight;
};

export const getScrollBarWidth = (element: HTMLElement) => {
  return element.tagName === 'BODY'
    ? window.innerWidth - getDocumentSize().width
    : element.offsetWidth - element.clientWidth;
};
