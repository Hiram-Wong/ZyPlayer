export function useLoading() {
  const className = `loaders-css__square`;
  const styleContent = `
    @keyframes square {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(180deg); }
      100% { transform: rotate(360deg); }
    }
    .${className} {
      box-sizing: border-box;
      width: 46px;
      height: 46px;
      border: 6px solid var(--td-loading-circle);
      border-radius: 50%;
      -webkit-animation: loading 1.5s linear infinite;
      animation: square 1.5s linear infinite;
    }
    .${className} > div {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      left: 40px;
      top: -5px;
      position: absolute;
      background: var(--td-loading-dot);
    }
    .app-loading-wrap {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--td-loading-bg);
      z-index: 999;
    }
  `;

  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

  return {
    appendLoading() {
      safe.append(document.head, oStyle);
      safe.append(document.body, oDiv);
    },
    removeLoading() {
      safe.remove(document.head, oStyle);
      safe.remove(document.body, oDiv);
    },
  };
}

const safe = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};
