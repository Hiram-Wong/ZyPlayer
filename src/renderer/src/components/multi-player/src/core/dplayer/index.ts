import './css/index.css';

import type { DPlayerType } from 'dplayer';
import DPlayer from 'dplayer';
import { merge } from 'es-toolkit';

import { emitterChannel } from '@/config/emitterChannel';
import emitter from '@/utils/emitter';

import type { IBarrage, IBarrageSendOptions, IMultiPlayerOptions } from '../../types';
import { color, icons, language } from '../../utils/static';
import { storage, storageUtil } from '../../utils/storage';
import { streamDecoder } from '../../utils/stream-decoder';
import { publicBarrageSend } from '../../utils/tool';
import type { PlayerAdapter } from './types';
import { uiIconHandle } from './utils';

class DPlayerAdapter {
  player: PlayerAdapter | null = null;
  listeners: Map<DPlayerType.Events, Set<(...args: any[]) => void>> = new Map();
  headers: Record<string, string> = {};
  options: DPlayerType.Options = {
    container: document.getElementById('dplayer')!,
    autoplay: true,
    screenshot: false,
    theme: color.theme,
    live: false,
    lang: 'zh-cn',
    video: {
      url: '',
      type: '',
      customType: {
        hls: (video: HTMLVideoElement, dp: PlayerAdapter) => {
          if (dp.plugins?.hls) dp.plugins.hls.destroy();
          const hls = streamDecoder.customHls(video, video.src, {
            isLive: dp.options.live,
            autoplay: dp.options.autoplay,
            headers: dp.options.pluginOptions.headers,
          });
          dp.plugins.hls = hls;
          dp.on('destroy', () => hls?.destroy());
        },
        flv: (video: HTMLVideoElement, dp: PlayerAdapter) => {
          if (dp.plugins?.flv) dp.plugins.flv.destroy();
          const flv = streamDecoder.customFlv(video, video.src, {
            isLive: dp.options.live,
            autoplay: dp.options.autoplay,
            headers: dp.options.pluginOptions.headers,
          });
          dp.plugins.flv = flv;
          dp.on('destroy', () => flv?.destroy());
        },
        dash: (video: HTMLVideoElement, dp: PlayerAdapter) => {
          if (dp.plugins?.dash) dp.plugins.dash.destroy();
          const dash = streamDecoder.customDash(video, video.src, {
            isLive: dp.options.live,
            autoplay: dp.options.autoplay,
            headers: dp.options.pluginOptions.headers,
          });
          dp.plugins.dash = dash;
          dp.on('destroy', () => dash?.destroy());
        },
        mpegts: (video: HTMLVideoElement, dp: PlayerAdapter) => {
          if (dp.plugins?.mpegts) dp.plugins.mpegts.destroy();
          const mpegts = streamDecoder.customMpegts(video, video.src, {
            isLive: dp.options.live,
            autoplay: dp.options.autoplay,
            headers: dp.options.pluginOptions.headers,
          });
          dp.plugins.mpegts = mpegts;
          dp.on('destroy', () => mpegts?.destroy());
        },
        torrent: (video: HTMLVideoElement, dp: PlayerAdapter) => {
          if (dp.plugins?.torrent) dp.plugins.torrent.destroy();
          const torrent = streamDecoder.customTorrent(video, video.src, {
            isLive: dp.options.live,
            autoplay: dp.options.autoplay,
            headers: dp.options.pluginOptions.headers,
          });
          dp.plugins.torrent = torrent;
          dp.on('destroy', () => torrent?.destroy());
        },
      },
    },
  };

