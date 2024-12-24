import XgPlayer, { Events, SimplePlayer } from 'xgplayer';
import Danmu from 'xgplayer/es/plugins/danmu';
import LivePreset from 'xgplayer/es/presets/live';
import FlvPlugin from 'xgplayer-flv';
// import FlvPlugin from 'xgplayer-flv.js';
import HlsPlugin from 'xgplayer-hls';
// import HlsPlugin from 'xgplayer-hls.js';
import Mp4Plugin from 'xgplayer-mp4';
import ShakaPlugin from 'xgplayer-shaka';
// import DashPlugin from 'xgplayer-dash';

import { playerStorage } from '../utils/tool';
import { publicColor, publicIcons } from '../utils/static';

class XgPlayerAdapter {
  player: XgPlayer | null = null;
  options: { [key: string]: any } = {
    url: '',
    autoplay: true,
    pip: true,
    cssFullscreen: false,
    startTime: 0,
    playbackRate: {
      list: [2, 1.5, 1.25, { rate: 1, iconText: { zh: '倍速' } }, 0.75, 0.5],
      index: 3,
    },
    time: { index: 0 },
    icons: {
      play: publicIcons.play,
      pause: publicIcons.pause,
      playNext: publicIcons.playNext,
      fullscreen: publicIcons.fullscreen,
      exitFullscreen: publicIcons.exitFullscreen,
      volumeSmall: publicIcons.volumeSmall,
      volumeLarge: publicIcons.volumeLarge,
      volumeMuted: publicIcons.volumeMuted,
      pipIcon: publicIcons.pipIcon,
      pipIconExit: publicIcons.pipIconExit,
      openDanmu: publicIcons.openDanmu,
      closeDanmu: publicIcons.closeDanmu,
    },
    commonStyle: {
      playedColor: publicColor.theme, // 播放完成部分进度条底色
      volumeColor: publicColor.theme, // 音量颜色
    },
    width: 'auto',
    height: '100%',
    type: '',
    id: 'xgplayer',
    enableContextmenu: true,
    danmu: {
      panel: false,
      comments: [],
      area: { start: 0, end: 0.3 },
      defaultOff: true, //开启此项后弹幕不会初始化，默认初始化弹幕
    },
    plugins: [],
  };
  publicListener: { [key: string]: any } = {
    timeUpdate: () => {},
    sendDanmu: () => {},
    playrateUpdate: () => {},
    volumeUpdate: () => {},
    mutedUpdate: () => {},
  };

  barrage = (comments: any, _url: string, _id: string) => {
    if (!this.player) return;
    comments = comments.map((item, index) => ({
      duration: 5000,
      id: (index + 1).toString(),
      txt: item.text,
      start: item.time * 1000,
      mode: ['left', 'right'].includes(item.mode) ? 'scroll' : item.mode,
      color: true,
      style: { color: item.color },
    }));
    this.player.plugins.danmu.updateComments(comments, true);
    // this.player.getPlugin('danmu').updateComments(comments, true); // 效果一样
    // this.player.plugins.danmu.sendComment({
    //   duration: 5000, //弹幕持续显示时间,毫秒(最低为5000毫秒)
    //   id: nanoid(), //弹幕id，需唯一
    //   start: player.currentTime * 1000, //弹幕出现时间，毫秒
    //   color: true, //该条弹幕为彩色弹幕，默认false
    //   txt: '', //弹幕文字内容
    //   style: {
    //     //弹幕自定义样式
    //     color: '#FFFFFF',
    //   },
    // }); // 应插件内实现
  };

