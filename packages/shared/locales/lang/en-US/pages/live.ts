export default {
  title: 'Live',
  delay: 'Delay',
  infiniteLoading: {
    noConfig: 'Please go to [Setting->Live Config] to configure the data',
  },
  field: {
    name: 'Name',
    api: 'Api',
    apiMap: {
      remote: 'Remote',
      local: 'Local',
      manual: 'Manual',
    },
    epg: 'Epg',
    logo: 'Logo',
  },
  popup: {
    epg: `diyp need to configure parameters {'{'}name{'}'}(identify the channel name to be queried) and {'{'}date{'}'}(identify the date of the channel to be queried); xml don't need to configure parameters.`,
    logo: `Configuration parameter {'{'}name{'}'} is required (the logo needs to be queried for the name of the platform).`,
  },
};
