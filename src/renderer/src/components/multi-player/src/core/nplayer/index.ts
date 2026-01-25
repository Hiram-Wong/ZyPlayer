import './css/index.css';

import NplayerDanmaku from '@nplayer/danmaku';
import type { BulletOption as IBulletOption } from '@nplayer/danmaku/dist/src/ts/danmaku/bullet';
import { merge } from 'es-toolkit';
import type { PlayerOptions as IPlayerOptions } from 'nplayer';
import NPlayer, { EVENT, I18n, Icon } from 'nplayer';

import type { IBarrage, IBarrageSendOptions, IMultiPlayerOptions } from '../../types';
import { color, icons, language } from '../../utils/static';
import { storage, storageUtil } from '../../utils/storage';
import { streamDecoder } from '../../utils/stream-decoder';
import { publicBarrageSend } from '../../utils/tool';
import ZH_TW from './locales/zh-tw';
import { pipPlugin, playNextPlugin } from './plugins';
import type { PlayerAdapter } from './types';
import { filterControls, uiIconHandle } from './utils';

Icon.register('play', uiIconHandle.create(icons.play, 'play'));
Icon.register('pause', uiIconHandle.create(icons.pause, 'pause'));
Icon.register('volume', uiIconHandle.create(icons.volumeLargeFill, 'volume'));
Icon.register('muted', uiIconHandle.create(icons.volumeMutedFill, 'volumeMuted'));
Icon.register('cog', uiIconHandle.create(icons.settingDot, 'cog'));
Icon.register('enterFullscreen', uiIconHandle.create(icons.fullscreen, 'enterFullscreen'));
Icon.register('exitFullscreen', uiIconHandle.create(icons.fullscreenExit, 'exitFullscreen'));

I18n.add('zh-tw', ZH_TW);

class NPlayerAdapter {
  player: PlayerAdapter | null = null;
  listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  options: IPlayerOptions = {
    container: '#nplayer',
    src: '',
    live: false,
    videoProps: { autoplay: 'true' },
    volumeVertical: true,
    i18n: 'zh-cn',
    bpControls: {},
    controls: [
      ['play', playNextPlugin, 'volume', 'time', 'spacer', 'danmaku-settings', 'settings', pipPlugin, 'fullscreen'],
      ['progress'],
    ],
    themeColor: color.theme,
    progressBg: color.theme,
    volumeProgressBg: color.theme,
    contextMenuToggle: false,
    plugins: [
      new NplayerDanmaku({
        autoInsert: true, // 自动插入控制条项
        speed: 1, // 弹幕速度
        duration: 5, // 弹幕持续显示时间
        opacity: 1, // 弹幕透明度
        fontsize: 24, // 弹幕字体大小
        area: 0.75, // 弹幕显示区域
        unlimited: false, // 弹幕无限弹幕模式
      }),
    ],
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

    const comments: IBulletOption[] = barrage.map((item) => ({
      type: (['top', 'bottom'].includes(item.type) ? item.type : 'scroll') as IBulletOption['type'],
      text: item.text,
      time: item.time,
      color: item.color,
      isMe: false,
      force: false,
    }));
    this.player.danmaku.resetItems(comments);

    const sendHandle = (item: IBulletOption) => {
      const options: IBarrageSendOptions = {
        id,
        type: (['top', 'bottom'].includes(item.type!) ? item.type : 'right') as IBarrageSendOptions['type'],
        text: item.text,
        time: item.time,
        color: item.color ?? '#FFFFFF',
      };
      publicBarrageSend(options);
    };

    this.on('DanmakuSend', sendHandle);
  }

