import type { IBarrage, IBarrageSendOptions } from '@shared/types/barrage';
import type * as Dashjs from 'dashjs';
import type Flvjs from 'flv.js';
import type { HlsConfig as Hlsjsonfig } from 'hls.js';
import type Hlsjs from 'hls.js';
import type Mpegtsjs from 'mpegts.js';
// https://gist.github.com/Security2431/2b28f17e11870bb4b0e347673e16d5ba#comments
import type Shakajs from 'shaka-player/dist/shaka-player.compiled';

type IHeaders = Record<string, any>;

export type IMultiPlayerType = 'artplayer' | 'dplayer' | 'nplayer' | 'xgplayer' | 'oplayer';
export type IDecoderType = 'audio' | 'mp4' | 'dash' | 'hls' | 'flv' | 'mpegts' | 'shaka' | 'torrent';
export type IDecoderWithAutoType = IDecoderType | 'auto';

export type IMultiPlayerCreateMode = 'new' | 'switch';

export interface IMultiPlayerOptions {
  container: string;
  type: IDecoderWithAutoType;
  url: string;
  startTime: number;
  autoplay: boolean;
  isLive: boolean;
  next: boolean;
  quality: Array<{ name: string; url: string }>;
  headers: IHeaders;
}

interface IBasePlayerAdapter {
  barrage: (comments: IBarrage[], id: string) => void;
  destroy: () => Promise<void>;

  switchUrl: (doc: any) => Promise<void>;

  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => void;

  get playbackRate(): number;
  set playbackRate(v: number);

  get muted(): boolean;
  set muted(v: boolean);
  toggleMuted: () => void;

  get volume(): number;
  set volume(v: number);

  get time(): number;
  seek: (time: number) => void;

  get instance(): any;
}

export interface ISinglePlayerAdapter extends IBasePlayerAdapter {
  create: (doc: Required<IMultiPlayerOptions>) => Promise<void>;
  onTimeUpdate: (cb: (args: { currentTime: number; duration: number }) => void) => void;
  offTimeUpdate: () => void;
}

export interface IMultiPlayerAdapter extends IBasePlayerAdapter {
  create: (doc: Partial<IMultiPlayerOptions>, type: IMultiPlayerType, mode?: IMultiPlayerCreateMode) => Promise<void>;
  onTimeUpdate: () => void;
}

export interface IMultiPlayerSlots {
  header?: () => any;
  default?: () => any;
}

export type { IBarrage, IBarrageSendOptions };

/**
 * dash.js
 */
export interface IDashConfig {
  autoplay?: boolean;
  isLive?: boolean;
  options?: Dashjs.MediaPlayerSettingClass;
  headers?: IHeaders;
}

export type IDashInstance = Dashjs.MediaPlayerClass | undefined;

/**
 * hls.js
 */
export interface IHlsConfig {
  autoplay?: boolean;
  isLive?: boolean;
  options?: Hlsjsonfig;
  headers?: IHeaders;
}

export type IHlsInstance = Hlsjs | undefined;

/**
 * flv.js
 */
export interface IFlvConfig {
  autoplay?: boolean;
  isLive?: boolean;
  mediaDataSource?: Flvjs.MediaDataSource;
  optionalConfig?: Flvjs.Config;
  headers?: IHeaders;
}

export type IFlvInstance = Flvjs.Player | undefined;

/**
 * mpegts.js
 */
export interface IMpegtsConfig {
  autoplay?: boolean;
  isLive?: boolean;
  mediaDataSource?: Mpegtsjs.MediaDataSource;
  optionalConfig?: Mpegtsjs.Config;
  headers?: IHeaders;
}

export type IMpegtsInstance = Mpegtsjs.Player | undefined;

/**
 * shaka-player
 */
export interface IShakaConfig {
  autoplay?: boolean;
  isLive?: boolean;
  options?: object;
  headers?: IHeaders;
}

export type IShakaInstance = Shakajs.Player | undefined;

/**
 * webtorrent
 */
export interface ITorrentConfig {
  autoplay?: boolean;
  isLive?: boolean;
  options?: {
    maxConns?: number | undefined;
    nodeId?: string | ArrayBuffer | undefined;
    peerId?: string | ArrayBuffer | undefined;
    tracker?: boolean | Record<string, any> | undefined;
    dht?: boolean | Record<string, any> | undefined;
    lsd?: boolean | undefined;
    webSeeds?: boolean | undefined;
    utp?: boolean | undefined;
    blocklist?: (string | Array<string | { start: string; end: string }>) | undefined;
    downloadLimit?: number | undefined;
    uploadLimit?: number | undefined;
  };
  headers?: IHeaders;
}

export type ITorrentInstance = any | undefined;
