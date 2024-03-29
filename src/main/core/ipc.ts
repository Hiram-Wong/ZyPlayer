import { app, ipcMain } from 'electron';

const ipcListen = () => {
  // 关闭app
  ipcMain.on('quit-app', () => {
    app.quit();
  });
}

export { ipcListen }