import Artplayer from 'artplayer';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';
import { publicBarrageSend, publicColor, publicIcons, publicStream, publicStorage } from './components';

class ArtPlayerAdapter {
  player: Artplayer | null = null;
  options: { [key: string]: any } = {
    container: document.getElementById('artplayer'),
    url: '',
    type: '',
    theme: publicColor.theme,
    autoplay: true,
    playbackRate: true,
    fullscreen: true,
    pip: true,
    setting: true,
    flip: true,
    hotkey: true,
    isLive: false,
    aspectRatio: true,
    plugins: [
      artplayerPluginDanmuku({
        speed: 5,
        danmuku: [],
        // useWorker: true, // 5.0.1 版本参数
        synchronousPlayback: true, // 5.1.0 版本参数
        emitter: false, // 5.1.0 版本参数
      }),
    ],
    icons: {
      play: publicIcons.play,
      pause: publicIcons.pause,
      volume: publicIcons.volumeLarge,
      volumeClose: publicIcons.volumeMuted,
      pip: publicIcons.pipIcon,
      fullscreenOn: publicIcons.fullscreen,
      fullscreenOff: publicIcons.exitFullscreen,
      setting: publicIcons.setting,
    },
    cssVar: {
      '--art-control-height': '40px',
      '--art-control-icon-size': '20px',
      '--art-control-icon-scale': '1',
    },
    customType: {
      customHls: (video: HTMLVideoElement, url: string, art: Artplayer) => {
        art.loading.show = true;
        if (art.hls) publicStream.destroy.customHls(art);
        // @ts-ignore
        const headers = art.option.headers || {};
        const hls = publicStream.create.customHls(video, url, headers);
        art.hls = hls;
        art.on('destroy', () => {
          publicStream.destroy.customHls(art);
        });
        art.loading.show = false;
      },
      customFlv: (video: HTMLVideoElement, url: string, art: Artplayer) => {
        art.loading.show = true;
        if (art.flv) publicStream.destroy.customFlv(art);
        // @ts-ignore
        const headers = art.option.headers || {};
        const flv = publicStream.create.customFlv(video, url, headers);
        art.flv = flv;
        art.on('destroy', () => {
          publicStream.destroy.customFlv(art);
        });
        art.loading.show = false;
      },
      customDash: (video: HTMLVideoElement, url: string, art: Artplayer) => {
        art.loading.show = true;
        if (art.mpd) publicStream.destroy.customDash(art);
        // @ts-ignore
        const headers = art.option.headers || {};
        const mpd = publicStream.create.customDash(video, url, headers);
        art.mpd = mpd;
        art.on('destroy', () => {
          publicStream.destroy.customDash(art);
        });
        art.loading.show = false;
      },
      customWebTorrent: (video: HTMLVideoElement, url: string, art: Artplayer) => {
        art.loading.show = true;
        if (art.torrent) publicStream.destroy.customTorrent(art);
        // @ts-ignore
        const headers = art.option.headers || {};
        const torrent = publicStream.create.customTorrent(video, url, headers);
        art.torrent = torrent;
        art.on('destroy', () => {
          publicStream.destroy.customTorrent(art);
        });
        art.loading.show = false;
      },
    },
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
      color: item.color,
      text: item.text,
      time: item.time,
      mode: item.mode === 'scroll' ? 1 : 0,
      border: false,
    }));
    this.player.plugins.artplayerPluginDanmuku.config({
      danmuku: comments,
    });
    this.player.plugins.artplayerPluginDanmuku.load();
    this.publicListener.sendDanmu = (danmu: any) => {
      const options = {
        player: id,
        text: danmu.text,
        time: danmu.time,
        color: danmu.color,
        type: danmu.mode == 1 ? '5' : '0',
      };
      publicBarrageSend(url, options);
    };
    // @ts-ignore
    this.player.on('artplayerPluginDanmuku:emit', this.publicListener.sendDanmu);
  };

  create = (options: any): Artplayer => {
    options = { ...this.options, ...options };
    options.container = `#${options.container}`;
    if (options.isLive) {
      delete options?.plugins;
    }
    const startTime = options?.startTime || 0;
    delete options.startTime;

    Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let player;
    player = new Artplayer({ ...options });
    player.storage = new publicStorage('player_settings');

    player.once('ready', () => {
      if (!options.isLive) player.playbackRate = player.storage.get('playrate') || 1;
      player.muted = player.storage.get('muted') || false;
      player.volume =
        player.storage.get('volume') === null || player.storage.get('volume') === undefined
          ? 1
          : player.storage.get('volume');
      if (!options.isLive && startTime && startTime > 0) player.seek = startTime;
    });

    this.publicListener.playrateUpdate = () => {
      player.storage.set('playrate', player.playbackRate);
    };
    player.on('video:ratechange', this.publicListener.playrateUpdate);

    this.publicListener.volumeUpdate = () => {
      player.storage.set('volume', player.volume);
    };
    player.on('video:volumechange', this.publicListener.volumeUpdate);
    this.publicListener.mutedUpdate = (state) => {
      player.storage.set('muted', state);
    };
    player.on('muted', this.publicListener.mutedUpdate);
    this.player = player;
    return player;
  };

  currentTime = (): number => {
    if (!this.player) return 0;
    return this.player.video.currentTime || 0;
  };

  destroy = () => {
    if (!this.player) return;
    this.player.destroy();
  };

  duration = (): number => {
    if (!this.player) return 0;
    return this.player.video.duration || 0;
  };

  pause = () => {
    if (!this.player) return;
    this.player.pause();
  };

  play = () => {
    if (!this.player) return;
    this.player.play();
  };

  playNext = (player: Artplayer, options: any) => {
    // player.switch = options.url;
    player.switchUrl(options.url);
    if (player.plugins?.artplayerPluginDanmuku) {
      player.plugins.artplayerPluginDanmuku.config({
        danmuku: [],
      });
      player.plugins.artplayerPluginDanmuku.load();
    }
  };

  seek = (time: number) => {
    if (!this.player) return;
    this.player.once('ready', () => {
      this.player!.seek = time;
    });
  };

  time = (): { currentTime: number; duration: number } => {
    if (!this.player)
      return {
        currentTime: 0,
        duration: 0,
      };
    return {
      currentTime: this.player.video.currentTime || 0,
      duration: this.player.video.duration || 0,
    };
  };

  onTimeUpdate = (callback: any) => {
    if (!this.player) return;
    this.publicListener.timeUpdate = () => {
      callback({
        currentTime: this.player?.video.currentTime || 0,
        duration: this.player?.video.duration || 0,
      });
    };
    this.player.on('video:timeupdate', this.publicListener.timeUpdate);
  };

  offBarrage = () => {
    if (!this.player) return;
    // @ts-ignore
    this.player.off('artplayerPluginDanmuku:emit', this.publicListener.sendDanmu);
  };

  offTimeUpdate = () => {
    if (!this.player) return;
    this.player.off('video:timeupdate', this.publicListener.timeUpdate);
  };

  speed = (speed: number) => {
    if (!this.player) return;
    this.player.once('ready', () => {
      this.player!.playbackRate = speed;
    });
  };

  toggle = () => {
    if (!this.player) return;
    this.player.toggle();
  };

  volume = (volume: number) => {
    if (!this.player) return;
    this.player.volume = volume;
  };
}

export default ArtPlayerAdapter;
