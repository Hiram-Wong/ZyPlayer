import type NPlayer from 'nplayer';

import type {
  IDashInstance,
  IFlvInstance,
  IHlsInstance,
  IMpegtsInstance,
  IShakaInstance,
  ITorrentInstance,
} from '../../types';

export interface PlayerAdapter extends NPlayer {
  storage?: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
  };
  hls?: IHlsInstance;
  flv?: IFlvInstance;
  shaka?: IShakaInstance;
  mpegts?: IMpegtsInstance;
  dash?: IDashInstance;
  torrent?: ITorrentInstance;
}
