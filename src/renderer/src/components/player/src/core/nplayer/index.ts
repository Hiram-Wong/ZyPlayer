import NPlayer, { EVENT as NPlayerEvent, Icon as NPlayerIcon } from 'nplayer';
import nplayerDanmaku from '@nplayer/danmaku';

import publicStream from '../../utils/media-stream';
import { publicBarrageSend, playerStorage } from '../../utils/tool';
import { publicIcons } from '../../utils/static';

import './css/index.css';

const elementDeal = {
  createIcon: (html: string, noCls = false) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    if (!noCls) div.classList.add('nplayer_icon');
    return (cls?: string) => {
      if (cls) {
        div.classList.add(cls);
      }
      return div;
    };
  },
  replace: (el: string, newEle: string) => {
    const controlSetting = document.querySelector(el);
    const prevElement = controlSetting?.previousElementSibling;
    const svgToReplace: SVGSVGElement | null | undefined = prevElement?.querySelector('svg');
    if (svgToReplace)
      svgToReplace.parentNode?.replaceChild(
        // @ts-ignore
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
  init(player: NPlayer, _: any, tooltip: string) {
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

class NPlayerAdapter {
  player: NPlayer | null = null;
  options: { [key: string]: any } = {
    container: '#nplayer',
    src: '',
    live: false,
    videoProps: { autoplay: 'true' },
    volumeVertical: true,
    bpControls: {},
    controls: [
      ['play', 'volume', 'time', 'spacer', 'danmaku-settings', 'settings', pipControl, 'fullscreen'],
      ['progress'],
    ],
    plugins: [new nplayerDanmaku({ autoInsert: false })],
  };
  publicListener: { [key: string]: any } = {
    timeUpdate: () => {},
    sendDanmu: () => {},
    playrateUpdate: () => {},
    volumeUpdate: () => {},
  };

  barrage = (comments: any, url: string, id: string) => {
    if (!this.player) return;
    comments = comments.map((item) => ({
      color: item.color,
      text: item.text,
      time: item.time,
      type: item.mode === 'top' || item.mode === 'bottom' ? item.mode : 'scroll',
      isMe: false,
      force: true,
    }));
    this.player.danmaku.resetItems(comments);
    this.publicListener.sendDanmu = (danmu: any) => {
      const options = {
        player: id,
        text: danmu.text,
        time: danmu.time,
        color: danmu.color,
        type: danmu.type,
      };
      publicBarrageSend(url, options);
    };
    this.player.on('DanmakuSend', this.publicListener.sendDanmu);
  };

  create = (options: any): NPlayer => {
    NPlayerIcon.register('play', elementDeal.createIcon(publicIcons.play));
    NPlayerIcon.register('pause', elementDeal.createIcon(publicIcons.pause));
    NPlayerIcon.register('volume', elementDeal.createIcon(publicIcons.volumeLarge));
    NPlayerIcon.register('muted', elementDeal.createIcon(publicIcons.volumeMuted));
    NPlayerIcon.register('cog', elementDeal.createIcon(publicIcons.setting));
    NPlayerIcon.register('enterFullscreen', elementDeal.createIcon(publicIcons.fullscreen));
    NPlayerIcon.register('exitFullscreen', elementDeal.createIcon(publicIcons.exitFullscreen));

    options = { ...this.options, ...options };
    options.container = `#${options.container}`;
    options.src = options.url;
    delete options.url;
    const startTime = options?.startTime || 0;
    delete options.startTime;

    if (options.isLive) {
      options.live = options.isLive;
      options.controls = [['play', 'volume', 'time', 'spacer', 'settings', 'fullscreen'], []];
      delete options?.plugins;
      delete options.isLive;
    }

    let player;
    player = new NPlayer(options);
    player.storage = playerStorage;

    const headers = options.headers || {};
    switch (options.type) {
      case 'customMp4':
        break;
      case 'customHls':
        if (player.hls) player.hls.destroy();
        const hls = publicStream.create.customHls(player.video, options.src, headers);
        player.hls = hls;
        player.on('destroy', () => hls?.destroy());
        break;
      case 'customFlv':
        if (player.flv) player.flv.destroy();
        const flv = publicStream.create.customFlv(player.video, options.src, headers);
        player.flv = flv;
        player.on('destroy', () => flv?.destroy());
        break;
      case 'customDash':
        if (player.mpd) player.mpd.destroy();
        const mpd = publicStream.create.customDash(player.video, options.src, headers);
        player.mpd = mpd;
        player.on('destroy', () => mpd?.destroy());
        break;
      case 'customWebTorrent':
        if (player.torrent) player.torrent.destroy();
        const torrent = publicStream.create.customTorrent(player.video, options.src, headers);
        player.torrent = torrent;
        player.on('destroy', () => torrent?.destroy());
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
      player.volume =
        player.storage.get('volume') === null || player.storage.get('volume') === undefined
          ? 1
          : player.storage.get('volume');
      if (!options.live && startTime && startTime > 0) {
        player.seek(startTime);
      }
    });

    this.publicListener.playrateUpdate = () => {
      player.storage.set('playrate', player.playbackRate);
    };
    player.on(NPlayerEvent.RATE_CHANGE, this.publicListener.playrateUpdate);

    this.publicListener.volumeUpdate = () => {
      player.storage.set('volume', player.volume);
      player.storage.set('muted', player.volume === 0 ? true : false);
    };
    player.on(NPlayerEvent.VOLUME_CHANGE, this.publicListener.volumeUpdate);
    this.player = player;
    return player;
  };

  currentTime = (): number => {
    if (!this.player) return 0;
    return this.player.currentTime || 0;
  };

  destroy = () => {
    if (!this.player) return;
    this.player.dispose();
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
    // @ts-ignore
    if (this.player?.hls) this.player.hls.destroy();
    // @ts-ignore
    if (this.player?.flv) this.player.flv.destroy();
    // @ts-ignore
    if (this.player?.mpd) this.player.mpd.destroy();
    // @ts-ignore
    if (this.player?.torrent) this.player.torrent.destroy();

    switch (options.type) {
      case 'customMp4':
        this.player!.video.src = options.url;
        break;
      case 'customHls':
        // @ts-ignore
        this.player.hls = publicStream.create.customHls(this.player!.video, options.url);
        break;
      case 'customFlv':
        // @ts-ignore
        this.player.flv = publicStream.create.customFlv(this.player!.video, options.url);
        break;
      case 'customDash':
        // @ts-ignore
        this.player.mpd = publicStream.create.customDash(this.player!.video, options.url);
        break;
      case 'customWebTorrent':
        // @ts-ignore
        this.player.torrent = publicStream.create.customTorrent(this.player!.video, options.url);
        break;
      default:
        break;
    }
    if (this.player?.danmaku) this.player.danmaku.clearScreen();
  };
  seek = (time: number) => {
    if (!this.player) return;
    this.player.once(NPlayerEvent.CANPLAY, () => {
      this.player?.seek(time);
    });
  };

  speed = (speed: number) => {
    if (!this.player) return;
    this.player.playbackRate = speed;
    // @ts-ignore
    this.player.settingNamedMap.speed.value = speed;
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
    this.player.on(NPlayerEvent.TIME_UPDATE, this.publicListener.timeUpdate);
  };

  offBarrage = () => {
    if (!this.player) return;
    this.player.off('DanmakuSend', this.publicListener.sendDanmu!);
  };
  offTimeUpdate = () => {
    if (!this.player) return;
    this.player.off(NPlayerEvent.TIME_UPDATE, this.publicListener.timeUpdate!);
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

export default NPlayerAdapter;
