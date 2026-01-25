export enum IPC_CHANNEL {
  // api
  API_SERVER_START = 'api-server:start',
  API_SERVER_STOP = 'api-server:stop',
  API_SERVER_RESTART = 'api-server:restart',
  API_SERVER_STATUS = 'api-server:status',

  // app
  APP_GET_CACHE_SIZE = 'app:get-cache-size',
  APP_CLEAR_CACHE = 'app:clear-cache',

  APP_AUTO_LAUNCH = 'app:auto-launch',
  APP_ZOOM = 'app:zoom',
  APP_DNS = 'app:dns',
  APP_PROXY = 'app:proxy',
  APP_PROXY_SYSTEM = 'app:proxy-system',
  APP_QUIT = 'app:quit',
  APP_REBOOT = 'app:reboot',

  // binary
  BINARY_INSTALL = 'binary:install',

  // business
  BROWSER_NAVIGATE = 'business:browser-navigate',
  CALL_PLAYER = 'business:call-player',

  // change
  CHANGE_THEME = 'change:theme',
  CHANGE_LANG = 'change:lang',

  // event
  THEME_UPDATED = 'theme:updated',
  LANG_UPDATED = 'lang:updated',
  FULLSCREEN_UPDATED = 'fullscreen:updated',
  URI_BLOCKED = 'uri:blocked',

  // file
  FILE_SELECT_FOLDER_DIALOG = 'file:select-folder-dialog',
  FILE_SELECT_FILE_DIALOG = 'file:select-file-dialog',
  FILE_SAVE_FILE_DIALOG = 'file:save-file-dialog',
  FILE_SELECT_FOLDER_READ = 'file:select-folder-read',
  FILE_SELECT_FILE_WRITE = 'file:select-file-write',

  // fs
  FS_EXIST = 'fs:exist',
  FS_DELETE = 'fs:delete',
  FS_FILE_READ = 'fs:file-read',
  FS_FILE_WRITE = 'fs:file-write',
  FS_DIR_READ = 'fs:dir-read',
  FS_DIR_CREATE = 'fs:dir-create',

  INSTALL_UV_BINARY = 'app:install-uv-binary',

  // logger
  APP_LOG_TO_MAIN = 'app:log-to-main',

  // notification
  NOTIFICATION_SEND = 'notification:send',

  // open
  OPEN_PATH = 'open:path',
  OPEN_WEBSITE = 'open:website',

  // path
  PATH_SYSTEM = 'path:system',
  PATH_HOME = 'path:home',
  PATH_USER = 'path:user',
  PATH_JOIN = 'path:join',
  PATH_RESOLVE = 'path:resolve',

  // plugin
  PLUGIN_INSTALL = 'plugin:install',
  PLUGIN_UNINSTALL = 'plugin:uninstall',
  PLUGIN_START = 'plugin:start',
  PLUGIN_STOP = 'plugin:stop',

  // python
  PYTHON_EXECUTE = 'python:execute',

  // shortcut
  SHORTCUTS_IS_REGISTERD = 'shortcuts:is-registered',
  SHORTCUT_REGISTER = 'shortcut:register',
  SHORTCUT_UNREGISTER = 'shortcut:unregister',
  SHORTCUT_CLEAR = 'shortcut:clear',

  // system
  SYSTEM_ARCH = 'system:arch',
  SYSTEM_PLATFORM = 'system:platform',

  // update
  UPDATE_AVAILABLE = 'update:available',
  UPDATE_DOWNLOAD_PROGRESS = 'update:download-progress',
  UPDATE_DOWNLOADED = 'update:update-downloaded',
  UPDATE_ERROR = 'update:error',
  UPDATE_NOT_AVAILABLE = 'update:not-available',
  UPDATE_CHECK = 'update:check',
  UPDATE_INSTALL = 'update:install',
  UPDATE_DOWNLOAD = 'update:download',

  // webview
  WEBVIEW_SPELL_CHECK = 'webview:spell-check',
  WEBVIEW_LINK_BLOCK = 'webview:link-block',
  WEBVIEW_LINK_BLOCK_RELAY = 'webview:link-block-relay',

  // window
  WINDOW_CLOSE = 'window:close',
  WINDOW_MIN = 'window:min',
  WINDOW_MAX = 'window:max',
  WINDOW_PIN = 'window:pin',
  WINDOW_SIZE = 'window:size',
  WINDOW_FULLSCREEN = 'window:fullscreen',
  WINDOW_POSITION = 'window:position',
  WINDOW_DRAG = 'window:drag',
  WINDOW_DESTROY = 'window:destroy',
  WINDOW_DESTROY_RELAY = 'window:destroy-relay',
  WINDOW_HIDE = 'window:hide',
  WINDOW_SHOW = 'window:show',
  WINDOW_STATUS = 'window:status',

  WINDOW_PLAYER = 'window:player',
  WINDOW_MAIN = 'window:main',
  WINDOW_BROWSER = 'window:browser',
}
