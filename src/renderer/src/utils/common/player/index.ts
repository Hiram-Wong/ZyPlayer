/*!
 * @module multi-player
 * @brief 多播放器集成方案
 * @author HiramWong <admin@catni.cn>
 * @update 2024-07-01
 * @version 0.1.3
 *
 * **ChangeLog说明**:
 * - 2024.5.12:
 *   - 初步实现方法集成[xgplayer|nplayer|dplayer|artplayer]
 * - 2024.5.13:
 *   - 除xgplayer外增加弹幕发送逻辑
 *   - 优化xgplayer兼容性-xgplayer-flv.js替代xgplayer-flv, xgplayer-hls.js替代xgplayer-hls
 * - 2024.5.14:
 *   - 优化公共流逻辑-先检测环境是否支持
 *   - 修复seek方法xgplayer进度跳转失败
 *   - 修复playerNext方法nplayer会退出全屏
 * - 2024.5.15:
 *   - 修复取消监听事件导致组件内监听事件失效-提取为公共方法[时间变动|弹幕发送]
 *   - 修复自定义dplayer的off传入func匹配错误
 * - 2024.5.16:
 *   - 扩展dplayer画中画功能、控制栏弹幕开关
 *   - 调整dplayer参数unlimited为false-解决阻塞主进程问题
 *   - 修复触发playerNext方法在触发playerBarrage方法切换失败-没有赋值dp.options.video.src导致地址一直不变
 * - 2024.5.25:
 *   - 动态异步加载依赖
 *   - 按播放器解耦
 * - 2024.6.1:
 *   - 修复playerNext方法nplayer类型为mp4不生效
 *   - 统一风格-nplayer音量进度条改为垂直|扩展画中画控制栏显示|live模式去进度条
 *   - 统一风格-live模式去除相关弹幕组件[减少内存]
 * - 2024.6.2:
 *   - 修复mpd无法播放问题-类型映射
 *   - 修复xgplayer初始化播放器失败-plugin赋值错误
 *   - 优化mpd播放-使用shaka库替代dash库[dash库经常卡死|反复请求同一分片]
 *   - 修复artplayer弹幕库5.1版本-参数对齐
 *   - 修复nplayer弹幕不滚动-BulletOption中type赋值错误
 *   - 修复dplayer弹幕控制不生效-弹幕开关控制逻辑误删
 * - 2024.6.3:
 *   - 支持mp3|m4a音频-使用MPEG-TS库
 * - 2024.6.4:
 *   - 修复西瓜播放器加载视频错误
 *   - 修复多次创建播放器扩展插件会重复添加-默认参数使用深拷贝
 * - 2024.6.29:
 *   - 修复在live模式下切换下一个报错-需判断弹幕组件库是否加载
 *   - 修复flv数据流切换失败, 始终播放一个视频流
 *   - 统一调用公共逻辑摧毁实例(除西瓜播放器外)
 *   - 去除nplayer控制条调用画中画(遗留多次创建会创建多个dom问题bug)
 * - 2024.6.30:
 *   - 优化记忆音量和倍速(遗留art播放器UI显示不对bug-已提issue)-存储localStorage
 *   - 统一倍速为[0.5, 0.75, 1, 1.25, 1.5, 2]
 * - 2024.7.1:
 *   - 扩展dplayer播放器缺失once方法
 *   - 重写dplayer播放器destroy方法-始终会释放playrate为1的信号
 *
 * ---
 */

import cloneDeep from 'lodash/cloneDeep';
import { checkMediaType, checkLiveM3U8 } from '@/utils/tool';

let playerModulesCache: { [key: string]: any } = {};

const mapVideoTypeToPlayerType = (videoType: string): string | undefined => {
  const audioTypes = ['mp3', 'm4a', 'wav', 'flac', 'aac', 'ogg', 'wma'];
  if (audioTypes.includes(videoType)) return 'customMpegts';

  switch (videoType) {
    case 'mp4':
      return 'customMp4';
    case 'flv':
      return 'customFlv';
    case 'm3u8':
      return 'customHls';
    case 'mpd':
      return 'customDash';
    case 'magnet':
      return 'customWebTorrent';
    default:
      return 'customHls';
  }
};

const loadPlayerMethod = async (playerMode: string) => {
  if (!playerModulesCache[playerMode]) {
    switch (playerMode) {
      case 'artplayer':
        playerModulesCache[playerMode] = await import('./playerModule/artplayer');
        break;
      case 'dplayer':
        playerModulesCache[playerMode] = await import('./playerModule/dplayer');
        break;
      case 'nplayer':
        playerModulesCache[playerMode] = await import('./playerModule/nplayer');
        break;
      case 'xgplayer':
        playerModulesCache[playerMode] = await import('./playerModule/xgplayer');
        break;
      default:
        throw new Error(`Unknown player mode: ${playerMode}`);
    }
  }
  return playerModulesCache[playerMode];
};

