/**
 * 移除部分用不到的语言、优化 electron 包的大小
 * 最小更動：顯式保留 zh_TW（繁體中文）
 */

const fs = require("fs");
const path = require("path");

exports.default = async function (context) {
  let localeDir = `${context.appOutDir}/locales/`;
  // macOS（如需）(context.electronPlatformName === 'darwin') ：localeDir = `${context.appOutDir}/zyfun.app/Contents/Resources/locales/`;

  // 顯式白名單前綴（最小化調整）：
  // 保留：英語、簡體、新增繁體
  const keepPrefixes = [
    "en",      // en...
    "zh_CN",
    "zh_TW"
  ];

  if (!fs.existsSync(localeDir)) return;

  fs.readdir(localeDir, function (err, files) {
    // files is array of filenames (basename form)
    if (err) return;
    if (!(files && files.length)) return;

    for (let i = 0, len = files.length; i < len; i++) {
      const filename = files[i];
      const fullPath = path.join(localeDir, filename);

      // 只處理 .pak 檔（Electron locale 檔案類型），其他忽略
      if (!filename.endsWith(".pak")) continue;

      // 去掉副檔名取得代碼
      const base = filename.replace(".pak", "");

      // 判斷是否符合保留前綴
      const keep = keepPrefixes.some(pref => base.startsWith(pref));
      if (!keep) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          // 最小更動：不新增 logger 函式，僅簡單輸出
          console.warn("[locale-prune] 刪除失敗：", filename, e.message);
        }
      }
    }
  });
};
