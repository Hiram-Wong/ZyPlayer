import * as Dashjs from 'dashjs';
import Flvjs from 'flv.js';
import type { HlsConfig } from 'hls.js';
import Hlsjs from 'hls.js';
import * as magnet from 'magnet-uri';
import Mpegtsjs from 'mpegts.js';

// import Shakajs from 'shaka-player/dist/shaka-player.compiled';
import WebTorrentjs from '../modules/webtorrent.min.js';
import type {
  IDashConfig,
  IDashInstance,
  IFlvConfig,
  IFlvInstance,
  IHlsConfig,
  IHlsInstance,
  IMpegtsConfig,
  IMpegtsInstance,
  // IShakaConfig,
  // IShakaInstance,
  ITorrentConfig,
  ITorrentInstance,
} from '../types';

const streamConfig = {
  dash: {
    stream: (_headers = {}) => ({}),
  },
  flv: {
    optional: (headers = {}): Flvjs.Config => {
      return Object.assign(
        {
          // enableWorker: false, // 启用分离线程true会导致无法播放
          // enableStashBuffer: false, // 关闭IO隐藏缓冲区
          // stashInitialSize: 128, // 减少首帧显示等待时长
          // autoCleanupSourceBuffer: true, // 自动清除缓存
          // reuseRedirectedURL: true, // 允许重定向请求
          // fixAudioTimestampGap: false, // 音视频同步
          // deferLoadAfterSourceOpen: false, // 允许延迟加载
          // referrerPolicy: 'no-referrer', // 不发送来源
        },
        Object.keys(headers).length > 0 ? { headers } : {}, // 请求头
      );
    },
  },
  hls: (headers = {}): HlsConfig => {
    return Object.assign(
      {},
      Hlsjs.DefaultConfig,
      {
        // Web Worker
        enableWorker: true,
        // MediaSource 仅在不存在的情况下使用ManagedMediaSource
        preferManagedMediaSource: false,
        // 避免播放列表/分段请求时的超时
        manifestLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 1000000, // 设置一个适当大的值
            maxLoadTimeMs: 1000000, // 设置一个适当大的值
            timeoutRetry: {
              maxNumRetry: 2,
              retryDelayMs: 0,
              maxRetryDelayMs: 0,
            },
            errorRetry: {
              maxNumRetry: 1,
              retryDelayMs: 1000,
              maxRetryDelayMs: 8000,
            },
          },
        },
        playlistLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 1000000, // 设置一个适当大的值
            maxLoadTimeMs: 1000000, // 设置一个适当大的值
            timeoutRetry: {
              maxNumRetry: 2,
              retryDelayMs: 0,
              maxRetryDelayMs: 0,
            },
            errorRetry: {
              maxNumRetry: 2,
              retryDelayMs: 1000,
              maxRetryDelayMs: 8000,
            },
          },
        },
        fragLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 1000000, // 设置一个适当大的值
            maxLoadTimeMs: 1000000, // 设置一个适当大的值
            timeoutRetry: {
              maxNumRetry: 4,
              retryDelayMs: 0,
              maxRetryDelayMs: 0,
            },
            errorRetry: {
              maxNumRetry: 6,
              retryDelayMs: 1000,
              maxRetryDelayMs: 8000,
            },
          },
        },
      },
      Object.keys(headers).length > 0
        ? {
            xhrSetup(xhr: XMLHttpRequest, _url: string) {
              // Add custom header. Requires to set up Access-Control-Allow-Headers in your
              // response header in the server side. Reference: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
              // xhr.withCredentials = true; // do send cookies
              for (const key in headers) {
                xhr.setRequestHeader(key, headers[key]);
              }
            },
          }
        : {},
    );
  },
  mpegts: {
    optional: (headers = {}): Mpegtsjs.Config => {
      return Object.assign(
        {
          // Web Worker
          enableWorker: false,
          // 启用面向Media Source Extensions API的Web Worker
          // 通过从主线程中分离播放处理，解决了低规格终端受到DOM绘制延迟影响而导致影像播放堵塞的问题。
          // 在不能使用MSE in Worker的环境中，mpegts.js方面会自动回退，所以基本上设置true
          // 不过，在 Microsoft Edge for Windows 上，只有启用了 Worker 中的 MSE，H.265 / HEVC 播放才会失效，因此只能在这种情况下禁用。
          // enableWorkerForMSE: !(
          //   mediaUtils.isHEVCVideoSupported() && (await Mpegtsjs.supportWorkerForMSEH265Playback()) === false
          // ),
          enableWorkerForMSE: false,
          // 存储 2048KB 缓冲区，直到播放开始
          // 太大似乎不起作用，但太小或禁用会导致不稳定，尤其是在 Safari 中。
          enableStashBuffer: true,
          stashInitialSize: Math.floor(2048 * 1024),
          // 通过HTMLMediaElement的内部缓冲器追踪实时流的延迟
          // 与liveBufferLatencyChasing不同，不是突然跳过播放时间，
          // 通过稍微提高播放速度，在不中断播放的情况下追踪延迟
          liveSync: true,
          // 允许的HTMLMediaElement的内部缓冲区的最大值（以秒为单位，3秒）
          liveSyncMaxLatency: 3,
          // HTMLMediaElement 的内部缓冲区（延迟）超过 liveSyncMaxLatency 时的目标延迟（秒）。
          liveSyncTargetLatency: 4.0,
          // 用于追踪直播延迟的播放速度（x1.1）
          // 延迟超过3秒时，直到延迟低于playback_buffer_sec为止，播放速度设置为x1.1
          liveSyncPlaybackRate: 1.1,
          // 发送来源
          // referrerPolicy: 'no-referrer',
        },
        Object.keys(headers).length > 0 ? { headers } : {},
      );
    },
  },
  shaka: (_headers = {}) => ({}),
  torrent: (_headers = {}) => ({}),
};

