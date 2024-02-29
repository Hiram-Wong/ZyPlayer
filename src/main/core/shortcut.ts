import { globalShortcut } from "electron";

/**
 * 注册全局快捷键
 * @param {BrowserWindow} win - 程序窗口
 */
const createGlobalShortcut = (win) => {
  // 刷新程序
  globalShortcut.register("CmdOrCtrl+Shift+R", () => {
    if (win && win.isFocused()) win?.reload();
  });

  // 打开开发者工具
  globalShortcut.register("CmdOrCtrl+Shift+I", () => {
    if (win && win.isFocused()) {
      win?.webContents.openDevTools({
        mode: "right",
        activate: true,
      });
    }
  });
};

export default createGlobalShortcut;