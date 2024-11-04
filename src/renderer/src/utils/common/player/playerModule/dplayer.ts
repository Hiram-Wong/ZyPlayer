import DPlayer from 'dplayer';
import { publicIcons, publicStream, publicStorage } from './components';

const elementDeal = {
  replace: (el: string, newEle: string) => {
    const controlSetting = document.querySelector(el);
    const svgToReplace: any = controlSetting?.querySelector('svg');
    if (svgToReplace)
      svgToReplace.parentNode.replaceChild(
        document.createRange().createContextualFragment(newEle).firstChild,
        svgToReplace,
      );
  },
  add: (el: string, newEle: string) => {
    const controlSetting = document.querySelector(el);
    controlSetting!.insertAdjacentHTML('afterend', newEle);
  },
};
class CustomDPlayer extends DPlayer {
  instances: any[] = [];
  constructor(options) {
    super(options); // 调用DPlayer构造函数初始化实例
    this.instances.push(this);
  }

  destroy() {
    const self: any = this;
    this.instances.splice(this.instances.indexOf(self), 1);
    self.pause();
    document.removeEventListener('click', self.docClickFun, true);
    self.container.removeEventListener('click', self.containerClickFun, true);
    self.fullScreen.destroy();
    self.hotkey.destroy();
    self.contextmenu.destroy();
    self.controller.destroy();
    self.timer.destroy();
    // self.video.src = ''; // 此行代码会引起始终触发倍速为1
    self.container.innerHTML = '';
    self.events.trigger('destroy');
  }

  /**
   * 扩展的off方法，用于移除事件监听器。
   * 如果没有提供回调函数，则清空该事件类型的所有监听器；
   * 如果提供了回调函数，则仅移除与之匹配的监听器。
   *
   * @param {string} name - 事件名称。
   * @param {Function} [callback] - 要移除的事件处理函数。
   * @returns {CustomDPlayer} 返回当前实例，支持链式调用。
   */
  off(name: string, callback?: Function) {
    // @ts-ignore 获取或初始化events.events对象, 用于存储事件监听器
    const e = this.events.events || (this.events.events = {});
    // 获取特定事件名称下的所有监听器
    const evts = e[name];
    // 创建一个新数组，用于存放那些不符合移除条件的监听器
    const liveEvents: any = [];

    // 如果存在事件监听器且指定了回调函数
    if (evts && callback) {
      // 遍历当前事件名称下的所有监听器
      for (let i = 0, len = evts.length; i < len; i += 1) {
        // 如果当前监听器的函数与要移除的函数不匹配[考虑直接引用和_.once包裹的情况]
        if (evts[i] !== callback) {
          liveEvents.push(evts[i]); // 保留该监听器
        }
      }
    }

    // 如果有监听器存活下来，更新events.events[name]
    if (liveEvents.length) {
      e[name] = liveEvents;
    } else {
      // 否则，没有匹配的监听器，直接删除该事件类型
      delete e[name];
    }

    // 返回当前实例，便于链式调用
    return this;
  }

  /**
   * 扩展的once方法，用于监听单次事件监听器。
   *
   * @param {string} name - 事件名称。
   * @param {Function} [callback] - 要监听单次的事件处理函数。
   * @returns {CustomDPlayer} 返回当前实例，支持链式调用。
   */
  once(name: string, callback?: Function) {
    const self = this;
    function listener(...args) {
      setTimeout(() => {
        self.off(name, listener);
      }, 0); // 必须上定时器，不然报错
      if (callback) callback.apply(self, args);
    }

    // @ts-ignore
    self.events.on(name, listener);
    return this;
  }

  /**
   * 扩展的静音方法。
   * @param status true为静音，false为取消静音
   * @returns
   */
  muted(status: boolean) {
    if (typeof status === 'boolean') {
      this.video.muted = status;
      this.switchVolumeIcon();
    }
    return this.video.muted;
  }
}

