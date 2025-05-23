import privacyPolicyMD from './md/privacy-policy.md?raw';
import thumbnailFfmpegMD from './md/thumbnail-ffmpeg.md?raw';
import customPlayerMD from './md/custom-player.md?raw';

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
  label: {
    copy: 'Copy',
    lang: 'Lang',
    copySuccess: 'Copy success',
    copyError: 'Copy failed, please check your browser settings',
  },
};
