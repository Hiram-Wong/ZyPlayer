export default {
  title: '設置',
  nav: {
    baseConfig: '基礎配置',
    dataManage: '數據配置',
    filmSource: '影視配置',
    liveSource: '直播配置',
    parseSource: '解析配置',
  },
  base: {
    bossKey: '老板鍵',
    timeout: '超時',
    hot: '熱榜',
    site: {
      title: '站點',
      hotMap: {
        baidu: '百度',
        douban: '豆瓣',
        enlightent: '雲合',
        kylive: '酷雲',
        komect: '移動愛家',
        quark: '誇克',
      },
      searchMap: {
        local: '本站',
        group: '組內',
        all: '全部',
      },
      filter: '過濾',
    },
    live: {
      ipMark: '網絡標識',
      delay: '延遲',
      thumbnail: '縮略圖',
      popup: {
        thumbnail: '請前往 [實驗室->擴展程序->環境] 安裝ffmpeg和ffprobe 以啟用縮略圖功能',
      },
    },
    player: {
      title: '播放器',
      barrage: '彈幕',
      command: '命令',
      sniffer: '嗅探',
    },
    security: {
      title: '安全',
      proxy: '網絡代理',
      ua: '用戶代理',
      dns: '域名解析',
    },
    permission: {
      title: '權限',
      autoLaunch: '開機自啟',
      windowPosition: '窗口位置',
      debug: '調試模式',
      hardwareAcceleration: '硬件加速',
    },
    other: {
      title: '其他',
      factoryReset: '恢復出廠',
      checkUpdate: '檢查更新',
      disclaimer: '用戶協議',
      license: '開源軟件聲明',
    },
  },
  message: {
    willReboot: '應用即將重啟',
    warnReboot: '重啟應用後生效',
  },
  sniffer: {
    title: '嗅探',
    typeMap: {
      puppeteer: '自動化',
      thirdParty: '三方接入',
    },
  },
  barrage: {
    title: '彈幕',
    param: {
      base: '基礎參數',
      map: '映射參數',
    },
    tip: {
      base: '',
      map: '對應彈幕返回的位置, 下標從0開始',
    },
    field: {
      key: '數據',
      support: '線路',
      type: '滾動',
      text: '彈幕',
      time: '時間',
      color: '顏色',
    },
    popup: {
      url: `需配置參數{'{'}id{'}'}(標識需查詢彈幕ID)`,
      nested: '嵌套取值使用點號(.)分隔',
    },
  },
  ua: {
    title: 'User-Agent',
    topTip: '模擬用戶代理',
    bottomTip: '推薦chrome, 空使用系統默認',
  },
  proxy: {
    title: '代理',
    typeMap: {
      system: '系統代理',
      custom: '自定義代理',
      direct: '不使用代理',
    },
    field: {
      url: '代理地址',
      bypass: '繞過規則',
    },
    placeholder: {
      url: 'socks5://127.0.0.1:6153',
      bypass: 'localhost,127.0.0.1,::1',
    },
  },
  dns: {
    title: 'DNS-over-HTTP',
    topTip: '使用安全DNS',
    bottomTip: '推薦騰訊, 空使用系統默認',
  },
  factoryReset: {
    title: '恢復出廠',
    content: '你確定要恢復出廠嗎? 確認後將擦除所有數據。',
  },
  data: {
    title: '數據管理',
    override: '覆蓋',
    additional: '追加',
    config: {
      title: '配置',
      field: {
        url: '接口',
      },
      popup: {
        override: '原有數據將清除，確認配置嗎',
        additional: '原有數據上追加，確認配置嗎',
        clear: '選中數據將被刪除, 確認操作嗎',
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
      title: '數據導入',
      field: {
        typeMap: {
          remote: '遠程',
          local: '本地',
        },
      },
    },
    configExport: {
      title: '數據導出',
    },
    clearData: {
      title: '數據清理',
    },
    sync: {
      title: '數據同步',
      field: {
        typeMap: {
          icloud: 'iCloud',
          webdav: 'WebDav',
        },
        url: '地址',
        username: '用戶名',
        password: '授權碼',
        autoSync: '自動同步',
      },
      action: {
        backup: '備份到雲端',
        resume: '從雲端恢復',
      },
      popup: {
        backup: '雲端數據將被覆蓋, 確認操作嗎?',
        resume: '本地數據將被覆蓋, 確認操作嗎?',
      },
    },
  },
  update: {
    title: '檢查更新',
    noUpdate: '當前已經是最新版本',
    latestVersion: '最新版本',
    changelog: '更新日誌',
    errorlog: '出錯日誌',
    downloadProcess: '已下載 {0}%',
    message: {
      downloaded: '安裝包下載完成',
    },
  },
};
