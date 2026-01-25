import './css/index.css';

import type { PlayerOptions as IPlayerOptions } from '@oplayer/core';
import OPlayer from '@oplayer/core';
import type { Comment as IComment } from '@oplayer/danmaku';
import ODanmaku from '@oplayer/danmaku';
import ODash from '@oplayer/dash';
import OHls from '@oplayer/hls';
import OMpegts from '@oplayer/mpegts';
// import OShaka from '@oplayer/shaka';
// import { ad, AirPlay, Chromecast, Playlist, vttThumbnails } from '@oplayer/plugins';
import OTorrent from '@oplayer/torrent';
import type { UiConfig as IUiConfig } from '@oplayer/ui';
import OUI from '@oplayer/ui';
import { merge } from 'es-toolkit';

import { emitterChannel } from '@/config/emitterChannel';
import emitter from '@/utils/emitter';

import WebTorrentjs from '../../modules/webtorrent.min.js';
import type { IBarrage, IBarrageSendOptions, IMultiPlayerOptions } from '../../types';
import { color, icons, language } from '../../utils/static';
import { storage } from '../../utils/storage';
import { streamConfig } from '../../utils/stream-decoder';
import { publicBarrageSend } from '../../utils/tool';
import ZH_TW from './locales/zh-tw';
import type { PlayerAdapter } from './types';

class OPlayerAdapter {
  player: PlayerAdapter | null = null;
  listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  options: { [key: string]: any } = {
    conf: {
      source: {
        src: '',
        format: 'auto',
      },
      autoplay: true,
      isLive: false,
      lang: 'zh-CN',
    },
    ui: {
      theme: {
        primaryColor: color.theme,
        controller: {
          slideToSeek: 'always',
          coverButton: false,
        },
      },
      speeds: ['2.0', '1.5', '1.25', '1.0', '0.75', '0.5'],
      keyboard: { global: true },
      pictureInPicture: true,
      fullscreen: true,
      icons: {
        volume: [icons.volumeLarge, icons.volumeMuted],
        pip: [icons.pipEnter, icons.pipExit],
        setting: icons.settingDot,
        fullscreen: [icons.fullscreenEnter, icons.fullscreenExit],
        play: icons.play,
        pause: icons.pause,
        danmaku: icons.danmaku,
      },
    },
  };

  private on(event: string, handler: (...args: any[]) => void) {
    if (!this.player) return;

    let handlers = this.listeners.get(event);
    if (!handlers) {
      handlers = new Set();
      this.listeners.set(event, handlers);
    }

    if (!handlers.has(handler)) {
      handlers.add(handler);
      this.player.on(event, handler);
    }
  }

  private off(event: string, handler?: any) {
    if (!this.player) return;

    const handlers = this.listeners.get(event);
    if (!handlers) return;

    if (handler) {
      if (handlers.has(handler)) {
        this.player.off(event, handler);
        handlers.delete(handler);
      }
    } else {
      handlers.forEach((h) => this.player!.off(event, h));
      handlers.clear();
    }

    if (handlers.size === 0) this.listeners.delete(event);
  }

  barrage(barrage: IBarrage[], id: string) {
    if (!this.player) return;

    const comments: IComment[] = barrage.map((item) => ({
      mode: (['top', 'bottom'].includes(item.type)
        ? item.type
        : item.type === 'right'
          ? 'rtl'
          : 'ltr') as IComment['mode'],
      text: item.text,
      time: item.time,
      style: {
        color: item.color,
        fontSize: '24px',
      },
    }));
    this.player.context.danmaku.changeSource(comments);

    const sendHandle = (item: Required<IComment>) => {
      const options: IBarrageSendOptions = {
        id,
        type: (['top', 'bottom'].includes(item.mode!)
          ? item.mode
          : item.mode === 'rtl'
            ? 'right'
            : 'left') as IBarrageSendOptions['type'],
        text: item.text,
        time: item.time,
        color: (item.style! as CSSStyleDeclaration)?.color ?? '#FFFFFF',
      };
      publicBarrageSend(options);
    };
    this.player.context.danmaku.options.onEmit = (comment: IComment) => sendHandle(comment as Required<IComment>);
  }

