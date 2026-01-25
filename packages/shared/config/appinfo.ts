import pkg from '@pkg';

// App information
export const APP_NAME: string = pkg.name;
export const APP_NAME_ALIAS: string = 'zy';
export const APP_NAME_PROTOCOL: string = `${APP_NAME_ALIAS}://`;
export const APP_DESC: string = pkg.description;
export const APP_VERSION: string = pkg.version;
export const APP_AUTHOR: string = `${pkg.author.name}<${pkg.author.email}>`;
export const APP_COPYRIGHT: string = `Copyright © ${new Date().getFullYear()} ${pkg.author.name}. All rights reserved.`;

// App urls
export const WEBSITE_URL: string = pkg.homepage;
export const ISSUE_URL: string = `${pkg.homepage}/issues`;
export const DOCUMENT_URL: string = 'https://zy.catni.cn';
export const PLUGIN_STORE_URL: string = 'https://github.com/Hiram-Wong/ZyPlayer/discussions/386';

// App overlay
export const titleBarOverlayDark = {
  height: 42,
  color: 'rgba(255,255,255,0)',
  symbolColor: '#fff',
};

export const titleBarOverlayLight = {
  height: 42,
  color: 'rgba(255,255,255,0)',
  symbolColor: '#000',
};
