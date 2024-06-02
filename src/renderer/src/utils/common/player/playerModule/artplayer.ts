import Artplayer from 'artplayer';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';

import { publicBarrageSend, publicColor, publicIcons, publicStream } from './components';

const publicListener = {
  timeUpdate: null as any,
  sendDanmu: null as any,
};

const options = {
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
  customType: {
    customHls: (video: HTMLVideoElement, url: string, art: Artplayer) => {
      art.loading.show = true;
      if (art.hls) art.hls.destroy();
      const hls = publicStream.create.customHls(video, url);
      art.hls = hls;
      art.on('destroy', () => {
        hls!.destroy();
        delete art.hls;
      });
      art.loading.show = false;
    },
    customFlv: (video: HTMLVideoElement, url: string, art: Artplayer) => {
      art.loading.show = true;
      if (art.flv) art.flv.destroy();
      const flv = publicStream.create.customFlv(video, url);
      art.flv = flv;
      art.on('destroy', () => {
        flv.destroy();
        delete art.flv;
      });
      art.loading.show = false;
    },
    customDash: (video: HTMLVideoElement, url: string, art: Artplayer) => {
      art.loading.show = true;
      if (art.mpd) art.mpd.destroy();
      const mpd = publicStream.create.customDash(video, url);
      art.mpd = mpd;
      art.on('destroy', () => {
        mpd.destroy();
        delete art.mpd;
      });
      art.loading.show = false;
    },
    customWebTorrent: (video: HTMLVideoElement, url: string, art: Artplayer) => {
      art.loading.show = true;
      if (art.torrent) art.torrent.destroy();
      const torrent = publicStream.create.customTorrent(video, url);
      art.torrent = torrent;
      art.on('destroy', () => {
        // torrent.remove(url);
        torrent.destroy();
        delete art.torrent;
      });
      art.loading.show = false;
    },
  },
};

const barrge = (player: Artplayer, comments: any, url: string, id: string) => {
  player.plugins.artplayerPluginDanmuku.config({
    danmuku: comments,
  });
  player.plugins.artplayerPluginDanmuku.load();
  publicListener.sendDanmu = (danmu: any) => {
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
  player.on('artplayerPluginDanmuku:emit', publicListener.sendDanmu);
};

const create = (options: any): Artplayer => {
  if (options.isLive) {
    delete options?.plugins;
  }

  Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2];
  return new Artplayer({ ...options });
};

const currentTime = (player: Artplayer): number => {
  return player.video.currentTime || 0;
};

const destroy = (player: Artplayer) => {
  player.destroy();
};

const duration = (player: Artplayer): number => {
  return player.video.duration || 0;
};

const pause = (player: Artplayer) => {
  player.pause();
};

const play = (player: Artplayer) => {
  player.play();
};

const playNext = (player: Artplayer, options: any) => {
  // player.switch = options.url;
  player.switchUrl(options.url);
  player.plugins.artplayerPluginDanmuku.config({
    danmuku: [],
  });
  player.plugins.artplayerPluginDanmuku.load();
};

const seek = (player: Artplayer, time: number) => {
  player.once('ready', () => {
    player.seek = time;
  });
};

const time = (player: Artplayer): { currentTime: number; duration: number } => {
  return {
    currentTime: player.video.currentTime || 0,
    duration: player.video.duration || 0,
  };
};

const onTimeUpdate = (player: Artplayer, callback: any) => {
  publicListener.timeUpdate = () => {
    callback({
      currentTime: player.video.currentTime || 0,
      duration: player.video.duration || 0,
    });
  };
  player.on('video:timeupdate', publicListener.timeUpdate);
};

const offBarrage = (player: Artplayer) => {
  // @ts-ignore
  player.off('artplayerPluginDanmuku:emit', publicListener.sendDanmu!);
};

const offTimeUpdate = (player: Artplayer) => {
  player.off('video:timeupdate', publicListener.timeUpdate!);
};

const toggle = (player: Artplayer) => {
  player.toggle();
};

const volume = (player: Artplayer, volume: number) => {
  player.volume = volume;
};

export {
  options,
  barrge,
  create,
  currentTime,
  destroy,
  duration,
  pause,
  play,
  playNext,
  seek,
  time,
  onTimeUpdate,
  offBarrage,
  offTimeUpdate,
  toggle,
  volume,
};
