import NPlayer, { EVENT as NPlayerEvent, Icon as NPlayerIcon } from 'nplayer';
import nplayerDanmaku from '@nplayer/danmaku';

import { publicIcons, publicBarrageSend, publicStream, publicStorage } from './components';

const publicListener = {
  timeUpdate: null as any,
  sendDanmu: null as any,
  playrateUpdate: null as any,
  volumeUpdate: null as any,
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

const pipControl = {
  el: document.createElement('div'),
  id: 'pip',
  pipIcon: publicIcons.pipIcon,
  tooltip: '画中画' as any,
  handlePip() {},
  init(player, _: any, tooltip) {
    this.el.id = 'pip';
    const pipDom = document.createElement('div');
    pipDom.className = 'nplayer_icon';
    pipDom.innerHTML = `${this.pipIcon}`;

    this.tooltip = tooltip;
    this.tooltip.html = '画中画';
    this.el.append(pipDom);

    this.handlePip = () => {
      if (!player.loaded) return;
      if ((document as any).pictureInPictureElement !== player.video) {
        (player.video as any).requestPictureInPicture();
      } else {
        (document as any).exitPictureInPicture();
      }
    };

    this.el.addEventListener('click', this.handlePip);
  },
  dispose() {
    this.el.removeEventListener('click', this.handlePip);
    this.el?.remove();
  },
};

const options = {
  container: '#nplayer',
  src: '',
  live: false,
  videoProps: { autoplay: 'true' },
  volumeVertical: true,
  bpControls: {},
  controls: [['play', 'volume', 'time', 'spacer', 'danmaku-settings', 'settings', 'fullscreen'], ['progress']],
  plugins: [new nplayerDanmaku({ autoInsert: false })],
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

  if (options.live) {
    options.controls = [['play', 'volume', 'time', 'spacer', 'settings', 'fullscreen'], []];
    delete options?.plugins;
  }

  const player: any = new NPlayer(options);
  player.storage = new publicStorage('nplayer_settings');

  switch (options.type) {
    case 'customMp4':
      break;
    case 'customHls':
      if (player.hls) publicStream.destroy.customHls(player);
      const hls = publicStream.create.customHls(player.video, options.src);
      player.hls = hls;
      player.on('destroy', () => publicStream.destroy.customHls(player));
      break;
    case 'customFlv':
      if (player.flv) publicStream.destroy.customFlv(player);
      const flv = publicStream.create.customFlv(player.video, options.src);
      player.flv = flv;
      player.on('destroy', () => publicStream.destroy.customFlv(player));
      break;
    case 'customDash':
      if (player.mpd) publicStream.destroy.customDash(player);
      const mpd = publicStream.create.customDash(player.video, options.src);
      player.mpd = mpd;
      player.on('destroy', () => publicStream.destroy.customDash(player));
      break;
    case 'customWebTorrent':
      if (player.torrent) publicStream.destroy.customTorrent(player);
      const torrent = publicStream.create.customTorrent(player.video, options.src);
      player.torrent = torrent;
      player.on('destroy', publicStream.destroy.customTorrent(player));
      break;
    default:
      break;
  }
  player.mount(options.container); // bug container参数不生效只能使用 mount 挂载

  // 元素替换，原生太丑
  elementDeal.replace('.nplayer_control_setting', `<div class="nplayer_icon">${publicIcons.danmu}</div>`);

  player.once(NPlayerEvent.CANPLAY, () => {
    player.settingNamedMap.speed.options = [
      {
        value: 0.5,
        html: '0.5',
      },
      {
        value: 0.75,
        html: '0.75',
      },
      {
        value: 1,
        html: '正常',
      },
      {
        value: 1.25,
        html: '1.25',
      },
      {
        value: 1.5,
        html: '1.5',
      },
      {
        value: 2,
        html: '2',
      },
    ];
    if (!options.live) {
      const speed = player.storage.get('playrate') || 1;
      player.playbackRate = speed;
      player.settingNamedMap.speed.value = speed;
    }
  });

  publicListener.playrateUpdate = () => {
    player.storage.set('playrate', player.playbackRate);
  };
  player.on(NPlayerEvent.RATE_CHANGE, publicListener.playrateUpdate);

  publicListener.volumeUpdate = () => {
    player.storage.set('volume', player.volume);
  };
  player.on(NPlayerEvent.VOLUME_CHANGE, publicListener.volumeUpdate);

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
  if (player?.danmaku) player.danmaku.clearScreen();
};
const seek = (player: NPlayer, time: number) => {
  player.once(NPlayerEvent.CANPLAY, () => {
    player.seek(time);
  });
};

const speed = (player: NPlayer, speed: number) => {
  player.playbackRate = speed;
  // @ts-ignore
  player.settingNamedMap.speed.value = speed;
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
  speed,
  time,
  onTimeUpdate,
  offBarrage,
  offTimeUpdate,
  toggle,
  volume,
};
