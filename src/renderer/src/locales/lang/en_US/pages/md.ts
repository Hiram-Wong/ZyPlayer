import privacyPolicyMD from '@/assets/md/en_US/privacy-policy.md?raw';
import thumbnailFfmpegMD from '@/assets/md/en_US/thumbnail-ffmpeg.md?raw';
import customPlayerMD from '@/assets/md/en_US/custom-player.md?raw';

export default {
  thumbanilFfmpeg: {
    title: 'Thumbnail usage note',
    content: thumbnailFfmpegMD,
    confirm: 'Check',
    cancel: 'Ok',
  },
  customPlayer: {
    title: 'Custom player usage note',
    content: customPlayerMD,
    confirm: 'Ok',
  },
  privacyPolicy: {
    title: 'User Instructions',
    content: privacyPolicyMD,
    quitTip: 'Auto quit app after 5 seconds',
    confirm: 'Aagree',
    cancel: 'Disagree',
  },
};
