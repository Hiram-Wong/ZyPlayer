import analyze from './analyze';
import channel from './channel';
import history from './history';
import iptv from './iptv';
import plugin from './plugin';
import setting from './setting';
import site from './site';
import star from './star';

interface ICrudService {
  analyze: typeof analyze;
  channel: typeof channel;
  history: typeof history;
  iptv: typeof iptv;
  plugin: typeof plugin;
  setting: typeof setting;
  site: typeof site;
  star: typeof star;
}

const crudService: ICrudService = { analyze, channel, history, iptv, plugin, setting, site, star };

export default crudService;
