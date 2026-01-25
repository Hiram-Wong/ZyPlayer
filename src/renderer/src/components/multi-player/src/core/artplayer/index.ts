import './css/index.css';

import type { Option as IPlayerOptions } from 'artplayer';
import Artplayer from 'artplayer';
import ZH_TW from 'artplayer/i18n/zh-tw';
import type { Danmu as IDanmu } from 'artplayer-plugin-danmuku';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';
import { merge } from 'es-toolkit';

import type {
  IBarrage,
  IBarrageSendOptions,
  IDashInstance,
  IFlvInstance,
  IHlsInstance,
  IMpegtsInstance,
  IMultiPlayerOptions,
  ITorrentInstance,
} from '../../types';
import { color, icons, language } from '../../utils/static';
import { storage, storageUtil } from '../../utils/storage';
import { streamDecoder } from '../../utils/stream-decoder';
import { publicBarrageSend } from '../../utils/tool';
import { playNextPlugin } from './plugins';
import type { PlayerAdapter } from './types';
import { uiIconHandle } from './utils';

class ArtPlayerAdapter {
  player: PlayerAdapter | null = null;
  listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  videoId: string = '';

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

  options: IPlayerOptions = {
    container: '#artplayer',
    url: '',
    type: '',
    theme: color.theme,
    autoplay: true,
    playbackRate: true,
    fullscreen: true,
    pip: true,
    setting: true,
    flip: true,
    hotkey: true,
    isLive: false,
    aspectRatio: true,
    lang: 'zh-cn',
    controls: [playNextPlugin],
    i18n: {
      'zh-cn': {
        // @ts-expect-error 对象字面量只能指定已知属性，并且“playNext”不在类型“Partial<I18nValue>”中。ts(2353)
        playNext: '下集',
      },
      'zh-tw': {
        ...ZH_TW,
        // @ts-expect-error 对象字面量只能指定已知属性，并且“playNext”不在类型“Partial<I18nValue>”中。ts(2353)
        playNext: '下集',
      },
    },
    plugins: [
      artplayerPluginDanmuku({
        opacity: 1, // 弹幕透明度
        fontSize: 24, // 弹幕字体大小
        speed: 5, // 弹幕速度
        synchronousPlayback: true, // 同步播放速度
        margin: [10, '25%'], // 弹幕显示区域
        color: '#FFFFFF', // 弹幕颜色
        danmuku: [],
        emitter: false,
        antiOverlap: true, // 弹幕是否防重叠
        heatmap: false, // 热力图
        beforeEmit: ((item: IDanmu) => {
          if (!this.videoId) return false;

          const sendHandle = (item: IDanmu) => {
            const options: IBarrageSendOptions = {
              id: this.videoId,
              type: item.mode === 1 ? 'top' : item.mode === 2 ? 'bottom' : 'right',
              text: item.text,
              time: item.time!,
              color: item.color ?? '#FFFFFF',
            };

            publicBarrageSend(options);
          };

          sendHandle(item);
          return true;
        }) as (item: IDanmu) => boolean,
      }),
    ],
    icons: {
      play: icons.play,
      pause: icons.pause,
      volume: icons.volumeLargeFill,
      volumeClose: icons.volumeMutedFill,
      pip: icons.pipEnter,
      fullscreenOn: icons.fullscreen,
      fullscreenOff: icons.fullscreenExit,
      setting: icons.settingDot,
    },
    cssVar: {
      '--art-control-height': '34px',
      '--art-control-icon-size': '20px',
      '--art-control-icon-scale': 1,
    },
    customType: {
      hls: (video: HTMLVideoElement, url: string, art: PlayerAdapter) => {
        art.loading.show = true;
        if (art.hls) (art.hls as IHlsInstance)!.destroy();
        const steamOptions = {
          isLive: art.option.isLive,
          autoplay: art.option.autoplay,
          headers: art.option.headers,
        };
        const hls = streamDecoder.customHls(video, url, steamOptions);
        art.hls = hls;
        art.on('destroy', () => hls?.destroy());
        art.loading.show = false;
      },
      flv: (video: HTMLVideoElement, url: string, art: PlayerAdapter) => {
        art.loading.show = true;
        if (art.flv) (art.flv as IFlvInstance)!.destroy();
        const steamOptions = {
          isLive: art.option.isLive,
          autoplay: art.option.autoplay,
          headers: art.option.headers,
        };
        const flv = streamDecoder.customFlv(video, url, steamOptions);
        art.flv = flv;
        art.on('destroy', () => flv?.destroy());
        art.loading.show = false;
      },
      dash: (video: HTMLVideoElement, url: string, art: PlayerAdapter) => {
        art.loading.show = true;
        if (art.dash) (art.dash as IDashInstance)!.destroy();
        const steamOptions = {
          isLive: art.option.isLive,
          autoplay: art.option.autoplay,
          headers: art.option.headers,
        };
        const dash = streamDecoder.customDash(video, url, steamOptions);
        art.dash = dash;
        art.on('destroy', () => dash?.destroy());
        art.loading.show = false;
      },
      mpegts: (video: HTMLVideoElement, url: string, art: PlayerAdapter) => {
        art.loading.show = true;
        if (art.mpegts) (art.mpegts as IMpegtsInstance)!.destroy();
        const steamOptions = {
          isLive: art.option.isLive,
          autoplay: art.option.autoplay,
          headers: art.option.headers,
        };
        const mpegts = streamDecoder.customMpegts(video, url, steamOptions);
        art.mpegts = mpegts;
        art.on('destroy', () => mpegts?.destroy());
        art.loading.show = false;
      },
      torrent: (video: HTMLVideoElement, url: string, art: PlayerAdapter) => {
        art.loading.show = true;
        if (art.torrent) (art.torrent as ITorrentInstance)!.destroy();
        const steamOptions = {
          isLive: art.option.isLive,
          autoplay: art.option.autoplay,
          headers: art.option.headers,
        };
        const torrent = streamDecoder.customTorrent(video, url, steamOptions);
        art.torrent = torrent;
        art.on('destroy', () => torrent?.destroy());
        art.loading.show = false;
      },
    },
  };

