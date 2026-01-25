import 'xgplayer/dist/index.min.css';
import 'xgplayer-music/dist/index.min.css';
import 'xgplayer/es/plugins/danmu/index.css';
import './css/index.css';

import { merge } from 'es-toolkit';
import type { IPlayerOptions } from 'xgplayer';
import XgPlayer, { Events, I18N, SimplePlayer } from 'xgplayer';
import ZH_HK from 'xgplayer/es/lang/zh-hk';
import type { IDanmuConfig } from 'xgplayer/es/plugins/danmu';
import Danmu from 'xgplayer/es/plugins/danmu';
import LivePreset from 'xgplayer/es/presets/live';
import FlvPlugin from 'xgplayer-flv';
import HlsPlugin from 'xgplayer-hls';
import Mp4Plugin from 'xgplayer-mp4';
import MusicPreset from 'xgplayer-music';
import ShakaPlugin from 'xgplayer-shaka';

import type { IBarrage, IBarrageSendOptions, IMultiPlayerOptions } from '../../types';
import { color, icons, language } from '../../utils/static';
import { storage } from '../../utils/storage';
import { publicBarrageSend } from '../../utils/tool';
import { danmuSendPlugin as _danmuSendPlugin, playNextPlugin } from './plugins';
import type { PlayerAdapter } from './types';
import { uiIconHandle } from './utils';

I18N.use(ZH_HK);

class XgPlayerAdapter {
  player: PlayerAdapter | null = null;
  listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  options: IPlayerOptions = {
    id: 'xgplayer',
    url: '',
    width: 'auto',
    height: '100%',
    autoplay: true,
    pip: { index: 2, showIcon: true },
    cssFullscreen: false,
    startTime: 0,
    volume: { index: 3, default: 1, showValueLabel: true },
    playbackRate: {
      list: [2, 1.5, 1.25, { rate: 1, iconText: { 'zh-cn': '倍速', en: 'Speed' } }, 0.75, 0.5],
      index: 4,
    },
    time: { index: 2 },
    icons: {
      play: icons.play,
      pause: icons.pause,
      playNext: icons.mnext,
      fullscreen: icons.fullscreen,
      exitFullscreen: icons.fullscreenExit,
      volumeSmall: icons.volumeSmall,
      volumeLarge: icons.volumeLarge,
      volumeMuted: icons.volumeMuted,
      pipIcon: icons.pipEnter,
      pipIconExit: icons.pipExit,
      openDanmu: icons.danmuOpen,
      closeDanmu: icons.danmuClose,
    },
    commonStyle: {
      playedColor: color.theme, // 播放完成部分进度条底色
      volumeColor: color.theme, // 音量颜色
    },
    lang: 'zh-cn',
    enableContextmenu: true,
    danmu: {
      opacity: 1, // 弹幕透明度
      fontSize: 24, // 弹幕字体大小
      channelSize: 24, // 弹幕轨道高度
      panel: true,
      comments: [],
      area: { start: 0, end: 0.85 }, // 弹幕显示区域
      defaultOpen: true, // 是否默认开启弹幕
      closeDefaultBtn: false, // 是否隐藏弹幕开关按钮
    },
    plugins: [],
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

    const comments: IDanmuConfig['comments'] = barrage.map((item) => ({
      id: item.id,
      mode: ['left', 'right'].includes(item.type) ? 'scroll' : item.type,
      txt: item.text,
      start: item.time * 1000,
      color: true,
      style: { color: item.color, fontSize: '24px' },
      duration: 5 * 1000,
    }));
    this.player.plugins.danmu.updateComments(comments, true);
    this.player.getPlugin('danmu').updateComments(comments, true); // 效果一样

    const sendHandle = (item: any) => {
      const options: IBarrageSendOptions = {
        id,
        type: ['top', 'bottom'].includes(item.mode) ? item.mode : 'right',
        text: item.txt,
        time: item.start,
        color: item.style.color ?? '#FFFFFF',
      };

      publicBarrageSend(options);
    };

    this.on('DANMAKU_SEND', sendHandle!);
  }

