export default {
  title: 'Setting',
  nav: {
    baseConfig: 'Base Config',
    dataManage: 'Data Manage',
    filmSource: 'Film Config',
    liveSource: 'Live Config',
    parseSource: 'Parse Config',
  },
  base: {
    bossKey: 'BossKey',
    timeout: 'Timeout',
    hot: 'Hot',
    site: {
      title: 'Site',
      hotMap: {
        baidu: 'Baidu',
        douban: 'Douban',
        enlightent: 'Enlightent',
        kylive: 'Kylive',
        komect: 'Komect',
        quark: 'Quark',
      },
      searchMap: {
        local: 'Local',
        group: 'Group',
        all: 'All',
      },
      filter: 'Filter',
    },
    live: {
      ipMark: 'IP Mark',
      delay: 'Delay',
      thumbnail: 'Thumbnail',
      popup: {
        thumbnail:
          'Please go to [Lab->Extension Manager->Environment] to install ffmpeg and ffprobe to enable the thumbnail function',
      },
    },
    player: {
      title: 'Player',
      barrage: 'Barrage',
      command: 'Command',
      sniffer: 'Sniffer',
    },
    security: {
      title: 'Security',
      proxy: 'Network Proxy',
      ua: 'User Agent',
      dns: 'DNS',
    },
    permission: {
      title: 'Permission',
      autoLaunch: 'Auto Launch',
      windowPosition: 'Window Position',
      debug: 'Debug Mode',
      hardwareAcceleration: 'Hardware Acceleration',
    },
    other: {
      title: 'Other',
      factoryReset: 'Factory Reset',
      checkUpdate: 'Check Update',
      disclaimer: 'Privacy Policy',
      license: 'License',
    },
  },
  message: {
    willReboot: 'Application is about to restart',
    warnReboot: 'Restart the application to take effect',
  },
  sniffer: {
    title: 'Sniffer',
    typeMap: {
      puppeteer: 'Automate',
      thirdParty: 'Third Party',
    },
  },
  barrage: {
    title: 'Barrage',
    param: {
      base: 'Basic Parameter',
      map: 'Map Parameter',
    },
    tip: {
      base: '',
      map: 'The position corresponding to the barrage return, starting from index 0.',
    },
    field: {
      key: 'Data',
      support: 'Line',
      type: 'Scroll',
      text: 'Barrage',
      time: 'Time',
      color: 'Color',
    },
    popup: {
      url: `Configuration parameter {'{'}id{'}'} is required (the id needs to be queried for the name of the barrage id).`,
      nested: 'Nested values are accessed using dot notation (.)',
    },
  },
  ua: {
    title: 'User-Agent',
    topTip: 'Emulate User Agent',
    bottomTip: 'Recommend Chrome, empty use system default',
  },
  proxy: {
    title: 'Proxy',
    typeMap: {
      system: 'System Proxy',
      custom: 'Custom Proxy',
      direct: 'Direct Proxy',
    },
    field: {
      url: 'Proxy',
      bypass: 'Bypass',
    },
    placeholder: {
      url: 'socks5://127.0.0.1:6153',
      bypass: 'localhost,127.0.0.1,::1',
    },
  },
  dns: {
    title: 'DNS-over-HTTP',
    topTip: 'Using Secure DNS',
    bottomTip: 'Recommend Tencent, empty use system default',
  },
  factoryReset: {
    title: 'Factory Reset',
    content: 'Are you sure you want to restore the factory? Confirmation will erase all data.',
  },
  data: {
    title: 'Data Mange',
    override: 'Override',
    additional: 'Additional',
    config: {
      title: 'Config',
      field: {
        url: 'Url',
      },
      popup: {
        override: 'Original data will be erased.',
        additional: 'Additions to original data.',
        clear: 'The selected type will be erased data.',
      },
    },
    easyConfig: {
      title: 'Quick Config',
      field: {
        typeMap: {
          catvod: 'Catvod',
          drpy: 'Drpy',
          tvbox: 'Tvbox',
        },
      },
    },
    configImport: {
      title: 'Data Import',
      field: {
        typeMap: {
          remote: 'Remote',
          local: 'Local',
        },
      },
    },
    configExport: {
      title: 'Data Export',
    },
    clearData: {
      title: 'Data Clear',
    },
    sync: {
      title: 'Data Sync',
      field: {
        typeMap: {
          icloud: 'iCloud',
          webdav: 'WebDav',
        },
        url: 'Url',
        username: 'Username',
        password: 'Password',
        autoSync: 'Auto Sync',
      },
      action: {
        backup: 'Back up to cloud',
        resume: 'Resume from cloud',
      },
      popup: {
        backup: 'Cloud data will be overwritten, Confirm operation?',
        resume: 'Local data will be overwritten, Confirm operation?',
      },
    },
  },
  update: {
    title: 'Check Update',
    noUpdate: 'You are currently using the latest version',
    latestVersion: 'Latest Version',
    changelog: 'ChangeLog',
    errorlog: 'ErrorLog',
    downloadProcess: 'Downloaded {0}%',
    message: {
      downloaded: 'The download of the installation package is complete',
    },
  },
};