const streamDecoder = {
  // https://github.com/Dash-Industry-Forum/dash.js
  customDash: (video: HTMLVideoElement, url: string, config: IDashConfig): IDashInstance => {
    if (Dashjs.supportsMediaSource()) {
      // @ts-expect-error declared but its value is never read
      // eslint-disable-next-line ts/no-unused-vars
      const { autoplay = false, isLive = false, options = {}, headers = {} } = config;

      const dash = Dashjs.MediaPlayer().create();
      if (Object.keys(headers).length > 0) {
        // 新 v5
        const interceptor = (request) => {
          request.headers = headers;
          return Promise.resolve(request);
        };
        dash.addRequestInterceptor(interceptor);

        // 旧
        // dash.extend(
        //   'RequestModifier',
        //   function () {
        //     return {
        //       modifyRequestHeader(xhr: XMLHttpRequest) {
        //         // Add custom header. Requires to set up Access-Control-Allow-Headers in your
        //         // response header in the server side. Reference: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
        //         // xhr.withCredentials = true; // do send cookies
        //         for (const key in headers) {
        //           xhr.setRequestHeader(key, headers[key]);
        //         }
        //         return xhr;
        //       },
        //       modifyRequestURL(url: string) {
        //         // Modify url adding a custom query string parameter
        //         return url;
        //       },
        //     };
        //   },
        //   true,
        // );
      }
      dash.initialize(video, url, autoplay);
      dash.updateSettings({});
      return dash;
    } else {
      console.warn('dash is not supported.');
      return undefined;
    }
  },
  // https://github.com/Bilibili/flv.js
  customFlv: (video: HTMLVideoElement, url: string, config: IFlvConfig): IFlvInstance => {
    if (Flvjs.isSupported()) {
      // @ts-expect-error declared but its value is never read
      // eslint-disable-next-line ts/no-unused-vars
      const { autoplay = false, isLive = false, optionalConfig = {}, mediaDataSource = {}, headers = {} } = config;
      const flv = Flvjs.createPlayer(
        Object.assign({ type: 'flv', url }, mediaDataSource),
        Object.assign({}, streamConfig.flv.optional(headers), optionalConfig),
      );
      flv.attachMediaElement(video);
      flv.load();
      return flv;
    } else {
      console.warn('flvjs is not supported.');
      return undefined;
    }
  },
  // https://github.com/video-dev/hls.js
  customHls: (video: HTMLVideoElement, url: string, config: IHlsConfig): IHlsInstance => {
    if (Hlsjs.isSupported()) {
      // @ts-expect-error declared but its value is never read
      // eslint-disable-next-line ts/no-unused-vars
      const { autoplay = false, isLive = false, options = {}, headers = {} } = config;

      const hls = new Hlsjs(Object.assign({}, streamConfig.hls(headers), options));
      hls.loadSource(url);
      hls.attachMedia(video);
      return hls;
    } else {
      console.warn('Hls is not supported.');
      return undefined;
    }
  },
  // https://github.com/xqq/mpegts.js
  // https:github.com/xqq/mpegts.js/blob/master/docs/api.md
  customMpegts: (video: HTMLVideoElement, url: string, config: IMpegtsConfig): IMpegtsInstance => {
    if (Mpegtsjs.isSupported()) {
      // @ts-expect-error declared but its value is never read
      // eslint-disable-next-line ts/no-unused-vars
      const { autoplay = false, isLive = false, mediaDataSource = {}, optionalConfig = {}, headers = {} } = config;

      const mpegts = Mpegtsjs.createPlayer(
        Object.assign(
          {
            type: 'mpegts', // mse, mpegts, m2ts, flv, mp4
            isLive,
            url,
          },
          mediaDataSource,
        ),
        Object.assign({}, streamConfig.mpegts.optional(headers), optionalConfig),
      );
      mpegts.attachMediaElement(video);
      mpegts.load();
      mpegts.play();
      return mpegts;
    } else {
      console.warn('mpegts is not supported.');
      return undefined;
    }
  },
  // https://github.com/shaka-project/shaka-player
  // customShaka: (video: HTMLVideoElement, url: string, config: IShakaConfig): IShakaInstance => {
  //   if (Shakajs.Player.isBrowserSupported()) {
  //     // eslint-disable-next-line ts/no-unused-vars
  //     const { autoplay = false, isLive = false, options = {}, headers = {} } = config;

  //     const shaka = new Shakajs.Player(video);
  //     if (Object.keys(headers).length > 0) {
  //       shaka.getNetworkingEngine()!.registerRequestFilter(function (type, request: Shakajs.extern.Request) {
  //         if (type !== Shakajs.net.NetworkingEngine.RequestType.MANIFEST) {
  //           return;
  //         }
  //         for (const header in headers) {
  //           request.headers[header] = headers[header];
  //         }
  //       });
  //     }
  //     shaka.load(url);
  //     shaka.configure(Object.assign({}, streamConfig.shaka, options));
  //     return shaka;
  //   } else {
  //     console.warn('shaka is not supported.');
  //     return undefined;
  //   }
  // },
  // https://github.com/webtorrent/webtorrent
  customTorrent: (video: HTMLVideoElement, url: string, config: ITorrentConfig): ITorrentInstance => {
    if (WebTorrentjs.WEBRTC_SUPPORT) {
      // @ts-expect-error declared but its value is never read
      // eslint-disable-next-line ts/no-unused-vars
      const { autoplay = false, isLive = false, options = {}, headers = {} } = config;
      const client = new WebTorrentjs(Object.assign({}, streamConfig.torrent(headers), options));
      const torrentParsed = magnet.decode(url);
      if (!torrentParsed.tr || torrentParsed.tr.length === 0) {
        const trackers = [
          'udp://tracker.opentrackr.org:1337',
          'udp://exodus.desync.com:6969',
          'wss://tracker.btorrent.xyz',
          'wss://tracker.fastcast.nz',
          'wss://tracker.openwebtorrent.com',
        ];

        torrentParsed.tr = trackers;
        torrentParsed.announce = trackers;
      }
      const torrentId = magnet.encode(torrentParsed);

      video.preload = 'metadata';
      client.add(torrentId, (torrent) => {
        const file = torrent.files.find((file) => {
          return file.name.endsWith('.mp4') || file.name.endsWith('.mkv');
        }) as WebTorrentjs.TorrentFile;
        file.renderTo(video, { autoplay, controls: false }); // 旧 0.98.18 版本
        // file.streamTo(video, { autoplay, controls: false }); // 新 1.9.7 版本
      });
      return client;
    } else {
      console.warn('Webtorrent is not supported.');
      return undefined;
    }
  },
};

export { streamConfig, streamDecoder };