  create(rawOptions: Required<IMultiPlayerOptions>) {
    const options: Partial<IPlayerOptions> = {
      id: rawOptions.container, // 容器
      url: rawOptions.url,
      autoplay: rawOptions.autoplay,
      startTime: !rawOptions.isLive && rawOptions.startTime > 0 ? rawOptions.startTime : 0, // 起始时间
      volume: {
        default: ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('volume'))),
      }, // 音量
      autoplayMuted: !!storage?.get('muted'),
      lang: (() => {
        const locale = language();
        switch (locale) {
          case 'zh-CN':
            return 'zh-cn';
          case 'zh-TW':
            return 'zh-hk';
          default:
            return 'en';
        }
      })(), // 语言
      presets: ['default'],
      plugins: [],
    };

    // 解码器
    const type = ['audio', 'mp4', 'hls', 'dash', 'flv', 'mpegts'].includes(rawOptions.type) ? rawOptions.type : 'auto';
    switch (type) {
      case 'audio': {
        options.presets = ['default', MusicPreset];
        options.controls = { initShow: true, mode: 'flex' };
        options.marginControls = true;
        options.mediaType = 'audio';
        options.ignores = ['mobile', 'musiccover', 'musicmeta', 'musicnext', 'musicprev'];
        break;
      }
      case 'mp4': {
        options.plugins = [Mp4Plugin];
        options.mp4plugin = { reqOptions: { headers: rawOptions.headers } };
        break;
      }
      case 'flv': {
        options.plugins = [FlvPlugin];
        options.flv = { fetchOptions: { headers: rawOptions.headers } };
        break;
      }
      case 'hls': {
        options.plugins = [HlsPlugin];
        options.hls = { fetchOptions: { headers: rawOptions.headers } };
        break;
      }
      case 'dash': {
        options.plugins = [ShakaPlugin];
        options.shakaplugin = { fetchOptions: { headers: rawOptions.headers } };
        break;
      }
    }

    // 初始化
    let player: PlayerAdapter;
    if (rawOptions.isLive) {
      SimplePlayer.defaultPreset = LivePreset;
      player = new SimplePlayer(merge(this.options, options));
    } else {
      options.plugins = [
        ...options.plugins!,
        ...(type !== 'audio' ? [Danmu] : []),
        ...(rawOptions.next ? [playNextPlugin] : []),
      ];
      player = new XgPlayer(merge(this.options, options));
    }

    if (rawOptions.quality.length) {
      const quality = rawOptions.quality.map((item) => {
        return { name: item.name, definition: item.name, url: item.url };
      });
      player.emit('resourceReady', quality);
    } // 画质

    player.storage = storage; // 挂载存储
    this.player = player; // 赋值实例

    if (type === 'audio') {
      setTimeout(() => {
        uiIconHandle.replace('.xgplayer-prev', icons.mprev);
        uiIconHandle.replace('.xgplayer-next', icons.mnext);
        uiIconHandle.replace('.xgplayer-backward', icons.mbackward);
        uiIconHandle.replace('.xgplayer-forward', icons.mforward);
      }, 0); // 图标替换
    }

    player.once(Events.READY, () => {
      !rawOptions.isLive &&
        (player.playbackRate = ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('playrate')))); // 倍速
    });

    this.on(Events.RATE_CHANGE, () => player.storage?.set('playrate', player.playbackRate));
    this.on(Events.VOLUME_CHANGE, () => {
      player.storage?.set('muted', player.muted);
      player.storage?.set('volume', player.volume);
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

    const handler = ({ currentTime, duration }) => {
      callback({
        currentTime: currentTime ?? Number.NaN,
        duration: duration ?? Number.NaN,
      });
    };
    this.on(Events.TIME_UPDATE, handler);
  }

  offTimeUpdate() {
    if (!this.player) return;
    this.off(Events.TIME_UPDATE);
  }

  play() {
    this.player?.play();
  }

  pause() {
    this.player?.pause();
  }

  togglePlay() {
    if (this.player) {
      if (this.player.paused) this.player.play();
      else this.player.pause();
    }
  }

  toggleMuted() {
    if (this.player) this.player.muted = !this.player.muted;
  }

  seek(time: number) {
    if (this.player) this.player.seek(time, 'auto');
  }

  switchUrl(rawOptions: Required<IMultiPlayerOptions>) {
    if (!this.player) return;

    const options: Partial<IPlayerOptions> = {};

    if (rawOptions.isLive) {
      const plugin = this.player?.getPlugin('danmu');
      if (plugin) this.player!.unRegisterPlugin('danmu');
    } else {
      const plugin = this.player?.getPlugin('danmu');
      if (!plugin) this.player!.registerPlugin(Danmu);
    }

    ['mp4plugin', 'hls', 'flv', 'shakaplugin'].forEach((key) => {
      const plugin = this.player?.getPlugin(key);
      if (plugin) {
        plugin.__destroy();
        this.player!.unRegisterPlugin(key, true);
        delete this.player?.plugins?.[key as keyof typeof this.player.plugins];
      }
    });

    const type = ['audio', 'mp4', 'hls', 'dash', 'flv', 'mpegts'].includes(rawOptions.type) ? rawOptions.type : 'auto';
    switch (type) {
      case 'audio':
        break;
      case 'mp4':
        this.player.registerPlugin(Mp4Plugin);
        options.mp4plugin = { reqOptions: { headers: rawOptions.headers } };
        break;
      case 'flv':
        this.player.registerPlugin(FlvPlugin);
        options.flv = { fetchOptions: { headers: rawOptions.headers } };
        break;
      case 'hls':
        this.player.registerPlugin(HlsPlugin);
        options.hls = { fetchOptions: { headers: rawOptions.headers } };
        break;
      case 'dash':
        this.player.registerPlugin(ShakaPlugin);
        options.shakaplugin = { fetchOptions: { headers: rawOptions.headers } };
        break;
    }

    this.player.playNext({ url: rawOptions.url, ...options });
    this.player.plugins?.danmu?.clear?.();
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

export default XgPlayerAdapter;