  private on(event: DPlayerType.Events, handler: (...args: any[]) => void) {
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

  private off(event: DPlayerType.Events, handler?: any) {
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

    const { video } = this.player.options;

    // api格式
    const comments: DPlayerType.Dan[] = barrage.map((item) => ({
      author: 'username', // 弹幕作者（实际上不使用）
      id: item.id,
      type: (['top', 'bottom'].includes(item.type) ? item.type : 'right') as DPlayerType.DanmakuType,
      text: item.text,
      time: item.time,
      color: item.color,
      size: 'medium', // 弹幕字体大小 big small medium
    }));
    const barrageResp = { code: 0, data: comments };
    let barrageBlob: Blob | null = new Blob([JSON.stringify(barrageResp)], { type: 'application/json' });
    const barrageUrl = URL.createObjectURL(barrageBlob);
    this.player.switchVideo(
      { ...video } as {
        url: string;
        type?: DPlayerType.VideoType | string;
        pic?: string;
      },
      {
        user: 'username', // 评论的用户名（实际上不使用）
        speedRate: 1, // 弹幕速度
        // opacity: 0.4, // 弹幕透明度
        bottom: '30%', // 弹幕距离播放器底部的距离
        // borderColor: '#F5F5', // 弹幕边框颜色
        unlimited: false, // 弹幕重叠也展示
        fontSize: 24, // 弹幕字体大小
        closeCommentFormAfterSend: true, // 提交评论后是否关闭评论表单
        addition: [barrageUrl], // api处理方式
      },
      true,
      {
        read(options) {
          options.success(comments);
        },
        send(options) {
          const sendHandle = (item: DPlayerType.Dan) => {
            const options: IBarrageSendOptions = {
              id,
              type: item.type,
              text: item.text as DPlayerType.DanmakuType,
              time: item.time,
              color: item.color ?? '#FFFFFF',
            };
            publicBarrageSend(options);
          };
          sendHandle(options.data);
          options.success();
        },
      },
    );

    URL.revokeObjectURL(barrageUrl); // 释放 URL 对象
    barrageBlob = null; // 释放 Blob 对象
  }

  create(rawOptions: Required<IMultiPlayerOptions>) {
    storageUtil.delStartWith('dplayer-');

    const muted = !!storage?.get('muted'); // 静音

    const options: Partial<PlayerAdapter['options']> = {
      container: document.getElementById(rawOptions.container)!, // 容器
      autoplay: rawOptions.autoplay, // 自动播放
      live: rawOptions.isLive, // 直播
      volume: ((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('volume'))),
      video: {
        url: rawOptions.url,
        type: ['hls', 'dash', 'flv', 'mpegts', 'torrent'].includes(rawOptions.type) ? rawOptions.type : 'normal', // 解码器
      },
      pluginOptions: { headers: rawOptions.headers },
      lang: (() => {
        const locale = language();
        switch (locale) {
          case 'zh-CN':
            return 'zh-cn';
          case 'zh-TW':
            return 'zh-tw';
          default:
            return 'en';
        }
      })(), // 语言
    };

    if (rawOptions.quality.length > 0) {
      options.video!.quality = rawOptions.quality.map((q) => {
        return { name: q.name, url: q.url, type: options.video!.type };
      });
      options.video!.defaultQuality = 0;
    } // 画质

    // 初始化
    const player: PlayerAdapter = new DPlayer(merge(this.options, options));

    player.storage = storage; // 挂载存储
    this.player = player; // 赋值实例

    setTimeout(() => {
      // uiIconHandle.replace('.dplayer-play-icon', icons.play);
      // uiIconHandle.replace('.dplayer-pause-icon', icons.pause);
      uiIconHandle.replace('.dplayer-setting-icon', icons.settingDot);
      uiIconHandle.replace('.dplayer-full-icon', icons.fullscreenEnter);
      uiIconHandle.replace('.dplayer-pip-icon', icons.pip);

      // 下集
      uiIconHandle.create(
        '.dplayer-play-icon',
        icons.mnext,
        'playNext',
        (() => {
          const locale = language();
          switch (locale) {
            case 'zh-CN':
              return '下集';
            case 'zh-TW':
              return '下集';
            default:
              return 'Play Next';
          }
        })(),
      );
      const handlePlayNext = () => {
        emitter.emit(emitterChannel.COMP_MULTI_PLAYER_PLAYNEXT);
      };
      const playNextButton = document.querySelector('.dplayer-playNext-icon');
      if (playNextButton) playNextButton.addEventListener('click', handlePlayNext);

      // 弹幕
      uiIconHandle.create(
        '.dplayer-setting',
        player.template.showDanmakuToggle.checked ? icons.danmuOpen : icons.danmuClose,
        'danmu',
        (() => {
          const locale = language();
          switch (locale) {
            case 'zh-CN':
              return '弹幕开关';
            case 'zh-TW':
              return '彈幕開關';
            default:
              return 'Toggle Danmaku';
          }
        })(),
      );
      const handleDanmu = () => {
        player.template.showDanmakuToggle.checked = !player.template.showDanmakuToggle.checked;
        const showDanmaku = player.template.showDanmakuToggle.checked;

        if (showDanmaku) {
          player.danmaku?.show();
          uiIconHandle.replace('.dplayer-danmu-icon', icons.danmuOpen);
        } else {
          player.danmaku?.hide();
          uiIconHandle.replace('.dplayer-danmu-icon', icons.danmuClose);
        }

        player.user.set('danmaku', showDanmaku ? 1 : 0);
      };
      const danmuButton = document.querySelector('.dplayer-danmu-icon');
      if (danmuButton) danmuButton.addEventListener('click', handleDanmu);
    }, 0); // 图标替换

    player.on(
      'canplay',
      () => {
        player.muted(muted); // 静音
        !rawOptions.isLive && player.speed(((v) => (Number.isNaN(v) ? 1 : v))(Number(storage?.get('playrate')))); // 倍速
        !rawOptions.isLive && rawOptions.startTime > 0 && player.seek(rawOptions.startTime); // 开始时间
      },
      true,
    );

    this.on('ratechange', () => player.storage?.set('playrate', player.video.playbackRate));
    this.on('volumechange', () => {
      player.storage?.set('volume', player.video.volume);
      player.storage?.set('muted', player.video.muted);
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

    const handler = () => {
      callback({
        currentTime: this.player?.video?.currentTime ?? Number.NaN,
        duration: this.player?.video?.duration ?? Number.NaN,
      });
    };
    this.on('timeupdate', handler);
  }

  offTimeUpdate() {
    if (!this.player) return;
    this.off('timeupdate');
  }

  play() {
    this.player?.play();
  }

  pause = () => {
    this.player?.pause();
  };

  togglePlay() {
    if (this.player) this.player.toggle();
  }

  toggleMuted() {
    if (this.player) this.player.muted(!this.player.video.muted);
  }

  seek(time: number) {
    if (this.player) this.player.seek(time);
  }

  switchUrl(rawOptions: Required<IMultiPlayerOptions>) {
    if (!this.player) return;

    const options = {
      url: rawOptions.url,
      type: ['hls', 'dash', 'flv', 'mpegts', 'torrent'].includes(rawOptions.type) ? rawOptions.type : 'normal',
    };
    this.player.options.pluginOptions = { headers: rawOptions.headers };

    const { playbackRate } = this.player.video;

    ['hls', 'flv', 'dash', 'mpegts', 'torrent'].forEach((key) => {
      this.player?.plugins?.[key]?.destroy?.();
      delete this.player?.plugins?.[key];
    });

    // 重要
    this.player.switchVideo(options);
    this.player.options.video.url = rawOptions.url;

    if (this.player?.danmaku) this.player.danmaku.clear();
    if (playbackRate !== 1) this.player.speed(playbackRate);

    this.player.play();
  }

  get currentTime() {
    return this.player?.video?.currentTime ?? Number.NaN;
  }

  get duration() {
    return this.player?.video?.duration ?? Number.NaN;
  }

  get time() {
    return {
      currentTime: this.player?.video?.currentTime ?? Number.NaN,
      duration: this.player?.video?.duration ?? Number.NaN,
    };
  }

  get playbackRate() {
    return this.player?.video?.playbackRate ?? 1;
  }

  set playbackRate(rate: number) {
    if (this.player) this.player.speed(rate);
  }

  get muted() {
    return !!this.player?.video?.muted;
  }

  set muted(state: boolean) {
    if (this.player) this.player.muted(state);
  }

  get volume() {
    return this.player?.volume() ?? 0;
  }

  set volume(volume: number) {
    if (this.player) {
      this.player.muted(!(volume > 0));
      this.player.volume(volume, true, false);
    }
  }

  get instance() {
    return this.player;
  }
}

export default DPlayerAdapter;
