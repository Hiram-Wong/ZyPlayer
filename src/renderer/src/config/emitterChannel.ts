export enum emitterChannel {
  // config
  REFRESH_HISTORY_CONFIG = 'refresh:history-config',
  REFRESH_LIVE_CONFIG = 'refresh:live-config',
  REFRESH_MOMENT_CONFIG = 'refresh:moment-config',
  REFRESH_PARSE_CONFIG = 'refresh:parse-config',
  REFRESH_SETTING_CONFIG = 'refresh:setting-config',
  REFRESH_FILM_CONFIG = 'refresh:film-config',
  REFRESH_STAR_CONFIG = 'refresh:star-config',
  REFRESH_PLUGIN_CONFIG = 'refresh:plugin-config',
  REFRESH_AIGC_CONFIG = 'refresh:aigc-config',
  REFRESH_SEARCH_CONFIG = 'refresh:search-config',

  // search
  SEARCH_RECOMMEND = 'search:recommend',
  SEARCH_LIVE_RECOMMEND = 'search:live-recommend',
  SEARCH_PARSE_RECOMMEND = 'search:parse-recommend',
  SEARCH_FILM_RECOMMEND = 'search:film-recommend',

  // component
  COMP_MULTI_PLAYER_PLAYNEXT = 'component:multi-player:playnext',
}

export enum emitterSource {
  SETTING_TABLE = 'setting:table',
  SETTING_DATA = 'setting:data',
  SETTING_BASE = 'setting:base',
  PAGE_SHOW = 'page:show',
  PAGE_DEBUG = 'page:debug',
  LAYOUT_HEADER_ROUTER = 'layout:header-router',
  LAYOUT_HEADER_SEARCH = 'layout:header-search',
  LAYOUT_HEADER_QUICK = 'layout:header-quick',
}
