import OPlayer from '@oplayer/core';
// import { Chromecast, AirPlay, Playlist, ad, vttThumbnails } from '@oplayer/plugins';
import OUI from '@oplayer/ui';
import ODanmaku from '@oplayer/danmaku';
import OHls from '@oplayer/hls';
import ODash from '@oplayer/dash';
import OMpegts from '@oplayer/mpegts';
// import OTorrent from '@oplayer/torrent';

import { publicBarrageSend, playerStorage } from '../../utils/tool';
import { publicColor, publicIcons } from '../../utils/static';
import emitter from '@/utils/emitter';

import './css/index.css';

class OPlayerAdapter {
  player: OPlayer | null = null;
  options: { [key: string]: any } = {
    conf: {
      source: {
        src: '',
        format: 'auto',
      },
      autoplay: true,
      isLive: false,
      lang: (() => {
        const locale = localStorage.getItem('zy-locale');
        switch (locale) {
          case 'zh_CN':
            return 'zh-CN';
          case 'en_US':
            return 'en';
          default:
            return 'zh-CN';
        }
      })(),
    },
    ui: {
      theme: {
        primaryColor: publicColor.theme,
        controller: {
          slideToSeek: 'always',
          coverButton: false,
        }
      },
      speeds: ['2.0', '1.5', '1.25', '1.0', '0.75', '0.5'],
      keyboard: { global: true },
      pictureInPicture: true,
      fullscreen: true,
      icons: {
        volume: [publicIcons.volumeLarge, publicIcons.volumeMuted],
        pip: [publicIcons.pipIcon, publicIcons.pipIconExit],
        setting: publicIcons.setting,
        fullscreen: [publicIcons.fullscreen, publicIcons.exitFullscreen],
        play: publicIcons.play,
        pause: publicIcons.pause,
      },
    }
  };
  publicListener: { [key: string]: any } = {
    timeUpdate: () => {},
    sendDanmu: () => {},
    playrateUpdate: () => {},
    volumeUpdate: () => {},
    mutedUpdate: () => {},
  };

  barrage = (comments: any, url: string, id: string) => {
    if (!this.player) return;
    comments = comments.map((item) => ({
      text: item.text,
      time: item.time,
      mode: (() => {
        switch (item.mode) {
          case 'left':
            return 'ltl';
          case 'top':
            return 'top';
          case 'bottom':
            return 'bottom';
          case 'scroll':
          case 'right':
          default:
            return 'rtl';
        }
      })(),
      style: {
        color: item.color,
      }
    }));

    this.publicListener.sendDanmu = (danmu) => {
      const options = {
        player: id,
        text: danmu.text,
        time: danmu.time,
        color: danmu.style.color,
        type: (() => {
          switch (danmu.mode) {
            case 'top':
              return '5';
            case 'bottom':
              return '4';
            case 'rtl':
            case 'ltl':
            default:
              return '0';
          }
        })(),
      };
      publicBarrageSend(url, options);
    };
    this.player.context.danmaku.options.onEmit = (comment) => {
      this.publicListener.sendDanmu(comment);
    };
    this.player.context.danmaku.changeSource([...comments]);
  };

