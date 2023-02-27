const getSite = (key) => {
  for (const i of sites) {
    if (key === i.key) {
      return i
    }
  }
}

import sites from './init/Sites.json';
import iptv from './init/Iptv.json';
import setting from './init/Setting.json';
import channelList from './init/channelList.json';
import analyze from './init/Analyze.json';
import history from './init/History.json';

export {
  sites,
  iptv,
  setting,
  channelList,
  analyze,
  history,
  getSite
}
