import type NPlayer from 'nplayer';
import { I18n } from 'nplayer';

import { emitterChannel } from '@/config/emitterChannel';
import emitter from '@/utils/emitter';

import { icons } from '../../../utils/static';

const playNextPlugin = {
  el: document.createElement('div'),
  id: 'playNext',
  tooltip: '',
  isSupport: () => true,
  handle() {},
  updateI18n() {
    I18n.add('zh-tw', {
      playNext: '下集',
    });
    I18n.add('zh-cn', {
      playNext: '下集',
    });
    I18n.add('en', {
      playNext: 'Play Next',
    });
  },
  init(player: NPlayer, _: any, tooltip: string) {
    this.updateI18n();

    this.el.id = 'playNext';
    const pipDom = document.createElement('div');
    pipDom.className = 'nplayer_icon';
    pipDom.innerHTML = icons.mnext;

    this.tooltip = tooltip;
    (this.tooltip as any).html = I18n.t('playNext');
    this.el.append(pipDom);

    this.handle = () => {
      if (!player.loaded) return;
      emitter.emit(emitterChannel.COMP_MULTI_PLAYER_PLAYNEXT);
    };

    this.el.addEventListener('click', this.handle);
  },
  dispose() {
    this.el.removeEventListener('click', this.handle);
    this.el?.remove();
  },
};

export default playNextPlugin;
