import NPlayer, { EVENT as NPlayerEvent, Icon as NPlayerIcon } from 'nplayer';
import nplayerDanmaku from '@nplayer/danmaku';

import { publicIcons, publicBarrageSend, publicStream } from './components';

const publicListener = {
  timeUpdate: null as any,
  sendDanmu: null as any,
};

const elementDeal = {
  createIcon: (html, noCls = false) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    if (!noCls) div.classList.add('nplayer_icon');
    return (cls) => {
      if (cls) {
        div.classList.add(cls);
      }
      return div;
    };
  },
  replace: (el: string, newEle: string) => {
    const controlSetting = document.querySelector(el);
    const prevElement = controlSetting?.previousElementSibling;
    const svgToReplace: any = prevElement?.querySelector('svg');
    if (svgToReplace)
      svgToReplace.parentNode.replaceChild(
        document.createRange().createContextualFragment(newEle).firstChild,
        svgToReplace,
      );
  },
};

const options = {
  container: document.getElementById('nplayer'),
  src: '',
  live: false,
  videoProps: { autoplay: 'true' },
  bpControls: {
    500: [['play', 'volume', 'time', 'spacer', 'settings', 'fullscreen'], ['progress']],
  },
  controls: [['play', 'volume', 'time', 'spacer', 'settings', 'fullscreen'], ['progress']],
  plugins: [new nplayerDanmaku({ autoInsert: true })],
};

const barrge = (player: NPlayer, comments: any, url: string, id: string) => {
  player.danmaku.resetItems(comments);
  publicListener.sendDanmu = (danmu: any) => {
    const options = {
      player: id,
      text: danmu.text,
      time: danmu.time,
      color: danmu.color,
      type: danmu.type,
    };
    publicBarrageSend(url, options);
  };
  player.on('DanmakuSend', publicListener.sendDanmu);
};

const create = (options: any): NPlayer => {
  NPlayerIcon.register('play', elementDeal.createIcon(publicIcons.play));
  NPlayerIcon.register('pause', elementDeal.createIcon(publicIcons.pause));
  NPlayerIcon.register('volume', elementDeal.createIcon(publicIcons.volumeLarge));
  NPlayerIcon.register('muted', elementDeal.createIcon(publicIcons.volumeMuted));
  NPlayerIcon.register('cog', elementDeal.createIcon(publicIcons.setting));
  NPlayerIcon.register('enterFullscreen', elementDeal.createIcon(publicIcons.fullscreen));
  NPlayerIcon.register('exitFullscreen', elementDeal.createIcon(publicIcons.exitFullscreen));

  const player: any = new NPlayer({ ...options });
  switch (options.type) {
    case 'customMp4':
      // player.src = options.src;
      break;
    case 'customFlv':
      if (player.flv) player.flv.destroy();
      const flv = publicStream.create.customFlv(player.video, options.src);
      player.flv = flv;
      player.on('destroy', () => flv.destroy());
      break;
    case 'customHls':
      if (player.hls) player.hls.destroy();
      const hls = publicStream.create.customHls(player.video, options.src);
      player.hls = hls;
      player.on('destroy', () => hls!.destroy());
      break;
    case 'customDash':
      if (player.mpd) player.mpd.destroy();
      const mpd = publicStream.create.customDash(player.video, options.src);
      player.mpd = mpd;
      player.on('destroy', () => mpd.destroy());
      break;
    case 'customWebTorrent':
      if (player.torrent) player.torrent.destroy();
      const torrent = publicStream.create.customTorrent(player.video, options.src);
      player.torrent = torrent;
      player.on('destroy', () => torrent.destroy());
      break;
    default:
      break;
  }
  player.mount(options.container); // bug container参数不生效只能使用 mount 挂载

  // 元素替换，原生太丑
  elementDeal.replace('.nplayer_control_setting', `<div class="nplayer_icon">${publicIcons.danmu}</div>`);

  return player;
};

const currentTime = (player: NPlayer): number => {
  return player.currentTime || 0;
};

const destroy = (player: NPlayer) => {
  player.dispose();
};

const duration = (player: NPlayer): number => {
  return player.duration || 0;
};

const pause = (player: NPlayer) => {
  player.pause();
};

const play = (player: NPlayer) => {
  player.play();
};

const playNext = (player: any, options: any) => {
  if (player?.hls) publicStream.destroy.customHls(player);
  if (player?.flv) publicStream.destroy.customFlv(player);
  if (player?.mpd) publicStream.destroy.customDash(player);
  if (player?.torrent) publicStream.destroy.customTorrent(player);

  switch (options.type) {
    case 'customMp4':
      player.video.src = options.url;
      break;
    case 'customHls':
      player.hls = publicStream.create.customHls(player.video, options.url);
      break;
    case 'customFlv':
      player.flv = publicStream.create.customFlv(player.video, options.url);
      break;
    case 'customDash':
      player.mpd = publicStream.create.customDash(player.video, options.url);
      break;
    case 'customWebTorrent':
      player.torrent = publicStream.create.customTorrent(player.video, options.url);
      break;
    default:
      break;
  }
  player.danmaku.clearScreen();
};
const seek = (player: NPlayer, time: number) => {
  player.once(NPlayerEvent.CANPLAY, () => {
    player.seek(time);
  });
};
const time = (player: NPlayer): { currentTime: number; duration: number } => {
  return {
    currentTime: player.currentTime || 0,
    duration: player.duration || 0,
  };
};

const onTimeUpdate = (player: NPlayer, callback: any) => {
  publicListener.timeUpdate = () => {
    callback({
      currentTime: player.currentTime || 0,
      duration: player.duration || 0,
    });
  };
  player.on(NPlayerEvent.TIME_UPDATE, publicListener.timeUpdate);
};

const offBarrage = (player: NPlayer) => {
  player.off('DanmakuSend', publicListener.sendDanmu!);
};
const offTimeUpdate = (player: NPlayer) => {
  player.off(NPlayerEvent.TIME_UPDATE, publicListener.timeUpdate!);
};

const toggle = (player: NPlayer) => {
  player.toggle();
};

const volume = (player: NPlayer, volume: number) => {
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
