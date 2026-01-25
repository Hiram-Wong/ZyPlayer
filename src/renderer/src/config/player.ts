import type { ISetting } from '@shared/config/tblSetting';

export interface IStorePlayer {
  type: 'film' | 'live' | 'parse';
  status: boolean;
  data: {
    info: Record<string, any>;
    extra: Record<string, any>;
  };
  barrage: ISetting['barrage'];
  setting: {
    playNextPreload: boolean;
    playNextEnabled: boolean;
    loopEnabled: boolean;
    skipHeadAndEnd: boolean;
    skipAd: boolean;
  };
  player: {
    type: ISetting['player']['type'];
    external: string;
  };
}

export const init: IStorePlayer = {
  type: 'film',
  status: true,
  data: {
    info: {},
    extra: {},
  },
  barrage: {
    url: '',
    id: '',
    key: '',
    support: [],
    start: 0,
    type: 1,
    color: 2,
    text: 4,
  },
  setting: {
    playNextPreload: false,
    playNextEnabled: true,
    loopEnabled: false,
    skipHeadAndEnd: false,
    skipAd: false,
  },
  player: {
    type: 'artplayer',
    external: '',
  },
};

export default init;