class DPlayerAdapter {
  player: CustomDPlayer | DPlayer | null = null;
  options: { [key: string]: any } = {
    container: document.getElementById('dplayer'),
    autoplay: true,
    screenshot: false,
    live: false,
    video: {
      url: '',
      type: '',
      customType: {
        customHls: (video: HTMLVideoElement, dp: DPlayer) => {
          if (dp.hls) publicStream.destroy.customHls(dp);
          const hls = publicStream.create.customHls(video, video.src);
          dp.hls = hls;
          dp.on('destroy', () => {
            publicStream.destroy.customHls(dp);
          });
        },
        customFlv: (video: HTMLVideoElement, dp: DPlayer) => {
          if (dp.flv) publicStream.destroy.customFlv(dp);
          const flv = publicStream.create.customFlv(video, video.src);
          dp.flv = flv;
          dp.on('destroy', () => {
            publicStream.destroy.customFlv(dp);
          });
        },
        customDash: (video: HTMLVideoElement, dp: DPlayer) => {
          if (dp.mpd) publicStream.destroy.customDash(dp);
          const mpd = publicStream.create.customDash(video, video.src);
          dp.mpd = mpd;
          dp.on('destroy', () => {
            publicStream.destroy.customDash(dp);
          });
        },
        customWebTorrent: (video: HTMLVideoElement, dp: DPlayer) => {
          if (dp.torrent) publicStream.destroy.customTorrent(dp);
          const torrent = publicStream.create.customTorrent(video, video.src);
          dp.torrent = torrent;
          dp.on('destroy', () => {
            publicStream.destroy.customTorrent(dp);
          });
        },
      },
    },
    danmaku: {
      id: '', //必填，视频id, 用于下面api请求时使用
      api: 'http://127.0.0.1:9978/api/v1/barrge/', //必填,后台提供
      addition: [], //可选，额外的弹幕
      user: 'ZyPlayer', //弹幕作者
      bottom: '15%',
      unlimited: false,
    },
  };
  publicListener: { [key: string]: any } = {
    timeUpdate: () => {},
    sendDanmu: () => {},
    playrateUpdate: () => {},
    volumeUpdate: () => {},
  };

  barrge = (player: any, comments: any, _url: string, _id: string) => {
    const video = player.options.video;
    let danmaku: any = player.options.danmaku;
    danmaku.id = comments;
    const { currentTime, playbackRate } = player.video;
    player.switchVideo({ ...video }, { ...danmaku });
    if (currentTime) player.seek(currentTime);
    if (playbackRate !== 1) player.speed(playbackRate);
  };

