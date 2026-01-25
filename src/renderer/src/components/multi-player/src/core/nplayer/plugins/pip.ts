import type NPlayer from 'nplayer';
import { I18n } from 'nplayer';

import { icons } from '../../../utils/static';

const pipPlugin = {
  el: document.createElement('div'),
  id: 'pip',
  tooltip: '',
  isSupport: () => true,
  handle() {},
  updateI18n() {
    I18n.add('zh-tw', {
      PIP: '畫中畫',
    });
    I18n.add('zh-cn', {
      PIP: '画中画',
    });
    I18n.add('en', {
      PIP: 'PIP',
    });
  },
  init(player: NPlayer, _: any, tooltip: string) {
    this.updateI18n();

    this.el.id = 'pip';
    const pipDom = document.createElement('div');
    pipDom.className = 'nplayer_icon';
    pipDom.innerHTML = icons.pip;

    this.tooltip = tooltip;
    (this.tooltip as any).html = I18n.t('PIP');
    this.el.append(pipDom);

    this.handle = () => {
      if (!player.loaded) return;
      if ((document as any).pictureInPictureElement !== player.video) {
        (player.video as any).requestPictureInPicture();
      } else {
        (document as any).exitPictureInPicture();
      }
    };

    this.el.addEventListener('click', this.handle);
  },
  dispose() {
    this.el.removeEventListener('click', this.handle);
    this.el?.remove();
  },
};

export default pipPlugin;
