export default {
  title: '直播',
  delay: '超時',
  infiniteLoading: {
    noConfig: '請前往 [設置->直播配置] 配置數據',
  },
  field: {
    name: '名稱',
    api: '接口',
    apiMap: {
      remote: '遠程',
      local: '本地',
      manual: '手動',
    },
    epg: '節目',
    logo: '臺標',
  },
  popup: {
    epg: `diyp需配置參數{'{'}name{'}'}(標識需查詢頻道名稱)和{'{'}date{'}'}(標識需查詢頻道日期); xml無需配置參數`,
    logo: `需配置參數{'{'}name{'}'}(標識需查詢臺標名稱)`,
  },
};
