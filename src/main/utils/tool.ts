import { BrowserWindow } from 'electron';
import { getWin } from '../core/winManger';

const toggleWindowVisibility = () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length === 0) return;
  const anyVisible = windows.some((win) => win.isVisible());
  windows.forEach((win) => {
    if (!win.isDestroyed()) {
      const playWin = getWin('play');
      if (anyVisible) {
        win.hide();
        if (playWin) {
          playWin.webContents.send('media-control', false);
          playWin.webContents.setAudioMuted(true);
        }
      } else {
        win.show();
        if (playWin) {
          playWin.webContents.send('media-control', true);
          playWin.webContents.setAudioMuted(false);
          playWin.focus();
        }
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