const playerBarrage = async (player: any, playerMode: string, data: any, options: any, id: string) => {
  const { start, mode, color, content, url } = options;
  let comments: any = [];
  let cleanedData: any = [];

  if (playerMode !== 'dplayer') {
    cleanedData = data;
  }

  const playerModule = await loadPlayerMethod(playerMode);
  const { barrge } = playerModule;

  switch (playerMode) {
    case 'xgplayer':
      comments = cleanedData.map((item: any, index: number) => ({
        duration: 5000,
        id: String(index + 1),
        start: item[start] * 1000,
        txt: item[content],
        mode: ['left', 'right'].includes(item[mode]) ? 'scroll' : item[mode],
        color: true,
        style: { color: item[color] },
      }));
      break;
    case 'dplayer':
      comments = data;
      break;
    case 'artplayer':
      comments = cleanedData.map((item: any) => ({
        text: item[content],
        time: parseInt(item[start]),
        color: item[color],
        border: false,
        mode: item[mode] === 'scroll' ? 1 : 0,
      }));
      break;
    case 'nplayer':
      comments = cleanedData.map((item: any) => ({
        color: item[color],
        text: item[content],
        time: parseInt(item[start]),
        type: item[mode] === 'top' || item[mode] === 'bottom' ? item[mode] : 'scroll',
        isMe: false,
        force: true,
      }));
      break;
  }

  if (playerMode !== 'dplayer') {
    comments = comments.concat([]).sort((a, b) => a.time - b.time);
  }

  barrge(player, comments, url, id);
};

const playerCreate = async (
  url: string,
  type: string,
  container: string | Element,
  playerMode: string,
  videoType: string = '',
): Promise<any> => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { create, options } = playerModule;

  const isLive = type === 'iptv' ? await checkLiveM3U8(url) : false;
  videoType = videoType || (await checkMediaType(url)) || '';

  let config = cloneDeep(options);
  if (playerMode === 'xgplayer') {
    config.id = container;
    config.url = url;
    if (isLive) config.isLive = true;
    config.type = mapVideoTypeToPlayerType(videoType);
  } else if (playerMode === 'artplayer') {
    config.container = container;
    config.url = url;
    if (isLive) config.isLive = true;
    config.type = mapVideoTypeToPlayerType(videoType);
  } else if (playerMode === 'dplayer') {
    config.container = container;
    config.video.url = url;
    if (isLive) config.live = true;
    config.video.type = mapVideoTypeToPlayerType(videoType);
  } else if (playerMode === 'nplayer') {
    config.container = container;
    if (isLive) config.live = true;
    config.src = url;
    config.type = mapVideoTypeToPlayerType(videoType);
  }

  return create(config);
};

const playerDestroy = async (player: any, playerMode: string) => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { destroy } = playerModule;
  if (playerModulesCache[playerMode]) delete playerModulesCache[playerMode];
  return destroy(player);
};

const playerNext = async (player: any, playerMode: string, options: any) => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { playNext } = playerModule;
  const { url, mediaType } = options;
  const videoType = mediaType || (await checkMediaType(url)) || '';

  let data = {
    url,
    type: mapVideoTypeToPlayerType(videoType),
  };

  return playNext(player, data);
};

const playerSeek = async (player: any, playerMode: string, time: number) => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { seek } = playerModule;
  return seek(player, time);
};

const playerToggle = async (player: any, playerMode: string, status: boolean) => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { play, pause } = playerModule;
  if (status) return play(player);
  else return pause(player);
};

const playerPause = async (player: any, playerMode: string) => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { pause } = playerModule;
  return pause(player);
};

const playerTimeUpdate = async (player: any, playerMode: string, callback: any) => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { onTimeUpdate } = playerModule;
  return onTimeUpdate(player, callback);
};

const offPlayerBarrage = async (player: any, playerMode: string) => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { offBarrage } = playerModule;
  return offBarrage(player);
};

const offPlayerTimeUpdate = async (player: any, playerMode: string) => {
  const playerModule = await loadPlayerMethod(playerMode);
  const { offTimeUpdate } = playerModule;
  return offTimeUpdate(player);
};

export {
  playerBarrage,
  playerCreate,
  playerDestroy,
  playerNext,
  playerSeek,
  playerToggle,
  playerPause,
  playerTimeUpdate,
  offPlayerBarrage,
  offPlayerTimeUpdate,
};