  create = (options: any): XgPlayer => {
    options = { ...this.options, ...options };
    const plugins = options.plugins;
    options.id = options.container;
    delete options.container;
    options.startTime = options?.startTime || 0;

    const headers = options?.headers || {};
    switch (options.type) {
      case 'customMp4':
        options.plugins = [...plugins, Mp4Plugin];
        if (Object.keys(headers).length > 0)
          options.mp4plugin = {
            reqOptions: {
              headers: { ...headers },
            },
          };
        break;
      case 'customFlv':
        options.plugins = [...plugins, FlvPlugin];
        if (Object.keys(headers).length > 0)
          options.flv = {
            fetchOptions: { headers: { ...headers } },
          };
        break;
      case 'customHls':
        options.plugins = [...plugins, HlsPlugin];
        if (Object.keys(headers).length > 0)
          options.hls = {
            fetchOptions: { headers: { ...headers } },
          };
        break;
      case 'customDash':
        options.plugins = [...plugins, ShakaPlugin];
        if (Object.keys(headers).length > 0) options.shakaPlugin = {};
      case 'customWebTorrent':
        break;
      default:
        break;
    }
    delete options.type;
    delete options.headers;
    let player;
    options.volume =
      playerStorage.get('volume') === null || playerStorage.get('volume') === undefined
        ? 1
        : playerStorage.get('volume');
    if (playerStorage.get('muted') || false) {
      options.autoplayMuted = true;
    }
    if (options.isLive) {
      delete options.startTime;
      SimplePlayer.defaultPreset = LivePreset;
      player = new SimplePlayer({ ...options });
    } else {
      options.plugins = [...options.plugins, Danmu];
      player = new XgPlayer({ ...options });
    }
    if (options.quality && Array.isArray(options.quality) && options.quality.length > 0) {
      options.quality = options.quality.map(item => {
        return { name: item.name, url: item.url };
      });
      player.emit("resourceReady", options.quality);
    }

    player.storage = playerStorage;

    player.once(Events.READY, () => {
      if (!options.isLive) player.playbackRate = player.storage.get('playrate') || 1;
    });

    this.publicListener.playrateUpdate = () => {
      player.storage.set('playrate', player.playbackRate);
    };
    player.on(Events.RATE_CHANGE, this.publicListener.playrateUpdate);

    this.publicListener.volumeUpdate = () => {
      player.storage.set('muted', player.muted);
      player.storage.set('volume', player.volume);
    };
    player.on(Events.VOLUME_CHANGE, this.publicListener.volumeUpdate);
    this.player = player;
    return player;
  };

  currentTime = (): number => {
    if (!this.player) return 0;
    return this.player.currentTime || 0;
  };

  destroy = () => {
    if (!this.player) return;
    this.player.destroy();
  };

  duration = (): number => {
    if (!this.player) return 0;
    return this.player.duration || 0;
  };

  pause = () => {
    if (!this.player) return;
    this.player.pause();
  };

  play = () => {
    if (!this.player) return;
    this.player.play();
  };

  playNext = (options: any) => {
    if (!this.player) return;
    switch (options.type) {
      case 'customMp4':
        options.plugins = [Danmu, Mp4Plugin];
        break;
      case 'customFlv':
        options.plugins = [Danmu, FlvPlugin];
        break;
      case 'customHls':
        options.plugins = [Danmu, HlsPlugin];
        break;
      case 'customWebTorrent':
        break;
      default:
        break;
    }
    this.player.playNext({ url: options.url });
    if (this.player.plugins?.danmu) this.player.plugins.danmu.clear();
  };

  seek = (time: number) => {
    if (!this.player) return;
    this.player.once(Events.LOADED_DATA, () => {
      this.player!.seek(time);
    });
  };

  speed = (speed: number) => {
    if (!this.player) return;
    this.player.once(Events.LOADED_DATA, () => {
      this.player!.playbackRate = speed;
    });
  };

  time = (): { currentTime: number; duration: number } => {
    if (!this.player)
      return {
        currentTime: 0,
        duration: 0,
      };
    return {
      currentTime: this.player.currentTime || 0,
      duration: this.player.duration || 0,
    };
  };

  offBarrage = (_player: XgPlayer) => {
    if (!this.player) return;
    // player.offAll();
    // 无该事件
  };

  onTimeUpdate = (callback: any) => {
    if (!this.player) return;
    this.publicListener.timeUpdate = ({ currentTime, duration }) => callback({ currentTime, duration });
    this.player.on(Events.TIME_UPDATE, this.publicListener.timeUpdate);
  };

  offTimeUpdate = () => {
    if (!this.player) return;
    this.player.off(Events.TIME_UPDATE, this.publicListener.timeUpdate);
  };

  toggle = () => {
    if (!this.player) return;
    if (this.player.paused) this.player.play();
    else this.player.pause();
  };

  volume = (volume: number) => {
    if (!this.player) return;
    this.player.volume = volume;
  };
}

export default XgPlayerAdapter;
