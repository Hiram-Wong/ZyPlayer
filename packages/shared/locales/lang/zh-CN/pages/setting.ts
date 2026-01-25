export default {
  title: '设置',
  nav: {
    baseConfig: '基础配置',
    dataManage: '数据配置',
    filmSource: '影视配置',
    liveSource: '直播配置',
    parseSource: '解析配置',
  },
  base: {
    bossKey: '老板键',
    timeout: '超时',
    hot: '热榜',
    site: {
      title: '站点',
      hotMap: {
        baidu: '百度',
        douban: '豆瓣',
        enlightent: '云合',
        kylive: '酷云',
        komect: '移动爱家',
        quark: '夸克',
      },
      searchMap: {
        local: '本站',
        group: '组内',
        all: '全部',
      },
      filter: '过滤',
    },
    live: {
      ipMark: '网络标识',
      delay: '延迟',
      thumbnail: '缩略图',
      popup: {
        thumbnail: '请前往 [实验室->扩展程序->环境] 安装ffmpeg和ffprobe 以启用缩略图功能',
      },
    },
    player: {
      title: '播放器',
      barrage: '弹幕',
      command: '命令',
      sniffer: '嗅探',
    },
    security: {
      title: '安全',
      proxy: '网络代理',
      ua: '用户代理',
      dns: '域名解析',
    },
    permission: {
      title: '权限',
      autoLaunch: '开机自启',
      windowPosition: '窗口位置',
      debug: '调试模式',
      hardwareAcceleration: '硬件加速',
    },
    other: {
      title: '其他',
      factoryReset: '恢复出厂',
      checkUpdate: '检查更新',
      disclaimer: '用户协议',
      license: '开源软件声明',
    },
  },
  message: {
    willReboot: '应用即将重启',
    warnReboot: '重启应用后生效',
  },
  sniffer: {
    title: '嗅探',
    typeMap: {
      puppeteer: '自动化',
      thirdParty: '三方接入',
    },
  },
  barrage: {
    title: '弹幕',
    param: {
      base: '基础参数',
      map: '映射参数',
    },
    tip: {
      base: '',
      map: '对应弹幕返回的位置, 下标从0开始',
    },
    field: {
      key: '数据',
      support: '线路',
      type: '滚动',
      text: '弹幕',
      time: '时间',
      color: '颜色',
    },
    popup: {
      url: `需配置参数{'{'}id{'}'}(标识需查询弹幕ID)`,
      nested: '嵌套取值使用点号(.)分隔',
    },
  },
  ua: {
    title: 'User-Agent',
    topTip: '模拟用户代理',
    bottomTip: '推荐chrome, 空使用系统默认',
  },
  proxy: {
    title: '代理',
    typeMap: {
      system: '系统代理',
      custom: '自定义代理',
      direct: '不使用代理',
    },
    field: {
      url: '代理地址',
      bypass: '绕过规则',
    },
    placeholder: {
      url: 'socks5://127.0.0.1:6153',
      bypass: 'localhost,127.0.0.1,::1',
    },
  },
  dns: {
    title: 'DNS-over-HTTP',
    topTip: '使用安全DNS',
    bottomTip: '推荐腾讯, 空使用系统默认',
  },
  factoryReset: {
    title: '恢复出厂',
    content: '你确定要恢复出厂吗? 确认后将擦除所有数据。',
  },
  data: {
    title: '数据管理',
    override: '覆盖',
    additional: '追加',
    config: {
      title: '配置',
      field: {
        url: '接口',
      },
      popup: {
        override: '原有数据将清除，确认配置吗',
        additional: '原有数据上追加，确认配置吗',
        clear: '选中数据将被删除, 确认操作吗',
      },
    },
    easyConfig: {
      title: '快捷配置',
      field: {
        typeMap: {
          catvod: 'Catvod',
          drpy: 'Drpy',
          tvbox: 'Tvbox',
        },
      },
    },
    configImport: {
      title: '数据导入',
      field: {
        typeMap: {
          remote: '远程',
          local: '本地',
        },
      },
    },
    configExport: {
      title: '数据导出',
    },
    clearData: {
      title: '数据清理',
    },
    sync: {
      title: '数据同步',
      field: {
        typeMap: {
          icloud: 'iCloud',
          webdav: 'WebDav',
        },
        url: '地址',
        username: '用户名',
        password: '授权码',
        autoSync: '自动同步',
      },
      action: {
        backup: '备份到云端',
        resume: '从云端恢复',
      },
      popup: {
        backup: '云端数据将被覆盖, 确认操作吗?',
        resume: '本地数据将被覆盖, 确认操作吗?',
      },
    },
  },
  update: {
    title: '检查更新',
    noUpdate: '当前已经是最新版本',
    latestVersion: '最新版本',
    changelog: '更新日志',
    errorlog: '出错日志',
    downloadProcess: '已下载 {0}%',
    message: {
      downloaded: '安装包下载完成',
    },
  },
};
