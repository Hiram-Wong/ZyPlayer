// import dashjs from 'dashjs';
import MpegTs from 'mpegts.js';
import flvjs from 'flv.js';
import Hls from 'hls.js';
import WebTorrent from '../modules/webtorrent';
// @ts-ignore
import shaka from 'shaka-player/dist/shaka-player.compiled';

const publicOptions = {
  hls: {
    maxBufferLength: 600, // 缓冲区最大长度
    liveSyncDurationCount: 10, // 直播同步持续时间计数
  },
  flv: {
    mediaDataSource: {
      type: 'flv',
      isLive: false,
    },
    optionalConfig: {
      enableWorker: false, // 启用分离线程
      enableStashBuffer: false, //关闭IO隐藏缓冲区
      autoCleanupSourceBuffer: true, //自动清除缓存
      reuseRedirectedURL: true, //允许重定向请求
      fixAudioTimestampGap: false, // 音视频同步
      deferLoadAfterSourceOpen: false, // 允许延迟加载
      // referrerPolicy: 'no-referrer',
      headers: {},
    },
  },
  webtorrent: {},
  dash: {},
  shaka: {},
};

const publicStream = {
  create: {
    customHls: (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}): Hls | null => {
      if (Hls.isSupported()) {
        const options: any = Object.assign({}, { ...publicOptions.hls });
        if (Object.keys(headers).length > 0) {
          options.xhrSetup = function (xhr: any, _url: string) {
            // xhr.withCredentials = true; // do send cookies
            for (const key in headers) {
              xhr.setRequestHeader(key, headers[key]);
            }
          };
        }
        const hls = new Hls(options);
        hls.loadSource(url);
        hls.attachMedia(video);
        return hls;
      } else {
        console.log('Hls is not supported.');
        return null;
      }
    },
    customFlv: (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}): any => {
      if (flvjs.isSupported()) {
        const flvPlayer = flvjs.createPlayer(
          Object.assign({}, { ...publicOptions.flv.mediaDataSource }, { url: url }),
          Object.assign({}, { ...publicOptions.flv.optionalConfig }, headers),
        );
        flvPlayer.attachMediaElement(video);
        flvPlayer.load();
        return flvPlayer;
      } else {
        console.log('flvjs is not supported.');
        return null;
      }
    },
    customTorrent: (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
      if (WebTorrent.WEBRTC_SUPPORT) {
        const options = publicOptions.webtorrent;
        const client = new WebTorrent(options);
        const torrentId = url;
        client.add(torrentId, (torrent) => {
          const file = torrent.files.find((file) => file.name.endsWith('.mp4') || file.name.endsWith('.mkv'));
          file.renderTo(video, {
            autoplay: true,
            controls: false,
          });
        });
        return client;
      } else {
        console.log('Webtorrent is not supported.');
        return null;
      }
    },
    customDash: (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
      if (shaka.Player.isBrowserSupported()) {
        const playerShaka = new shaka.Player(video);
        playerShaka.getNetworkingEngine().registerRequestFilter(function (type, request) {
          if (type != shaka.net.NetworkingEngine.RequestType.MANIFEST) {
            return;
          }
          for (const header in headers) {
            request.headers[header] = headers[header];
          }
        });
        playerShaka.load(url);
        const options = publicOptions.dash;
        playerShaka.configure(options);
        return playerShaka;
      } else {
        console.log('shaka is not supported.');
        return null;
      }
    },
    customMpegts: (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}): any => {
      if (MpegTs.isSupported()) {
        const playerMpegts = MpegTs.createPlayer(
          {
            type: 'mp4', // could also be mpegts, m2ts, flv
            isLive: false,
            url,
            // withCredentials: true,
          },
          { referrerPolicy: 'no-referrer', headers },
        );
        playerMpegts.attachMediaElement(video);
        playerMpegts.load();
        playerMpegts.play();
        return playerMpegts;
      } else {
        console.log('mpegts is not supported.');
        return null;
      }
    },
  },
  switch: {
    customHls: (video: HTMLVideoElement, hls: any, url: string): Hls => {
      hls.stopLoad();
      hls.detachMedia();

      // 重新加载新的M3U8 URL
      hls.loadSource(url);
      hls.attachMedia(video);

      // 等待新流解析完成并开始播放
      hls.once(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
      return hls;
    },
    customFlv: (video: HTMLVideoElement, flv: any, url: string) => {
      flv.pause();
      flv.unload();
      flv.detachMediaElement();
      flv.destroy();
      flv = flvjs.createPlayer(
        Object.assign({}, publicOptions.flv.mediaDataSource || {}, {
          url: url,
        }),
        publicOptions.flv.optionalConfig || {},
      );
      flv.attachMediaElement(video);
      flv.load();
      return flv;
    },
    customDash: (video: HTMLVideoElement, dash: any, url: string) => {
      dash.destroy();
      const playerShaka = new shaka.Player(video);
      playerShaka.load(url);
      const options = publicOptions.dash;
      playerShaka.configure(options);
      return playerShaka;
    },
    customTorrent: (video: HTMLVideoElement, client: any, url: string) => {
      // 如果之前有正在加载或播放的任务，先停止并移除
      if (client.torrents.length > 0) {
        client.removeAllListeners();
        client.destroy();
        client = new WebTorrent();
      }

      // 使用新的磁力链接或.torrent文件URL加载种子
      client.add(url, (torrent) => {
        const file = torrent.files.find((file) => file.name.endsWith('.mp4') || file.name.endsWith('.mkv'));

        file.renderTo(video, {
          autoplay: true,
        });
      });
      return client;
    },
    customMpegts: (video: HTMLVideoElement, mpegts: any, url: string) => {
      mpegts.destroy();
      const playerMpegts = MpegTs.createPlayer({
        type: 'mse', // could also be mpegts, m2ts, flv
        isLive: false,
        url,
      });
      playerMpegts.attachMediaElement(video);
      playerMpegts.load();
      playerMpegts.play();
      return playerMpegts;
    },
  },
  destroy: {
    customHls: (player: any) => {
      if (player?.hls) player.hls.destroy();
      delete player.hls;
    },
    customFlv: (player: any) => {
      if (player?.flv) player.flv.destroy();
      delete player.flv;
    },
    customDash: (player: any) => {
      if (player?.mpd) player.mpd.destroy();
      delete player.mpd;
    },
    customTorrent: (player: any) => {
      // player.torrent.remove(player.video.src);
      if (player?.torrent) player.torrent.destroy();
      delete player.torrent;
    },
    customMpegts: (player: any) => {
      if (player?.mpegts) player.mpegts.destroy();
      delete player.mpegts;
    },
  },
};

export default publicStream;
