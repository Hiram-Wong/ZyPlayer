import type Artplayer from 'artplayer';

// @ts-expect-error artplayer 没有导出类型，故自行扩展
export interface PlayerAdapter extends Artplayer {
  readonly option: Artplayer['option'] & {
    headers?: Record<string, any>;
  };

  storage: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
  };

  readonly plugins: Artplayer['plugins'] & {
    artplayerPluginDanmuku?: {
      config: (options: { danmuku: any[] }) => void;
      load: () => void;
    };
  };

  dash?: unknown;
  flv?: unknown;
  hls?: unknown;
  mpegts?: unknown;
  shaka?: unknown;
  torrent?: unknown;
}
