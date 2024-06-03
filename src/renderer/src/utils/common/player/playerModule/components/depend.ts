// import dashjs from 'dashjs';
import MpegTs from 'mpegts.js';
import flvjs from 'flv.js';
import Hls from 'hls.js';
import WebTorrent from './modules/webtorrent';
// @ts-ignore
import shaka from 'shaka-player/dist/shaka-player.compiled';

const publicOptions = {
  hls: {},
  flv: {
    mediaDataSource: {},
    config: {},
  },
  webtorrent: {},
  dash: {},
  shaka: {},
};

const publicStream = {
  create: {
    customHls: (video: HTMLVideoElement, url: string): Hls | null => {
      if (Hls.isSupported()) {
        const options = publicOptions.hls || {};
        const hls = new Hls(options);
        hls.loadSource(url);
        hls.attachMedia(video);
        return hls;
      } else {
        console.log('Hls is not supported.');
        return null;
      }
    },
    customFlv: (video: HTMLVideoElement, url: string): any => {
      if (flvjs.isSupported()) {
        const flvPlayer = flvjs.createPlayer(
          Object.assign(publicOptions.flv.mediaDataSource || {}, {
            type: 'flv',
            url: url,
          }),
          publicOptions.flv.config || {},
        );
        flvPlayer.attachMediaElement(video);
        flvPlayer.load();
        return flvPlayer;
      } else {
        console.log('flvjs is not supported.');
        return null;
      }
    },
    customTorrent: (video: HTMLVideoElement, url: string) => {
      if (WebTorrent.WEBRTC_SUPPORT) {
        const options = publicOptions.webtorrent;
        const client = new WebTorrent(options);
        const torrentId = url;
        video.src = '';
        video.preload = 'metadata';
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
    customDash: (video: HTMLVideoElement, url: string) => {
      // const dashjsPlayer = dashjs.MediaPlayer().create();
      // dashjsPlayer.initialize(video, url, true);
      // const options = publicOptions.dash;
      // dashjsPlayer.updateSettings(options);
      // return dashjsPlayer;
      if (shaka.Player.isBrowserSupported()) {
        const playerShaka = new shaka.Player(video);
        playerShaka.load(url);
        const options = publicOptions.dash;
        playerShaka.configure(options);
        return playerShaka;
      } else {
        console.log('shaka is not supported.');
        return null;
      }
    },
    customMpegts: (video: HTMLVideoElement, url: string): any => {
      if (MpegTs.isSupported()) {
        const playerMpegts = MpegTs.createPlayer({
          type: 'mse', // could also be mpegts, m2ts, flv
          isLive: false,
          url,
        });
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
      flv.unload();
      flv.detachMediaElement();
      flv.destroy();
      flv = flvjs.createPlayer(
        {
          type: 'flv',
          url: url,
        },
        {
          enableWorker: true,
        },
      );

      flv.attachMediaElement(video);
      flv.load();
      flv.play();
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
      player.hls.destroy();
      delete player.hls;
    },
    customFlv: (player: any) => {
      player.flv.destroy();
      delete player.flv;
    },
    customDash: (player: any) => {
      player.mpd.destroy();
      delete player.mpd;
    },
    customTorrent: (player: any) => {
      // player.torrent.remove(player.video.src);
      player.torrent.destroy();
      delete player.torrent;
    },
    customMpegts: (player: any) => {
      player.destroy();
    },
  },
};

export { publicStream };
