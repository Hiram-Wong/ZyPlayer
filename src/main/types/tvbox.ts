export interface TvboxLiveOldItem {
  group: string;
  channels: Array<{
    name: string;
    urls: string[];
  }>;
}

export interface TvboxLiveNewItem {
  name: string;
  type: number;
  url: string;
  epg: string;
  logo: string;
  ua: string;
  timeout: number;
  playerType: number;
}

export interface TvboxParseItem {
  name: string;
  type: 1 | 2;
  url: string;
  header?: Record<string, string>;
  ext?: { flag: string[] };
}

export interface TvboxSiteItem {
  name: string;
  key: string;
  type: 0 | 1 | 2 | 3 | 4;
  api: string;
  playUrl: string;
  quickSearch: 0 | 1;
  searchable: 0 | 1;
  filterable: 0 | 1;
  ext: any;
  categories: string[];
}

export interface TvboxIjkItem {
  group: string;
  options: Array<{
    category: number;
    name: string;
    value: string;
  }>;
}

export interface Tvbox {
  lives: TvboxLiveOldItem[] | TvboxLiveNewItem[];
  parses: TvboxParseItem[];
  sites: TvboxSiteItem[];
  flags: string[];
  ads: string[];
  ijk: TvboxIjkItem[];
  homeLogo: string;
  homePage: string;
  spider: string;
  wallpaper: string;
}

export interface CatvodSiteItem {
  key: string;
  name: string;
  type: number;
  api: string;
}

export interface Catvod {
  video: {
    sites: CatvodSiteItem[];
  };
  read: {
    sites: CatvodSiteItem[];
  };
  comic: {
    sites: CatvodSiteItem[];
  };
  music: {
    sites: CatvodSiteItem[];
  };
  pan: {
    sites: CatvodSiteItem[];
  };
  color: Array<{
    light: Record<string, string>;
    dark: Record<string, string>;
  }>;
}
