export default {
  name: '配置',
  placeholder: {
    general: '请输入内容',
    startPage: '请输入起始页路径, 例如/home/',
    paramsPath: '路径',
    paramsPasswd: '密码',
    params: `{\n\t"路径": { "password": "密码" }\n}`,
    manualTip: 'M3u格式示例:\n#EXTM3U\n#EXTINF:-1,Channel\nhttps://channel-url\n\ngenre格式示例\nChannel,https://channel-url',
    groupTip: '请选择分组',
    categoryTip: '请输入内容, 逗号分隔',
    shortcutKeyTip: '点击去设置',
    shortcutKeyEnterTip: '按快捷键组合键',
    shortcutKeyNonCompliance: '当前组合键不合规',
    epgTip: '仅支持dipy',
    logoTip: '源台标失效',
  },
  dialog: {
    cancel: '取消',
    confirm: '确定',
    add: '添加',
    edit: '编辑',
    flag: '标识',
    splitTip: '分隔符请使用半角状态","',
    restoreFactoryHeader: '恢复出厂',
    restoreFactoryBody: '你确定要恢复出厂吗? 确认后恢复到初始状态。'
  },
  nav: {
    configBase: '基础配置',
    siteSource: '影视配置',
    iptvSource: '电视配置',
    analyzeSource: '解析配置',
    driveSource: '网盘配置',
    editSource: '写源工具'
  },
  table: {
    default: '默认',
    edit: '编辑',
    check: '检测',
    delete: '删除',
    deleteTip: '你确定要删除吗',
    site: {
      close: '关闭',
      together: '聚合',
      local: '本地'
    },
    iptv: {
      remote: '远程',
      local: '本地',
      manual: '手动'
    }
  },
  header: {
    add: '添加',
    delete: '删除',
    check: '检测',
    flag: '标识',
    search: '搜索资源'
  },
  site: {
    name: '名称',
    type: '类型',
    api: '接口',
    search: '搜索',
    playUrl: '解析',
    ext: '扩展',
    group: '分组',
    category: '类别'
  },
  iptv: {
    name: '名称',
    config: '配置',
    api: 'api',
    epg: '节目单',
    upload: '点我上传'
  },
  analyze: {
    name: '名称',
    api: '接口'
  },
  drive: {
    name: '名称',
    server: '接口',
    startPage: '起始页',
    params: '加密'
  },
  base: {
    theme: '主题',
    light: '浅色',
    dark: '深色',
    auto: '跟随系统',
    bossKey: '老板键',
    hotRecommend: '热榜',
    kylive: '酷云数据',
    enlightent: '云合数据',
    reset: '重置',
    search: '搜索',
    site: '本站搜索',
    group: '聚合搜索',
    all: '组内搜索',
    viewCasual: '随性看',
    iptv: '电视',
    globalLogo: '全局台标',
    defaultEpg: '默认节目',
    delay: '延迟',
    skipIpv6: '跳过ipv6',
    check: '检查',
    thumbnail: '缩略图',
    player: '播放器',
    barrage: '弹幕',
    veplayer: '火山播放器',
    xgplayer: '西瓜播放器',
    dplayer: '呆呆播放器',
    custom: '自定义(调用系统)',
    command: '系统命令',
    sniffer: '嗅探',
    info: '信息',
    security: '安全',
    proxy: '网络代理',
    ua: '用户代理',
    jurisdiction: '权限',
    selefBoot: '自启动',
    hardwareAcceleration: '硬件加速',
    windowPosition: '窗口位置',
    other: '其他',
    restoreFactory: '恢复出厂',
    dataMange: '数据管理',
    checkUpdate: '检查更新',
    disclaimer: '用户协议'
  },
  message: {
    reboot: '重置成功，应用程序将重新启动',
    hardwareAccelerationOn: '硬件加速打开，重新启动应用程序生效',
    hardwareAccelerationOff: '硬件加速关闭，重新启动应用程序生效',
    windowPositionOn: '打开窗口位置',
    windowPositionOff: '关闭窗口位置',
    networkAddress: '网络地址',
    networkCheckError: '网络状态检测失败'
  },
  ad: {
    title: '与Hipy更配哦',
    desc: '新起点, 新开始',
    open: '查看'
  },
  ua: {
    title: 'User-Agent',
    topTip: '模拟用户代理',
    bottomTip: "推荐chrome, 空使用系统默认"
  },
  barrage: {
    title: '弹幕',
    header: '启用该参数需预处理数据, 将增加起播时间',
    key: '返回字段',
    api: '接口',
    support: '线路',
    start: '时间',
    color: '颜色',
    mode: '模式',
    content: '内容',
    param: '参数映射',
    tip: '每个字段对应弹幕返回的位置, 从0开始'
  },
  data: {
    title: '数据管理',
    config: '配置',
    configTip: '数据保存在数据库中, 为方便迁移可导出为json文件, 导入将覆盖原数据',
    success: '成功',
    fail: '失败',
    easyConfig: {
      title: '一键配置',
      app: '此软件',
      appTip: '请严格遵守本软件接口格式',
      hipy: 'hipy',
      drpy: 'drpy',
      drpyTip: '目前仅支持sites中type:1的数据,请将js模式设置为0',
      tvbox: 'tvbox',
      tvboxTip: '目前仅支持sites中type:0或1且的cms类型的数据',
      address: '地址',
      confirm: '确定',
      confirmTip: '原有数据将清除，确认配置吗',
    },
    configImport: {
      title: '配置导入',
      remote: '远端导入',
      local: '本地导入',
      address: '地址',
      dropTip: '由于兼容性问题, 3.3.2前旧数据导入将丢弃历史和收集数据',
      import: '导入',
      importTip: '原始数据将被清除, 确认导入吗'
    },
    configExport: {
      title: '配置导出',
      site: '影视',
      iptv: '直播',
      channel: '频道',
      analyze: '解析',
      drive: '网盘',
      cache: '缓存',
      history: '历史',
      thumbnail: '缩略图',
      star: '收藏',
      setting: '配置',
      export: '导出',
      exportTip: '选中数据将被导出,确认操作吗'
    },
    clearData: {
      title: '清空数据',
      site: '影视',
      iptv: '直播',
      channel: '频道',
      analyze: '解析',
      drive: '网盘',
      cache: '缓存',
      history: '历史',
      thumbnail: '缩略图',
      star: '收藏',
      clear: '清空',
      clearTip: '选中数据将被删除,确认操作吗'
    },
    syncDisk: '同步盘',
    content1: '因不收集用户的数据, 可以选择同步盘作为配置文件保存服务',
    content2: '内置webdav作为同步盘服务, 推荐坚果云',
    content3: '如果打开自动同步, 每5分钟同步一次',
    webdev: {
      title: '同步盘参数',
      check: '校验',
      save: '保存',
      sync: '自动同步',
      url: '云地址',
      username: '用户名',
      password: '授权码',
    },
    syncToCloud: '同步数据到帐号',
    syncToCloudTip: '云端数据将被覆盖,确认操作吗',
    syncToLocal: '云数据覆盖本地',
    syncToLocalTip: '本地数据将被清除,确认操作吗'
  },
  thumbanilFfmpeg: {
    haveFfmpeg: '检测到ffmpeg模块已安装',
    noFfmpeg: '未检测到ffmpeg模块'
  },
  sniffer: {
    title: '嗅探方案',
    pie: {
      sign: 'PuppeteerInElectron',
      name: '拦截和修改请求',
      mainAbility: '嗅探能力强',
      secondaryAbility: '支持未加载页面'
    },
    iframe: {
      sign: '浏览器原生接口',
      name: '资源占用低',
      mainAbility: '兼容性好',
      secondaryAbility: '仅限已加载页面'
    },
    other: {
      sign: '第三方接口',
      name: '不受本机性能影响',
      mainAbility: '更专业更好',
      secondaryAbility: ''
    }
  },
  update: {
    title: '检查更新',
    noUpdate: '你当前使用的是最新版本',
    checkWait: '请等待，检查更新中...',
    foundNewVersion: '发现新版本',
    systemTip: 'Tips: 仅windwos支持在线更新; mac需签名(没钱); linux不支持。',
    macAndLinuxTip: 'mac和linux用户请前往',
    install: '安装',
    download: '下载',
    downloading: '下载中',
    downloaded: '安装包下载完成'
  },
  editSource: {
    import: '导入',
    export: '导出',
    bug: '调试',
    delete: '删除用例',
    cache: '拉取缓存',
    title: '写源工具 [道长联名]',
    bar: {
      title: '编辑器参数',
      theme: '主题',
      language: '语言',
      eol: '行尾符',
      wordWrap: '自动换行',
      disable: '禁用',
      enable: '启用'
    },
    action: {
      init: '初始化',
      source: '源代码',
      classify: '分类',
      home: '首页',
      first: '一级',
      detail: '详情',
      search: '搜索',
      play: '播放'
    },
    select: {
      log: '日志',
      debug: '调试',
      source: '源代码'
    },
    message: {
      openDevTools: '目前只能通过开发者工具->控制台查看日志'
    }
  }
}