  barrage(barrage: IBarrage[], id: string) {
    if (!this.player) return;

    this.videoId = id;

    const comments: IDanmu[] = barrage.map((item) => ({
      id: item.id,
      mode: ['top', 'bottom'].includes(item.type) ? (item.type === 'top' ? 1 : 2) : 0,
      text: item.text,
      time: item.time,
      color: item.color,
      border: false,
      style: {},
    }));

    this.player.plugins.artplayerPluginDanmuku?.config({ danmuku: comments });
    this.player.plugins.artplayerPluginDanmuku?.load();
  }

  create(rawOptions: Required<IMultiPlayerOptions>) {
    storageUtil.delStartWith('artplayer_settings');

    const options: Partial<IPlayerOptions> | Record<string, any> = {
      container: `#${rawOptions.container}`, // 容器
      type: ['hls', 'dash', 'flv', 'mpegts', 'torrent'].includes(rawOptions.type) ? rawOptions.type : 'auto', // 解码
      url: rawOptions.url, // 地址
      autoplay: rawOptions.autoplay,
      isLive: rawOptions.isLive,
      volume: ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('volume'))), // 音量
      muted: !!storage?.get('muted'),
      lang: (() => {
        const locale = language();
        switch (locale) {
          case 'zh-CN':
            return 'zh-cn';
          case 'zh-TW':
            return 'zh-tw';
          default:
            return 'en';
        }
      })(), // 语言
      quality: rawOptions.quality.map((q, i) => ({ html: q.name, url: q.url, default: i === 0 })), // 画质
      headers: rawOptions.headers, // 请求头
    };

    if (rawOptions.next) {
      const index = this.options.controls!.findIndex((i) => i.name === 'playNext');
      if (index > -1) {
        this.options.controls![index].disable = false;
        this.options.controls![index].tooltip = (() => {
          const locale = language();
          switch (locale) {
            case 'zh-CN':
              return '下集';
            case 'zh-TW':
              return '下集';
            default:
              return 'Play Next';
          }
        })();
      }
    } // 下集

    Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2]; // 倍速

    // 初始化
    const player: PlayerAdapter = new Artplayer(merge(this.options, options), function onReady() {
      // player.volume = options.volume; // 音量

      !rawOptions.isLive &&
        (player.playbackRate = ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('playrate')))); // 倍速
      !rawOptions.isLive && rawOptions.startTime > 0 && (player.seek = rawOptions.startTime); // 开始时间
    });
    player.storage = storage; // 挂载存储
    this.player = player; // 赋值实例

    setTimeout(() => {
      uiIconHandle.replace('.apd-toggle-on', icons.danmuOpen);
      uiIconHandle.replace('.apd-toggle-off', icons.danmuClose);
      uiIconHandle.replace('.apd-config-icon', icons.danmu);
    }, 0); // 图标替换

    this.on('video:ratechange', () => player?.storage?.set('playrate', player.playbackRate));
    this.on('video:volumechange', () => player?.storage?.set('volume', player.volume));
    this.on('muted', (state) => player?.storage?.set('muted', state));

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

    this.videoId = '';

    this.player.destroy();
    this.player = null;
  }

  onTimeUpdate(callback: any) {
    if (!this.player) return;

    const handler = () => {
      callback({
        currentTime: this.player?.video?.currentTime ?? Number.NaN,
        duration: this.player?.video?.duration ?? Number.NaN,
      });
    };

    this.on('video:timeupdate', handler);
  }

  offTimeUpdate() {
    if (!this.player) return;
    this.off('video:timeupdate');
  }

  play() {
    this.player?.play();
  }

  pause() {
    this.player?.pause();
  }

  togglePlay() {
    this.player?.toggle();
  }

  toggleMuted() {
    if (this.player) this.player.muted = !this.player.muted;
  }

  seek(time: number) {
    if (this.player) this.player.seek = time;
  }

  switchUrl(rawOptions: Required<IMultiPlayerOptions>) {
    if (!this.player) return;

    ['hls', 'flv', 'dash', 'mpegts', 'torrent'].forEach((key) => {
      this.player?.[key]?.destroy?.();
      delete this.player?.[key]; // imporant
    });

    this.player.option.headers = rawOptions.headers;

    // player.switch = url;
    this.player.switchUrl(rawOptions.url);

    if (this.player.plugins?.artplayerPluginDanmuku) {
      this.player.plugins.artplayerPluginDanmuku.config({ danmuku: [] });
      this.player.plugins.artplayerPluginDanmuku.load();
    }
  }

  get currentTime() {
    return this.player?.video?.currentTime ?? Number.NaN;
  }

  get duration() {
    return this.player?.video?.duration ?? Number.NaN;
  }

  get time() {
    return {
      currentTime: this.player?.video?.currentTime ?? Number.NaN,
      duration: this.player?.video?.duration ?? Number.NaN,
    };
  }

  get playbackRate() {
    return this.player?.playbackRate ?? 1;
  }

  set playbackRate(rate: number) {
    if (this.player) this.player.playbackRate = rate;
  }

  get muted() {
    return !!this.player?.muted;
  }

  set muted(state: boolean) {
    if (this.player) this.player.muted = state;
  }

  get volume() {
    return this.player?.volume ?? 0;
  }

  set volume(volume: number) {
    if (this.player) {
      if (volume > 0) this.player.muted = false;
      this.player.volume = volume;
    }
  }

  get instance() {
    return this.player;
  }
}

export default ArtPlayerAdapter;
