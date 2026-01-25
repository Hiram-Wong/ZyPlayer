import type DPlayer from 'dplayer';
import type { OptionsInternal, PluginOptions, Plugins } from 'dplayer/dist/d.ts/types';

import type { IShakaInstance } from '../../types';

export interface PlayerAdapterPluginOptions extends PluginOptions {
  headers?: Record<string, any>;
}

export type PlayerAdapterOptions = Omit<OptionsInternal, 'pluginOptions'> & {
  pluginOptions: PlayerAdapterPluginOptions;
};

export interface PlayerAdapterPlugins extends Plugins {
  shaka?: IShakaInstance;
  flv?: Plugins['flvjs'];
  torrent?: Plugins['webtorrent'];
}

export interface PlayerAdapter extends DPlayer {
  storage?: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
  };
  options: PlayerAdapterOptions;
  plugins: PlayerAdapterPlugins;
}
