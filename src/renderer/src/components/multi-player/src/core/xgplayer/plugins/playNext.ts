import { Plugin, Sniffer } from 'xgplayer';

import { emitterChannel } from '@/config/emitterChannel';
import emitter from '@/utils/emitter';

import { icons } from '../../../utils/static';

const { POSITIONS } = Plugin;
const Next = icons.mnext;

function xgIconTips(plugin, textKey, isShow) {
  try {
    return ` <div class="xg-tips ${isShow ? 'hide' : ' '}" lang-key="${plugin.i18nKeys[textKey]}">
    ${plugin.i18n[textKey]}
    </div>`;
  } catch {
    return '<div class="xg-tips hide"></div>';
  }
}

export default class PlayNextIcon extends Plugin {
  static get pluginName() {
    return 'videoNext';
  }

  static get defaultConfig() {
    return {
      position: POSITIONS.CONTROLS_LEFT,
      index: 1,
    };
  }

  constructor(options) {
    super(options);
  }

  afterCreate() {
    this.appendChild('.xgplayer-icon', (this.icons as { playNext: HTMLElement }).playNext);
    this.initEvents();
  }

  registerIcons() {
    return {
      playNext: Next,
    };
  }

  initEvents() {
    // this.nextHandler = this.hook('nextClick', this.changeSrc)
    const event = Sniffer.device === 'mobile' ? 'touchend' : 'click';
    this.bind(event, this.playNext);
    this.show();
  }

  playNext() {
    emitter.emit(emitterChannel.COMP_MULTI_PLAYER_PLAYNEXT);
  }

  destroy() {
    this.unbind(['touchend', 'click'], this.playNext);
  }

  render() {
    return `
     <xg-icon class="xgplayer-playnext">
      <div class="xgplayer-icon">
      </div>
      ${xgIconTips(this, 'PLAYNEXT_TIPS', this.playerConfig.isHideTips)}
     </xg-icon>
    `;
  }
}
