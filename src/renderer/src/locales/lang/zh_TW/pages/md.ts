import privacyPolicyMD from './md/privacy-policy.md?raw';
import thumbnailFfmpegMD from './md/thumbnail-ffmpeg.md?raw';
import customPlayerMD from './md/custom-player.md?raw';

export default {
  // 注意：原鍵名為 thumbanilFfmpeg（可能是 thumbnail 的拼寫錯誤）
  // 若需更正為 thumbnailFfmpeg，請告知我幫你同步調整其他引用處
  thumbanilFfmpeg: {
    title: '縮圖使用說明',
    content: thumbnailFfmpegMD,
    confirm: '安裝檢測',
    cancel: '知道了',
  },
  customPlayer: {
    title: '自訂播放器說明',
    content: customPlayerMD,
    confirm: '知道了',
  },
  privacyPolicy: {
    title: '使用者須知',
    content: privacyPolicyMD,
    quitTip: '5 秒後自動退出軟體',
    confirm: '同意並繼續',
    cancel: '不同意',
  },
  label: {
    copy: '複製',
    lang: '語言',
    copySuccess: '複製成功',
    copyError: '複製失敗，請檢查您的瀏覽器設定',
  },
};
