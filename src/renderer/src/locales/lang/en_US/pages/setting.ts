export default {
  name: 'Setting',
  placeholder: {
    general: 'Please enter the content',
    startPage: 'Please enter the start page path, such as /home/',
    paramsPath: 'path',
    paramsPasswd: 'password',
    params: '{\n\t"path": { "password": "password" }\n}',
    manualTip: 'Example of M3U:\n#EXTM3U\n#EXTINF:-1,Channel\nhttps://channel-url\n\nExample of genre\nChannel,https://channel-url',
    groupTip: 'Please select a group',
    categoryTip: 'Please enter the content, separated by commas',
    shortcutKeyTip: 'Click this to set',
    shortcutKeyEnterTip: 'Press shortcut key combination',
    shortcutKeyNonCompliance: 'Shortcut key combination is not compliant',
    epgTip: 'Only support dipy',
    logoTip: 'Source logo is invalid',
  },
  dialog: {
    cancel: 'Cancel',
    confirm: 'OK',
    add: 'Add',
    edit: 'Edit',
    flag: 'Flag',
    splitTip: 'Please use half-width state for separator ","',
    restoreFactoryHeader: 'Eestore Factory',
    restoreFactoryBody: 'Are you sure to restore the factory? Return to the initial state after leaving the factory.'
  },
  nav: {
    configBase: 'BaseSetting',
    siteSource: 'SiteSetting',
    iptvSource: 'IptvSetting',
    analyzeSource: 'AnalyzeSetting',
    driveSource: 'DriveSetting',
  },
  table: {
    default: 'Default',
    edit: 'Edit',
    check: 'Check',
    delete: 'Delete',
    deleteTip: 'Are you sure to delete it',
    site: {
      close: 'close',
      together: 'together',
      local: 'lcoal'
    },
    iptv: {
      remote: 'Remote',
      local: 'Local',
      manual: 'Manual'
    }
  },
  header: {
    add: 'Add',
    delete: 'Delete',
    check: 'Check',
    flag: 'Flag',
    search: 'Search Resource'
  },
  site: {
    name: 'name',
    type: 'type',
    api: 'api',
    search: 'search',
    playUrl: 'playUrl',
    ext: 'ext',
    group: 'group',
    category: 'category'
  },
  iptv: {
    name: 'name',
    config: 'type',
    api: 'api',
    epg: 'epg',
    upload: 'Upload'
  },
  analyze: {
    name: 'name',
    api: 'api'
  },
  drive: {
    name: 'name',
    server: 'api',
    startPage: 'start',
    params: 'params'
  },
  base: {
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    bossKey: 'BossKey',
    hotRecommend: 'HotList',
    kylive: 'KyLive',
    enlightent: 'Enlightent',
    reset: 'Reset',
    search: 'Search',
    site: 'Site',
    group: 'Group',
    all: 'All',
    viewCasual: 'ViewCasual',
    iptv: 'IPTV',
    globalLogo: 'GlobalLogo',
    defaultEpg: 'DefaultEpg',
    delay: 'Delay',
    skipIpv6: 'SkipIpv6',
    check: 'Check',
    thumbnail: 'Thumbnail',
    player: 'player',
    xgplayer: 'xgplayer',
    dplayer: 'dplayer',
    custom: 'custom(call system)',
    command: 'Command',
    sniffer: 'Sniffer',
    info: 'Info',
    security: 'Security',
    proxy: 'Proxy',
    ua: 'UA',
    jurisdiction: 'Jurisdiction',
    selefBoot: 'SelefBoot',
    hardwareAcceleration: 'HardwareAcceleration',
    windowPosition: 'WindowPosition',
    other: 'Other',
    restoreFactory: 'RestoreFactory',
    dataMange: 'DataMange',
    checkUpdate: 'CheckUpdate',
    disclaimer: 'Disclaimer'
  },
  message: {
    reboot: 'Reset successfully, application will be restarted',
    hardwareAccelerationOn: 'HardwareAcceleration turn on, restarting application takes effect',
    hardwareAccelerationOff: 'HardwareAcceleration turn off, restarting application takes effect',
    windowPositionOn: 'WindowPosition turn on',
    windowPositionOff: 'WindowPosition turn off',
    networkAddress: 'Network address',
    networkCheckError: 'Network status detection failed'
  },
  ad: {
    title: 'Better on Hipy',
    desc: 'New Start, New Begin',
    open: 'open'
  },
  ua: {
    title: 'User-Agent',
    topTip: 'Emulate User Agent',
    bottomTip: "recommend chrome, empty use system default"
  },
  data: {
    title: 'DataMange',
    config: 'Config',
    configTip: 'The data is stored in the database and exported as a JSON file for ease of migration. The import overwrites the original data',
    success: 'Success',
    fail: 'Fail',
    easyConfig: {
      title: 'EasyConfig',
      app: 'this app',
      appTip: 'Please strictly follow the format of this software interface',
      hipy: 'hipy',
      drpy: 'drpy',
      drpyTip: 'Currently only type: 1 data is supported in sites, please set the JS mode to 0',
      tvbox: 'tvbox',
      tvboxTip: 'Currently only cms-type data of type: 0 or 1 is supported in sites',
      address: 'url',
      confirm: 'Confirm',
      confirmTip: 'Original data will be cleared',
    },
    configImport: {
      title: 'ConfigImport',
      remote: 'Remote',
      local: 'Local',
      address: 'url',
      dropTip: 'Due to compatibility problems, the old data import will discard historical and collection data',
      import: 'Import',
      importTip: 'Original data will be cleared'
    },
    configExport: {
      title: 'ConfigExport',
      site: 'site',
      iptv: 'iptv',
      channel: 'channel',
      analyze: 'analyze',
      drive: 'drive',
      cache: 'cache',
      history: 'history',
      thumbnail: 'thumbnail',
      star: 'star',
      setting: 'setting',
      export: 'Export',
      exportTip: 'Selected data will be export'
    },
    clearData: {
      title: 'ClearData',
      site: 'site',
      iptv: 'iptv',
      channel: 'channel',
      analyze: 'analyze',
      drive: 'drive',
      cache: 'cache',
      history: 'history',
      thumbnail: 'thumbnail',
      star: 'star',
      clear: 'Clear',
      clearTip: 'Selected data will be deleted'
    },
    syncDisk: 'SyncDisk',
    content1: "Because not collected data, you can choose sync service save data",
    content2: 'Built-in webdav as sync service, recommend jianguo cloud',
    content3: 'If switch AutoSync on, Sync every 5 minutes',
    webdev: {
      title: 'Param',
      check: 'Check',
      save: 'Save',
      sync: 'AutoSync',
      url: 'URL',
      username: 'UserName',
      password: 'PassWord',
    },
    syncToCloud: 'SyncToCloud',
    syncToCloudTip: 'Cloud data will be overwritten',
    syncToLocal: 'SyncToLocal',
    syncToLocalTip: 'Local data will be cleared'
  },
  thumbanilFfmpeg: {
    haveFfmpeg: 'FFmpeg module installed detected',
    noFfmpeg: 'No FFmpeg module was detected'
  },
  sniffer: {
    title: 'Sniffing Scheme',
    pie: {
      sign: 'PuppeteerInElectron',
      name: 'Intercept&Modify req',
      mainAbility: 'Sniff ability',
      secondaryAbility: 'Support unload page'
    },
    iframe: {
      sign: 'Browser native interface',
      name: 'Low resource',
      mainAbility: 'Compliant',
      secondaryAbility: 'Loaded page only'
    },
    other: {
      sign: 'Third-party interface',
      name: 'Good performance',
      mainAbility: 'Expert',
      secondaryAbility: ''
    }
  },
  update: {
    title: 'Check updates',
    noUpdate: 'You are currently using the latest version',
    checkWait: 'Please wait, checking for updates...',
    foundNewVersion: 'Discover the new version',
    systemTip: 'Tips: Only windwos supports online updates',
    macAndLinuxTip: 'Mac and Linux users please go',
    install: 'install',
    download: 'download',
    downloading: 'downloading',
    downloaded: 'The download of the installation package is complete'
  }
}