  create(rawOptions: Required<IMultiPlayerOptions>) {
    storageUtil.delStartWith('nplayer:');

    const options: Partial<IPlayerOptions> = {
      container: `#${rawOptions.container}`, // 容器
      src: rawOptions.url, // 地址
      autoSeekTime: !rawOptions.isLive && rawOptions.startTime > 0 ? rawOptions.startTime : 0, // 起始时间
      live: rawOptions.isLive, // 直播
      i18n: (() => {
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
    };

    if (rawOptions.isLive) {
      this.options.controls = [[...this!.options!.controls![0]], []];
    } // 直播

    if (!rawOptions.next) {
      this.options.controls = [
        [...filterControls(this!.options!.controls![0], ['playNext'])],
        [...this!.options!.controls![1]],
      ];
    } // 下集

    // 初始化
    const player: PlayerAdapter = new NPlayer(merge(this.options, options));
    player.storage = storage;

    // 倍速
    // @ts-expect-error ts-migate(2341) 属性“settingNamedMap”为私有属性，只能在类“Player”中访问。
    player.settingNamedMap.speed.options = [
      { value: 0.5, html: '0.5' },
      { value: 0.75, html: '0.75' },
      { value: 1, html: I18n.t('Normal') },
      { value: 1.25, html: '1.25' },
      { value: 1.5, html: '1.5' },
      { value: 2, html: '2' },
    ];

    const steamOptions = {
      isLive: rawOptions.isLive,
      autoplay: rawOptions.autoplay,
      headers: rawOptions.headers,
    };
    // 解码器
    const type = ['hls', 'dash', 'flv', 'mpegts', 'torrent'].includes(rawOptions.type) ? rawOptions.type : 'auto';
    switch (type) {
      case 'hls': {
        if (player.hls) player.hls.destroy();
        const hls = streamDecoder.customHls(player.video, rawOptions.url, steamOptions);
        player.hls = hls!;
        player.on('destroy', () => hls?.destroy());
        break;
      }
      case 'flv': {
        if (player.flv) player.flv.destroy();
        const flv = streamDecoder.customFlv(player.video, rawOptions.url, steamOptions);
        player.flv = flv;
        player.on('destroy', () => flv?.destroy());
        break;
      }
      case 'dash': {
        if (player.dash) player.dash.destroy();
        const dash = streamDecoder.customDash(player.video, rawOptions.url, steamOptions);
        player.dash = dash;
        player.on('destroy', () => dash?.destroy());
        break;
      }
      case 'mpegts': {
        if (player.mpegts) player.mpegts.destroy();
        const mpegts = streamDecoder.customMpegts(player.video, rawOptions.url, steamOptions);
        player.mpegts = mpegts;
        player.on('destroy', () => mpegts?.destroy());
        break;
      }
      case 'torrent': {
        if (player.torrent) player.torrent.destroy();
        const torrent = streamDecoder.customTorrent(player.video, rawOptions.url, steamOptions);
        player.torrent = torrent;
        player.on('destroy', () => torrent?.destroy());
        break;
      }
      default:
        break;
    } // 解码器

    player.mount(); // 挂载
    this.player = player; // 赋值实例

    if (!rawOptions.isLive) {
      player.playbackRate = ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('playrate')));
      // @ts-expect-error ts-migate(2341) 属性“settingNamedMap”为只读属性
      player.settingNamedMap.speed.value = player.playbackRate; // 用于 ui 渲染
    }

    player.volume = ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('volume')));
    // @ts-expect-error ts-migate(2341) 属性“prevVolume”为只读属性
    player.prevVolume = player.volume; // 重要, 不然静音->恢复音量会 直接从 0->1
    player.muted = !!storage?.get('muted');

    setTimeout(() => {
      uiIconHandle.replace('.nplayer_control_setting', icons.danmu, 'danmu');
    }, 0); // 图标替换

    this.on(EVENT.RATE_CHANGE, () => player.storage?.set('playrate', player.playbackRate));
    this.on(EVENT.VOLUME_CHANGE, () => {
      player.storage?.set('volume', player.volume);
      player.storage?.set('muted', player.muted);
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

    this.player.dispose();
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
    this.on(EVENT.TIME_UPDATE, handler);
  }

  offTimeUpdate() {
    if (!this.player) return;
    this.off(EVENT.TIME_UPDATE);
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
    if (this.player) {
      this.player.muted = !this.player.muted;
    }
  }

  seek(time: number) {
    if (this.player) this.player.seek(time);
  }

  switchUrl(rawOptions: Required<IMultiPlayerOptions>) {
    if (!this.player) return;

    const steamOptions: Record<string, any> = {
      isLive: rawOptions.isLive,
      autoplay: rawOptions.autoplay,
      headers: rawOptions.headers,
    };

    ['hls', 'flv', 'dash', 'mpegts', 'torrent'].forEach((key) => {
      this.player?.[key]?.destroy?.();
      delete this.player?.[key]; // imporant
    });

    const type = ['hls', 'dash', 'flv', 'mpegts', 'torrent'].includes(rawOptions.type) ? rawOptions.type : 'auto';
    switch (type) {
      case 'hls':
        this.player!.hls = streamDecoder.customHls(this.player!.video, rawOptions.url, steamOptions);
        break;
      case 'flv':
        this.player!.flv = streamDecoder.customFlv(this.player!.video, rawOptions.url, steamOptions);
        break;
      case 'dash':
        this.player!.dash = streamDecoder.customDash(this.player!.video, rawOptions.url, steamOptions);
        break;
      case 'mpegts':
        this.player!.mpegts = streamDecoder.customMpegts(this.player!.video, rawOptions.url, steamOptions);
        break;
      case 'torrent':
        this.player!.torrent = streamDecoder.customTorrent(this.player!.video, rawOptions.url, steamOptions);
        break;
      default:
        this.player!.video.src = rawOptions.url;
        break;
    }

    this.player.play();

    if (this.player?.danmaku) this.player.danmaku.clearScreen();
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
    if (this.player) {
      this.player.playbackRate = rate;
      // @ts-expect-error ts-migate(2341) 属性“settingNamedMap”为只读属性
      this.player.settingNamedMap.speed.value = rate;
    }
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
    if (!this.player) return;

    if (this.player) {
      if (volume > 0) this.player.muted = false;
      this.player.volume = volume;
    }
  }

  get instance() {
    return this.player;
  }
}

export default NPlayerAdapter;
