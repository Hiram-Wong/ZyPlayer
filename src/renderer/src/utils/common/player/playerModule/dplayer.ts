import DPlayer from 'dplayer';

import { publicIcons, publicStream } from './components';

const publicListener = {
  timeUpdate: null as any,
  sendDanmu: null as any,
};

const options = {
  container: document.getElementById('dplayer'),
  autoplay: true,
  screenshot: false,
  live: false,
  video: {
    url: '',
    type: '',
    customType: {
      customHls: (video: HTMLVideoElement, dp: DPlayer) => {
        const hls = publicStream.create.customHls(video, video.src);
        dp.hls = hls;
        dp.on('destroy', () => {
          hls!.destroy();
          delete dp.hls;
        });
      },
      customFlv: (video: HTMLVideoElement, dp: DPlayer) => {
        if (dp.flv) dp.flv.destroy();
        const flv = publicStream.create.customFlv(video, video.src);
        dp.flv = flv;
        dp.on('destroy', () => {
          flv.destroy();
          delete dp.flv;
        });
      },
      customDash: (video: HTMLVideoElement, dp: DPlayer) => {
        if (dp.mpd) dp.mpd.destroy();
        const mpd = publicStream.create.customDash(video, video.src);
        dp.mpd = mpd;
        dp.on('destroy', () => {
          mpd.destroy();
          delete dp.mpd;
        });
      },
      customWebTorrent: (video: HTMLVideoElement, dp: DPlayer) => {
        if (dp.torrent) dp.torrent.destroy();
        const torrent = publicStream.create.customTorrent(video, video.src);
        dp.torrent = torrent;
        dp.on('destroy', () => {
          // torrent.remove(video.src);
          torrent.destroy();
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

class CustomDPlayer extends DPlayer {
  constructor(options) {
    super(options); // 调用DPlayer构造函数初始化实例
  }

  /**
   * 扩展的off方法，用于移除事件监听器。
   * 如果没有提供回调函数，则清空该事件类型的所有监听器；
   * 如果提供了回调函数，则仅移除与之匹配的监听器。
   *
   * @param {string} name - 事件名称。
   * @param {Function|undefined} [callback] - 要移除的事件处理函数。默认为undefined，表示移除所有同名事件监听器。
   * @returns {CustomDPlayer} 返回当前实例，支持链式调用。
   */
  off(name: string, callback: Function | undefined = undefined) {
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
}

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

const barrge = (player: any, comments: any, _url: string, _id: string) => {
  const video = player.options.video;
  let danmaku: any = player.options.danmaku;
  danmaku.id = comments;
  const { currentTime, playbackRate } = player.video;
  player.switchVideo({ ...video }, { ...danmaku });
  if (currentTime) player.seek(currentTime);
  if (playbackRate !== 1) player.speed(playbackRate);
};

const create = (options: any): any => {
  const player: any = new CustomDPlayer({ ...options });
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
  return player;
};

const currentTime = (player: DPlayer): number => {
  return player.video.currentTime || 0;
};

const destroy = (player: any) => {
  player.destroy();
};

const duration = (player: DPlayer): number => {
  return player.video.duration || 0;
};

const pause = (player: DPlayer) => {
  player.pause();
};

const play = (player: DPlayer) => {
  player.play();
};

const playNext = (player: DPlayer, options: any) => {
  const { playbackRate } = player.video;
  player.switchVideo({ ...options });
  player.options.video.url = options.url;
  player.danmaku.clear();
  if (playbackRate !== 1) player.speed(playbackRate);
  player.play();
};

const seek = (player: any, time: number) => {
  player.seek(time);
};
const speed = (player: DPlayer, time: number) => {
  player.speed(time);
};

const time = (player: DPlayer): { currentTime: number; duration: number } => {
  return {
    currentTime: player.video.currentTime || 0,
    duration: player.video.duration || 0,
  };
};

const onTimeUpdate = (player: DPlayer, callback: any) => {
  publicListener.timeUpdate = () => {
    if (player?.video) {
      callback({
        currentTime: player.video.currentTime || 0,
        duration: player.video.duration || 0,
      });
    } else callback({ currentTime: null, duration: null });
  };
  player.on('timeupdate', publicListener.timeUpdate);
};

const offBarrage = (_player: any) => {
  // 弹幕组件会直接提交后端
};

const offTimeUpdate = (player: CustomDPlayer) => {
  player.off('timeupdate', publicListener.timeUpdate);
};

const toggle = (player: DPlayer) => {
  player.toggle();
};

const volume = (player: DPlayer, volume: number) => {
  player.volume(volume, true, false);
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
