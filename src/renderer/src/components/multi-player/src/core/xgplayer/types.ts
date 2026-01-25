import type XgPlayer from 'xgplayer';

export interface PlayerAdapter extends XgPlayer {
  storage?: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
  };
}