  create(rawOptions: Required<IMultiPlayerOptions>) {
    const uiOptions: Partial<IUiConfig> = {
      icons: {
        next: rawOptions.next ? icons.mnext : undefined,
      },
      menu:
        rawOptions.quality.length === 0
          ? []
          : [
              {
                name: (() => {
                  const locale = language();
                  switch (locale) {
                    case 'zh-CN':
                      return '清晰度';
                    case 'zh-TW':
                      return '清晰度';
                    default:
                      return 'Quality';
                  }
                })(),
                // key: 'Quality',
                position: 'bottom',
                children: rawOptions.quality.map((q, i) => {
                  return { name: q.name, value: q.url, default: i === 0 };
                }),
                onChange({ value }) {
                  player.changeQuality({ src: value });
                },
              },
            ],
    };

    const coreOptions: Partial<IPlayerOptions> = {
      source: {
        src: rawOptions.url,
        format: ['hls', 'dash', 'flv', 'mpegts', 'torrent'].includes(rawOptions.type) ? rawOptions.type : 'auto', // 解码器
      },
      isLive: rawOptions.isLive, // 直播
      volume: ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('volume'))), // 音量
      muted: !!storage?.get('muted'),
      playbackRate: ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('playrate'))), // 倍速
      lang: (() => {
        const locale = language();
        switch (locale) {
          case 'zh-CN':
            return 'zh-CN';
          case 'zh-TW':
            return 'zh';
          default:
            return 'en';
        }
      })(), // 语言
    };

    const plugins = [
      {
        key: 'next',
        name: 'oplayer-plugin-next',
        apply(player: OPlayer) {
          player.locales.update({
            'zh-CN': {
              Next: '下集',
              Heatmap: '热力图',
            },
            'zh-TW': ZH_TW,
          } as any);
          player.on(['next'], () => {
            emitter.emit(emitterChannel.COMP_MULTI_PLAYER_PLAYNEXT);
          });
          return player;
        },
      },
      OUI(merge(this.options.ui, uiOptions)),
      new ODanmaku({
        speed: 144,
        opacity: 1,
        area: 0.7,
        fontSize: 1,
        enable: true,
        displaySender: false,
        heatmap: false,
        source: [],
      }),
      OHls({ config: Object.assign({}, streamConfig.hls(rawOptions.headers)) }),
      ODash({ config: { streaming: Object.assign({}, streamConfig.dash.stream(rawOptions.headers)) } }),
      OMpegts({ config: Object.assign({}, streamConfig.mpegts.optional(rawOptions.headers)) }),
      // OShaka({ config: Object.assign({}, streamConfig.shaka(rawOptions.headers)) }),
      OTorrent({ library: WebTorrentjs, config: Object.assign({}, streamConfig.torrent(rawOptions.headers)) }),
    ];

    // 初始化
    const player: PlayerAdapter = OPlayer.make(`#${rawOptions.container}`, merge(this.options.conf, coreOptions))
      .use(plugins)
      .create();

    player.storage = storage;
    this.player = player; // 赋值实例

    player.once('canplay', () => {
      !rawOptions.isLive && rawOptions.startTime > 0 && player.seek(rawOptions.startTime); // 开始时间
    });

    this.on('ratechange', () => {
      if (!player.isSourceChanging) player.storage?.set('playrate', player.playbackRate);
    });
    this.on('volumechange', () => {
      player.storage?.set('volume', player.volume);
      player.storage?.set('muted', player.isMuted);
    });

    return player;
  }

  destroy() {
    if (!this.player) return;

    this.listeners.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.off(event, handler);
      });
    });
    this.listeners.clear();

    this.player.destroy();
    this.player = null;
  }

  onTimeUpdate(callback: any) {
    if (!this.player) return;

    const handler = () => {
      callback({
        currentTime: this.player?.currentTime ?? Number.NaN,
        duration: this.player?.duration ?? Number.NaN,
      });
    };
    this.on('timeupdate', handler);
  }

  offTimeUpdate() {
    if (!this.player) return;
    this.off('timeupdate');
  }

  play() {
    this.player?.play();
  }

  pause() {
    this.player?.pause();
  }

  togglePlay() {
    if (this.player) this.player.togglePlay();
  }

  toggleMuted() {
    if (this.player) this.player.toggleMute();
  }

  seek(time: number) {
    if (this.player) this.player.seek(time);
  }

  switchUrl(rawOptions: Required<IMultiPlayerOptions>) {
    if (!this.player) return;

    const type = ['hls', 'dash', 'flv', 'mpegts', 'torrent'].includes(rawOptions.type) ? rawOptions.type : 'auto'; // 解码器
    const options = { src: rawOptions.url, format: type };
    this.player.changeSource(options, true);

    if (this.player?.context?.danmaku) this.player.context.danmaku.changeSource([]);
  }

  get currentTime() {
    return this.player?.currentTime ?? Number.NaN;
  }

  get duration() {
    return this.player?.duration ?? Number.NaN;
  }

  get time() {
    return {
      currentTime: this.player?.currentTime ?? Number.NaN,
      duration: this.player?.duration ?? Number.NaN,
    };
  }

  get playbackRate() {
    return this.player?.playbackRate ?? 1;
  }

  set playbackRate(rate: number) {
    if (this.player) this.player.setPlaybackRate(rate);
  }

  get muted() {
    return !!this.player?.isMuted;
  }

  set muted(state: boolean) {
    if (this.player) {
      if (state) this.player.mute();
      else this.player.unmute();
    }
  }

  get volume() {
    return this.player?.volume ?? 0;
  }

  set volume(volume: number) {
    if (this.player) {
      if (volume > 0) this.player.unmute();
      this.player.setVolume(volume);
    }
  }

  get instance() {
    return this.player;
  }
}

export default OPlayerAdapter;
