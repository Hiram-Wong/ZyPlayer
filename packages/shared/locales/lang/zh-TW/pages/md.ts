import binaryHelpMD from './assets/binary-help.md?raw';
import customPlayerMD from './assets/custom-player.md?raw';
import disclaimerMD from './assets/disclaimer.md?raw';
import labEditHelpMD from './assets/lab-edit-help.md?raw';
import liveEpgMD from './assets/live-epg.md?raw';
import liveLogoMD from './assets/live-logo.md?raw';

export default {
  customPlayer: {
    title: '自定義播放器',
    content: customPlayerMD,
  },
  disclaimer: {
    title: '用戶須知',
    content: disclaimerMD,
    readComplete: '已完成閱讀',
    readProcess: '已閱讀{0}%',
    message: {
      agree: '用觀影發現世界',
      disagree: '3秒後自動退出軟件',
    },
  },
  liveEpg: {
    title: '直播節目單',
    content: liveEpgMD,
  },
  liveLogo: {
    title: '直播頻道圖標',
    content: liveLogoMD,
  },
  labEditHelp: {
    title: '寫源工具幫助',
    content: labEditHelpMD,
  },
  binaryHelp: {
    title: '安裝幫助',
    content: binaryHelpMD,
  },
};
