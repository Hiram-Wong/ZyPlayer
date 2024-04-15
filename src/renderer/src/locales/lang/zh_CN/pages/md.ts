import privacyPolicyMD from '@/assets/md/en_US/privacy-policy.md?raw';
import thumbnailFfmpegMD from '@/assets/md/en_US/thumbnail-ffmpeg.md?raw';
import customPlayerMD from '@/assets/md/en_US/custom-player.md?raw';

export default {
  thumbanilFfmpeg: {
    title: '缩略图使用说明',
    content: thumbnailFfmpegMD,
    confirm: "安装检测",
    cancel: "知道了"
  },
  customPlayer: {
    title: '自定义播放器说明',
    content: customPlayerMD,
    confirm: "知道了"
  },
  privacyPolicy: {
    title: '用户协议与免责声明',
    content: privacyPolicyMD,
    confirm: "同意并继续",
    cancel: "不同意"
  },
};