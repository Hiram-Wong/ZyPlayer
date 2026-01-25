import { emitterChannel } from '@/config/emitterChannel';
import emitter from '@/utils/emitter';

import { icons, language } from '../../../utils/static';

const lang = () => {
  const locale = language();
  switch (locale) {
    case 'zh-CN':
      return '下集';
    case 'zh-TW':
      return '下集';
    default:
      return 'Play Next';
  }
};

const playNextPlugin = {
  name: 'playNext',
  index: 11,
  position: 'left',
  html: `<i class="art-icon art-icon-play-next" style="display: flex;">${icons.mnext}</i>`,
  tooltip: lang(),
  disable: true,
  click() {
    emitter.emit(emitterChannel.COMP_MULTI_PLAYER_PLAYNEXT);
  },
  mounted() {},
};

export default playNextPlugin;