  create = (options: any): any => {
    options = { ...this.options, ...options };
    options.container = document.getElementById(options.container);
    options.video.url = options.url;
    delete options.url;
    options.video.type = options.type;
    delete options.type;
    if (options.isLive) {
      options.live = options.isLive;
      delete options?.danmaku;
      delete options.isLive;
    }
    const startTime = options?.startTime || 0;
    delete options.startTime;

    const player: any = new CustomDPlayer({ ...options });
    player.storage = new publicStorage('player_settings');

    // 元素替换，原生太丑
    elementDeal.replace('.dplayer-comment-icon', publicIcons.danmu);
    elementDeal.replace('.dplayer-setting-icon', publicIcons.setting);
    elementDeal.replace('.dplayer-full-icon', publicIcons.fullscreen);
    elementDeal.add(
      '.dplayer-setting',
      `
      <button
        class="dplayer-icon dplayer-pip-icon"
        data-balloon="画中画"
        data-balloon-pos="up"
        style="padding: 7px 8px"
      >
        ${publicIcons.pipIcon}
      </button>
    `,
    );
    if (!options.live) {
      elementDeal.add(
        '.dplayer-setting',
        `
      <div class="dplayer-subtitle-btn">
        <button class="dplayer-icon dplayer-subtitle-icon" data-balloon="${player.template.showDanmakuToggle.checked ? '显示弹幕' : '关闭弹幕'}" data-balloon-pos="up">
          <span class="dplayer-icon-content" style="">
            ${player.template.showDanmakuToggle.checked ? publicIcons.openDanmu : publicIcons.closeDanmu}
          </span>
        </button>
      </div>
    `,
      );
    }

    // 弹幕事件处理
    const handleDanmuClick = () => {
      let showDanmaku: any = document.querySelector('.dplayer-setting-showdan');
      (player.template.showDanmakuToggle.checked = !player.template.showDanmakuToggle.checked),
        player.template.showDanmakuToggle.checked
          ? ((showDanmaku = !0),
            player.danmaku.show(),
            elementDeal.replace('.dplayer-subtitle-icon', publicIcons.openDanmu))
          : ((showDanmaku = !1),
            player.danmaku.hide(),
            elementDeal.replace('.dplayer-subtitle-icon', publicIcons.closeDanmu)),
        player.user.set('danmaku', showDanmaku ? 1 : 0);
    };

    const handlePipClick = () => {
      const videoElement: HTMLVideoElement | null = document.querySelector('.dplayer-video');
      try {
        videoElement !== document.pictureInPictureElement
          ? videoElement!.requestPictureInPicture()
          : document.exitPictureInPicture();
      } catch (error) {
        console.error(error);
      }
    };

    const pipButton = document.querySelector('.dplayer-pip-icon');
    if (pipButton) pipButton.addEventListener('click', handlePipClick);
    const danmuButton = document.querySelector('.dplayer-subtitle-icon');
    if (danmuButton) danmuButton.addEventListener('click', handleDanmuClick);

    player.once('canplay', () => {
      if (!options.live) player.speed(player.storage.get('playrate') || 1);
      const volume =
        player.storage.get('volume') === null || player.storage.get('volume') === undefined
          ? 1
          : player.storage.get('volume');
      player.volume(volume, true, false);
      player.muted(player.storage.get('muted') || false); // 必须在volume之后设置,不然会被覆盖

      if (!options.live && startTime && startTime > 0) player.seek(startTime);
    });

    this.publicListener.playrateUpdate = () => {
      player.storage.set('playrate', player.video.playbackRate);
    };
    player.on('ratechange', this.publicListener.playrateUpdate);

    this.publicListener.volumeUpdate = () => {
      player.storage.set('volume', player.video.volume);
      player.storage.set('muted', player.video.muted);
    };
    player.on('volumechange', this.publicListener.volumeUpdate);
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

  playNext = (options: any) => {
    if (!this.player) return;
    const { playbackRate } = this.player.video;
    if (options.type === 'customFlv') {
      publicStream.destroy.customFlv(this.player);
    } // 重要
    this.player.switchVideo({ ...options });
    this.player.options.video.url = options.url;
    if (this.player?.danmaku) this.player.danmaku.clear();
    if (playbackRate !== 1) this.player.speed(playbackRate);
    this.player.play();
  };

  seek = (time: number) => {
    if (!this.player) return;
    this.player.seek(time);
  };
  speed = (time: number) => {
    if (!this.player) return;
    this.player.speed(time);
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
      if (this.player?.video) {
        callback({
          currentTime: this.player.video.currentTime || 0,
          duration: this.player.video.duration || 0,
        });
      } else callback({ currentTime: null, duration: null });
    };
    this.player.on('timeupdate', this.publicListener.timeUpdate);
  };

  offBarrage = (_player: any) => {
    // 弹幕组件会直接提交后端
  };

  offTimeUpdate = () => {
    if (!this.player) return;
    this.player.off('timeupdate', this.publicListener.timeUpdate);
  };

  toggle = () => {
    if (!this.player) return;
    this.player.toggle();
  };

  volume = (volume: number) => {
    if (!this.player) return;
    this.player.volume(volume, true, false);
  };
}

export default DPlayerAdapter;
