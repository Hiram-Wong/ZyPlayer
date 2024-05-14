import Artplayer from 'artplayer';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';
import DPlayer from 'dplayer';
import NPlayer, { EVENT as NPlayerEvent, Icon as NPlayerIcon } from 'nplayer';
import nplayerDanmaku from '@nplayer/danmaku';
import flvjs from 'flv.js';
import Hls from 'hls.js';
import WebTorrent from './components/webtorrent';

import XgPlayer, { Events, SimplePlayer } from 'xgplayer';
import Danmu from 'xgplayer/es/plugins/danmu';
import LivePreset from 'xgplayer/es/presets/live';
// import FlvPlugin from 'xgplayer-flv';
import FlvPlugin from 'xgplayer-flv.js';
// import HlsPlugin from 'xgplayer-hls';
import HlsPlugin from 'xgplayer-hls.js';
import Mp4Plugin from 'xgplayer-mp4';

import { checkMediaType, checkLiveM3U8 } from '@/utils/tool';

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
    // @ts-ignore 获取或初始化events.events对象，用于存储事件监听器
    const e = this.events.events || (this.events.events = {});
    // 获取特定事件名称下的所有监听器
    const evts = e[name];
    // 创建一个新数组，用于存放那些不符合移除条件的监听器
    const liveEvents: any = [];

    // 如果存在事件监听器且指定了回调函数
    if (evts && callback) {
      // 遍历当前事件名称下的所有监听器
      for (let i = 0, len = evts.length; i < len; i += 1) {
        // 如果当前监听器的函数与要移除的函数不匹配（考虑直接引用和_.once包裹的情况）
        if (evts[i].fn !== callback && evts[i].fn._ !== callback) {
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

const publicIcons = {
  danmu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="2 2 17 17" fill="none" class="xgplayer-danmu-open-svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 4.106h-13a.3.3 0 00-.3.3v11.186a.3.3 0 00.3.3h7.111v1.7H3.5a2 2 0 01-2-2V4.406a2 2 0 012-2h13a2 2 0 012 2V10h-1.7V4.406a.3.3 0 00-.3-.3zM6 7.722c0-.42.34-.76.76-.76h6.58a.76.76 0 110 1.52H6.76a.76.76 0 01-.76-.76zm0 3.037c0-.42.34-.759.76-.759h3.543a.76.76 0 110 1.519H6.76a.76.76 0 01-.76-.76z" fill="#fff"></path><circle cx="15.1" cy="14.201" r="3.4" fill="#3370FF"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M13.185 13.756a.5.5 0 01.707 0l.866.866 1.78-1.78a.5.5 0 11.707.707l-2.133 2.134a.5.5 0 01-.707 0l-1.22-1.22a.5.5 0 010-.707z" fill="#fff"></path></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-icon-play"><path d="M14.121 8.299a2 2 0 010 3.402l-7.94 4.91c-1.332.825-3.051-.133-3.051-1.7V5.09c0-1.567 1.72-2.525 3.052-1.701l7.939 4.911z" fill="#fff"></path></svg>`,
  pause: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-icon-pause"><rect x="5.313" y="3.75" width="3.125" height="12.5" rx=".625" fill="#fff"></rect><rect x="11.563" y="3.75" width="3.125" height="12.5" rx=".625" fill="#fff"></rect></svg>`,
  playNext: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-play-next"><path d="M11.626 6.457L3.452 1.334C1.937.384.042 1.571.042 3.471v11.057c0 1.9 1.894 3.087 3.41 2.137l8.174-5.123c1.875-1.174 1.875-3.91 0-5.085zM16.5 1c-.825 0-1.5.675-1.5 1.5v13c0 .825.675 1.5 1.5 1.5s1.5-.675 1.5-1.5v-13c0-.825-.675-1.5-1.5-1.5z"></path></svg>`,
  fullscreen: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-get-fullscreen"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.778 2h4.444v1.778H3.778v4.444H2V3.778C2 2.796 2.796 2 3.778 2zM2 11.778v4.444C2 17.204 2.796 18 3.778 18h4.444v-1.778H4.823l2.313-2.313a.9.9 0 00-1.272-1.273l-2.086 2.086v-2.944H2zm14.222 0v4.444h-4.444V18h4.444c.982 0 1.778-.796 1.778-1.778v-4.444h-1.778zM18 8.222V3.778C18 2.796 17.204 2 16.222 2h-4.444v1.778h2.945l-2.587 2.586a.9.9 0 101.273 1.273l2.813-2.813v3.398H18z" fill="#fff"></path></svg>`,
  exitFullscreen: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-exit-fullscreen"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.892 2h4.445v1.778H3.892v4.444H2.114V3.778C2.114 2.796 2.91 2 3.892 2zm4.445 16v-4.444c0-.982-.796-1.778-1.778-1.778H2.114v1.778h2.944L2.264 16.35a.9.9 0 001.272 1.273l2.988-2.987a.918.918 0 00.035-.037V18h1.778zm8-6.222v4.444h-4.445V18h4.445c.981 0 1.777-.796 1.777-1.778v-4.444h-1.777zM11.892 2v4.445c0 .981.796 1.777 1.778 1.777h4.444V6.445H15.17l2.568-2.568a.9.9 0 10-1.273-1.273L13.67 5.4V2h-1.778z" fill="#fff"></path></svg>`,
  volumeSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-volume-small"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.867 2.5h.55c.44 0 .799.34.83.771l.003.062v13.334c0 .44-.34.799-.771.83l-.062.003h-.55a.833.833 0 01-.444-.128l-.064-.045-4.867-3.744a.831.831 0 01-.322-.59l-.003-.07V7.077c0-.235.099-.458.271-.615l.054-.045L9.36 2.673a.832.832 0 01.43-.17l.078-.003h.55-.55zM2.5 6.667c.23 0 .417.186.417.416v5.834c0 .23-.187.416-.417.416h-.833a.417.417 0 01-.417-.416V7.083c0-.23.187-.416.417-.416H2.5zm11.768.46A4.153 4.153 0 0115.417 10c0 1.12-.442 2.137-1.162 2.886a.388.388 0 01-.555-.007l-.577-.578c-.176-.176-.156-.467.009-.655A2.49 2.49 0 0013.75 10a2.49 2.49 0 00-.61-1.636c-.163-.188-.182-.477-.006-.653l.578-.578a.388.388 0 01.556-.006z" fill="#fff"></path></svg>`,
  volumeLarge: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-volume"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.867 2.5h.55c.44 0 .799.34.83.771l.003.062v13.334c0 .44-.34.799-.771.83l-.062.003h-.55a.833.833 0 01-.444-.128l-.064-.045-4.867-3.744a.831.831 0 01-.322-.59l-.003-.07V7.077c0-.235.099-.458.271-.615l.054-.045L9.36 2.673a.832.832 0 01.43-.17l.078-.003h.55-.55zm6.767 2.278A7.474 7.474 0 0118.75 10a7.477 7.477 0 01-2.128 5.234.4.4 0 01-.57-.004l-.587-.586a.442.442 0 01.005-.617A5.812 5.812 0 0017.083 10c0-1.557-.61-2.97-1.603-4.017a.442.442 0 01-.003-.615l.586-.586a.4.4 0 01.57-.004zM2.5 6.667c.23 0 .417.186.417.416v5.834c0 .23-.187.416-.417.416h-.833a.417.417 0 01-.417-.416V7.083c0-.23.187-.416.417-.416H2.5zm11.768.46A4.153 4.153 0 0115.417 10c0 1.12-.442 2.137-1.162 2.886a.388.388 0 01-.555-.007l-.577-.578c-.176-.176-.156-.467.009-.655A2.49 2.49 0 0013.75 10a2.49 2.49 0 00-.61-1.636c-.163-.188-.182-.477-.006-.653l.578-.578a.388.388 0 01.556-.006z" fill="#fff"></path></svg>`,
  volumeMuted: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-volume-mute"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.045 2.5h.55c.44 0 .8.34.831.771l.003.062v13.334c0 .44-.34.799-.771.83l-.063.003h-.55a.833.833 0 01-.443-.128l-.065-.045-4.866-3.744a.831.831 0 01-.323-.59l-.003-.07V7.077c0-.235.1-.458.272-.615l.054-.045 4.866-3.744a.832.832 0 01.43-.17l.078-.003h.55-.55zM2.68 6.667c.23 0 .416.186.416.416v5.834c0 .23-.186.416-.416.416h-.834a.417.417 0 01-.416-.416V7.083c0-.23.186-.416.416-.416h.834zm10.467.294a.417.417 0 01.59 0l1.767 1.768L17.27 6.96a.417.417 0 01.589 0l.59.59a.417.417 0 010 .589L16.68 9.908l1.768 1.767c.15.15.162.387.035.55l-.035.04-.589.589a.417.417 0 01-.59 0l-1.767-1.768-1.768 1.768a.417.417 0 01-.59 0l-.588-.59a.417.417 0 010-.589l1.767-1.768-1.767-1.767a.417.417 0 01-.035-.55l.035-.04.589-.589z" fill="#fff"></path></svg>`,
  pipIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-get-pip">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 4.3H3.5C3.38954 4.3 3.3 4.38954 3.3 4.5V15.5C3.3 15.6105 3.38954 15.7 3.5 15.7H8.50005L8.50006 17.5H3.5C2.39543 17.5 1.5 16.6046 1.5 15.5V4.5C1.5 3.39543 2.39543 2.5 3.5 2.5H16.5C17.6046 2.5 18.5 3.39543 18.5 4.5V8.5H16.7V4.5C16.7 4.38954 16.6105 4.3 16.5 4.3ZM12 11.5C11.4477 11.5 11 11.9477 11 12.5L11 16.5C11 17.0523 11.4478 17.5 12 17.5H17.5C18.0523 17.5 18.5 17.0523 18.5 16.5L18.5 12.5C18.5 11.9477 18.0523 11.5 17.5 11.5H12Z" fill="white"></path>
    </svg>`,
  pipIconExit: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-exit-pip">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 4.3H3.5C3.38954 4.3 3.3 4.38954 3.3 4.5V15.5C3.3 15.6105 3.38954 15.7 3.5 15.7H8.50005L8.50006 17.5H3.5C2.39543 17.5 1.5 16.6046 1.5 15.5V4.5C1.5 3.39543 2.39543 2.5 3.5 2.5H16.5C17.6046 2.5 18.5 3.39543 18.5 4.5V8.5H16.7V4.5C16.7 4.38954 16.6105 4.3 16.5 4.3ZM12 11.5C11.4477 11.5 11 11.9477 11 12.5L11 16.5C11 17.0523 11.4478 17.5 12 17.5H17.5C18.0523 17.5 18.5 17.0523 18.5 16.5L18.5 12.5C18.5 11.9477 18.0523 11.5 17.5 11.5H12Z" fill="white"></path>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.4998 7.7C9.77595 7.7 9.9998 7.47614 9.9998 7.2V6.5C9.9998 6.22386 9.77595 6 9.4998 6H5.5402L5.52754 6.00016H5.5C5.22386 6.00016 5 6.22401 5 6.50016V10.4598C5 10.7359 5.22386 10.9598 5.5 10.9598H6.2C6.47614 10.9598 6.7 10.7359 6.7 10.4598V8.83005L8.76983 10.9386C8.96327 11.1357 9.27984 11.1386 9.47691 10.9451L9.97645 10.4548C10.1735 10.2613 10.1764 9.94476 9.983 9.7477L7.97289 7.7H9.4998Z" fill="white"></path>
    </svg>`,
  openDanmu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1152 1024" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-danmu-open"><path fill="#fff" d="M311.467 661.333c0 4.267-4.267 8.534-8.534 12.8 0 4.267 0 4.267-4.266 8.534h-12.8c-4.267 0-8.534-4.267-17.067-8.534-8.533-8.533-17.067-8.533-25.6-8.533-8.533 0-12.8 4.267-17.067 12.8-4.266 12.8-8.533 21.333-4.266 29.867 4.266 8.533 12.8 17.066 25.6 21.333 17.066 8.533 34.133 17.067 46.933 17.067 12.8 0 21.333-4.267 34.133-8.534 8.534-4.266 17.067-17.066 25.6-29.866 8.534-12.8 12.8-34.134 17.067-55.467 4.267-21.333 4.267-51.2 4.267-85.333 0-12.8 0-21.334-4.267-29.867 0-8.533-4.267-12.8-8.533-17.067-4.267-4.266-8.534-8.533-12.8-8.533-4.267 0-12.8-4.267-21.334-4.267h-55.466s-4.267-4.266 0-8.533l4.266-38.4c0-4.267 0-8.533 4.267-8.533h46.933c17.067 0 25.6-4.267 34.134-12.8 8.533-8.534 12.8-21.334 12.8-42.667v-72.533c0-17.067-4.267-34.134-8.534-42.667-12.8-12.8-25.6-17.067-42.666-17.067H243.2c-8.533 0-17.067 0-21.333 4.267-4.267 8.533-4.267 12.8-4.267 25.6 0 8.533 0 17.067 4.267 21.333 4.266 4.267 12.8 8.534 21.333 8.534h64c4.267 0 8.533 0 8.533 4.266v34.134c0 8.533 0 12.8-4.266 12.8 0 0-4.267 4.266-8.534 4.266H268.8c-8.533 0-12.8 0-21.333 4.267-4.267 0-8.534 4.267-8.534 4.267-4.266 4.266-8.533 12.8-8.533 17.066 0 8.534-4.267 17.067-4.267 25.6l-8.533 72.534v29.866c0 8.534 4.267 12.8 8.533 17.067 4.267 4.267 8.534 4.267 17.067 8.533h68.267c4.266 0 8.533 0 8.533 4.267s4.267 8.533 4.267 17.067c0 21.333 0 42.666-4.267 55.466 0 8.534-4.267 21.334-8.533 25.6zM896 486.4c-93.867 0-174.933 51.2-217.6 123.733H571.733V576H640c21.333 0 34.133-4.267 42.667-12.8 8.533-8.533 12.8-21.333 12.8-42.667V358.4c0-21.333-4.267-34.133-12.8-42.667-8.534-8.533-21.334-12.8-42.667-12.8 0-4.266 4.267-4.266 4.267-8.533-4.267 0-4.267-4.267-4.267-4.267 4.267-12.8 8.533-21.333 4.267-25.6 0-8.533-4.267-12.8-12.8-21.333-8.534-4.267-17.067-4.267-21.334-4.267-8.533 4.267-12.8 8.534-21.333 21.334-4.267 8.533-8.533 12.8-12.8 21.333-4.267 8.533-8.533 12.8-12.8 21.333H512c-4.267-8.533-8.533-17.066-8.533-21.333-4.267-8.533-8.534-12.8-12.8-21.333-4.267-12.8-12.8-17.067-21.334-17.067s-17.066 0-25.6 8.533c-8.533 8.534-12.8 12.8-12.8 21.334s0 17.066 8.534 25.6l4.266 4.266L448 307.2c-17.067 0-29.867 4.267-38.4 12.8-8.533 4.267-12.8 21.333-12.8 38.4v157.867c0 21.333 4.267 34.133 12.8 42.666 8.533 8.534 21.333 12.8 42.667 12.8H512v34.134h-98.133c-12.8 0-21.334 0-25.6 4.266-4.267 4.267-8.534 8.534-8.534 21.334v17.066c0 4.267 4.267 8.534 4.267 8.534 4.267 0 4.267 4.266 8.533 4.266H512V716.8c0 12.8 4.267 21.333 8.533 25.6 4.267 4.267 12.8 8.533 21.334 8.533 12.8 0 21.333-4.266 25.6-8.533 4.266-4.267 4.266-12.8 4.266-25.6v-55.467H652.8c-8.533 25.6-12.8 51.2-12.8 76.8 0 140.8 115.2 256 256 256s256-115.2 256-256S1036.8 486.4 896 486.4zm-328.533-128h55.466c4.267 0 4.267 0 4.267 4.267V409.6h-59.733v-51.2zm0 102.4H627.2V512h-55.467v-51.2zM512 516.267h-55.467v-51.2H512v51.2zm0-102.4h-59.733V362.667H512v51.2zm384 499.2c-93.867 0-170.667-76.8-170.667-170.667S802.133 571.733 896 571.733s170.667 76.8 170.667 170.667S989.867 913.067 896 913.067z"></path><path fill="#fff" d="M951.467 669.867 878.933 742.4l-29.866-25.6C832 699.733 806.4 704 789.333 721.067c-17.066 17.066-12.8 42.666 4.267 59.733l59.733 51.2c8.534 8.533 17.067 8.533 29.867 8.533s21.333-4.266 29.867-12.8l102.4-102.4c17.066-17.066 17.066-42.666 0-59.733-21.334-12.8-46.934-12.8-64 4.267zm-371.2 209.066H213.333c-72.533 0-128-55.466-128-119.466V230.4c0-64 55.467-119.467 128-119.467h512c72.534 0 128 55.467 128 119.467v140.8c0 25.6 17.067 42.667 42.667 42.667s42.667-17.067 42.667-42.667V230.4c0-115.2-93.867-204.8-213.334-204.8h-512C93.867 25.6 0 119.467 0 230.4v529.067c0 115.2 93.867 204.8 213.333 204.8h366.934c25.6 0 42.666-17.067 42.666-42.667s-21.333-42.667-42.666-42.667z"></path></svg>`,
  closeDanmu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1152 1024" width="20" height="20" viewBox="0 0 20 20" fill="none" class="xg-danmu-close"><path fill="#fff" d="M311.296 661.504c0 4.096-4.096 8.704-8.704 12.8 0 4.096 0 4.096-4.096 8.704h-12.8c-4.096 0-8.704-4.096-16.896-8.704-8.704-8.704-16.896-8.704-25.6-8.704s-12.8 4.096-16.896 12.8c-4.096 12.8-8.704 21.504-4.096 29.696 4.096 8.704 12.8 16.896 25.6 21.504 16.896 8.704 34.304 16.896 47.104 16.896 12.8 0 21.504-4.096 34.304-8.704 8.704-4.096 16.896-16.896 25.6-29.696s12.8-34.304 16.896-55.296c4.096-21.504 4.096-51.2 4.096-85.504 0-12.8 0-21.504-4.096-29.696 0-8.704-4.096-12.8-8.704-16.896-4.096-4.096-8.704-8.704-12.8-8.704s-12.8-4.096-21.504-4.096h-55.808s-4.096-4.096 0-8.704l4.096-38.4c0-4.096 0-8.704 4.096-8.704h47.104c16.896 0 25.6-4.096 34.304-12.8s12.8-21.504 12.8-42.496v-72.704c0-16.896-4.096-34.304-8.704-42.496-12.8-12.8-25.6-16.896-42.496-16.896H243.2c-8.704 0-16.896 0-21.504 4.096-4.096 8.704-4.096 12.8-4.096 25.6 0 8.704 0 16.896 4.096 21.504 4.096 4.096 12.8 8.704 21.504 8.704h64c4.096 0 8.704 0 8.704 4.096v34.304c0 8.704 0 12.8-4.096 12.8 0 0-4.096 4.096-8.704 4.096H268.8c-8.704 0-12.8 0-21.504 4.096-4.096 0-8.704 4.096-8.704 4.096-4.096 4.096-8.704 12.8-8.704 16.896 0 8.704-4.096 16.896-4.096 25.6l-8.704 72.704v29.696c0 8.704 4.096 12.8 8.704 16.896s8.704 4.096 16.896 8.704h68.096c4.096 0 8.704 0 8.704 4.096s4.096 8.704 4.096 16.896c0 21.504 0 42.496-4.096 55.296.512 9.216-3.584 22.016-8.192 26.624zM896 486.4c-93.696 0-175.104 51.2-217.6 123.904H571.904V576H640c21.504 0 34.304-4.096 42.496-12.8 8.704-8.704 12.8-21.504 12.8-42.496V358.4c0-21.504-4.096-34.304-12.8-42.496-8.704-8.704-21.504-12.8-42.496-12.8 0-4.096 4.096-4.096 4.096-8.704-4.096 0-4.096-4.096-4.096-4.096 4.096-12.8 8.704-21.504 4.096-25.6 0-8.704-4.096-12.8-12.8-21.504-8.704-4.096-16.896-4.096-21.504-4.096-8.704 4.096-12.8 8.704-21.504 21.504-4.096 8.704-8.704 12.8-12.8 21.504s-8.704 12.8-12.8 21.504h-51.2c-4.096-8.704-8.704-16.896-8.704-21.504-4.096-8.704-8.704-12.8-12.8-21.504-4.096-12.8-12.8-16.896-21.504-16.896s-16.896 0-25.6 8.704-12.8 12.8-12.8 21.504 0 16.896 8.704 25.6l4.096 4.096 4.096 4.096c-16.896 0-29.696 4.096-38.4 12.8-8.704 4.096-12.8 21.504-12.8 38.4v157.696c0 21.504 4.096 34.304 12.8 42.496 8.704 8.704 21.504 12.8 42.496 12.8H512v34.304h-98.304c-12.8 0-21.504 0-25.6 4.096s-8.704 8.704-8.704 21.504v16.896c0 4.096 4.096 8.704 4.096 8.704 4.096 0 4.096 4.096 8.704 4.096H512V716.8c0 12.8 4.096 21.504 8.704 25.6 4.096 4.096 12.8 8.704 21.504 8.704 12.8 0 21.504-4.096 25.6-8.704 4.096-4.096 4.096-12.8 4.096-25.6v-55.296H652.8c-8.704 25.6-12.8 51.2-12.8 76.8 0 140.8 115.2 256 256 256s256-115.2 256-256S1036.8 486.4 896 486.4zm-328.704-128h55.296c4.096 0 4.096 0 4.096 4.096V409.6h-59.904v-51.2zm0 102.4H627.2V512h-55.296v-51.2h-4.608zM512 516.096h-55.296v-51.2H512v51.2zm0-102.4h-59.904v-51.2H512v51.2zm384 499.2c-93.696 0-170.496-76.8-170.496-170.496S802.304 571.904 896 571.904s170.496 76.8 170.496 170.496S989.696 912.896 896 912.896z"></path><path fill="#fff" d="M580.096 879.104H213.504c-72.704 0-128-55.296-128-119.296V230.4c0-64 55.296-119.296 128-119.296h512c72.704 0 128 55.296 128 119.296v140.8c0 25.6 16.896 42.496 42.496 42.496s42.496-16.896 42.496-42.496V230.4c0-115.2-93.696-204.8-213.504-204.8h-512C93.696 25.6 0 119.296 0 230.4v528.896c0 115.2 93.696 204.8 213.504 204.8h367.104c25.6 0 42.496-16.896 42.496-42.496s-21.504-42.496-43.008-42.496zm171.52 10.752c-15.36-15.36-15.36-40.96 0-56.32l237.568-237.568c15.36-15.36 40.96-15.36 56.32 0s15.36 40.96 0 56.32L807.936 889.856c-15.36 15.36-40.448 15.36-56.32 0z"></path></svg>`,
  setting: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -1 20 20" fill="none" class="xg-icon-setting"><path d="M11.485 18h-4.97a2.978 2.978 0 0 1-2.121-.879L.879 13.606A2.976 2.976 0 0 1 0 11.485v-4.97c0-.802.312-1.555.879-2.121L4.394.879A2.976 2.976 0 0 1 6.515 0h4.971c.801 0 1.555.312 2.121.879l3.515 3.515A2.98 2.98 0 0 1 18 6.515v4.971c0 .801-.312 1.555-.879 2.121l-3.515 3.515a2.98 2.98 0 0 1-2.121.878zM6.515 2c-.264 0-.521.107-.707.293L2.293 5.808A1.006 1.006 0 0 0 2 6.515v4.971c0 .263.107.521.293.707l3.515 3.515c.186.185.443.292.707.292h4.971c.263 0 .521-.107.707-.293l3.515-3.515a1.01 1.01 0 0 0 .292-.707v-4.97c0-.263-.107-.521-.293-.707l-3.515-3.515A1.006 1.006 0 0 0 11.485 2h-4.97z"></path><path d="M10.243 13H7.757a.997.997 0 0 1-.707-.293L5.293 10.95A1 1 0 0 1 5 10.243V7.757c0-.265.105-.52.293-.707L7.05 5.293A1 1 0 0 1 7.757 5h2.485c.265 0 .52.105.707.293l1.757 1.757a.996.996 0 0 1 .294.707v2.485c0 .265-.105.52-.293.707l-1.757 1.757a.996.996 0 0 1-.707.294zm-2.072-2h1.657L11 9.829V8.171L9.829 7H8.171L7 8.171v1.657L8.171 11z"></path></svg>`,
};

const publicColor = {
  theme: '#00e038',
};

const publicElementDeal = {
  nplayer: {
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
  },
  dplayer: {
    replace: (el: string, newEle: string) => {
      const controlSetting = document.querySelector(el);
      const svgToReplace: any = controlSetting?.querySelector('svg');
      if (svgToReplace)
        svgToReplace.parentNode.replaceChild(
          document.createRange().createContextualFragment(newEle).firstChild,
          svgToReplace,
        );
    },
  },
};

const publicBarrageSend = (url: string, options: any) => {
  const okd = new FormData();
  okd.append('player', options.id);
  okd.append('text', options.text);
  okd.append('time', options.time);
  okd.append('color', options.color);
  okd.append('type', options.type);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.send(okd);
};

const publicListener = {
  xgplayer: {
    timeupdate: (currentTime, duration, callback) => {
      callback({ currentTime, duration });
    },
  },
  artplayer: {},
  dplayer: {},
  nplayer: {},
};

// 流公共部分参数
const publicStream = {
  create: {
    customHls: (video: HTMLVideoElement, url: string): Hls => {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return hls;
    },
    customFlv: (video: HTMLVideoElement, url: string) => {
      const flv = flvjs.createPlayer({
        type: 'flv',
        url: url,
      });
      flv.attachMediaElement(video);
      flv.load();
      return flv;
    },
    customTorrent: (video: HTMLVideoElement, url: string) => {
      const client = new WebTorrent();
      const torrentId = url;
      client.add(torrentId, (torrent) => {
        const file = torrent.files.find((file) => file.name.endsWith('.mp4') || file.name.endsWith('.mkv'));
        file.renderTo(video, {
          autoplay: true,
        });
      });
      return client;
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
  },
};

// 西瓜、火山公共部分参数
const publicConfigVeXg = {
  url: '',
  autoplay: true,
  pip: true,
  cssFullscreen: false,
  startTime: 0,
  playbackRate: {
    list: [
      2,
      1.5,
      1.25,
      {
        rate: 1,
        iconText: {
          zh: '倍速',
        },
      },
      0.75,
      0.5,
    ],
    index: 7,
  },
  time: {
    index: 0,
  },
  icons: {
    play: publicIcons.play,
    pause: publicIcons.pause,
    playNext: publicIcons.playNext,
    fullscreen: publicIcons.fullscreen,
    exitFullscreen: publicIcons.exitFullscreen,
    volumeSmall: publicIcons.volumeSmall,
    volumeLarge: publicIcons.volumeLarge,
    volumeMuted: publicIcons.volumeMuted,
    pipIcon: publicIcons.pipIcon,
    pipIconExit: publicIcons.pipIconExit,
    openDanmu: publicIcons.openDanmu,
    closeDanmu: publicIcons.closeDanmu,
  },
  commonStyle: {
    playedColor: publicColor.theme, // 播放完成部分进度条底色
    volumeColor: publicColor.theme, // 音量颜色
  },
  width: 'auto',
  height: 'calc(100vh - 56px)',
};

// 播放器配置
let playerConfig: any = {
  xgplayer: {
    ...publicConfigVeXg,
    url: '',
    type: '',
    id: 'xgplayer',
    enableContextmenu: true,
    danmu: {
      panel: false,
      comments: [],
      area: { start: 0, end: 0.3 },
      defaultOff: true, //开启此项后弹幕不会初始化，默认初始化弹幕
    },
    plugins: [Danmu],
  },
  dplayer: {
    container: document.getElementById('dplayer'),
    autoplay: true,
    screenshot: false,
    live: false,
    video: {
      url: '',
      type: '',
      customType: {
        customHls: (video: HTMLVideoElement, _: DPlayer) => {
          publicStream.create.customHls(video, video.src);
        },
        customFlv: (video: HTMLVideoElement, _: DPlayer) => {
          publicStream.create.customFlv(video, video.src);
        },
        customWebTorrent: (video: HTMLVideoElement, _: DPlayer) => {
          publicStream.create.customTorrent(video, video.src);
        },
      },
    },
    danmaku: {
      id: '', //必填，视频id, 用于下面api请求时使用
      api: 'http://127.0.0.1:9978/api/v1/barrge/', //必填，叫后台提供
      addition: [], //可选，额外的弹幕
      user: 'ZyPlayer', //弹幕作者
      bottom: '15%',
      unlimited: true,
    },
  },
  artplayer: {
    container: document.getElementById('artplayer'),
    url: '',
    type: '',
    theme: publicColor.theme,
    autoplay: true,
    playbackRate: true,
    fullscreen: true,
    pip: true,
    setting: true,
    flip: true,
    hotkey: true,
    isLive: false,
    plugins: [
      artplayerPluginDanmuku({
        speed: 5,
        danmuku: [],
        useWorker: true,
      }),
    ],
    icons: {
      play: publicIcons.play,
      pause: publicIcons.pause,
      volume: publicIcons.volumeLarge,
      volumeClose: publicIcons.volumeMuted,
      pip: publicIcons.pipIcon,
      fullscreenOn: publicIcons.fullscreen,
      fullscreenOff: publicIcons.exitFullscreen,
      setting: publicIcons.setting,
    },
    customType: {
      customHls: (video: HTMLVideoElement, url: string, art: Artplayer) => {
        if (art.hls) art.hls.destroy();
        const hls = publicStream.create.customHls(video, url);
        art.hls = hls;
        art.on('destroy', () => hls.destroy());
      },
      customFlv: (video: HTMLVideoElement, url: string, art: Artplayer) => {
        if (art.flv) art.flv.destroy();
        const flv = publicStream.create.customFlv(video, url);
        art.flv = flv;
        art.on('destroy', () => flv.destroy());
      },
      customWebTorrent: (video: HTMLVideoElement, url: string, art: Artplayer) => {
        if (art.torrent) art.torrent.destroy();
        art.loading.show = true;
        const torrent = publicStream.create.customTorrent(video, url);
        art.flv = torrent;
        art.loading.show = false;
      },
    },
  },
  nplayer: {
    container: document.getElementById('nplayer'),
    src: '',
    live: false,
    videoProps: { autoplay: 'true' },
    bpControls: {
      500: [['play', 'volume', 'time', 'spacer', 'settings', 'fullscreen'], ['progress']],
    },
    controls: [['play', 'volume', 'time', 'spacer', 'settings', 'fullscreen'], ['progress']],
    plugins: [new nplayerDanmaku({ autoInsert: true })],
  },
};

// 播放器公共部分
const playerMethod = {
  xgplayer: {
    barrge: (player: XgPlayer, comments: any, url: string, id: string) => {
      player.plugins.danmu.updateComments(comments, true);
      // player.getPlugin('danmu').updateComments(comments, true); // 效果一样
      // player.plugins.danmu.sendComment({
      //   duration: 5000, //弹幕持续显示时间,毫秒(最低为5000毫秒)
      //   id: nanoid(), //弹幕id，需唯一
      //   start: player.currentTime * 1000, //弹幕出现时间，毫秒
      //   color: true, //该条弹幕为彩色弹幕，默认false
      //   txt: '', //弹幕文字内容
      //   style: {
      //     //弹幕自定义样式
      //     color: '#FFFFFF',
      //   },
      // }); // 应插件内实现
    },
    create: (options: any): XgPlayer => {
      const plugins = options.plugins;
      switch (options.type) {
        case 'customMp4':
          options.plugins = [...plugins, Mp4Plugin];
          break;
        case 'customFlv':
          options.plugins = [...plugins, FlvPlugin];
          break;
        case 'customHls':
          options.plugins = [...plugins, HlsPlugin];
          break;
        case 'customWebTorrent':
          break;
        default:
          break;
      }
      delete options.type;
      if (options.isLive) {
        SimplePlayer.defaultPreset = LivePreset;
        return new SimplePlayer({ ...options });
      } else {
        return new XgPlayer({ ...options });
      }
    },
    currentTime: (player: XgPlayer): number => {
      return player.currentTime || 0;
    },
    destroy: (player: XgPlayer) => {
      player.destroy();
    },
    duration: (player: XgPlayer): number => {
      return player.duration || 0;
    },
    pause: (player: XgPlayer) => {
      player.pause();
    },
    play: (player: XgPlayer) => {
      player.play();
    },
    playNext: (player: XgPlayer, options: any) => {
      switch (options.type) {
        case 'customMp4':
          options.plugins = [Danmu, Mp4Plugin];
          break;
        case 'customFlv':
          options.plugins = [Danmu, FlvPlugin];
          break;
        case 'customHls':
          options.plugins = [Danmu, HlsPlugin];
          break;
        case 'customWebTorrent':
          break;
        default:
          break;
      }
      player.playNext({ url: options.url });
      player.plugins.danmu.clear();
    },
    seek: (player: XgPlayer, time: number) => {
      player.seek(time);
    },
    time: (player: XgPlayer) => {
      return {
        currentTime: player.currentTime || 0,
        duration: player.duration || 0,
      };
    },
    offBarrage: (player: XgPlayer) => {
      // player.offAll();
      // 无该事件
    },
    onTimeupdate: (player: XgPlayer) => {
      player.on(Events.TIME_UPDATE, ({ currentTime, duration }) => {
        return { currentTime, duration };
      });
    },
    offTimeupdate: (player: XgPlayer) => {
      // player.offAll();
      // @ts-ignore
      player._events.timeupdate = [];
      // player.off(Events.TIME_UPDATE, () => {}); // 不生效
    },
    toggle: (player: XgPlayer) => {
      if (player.paused) player.play();
      else player.pause();
    },
    volume: (player: Artplayer, volume: number) => {
      player.volume = volume;
    },
  },
  dplayer: {
    barrge: (player: DPlayer, comments: any, url: string, id: string) => {
      const video = player.options.video;
      let danmaku: any = player.options.danmaku;
      danmaku.id = comments;
      const time = player.video.currentTime;
      player.switchVideo({ ...video }, { ...danmaku });
      if (time) player.seek(time);
    },
    create: (options: any): CustomDPlayer => {
      const player = new CustomDPlayer({ ...options });
      // 元素替换，原生太丑
      publicElementDeal.dplayer.replace('.dplayer-comment-icon', publicIcons.danmu);
      publicElementDeal.dplayer.replace('.dplayer-setting-icon', publicIcons.setting);
      publicElementDeal.dplayer.replace('.dplayer-full-icon', publicIcons.fullscreen);

      return player;
    },
    currentTime: (player: DPlayer): number => {
      return player.video.currentTime || 0;
    },
    destroy: (player: DPlayer) => {
      player.destroy();
    },
    duration: (player: DPlayer): number => {
      return player.video.duration || 0;
    },
    pause: (player: DPlayer) => {
      player.pause();
    },
    play: (player: DPlayer) => {
      player.play();
    },
    playNext: (player: DPlayer, options: any) => {
      const danmaku: any = player.options.danmaku;
      player.switchVideo({ ...options }, { ...danmaku });
      player.danmaku.clear();
      player.play();
    },
    seek: (player: DPlayer, time: number) => {
      player.seek(time);
    },
    speed: (player: DPlayer, time: number) => {
      player.speed(time);
    },
    time: (player: DPlayer): { currentTime: number; duration: number } => {
      return {
        currentTime: player.video.currentTime || 0,
        duration: player.video.duration || 0,
      };
    },
    onTimeupdate: (player: DPlayer) => {
      player.on('timeupdate', () => {
        if (player?.video) {
          return {
            currentTime: player.video.currentTime || 0,
            duration: player.video.duration || 0,
          };
        }
      });
    },
    offBarrage: (player: DPlayer) => {
      // 弹幕组件会直接提交后端
    },
    offTimeupdate: (player: CustomDPlayer) => {
      player.off('timeupdate');
    },
    toggle: (player: DPlayer) => {
      player.toggle();
    },
    volume: (player: DPlayer, volume: number) => {
      player.volume(volume, true, false);
    },
  },
  artplayer: {
    barrge: (player: Artplayer, comments: any, url: string, id: string) => {
      player.plugins.artplayerPluginDanmuku.config({
        danmuku: comments,
      });
      player.plugins.artplayerPluginDanmuku.load();
      // @ts-ignore
      player.on('artplayerPluginDanmuku:emit', (danmu: any) => {
        const options = {
          player: id,
          text: danmu.text,
          time: danmu.time,
          color: danmu.color,
          type: danmu.mode == 1 ? '5' : '0',
        };
        publicBarrageSend(url, options);
        // player.plugins.artplayerPluginDanmuku.emit({
        //   text: danmu.text,
        //   color: danmu.color,
        //   border: true,
        // }); // 会重复显示
      });
    },
    create: (options: any): Artplayer => {
      Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2];
      return new Artplayer({ ...options });
    },
    currentTime: (player: Artplayer): number => {
      return player.video.currentTime || 0;
    },
    destroy: (player: Artplayer) => {
      player.destroy();
    },
    duration: (player: Artplayer): number => {
      return player.video.duration || 0;
    },
    pause: (player: Artplayer) => {
      player.pause();
    },
    play: (player: Artplayer) => {
      player.play();
    },
    playNext: (player: Artplayer, options: any) => {
      player.switch = options.url;
      // player.switchUrl(options.url);
      player.plugins.artplayerPluginDanmuku.config({
        danmuku: [],
      });
      player.plugins.artplayerPluginDanmuku.load();
    },
    seek: (player: Artplayer, time: number) => {
      player.once('ready', () => {
        player.seek = time;
      });
    },
    time: (player: Artplayer): { currentTime: number; duration: number } => {
      return {
        currentTime: player.video.currentTime || 0,
        duration: player.video.duration || 0,
      };
    },
    onTimeupdate: (player: Artplayer) => {
      player.on('video:timeupdate', () => {
        return {
          currentTime: player.video.currentTime || 0,
          duration: player.video.duration || 0,
        };
      });
    },
    offBarrage: (player: Artplayer) => {
      // @ts-ignore
      player.off('artplayerPluginDanmuku:emit');
    },
    offTimeupdate: (player: Artplayer) => {
      player.off('video:timeupdate');
    },
    toggle: (player: Artplayer) => {
      player.toggle();
    },
    volume: (player: Artplayer, volume: number) => {
      player.volume = volume;
    },
  },
  nplayer: {
    barrge: (player: NPlayer, comments: any, url: string, id: string) => {
      player.danmaku.resetItems(comments);
      player.on('DanmakuSend', (danmu) => {
        const options = {
          player: id,
          text: danmu.text,
          time: danmu.time,
          color: danmu.color,
          type: danmu.type,
        };
        publicBarrageSend(url, options);
      });
    },
    create: (options: any): NPlayer => {
      NPlayerIcon.register('play', publicElementDeal.nplayer.createIcon(publicIcons.play));
      NPlayerIcon.register('pause', publicElementDeal.nplayer.createIcon(publicIcons.pause));
      NPlayerIcon.register('volume', publicElementDeal.nplayer.createIcon(publicIcons.volumeLarge));
      NPlayerIcon.register('muted', publicElementDeal.nplayer.createIcon(publicIcons.volumeMuted));
      NPlayerIcon.register('cog', publicElementDeal.nplayer.createIcon(publicIcons.setting));
      NPlayerIcon.register('enterFullscreen', publicElementDeal.nplayer.createIcon(publicIcons.fullscreen));
      NPlayerIcon.register('exitFullscreen', publicElementDeal.nplayer.createIcon(publicIcons.exitFullscreen));

      const player: any = new NPlayer({ ...options });
      switch (options.type) {
        case 'customMp4':
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
          player.on('destroy', () => hls.destroy());
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
      publicElementDeal.nplayer.replace(
        '.nplayer_control_setting',
        `<div class="nplayer_icon">${publicIcons.danmu}</div>`,
      );

      return player;
    },
    currentTime: (player: NPlayer): number => {
      return player.currentTime || 0;
    },
    destroy: (player: NPlayer) => {
      player.dispose();
    },
    duration: (player: NPlayer): number => {
      return player.duration || 0;
    },
    pause: (player: NPlayer) => {
      player.pause();
    },
    play: (player: NPlayer) => {
      player.play();
    },
    playNext: (player: any, options: any) => {
      switch (options.type) {
        case 'customMp4':
          break;
        case 'customFlv':
          let flv;
          if (player?.flv) {
            flv = publicStream.switch.customFlv(player.video, player.flv, options.url);
          } else {
            if (player.hls) {
              player.hls.destroy();
              player.hls = null;
            }
            if (player.torrent) {
              player.torrent.destroy();
              player.torrent = null;
            }

            flv = publicStream.create.customFlv(player.video, options.url);
            player.on('destroy', () => flv.destroy());
          }
          player.flv = flv;
          break;
        case 'customHls':
          let hls;
          if (player?.hls) {
            hls = publicStream.switch.customHls(player.video, player.hls, options.url);
          } else {
            if (player.flv) {
              player.flv.destroy();
              player.flv = null;
            }
            if (player.torrent) {
              player.torrent.destroy();
              player.torrent = null;
            }

            hls = publicStream.create.customHls(player.video, options.url);
            player.on('destroy', () => hls.destroy());
          }
          player.hls = hls;
          break;
        case 'customWebTorrent':
          let torrent;
          if (player?.torrent) {
            torrent = publicStream.switch.customHls(player.video, player.torrent, options.url);
          } else {
            if (player.flv) {
              player.flv.destroy();
              player.flv = null;
            }
            if (player.hls) {
              player.hls.destroy();
              player.hls = null;
            }

            torrent = publicStream.create.customTorrent(player.video, options.src);
            player.on('destroy', () => torrent.destroy());
          }
          player.torrent = torrent;
          break;
        default:
          break;
      }

      player.danmaku.clearScreen();
    },
    seek: (player: NPlayer, time: number) => {
      player.once(NPlayerEvent.CANPLAY, () => {
        player.seek(time);
      });
    },
    time: (player: NPlayer): { currentTime: number; duration: number } => {
      return {
        currentTime: player.currentTime || 0,
        duration: player.duration || 0,
      };
    },
    onTimeupdate: (player: NPlayer) => {
      player.on(NPlayerEvent.TIME_UPDATE, () => {
        return {
          currentTime: player.currentTime || 0,
          duration: player.duration || 0,
        };
      });
    },
    offBarrage: (player: NPlayer) => {
      player.off('DanmakuSend');
    },
    offTimeupdate: (player: NPlayer) => {
      player.off(NPlayerEvent.TIME_UPDATE);
    },
    toggle: (player: NPlayer) => {
      player.toggle();
    },
    volume: (player: NPlayer, volume: number) => {
      player.volume = volume;
    },
  },
};

// 映射媒体类型
const mapVideoTypeToPlayerType = (videoType: string): string | undefined => {
  switch (videoType) {
    case 'mp4':
      return 'customMp4';
    case 'flv':
      return 'customFlv';
    case 'm3u8':
      return 'customHls';
    case 'magnet':
      return 'customWebTorrent';
    default:
      return 'customHls';
  }
};

// 创建播放器
const playerCreate = async (
  url: string,
  type: string,
  container: string | Element,
  playerMode: string,
  videoType: string = '',
) => {
  const isLive = type === 'iptv' ? await checkLiveM3U8(url) : false;
  videoType = videoType || (await checkMediaType(url)) || '';

  const creators = {
    xgplayer: playerMethod.xgplayer.create,
    artplayer: playerMethod.artplayer.create,
    dplayer: playerMethod.dplayer.create,
    nplayer: playerMethod.nplayer.create,
  };

  let config = playerConfig[playerMode];
  const creator = creators[playerMode];
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

  return creator(config);
};

// 摧毁播放器
const playerDestroy = (player: any, playerMode: string) => {
  const destroys = {
    xgplayer: playerMethod.xgplayer.destroy,
    artplayer: playerMethod.artplayer.destroy,
    dplayer: playerMethod.dplayer.destroy,
    nplayer: playerMethod.nplayer.destroy,
  };
  const destroy = destroys[playerMode];

  destroy(player);
};

// 进度跳转
const playerSeek = (player: any, playerMode: string, time: number) => {
  const seeks = {
    xgplayer: playerMethod.xgplayer.seek,
    artplayer: playerMethod.artplayer.seek,
    dplayer: playerMethod.dplayer.seek,
    nplayer: playerMethod.nplayer.seek,
  };
  const seek = seeks[playerMode];

  seek(player, time);
};

// 暂停
const playerPause = (player: any, playerMode: string) => {
  const pauses = {
    xgplayer: playerMethod.xgplayer.pause,
    artplayer: playerMethod.artplayer.pause,
    dplayer: playerMethod.dplayer.pause,
    nplayer: playerMethod.nplayer.pause,
  };
  const pause = pauses[playerMode];

  pause(player);
};

// 下一集
const playerNext = (player: any, playerMode: string, options: any) => {
  const nexts = {
    xgplayer: playerMethod.xgplayer.playNext,
    artplayer: playerMethod.artplayer.playNext,
    dplayer: playerMethod.dplayer.playNext,
    nplayer: playerMethod.nplayer.playNext,
  };
  const next = nexts[playerMode];

  let data = {
    url: options.url,
    type: mapVideoTypeToPlayerType(options.mediaType),
  };

  next(player, data);
};

// 播放进度
const playerTimeUpdate = (player: any, playerMode: string, callback: any) => {
  switch (playerMode) {
    case 'xgplayer':
      player.on(Events.TIME_UPDATE, ({ currentTime, duration }) => {
        callback({ currentTime, duration });
      });
      break;
    case 'dplayer':
      player.on('timeupdate', () => {
        if (player?.video) {
          callback({
            currentTime: player.video.currentTime || 0,
            duration: player.video.duration || 0,
          });
        }
      });
      break;
    case 'artplayer':
      player.on('video:timeupdate', () => {
        callback({
          currentTime: player.video.currentTime || 0,
          duration: player.video.duration || 0,
        });
      });
      break;
    case 'nplayer':
      player.on(NPlayerEvent.TIME_UPDATE, () => {
        callback({
          currentTime: player.currentTime || 0,
          duration: player.duration || 0,
        });
      });
      break;
  }
};

// 取消进度监听
const offPlayerTimeUpdate = (player, playerMode) => {
  const offTimeUpdates = {
    xgplayer: playerMethod.xgplayer.offTimeupdate,
    artplayer: playerMethod.artplayer.offTimeupdate,
    dplayer: playerMethod.dplayer.offTimeupdate,
    nplayer: playerMethod.nplayer.offTimeupdate,
  };
  const offTimeUpdate = offTimeUpdates[playerMode];

  offTimeUpdate(player);
};

// 弹幕加载
const playerBarrage = (player: any, playerMode: string, data: any, options: any, id: string) => {
  const barrges = {
    xgplayer: playerMethod.xgplayer.barrge,
    artplayer: playerMethod.artplayer.barrge,
    dplayer: playerMethod.dplayer.barrge,
    nplayer: playerMethod.nplayer.barrge,
  };
  const barrge = barrges[playerMode];

  const { start, mode, color, content, url } = options;
  let comments: any = [];
  let cleanedData: any = [];

  if (playerMode !== 'dplayer') {
    cleanedData = data;
  }

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
        border: false, // 是否显示描边
        mode: item[mode] === 'scroll' ? 1 : 0, // 弹幕模式: 0表示滚动, 1静止
      }));
      break;
    case 'nplayer':
      comments = cleanedData.map((item: any) => ({
        color: item[color],
        text: item[content],
        time: parseInt(item[start]),
        type: ['left', 'right'].includes(item[mode]) ? 'scroll' : item[mode],
        isMe: false,
        force: true,
      }));
      const newUnsortItems = [];
      comments = comments.concat(newUnsortItems).sort((a, b) => a.time - b.time);
      break;
  }

  barrge(player, comments, url, id);
};

// 取消弹幕监听
const offPlayerBarrage = (player, playerMode) => {
  const offBarrages = {
    xgplayer: playerMethod.xgplayer.offBarrage,
    artplayer: playerMethod.artplayer.offBarrage,
    dplayer: playerMethod.dplayer.offBarrage,
    nplayer: playerMethod.nplayer.offBarrage,
  };
  const offBarrage = offBarrages[playerMode];
  console.log(111)
  offBarrage(player);
};

export {
  playerBarrage,
  playerCreate,
  playerDestroy,
  playerNext,
  playerSeek,
  playerPause,
  playerTimeUpdate,
  offPlayerBarrage,
  offPlayerTimeUpdate,
};
