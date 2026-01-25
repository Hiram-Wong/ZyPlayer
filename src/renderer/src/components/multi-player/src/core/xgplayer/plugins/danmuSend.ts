import type { IXGI18nText } from 'xgplayer';
import { I18N, Plugin } from 'xgplayer';

const LANG = [
  {
    LANG: 'zh-cn',
    TEXT: {
      danmuSend: '发送',
      danmuPlaceholder: '请输入弹幕',
    },
  },
  {
    LANG: 'zh-hk',
    TEXT: {
      danmuSend: '發送',
      danmuPlaceholder: '請輸入彈幕',
    },
  },
  {
    LANG: 'en',
    TEXT: {
      danmuSend: 'Send',
      danmuPlaceholder: 'Please enter a comment',
    },
  },
];
I18N.extend(LANG as Array<IXGI18nText>);

const { POSITIONS } = Plugin;

export default class danmuSendPlugin extends Plugin {
  // 插件的名称，将作为插件实例的唯一key值
  static get pluginName() {
    return 'danmuSend';
  }

  static get defaultConfig() {
    return {
      position: POSITIONS.CONTROLS_CENTER,
      index: 0,
      showIcon: false,
      preferDocument: false,
      width: undefined,
      height: undefined,
      docPiPNode: undefined,
      docPiPStyle: undefined,
    };
  }

  constructor(args) {
    super(args);
  }

  beforePlayerInit() {
    // TODO 播放器调用start初始化播放源之前的逻辑
  }

  afterPlayerInit() {
    // TODO 播放器调用start初始化播放源之后的逻辑
  }

  sendBtnClick() {
    const danmuPlugin = this.player.getPlugin('danmu') || this.player.plugins.danmu;
    if (!danmuPlugin) return;

    const input = this.find('.danmu-input');
    const inputValue = (input as HTMLInputElement).value;
    if (!inputValue) return;

    const doc = {
      txt: inputValue,
      start: this.player.currentTime,
      mode: 'scroll', // 默认滚动弹幕
      style: {
        color: '#FFFFFF',
        fontSize: '24px',
      },
    };

    danmuPlugin.sendComment({
      ...doc,
      start: (doc.start + 0.3) * 1000, // 弹幕发送时间稍微延后一点
      duration: 5000,
      id: Date.now().toString(),
      prior: true,
    });

    this.emit('DANMAKU_SEND', doc);

    (input as HTMLInputElement).value = ''; // 清空输入框
  }

  afterCreate() {
    /**
     * 自定义插件 弹幕发送模块
     * root.__root__为根节点Vue模板data值
     */
    // 对当前插件根节点内部类名为.danmu-send的元素绑定click事件
    this.bind('.danmu-send', 'click', this.sendBtnClick);
    // TODO 插件实例化之后的一些逻辑
  }

  destroy() {
    this.unbind('.danmu-send', 'click', this.sendBtnClick);
    // 播放器销毁的时候一些逻辑
  }

  render() {
    const btnEl = `<div
      class="danmu-send"
      style="
        cursor: pointer;
        width: 60px;
        height: 100%;
        text-shadow: none;
        background-color: #00a1d6;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        justify-content: center;
        align-items: center;
        display: flex;"
      >
      ${(this.i18n as any).danmuSend}
    </div>`;

    const inputEl = `
      <input
        class="danmu-input"
        style="
          color: #fff;
          background-color: #0000;
          border: none;
          outline: none;
          flex: 1;
          width: auto;
          min-width: 0;
          padding: 0 6px;
          height: 100%;
          line-height: 1;
        "
        placeholder="${(this.i18n as any).danmuPlaceholder}"
      />
      `;

    return `
      <div class="danmu-send-plugin" style="
        height: 32px; max-width: 300px; margin: 0 auto;
        background-color: #1f1f1fe6; border-radius: 5px;
        display: flex; flex-direction: row;"
      >
        ${inputEl}
        ${btnEl}
      </div>`;
  }
}
