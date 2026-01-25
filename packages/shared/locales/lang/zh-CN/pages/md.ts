import binaryHelpMD from './assets/binary-help.md?raw';
import customPlayerMD from './assets/custom-player.md?raw';
import disclaimerMD from './assets/disclaimer.md?raw';
import labEditHelpMD from './assets/lab-edit-help.md?raw';
import liveEpgMD from './assets/live-epg.md?raw';
import liveLogoMD from './assets/live-logo.md?raw';

export default {
  customPlayer: {
    title: '自定义播放器',
    content: customPlayerMD,
  },
  disclaimer: {
    title: '用户须知',
    content: disclaimerMD,
    readComplete: '已完成阅读',
    readProcess: '已阅读{0}%',
    message: {
      agree: '用观影发现世界',
      disagree: '3秒后自动退出软件',
    },
  },
  liveEpg: {
    title: '直播节目单',
    content: liveEpgMD,
  },
  liveLogo: {
    title: '直播频道图标',
    content: liveLogoMD,
  },
  labEditHelp: {
    title: '写源工具帮助',
    content: labEditHelpMD,
  },
  binaryHelp: {
    title: '安装帮助',
    content: binaryHelpMD,
  },
};
