import { BrowserWindow } from 'electron';

const toggleWindowVisibility = () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length === 0) return;
  const anyVisible = windows.some((win) => win.isVisible());
  windows.forEach((win) => {
    if (!win.isDestroyed()) {
      if (anyVisible) {
        win.hide();
      } else {
        win.show();
      }
    }
  });
};

const parseCustomUrl = (url) => {
  const [redirectURL, ...headerParts] = url.split('@');

  const headers = headerParts.reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {});

  return { redirectURL, headers };
};

export { parseCustomUrl, toggleWindowVisibility };
