export default {
  title: '直播',
  delay: '超时',
  infiniteLoading: {
    noConfig: '请前往 [设置->直播配置] 配置数据',
  },
  field: {
    name: '名称',
    api: '接口',
    apiMap: {
      remote: '远程',
      local: '本地',
      manual: '手动',
    },
    epg: '节目',
    logo: '台标',
  },
  popup: {
    epg: `diyp需配置参数{'{'}name{'}'}(标识需查询频道名称)和{'{'}date{'}'}(标识需查询频道日期); xml无需配置参数`,
    logo: `需配置参数{'{'}name{'}'}(标识需查询台标名称)`,
  },
};