  create = (options: any): OPlayer => {
    const defaultOpt = { ...this.options.conf };
    const defaultUi = { ...this.options.ui };
    defaultOpt.source.src = options.url;
    switch (options.type) {
      case 'customFlv':
        defaultOpt.source.format = 'flv';
        break;
      case 'customHls':
        defaultOpt.source.format = 'hls';
        break;
      case 'customDash':
        defaultOpt.source.format = 'dash';
        break;
      case 'customWebTorrent':
        defaultOpt.source.format = 'torrent';
        break;
      case 'customMp4':
      default:
        defaultOpt.source.forma = 'auto';
        break;
    }
    // 直播
    defaultUi.isLive = options.isLive || false;
    // 音量
    defaultOpt.volume =
      playerStorage.get('volume') === null || playerStorage.get('volume') === undefined
        ? 1
        : playerStorage.get('volume');
    defaultOpt.muted = playerStorage.get('muted') || false;
    // 倍速
    defaultOpt.playbackRate = playerStorage.get('playrate') || 1;
    // 清晰度
    if (options.quality && Array.isArray(options.quality) && options.quality.length > 0) {
      const quality = options.quality.map(item => {
        return { name: item.name, value: item.url };
      });
      quality[0].default = true;
      defaultUi.menu = [
        {
          name: 'Quality(清晰度)',
          key: 'Quality',
          position: 'bottom',
          children: quality,
          onChange({ value }) {
            player.changeQuality({ src: value })
          }
        }
      ];
    };
    // 下一集
    if (options.next) {
      defaultUi.icons.next = publicIcons.playNext;
    } else {
      defaultUi.icons.next = null;
    };

    const plugins = [
      {
        key: 'next',
        name: 'oplayer-plugin-next',
        apply(player) {
          player.locales.update({
            en: { Next: 'Next', Heatmap: 'Heatmap' },
            'zh-CN': { Next: '下一集', Heatmap: '热力图' },
          });
          player.on(['next'], () => {
            emitter.emit('nextVideo');
          });
          return player;
        }
      },
      OUI({ ...defaultUi }),
      new ODanmaku({ enable: true, displaySender: false, heatmap: false, source: [] }),
      OHls({
        config : {
          xhrSetup(xhr) {
            const headers = options.headers || {};
            for (const key in headers || {}) {
              xhr.setRequestHeader(key, headers[key]);
            }
          }
        }
      }),
      ODash(),
      OMpegts(),
      // OTorrent({ library: 'https://cdn.jsdelivr.net/npm/webtorrent@0.98.18/webtorrent.min.js' })
    ];
    let player: OPlayer;
    player = OPlayer.make(`#${options.container}`, { ...defaultOpt }).use(plugins).create();
    // @ts-ignore
    player.storage = playerStorage;

    player.once('ready', () => {
      const startTime = options?.startTime || 0;
      if (!options.isLive && startTime && startTime > 0) player.seek = startTime;
    });

    this.publicListener.playrateUpdate = () => {
      // @ts-ignore
      if (!player.isSourceChanging) player.storage.set('playrate', player.playbackRate);
    };
    player.on('ratechange',this.publicListener.playrateUpdate);

    this.publicListener.volumeUpdate = () => {
      // @ts-ignore
      player.storage.set('volume', player.volume);
      // @ts-ignore
      player.storage.set('muted', player.isMuted);
    };
    player.on('volumechange', this.publicListener.volumeUpdate);

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

  playNext = ( options: any) => {
    if (!this.player) return;
    const config = { src: options.url, format: 'auto' };
    switch (options.type) {
      case 'customFlv':
        config.format = 'flv';
        break;
      case 'customHls':
        config.format = 'hls';
        break;
      case 'customDash':
        config.format = 'dash';
        break;
      case 'customWebTorrent':
        config.format = 'torrent';
        break;
      case 'customMp4':
      default:
        config.format = 'auto';
        break;
    }
    this.player.changeSource({ ...config }, true);
  };

  seek = (time: number) => {
    if (!this.player) return;
    this.player.once('ready', () => {
      this.player!.seek(time);
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

  onTimeUpdate = (callback: any) => {
    if (!this.player) return;
    this.publicListener.timeUpdate = () => {
      callback({
        currentTime: this.player?.currentTime || 0,
        duration: this.player?.duration || 0,
      });
    };
    this.player.on('timeupdate', this.publicListener.timeUpdate);
  };

  offBarrage = () => {
    if (!this.player) return;
    // @ts-ignore
    this.player.off('artplayerPluginDanmuku:emit', this.publicListener.sendDanmu);
  };

  offTimeUpdate = () => {
    if (!this.player) return;
    this.player.off('timeupdate', this.publicListener.timeUpdate);
  };

  speed = (speed: number) => {
    if (!this.player) return;
    this.player.once('ready', () => {
      this.player!.setPlaybackRate(speed);
    });
  };

  toggle = () => {
    if (!this.player) return;
    this.player.togglePlay();
  };

  volume = (volume: number) => {
    if (!this.player) return;
    this.player.setVolume(volume);
  };
}

export default OPlayerAdapter;
